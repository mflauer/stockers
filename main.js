//////////////////////////////
// DOM ELEMENTS
//////////////////////////////
dom = {};

// login
dom.welcome = $('#welcome');
dom.user = $('#user');
dom.login = $('#login');

// graphs
dom.valueGraphContainer = $('#value-graph-container');
dom.valueBase = d3.select('#value-base');
dom.valueGraph = d3.select('#value-graph');
dom.valueHover = d3.select('#value-hover');
dom.growthGraphContainer = $('#growth-graph-container');
dom.growthBase = d3.select('#growth-base');
dom.growthGraph = d3.select('#growth-graph');
dom.growthHover = d3.select('#growth-hover');
dom.compareGraphContainer = $('#compare-graph-container');
dom.compareBase = d3.select('#compare-base');
dom.compareGraph = d3.select('#compare-graph');
dom.compareHover = d3.select('#compare-hover');
dom.companyGraphContainer = $('#company-graph-container');
dom.companyBase = d3.select('#company-base');
dom.companyGraph = d3.select('#company-graph');
dom.companyHover = d3.select('#company-hover');

// portfolio
dom.portfolioHidden = $('#portfolio-hidden');
dom.portfolioValue = $('#portfolio-value');
dom.portfolioStocks = $('#portfolio-stocks');
dom.portfolioTable = $('#portfolio-table');

// search
dom.search = $('#search');
dom.searchInput = $('#search-input');

// compare
dom.compareHidden = $('.compare-hidden');
dom.compareButtons = $('#compare-buttons');
dom.removeButton = $('#remove-button');
dom.doneButton = $('#done-button');
dom.compareStocks = $('#compare-stocks');
dom.suggestedLabel = $('#suggested-label');
dom.suggestedStocks = $('#suggested-stocks');
dom.compareTable = $('#compare-table');

// company
dom.companyPage = $('#company-page');
dom.compareButton = $('#compare-button');
dom.companyBuyButton = $('#company-buy-button');
dom.companySellButton = $('#company-sell-button');
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

// buy
dom.buyPage = $('#buy-page');
dom.buyCompanyTicker = $('#buy-company-ticker');
dom.buyShares = $('#buy-shares');
dom.buyPrice = $('#buy-price');
dom.totalPrice = $('#total-price');
dom.cancelBuy = $('#cancel-buy');
dom.buyButton = $('#buy-button');

// sell
dom.sellPage = $('#sell-page');
dom.sellCompanyTicker = $('#sell-company-ticker');
dom.sellShares = $('#sell-shares');
dom.sellPrice = $('#sell-price');
dom.totalSellPrice = $('#total-sell-price');
dom.cancelSell = $('#cancel-sell');
dom.sellButton = $('#sell-button');


//////////////////////////////
// GLOBAL VARIABLES
//////////////////////////////

// constants
const GRAPH_X_MARGIN = 20;
const GRAPH_Y_MARGIN = 3;
const LABEL_OFFSET = 4;
const HOVER_BAR_MARGIN = 1;
const HOVER_MARGIN = 1;
const FLIP_HOVER_DATE_THRESHOLD = 80;
const NUM_GRAPH_TICKS = 5;
const COLORS = [
  'blue',
  // 'red',
  // 'green',
  'pink',
  'yellow',
  'olive',
  'purple',
  'orange',
  'teal',
  'violet',
  'brown',
];

// graph data
var sectionTimeRanges = {
  portfolio : '1Y',
  compare : '1D',
  company : '1D'
};
var companyTicker;

// next color to use for section
var portfolioColor = 0;
var compareColor = 0;

// if compare companies is being removed
var removing = false;

// username of logged in user
var username;


//////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////

// get section of a graph
function getSection(graphName) {
  return (graphName == 'value' || graphName == 'growth') ? 'portfolio' : graphName;
}

// gets the date format for hover depending on interval
function getHoverDateFormat(interval) {
  if (interval == 'min') {
    return d3.timeFormat("%-I:%M %p, %b %-d");
  } else if (interval == 'day') {
    return d3.timeFormat("%b %-d");
  } else if (interval == 'week') {
    return d3.timeFormat("%b %-d, %Y");
  }
}

function getNumPointsPerTimeRange(timeRange, plotDataLength) {
    if (timeRange == '1D') {
      return 79;
    } else if (timeRange == '5D') {
      return 79 * 5/data.getTime(timeRange).period;
    } else {
      return plotDataLength
    }
}

