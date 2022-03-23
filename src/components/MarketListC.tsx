import { Button, Col, Popover, Row, Select } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useMarket, useBonfidaTrades, getMarketInfos, useMarketsList, useUnmigratedDeprecatedMarkets } from '../utils/markets';
import { getDecimalCount } from '../utils/utils';
import FloatingElement from './layout/FloatingElement';
import { BonfidaTrade } from '../utils/types';
import { nanoid } from 'nanoid';
import { DeleteOutlined, InfoCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { notify } from '../utils/notifications';
import LinkAddress from './LinkAddress';
import CustomMarketDialog from './CustomMarketDialog';
import { COLORS } from './colors';

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;
const SizeTitle = styled(Row)`
  padding: 20px 0 14px;
  color: #434a59;
`;

const { Option, OptGroup } = Select;

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
    document.title = marketName ? `${marketName} — Serum` : 'Serum';
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
            <Title style={{
              paddingLeft: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: '0.8'
            }}>Markets</Title>
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
              <PlusCircleOutlined
                style={{ color: '#2abdd2' }}
                onClick={() => setAddMarketVisible(true)}
              />
            </Col>
          </div>
        </Row>
        <MarketListCustom
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
}) {
  const { market, setMarketAddress } = useMarket();

  const onSetMarketAddress = (marketAddress) => {
    setHandleDeprecated(false);
    setMarketAddress(marketAddress);
  };

  function onsetGhetto(marketAddress) {
    setMarketAddress(marketAddress);
  }

  const extractBase = (a) => a.split('/')[0];
  const extractQuote = (a) => a.split('/')[1];

  const selectedMarket = getMarketInfos(customMarkets)
    .find(
      (proposedMarket) =>
        market?.address && proposedMarket.address.equals(market.address),
    )
    ?.address?.toBase58();
  console.log("onSelect={onSetMarketAddress} ", onSetMarketAddress)
  console.log("value={selectedMarket} ", selectedMarket)
  return (
    <>
      <>
        {/*<Select
          //defaultOpen={true}
          showSearch
          size={'large'}
          style={{ width: 200 }}
          placeholder={placeholder || 'Select a market'}
          optionFilterProp="name"
          onSelect={onSetMarketAddress}
          listHeight={400}
          value={selectedMarket}
          filterOption={(input, option) =>
            option?.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {customMarkets && customMarkets.length > 0 && (
            <OptGroup label="Custom">
              {customMarkets.map(({ address, name }, i) => (
                <Option
                  value={address}
                  key={nanoid()}
                  name={name}
                  style={{
                    padding: '10px',
                    // @ts-ignore
                    backgroundColor: i % 2 === 0 ? 'rgb(39, 44, 61)' : null,
                  }}
                >
                  <Row>
                    <Col flex="auto">{name}</Col>
                    {selectedMarket !== address && (
                      <Col>
                        <DeleteOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            onDeleteCustomMarket && onDeleteCustomMarket(address);
                          }}
                        />
                      </Col>
                    )}
                  </Row>
                </Option>
              ))}
            </OptGroup>
          )}
          <OptGroup label="Markets">
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
                <Option
                  value={address.toBase58()}
                  key={nanoid()}
                  name={name}
                  style={{
                    padding: '10px',
                    // @ts-ignore
                    backgroundColor: i % 2 === 0 ? 'rgb(39, 44, 61)' : null,
                  }}
                >
                  {name} {deprecated ? ' (Deprecated)' : null}
                </Option>
              ))}
          </OptGroup>
                </Select>*/}
      </>
      <>
        {/*<Select
          //defaultOpen={true}
          showSearch
          size={'large'}
          style={{ width: 200 }}
          placeholder={placeholder || 'Select a market'}
          optionFilterProp="name"
          onSelect={onSetMarketAddress}
          listHeight={400}
          value={selectedMarket}
          filterOption={(input, option) =>
            option?.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <OptGroup label="Markets">
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
                <Option
                  value={address.toBase58()}
                  key={nanoid()}
                  name={name}
                  style={{
                    padding: '10px',
                    // @ts-ignore
                    backgroundColor: i % 2 === 0 ? 'rgb(39, 44, 61)' : null,
                  }}
                >
                  {name} {deprecated ? ' (Deprecated)' : null}
                </Option>
              ))}
          </OptGroup>
                </Select>*/}
        <div>
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
                  //padding: '10px',
                  // @ts-ignore
                  backgroundColor: i % 2 === 0 ? 'rgb(39, 44, 61)' : null,
                }}
              >
                {name} {deprecated ? ' (Deprecated)' : null}
              </Button>
            ))}
        </div>
      </>
    </>
  );
}