// constants
const INIT_TIME_RANGE = '1D';

// graph data
var portfolioTimeRange = INIT_TIME_RANGE,
    compareTimeRange = INIT_TIME_RANGE,
    portfolioGraphData = getGraphData('portfolio'),
    compareGraphData = getGraphData('compare');


// table data
var portfolioTableData, compareTableData;

// colors
const COLORS = [
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'teal',
  'blue',
  'violet',
  'purple',
  'pink',
  'brown',
];
var currentColor = 0;

// flags
var editing = false;



//////////////////////////////
// DOM ELEMENTS
//////////////////////////////
dom = {};
dom.portfolioValue = $('#portfolio-value');
dom.search = $('#search');
dom.searchInput = $('#search-input');
dom.editButton = $('#edit-button');
dom.doneButton = $('#done-button');
dom.compareStocks = $('#compare-stocks');
dom.compareTable = $('#compare-table');
dom.suggestedStocks = $('#suggested-stocks');
dom.companyPage = $('#company-page');
dom.companyTicker = $('#company-ticker');
dom.companyName = $('#company-name');
dom.compareButton = $('#compare-button');
dom.companyBuyButton = $('#company-buy-button');
dom.buyPage = $('#buy-page');
dom.buyCompanyTicker = $('#buy-company-ticker');
dom.buyPrice = $('#buy-price');
dom.totalPrice = $('#total-price');
dom.cancelBuy = $('#cancel-buy');
dom.buyButton = $('#buy-button');


//////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////

