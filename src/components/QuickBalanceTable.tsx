import { Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAllOpenOrdersBalances, useMarket, useWalletBalancesForAllMarkets } from '../utils/markets';
import { getDecimalCount } from '../utils/utils';
import FloatingElement from './layout/FloatingElement';
import { useSerumVialMarketData } from '../utils/serum-vial';
import { COLORS } from './colors';
import { useMintToTickers } from '../utils/tokens';
import LightWalletBalancesTable from './UserInfoTable/LightWalletBalancesTable';

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;
const SizeTitle = styled(Row)`
  padding: 20px 0 14px;
  color: #434a59;
`;

export default function QuickBalanceTable({ smallScreen }) {
  const walletBalances = useWalletBalancesForAllMarkets();
  const mintToTickers = useMintToTickers();
  const openOrdersBalances = useAllOpenOrdersBalances();
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });


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
  
  const data = (walletBalances || []).map((balance) => {
    const balances = {
      coin: mintToTickers[balance.mint],
      mint: balance.mint,
      walletBalance: balance.balance,
      openOrdersFree: 0,
      openOrdersTotal: 0,
    };
    for (let openOrdersAccount of openOrdersBalances[balance.mint] || []) {
      balances['openOrdersFree'] += openOrdersAccount.free;
      balances['openOrdersTotal'] += openOrdersAccount.total;
    }
    return balances;
  });

  return (
    <FloatingElement
      style={
        smallScreen
          ? { flex: 1 }
          : {
            marginTop: '2px',
            minHeight: dimensions.height -603,
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
        }}>Wallet Balances</Title>
      </div>
      <LightWalletBalancesTable walletBalances={data} />
        
      
    </FloatingElement>
  );
}