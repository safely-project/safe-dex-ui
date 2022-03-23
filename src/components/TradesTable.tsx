import { Col, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { useMarket } from '../utils/markets';
import { getDecimalCount } from '../utils/utils';
import FloatingElement from './layout/FloatingElement';
import { useSerumVialMarketData } from '../utils/serum-vial';
import { COLORS } from './colors';

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;
const SizeTitle = styled(Row)`
  padding: 20px 0 14px;
  color: #434a59;
`;

export default function PublicTrades({ smallScreen }) {
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const { trades } = useSerumVialMarketData();

  return (
    <FloatingElement
      style={
        smallScreen
          ? { flex: 1 }
          : {
            marginTop: '10px',
            minHeight: '270px',
            maxHeight: 'calc(100vh - 700px)',
          }
      }
    >
      <div style={{ backgroundColor: COLORS.secondary, borderTopLeftRadius: '6px', borderTopRightRadius: '6px', padding: '10px' }}>
        <Title style={{
          paddingLeft: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: '0.8'
        }}>Recent market trades</Title>
      </div>
      <SizeTitle>
        <Col span={8}>Price ({quoteCurrency}) </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          Size ({baseCurrency})
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          Time
        </Col>
      </SizeTitle>
      {trades.length > 0 && (
        <div
          style={{
            marginRight: '-20px',
            paddingRight: '5px',
            overflowY: 'scroll',
            maxHeight: smallScreen
              ? 'calc(100% - 75px)'
              : 'calc(100vh - 800px)',
          }}
        >
          {trades.map((trade, i: number) => (
            <Row key={i} style={{ marginBottom: 4 }}>
              <Col
                span={8}
                style={{
                  color: trade.side === 'buy' ? '#41C77A' : '#F23B69',
                }}
              >
                {market?.tickSize && !isNaN(trade.price)
                  ? Number(trade.price).toFixed(
                    getDecimalCount(market.tickSize),
                  )
                  : trade.price}
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                {market?.minOrderSize && !isNaN(trade.size)
                  ? Number(trade.size).toFixed(
                    getDecimalCount(market.minOrderSize),
                  )
                  : trade.size}
              </Col>
              <Col span={8} style={{ textAlign: 'right', color: '#434a59' }}>
                {new Date(trade.timestamp).toLocaleTimeString()}
              </Col>
            </Row>
          ))}
        </div>
      )}
    </FloatingElement>
  );
}