// gets the date format for the axes label depending on timeRange
function getAxisDateFormat(timeRange) {
  if (timeRange == '1D') {
    return d3.timeFormat("%-I %p");
  } else if (timeRange == '5D' || timeRange == '1M') {
    return d3.timeFormat("%b %-d");
  } else if (timeRange == '3M' || timeRange == '6M') {
    return d3.timeFormat("%b");
  } else if (timeRange == '1Y') {
    return d3.timeFormat("%b %Y");
  } else if (timeRange == '5Y') {
    return d3.timeFormat("%Y");
  }
}

// load change plot for section
function getStackedPlotData() {
  var tickers = data.getPortfolioTickers();
  var timeRange = sectionTimeRanges.portfolio;

  var plotData = { 'tickers': [] };
  var time = data.getTime(timeRange);
  var close = time.interval == 'min' ? 'close' : 'adjusted close'
  var min = 0;
  var max = 0;
  var dates = [];
  var totals;

  for (var t in tickers) {
    var stockData = data.getPortfolioData(tickers[t])[time.interval].slice(0, time.n).filter(function(x, i) {
      return i % time.period == 0;
    });

    // populate dates
    if (dates.length == 0) {
      dates = stockData.map(function(x) {
        var d = new Date(x.date + "Z");
        return new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
      }).reverse();
      totals = Array(dates.length).fill(0);
    }

    var tickerData = stockData.map(x => parseFloat(x[close]))
    tickerData = tickerData.map(function(x, i) {
      if (x == 0 && i > 1 && tickerData[i - 1] == 0) {
        return null
      } else {
        totals[i] += x;
        return totals[i];
      }
    }).reverse();
    plotData.tickers[tickers[t]] = tickerData;

    var dataMax = Math.max(...tickerData);
    max = dataMax > max ? dataMax : max;
  }

  plotData.dates = dates;
  plotData.min = min;
  plotData.max = max;
  plotData.time = time;
  plotData.timeRange = timeRange;

  return plotData;
}

// load change plot for section
function getChangePlotData(graphName, scaleIndex) {
  if (graphName == 'value') {
    return getStackedPlotData();
  } else if (graphName == 'growth') {
    var f = 'getPortfolioData';
    var tickers = data.getPortfolioTickers();
  } else if (graphName == 'compare') {
    var f = 'getStockData';
    var tickers = data.getCompareTickers();
  } else if (graphName == 'company') {
    var f = 'getStockData';
    var tickers = [companyTicker];
  }

  var plotData = { 'tickers': {} };
  var timeRange = sectionTimeRanges[getSection(graphName)];
  var time = data.getTime(timeRange);
  var close = time.interval == 'min' ? 'close' : 'adjusted close'
  var min = Infinity;
  var max = -Infinity;
  var dates = [];

  for (var t in tickers) {
    var stockData = data[f](tickers[t])[time.interval].slice(0, time.n).filter(function(x, i) {
      return i % time.period == 0;
    });

    // populate dates
    if (dates.length == 0) {
      dates = stockData.map(function(x) {
        var d = new Date(x.date + "Z");
        return new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
      }).reverse();
    }

    // scale based on value of first item
    if (scaleIndex != undefined) {
      var index = time.n/time.period - scaleIndex - 1;
      var scale = parseFloat(stockData[index][close]);
    } else {
      var scale = parseFloat(stockData.slice(-1)[0][close]);
    }
    if (scale == 0) {
      // find first non-zero element
      var firstElement = stockData.slice().reverse().find(function(e) { return parseFloat(e[close]) > 0; });
      scale = firstElement ? firstElement[close] : firstElement;
    }

    var tickerData = stockData.map(function(x) {
      var value = parseFloat(x[close]);
      return value == 0 ? null : 100 * ((value / scale) - 1);
    }).reverse();
    plotData.tickers[tickers[t]] = tickerData;

    var changesRanges = (graphName != 'compare' || data.getCompareChecked(tickers[t]));
    var dataMin = Math.min(...tickerData);
    var dataMax = Math.max(...tickerData);
    min = (changesRanges && dataMin < min) ? dataMin : min;
    max = (changesRanges && dataMax > max) ? dataMax : max;
  }

  plotData.dates = dates;
  plotData.min = min;
  plotData.max = max;
  plotData.time = time;
  plotData.timeRange = timeRange;

  return plotData;
}

