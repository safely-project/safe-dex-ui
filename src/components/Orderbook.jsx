import { Col, Row } from 'antd';
import React, { useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useMarket, useMarkPrice } from '../utils/markets';
import { isEqual, getDecimalCount } from '../utils/utils';
import FloatingElement from './layout/FloatingElement';
import usePrevious from '../utils/usePrevious';
import { useSerumVialMarketData } from '../utils/serum-vial';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { COLORS } from './colors';

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;

const SizeTitle = styled(Row)`
  padding: 20px 0 14px;
  color: #434a59;
`;

const MarkPriceTitle = styled(Row)`
  padding: 20px 0 14px;
  font-weight: 700;
`;

const Line = styled.div`
  text-align: right;
  float: right;
  height: 100%;
  ${(props) =>
    props['data-width'] &&
    css`
      width: ${props['data-width']};
    `}
  ${(props) =>
    props['data-bgcolor'] &&
    css`
      background-color: ${props['data-bgcolor']};
    `}
`;

const Price = styled.div`
  position: absolute;
  right: 15px;
  color: white;
`;

function getCumulativeOrderbookSide(orders, totalSize, backwards = false) {
  let cumulative = orders.reduce((cumulative, [price, size], i) => {
    const cumulativeSize = (cumulative[i - 1]?.cumulativeSize || 0) + size;
    cumulative.push({
      price,
      size,
      cumulativeSize,
      sizePercent: Math.round((cumulativeSize / (totalSize || 1)) * 100),
    });
    return cumulative;
  }, []);
  if (backwards) {
    cumulative = cumulative.reverse();
  }
  return cumulative;
}

export default function Orderbook({
  smallScreen,
  depth = 12,
  onPrice,
  onSize,
}) {
  const markPrice = useMarkPrice();
  const { baseCurrency, quoteCurrency } = useMarket();

  const { orderBook } = useSerumVialMarketData();
  let sum = (total, [, size], index) => (index < depth ? total + size : total);

  let totalSize = orderBook.bids.reduce(sum, 0) + orderBook.asks.reduce(sum, 0);

  let bidsToDisplay = getCumulativeOrderbookSide(
    orderBook.bids.slice(0, depth),
    totalSize,
    false,
  );
  let asksToDisplay = getCumulativeOrderbookSide(
    orderBook.asks.slice(0, depth),
    totalSize,
    true,
  );

  return (
    <FloatingElement
      style={smallScreen ? { flex: 1 } : { height: '60%', overflow: 'hidden' }}
    >
      <div className="ara-box-header">
        <Title
          style={{
            paddingLeft: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: '0.8',
          }}
        >
          Orderbook
        </Title>
      </div>
      <SizeTitle>
        <Col span={12} style={{ textAlign: 'left' }}>
          Size ({baseCurrency})
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          Price ({quoteCurrency})
        </Col>
      </SizeTitle>
      {asksToDisplay.map(({ price, size, sizePercent }) => (
        <OrderbookRow
          key={price + ''}
          price={price}
          size={size}
          side={'sell'}
          sizePercent={sizePercent}
          onPriceClick={() => onPrice(price)}
          onSizeClick={() => onSize(size)}
        />
      ))}
      <MarkPriceComponent markPrice={markPrice} />
      {bidsToDisplay.map(({ price, size, sizePercent }) => (
        <OrderbookRow
          key={price + ''}
          price={price}
          size={size}
          side={'buy'}
          sizePercent={sizePercent}
          onPriceClick={() => onPrice(price)}
          onSizeClick={() => onSize(size)}
        />
      ))}
    </FloatingElement>
  );
}

const OrderbookRow = React.memo(
  ({ side, price, size, sizePercent, onSizeClick, onPriceClick }) => {
    const element = useRef();

    const { market } = useMarket();

    useEffect(() => {
      // eslint-disable-next-line
      !element.current?.classList.contains('flash') &&
        element.current?.classList.add('flash');
      const id = setTimeout(
        () =>
          element.current?.classList.contains('flash') &&
          element.current?.classList.remove('flash'),
        250,
      );
      return () => clearTimeout(id);
    }, [price, size]);

    let formattedSize =
      market?.minOrderSize && !isNaN(size)
        ? Number(size).toFixed(getDecimalCount(market.minOrderSize) + 1)
        : size;

    let formattedPrice =
      market?.tickSize && !isNaN(price)
        ? Number(price).toFixed(getDecimalCount(market.tickSize) + 1)
        : price;

    return (
      <Row
        ref={element}
        style={{ marginBottom: 1, fontFamily: 'monospace' }}
        onClick={onSizeClick}
      >
        <Col span={12} style={{ textAlign: 'left', paddingLeft: '15px' }}>
          {formattedSize}
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Line
            data-width={sizePercent + '%'}
            data-bgcolor={
              side === 'buy'
                ? 'rgba(65, 199, 122, 0.2)'
                : 'rgba(242, 60, 105, 0.2)'
            }
          />
          <Price
            style={
              side === 'buy'
                ? { color: 'rgba(65, 199, 122, 1)' }
                : { color: 'rgba(242, 60, 105, 1)' }
            }
            onClick={onPriceClick}
          >
            {formattedPrice}
          </Price>
        </Col>
      </Row>
    );
  },
  (prevProps, nextProps) =>
    isEqual(prevProps, nextProps, ['price', 'size', 'sizePercent']),
);

const MarkPriceComponent = React.memo(
  ({ markPrice }) => {
    const { market } = useMarket();
    const previousMarkPrice = usePrevious(markPrice);

    let markPriceColor =
      markPrice > previousMarkPrice
        ? '#41C77A'
        : markPrice < previousMarkPrice
        ? '#F23B69'
        : 'white';

    let formattedMarkPrice =
      markPrice &&
      market?.tickSize &&
      markPrice.toFixed(getDecimalCount(market.tickSize));

    return (
      <MarkPriceTitle justify="center">
        <Col style={{ color: markPriceColor }}>
          {markPrice > previousMarkPrice && (
            <ArrowUpOutlined style={{ marginRight: 5 }} />
          )}
          {markPrice < previousMarkPrice && (
            <ArrowDownOutlined style={{ marginRight: 5 }} />
          )}
          {formattedMarkPrice || '----'}
        </Col>
      </MarkPriceTitle>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps, ['markPrice']),
);
