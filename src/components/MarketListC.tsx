import { Button, Col, Popover, Row, Select } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useMarket, useBonfidaTrades, getMarketInfos, useMarketsList, useUnmigratedDeprecatedMarkets } from '../utils/markets';
import { getDecimalCount } from '../utils/utils';
import FloatingElement from './layout/FloatingElement';
import { BonfidaTrade } from '../utils/types';
import { nanoid } from 'nanoid';
import { DeleteOutlined, InfoCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { notify } from '../utils/notifications';
import LinkAddress from './LinkAddress';
import CustomMarketDialog from './CustomMarketDialog';
import { COLORS } from './colors';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;

export default function WrapperMarket() {

  const {
    market,
    marketName,
    customMarkets,
    setCustomMarkets,
    setMarketAddress,
  } = useMarket();
  const markets = useMarketsList();
  const [handleDeprecated, setHandleDeprecated] = useState(false);
  const [addMarketVisible, setAddMarketVisible] = useState(false);
  const deprecatedMarkets = useUnmigratedDeprecatedMarkets();
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    document.title = marketName ? `${marketName} — Safeswap` : 'Safeswap';
  }, [marketName]);

  const changeOrderRef =
    useRef<({ size, price }: { size?: number; price?: number }) => void>();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const width = dimensions?.width;

  //console.log("width from useeffect : ", width)
  const componentProps = {
    onChangeOrderRef: (ref) => (changeOrderRef.current = ref),
    onPrice: useCallback(
      (price) => changeOrderRef.current && changeOrderRef.current({ price }),
      [],
    ),
    onSize: useCallback(
      (size) => changeOrderRef.current && changeOrderRef.current({ size }),
      [],
    ),
  };

  const onAddCustomMarket = (customMarket) => {
    const marketInfo = getMarketInfos(customMarkets).some(
      (m) => m.address.toBase58() === customMarket.address,
    );
    if (marketInfo) {
      notify({
        message: `A market with the given ID already exists`,
        type: 'error',
      });
      return;
    }
    const newCustomMarkets = [...customMarkets, customMarket];
    setCustomMarkets(newCustomMarkets);
    setMarketAddress(customMarket.address);
  };

  const onDeleteCustomMarket = (address) => {
    const newCustomMarkets = customMarkets.filter((m) => m.address !== address);
    setCustomMarkets(newCustomMarkets);
  };

  return (
    <>
      <FloatingElement style={{ flex: 1 }}>
        <div style={{ backgroundColor: COLORS.secondary, borderTopLeftRadius: '6px', borderTopRightRadius: '6px', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title style={{
              paddingLeft: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: '0.8'
            }}>Markets</Title>
            <div style={{ display: 'flex' }}>
              {market ? (
                <Col>
                  <Popover
                    content={<LinkAddress address={market.publicKey.toBase58()} />}
                    placement="bottomRight"
                    title="Market address"
                    trigger="click"
                  >
                    <InfoCircleOutlined style={{ color: '#2abdd2' }} />
                  </Popover>
                </Col>
              ) : null}
              <Col>
                <PlusOutlined
                  style={{ color: '#2abdd2' }}
                  onClick={() => setAddMarketVisible(true)}
                />
              </Col>
            </div>
          </div>

        </div>
        <CustomMarketDialog
          visible={addMarketVisible}
          onClose={() => setAddMarketVisible(false)}
          onAddCustomMarket={onAddCustomMarket}
        />
        <Row
          align="stretch"
          style={{ paddingLeft: 5, paddingRight: 5, justifyContent: 'space-between' }}
          gutter={16}
        >

        </Row>
        <MarketListCustom
          cheight={dimensions.height}
          markets={markets}
          setHandleDeprecated={setHandleDeprecated}
          placeholder={'Select market'}
          customMarkets={customMarkets}
          onDeleteCustomMarket={onDeleteCustomMarket}
        />
      </FloatingElement>
    </>
  );
}



function MarketListCustom({
  markets,
  placeholder,
  setHandleDeprecated,
  customMarkets,
  onDeleteCustomMarket,
  cheight
}) {
  const { market, setMarketAddress } = useMarket();

  //console.log('cheight : ', cheight)
  const onSetMarketAddress = (marketAddress) => {
    setHandleDeprecated(false);
    setMarketAddress(marketAddress);
  };


  const MarketHeightDyn = styled.div`
  overflow-y: scroll;
  height: ${cheight - 135}px;
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
    &::-webkit-scrollbar {
      width: 0px;
      border: 0px solid black;
`;

  function onsetGhetto(marketAddress) {
    setMarketAddress(marketAddress);
  }

  const getSymbols = (pair) => {
    const base = pair.split('/')[0];
    const quote = pair.split('/')[1];
    const arrpair = [base, quote]

    return arrpair;
  }

  const extractBase = (a) => a.split('/')[0];
  const extractQuote = (a) => a.split('/')[1];

  function randomPriceChange() {
    var Price = Math.floor(Math.random() * 30)
    //console.log('PlusorMinus', Price)
    return (
      <>
        <div>{Price}</div>
      </>
    )
  }

  function randomPercentChange() {
    var plusOrMinus = Math.ceil(Math.random() * 2) * (Math.round(Math.random()) ? 8 : -9)
    //console.log('PlusorMinus', plusOrMinus)
    return (
      <>
        <div style={plusOrMinus > 0 ? { color: 'green' } : { color: 'red' }}>{plusOrMinus} %</div>
      </>
    )
  }

  //console.log("extractBase(a): ", extractBase)
  const selectedMarket = getMarketInfos(customMarkets)
    .find(
      (proposedMarket) =>
        market?.address && proposedMarket.address.equals(market.address),
    )
    ?.address?.toBase58();
  return (
    <>
      <>
        <MarketHeightDyn>
          {markets
            .sort((a, b) =>
              extractQuote(a.name) === 'USDT' && extractQuote(b.name) !== 'USDT'
                ? -1
                : extractQuote(a.name) !== 'USDT' &&
                  extractQuote(b.name) === 'USDT'
                  ? 1
                  : 0,
            )
            .sort((a, b) =>
              extractBase(a.name) < extractBase(b.name)
                ? -1
                : extractBase(a.name) > extractBase(b.name)
                  ? 1
                  : 0,
            )
            .map(({ address, name, deprecated }, i) => (
              <Button
                block
                type="link"
                size="large"
                value={address.toBase58()}
                key={nanoid()}
                onClick={() => setMarketAddress(address.toBase58())}
                name={name}
                style={{
                  textAlign: "left",
                  height: "auto",
                  color: "white"
                  //padding: '10px',
                  // @ts-ignore
                  // backgroundColor: i % 2 === 0 ? 'rgb(39, 44, 61)' : null,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ marginTop: "auto", marginBottom: "auto" }}>
                      <Jazzicon diameter={25} seed={jsNumberForAddress(address.toBase58())} />
                    </div>
                    <div style={{ marginLeft: "18px" }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getSymbols(name)[0]}
                        <div style={{
                          fontSize: 'small',
                          marginLeft: '8px',
                          marginTop: '4px',
                          marginBottom: '4px',
                          backgroundColor: COLORS.main,
                          paddingLeft: '4px',
                          paddingRight: '4px'
                        }}>
                          {getSymbols(name)[1]}</div> {deprecated ? ' (Deprecated)' : null}
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div style={{ color: 'grey', marginRight: '8px' }}>Vol:</div> 13
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginLeft: "8px", textAlign: "right", fontFamily: 'monospace', fontSize: 'small', display: 'flex',
                    flexFlow: 'column',
                    placeContent: 'space-around',
                  }}>
                    <div>
                      {randomPriceChange()}
                    </div>
                    <div>
                      {randomPercentChange()}
                    </div>
                  </div>
                </div>
              </Button>
            ))}

        </MarketHeightDyn>
      </>
    </>
  );
}