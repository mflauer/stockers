// graph data
var portfolioGraphData = getGraphData(backend.getPortfolioTickers(), '1D'),
    compareGraphData = getGraphData(backend.getCompareTickers(), '1D');

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


//////////////////////////////
// DOM ELEMENTS
//////////////////////////////
dom = {};
dom.search = $('#search-input');
dom.compareStocks = $('#compare-stocks');
dom.compareTable = $('#compare-table');
dom.companyPage = $('#company-page');
dom.companyTicker = $('#company-ticker');
dom.companyName = $('#company-name');
dom.compareButton = $('#compare-button')


//////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////

function formatDate(date) {
  var d = new Date(date),
      year = d.getFullYear(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return str = [year, month, day].join('-');
}

function getGraphData(tickers, timeRange) {
  var plotData = {};
  var time = backend.getTime(timeRange);

  for (var t in tickers) {
    var data = backend.getData(tickers[t])[time.interval].slice(0, time.n);

    if (time.interval == 'min') {
      if (t == 0) {
        plotData['dates'] = data.map(x => x.map(y => Date.parse(y['date']))).reverse();
      }
      data = data.map(x => x.map(y => parseFloat(y['close']))).reverse();
    } else {
      if (t == 0) {
        plotData['dates'] = data.map(x => Date.parse(x['date'])).reverse();
      }
      data = data.map(x => parseFloat(x['close'])).reverse();
    }

    plotData[tickers[t]] = data;
  }

  return plotData;
}

function createCheckClickListener(ticker, location) {
  if (location == 'compare') {
    createCompareItem(dom, ticker, COLORS[currentColor]);
    createCompareTableRow(dom, ticker);
    currentColor += 1;
    if (currentColor == COLORS.length) {
      currentColor = 0;
    }

    $(`#${ticker}-item, #${ticker}-table`).click(function(e) {
      loadCompanyPage(ticker);
      return false;
    })
  }

  if (location == 'button') {
    var element = dom.compareButton;
    element.off('click');
  } else {
    var element = $(`#${ticker}-check-${location}`);
  }

  element.click(function(e) {
    $(this).blur();
    e.stopPropagation();

    backend.toggleCompareChecked(ticker);
    $(`[id^='${ticker}-check']`).each(function(i, value) {
      $(value).children('i').first().toggleClass('check');
    });
    $(`#${ticker}-compare-row`).toggleClass('hide');
    
    if (location != 'compare' && !backend.getCompareTickers().includes(ticker)) {
      backend.addToCompareStocks(ticker);
      createCheckClickListener(ticker, 'compare')
    }

    if (location == 'search') {
      dom.search.focus();
    }

    if (location == 'company' || location == 'button') {
      dom.compareButton.toggleClass('positive');
      $(`#${ticker}-check-company`).toggleClass('positive');
    }
  });
}

function loadCompanyPage(ticker) {
  createCompanyHeader(dom, ticker);
  dom.companyPage.modal('show');
  createCheckClickListener(ticker, 'company');
  createCheckClickListener(ticker, 'button');
}


//////////////////////////////
// Load page content
//////////////////////////////

// search bar data
$('#search').search({
  source: backend.getSearchContent(),
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
backend.getCompareTickers().map(x => createCheckClickListener(x, 'compare'));


//////////////////////////////
// UI
//////////////////////////////

// time range selectors
$('.selector>.item').click(function(e) {
  var timeRangeElement = $(e.target);

  // remove 'active' class from other time range menu items
  timeRangeElement.siblings().removeClass('active');
  timeRangeElement.addClass('active');

  var timeRange = timeRangeElement.text();
  var section = timeRangeElement.parent().attr('id').split('-')[0];
  if (section == 'portfolio') {
    portfolioGraphData = getGraphData('portfolio', timeRange);
  } else if (section == 'compare') {
    compareGraphData = getGraphData('compare', timeRange);
  }
});
