// Stock data API key (https://www. .co/)
const API_KEY = 'MIRLW3E1H4871KNW';

const SEARCH_CONTENT = [
  {title: 'aaaaa'},
  {title: 'bbbbb'},
  {title: 'ccccc'},
  {title: 'ddddd'},
];

const DATA = {
  'aapl': {
    'min': AAPL_MIN,
    'day': AAPL_DAY,
    'week': AAPL_WEEK,
    'pe_ratio': '16.47',
    'mkt_cap': '854.36B',
  },
  'amzn': {
    'min': AMZN_MIN,
    'day': AMZN_DAY,
    'week': AMZN_WEEK,
    'pe_ratio': '307.02',
    'mkt_cap': '680.28B',
  },
  'fb': {
    'min': FB_MIN,
    'day': FB_DAY,
    'week': FB_WEEK,
    'pe_ratio': '25.51',
    'mkt_cap': '456.67B',
  },
  'goog': {
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
var PORTFOLIO_STOCKS = ['aapl'];

function getPortfolioTickers() {
  return PORTFOLIO_STOCKS;
}

// compare data
var COMPARE_STOCKS = {
  'goog': {
    isChecked: true,
  },
  'aapl': {
    isChecked: false,
  },
};

function getCompareTickers() {
  return Object.keys(COMPARE_STOCKS);
}

function getCompareChecked(ticker) {
  var lcTicker = ticker.toLowerCase();
  return COMPARE_STOCKS[lcTicker].isChecked
}

function toggleCompareChecked(ticker) {
  var lcTicker = ticker.toLowerCase();
  COMPARE_STOCKS[lcTicker].isChecked = !COMPARE_STOCKS[lcTicker].isChecked;
}
