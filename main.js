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
$('.ui.search').search({ source: SEARCH_CONTENT });

// compare stocks
var compareTickers = getCompareTickers();
for (var i in compareTickers) {
  var ticker = compareTickers[i];
  var isChecked = getCompareChecked(ticker);

  // company item
  var checkedClass = isChecked ? 'check ' : '';
  var stockTile = '<div id="' + ticker + '-item" class="item">\
                    <button type="button" class="mini circular ui icon button compare-check-button">\
                      <i class="' + checkedClass + 'icon"></i>\
                    </button>\
                    <a>' + ticker.toUpperCase() + '</a>\
                  </div>';
  $('#compare-stocks').append(stockTile);
   
  // company table row
  var data = getData(ticker);
  var pe_ratio = data['pe_ratio'];
  var mkt_cap = data['mkt_cap'];
  var hideClass = isChecked ? '' : 'hide';
  var stockTableRow = '<tr id="' + ticker + '-compare-row" class="' + hideClass + '">\
                        <td>' + ticker.toUpperCase() + '</td>\
                        <td class="right aligned">$1000</td>\
                        <td class="right aligned">2.5%</td>\
                        <td class="right aligned">' + mkt_cap + '</td>\
                        <td class="right aligned">' + pe_ratio + '</td>\
                      </tr>';
  $('#compare-table>tbody').append(stockTableRow);
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

// show and hide from compare
$(".compare-check-button").each((index, button) => {
  $(button).click(() => {
    toggleCompareChecked($(button).parent().attr('id').split('-')[0]);
    $($(button).children('i')[0]).toggleClass('check');
    $(button).blur();
    $('#compare-table>tbody>#'+ticker).toggleClass('hidden-row');
  })
})
