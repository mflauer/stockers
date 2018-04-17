Number.prototype.formatMoney = function() {
  var n = this,
      s = n < 0 ? '-' : '',
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(2))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + ',' : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + ',') + (2 ? '.' + Math.abs(n - i).toFixed(2).slice(2) : "");
 };

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

    this.PORTFOLIO_STOCKS = {
      'AAPL' : [
        {
          'time': '2017-05-12T12:30:00',
          'price': 153.78,
          'amount': 6,
        },
        {
          'time': '2017-12-22T13:15:00',
          'price': 176.29,
          'amount': -3,
        },
      ],
      'AMZN' : [
        {
          'time': '2018-02-23T10:45:00',
          'price': 1469.92,
          'amount': 2,
        },
      ],
    };
    this.COMPARE_STOCKS = {
      'AAPL': { isChecked: true },
    };
    this.SUGGESTED_STOCKS = ['GOOG'];
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
    return parseFloat(this.getStockData(ticker)['min'][0][0]['close']).formatMoney();
  }

  getChange(ticker, timeRange) {
    var time = this.getTime(timeRange);
    var stockData = this.getStockData(ticker);
    var price = parseFloat(stockData['min'][0][0]['close']).formatMoney();

    if (time.interval == 'min') {
      var open = parseFloat(stockData[time.interval][time.n - 1].slice(-1)[0]['close']).formatMoney();
    } else {
      var open = parseFloat(stockData[time.interval][time.n - 1]['adjusted close']).formatMoney();
    }

    return (100 * ((price / open) - 1)).formatMoney();
  }

  getStats(ticker, timeRange) {
    var time = this.getTime(timeRange);
    var stockData = this.getStockData(ticker);
    if (time.interval == 'min') {
      var open = parseFloat(stockData[time.interval][time.n - 1].slice(-1)[0]['close']).formatMoney();
      var closes = [].concat.apply([], stockData[time.interval].slice(0, time.n).map(x => x.map(y => parseFloat(y['close']))));
      var high = Math.max(...closes).formatMoney();
      var low = Math.min(...closes).formatMoney();
    } else {
      var open = parseFloat(stockData[time.interval][time.n - 1]['adjusted close']).formatMoney();
      var closes = [].concat.apply([], stockData[time.interval].slice(0, time.n).map(x => parseFloat(x['close'])));
      var high = Math.max(...closes).formatMoney();
      var low = Math.min(...closes).formatMoney();
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
    return Object.keys(this.PORTFOLIO_STOCKS).sort();
  }

  getPortfolioValue(ticker=undefined) {
    var total = 0;
    if (ticker == undefined) {
      for (ticker in this.PORTFOLIO_STOCKS) {
        total += parseFloat(this.getPortfolioValue(ticker).replace(',', ''));
      }
      return total.formatMoney();
    } else {
      var changes = this.PORTFOLIO_STOCKS[ticker];
      for (var i = 0; i < changes.length; i++) {
        total += changes[i]['price'] * changes[i]['amount'];
      }
      return total.formatMoney();
    }
  }

  getCompareTickers() {
    return Object.keys(this.COMPARE_STOCKS).sort();
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

  getSuggestedTickers() {
    return this.SUGGESTED_STOCKS.sort();
  }

  removeSuggestedStock(ticker) {
    this.SUGGESTED_STOCKS.splice(this.SUGGESTED_STOCKS.indexOf(ticker), 1 );
  }
}

data = new Data();
