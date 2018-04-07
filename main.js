// graph data
var portfolioGraphData = getGraphData(portfolioStocks, '1D'),
    compareGraphData = getGraphData(compareStocks, '1D');

// table start times
var portfolioTableDate, compareTableDate;



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
  var time = TIME_RANGE_INTERVAL[timeRange];

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
// UI
//////////////////////////////

$('.selector>.item').click(function(e) {
  var timeRangeElement = $(e.target);

  // remove 'active' class from other time range menu items
  timeRangeElement.siblings().removeClass('active');
  timeRangeElement.addClass('active');

  var timeRange = timeRangeElement.text();
  var section = timeRangeElement.parent().attr('id').split('-')[0];
  if (section == 'portfolio') {
    portfolioGraphData = getGraphData(portfolioStocks, timeRange);
  } else if (section == 'compare') {
    compareGraphData = getGraphData(compareStocks, timeRange);
  }
});
// example
// `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&outputsize=full&apikey=${API_KEY}`

//var color = d3.scale.category10();

var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);
/*
var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(-height);

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(4)
    .orient("left");

var area = d3.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.price); });
*/


var line = d3.line()
    .x(function(d, i) { return x(dates[i]); })
    .y(function(d,i) { return y(prices[i]); })
    .curve(d3.curveMonotoneX);

var svg = d3.select("#compare-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function getDates(array) {
  var date_list = [];
  for (var i=0; i < array.length; i++) {
    date_list.push(formatDate(i));
  }
  return date_list;
}

var dates = getDates(compareGraphData['dates'][0]);
var prices = compareGraphData['goog'][0];
console.log(prices);


  x.domain([dates[0], dates[dates.length - 1]]);
  y.domain([0, Math.max(prices)]);
  /*
  x.domain([dates, dates.length - 1]);
  y.domain([0, d3.max(prices, function(d) { return d.price; })]);
  */

    svg.append("text")
        .attr("x", width - 6)
        .attr("y", height - 6)
        .style("text-anchor", "end")
        .text("GOOG");

        // Add the X Axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%Y-%m-%d")))
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

    svg.append("path")
          .data(prices) // 10. Binds data to the line
          .attr("class", "line") // Assign a class for styling
          .attr("d", line);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));




//data is in compareGraphData

$('.ui.search').search({ source: SEARCH_CONTENT });
