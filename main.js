// stock tickers
var portfolioTickers = backend.getPortfolioTickers(),
    compareTickers = backend.getCompareTickers()

// graph data
var portfolioGraphData = getGraphData(portfolioTickers, '1D'),
    compareGraphData = getGraphData(compareTickers, '1D');

// table data
var portfolioTableData, compareTableData;


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

function addCompareStock(ticker) {
  createCompareItem(ticker);
  createCompareTableRow(ticker);

  $(`#${ticker}-check`).click(function() {
    backend.toggleCompareChecked(ticker);
    $($(this).children('i')[0]).toggleClass('check');
    $(`#${ticker}-compare-row`).toggleClass('hide');
    $(this).blur();
  });
}


//////////////////////////////
// Load page content
//////////////////////////////

// search bar data
$('.ui.search').search({
  source: backend.getSearchContent(),
  searchFields: [
    'title',
    'description'
  ],
  fullTextSearch: false,
  onSelect: function(result, response) {
    var ticker = result.title;
    backend.addToCompareStocks(ticker);
    addCompareStock(ticker);
  }
});
$('.ui.search').search('set value', '');

// compare stocks
compareTickers.map(x => addCompareStock(x));


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
