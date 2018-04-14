// graph data
var portfolioGraphData = getGraphData(backend.getPortfolioTickers(), '1D'),
    compareGraphData = getGraphData(backend.getCompareTickers(), '1D');

// table data
var portfolioTableData, compareTableData;


//////////////////////////////
// DOM ELEMENTS
//////////////////////////////
dom = {};
dom.search = $('#search');


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
    createCompareItem(ticker);
    createCompareTableRow(ticker);
  }

  $(`#${ticker}-check-${location}`).click(function(e) {
    e.stopPropagation();
    backend.toggleCompareChecked(ticker);
    $(this).blur();
    $(`[id^='${ticker}-check']`).each(function(i, value) {
      $(value).children('i').first().toggleClass('check');
    });
    $(`#${ticker}-compare-row`).toggleClass('hide');
    
    if (location != 'compare' && !backend.getCompareTickers().includes(ticker)) {
      backend.addToCompareStocks(ticker);
      createCheckClickListener(ticker, 'compare')
    }
  });
}

function populateCompanyModal(ticker) {
  $('.ui.modal .header').prepend(ticker);
}


//////////////////////////////
// Load page content
//////////////////////////////

// search bar data
dom.search.search({
  source: backend.getSearchContent(),
  searchFields: [
    'title',
    'description'
  ],
  fullTextSearch: false,
  onSelect: function(result, response) {
    var ticker = result.title;
    populateCompanyModal(ticker);
    $('.ui.modal').modal('show');
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
