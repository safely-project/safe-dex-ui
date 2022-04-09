import * as React from 'react';
import './index.css';

import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
} from '../../charting_library/';
import { useMarket, USE_MARKETS } from '../../utils/markets';
import * as saveLoadAdapter from './saveLoadAdapter';
import { flatten } from '../../utils/utils';
import { BONFIDA_DATA_FEED } from '../../utils/bonfidaConnector';

import { COLORS } from '../colors';
import styled from 'styled-components';

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol'];
  interval: ChartingLibraryWidgetOptions['interval'];
  auto_save_delay: ChartingLibraryWidgetOptions['auto_save_delay'];

  // BEWARE: no trailing slash is expected in feed URL
  // datafeed: any;
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions['library_path'];
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  clientId: ChartingLibraryWidgetOptions['client_id'];
  userId: ChartingLibraryWidgetOptions['user_id'];
  fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
  autosize: ChartingLibraryWidgetOptions['autosize'];
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
  containerId: ChartingLibraryWidgetOptions['container_id'];
  theme: string;
}

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;

export interface ChartContainerState { }

export const TVChartContainer = () => {
  // let datafeed = useTvDataFeed();
  const defaultProps: ChartContainerProps = {
    symbol: 'BTC/USDC',
    // @ts-ignore
    interval: '60',
    auto_save_delay: 5,
    theme: 'Dark',
    containerId: 'tv_chart_container',
    // datafeed: datafeed,
    libraryPath: '/charting_library/',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    datafeedUrl: BONFIDA_DATA_FEED,
    studiesOverrides: {},
  };

  const bgcolor = '#0f1722'
  const tvWidgetRef = React.useRef<IChartingLibraryWidget | null>(null);
  const { market } = useMarket();

  const chartProperties = JSON.parse(
    localStorage.getItem('chartproperties') || '{}',
  );

  React.useEffect(() => {
    const savedProperties = flatten(chartProperties, {
      restrictTo: ['scalesProperties', 'paneProperties', 'tradingProperties'],
    });

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol:
        USE_MARKETS.find(
          (m) => m.address.toBase58() === market?.publicKey.toBase58(),
        )?.name || 'SRM/USDC',
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      // @ts-ignore
      // datafeed: datafeed,
      // @ts-ignore
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
        defaultProps.datafeedUrl,
      ),
      interval:
        defaultProps.interval as ChartingLibraryWidgetOptions['interval'],
      container_id:
        defaultProps.containerId as ChartingLibraryWidgetOptions['container_id'],
      library_path: defaultProps.libraryPath as string,
      auto_save_delay: 10,

      locale: 'en',
      //disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates', 'hide_left_toolbar_by_default'],
      load_last_chart: true,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      theme: defaultProps.theme === 'Dark' ? 'Dark' : 'Light',

      disabled_features: ["use_localstorage_for_settings"
        , "link_to_tradingview"
        , "volume_force_overlay"
        , "header_interval_dialog_button"
        //, "show_dialog_on_snapshot_ready"
        , "study_templates"
        , "chart_property_page_trading"
        , "chart_crosshair_menu"
        , "hide_last_na_study_output"
        , 'header_screenshot'
        , 'header_symbol_search'
      ],
      overrides: {
        ...savedProperties,
        'mainSeriesProperties.candleStyle.upColor': '#41C77A',
        'mainSeriesProperties.candleStyle.downColor': '#F23B69',
        'mainSeriesProperties.candleStyle.borderUpColor': '#41C77A',
        'mainSeriesProperties.candleStyle.borderDownColor': '#F23B69',
        'mainSeriesProperties.candleStyle.wickUpColor': '#41C77A',
        'mainSeriesProperties.candleStyle.wickDownColor': '#F23B69',
        "paneProperties.background": bgcolor,
        "paneProperties.backgroundType": "solid",
        "theme": "#000000",
        "scalesProperties.backgroundColor": bgcolor,
        "paneProperties.vertGridProperties.color": bgcolor,
        "paneProperties.horzGridProperties.color": bgcolor,
        "allow_symbol_change": false,
        "save_image": false,

        //  'scalesProperties.backgroundColor' : "#ffffff"
      },
      loading_screen: {
        backgroundColor: "transparent",
      },
      // custom_css_url: 'css/style.css',
      toolbar_bg: bgcolor,

      // @ts-ignore
      save_load_adapter: saveLoadAdapter,
      settings_adapter: {
        initialSettings: {
          'trading.orderPanelSettingsBroker': JSON.stringify({
            showRelativePriceControl: false,
            showCurrencyRiskInQty: false,
            showPercentRiskInQty: false,
            showBracketsInCurrency: false,
            showBracketsInPercent: false,
          }),
          // "proterty"
          'trading.chart.proterty':
            localStorage.getItem('trading.chart.proterty') ||
            JSON.stringify({
              hideFloatingPanel: 1,
            }),
          'chart.favoriteDrawings':
            localStorage.getItem('chart.favoriteDrawings') ||
            JSON.stringify([]),
          'chart.favoriteDrawingsPosition':
            localStorage.getItem('chart.favoriteDrawingsPosition') ||
            JSON.stringify({}),
        },
        setValue: (key, value) => {
          localStorage.setItem(key, value);
        },
        removeValue: (key) => {
          localStorage.removeItem(key);
        },
      },
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      tvWidgetRef.current = tvWidget;
      tvWidget
        // @ts-ignore
        .subscribe('onAutoSaveNeeded', () => tvWidget.saveChartToServer());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, tvWidgetRef.current]);

  return (
    <>
      <div className='ara-box-header' >
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
          <div style={{display:'flex'}}>
            <div>Simple</div>
            <div>Advanced</div>
          </div>
        </div>
      </div>
      <div id={defaultProps.containerId} className={'TVChartContainer'} />
    </>
  );
};
