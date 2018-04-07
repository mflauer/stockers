// graph start dates
var portfolioGraphData, compareGraphData;

// table start times
var portfolioTableDate, compareTableDate;


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
// example
// `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&outputsize=full&apikey=${API_KEY}`


var x,
    y;

var color = d3.scale.category10();


var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parse = d3.time.format("%b %Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(-height);

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(4)
    .orient("right");

var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.price); });

var line = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

var svg = d3.select("#compare-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);


  x.domain([data[0].date, data[data.length - 1].date]);
    y.domain([0, d3.max(data, function(d) { return d.price; })]).nice();

    svg
        .datum(data)
        .on("click", click);

    svg.append("path")
        .attr("class", "area")
        .attr("clip-path", "url(#clip)")
        .attr("d", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxis);

    svg.append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .attr("d", line);

    svg.append("text")
        .attr("x", width - 6)
        .attr("y", height - 6)
        .style("text-anchor", "end")
        .text(data[0].symbol);

    // On click, update the x-axis.
    function click() {
      var n = data.length - 1,
          i = Math.floor(Math.random() * n / 2),
          j = i + Math.floor(Math.random() * n / 2) + 1;
      x.domain([data[i].date, data[j].date]);
      var t = svg.transition().duration(750);
      t.select(".x.axis").call(xAxis);
      t.select(".area").attr("d", area);
      t.select(".line").attr("d", line);
    }
  });



//data is in compareGraphData

dates = CompareGraphData['dates'];
