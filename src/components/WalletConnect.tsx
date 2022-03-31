import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { useWallet } from '../utils/wallet';
import LinkAddress from './LinkAddress';

import styled from "styled-components";
import { DisconnectOutlined } from '@ant-design/icons';

const ButtonCustom = styled(Button)`
  &&& {
    background: #00bcd4;
    border-radius: 205px;
    /* margin-left: 10px; */
    border: 0px;
    color:white;
  }
`;
const ButtonDisCustom = styled(Button)`
  &&& {
    border-radius: 205px;
    /* margin-left: 10px; */
    border: 0px;
    color:rgb(242, 60, 105);
  }
`;
export default function WalletConnect() {
  const { connected, wallet, select, connect, disconnect } = useWallet();
  const publicKey = (connected && wallet?.publicKey?.toBase58()) || '';

  const menu = (
    <Menu>
      {connected && <LinkAddress shorten={true} address={publicKey} />}
      <Menu.Item key="3" onClick={select}>
        Change Wallet
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <ButtonCustom className="test" onClick={connected ? disconnect : connect} >
        {connected ?

          <LinkAddress shorten={true} address={publicKey} /> :
          'Connect'

        }
      </ButtonCustom>
      <ButtonDisCustom onClick={connected ? disconnect : select}>
        {connected ?
          <DisconnectOutlined /> :
          null
        }
      </ButtonDisCustom>
    </>
  );
}