// add ticker stock to plot
// optionally force color of existing lines or clear the plot
function plotStock(graphName, ticker, tickerString, color, forceColor, scaleIndex, clear=false) {
  var plotData = getChangePlotData(graphName, scaleIndex);
  var drawArea = graphName == 'value';
  if (drawArea) {
    var base = dom.valueBase;
    var graph = dom.valueGraph;
    var hover = dom.valueHover;
    var container = dom.valueGraphContainer;
  } else if (graphName == 'growth') {
    var base = dom.growthBase;
    var graph = dom.growthGraph;
    var hover = dom.growthHover;
    var container = dom.growthGraphContainer;
  } else if (graphName == 'compare') {
    if (!data.getCompareChecked()) { return; }
    var base = dom.compareBase;
    var graph = dom.compareGraph;
    var hover = dom.compareHover;
    var container = dom.compareGraphContainer;
  } else if (graphName == 'company') {
    var base = dom.companyBase;
    var graph = dom.companyGraph;
    var hover = dom.companyHover;
    var container = dom.companyGraphContainer;
  }

  // rescale plots
  var numDataDates = plotData.dates.length - 1;
  var xScaleDomain = getNumPointsPerTimeRange(plotData['timeRange'], numDataDates);
  var xScale = d3.scaleLinear()
    .range([GRAPH_X_MARGIN, container.width()])
    .domain([0, xScaleDomain]);
  var yScale = d3.scaleLinear()
    .range([container.height() - GRAPH_Y_MARGIN, GRAPH_Y_MARGIN])
    .domain([plotData.min, plotData.max]);
  var startLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(0.); });
  var tickerLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(d); })
    .defined(function(d) {
      return d != null;
    });
  
  // for the 1D and 5D graphs, the stock data will not always extend
  // to the end of the x-axis (aka midday, the plot will fill half the graph).
  var numBufferPoints = Math.floor(xScaleDomain - numDataDates);
  var endDateForScale = new Date(plotData.dates[numDataDates - 1]).getTime() + numBufferPoints*5*60*1000/plotData.time.period;
  var datesForScaling = plotData['dates'].slice();
  datesForScaling.push(endDateForScale);
  var xTimeScale = d3.scaleTime()
    .range([0, container.width() - GRAPH_X_MARGIN])
    .domain(d3.extent(datesForScaling, function(d) { return d; }));
  if (drawArea) {
    var area = d3.area()
      .x(function(d, i) { return xScale(i); })
      .y0(function(d) { return yScale(0); })
      .y1(function(d) { return yScale(d); })
      .defined(function(d) {
        return d != null;
      });
  }

  // update current lines in plot
  if (clear) {
    // new graph
    base.selectAll('*').remove();
    graph.selectAll('*').remove();
    hover.selectAll('*').remove();
  } else {
    base.select(`#${graphName}-baseline`)
      .attr('transform', 'translate(' + xScale(0) + ',' + yScale(0) + ')')
      .call(d3.axisBottom(xTimeScale)
              .ticks(NUM_GRAPH_TICKS)
              .tickSizeOuter(0)
              .tickFormat(getAxisDateFormat(plotData.timeRange)));

    // hide last label if graph overflows
    if (plotData.timeRange == '1D' || plotData.timeRange == '1Y') {
      $('#' + graphName + '-baseline .tick').last().text('');
    }

    base.select(`#${graphName}-baseline-label`)
      .attr('x', xScale(0) - GRAPH_X_MARGIN)
      .attr('y', yScale(0) + LABEL_OFFSET);
    graph.select(`#${graphName}-capture`)
      .attr('width', xScale(plotData.dates.length - 1) - GRAPH_X_MARGIN)
      .on('mousemove', handleMouseMove(graphName, xScale, plotData));
    graph.selectAll(`[id$='${graphName}-line']`).each(function() {
      var element = d3.select(this);
      var company = element.attr('id').split('-')[0];
      if (forceColor != undefined) {
        element.classed('red green', false).classed(forceColor, true);
      }
      element.attr('d', tickerLine(plotData.tickers[company]))
        .on('mousemove', handleMouseMove(graphName, xScale, plotData));;
    });
    if (drawArea) {
      graph.selectAll(`[id$='${graphName}-area']`).each(function() {
        var element = d3.select(this);
        var company = element.attr('id').split('-')[0];
        if (forceColor != undefined) {
          element.classed('red green', false).classed(forceColor, true);
        }
        element.attr('d', area(plotData.tickers[company]))
          .on('mousemove', handleMouseMove(graphName, xScale, plotData));;
      });
    }
  }

  // if base hasn't been drawn
  if (base.node().children.length == 0) {
    // add capture
    graph.append('rect')
      .attr('id', `${graphName}-capture`)
      .attr('x', xScale(0))
      .attr('width', xScale(plotData.dates.length - 1) - GRAPH_X_MARGIN)
      .attr('height', container.height())
      .on('mousemove', handleMouseMove(graphName, xScale, plotData))
      .on('mouseleave', handleMouseLeave(graphName))
      .on('outsidemove', function() {
        // custom event for handling linked hover bars
        var x = d3.event.detail.x;
        d3.select(`#${graphName}-hover-rect`)
          .attr('width', x + HOVER_MARGIN - GRAPH_X_MARGIN)
          .classed('hide', false);
        d3.select(`#${graphName}-hover-line`)
          .attr('x1', x - HOVER_BAR_MARGIN)
          .attr('x2', x - HOVER_BAR_MARGIN)
          .classed('hide', false);
      });

    // add hover line with date label
    hover.append('rect')
      .attr('id', `${graphName}-hover-rect`)
      .attr('x', xScale(0) - HOVER_MARGIN)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', container.height())
      .classed('dark', graphName != 'company')
      .classed('hide', true);
    hover.append('text')
      .attr('id', `${graphName}-hover-date`)
      .attr('x', 0)
      .classed('dark', graphName != 'company')
      .classed('hide', true);
    hover.append('line')
      .attr('id', `${graphName}-hover-line`)
      .attr('x1', xScale(0) - HOVER_MARGIN)
      .attr('y1', 0)
      .attr('x2', xScale(0) - HOVER_MARGIN)
      .attr('y2', container.height() + )
      .classed('dark', graphName != 'company')
      .classed('hide', true);

    // add baseline and baseline labels
    base.append("g")
      .attr('id', `${graphName}-baseline`)
      .attr('transform', 'translate(' + xScale(0) + ',' + yScale(0) + ')')
      .classed('dark', graphName != 'company')
      .classed('baseline', true)
      .call(d3.axisBottom(xTimeScale)
              .ticks(NUM_GRAPH_TICKS)
              .tickSizeOuter(0)
              .tickFormat(getAxisDateFormat(plotData.timeRange)))
      .on('mousemove', handleMouseMove(graphName, xScale, plotData));

    // hide last label if graph overflows
    if (plotData.timeRange == '1D' || plotData.timeRange == '1Y') {
      $('#' + graphName + '-baseline .tick').last().text('');
    }

    base.append('text')
      .attr('id', `${graphName}-baseline-label`)
      .attr('x', xScale(0) - GRAPH_X_MARGIN)
      .attr('y', yScale(0) + LABEL_OFFSET)
      .classed('dark', graphName != 'company')
      .classed('baseline-label', true)
      .text(drawArea ? '$0' : '0%');
  }

  if (ticker != undefined) {
    var tickerData = plotData.tickers[ticker];

    if (drawArea) {
      // draw area
      graph.insert('path', '#value-capture + path')
        .attr('id', `${tickerString}-value-area`)
        .attr('d', area(tickerData))
        .classed(color, true)
        .classed('fill', true)
        .on('mouseover', handleMouseOver(graphName))
        .on('mouseleave', handleMouseLeave(graphName))
        .on('mousemove', handleMouseMove(graphName, xScale, plotData));

      // draw total line
      graph.insert('path', ':first-child')
        .attr('id', `${tickerString}-value-line`)
        .attr('d', tickerLine(tickerData))
        .classed('very thick', true)
        .on('mousemove', handleMouseMove(graphName, xScale, plotData));
    } else {
      // draw ticker line
      graph.append('path')
        .attr('id', `${tickerString}-${graphName}-line`)
        .attr('d', tickerLine(tickerData))
        .classed(color, true)
        .on('mouseover', handleMouseOver(graphName))
        .on('mouseleave', handleMouseLeave(graphName))
        .on('mousemove', handleMouseMove(graphName, xScale, plotData));
    }
  }
}

