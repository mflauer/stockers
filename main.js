// graph data
var portfolioGraphData = getGraphData(backend.getPortfolioTickers(), '1D'),
    compareGraphData = getGraphData(backend.getCompareTickers(), '1D');

// table start times
var portfolioTableDate, compareTableDate;



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
// example
// `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&outputsize=full&apikey=${API_KEY}`

//var color = d3.scale.category10();

//compare graph

function getDates(array) {
  var date_list = [];
  for (var i=0; i < array.length; i++) {
    date_list.push(formatDate(i));
  }
  return date_list;
}



var dates = getDates(compareGraphData['dates']);
var prices = compareGraphData['GOOG'];

var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var n = prices[0].length;

console.log(dates);
console.log(prices[0].length);
console.log(compareGraphData);
console.log(n);
console.log(prices[n-1][0]);
console.log(dates[n-1]);
console.log(prices[0]);

function mapData(arrayP, arrayD) {
  var n = arrayP.length;

}

var dataset = d3.range(20).map(function(d) { return {"y": d3.randomUniform(1)() } })
console.log(dataset);

var x = d3.scaleTime()
    .domain([0, 20])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0,1])
    .range([height, 0]);

var line = d3.line()
    .x(function(d, i) { return x(i); })
    .y(function(d) { return y(d.y); })
    .curve(d3.curveMonotoneX);

var compare = d3.select("#compare-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // Add the X Axis
compare.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%m-%d")))

      // Add the Y Axis

compare.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));

compare.append("path")
    .datum(dataset) // 10. Binds data to the line
    .attr("class", "line") // Assign a class for styling
    .attr("d", line);


//growth graph

var x = d3.scaleTime()
    .domain([0, 20])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0,1])
    .range([height, 0]);

var line = d3.line()
    .x(function(d, i) { return x(i); })
    .y(function(d) { return y(d.y); })
    .curve(d3.curveMonotoneX);

var growth = d3.select("#growth").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // Add the X Axis
growth.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%m-%d")))

      // Add the Y Axis

growth.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));
growth.append("path")
    .datum(dataset) // 10. Binds data to the line
    .attr("class", "line") // Assign a class for styling
    .attr("d", line);


//volume graph

var x = d3.scaleTime()
    .domain([0, 20])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0,1])
    .range([height, 0]);

var line = d3.line()
    .x(function(d, i) { return x(i); })
    .y(function(d) { return y(d.y); })
    .curve(d3.curveMonotoneX);

var stack = d3.stack();

var volume = d3.select("#volume").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // Add the X Axis
volume.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%m-%d")))

      // Add the Y Axis

volume.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));
volume.append("path")
    .datum(dataset) // 10. Binds data to the line
    .attr("class", "line") // Assign a class for styling
    .attr("d", line);





//data is in compareGraphData

$('.ui.search').search({ source: SEARCH_CONTENT });
