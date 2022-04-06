import { Col, Row } from 'antd';
import React from 'react';
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
        }}>Wallet Balances</Title>
      </div>
      <LightWalletBalancesTable walletBalances={data} />
        
      
    </FloatingElement>
  );
}