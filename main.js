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

$('.ui.search').search({
    source: SEARCH_CONTENT
  })
;