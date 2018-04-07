// Stock data API key (https://www.alphavantage.co/)
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
    return DATA[ticker];
  } else {
    return DATA[Object.keys(DATA)[Math.floor(Math.random() * 4)]];
  }
}

// user data
var portfolioValue = 1000.00;
var portfolioStocks = ['aapl'];
var compareStocks = [{ ticker: 'goog', isChecked: true }];
