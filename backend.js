// Stock data API key (https://www.alphavantage.co/)
const API_KEY = 'MIRLW3E1H4871KNW';

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

const MS_PER_DAY = 1000*60*60*24;
const DAY_PER_MONTH = 30;
const DAY_PER_YEAR = 365;
const CURRENT_DATE = new Date(2018, 3, 6, 15, 5, 0, 0).getTime(); //"2018-04-06 15:05:00";
const EARLIEST_DATE = new Date("2000-01-14").getTime();

const TIME_RANGE_INTERVAL = {
  '1D': 'min',
  '5D': 'min',
  '1M': 'day',
  '3M': 'day',
  '6M': 'day',
  '1Y': 'week',
  '5Y': 'week',
  'MAX': 'week',
}

function getStartDate(timeRange) {
  var d,
      withMin = TIME_RANGE_INTERVAL[timeRange] == 'min';
  
  switch (timeRange) {
    case '1D':
      d = CURRENT_DATE - MS_PER_DAY;
      break;
    case '5D':
      d = CURRENT_DATE - 5*MS_PER_DAY;
      break;
    case '1M':
      d = CURRENT_DATE - DAY_PER_MONTH*MS_PER_DAY;
      break;
    case '3M':
      d = CURRENT_DATE - 3*DAY_PER_MONTH*MS_PER_DAY;
      break;
    case '6M':
      d = CURRENT_DATE - 6*DAY_PER_MONTH*MS_PER_DAY;
      break;
    case '1Y':
      d = CURRENT_DATE - DAY_PER_YEAR*MS_PER_DAY;
      break;
    case '5Y':
      d = CURRENT_DATE - 5*DAY_PER_YEAR*MS_PER_DAY;
      break;
    case 'MAX':
      d = EARLIEST_DATE;
      break;
    default:
      console.log("Invalid time range.")
      return;
  }

  return {
    startDate: formatDate(d, withMin),
    interval: TIME_RANGE_INTERVAL[timeRange],
  };
}

function formatDate(date, withMin=false) {
  var d = new Date(date),
      year = d.getFullYear(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  var str = [year, month, day].join('-');

  if (withMin) {
    str += ' 09:30:00';
  }

  return str;
}

var portfolioValue = 1000.00;

// picker values
var portfolioStocks = [];
var compareStocks = [];
