// graph data
var portfolioGraphData = getGraphData(getPortfolioTickers(), '1D'),
    compareGraphData = getGraphData(getCompareTickers(), '1D');

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
  var time = getTime(timeRange);

  for (var t in tickers) {
    var data = getData(tickers[t])[time.interval].slice(0, time.n);

    if (time.interval == 'min') {
      if (t == 0) {
        plotData["dates"] = data.map(x => x.map(y => Date.parse(y['date']))).reverse();
      }
      data = data.map(x => x.map(y => parseFloat(y['close']))).reverse();
    } else {
      if (t == 0) {
        plotData["dates"] = data.map(x => Date.parse(x['date'])).reverse();
      }
      data = data.map(x => parseFloat(x['close'])).reverse();
    }

    plotData[tickers[t]] = data;
  }

  return plotData;
}


//////////////////////////////
// Load page content
//////////////////////////////

// search bar data
$('.ui.search').search({
  source: getSearchContent(),
  searchFields: [
    'title',
    'description'
  ],
  fullTextSearch: false
});

// compare stocks
var compareTickers = getCompareTickers();
for (var i in compareTickers) {
  var ticker = compareTickers[i];
  var isChecked = getCompareChecked(ticker);

  // company item
  $('#compare-stocks').append(createStockItem(ticker, isChecked));
   
  // company table row
  var data = getData(ticker);
  var price = '$1000.00';
  var change = '2.5%';
  var pe_ratio = data['pe_ratio'];
  var mkt_cap = data['mkt_cap'];
  $('#compare-table').append(createTableRow(ticker, !isChecked, price, change, mkt_cap, pe_ratio));
}


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
    portfolioGraphData = getGraphData(getPortfolioTickers(), timeRange);
  } else if (section == 'compare') {
    compareGraphData = getGraphData(getCompareTickers(), timeRange);
  }
});

// show and hide from compareTickers
$(".compare-check-button").click(function() {
  var ticker = $(this).parent().attr('id').split('-')[0];
  toggleCompareChecked(ticker);
  $($(this).children('i')[0]).toggleClass('check');
  $(`#${ticker}-compare-row`).toggleClass('hide');
  $(this).blur();
});