// TODO currently unused
function formatDate(date) {
  var d = new Date(date),
      year = d.getFullYear(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return str = [year, month, day].join('-');
}

// load graph data
function getGraphData(section) {
  if (section == 'portfolio') {
    var tickers = data.getPortfolioTickers();
    var timeRange = portfolioTimeRange;
  } else {
    var tickers = data.getCompareTickers();
    var timeRange = compareTimeRange;
  }

  var plotData = {};
  var time = data.getTime(timeRange);

  for (var t in tickers) {
    var stockData = data.getStockData(tickers[t])[time.interval].slice(0, time.n);

    if (time.interval == 'min') {
      if (t == 0) {
        plotData['dates'] = stockData.map(x => x.map(y => Date.parse(y['date']))).reverse();
      }
      stockData = stockData.map(x => x.map(y => parseFloat(y['close']))).reverse();
    } else {
      if (t == 0) {
        plotData['dates'] = stockData.map(x => Date.parse(x['date'])).reverse();
      }
      stockData = stockData.map(x => parseFloat(x['close'])).reverse();
    }

    plotData[tickers[t]] = stockData;
  }

  return plotData;
}

// creates click event listener for check mark buttons
function createCheckClickListener(ticker, location) {
  var tickerString = ticker.replace('.', '\\.');

  if (location == 'compare') {
    createCompareItem(dom, ticker, COLORS[currentColor]);
    createCompareTableRow(dom, ticker, compareTimeRange);
    currentColor += 1;
    if (currentColor == COLORS.length) {
      currentColor = 0;
    }

    $(`#${tickerString}-item, #${tickerString}-table`).click(function() {
      loadCompanyPage(ticker);
    });

    $(`#${tickerString}-remove`).click(function() {
      data.removeCompareStock(ticker);
      $(`#${tickerString}-item`).remove();
      $(`#${tickerString}-compare-row`).remove();
    });
  } else if (location == 'suggested') {
    createCompareItem(dom, ticker, '', true);

    $(`#${tickerString}-item`).click(function() {
      loadCompanyPage(ticker);
    });
  }

  if (location == 'button') {
    var element = dom.compareButton;
    element.off('click');
  } else {
    var element = $(`#${tickerString}-check-${location}`);
  }

  element.click(function(e) {
    $(this).blur();
    e.stopPropagation();

    data.toggleCompareChecked(ticker);
    $(`[id^='${tickerString}-check']`).each(function(i, value) {
      $(value).children('i').first().toggleClass('check');
    });
    $(`#${tickerString}-compare-row`).toggleClass('hide');

    if (data.getSuggestedTickers().includes(ticker)) {
      data.removeSuggestedStock(ticker);
      $(`#${tickerString}-item`).remove();
    }
    
    if (location != 'compare' && !data.getCompareTickers().includes(ticker)) {
      data.addToCompareStocks(ticker);
      createCheckClickListener(ticker, 'compare')
    }

    if (location == 'search') {
      dom.searchInput.focus();
    } else if (location == 'company' || location == 'button') {
      dom.compareButton.toggleClass('positive');
      $(`#${tickerString}-check-company`).toggleClass('positive');
    }
  });
}

// populates company page content
function loadCompanyPage(ticker) {
  dom.companyTicker.text(ticker);
  dom.companyName.text(data.getCompany(ticker));
  dom.compareButton.children().first().replaceWith(createCheckButton(ticker, 'company'));
  if (data.getCompareChecked(ticker)) {
    dom.compareButton.addClass('positive');
  } else {
    dom.compareButton.removeClass('positive');
  }

  dom.companyPage
    .modal({
      autofocus: false,
      allowMultiple: false,
    })
    .modal('attach events', dom.cancelBuy)
    .modal('show');
  createCheckClickListener(ticker, 'company');
  createCheckClickListener(ticker, 'button');

  dom.buyPage
    .modal({
      autofocus: false,
      allowMultiple: false,
    })
    .modal('attach events', dom.companyBuyButton)

  dom.companyBuyButton.click(function() {
    dom.buyCompanyTicker.text(ticker);
    var price = data.getPrice(ticker);
    dom.buyPrice.text(price);
    dom.totalPrice.text((0 * price).toFixed(2));
  });
}


//////////////////////////////
// Load page content
//////////////////////////////

// portfolio value
dom.portfolioValue.text(data.getPortfolioValue());

// search bar data
dom.search.search({
  source: data.getSearchContent(),
  searchFields: [
    'title',
    'description'
  ],
  fullTextSearch: false,
  onSelect: function(result, response) {
    var ticker = result.title;
    loadCompanyPage(ticker);
  },
  onSearchQuery: function() {
    var results = $('.results').children();
    if (!results.first().hasClass('empty')) {
      results.first().addClass('active');
      results.each(function(i, value) {
        var content = $(value).children().first();
        var searchContent = content.children().wrapAll('<div class="middle inline"></div>');
        var ticker = searchContent.first().text();
        content.prepend(createCheckButton(ticker, 'search'));
        createCheckClickListener(ticker, 'search');
      });
    }
  }
});

// compare stocks
data.getCompareTickers().map(x => createCheckClickListener(x, 'compare'));
data.getSuggestedTickers().map(x => createCheckClickListener(x, 'suggested'));


//////////////////////////////
// UI
//////////////////////////////

// edit button
dom.editButton.click(function(e) {
  e.stopPropagation();
  editing = true;
  dom.editButton.addClass('hide');
  dom.doneButton.removeClass('hide');
  $('.close').each(function(i, value) {
    $(value).removeClass('hide');
  });
});

// done button
dom.doneButton.click(function() {
  editing = false;
  dom.editButton.removeClass('hide');
  dom.doneButton.addClass('hide');
  $('.close').each(function(i, value) {
    $(value).addClass('hide');
  });
});

// done editing if click anything
$(document).click(function(e) {
  if (editing && !$(e.target).hasClass('close')) {
    dom.doneButton.click();
  }
});

// time range selectors
$('.selector>.item').click(function(e) {
  var timeRangeElement = $(e.target);

  // remove 'active' class from other time range menu items
  timeRangeElement.siblings().removeClass('active');
  timeRangeElement.addClass('active');

  var timeRange = timeRangeElement.text();
  var section = timeRangeElement.parent().attr('id').split('-')[0];
  if (section == 'portfolio') {
    portfolioTimeRange = timeRange;
    portfolioGraphData = getGraphData('portfolio');
  } else if (section == 'compare') {
    compareTimeRange = timeRange;
    compareGraphData = getGraphData('compare');
    $('[id$="-compare-change"]').each(function(i, value) {
      var element = $(value);
      var ticker = element.attr('id').split('-')[0];
      var change = data.getChange(ticker, compareTimeRange);
      element.text(change);
      element.siblings().removeClass('up down').addClass(change >= 0 ? 'up' : 'down');
      element.parent().removeClass('green red').addClass(change >= 0 ? 'green' : 'red');
    });
  }
});
