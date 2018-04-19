Number.prototype.withCommas = function() {
  return this.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

String.prototype.withCommas = function() {
  return this;
}

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
        'pe_ratio': 16.47,
        'mkt_cap': '854.36B',
        'div_yield': 1.56,
        'blurb': 'Apple, Inc. engages in the design, manufacture, and marketing of mobile communication, media devices, personal computers, and portable digital music players. It operates through the following geographical segments: Americas, Europe, Greater China, Japan, and Rest of Asia Pacific.',
        'ceo': 'Tim Cook',
        'founded': '1976',
        'headquarters': 'Cupertino, CA',
      },
      'AMZN': {
        'min': AMZN_MIN,
        'day': AMZN_DAY,
        'week': AMZN_WEEK,
        'pe_ratio': 307.02,
        'mkt_cap': '680.28B',
        'div_yield': 0.00,
        'blurb': 'Amazon.com, Inc. engages in the provision of online retail shopping services. It operates through the following segments: North America, International, and Amazon Web Services (AWS).',
        'ceo': 'Jeffrey Bezos',
        'founded': '1994',
        'headquarters': 'Seattle, WA',
      },
      'FB': {
        'min': FB_MIN,
        'day': FB_DAY,
        'week': FB_WEEK,
        'pe_ratio': 25.51,
        'mkt_cap': '456.67B',
        'div_yield': 0.00,
        'blurb': 'Facebook, Inc. engages in the development of social media applications for people to connect through mobile devices, personal computers, and other surfaces. It enables users to share opinions, ideas, photos, videos, and other activities online.',
        'ceo': 'Mark Zuckerberg',
        'founded': '2004',
        'headquarters': 'Menlo Park, CA',
      },
      'GOOG': {
        'min': GOOG_MIN,
        'day': GOOG_DAY,
        'week': GOOG_WEEK,
        'pe_ratio': 31.37,
        'mkt_cap': '700.20B',
        'div_yield': 0.00,
        'blurb': 'Alphabet Inc. Class C Capital Stock, also called Alphabet, is a holding company, which engages in the business of acquisition and operation of different companies.',
        'ceo': 'Lawrence Page',
        'founded': '2015',
        'headquarters': 'Mountain View, CA',
      },
    };
    this.TIME_RANGE_INTERVAL = {
      '1D': { n: 68, interval: 'min' },
      '5D': { n: 384, interval: 'min' },
      '1M': { n: 21, interval: 'day' },
      '3M': { n: 63, interval: 'day' },
      '6M': { n: 26, interval: 'week' },
      '1Y': { n: 52, interval: 'week' },
      '5Y': { n: 260, interval: 'week' },
    }

    this.PORTFOLIO_STOCKS = {
      'AAPL' : [
        {
          'date': '2017-05-12T12:30:00',
          'price': 153.78,
          'amount': 6,
        },
        {
          'date': '2017-12-22T13:15:00',
          'price': 176.29,
          'amount': -3,
        },
      ],
      'AMZN' : [
        {
          'date': '2018-02-23T10:45:00',
          'price': 1469.92,
          'amount': 2,
        },
      ],
    };
    this.COMPARE_STOCKS = {
      'AAPL': { isChecked: true },
    };
    this.SUGGESTED_STOCKS = ['AMZN', 'FB', 'GOOG'];
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
    if (timeRange in this.TIME_RANGE_INTERVAL) {
      return this.TIME_RANGE_INTERVAL[timeRange];
    } else {
      // timeRange is already timeRange object
      return timeRange;
    }
  }

  getCurrentTime() {
    // current frozen time
    return '2018-04-06T15:05:00';
  }

  getStockData(ticker) {
    if (!(ticker in this.STOCK_DATA)) {
      // store dummy data for ticker
      this.STOCK_DATA[ticker] = this.STOCK_DATA[Object.keys(this.STOCK_DATA)[Math.floor(Math.random() * 4)]];
    }
    return this.STOCK_DATA[ticker];
  }

  getPrice(ticker, timeRange) {
    var stockData = this.getStockData(ticker);
    if (timeRange != undefined) {
      // get price at start of timeRange
      var time = this.getTime(timeRange);
      var close = time.interval == 'min' ? 'close' : 'adjusted close'
      var price = parseFloat(stockData[time.interval][time.n - 1][close]);
      if (price == 0) {
        // find first non-zero element
        price = parseFloat(stockData[time.interval].slice().reverse().find(function(e) { return e[close] > 0; })[close]);
      }
      return price
    } else {
      // get current price
      return parseFloat(stockData['min'][0]['close']);
    }
  }

  getChange(ticker, timeRange) {
    // compare current price with price at start of timeRange
    return 100 * ((this.getPrice(ticker) / this.getPrice(ticker, timeRange)) - 1);
  }

  getStats(ticker, timeRange) {
    var time = this.getTime(timeRange);
    var stockData = this.getStockData(ticker);
    var close = time.interval == 'min' ? 'close' : 'adjusted close'
    var closes = [].concat.apply([], stockData[time.interval].slice(0, time.n).map(x => parseFloat(x[close])));
    
    return {
      start : this.getPrice(ticker, timeRange),
      high : Math.max(...closes.filter(Boolean)),
      low : Math.min(...closes.filter(Boolean)),
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

  getPortfolioData(ticker) {
    var stockData = this.getStockData(ticker);
    var changes = this.PORTFOLIO_STOCKS[ticker];
    var portfolioData = {
      'min' : [],
      'day' : [],
      'week' : [],
    };

    for (var interval in portfolioData) {
      var close = interval == 'min' ? 'close' : 'adjusted close'
      var shares = 0;
      var i = 0;
      var date = new Date(changes[i]['date']);
      portfolioData[interval] = stockData[interval].slice().reverse().map(function(x) {
        if (i < changes.length && new Date(x['date']) >= new Date(changes[i]['date'])) {
          shares += parseInt(changes[i]['amount']);
          i += 1;
        }
        var y = Object.assign({}, x);
        y[close] = parseFloat(x[close]) * shares;
        return y;
      }).reverse();
    }

    return portfolioData;
  }

  getPortfolioValue(ticker, timeRange) {
    var total = 0;
    if (ticker == undefined) {
      // return sum of values for each stock in portfolio
      for (ticker in this.PORTFOLIO_STOCKS) {
        total += this.getPortfolioValue(ticker, timeRange);
      }
    } else {
      // return value of individual stock in portfolio
      var changes = this.PORTFOLIO_STOCKS[ticker];
      var shares = 0;
      var price = this.getPrice(ticker, timeRange);
      for (var i = 0; i < changes.length; i++) {
        if (timeRange != undefined) {
          // get value of individual stock at start of timeRange
          var time = this.getTime(timeRange);
          if (new Date(changes[i]['date']) >= new Date(this.getStockData(ticker)[time.interval][time.n - 1]['date'])) {
            break;
          }
        }
        shares += changes[i]['amount'];
      }
      total = shares * price;

      // find first purchase of stock
      if (total == 0) {
        var initial = this.PORTFOLIO_STOCKS[ticker][0];
        total = initial.amount * initial.price;
      }
    }
    return total;
  }

  getPortfolioChange(ticker, timeRange) {
    // compare current value with value at start of timeRange
    var start = this.getPortfolioValue(ticker, timeRange);
    return 100 * ((this.getPortfolioValue(ticker) / start) - 1);
  }

  getPortfolioPercent(ticker, timeRange) {
    // get percentage at start of timeRange
    var total = this.getPortfolioValue(undefined, timeRange);
    if (total == 0) {
      // portfolio is empty
      return '—';
    } else {
      return 100 * (this.getPortfolioValue(ticker, timeRange) / total);
    }
  }

  buyStock(ticker, shares) {
    if (shares > 0) {
      var newStock = false;
      if (!(ticker in this.PORTFOLIO_STOCKS)) {
        // create new stock in portfolio
        this.PORTFOLIO_STOCKS[ticker] = [];
        newStock = true;
      }
      this.PORTFOLIO_STOCKS[ticker].push({
        'date': this.getCurrentTime(),
        'price': this.getPrice(ticker),
        'amount': shares,
      });
      return newStock;
    }
  }

  sellStock(ticker, shares) {
    // TODO
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
