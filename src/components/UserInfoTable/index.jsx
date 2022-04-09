import BalancesTable from './BalancesTable';
import OpenOrderTable from './OpenOrderTable';
import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import FillsTable from './FillsTable';
import FloatingElement from '../layout/FloatingElement';
import FeesTable from './FeesTable';
import { useOpenOrders, useBalances, useMarket } from '../../utils/markets';
import { COLORS } from '../colors';
import styled, { css } from 'styled-components';
const { Paragraph } = Typography;
const { TabPane } = Tabs;

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;
export default function Index() {
  const { market } = useMarket();
  const [activekey, setActiveKey] = useState('orders');

  function callback(key) {
    //console.log('KEY ', key);
    setActiveKey(key);
  }

  return (
    <FloatingElement style={{ flex: 1 }}>
      <div className="ara-box-header">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title
            style={{
              paddingLeft: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: '0.8',
            }}
          >
            My Orders
          </Title>
          <div style={{ display: 'flex' }}>
            <Tabs animated={false} size="small" onChange={callback}>
              <TabPane
                tab="Open Orders"
                key="orders"
                style={{ outline: 'none' }}
              />
              <TabPane
                tab="Recent Trade History"
                key="fills"
                style={{ outline: 'none' }}
              />
              {/*<TabPane tab="Balances" key="balances" style={{outline: 'none'}} />*/}
              {/*market && market.supportsSrmFeeDiscounts ? (
          <TabPane tab="Fee discounts" key="fees">
            <FeesTable />
          </TabPane>
        ) : null*/}
            </Tabs>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: COLORS.main }}>
        {activekey === 'orders' ? <OpenOrdersTab /> : <FillsTable />}

        {/*<BalancesTab />*/}
      </div>
    </FloatingElement>
  );
}

const OpenOrdersTab = () => {
  const openOrders = useOpenOrders();

  return <OpenOrderTable openOrders={openOrders} />;
};

const BalancesTab = () => {
  const balances = useBalances();

  return <BalancesTable balances={balances} />;
};
