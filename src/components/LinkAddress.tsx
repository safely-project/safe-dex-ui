import React from 'react';
import { Button } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
export default function LinkAddress({
  title,
  address,
  shorten = false,
}: {
  title?: undefined | any;
  address: string;
  shorten?: boolean;
}) {
  return (
    <div style={{paddingLeft:'7px'}}>
      {title && <p style={{ color: 'white' }}>{title}</p>}
      <Button
        type="link"

        href={
          'https://explorer.safecoin.org/address/' + address + '?cluster=devnet'
        }
        target="_blank"
        rel="noopener noreferrer"
        style={{ cursor: 'pointer', color: "white", paddingTop: 'inherit', lineHeight: 'inherit' }}
      >
        <div style={{
          position: 'absolute',
          marginLeft: '-27px',
          paddingTop:'2px',
          
        }}>

          <Jazzicon diameter={19} seed={jsNumberForAddress(address)} />
        </div><div style={{color:'#aff2fb'}}>{shorten ? `${address.slice(0, 4)}...${address.slice(-4)}` : address}</div>
      </Button>
    </div>
  );
}