// mouseover event listener on plot line
function handleMouseOver(graphName) {
  if (graphName == 'company') {
    return null
  } else {
    return function() {
      var ticker = $(this).attr('id').split('-')[0];
      var section = getSection(graphName);

      // hover item and row
      $(`#${ticker}-${section}-item`).removeClass('dark');
      $(`#${ticker}-${section}-row`).addClass('hover');
      
      // hover line and move to front
      if (section == 'compare' && !data.getCompareChecked(ticker)) {
        // ticker is not visible
        return;
      }
      var lineName = graphName == 'value' ? 'growth' : graphName;
      $(`#${ticker}-${lineName}-line`).addClass('thick');
      $(`#${ticker}-${lineName}-line`).siblings().addClass('thin dark');
      var element = d3.select(`#${ticker}-${lineName}-line`).node();
      element.parentNode.appendChild(element);

      // hover value area
      if (section == 'portfolio') {
        $(`#${ticker}-value-area`).addClass('hover');
      }
    }
  }
}

// mouseleave event listener on plot line
function handleMouseLeave(graphName) {
  return function() {
    var ticker = $(this).attr('id').split('-')[0];
    var section = getSection(graphName);

    // unhover item and row
    $(`#${ticker}-${section}-item`).addClass('dark');
    $(`#${ticker}-${section}-row`).removeClass('hover');

    // unhover line
    var lineName = graphName == 'value' ? 'growth' : graphName;
    $(`#${ticker}-${lineName}-line`).removeClass('thick');
    $(`#${ticker}-${lineName}-line`).siblings().removeClass('thin dark');

    // unhover value area
    if (section == 'portfolio') {
      $(`#${ticker}-value-area`).removeClass('hover');
    }

    // remove hover bar
    $(`#${graphName}-hover-rect`).addClass('hide');
    $(`#${graphName}-hover-line`).addClass('hide');
    $(`#${graphName}-hover-date`).addClass('hide');

    // remove linked hover bar
    if (graphName == 'value') {
      $('#growth-hover-rect, #growth-hover-line').addClass('hide');
    } else if (graphName == 'growth') {
      $('#value-hover-rect, #value-hover-line').addClass('hide');
    }

    // reset data
    updateData(section, sectionTimeRanges[section]);
  }
}

