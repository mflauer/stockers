// Stock data API key (https://www.alphavantage.co/)
const API_KEY = 'MIRLW3E1H4871KNW';

const SEARCH_CONTENT = [
  {title: 'aaaaa'},
  {title: 'bbbbb'},
  {title: 'ccccc'},
  {title: 'ddddd'},
];

const DATA = {
  'AAPL': {
    'min': AAPL_MIN,
    'day': AAPL_DAY,
    'week': AAPL_WEEK,
    'pe_ratio': '16.47',
    'mkt_cap': '854.36B',
  },
  'AMZN': {
    'min': AMZN_MIN,
    'day': AMZN_DAY,
    'week': AMZN_WEEK,
    'pe_ratio': '307.02',
    'mkt_cap': '680.28B',
  },
  'FB': {
    'min': FB_MIN,
    'day': FB_DAY,
    'week': FB_WEEK,
    'pe_ratio': '25.51',
    'mkt_cap': '456.67B',
  },
  'GOOG': {
    'min': GOOG_MIN,
    'day': GOOG_DAY,
    'week': GOOG_WEEK,
    'pe_ratio': '31.37',
    'mkt_cap': '700.20B',
  },
};

const CURRENT_DATE = new Date(2018, 3, 6, 15, 5, 0, 0).getTime(); //'2018-04-06 15:05:00';
const EARLIEST_DATE = new Date('2000-01-14').getTime();

const TIME_RANGE_INTERVAL = {
  '1D': { n: 1, interval: 'min' },
  '5D': { n: 5, interval: 'min' },
  '1M': { n: 21, interval: 'day' },
  '3M': { n: 63, interval: 'day' },
  '6M': { n: 126, interval: 'day' },
  '1Y': { n: 52, interval: 'week' },
  '5Y': { n: 260, interval: 'week' },
}

function getData(ticker) {
  if (ticker in DATA) {
    return DATA[ticker];
  } else {
    return DATA[Object.keys(DATA)[Math.floor(Math.random() * 4)]];
  }
}

// portfolio data
var PORTFOLIO_VALUE = 1000.00;
var PORTFOLIO_STOCKS = ['AAPL'];

function getPortfolioTickers() {
  return PORTFOLIO_STOCKS;
}

// compare data
var COMPARE_STOCKS = {
  'GOOG': {
    isChecked: true,
  },
  'AAPL': {
    isChecked: false,
  },
};

function getCompareTickers() {
  return Object.keys(COMPARE_STOCKS);
}

function getCompareChecked(ticker) {
  return COMPARE_STOCKS[ticker.toUpperCase()].isChecked
}

function toggleCompareChecked(ticker) {
  ticker = ticker.toUpperCase();
  COMPARE_STOCKS[ticker].isChecked = !COMPARE_STOCKS[ticker].isChecked;
}
