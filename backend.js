// Stock data API key (https://www. .co/)
const API_KEY = 'MIRLW3E1H4871KNW';

const SEARCH_CONTENT = [
  {title: 'aaaaa'},
  {title: 'bbbbb'},
  {title: 'ccccc'},
  {title: 'ddddd'},
];

const STOCK_DATA = {
  'aapl': {
    'min': AAPL_MIN,
    'day': AAPL_DAY,
    'week': AAPL_WEEK,
  },
  'amzn': {
    'min': AMZN_MIN,
    'day': AMZN_DAY,
    'week': AMZN_WEEK,
  },
  'fb': {
    'min': FB_MIN,
    'day': FB_DAY,
    'week': FB_WEEK,
  },
  'goog': {
    'min': GOOG_MIN,
    'day': GOOG_DAY,
    'week': GOOG_WEEK,
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
    return STOCK_DATA[ticker];
  } else {
    return STOCK_DATA[Object.keys(DATA)[Math.floor(Math.random() * 4)]];
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
  return COMPARE_STOCKS[ticker].isChecked
}

function toggleCompareChecked(ticker) {
  COMPARE_STOCKS[ticker] = !COMPARE_STOCKS[ticker];
}