// mousemove event listener on plot line
function handleMouseMove(graphName, xScale, plotData) {
  return function() {
    var graph = d3.select(`#${graphName}-graph`);
    var mouseX = d3.mouse(graph.node())[0];
    var i = Math.round(xScale.invert(mouseX)); //index of the data
    var x = xScale(i);

    if (i >= plotData.time.n) {
      return;
    }

    // show hover line
    d3.select(`#${graphName}-hover-rect`)
      .attr('width', x + HOVER_MARGIN - GRAPH_X_MARGIN)
      .classed('hide', false);

    d3.select(`#${graphName}-hover-line`)
      .attr('x1', x - HOVER_BAR_MARGIN)
      .attr('x2', x - HOVER_BAR_MARGIN)
      .classed('hide', false);

    var graphWidth = graph.node().getBoundingClientRect().width;
    if (graphWidth - (x - GRAPH_X_MARGIN) < FLIP_HOVER_DATE_THRESHOLD) {
      var hoverDateX = x - 2;
      var hoverDateAlignment = 'end'
    } else {
      var hoverDateX = x + 2;
      var hoverDateAlignment = 'start'
    }
    
    // show date tooltip
    var dateFormat = getHoverDateFormat(plotData.time.interval)
    var displayDate = dateFormat(new Date(plotData.dates[i]));
    d3.select(`#${graphName}-hover-date`)
      .attr('text-anchor', hoverDateAlignment)
      .attr('x', hoverDateX)
      .classed('hide', false)
      .text(displayDate);

    // hover on linked graph
    if (graphName == 'value') {
      $('#growth-hover-rect, #growth-hover-line').removeClass('hide');
      d3.select('#growth-capture').dispatch('outsidemove', { detail: { x: x } });
    } else if (graphName == 'growth') {
      $('#value-hover-rect, #value-hover-line').removeClass('hide');
      d3.select('#value-capture').dispatch('outsidemove', { detail: { x: x } });
    }

    // calculate hover data
    var section = getSection(graphName);
    var time = data.getTime(sectionTimeRanges[section])
    var hoverRange = {
      n: time.n - (i) * time.period,
      interval: time.interval,
      period: time.period,
    };
    updateData(section, hoverRange, hoverRange);

    // rescale data
    rescaleLines(graphName, i);
  }
}

// rescales lines on hover
function rescaleLines(graphName, i) {
  graphName = graphName == 'value' ? 'growth' : graphName;
  plotStock(graphName, undefined, undefined, undefined, undefined, i);
}

// get color associated with change
function getColor(change) {
  if (change > 0) {
    return 'green';
  } else if (change < 0) {
    return 'red';
  } else {
    return '';
  }
}

// get arrow direction associated with change
function getArrow(change) {
  if (change > 0) {
    return 'up';
  } else if (change < 0) {
    return 'down';
  } else {
    return '';
  }
}

// click event to load company page
function createCompanyClickListener(element, ticker) {
  element.click(function() { loadCompanyPage(ticker) });
}

