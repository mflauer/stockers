// graph data
var portfolioGraphData, compareGraphData;

// table data
var portfolioTableData, compareTableData;

$('.selector>.item').click(function(e) {
  var timeRangeElement = $(e.target);

  // remove 'active' class from other time range menu items
  timeRangeElement.siblings().removeClass('active');
  timeRangeElement.addClass('active');

  var timeRange = timeRangeElement.text();
  var section = timeRangeElement.parent().attr('id').split('-')[0];
  if (section == 'portfolio') {
    portfolioGraphData = getData(portfolioStocks, timeRange);
  } else if (section == 'compare') {
    compareGraphData = getData(compareStocks, timeRange);
  }
});

// add the values you can search for to the search bar
$('.ui.search').search({
    source: SEARCH_CONTENT
  })
;


for (var stockObject in compareStocks) {
  var tileLabel = stockObject.ticker.toUpperCase();
  var checkedClass = stockObject.isChecked ? ' checked' : '';
  var stockTile = '<div class="item container">\
                  <button type="button" class="mini circular ui icon button ">\
                    <i class="check icon' + checkedClass + '"></i>\
                  </button>\
                  <a>' + stockObject.ticker + '</a>\
                </div>'
  $('#compare-stocks').append(stockTile)
}
