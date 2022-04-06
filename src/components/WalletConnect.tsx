import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { useWallet } from '../utils/wallet';
import LinkAddress from './LinkAddress';

import styled from "styled-components";
import { DisconnectOutlined } from '@ant-design/icons';

const ButtonCustomDrop = styled(Dropdown.Button)`
  &&& {
    background: rgb(3 66 96);
    color: rgb(84 221 235);
    border: none;
    border-radius: 3px;
    /* margin-left: 10px; */

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

  const ButtonCustom = styled(Button)`
  
  background: rgb(3 66 96);
  color: rgb(84 221 235);
  border: 1px solid rgb(3 66 96);
  ${connected  ? 'padding-top:3px' : ''};
  border-radius: 3px;
  /* margin-left: 10px; */
  &:hover {
    background: rgb(84 221 235);
    color: rgb(15 23 34);
  }

`;
  const menu2 = (
    <Menu>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
          View on explorer
        </a>
      </Menu.Item>
      <div style={{display:'flex'}}>
      <Menu.Item key="3" onClick={select}>
        Change Wallet
      </Menu.Item>
      <Menu.Item>
        {connected ?
          <>
            <ButtonDisCustom onClick={connected ? disconnect : select}>
              <DisconnectOutlined />
              disconnect
            </ButtonDisCustom>
          </>
          :
          null
        }
      </Menu.Item>

      </div>
    </Menu>
  );


  const menu = (
    <Menu>
      <div style={{color:'#aff2fb'}}>
      {connected && <LinkAddress shorten={true} address={publicKey} />}
      </div>
      <Menu.Item key="3" onClick={select}>
        Change Wallet
      </Menu.Item>
    </Menu>
  );

  return (
    <>

      <Dropdown overlay={menu2} placement='bottomCenter' >
        <ButtonCustom onClick={connected ? disconnect : connect}>
          {connected ?
            <div style={{color:'#aff2fb'}}>
            <LinkAddress shorten={true} address={publicKey} />
            </div>
            :
            'Connect a wallet'
          }

        </ButtonCustom>
      </Dropdown>
          {/*
      <ButtonCustomDrop className="test" onClick={connected ? disconnect : connect} overlay={menu} >
        {connected ?

          <LinkAddress shorten={true} address={publicKey} />

          :
          'Connect'

        }
      </ButtonCustomDrop>
      <ButtonDisCustom onClick={connected ? disconnect : select}>
        {connected ?
          <DisconnectOutlined /> :
          null
        }
      </ButtonDisCustom>
        */}

    </>
  );
}

