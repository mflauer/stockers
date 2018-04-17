class Data {
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
        'div_yield': '1.56',
        'blurb': 'Apple, Inc. engages in the design, manufacture, and marketing of mobile communication, media devices, personal computers, and portable digital music players. It operates through the following geographical segments: Americas, Europe, Greater China, Japan, and Rest of Asia Pacific.',
        'ceo': 'Tim Cook',
        'founded': '1976',
        'headquarters': 'Cupertino, CA',
      },
      'AMZN': {
        'min': AMZN_MIN,
        'day': AMZN_DAY,
        'week': AMZN_WEEK,
        'pe_ratio': '307.02',
        'mkt_cap': '680.28B',
        'div_yield': '0.00',
        'blurb': 'Amazon.com, Inc. engages in the provision of online retail shopping services. It operates through the following segments: North America, International, and Amazon Web Services (AWS).',
        'ceo': 'Jeffrey Bezos',
        'founded': '1994',
        'headquarters': 'Seattle, WA',
      },
      'FB': {
        'min': FB_MIN,
        'day': FB_DAY,
        'week': FB_WEEK,
        'pe_ratio': '25.51',
        'mkt_cap': '456.67B',
        'div_yield': '0.00',
        'blurb': 'Facebook, Inc. engages in the development of social media applications for people to connect through mobile devices, personal computers, and other surfaces. It enables users to share opinions, ideas, photos, videos, and other activities online.',
        'ceo': 'Mark Zuckerberg',
        'founded': '2004',
        'headquarters': 'Menlo Park, CA',
      },
      'GOOG': {
        'min': GOOG_MIN,
        'day': GOOG_DAY,
        'week': GOOG_WEEK,
        'pe_ratio': '31.37',
        'mkt_cap': '700.20B',
        'div_yield': '0.00',
        'blurb': 'Alphabet Inc. Class C Capital Stock, also called Alphabet, is a holding company, which engages in the business of acquisition and operation of different companies.',
        'ceo': 'Lawrence Page',
        'founded': '2015',
        'headquarters': 'Mountain View, CA',
      },
    };
    this.TIME_RANGE_INTERVAL = {
      '1D': { n: 1, interval: 'min' },
      '5D': { n: 5, interval: 'min' },
      '1M': { n: 21, interval: 'day' },
      '3M': { n: 63, interval: 'day' },
      '6M': { n: 26, interval: 'week' },
      '1Y': { n: 52, interval: 'week' },
      '5Y': { n: 260, interval: 'week' },
    }

    this.PORTFOLIO_VALUE = 1000.00;
    this.PORTFOLIO_STOCKS = ['AAPL'];
    this.COMPARE_STOCKS = {
      'GOOG': { isChecked: true },
      'AAPL': { isChecked: true },
    };
    this.SUGGESTED_STOCKS = ['AMZN'];
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

  getTime(timeRange) {
    return this.TIME_RANGE_INTERVAL[timeRange];
  }

  getStockData(ticker) {
    if (ticker in this.STOCK_DATA) {
      return this.STOCK_DATA[ticker];
    } else {
      return this.STOCK_DATA[Object.keys(this.STOCK_DATA)[Math.floor(Math.random() * 4)]];
    }
  }

  getPrice(ticker) {
    return parseFloat(this.getStockData(ticker)['min'][0][0]['close']).toFixed(2);
  }

  getChange(ticker, timeRange) {
    var time = this.getTime(timeRange);
    var stockData = this.getStockData(ticker);
    var price = parseFloat(stockData['min'][0][0]['close']).toFixed(2);

    if (time.interval == 'min') {
      var open = parseFloat(stockData[time.interval][time.n - 1].slice(-1)[0]['close']).toFixed(2);
    } else {
      var open = parseFloat(stockData[time.interval][time.n - 1]['adjusted close']).toFixed(2);
    }

    return (100 * ((price / open) - 1)).toFixed(2);
  }

  getStats(ticker, timeRange) {
    var time = this.getTime(timeRange);
    var stockData = this.getStockData(ticker);
    if (time.interval == 'min') {
      var open = parseFloat(stockData[time.interval][time.n - 1].slice(-1)[0]['close']).toFixed(2);
      var closes = [].concat.apply([], stockData[time.interval].slice(0, time.n).map(x => x.map(y => parseFloat(y['close']))));
      var high = Math.max(...closes).toFixed(2);
      var low = Math.min(...closes).toFixed(2);
    } else {
      var open = parseFloat(stockData[time.interval][time.n - 1]['adjusted close']).toFixed(2);
      var closes = [].concat.apply([], stockData[time.interval].slice(0, time.n).map(x => parseFloat(x['close'])));
      var high = Math.max(...closes).toFixed(2);
      var low = Math.min(...closes).toFixed(2);
    }
    return {
      open : open,
      high : high,
      low : low,
    };
  }

  getMktCap(ticker) {
    return this.getStockData(ticker)['mkt_cap'];
  }

  getPERatio(ticker) {
    return this.getStockData(ticker)['pe_ratio'];
  }

  getDivYield(ticker) {
    return this.getStockData(ticker)['div_yield'];
  }

  getBlurb(ticker) {
    return this.getStockData(ticker)['blurb'];
  }

  getCEO(ticker) {
    return this.getStockData(ticker)['ceo'];
  }

  getFounded(ticker) {
    return this.getStockData(ticker)['founded'];
  }

  getHeadquarters(ticker) {
    return this.getStockData(ticker)['headquarters'];
  }

  getCompany(ticker) {
    return this.COMPANIES[ticker];
  }

  getPortfolioTickers() {
    return this.PORTFOLIO_STOCKS.sort();
  }

  getCompareTickers() {
    return Object.keys(this.COMPARE_STOCKS).sort();
  }

  getSuggestedTickers() {
    return this.SUGGESTED_STOCKS.sort();
  }

  getCompareChecked(ticker) {
    if (ticker in this.COMPARE_STOCKS) {
      return this.COMPARE_STOCKS[ticker.toUpperCase()].isChecked;
    }
    return false;
  }

  toggleCompareChecked(ticker) {
    if (ticker in this.COMPARE_STOCKS) {
      this.COMPARE_STOCKS[ticker].isChecked = !this.COMPARE_STOCKS[ticker].isChecked;
    }
  }

  addToCompareStocks(ticker) {
    this.COMPARE_STOCKS[ticker] = {
      isChecked: true
    }
  }

  removeCompareStock(ticker) {
    delete this.COMPARE_STOCKS[ticker];
  }

  removeSuggestedStock(ticker) {
    delete this.SUGGESTED_STOCKS[ticker];
  }
}

data = new Data();
