import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import FloatingElement from '../layout/FloatingElement';
import { useOpenOrders, useBalances, useMarket } from '../../utils/markets';
import { COLORS } from '../colors';
import styled, { css } from 'styled-components';
import { TVChartContainer } from '.';
import SimpleChart from './SimpleChart';

const { TabPane } = Tabs;

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;
export default function ChartDispatcher() {
  const [activekey, setActiveKey] = useState('simple');

  function callback(key) {
    setActiveKey(key);
  }

  return (
    <FloatingElement style={{ flex: 1, height:'100%', width:'100%' }}>
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
            Chart
          </Title>
          <div style={{ display: 'flex' }}>
            <Tabs animated={false} size="small" onChange={callback}>
              <TabPane
                tab="Simple"
                key="simple"
                style={{ outline: 'none' }}
              />
              <TabPane
                tab="Advanced"
                key="expert"
                style={{ outline: 'none' }}
              />
            </Tabs>
          </div>
        </div>
      </div>
      
        {activekey === 'simple' ? <SimpleChart/> : <TVChartContainer/>}
      
    </FloatingElement>
  );
}
