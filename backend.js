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

const CURRENT_DATE_TIME = new Date(2018, 3, 6, 15, 5, 0, 0).getTime(); //"2018-04-06 15:05:00";
const SEC_PER_DAY = 60*60*24;
const DAY_PER_MONTH = 30;
const DAY_PER_YEAR = 365;

const TIME_TEXT_TO_INCREMENT = {
  '1D' : 'min',
  '5D' : 'min',
  '1M' : 'day',
  '3M' : 'day',
  '6M' : 'day',
  '1Y' : 'week',
  '5Y' : 'week',
  'MAX' : 'week'
}

function getStartDateString(timeText) {
  switch (timeText) {
    case '1D':
      var d = new Date(CURRENT_DATE_TIME  - SEC_PER_DAY);
      return _dateToStringWithMins(d);
    case '5D':
      var d = new Date(CURRENT_DATE_TIME  - 5*SEC_PER_DAY);
      return _dateToStringWithMins(d);
    case '1M':
      var d = new Date(CURRENT_DATE_TIME  - DAY_PER_MONTH*SEC_PER_DAY);
      return _dateToStringNoMins(d)
    case '3M':
      var d = new Date(CURRENT_DATE_TIME  - 3*DAY_PER_MONTH*SEC_PER_DAY);
      return _dateToStringNoMins(d)
    case '6M':
      var d = new Date(CURRENT_DATE_TIME  - 6*DAY_PER_MONTH*SEC_PER_DAY);
      return _dateToStringNoMins(d)
    case '1Y':
      var d = new Date(CURRENT_DATE_TIME  - DAY_PER_YEAR*SEC_PER_DAY);
      return _dateToStringNoMins(d)
    case '5Y':
      var d = new Date(CURRENT_DATE_TIME  - 5*DAY_PER_YEAR*SEC_PER_DAY);
      return _dateToStringNoMins(d)
    case 'MAX':
      // earliest date we have data for
      var d = new Date(CURRENT_DATE_TIME  - new Date("2000-01-14").getTime()); 
      return _dateToStringNoMins(d)
    default:
      console.log("invalid dates :(")
  }
}

function _dateToStringNoMins(date) {
  var year = date.getFullYear();
  var month = date.getMonth() > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
  var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
  return year + "-" + month + "-" + day
}

function _dateToStringWithMins(date) {
  var hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
  var mins = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
  return _dateToStringNoMins(date) + " " + hours + ":" +  mins + ":00"
}

var portfolioValue = 1000;

// picker values
var portfolioStocks = [] 
var compareStocks = []
