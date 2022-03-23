import { RBTree } from 'bintrees';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useMarket } from './markets';

const WS_URL = 'ws://161.97.120.59:8000/v1/ws';

class SerumVialClient {
  private _ws: WebSocket | undefined = undefined;
  private _disposed = false;

  public streamData(
    channels: string[],
    markets: string[],
    onmessage: (message: any) => void,
  ) {
    this._ws = new WebSocket(WS_URL);

    this._ws.onmessage = (msg) => {
      onmessage(JSON.parse(msg.data));
    };

    this._ws.onclose = (ev) => {
      if (this._disposed) {
        return;
      }

      console.log(
        `Connection to ${WS_URL} closed, code: ${ev.code}. Restarting....`,
      );

      this.streamData(channels, markets, onmessage);
    };

    const subPayloads = channels.map((channel) => {
      return JSON.stringify({
        op: 'subscribe',
        channel,
        markets,
      });
    });

    if (this._ws.readyState !== WebSocket.OPEN) {
      this._ws.onopen = () => {
        for (const subRequest of subPayloads) {
          this._ws!.send(subRequest);
        }
      };
    } else {
      for (const subRequest of subPayloads) {
        this._ws.send(subRequest);
      }
    }

    return () => {
      this._disposed = true;
      this._ws && this._ws.close();
    };
  }
}

const SerumVialContext: React.Context<null | SerumVialContextValues> = React.createContext<null | SerumVialContextValues>(
  null,
);

export function SerumVialProvider({ children }) {
  const serumVialClient = useMemo(() => new SerumVialClient(), []);

  const { name } = useMarket();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookState>({
    asks: [],
    bids: [],
  });

  useEffect(() => {
    if (!name) {
      return;
    }

    const orderBook = new OrderBook();

    const dispose = serumVialClient.streamData(
      ['trades', 'level2'],
      [name],
      (
        message:
          | SerumVialRecentTradesMessage
          | SerumVialTradeMessage
          | SerumVialL2Message,
      ) => {
        if (message.type === 'recent_trades') {
          message.trades.reverse();

          setTrades(message.trades.map(mapToTrade));
        }

        if (message.type === 'trade') {
          const trade = mapToTrade(message);
          setTrades((currentTrades) => [trade, ...currentTrades]);
        }

        if (message.type === 'l2snapshot' || message.type === 'l2update') {
          orderBook.update(message);

          setOrderBook({
            asks: [...orderBook.asks()],
            bids: [...orderBook.bids()],
          });
        }
      },
    );

    return () => {
      setTrades([]);
      setOrderBook({ asks: [], bids: [] });
      dispose();
    };
    // eslint-disable-next-line
  }, [name]);

  return (
    <SerumVialContext.Provider value={{ trades, orderBook }}>
      {children}
    </SerumVialContext.Provider>
  );
}

export function useSerumVialMarketData() {
  const context = useContext(SerumVialContext);
  if (!context) {
    throw new Error('Missing sereum-vial context');
  }

  return context;
}

class OrderBook {
  private readonly _bids = new RBTree<PriceLevel>(
    (nodeA, nodeB) => nodeB[0] - nodeA[0],
  );
  private readonly _asks = new RBTree<PriceLevel>(
    (nodeA, nodeB) => nodeA[0] - nodeB[0],
  );

  private _receivedInitialSnapshot = false;

  public update(l2Message: SerumVialL2Message) {
    // clear everything up, when snapshot received so we don't have stale levels by accident
    if (l2Message.type === 'l2snapshot') {
      this._bids.clear();
      this._asks.clear();
      this._receivedInitialSnapshot = true;
    }
    // process updates as long as we've received initial snapshot, otherwise ignore such messages
    if (this._receivedInitialSnapshot) {
      applyPriceLevelChanges(this._asks, l2Message.asks);
      applyPriceLevelChanges(this._bids, l2Message.bids);
    }
  }

  public bestBid() {
    const result = this.bids().next();

    if (result.done === false) {
      return result.value;
    }
    return undefined;
  }

  public bestAsk() {
    const result = this.asks().next();

    if (result.done === false) {
      return result.value;
    }
    return undefined;
  }

  public *bids(): IterableIterator<PriceLevel> {
    const iterator = this._bids.iterator();
    let level = iterator.next();

    while (level !== null) {
      yield level;
      level = iterator.next();
    }
  }

  public *asks(): IterableIterator<PriceLevel> {
    const iterator = this._asks.iterator();
    let level = iterator.next();

    while (level !== null) {
      yield level;
      level = iterator.next();
    }
  }
}

function applyPriceLevelChanges(
  tree: RBTree<PriceLevel>,
  levelUpdates: [string, string][],
) {
  for (const levelRaw of levelUpdates) {
    const priceLevel: PriceLevel = [Number(levelRaw[0]), Number(levelRaw[1])];

    const node = tree.find(priceLevel) as PriceLevel;
    const nodeExists = node !== null;
    const levelShouldBeRemoved = priceLevel[1] === 0;

    if (nodeExists && levelShouldBeRemoved) {
      tree.remove(priceLevel);
    } else if (nodeExists) {
      node[1] = priceLevel[1];
    } else if (levelShouldBeRemoved === false) {
      tree.insert(priceLevel);
    }
  }
}

function mapToTrade({
  price,
  size,
  side,
  id,
  timestamp,
}: SerumVialTradeMessage) {
  const trade: Trade = {
    price: Number(price),
    size: Number(size),
    side,
    id,
    timestamp,
  };

  return trade;
}

type Trade = {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  id: string;
  timestamp: string;
};

type PriceLevel = [number, number];

type OrderBookState = {
  asks: PriceLevel[];
  bids: PriceLevel[];
};

type SerumVialRecentTradesMessage = {
  readonly type: 'recent_trades';
  readonly market: string;
  readonly trades: SerumVialTradeMessage[];
  readonly timestamp: string;
};

type SerumVialTradeMessage = {
  readonly type: 'trade';
  readonly price: string;
  readonly size: string;
  readonly side: 'buy' | 'sell';
  readonly id: string;
  readonly market: string;
  readonly version: number;
  readonly slot: number;
  readonly timestamp: string;
};

type SerumVialL2Message = {
  readonly type: 'l2snapshot' | 'l2update';
  readonly asks: [string, string][];
  readonly bids: [string, string][];
  readonly market: string;
  readonly version: number;
  readonly slot: number;
  readonly timestamp: string;
};

export interface SerumVialContextValues {
  trades: Trade[];
  orderBook: OrderBookState;
}