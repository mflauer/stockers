class Backend {
  constructor() {
    // Stock data API key (https://www.alphavantage.co/)
    // this.API_KEY = 'MIRLW3E1H4871KNW';
    
    this.COMPANIES = ALL_COMPANIES;
    this.STOCK_DATA = {
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
    this.TIME_RANGE_INTERVAL = {
      '1D': { n: 1, interval: 'min' },
      '5D': { n: 5, interval: 'min' },
      '1M': { n: 21, interval: 'day' },
      '3M': { n: 63, interval: 'day' },
      '6M': { n: 126, interval: 'day' },
      '1Y': { n: 52, interval: 'week' },
      '5Y': { n: 260, interval: 'week' },
    }

    this.PORTFOLIO_VALUE = 1000.00;
    this.PORTFOLIO_STOCKS = ['AAPL'];
    this.COMPARE_STOCKS = {
      'GOOG': { isChecked: true },
      'AAPL': { isChecked: false },
    };
  }

  getSearchContent() {
    var searchContent = [];
    var keys = Object.keys(this.COMPANIES);
    for (var i in keys) {
      var company = keys[i];
      searchContent.push({
        title: company,
        description: this.COMPANIES[company],
      });
    }
    return searchContent;
  }

  getData(ticker) {
    if (ticker in this.STOCK_DATA) {
      return this.STOCK_DATA[ticker];
    } else {
      return this.STOCK_DATA[Object.keys(this.STOCK_DATA)[Math.floor(Math.random() * 4)]];
    }
  }

  getTime(timeRange) {
    return this.TIME_RANGE_INTERVAL[timeRange];
  }

  getPortfolioTickers() {
    return this.PORTFOLIO_STOCKS.sort();
  }

  getCompareTickers() {
    return Object.keys(this.COMPARE_STOCKS).sort();
  }

  getCompareChecked(ticker) {
    return this.COMPARE_STOCKS[ticker.toUpperCase()].isChecked
  }

  toggleCompareChecked(ticker) {
    ticker = ticker.toUpperCase();
    this.COMPARE_STOCKS[ticker].isChecked = !this.COMPARE_STOCKS[ticker].isChecked;
  }

  addToCompareStocks(ticker) {
    this.COMPARE_STOCKS[ticker] = {
      isChecked: true
    }
  }
}

backend = new Backend();