// creates click event listener for check mark buttons
function createCheckClickListener(ticker, section) {
  // escape . and ^ characters in tickers
  var tickerString = ticker.replace('.', '\\.').replace('^', '\\^');
  var timeRange = sectionTimeRanges[section];

  if (section == 'portfolio') {
    // show section
    dom.portfolioHidden.removeClass('hide');

    // pick color
    var color = COLORS[portfolioColor];
    portfolioColor += 1;
    if (portfolioColor == COLORS.length) {
      portfolioColor = 0;
    }

    // create elements
    createCompareItem(dom, ticker, section, color);
    plotStock('value', ticker, tickerString, color);
    plotStock('growth', ticker, tickerString, color);
    createPortfolioTableRow(dom, ticker, timeRange, color);
    createCompanyClickListener($(`#${tickerString}-portfolio-table`), ticker);
    addCompanyHoverHandlers(ticker, section);
  } else if (section == 'compare') {
    // show section
    dom.compareHidden.removeClass('hide');

    // pick color
    var color = COLORS[compareColor];
    compareColor += 1;
    if (compareColor == COLORS.length) {
      compareColor = 0;
    }

    // create elements
    createCompareItem(dom, ticker, section, color);
    plotStock(section, ticker, tickerString, color);
    createCompareTableRow(dom, ticker, timeRange, color);
    createCompanyClickListener($(`#${tickerString}-compare-table`), ticker);
    addCompanyHoverHandlers(ticker, section);

    // create click event listener for removing stock
    $(`#${tickerString}-remove`).click(function() {
      $(`#${tickerString}-compare-item`).mouseleave();
      
      data.removeCompareStock(ticker);
      $(`#${tickerString}-compare-item`).remove();
      $(`#${tickerString}-compare-row`).remove();
      d3.select(`#${tickerString}-compare-line`).remove();

      if (data.getCompareTickers().length == 0) {
        // hide all if no compare tickers
        dom.doneButton.click();
        dom.compareHidden.addClass('hide');
      } else if (!data.getCompareChecked()) {
        // hide plot and table if no plots displayed
        dom.compareHidden.not(dom.compareButtons).not(dom.compareStocks).addClass('hide');
      }
      return false;
    });
  } else if (section == 'suggested') {
    createCompareItem(dom, ticker, section);
  }
  createCompanyClickListener($(`#${tickerString}-${section}-item`), ticker);

  $(`#${tickerString}-check-${section}`).click(function(e) {
    $(this).blur();
    dom.doneButton.click();
    e.stopPropagation();

    data.toggleCompareChecked(ticker);

    // check/uncheck all other checkmarks
    $(`[id^='${tickerString}-check']`).each(function(i, value) {
      $(value).toggleClass('checked');
      $(value).children('i').first().toggleClass('check');
    });

    // show/hide row in compare table
    $(`#${tickerString}-compare-row`).toggleClass('hide');

    if (section != 'compare' && !data.getCompareTickers().includes(ticker)) {
      // add to compare
      data.addToCompareStocks(ticker);
      createCheckClickListener(ticker, 'compare')
    } else {
      dom.compareHidden.removeClass('hide');
      // show/hide plot
      $(`#${tickerString}-compare-line`).toggleClass('hide');
      plotStock('compare');
    }

    if (section == 'search') {
      dom.searchInput.focus();
    } else if (section == 'company') {
      // make compare button green on company page
      $(`#${tickerString}-check-company`).toggleClass('positive');
    }

    // remove from suggested
    if (data.getSuggestedTickers().includes(ticker)) {
      data.removeSuggestedStock(ticker);
      $(`#${tickerString}-suggested-item`).remove();
      if (data.getSuggestedTickers() == 0) {
        dom.suggestedLabel.addClass('hide');
      }
    }

    // hide plot and table if no plots displayed
    if (!data.getCompareChecked()) {
      dom.compareHidden.not(dom.compareButtons).not(dom.compareStocks).addClass('hide');
    }
  });
}

// add hover handlers for graph, item, and table row associated with this ticker
function addCompanyHoverHandlers(ticker, section) {
  var graphName = section == 'portfolio' ? 'growth' : section;
  $(`#${ticker}-${section}-item, #${ticker}-${section}-row`).hover(handleMouseOver(graphName), handleMouseLeave(graphName));
}

