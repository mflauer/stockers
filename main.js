//////////////////////////////
// DOM ELEMENTS
//////////////////////////////
dom = {};

dom.valueGraphContainer = $('#value-graph-container');
dom.valueGraph = d3.select('#value-graph');
dom.growthGraphContainer = $('#growth-graph-container');
dom.growthGraph = d3.select('#growth-graph');
dom.compareGraphContainer = $('#compare-graph-container');
dom.compareGraph = d3.select('#compare-graph');
dom.companyGraphContainer = $('#company-graph-container');
dom.companyGraph = d3.select('#company-graph');

dom.portfolioValue = $('#portfolio-value');
dom.portfolioStocks = $('#portfolio-stocks');
dom.portfolioTable = $('#portfolio-table');

dom.search = $('#search');
dom.searchInput = $('#search-input');

dom.editButton = $('#edit-button');
dom.doneButton = $('#done-button');

dom.compareStocks = $('#compare-stocks');
dom.suggestedLabel = $('#suggested-label');
dom.suggestedStocks = $('#suggested-stocks');
dom.compareTable = $('#compare-table');

dom.companyPage = $('#company-page');
dom.compareButton = $('#compare-button');
dom.companyBuyButton = $('#company-buy-button');
dom.companySelector = $('#company-selector');
dom.companyTicker = $('#company-ticker');
dom.companyName = $('#company-name');
dom.companyPrice = $('#company-price');
dom.companyChange = $('#company-change');
dom.companyBlurb = $('#blurb');
dom.companyCEO = $('#ceo');
dom.companyFounded = $('#founded');
dom.companyHeadquarters = $('#headquarters');
dom.companyStart = $('#start');
dom.companyHigh = $('#high');
dom.companyLow = $('#low');
dom.companyMktCap = $('#mkt-cap');
dom.companyPERatio = $('#pe-ratio');
dom.companyDivYield = $('#div-yield');

dom.buyPage = $('#buy-page');
dom.buyCompanyTicker = $('#buy-company-ticker');
dom.buyShares = $('#buy-shares');
dom.buyPrice = $('#buy-price');
dom.totalPrice = $('#total-price');
dom.cancelBuy = $('#cancel-buy');
dom.buyButton = $('#buy-button');


//////////////////////////////
// GLOBAL VARIABLES
//////////////////////////////

// constants
const INIT_TIME_RANGE = '1D';

// graph axes;
var valueX = d3.scaleTime().range([0, dom.valueGraphContainer.width()]),
    valueY = d3.scaleLinear().range([dom.valueGraphContainer.height(), 0]),
    growthX = d3.scaleTime().range([0, dom.growthGraphContainer.width()]),
    growthY = d3.scaleLinear().range([dom.growthGraphContainer.height(), 0]),
    compareX = d3.scaleTime().range([0, dom.compareGraphContainer.width()]),
    compareY = d3.scaleLinear().range([dom.compareGraphContainer.height(), 0]),
    companyX, companyY;

// graph data
var portfolioTimeRange = compareTimeRange = companyTimeRange = INIT_TIME_RANGE,
    portfolioGraphData = getGraphData('portfolio'),
    compareGraphData = getGraphData('compare'),
    companyTicker, companyGraphData;

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
var portfolioColor = 0;
var compareColor = 0;

// flags
var editing = false;


//////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////

// formats date
function formatDate(date) {
  var d = new Date(date),
      year = d.getFullYear(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      time = '' + d.getTime();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return str = [year, month, day, time].join('-');
}

// load graph data
function getGraphData(section, percentage=false) {
  if (section == 'portfolio') {
    var tickers = data.getPortfolioTickers();
    var timeRange = portfolioTimeRange;
    var xAxis = valueX;
    var yAxis = valueY;
  } else if (section == 'compare') {
    var tickers = data.getCompareTickers();
    var timeRange = compareTimeRange;
    var xAxis = compareX;
    var yAxis = compareY;
  } else if (section == 'company') {
    var tickers = [companyTicker];
    var timeRange = companyTimeRange;
    var xAxis = companyX;
    var yAxis = companyY;
  }

  var plotData = {};
  var time = data.getTime(timeRange);
  var close = time.interval == 'min' ? 'close' : 'adjusted close'
  var min = Infinity;
  var max = -Infinity;

  for (var t in tickers) {
    var stockData = data.getStockData(tickers[t])[time.interval].slice(0, time.n);
    
    if (t == 0) {
      var dates = stockData.map(x => Date.parse(x['date'])).reverse();
      plotData['dates'] = dates;
    }
    
    if (tickers.length > 1 || percentage) {
      var first = parseFloat(stockData.slice(-1)[0][close]);
      var tickerData = stockData.map(x => 100 * ((parseFloat(x[close]) / first) - 1)).reverse();
    } else {
      var tickerData = stockData.map(x => parseFloat(x[close])).reverse();
    }

    var dataMin = Math.min(...tickerData);
    var dataMax = Math.max(...tickerData);
    min = dataMin < min ? dataMin : min;
    max = dataMax > max ? dataMax : max;

    plotData[tickers[t]] = tickerData;
  }

  xAxis.domain([0, dates.length - 1]);
  yAxis.domain([min, max]);

  return plotData;
}

// plot graph
function plotStock(section, ticker, color) {
  if (section == 'portfolio') {
    var plotData = portfolioGraphData;
    var xAxis = portfolioX;
    var yAxis = portfolioY;
  } else if (section == 'compare') {
    var element = dom.compareGraph;
    var plotData = compareGraphData;
    var xAxis = compareX;
    var yAxis = compareY;
  } else if (section == 'company') {
    var element = dom.companyGraph;
    var plotData = companyGraphData;
    var xAxis = companyX;
    var yAxis = companyY;
  }

  element.selectAll('*').remove();

  var tickerData = plotData[ticker];
  var openLine = d3.line()
    .x(function(d, i) { return xAxis(i); })
    .y(function(d) { return yAxis(tickerData[0]); });
  var tickerLine = d3.line()
    .x(function(d, i) { return xAxis(i); })
    .y(function(d) { return yAxis(d); });

  element.append('path')
    .attr('class', 'thin')
    .attr('d', openLine(tickerData));
  element.append('path')
    .attr('class', color)
    .attr('d', tickerLine(tickerData));
}

// get change value
function getChange(change) {
  if (change > 0 || change < 0) {
    return change.withCommas() + '%';
  } else {
    return change;
  }
}

// get arrow direction for change value
function getArrow(change) {
  if (change > 0) {
    return 'up';
  } else if (change < 0) {
    return 'down'
  } else {
    return '';
  }
}

// get color for change value
function getColor(change) {
  if (change > 0) {
    return 'green';
  } else if (change < 0) {
    return 'red'
  } else {
    return '';
  }
}

// click event to load company page
function createCompanyClickListener(element, ticker) {
  element.click(function() { loadCompanyPage(ticker) });
}

// creates click event listener for check mark buttons
function createCheckClickListener(ticker, location) {
  var tickerString = ticker.replace('.', '\\.').replace('^', '\\^');

  if (location == 'portfolio') {
    var color = COLORS[portfolioColor];
    createCompareItem(dom, ticker, location, color);
    // plotStock(location, ticker, color);
    portfolioColor += 1;
    if (portfolioColor == COLORS.length) {
      portfolioColor = 0;
    }

    createPortfolioTableRow(dom, ticker, portfolioTimeRange);
    createCompanyClickListener($(`#${tickerString}-portfolio-table`), ticker);
  } else if (location == 'compare') {
    var color = COLORS[compareColor];
    createCompareItem(dom, ticker, location, color);
    // plotStock(location, ticker, color);
    compareColor += 1;
    if (compareColor == COLORS.length) {
      compareColor = 0;
    }

    createCompareTableRow(dom, ticker, compareTimeRange);
    createCompanyClickListener($(`#${tickerString}-compare-table`), ticker);

    $(`#${tickerString}-remove`).click(function() {
      data.removeCompareStock(ticker);
      $(`#${tickerString}-compare-item`).remove();
      $(`#${tickerString}-compare-row`).remove();
    });
  } else if (location == 'suggested') {
    createCompareItem(dom, ticker, location);
  }

  createCompanyClickListener($(`#${tickerString}-${location}-item`), ticker);

  if (location == 'button') {
    var element = dom.compareButton;
    element.off('click');
  } else {
    var element = $(`#${tickerString}-check-${location}`);
  }

  element.click(function(e) {
    $(this).blur();
    e.stopPropagation();

    data.toggleCompareChecked(ticker);
    $(`[id^='${tickerString}-check']`).each(function(i, value) {
      $(value).children('i').first().toggleClass('check');
    });
    $(`#${tickerString}-compare-row`).toggleClass('hide');

    if (data.getSuggestedTickers().includes(ticker)) {
      data.removeSuggestedStock(ticker);
      $(`#${tickerString}-suggested-item`).remove();
      if (data.getSuggestedTickers() == 0) {
        dom.suggestedLabel.addClass('hide');
      }
    }

    if (location != 'compare' && !data.getCompareTickers().includes(ticker)) {
      data.addToCompareStocks(ticker);
      createCheckClickListener(ticker, 'compare')
    }

    if (location == 'search') {
      dom.searchInput.focus();
    } else if (location == 'company' || location == 'button') {
      dom.compareButton.toggleClass('positive');
      $(`#${tickerString}-check-company`).toggleClass('positive');
    }

    compareGraphData = getGraphData('compare'); 
  });
}

// populates company page content
function loadCompanyPage(ticker) {
  companyTicker = ticker;
  companyTimeRange = '1D';
  dom.companySelector.children().each(function(i, value) {
    $(value).removeClass('active');
  });
  dom.companySelector.children().first().addClass('active');

  dom.companyPage.modal('show');
  
  if (companyX == undefined) {
    companyX = d3.scaleTime().range([0, dom.companyGraphContainer.width()]);
  }
  if (companyY == undefined) {
    companyY = d3.scaleLinear().range([dom.companyGraphContainer.height(), 0]);
  }
  companyGraphData = getGraphData('company');
  var change = data.getChange(ticker, companyTimeRange);
  plotStock('company', ticker, change < 0 ? 'red' : 'green');

  dom.companyTicker.text(ticker);
  dom.companyName.text(data.getCompany(ticker));
  dom.compareButton.children().first().replaceWith(createCheckButton(ticker, 'company'));
  if (data.getCompareChecked(ticker)) {
    dom.compareButton.addClass('positive');
  } else {
    dom.compareButton.removeClass('positive');
  }

  createCheckClickListener(ticker, 'company');
  createCheckClickListener(ticker, 'button');

  dom.companyPrice.text(data.getPrice(ticker).withCommas());
  dom.companyChange.text(getChange(change));
  dom.companyChange.siblings().removeClass('up down').addClass(getArrow(change));
  dom.companyChange.parent().removeClass('green red').addClass(getColor(change));

  dom.companyBlurb.text(data.getBlurb(ticker));
  dom.companyCEO.text(data.getCEO(ticker));
  dom.companyFounded.text(data.getFounded(ticker));
  dom.companyHeadquarters.text(data.getHeadquarters(ticker));
  var stats = data.getStats(ticker, companyTimeRange);
  dom.companyStart.text(stats.open.withCommas());
  dom.companyHigh.text(stats.high.withCommas());
  dom.companyLow.text(stats.low.withCommas());
  dom.companyMktCap.text(data.getMktCap(ticker));
  dom.companyPERatio.text(data.getPERatio(ticker).withCommas());
  dom.companyDivYield.text(data.getDivYield(ticker).withCommas());
}


// update portfolio row
function updatePortfolioRow(ticker, timeRange, hoverRange) {
  $(`#${ticker}-portfolio-value`).text(data.getPortfolioValue(ticker, hoverRange).withCommas());
  $(`#${ticker}-portfolio-percent`).text(data.getPortfolioPercent(ticker, hoverRange).withCommas());
  var element = $(`#${ticker}-portfolio-change`);
  var change = data.getPortfolioChange(ticker, timeRange);

  element.text(getChange(change));
  element.siblings().removeClass('up down').addClass(getArrow(change));
  element.parent().removeClass('green red').addClass(getColor(change));
}

// update compare row
function updateCompareRow(ticker, timeRange, hoverRange) {
  $(`#${ticker}-compare-price`).text(data.getPrice(ticker, hoverRange).withCommas());
  var element = $(`#${ticker}-compare-change`);
  var change = data.getChange(ticker, timeRange);

  element.text(getChange(change));
  element.siblings().removeClass('up down').addClass(getArrow(change));
  element.parent().removeClass('green red').addClass(getColor(change));
}

// update company page
function updateCompanyPage(ticker, timeRange, hoverRange) {
  dom.companyPrice.text(data.getPrice(ticker, hoverRange).withCommas());
  
  var change = data.getChange(ticker, timeRange);
  plotStock('company', ticker, change < 0 ? 'red' : 'green');
  dom.companyChange.text(getChange(change));
  dom.companyChange.siblings().removeClass('up down').addClass(getArrow(change));
  dom.companyChange.parent().removeClass('green red').addClass(getColor(change));
  
  var stats = data.getStats(ticker, timeRange);
  dom.companyStart.text(stats.open.withCommas(timeRange));
  dom.companyHigh.text(stats.high.withCommas(timeRange));
  dom.companyLow.text(stats.low.withCommas(timeRange));
}


//////////////////////////////
// Load page content
//////////////////////////////

// portfolio value
dom.portfolioValue.text(data.getPortfolioValue().withCommas());

// portfolio stocks
data.getPortfolioTickers().map(x => createCheckClickListener(x, 'portfolio'));

// search bar data
dom.search.search({
  source: data.getSearchContent(),
  searchFields: [
    'title',
    'description'
  ],
  fullTextSearch: false,
  onSelect: function(result, response) {
    loadCompanyPage(result.title);
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
data.getCompareTickers().map(x => createCheckClickListener(x, 'compare'));
data.getSuggestedTickers().map(x => createCheckClickListener(x, 'suggested'));


//////////////////////////////
// UI
//////////////////////////////

// edit button
dom.editButton.click(function(e) {
  e.stopPropagation();
  editing = true;
  dom.editButton.addClass('hide');
  dom.doneButton.removeClass('hide');
  $('.close').each(function(i, value) {
    $(value).removeClass('hide');
  });
});

// done button
dom.doneButton.click(function() {
  editing = false;
  dom.editButton.removeClass('hide');
  dom.doneButton.addClass('hide');
  $('.close').each(function(i, value) {
    $(value).addClass('hide');
  });
});

// done editing if click anything
$(document).click(function(e) {
  if (editing && !$(e.target).hasClass('close')) {
    dom.doneButton.click();
  }
});

// time range selectors
$('.selector>.item').click(function(e) {
  var timeRangeElement = $(e.target);

  // remove 'active' class from other time range menu items
  timeRangeElement.siblings().removeClass('active');
  timeRangeElement.addClass('active');

  var timeRange = timeRangeElement.text();
  var section = timeRangeElement.parent().attr('id').split('-')[0];
  if (section == 'portfolio') {
    portfolioTimeRange = timeRange;
    portfolioGraphData = getGraphData('portfolio');

    data.getPortfolioTickers().map(x => updatePortfolioRow(x, portfolioTimeRange));
  } else if (section == 'compare') {
    compareTimeRange = timeRange;
    compareGraphData = getGraphData('compare');

    data.getCompareTickers().map(x => updateCompareRow(x, compareTimeRange));
  } else if (section == 'company') {
    companyTimeRange = timeRange;
    companyGraphData = getGraphData('company');

    updateCompanyPage(companyTicker, companyTimeRange);
  }
});

// company page
dom.companyPage
  .modal({
    autofocus: false,
    allowMultiple: false,
  })
  .modal('attach events', dom.cancelBuy);

// buy page
dom.buyPage
  .modal({
    autofocus: false,
    allowMultiple: false,
  })
  .modal('attach events', dom.companyBuyButton);

// load buy page
dom.companyBuyButton.click(function() {
  dom.buyShares.val('');
  dom.buyCompanyTicker.text(companyTicker);
  var price = data.getPrice(companyTicker).withCommas();
  dom.buyPrice.text(price);
  dom.totalPrice.text('0.00');
});

// input shares to buy
dom.buyShares.on('input', function(e) {
  dom.buyShares.val(dom.buyShares.val().replace(/\D/g,''));
  dom.totalPrice.text((data.getPrice(companyTicker) * dom.buyShares.val()).withCommas());
});

// select input on focus
dom.buyShares.focus(function() {
  dom.buyShares.select();
});

// buy stock
dom.buyButton.click(function() {
  var newStock = data.buyStock(companyTicker, parseInt(dom.buyShares.val()));
  dom.portfolioValue.text(data.getPortfolioValue().withCommas());
  if (newStock) {
    createCheckClickListener(companyTicker, 'portfolio');
  } else {
    updatePortfolioRow(companyTicker, portfolioTimeRange);
  }
  dom.companyPage.modal('show');
});


/////////////////
// GRAPH STUFF
/////////////////

// //var color = d3.scale.category10();

// //compare graph
// //1d and 5d = in every 5 mins

// function getDates(array) {
//   var date_list = [];
//   for (var i=0; i < array.length; i++) {
//     date_list.push(formatDate(i));
//   }
//   return date_list;
// }


// var dates = getDates(compareGraphData['dates'][0]);
// var pricesGOOG = compareGraphData['GOOG'];
// var pricesAAPL = compareGraphData['AAPL'];

// var margin = {top: 40, right: 40, bottom: 40, left: 40},
//     width = 500 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// var n = pricesGOOG[0].length;
// /*
// console.log(pricesGOOG[0].length);
// console.log(compareGraphData);
// console.log(n);
// console.log(pricesAAPL[0]);
// console.log(dates);
// console.log(Math.max.apply(Math, pricesAAPL[0]));
// */

// function mapData(arrayP) {
//   price_map = [];
//   for (var i=0; i < n; i++) {
//     price_map.push({ "y" : arrayP[i]});
//   }
//   return price_map;
// }

// var price_data_GOOG = mapData(pricesGOOG[0]);
// var price_data_AAPL = mapData(pricesAAPL[0])


// //dummy dataset
// var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })
// console.log(dataset);

// var x = d3.scaleTime()
//     .domain([0, n-1])
//     .range([0, width]);

// var y = d3.scaleLinear()
//     .domain([Math.min.apply(Math, pricesGOOG[0]), Math.max.apply(Math, pricesGOOG[0])])
//     .range([height, 0]);

// var lineGOOG = d3.line()
//     .x(function(d, i) { return x(i); })
//     .y(function(d) { return y(d.y); })
//     .curve(d3.curveLinear);

// var lineAAPL = d3.line()
//     .x(function(d, i) { return x(i); })
//     .y(function(d) { return y(d.y); })
//     .curve(d3.curveLinear);


// var compare = d3.select("#compare-graph").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//         // Add the X Axis
// compare.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x)
//             .tickFormat(d3.timeFormat("%m-%d")))


// compare.append("g")
//     .attr("class", "y axis")
//     .call(d3.axisLeft(y));

// compare.append("path")
//     .datum(price_data_GOOG) // 10. Binds data to the line
//     .attr("class", "line") // Assign a class for styling
//     .attr("d", lineGOOG);

// /*compare.append("path")
//         .datum(price_data_AAPL) // 10. Binds data to the line
//         .attr("class", "line") // Assign a class for styling
//         .attr("d", lineAAPL);
// */
// //change timescale of data
// function changeTime() {
//   //get data again
//   console.log(compareGraphData);
//   var dates = getDates(compareGraphData['dates'][1]);
//   var pricesGOOG = compareGraphData['GOOG'];
//   var pricesAAPL = compareGraphData['AAPL'];
//   console.log(dates);
//   console.log(pricesGOOG);
//   console.log(pricesGOOG[0]);
//   console.log(pricesGOOG[1]);
//   console.log(pricesGOOG[2]);


//   var compare = d3.select('#compare-graph').transition();

//     compare.select(".lineGOOG") //change the line
//             .duration(500)
//             .attr("d", lineGOOG);
//     compare.select(".x.axis")
//             .duration(500)
//             .call(x);
//     compare.select(".y.axis")
//             .duration(500)
//             .call(y);


// }

// //add company data to graph
// function addStock() {

// }
// //remove company data from graph
// function removeStock() {

// }
// //add hover!!
// //https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73

// //growth graph
// // https://bl.ocks.org/mbostock/c69f5960c6b1a95b6f78

// var x = d3.scaleTime()
//     .domain([0, 20])
//     .range([0, width]);

// var y = d3.scaleLinear()
//     .domain([0,1])
//     .range([height, 0]);

// var line = d3.line()
//     .x(function(d, i) { return x(i); })
//     .y(function(d) { return y(d.y); })
//     .curve(d3.curveLinear);

// var growth = d3.select("#growth").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//         // Add the X Axis
// growth.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x)
//             .tickFormat(d3.timeFormat("%m-%d")))

//       // Add the Y Axis

// growth.append("g")
//     .attr("class", "y axis")
//     .call(d3.axisLeft(y));
// growth.append("path")
//     .datum(dataset) // 10. Binds data to the line
//     .attr("class", "line") // Assign a class for styling
//     .attr("d", line);


// //volume graph

// var x = d3.scaleTime()
//     .domain([0, 20])
//     .range([0, width]);

// var y = d3.scaleLinear()
//     .domain([0,1])
//     .range([height, 0]);

// var line = d3.line()
//     .x(function(d, i) { return x(i); })
//     .y(function(d) { return y(d.y); })
//     .curve(d3.curveLinear);

// var stack = d3.stack();

// var divVolume = d3.select('#volume').append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);

// var volume = d3.select("#volume").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//         // Add the X Axis
// volume.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x)
//             .tickFormat(d3.timeFormat("%m-%d")))

//       // Add the Y Axis

// volume.selectAll("dot")
//    .data(dataset)
//  .enter().append("circle")
//    .attr("r", 2)
//    .attr("cx", function(d, i) { return x(i); })
//    .attr("cy", function(d) { return y(d.y); })
//    .attr("color", "grey")
//    .on("mouseover", function(d) {
//      divVolume.transition()
//        .duration(200)
//        .style("opacity", .9);
//      divVolume.html("Date" + "<br/>" + "Price")
//        .style("left", (d3.event.pageX - 180) + "px")
//        .style("top", (d3.event.pageY - 155) + "px");
//      })
//    .on("mouseout", function(d) {
//      divVolume.transition()
//        .duration(500)
//        .style("opacity", 0);
//      });

// volume.append("g")
//     .attr("class", "y axis")
//     .call(d3.axisLeft(y));
// volume.append("path")
//     .datum(dataset) // 10. Binds data to the line
//     .attr("class", "line") // Assign a class for styling
//     .attr("d", line);

// //data is in compareGraphData