// populates company page content
function loadCompanyPage(ticker) {
  companyTicker = ticker;

  // reset time range selector
  timeRange = '1D';
  sectionTimeRanges.company = timeRange;
  dom.companySelector.children().each(function(i, value) {
    $(value).removeClass('active');
  });
  dom.companySelector.children().first().addClass('active');

  // creat compare button
  dom.compareButton.children().first().replaceWith(createCheckButton(ticker, 'company'));
  createCheckClickListener(ticker, 'company');

  if (data.getPortfolioShares(companyTicker) > 0) {
    dom.companySellButton.removeClass('hide');
  } else {
    dom.companySellButton.addClass('hide');
  }

  // populate company information
  var change = data.getChange(ticker, timeRange);
  var stats = data.getStats(ticker, timeRange);
  dom.companyTicker.text(ticker);
  dom.companyName.text(data.getCompany(ticker));
  dom.companyPrice.text(data.getPrice(ticker).withCommas());
  dom.companyChange.text(change.withCommas());
  dom.companyChange.siblings().removeClass('up down').addClass(getArrow(change));
  dom.companyChange.parent().removeClass('green red').addClass(getColor(change));
  dom.companyBlurb.text(data.getBlurb(ticker));
  dom.companyCEO.text(data.getCEO(ticker));
  dom.companyFounded.text(data.getFounded(ticker));
  dom.companyHeadquarters.text(data.getHeadquarters(ticker));
  dom.companyStart.text(stats.start.withCommas());
  dom.companyHigh.text(stats.high.withCommas());
  dom.companyLow.text(stats.low.withCommas());
  dom.companyMktCap.text(data.getMktCap(ticker));
  dom.companyPERatio.text(data.getPERatio(ticker).withCommas());
  dom.companyDivYield.text(data.getDivYield(ticker).withCommas());

  // show modal
  dom.companyPage.modal('show');

  // escape . and ^ characters in tickers
  var tickerString = ticker.replace('.', '\\.').replace('^', '\\^');
  plotStock('company', ticker, tickerString, getColor(change), undefined, undefined, true)
}

// update section data
// hoverRange is only set when hovering
// timeRange should be the same as hoverRange when hoverRange is set
function updateData(section, timeRange, hoverRange) {
  if (section == 'portfolio') {
    data.getPortfolioTickers().map(function(ticker) {
      var change = data.getPortfolioChange(ticker, timeRange);
      var element = $(`#${ticker}-portfolio-change`);

      plotStock('value');
      plotStock('growth');

      $(`#${ticker}-portfolio-value`).text(data.getPortfolioValue(ticker, hoverRange).withCommas());
      $(`#${ticker}-portfolio-shares`).text(data.getPortfolioShares(ticker, hoverRange));
      $(`#${ticker}-portfolio-percent`).text(data.getPortfolioPercent(ticker, hoverRange).withCommas());
      element.text(change.withCommas());
      element.siblings().removeClass('up down').addClass(getArrow(change));
      element.parent().removeClass('green red').addClass(getColor(change));
    });
  } else if (section == 'compare') {
    data.getCompareTickers().map(function(ticker) {
      var change = data.getChange(ticker, timeRange);
      var element = $(`#${ticker}-compare-change`);

      plotStock(section);

      $(`#${ticker}-compare-price`).text(data.getPrice(ticker, hoverRange).withCommas());
      element.text(change.withCommas());
      element.siblings().removeClass('up down').addClass(getArrow(change));
      element.parent().removeClass('green red').addClass(getColor(change));
    });
  } else if (section == 'company') {
    var change = data.getChange(companyTicker, timeRange);
    var stats = data.getStats(companyTicker, timeRange);

    plotStock('company', undefined, undefined, undefined, getColor(change));

    dom.companyPrice.text(data.getPrice(companyTicker, hoverRange).withCommas());
    dom.companyChange.text(change.withCommas());
    dom.companyChange.siblings().removeClass('up down').addClass(getArrow(change));
    dom.companyChange.parent().removeClass('green red').addClass(getColor(change));
    dom.companyStart.text(stats.start.withCommas(timeRange));
    dom.companyHigh.text(stats.high.withCommas(timeRange));
    dom.companyLow.text(stats.low.withCommas(timeRange));
  }
}


//////////////////////////////
// Load page content
//////////////////////////////

// only show portfolio if logged in
if (username != undefined) {
  dom.welcome.removeClass('hide');
  dom.user.text(username);
  dom.login.text('Logout');
  dom.portfolioValue.text(data.getPortfolioValue().withCommas());
  data.getPortfolioTickers().map(x => createCheckClickListener(x, 'portfolio'));
}
data.getCompareTickers().map(x => createCheckClickListener(x, 'compare'));
data.getSuggestedTickers().map(x => createCheckClickListener(x, 'suggested'));

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
      // format each result
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


//////////////////////////////
// UI
//////////////////////////////

// login
dom.login.click(function() {
  if (username == undefined) {
    username = 'Warren';
    dom.welcome.removeClass('hide');
    dom.user.text(username);
    dom.login.text('Logout');

    // populate portfolio
    dom.portfolioValue.text(data.getPortfolioValue().withCommas());
    data.getPortfolioTickers().map(x => createCheckClickListener(x, 'portfolio'));
  } else {
    username = undefined;
    dom.welcome.addClass('hide');
    dom.user.text('');
    dom.login.text('Login');

    // clear portfolio
    portfolioColor = 0;
    dom.portfolioValue.text('');
    dom.portfolioStocks.children().remove();
    dom.portfolioTable.children().remove();
    dom.valueGraph.selectAll('*').remove();
    dom.valueHover.selectAll('*').remove();
    dom.valueBase.selectAll('*').remove();
    dom.growthGraph.selectAll('*').remove();
    dom.growthHover.selectAll('*').remove();
    dom.growthBase.selectAll('*').remove();
    dom.portfolioHidden.addClass('hide');
  }
});

// select input on focus
dom.searchInput.click(function() {
  this.select();
});

// remove button
dom.removeButton.click(function(e) {
  e.stopPropagation();
  removing = true;
  dom.removeButton.addClass('hide');
  dom.doneButton.removeClass('hide');
  $('.close').each(function(i, value) {
    $(value).removeClass('hide');
  });
});

// done button
dom.doneButton.click(function() {
  removing = false;
  dom.removeButton.removeClass('hide');
  dom.doneButton.addClass('hide');
  $('.close').each(function(i, value) {
    $(value).addClass('hide');
  });
});

// done removing if click anything
$(document).click(function(e) {
  if (removing && !$(e.target).hasClass('close')) {
    dom.doneButton.click();
  }
});

// time range selectors
$('.selector>.right.menu>.item, .selector>.item').click(function(e) {
  var timeRangeElement = $(e.target);

  // remove 'active' class from other time range menu items
  timeRangeElement.siblings().removeClass('active');
  timeRangeElement.addClass('active');

  var timeRange = timeRangeElement.text();
  var section = timeRangeElement.closest('.selector').attr('id').split('-')[0];
  sectionTimeRanges[section] = timeRange;
  updateData(section, timeRange);
});

// company page
dom.companyPage
  .modal({
    autofocus: false,
    allowMultiple: false,
  })
  .modal('attach events', dom.cancelBuy)
  .modal('attach events', dom.cancelSell);

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
  dom.buyShares.parent().removeClass('error');
});

// input shares to buy
dom.buyShares.on('input', function(e) {
  dom.buyShares.parent().removeClass('error');
  dom.buyShares.val(dom.buyShares.val().replace(/\D/g,''));
  dom.totalPrice.text((data.getPrice(companyTicker) * dom.buyShares.val()).withCommas());

  var shares = parseInt(dom.buyShares.val());
  if (shares < 0) {
    dom.buyShares.parent().addClass('error');
  }
});

// select input on focus
dom.buyShares.click(function() {
  this.select();
});

// buy stock
dom.buyButton.click(function() {
  var shares = parseInt(dom.buyShares.val());
  if (shares > 0) {
    var newStock = data.buyStock(companyTicker, shares);
    dom.portfolioValue.text(data.getPortfolioValue().withCommas());
    dom.portfolioHidden.removeClass('hide');
    if (newStock) {
      createCheckClickListener(companyTicker, 'portfolio');
    } else {
      plotStock('value');
      plotStock('growth');
      updateData('portfolio', sectionTimeRanges.portfolio);
    }
  } else {
    dom.buyShares.parent().addClass('error');
    return false;
  }
});

// sell page
dom.sellPage
  .modal({
    autofocus: false,
    allowMultiple: false,
  })
  .modal('attach events', dom.companySellButton);

// load sell page
dom.companySellButton.click(function() {
  dom.sellShares.val('');
  dom.sellCompanyTicker.text(companyTicker);
  var price = data.getPrice(companyTicker).withCommas();
  dom.sellPrice.text(price);
  dom.totalSellPrice.text('0.00');
  dom.sellShares.parent().removeClass('error');
});

// input shares to sell
dom.sellShares.on('input', function(e) {
  dom.sellShares.parent().removeClass('error');
  dom.sellShares.val(dom.sellShares.val().replace(/\D/g,''));
  dom.totalSellPrice.text((data.getPrice(companyTicker) * dom.sellShares.val()).withCommas());

  var shares = parseInt(dom.sellShares.val());
  if (shares < 0 || shares > data.getPortfolioShares(companyTicker)) {
    dom.sellShares.parent().addClass('error');
  }
});

// select input on focus
dom.sellShares.click(function() {
  this.select();
});

// sell stock
dom.sellButton.click(function() {
  var shares = parseInt(dom.sellShares.val());
  if (shares > 0 && shares <= data.getPortfolioShares(companyTicker)) {
    var soldStock = data.sellStock(companyTicker, shares);
    dom.portfolioValue.text(data.getPortfolioValue().withCommas());
    dom.portfolioHidden.removeClass('hide');
    plotStock('value');
    plotStock('growth');
    updateData('portfolio', sectionTimeRanges.portfolio);
  } else {
    dom.sellShares.parent().addClass('error');
    return false;
  }
});

// redraw plots on resize
$(window).resize(function() {
  ['value', 'growth', 'compare', 'company'].map(x => plotStock(x));
});
