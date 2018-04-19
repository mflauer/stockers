//////////////////////////////
// DOM ELEMENTS
//////////////////////////////
dom = {};

// graphs
dom.volumeGraphContainer = $('#volume-graph-container');
dom.volumeGraph = d3.select('#volume-graph');
dom.growthGraphContainer = $('#growth-graph-container');
dom.growthGraph = d3.select('#growth-graph');
dom.compareGraphContainer = $('#compare-graph-container');
dom.compareGraph = d3.select('#compare-graph');
dom.companyGraphContainer = $('#company-graph-container');
dom.companyGraph = d3.select('#company-graph');

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
dom.editButton = $('#edit-button');
dom.doneButton = $('#done-button');
dom.compareStocks = $('#compare-stocks');
dom.suggestedLabel = $('#suggested-label');
dom.suggestedStocks = $('#suggested-stocks');
dom.compareTable = $('#compare-table');

// company
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

// buy
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
const GRAPH_X_MARGIN = 20;
const GRAPH_Y_MARGIN = 5;
const COLORS = [
  'blue',
  'red',
  'green',
  'yellow',
  'purple',
  'orange',
  'teal',
  'pink',
  'violet',
  'olive',
  'brown',
];

// graph axes
var volumeX, volumeY, growthX, growthY, compareX, compareY, companyX, companyY;

// graph data
var portfolioTimeRange = '1Y',
    compareTimeRange = companyTimeRange = '1D',
    companyTicker;

// next color to use for section
var portfolioColor = 0;
var compareColor = 0;

// if compare companies is being edited
var editing = false;


//////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////

// formats date TODO: not used
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

// load change plot for section
function getStackedPlotData() {
  var tickers = data.getPortfolioTickers();
  var timeRange = portfolioTimeRange;

  var plotData = { 'tickers': [] };
  var time = data.getTime(timeRange);
  var close = time.interval == 'min' ? 'close' : 'adjusted close'
  var min = 0;
  var max = 0;
  var values;

  for (var t in tickers) {
    var stockData = data.getPortfolioData(tickers[t])[time.interval].slice(0, time.n).filter(function(x, i) {
      return i % time.period == 0;
    });

    // populate dates
    if (t == 0) {
      var dates = stockData.map(x => Date.parse(x['date'])).reverse();
      plotData['dates'] = dates;
      values = Array(dates.length).fill(0);
    }

    var tickerData = stockData.map(function(x, i) {
      var value = parseFloat(x[close]);
      if (value == 0) {
        return null
      } else {
        values[i] += value;
        return values[i];
      }
    }).reverse();
    plotData['tickers'][tickers[t]] = tickerData;

    var dataMax = Math.max(...tickerData);
    max = dataMax > max ? dataMax : max;
  }

  plotData['min'] = min;
  plotData['max'] = max;

  return plotData;
}

// load change plot for section
function getChangePlotData(section) {
  if (section == 'portfolio') {
    var f = 'getPortfolioData';
    var tickers = data.getPortfolioTickers();
    var timeRange = portfolioTimeRange;
  } else if (section == 'compare') {
    var f = 'getStockData';
    var tickers = data.getCompareTickers();
    var timeRange = compareTimeRange;
  } else if (section == 'company') {
    var f = 'getStockData';
    var tickers = [companyTicker];
    var timeRange = companyTimeRange;
  }

  var plotData = { 'tickers': [] };
  var time = data.getTime(timeRange);
  var close = time.interval == 'min' ? 'close' : 'adjusted close'
  var min = Infinity;
  var max = -Infinity;

  for (var t in tickers) {
    var stockData = data[f](tickers[t])[time.interval].slice(0, time.n).filter(function(x, i) {
      return i % time.period == 0;
    });

    // populate dates
    if (t == 0) {
      plotData['dates'] = stockData.map(x => Date.parse(x['date'])).reverse();
    }

    // always scale based on value of first item
    var first = parseFloat(stockData.slice(-1)[0][close]);
    if (first == 0) {
      // find first non-zero element
      var firstElement = stockData.slice().reverse().find(function(e) { return parseFloat(e[close]) > 0; });
      first = firstElement ? firstElement[close] : firstElement;
    }

    var tickerData = stockData.map(function(x) {
      var value = parseFloat(x[close]);
      return value == 0 ? null : 100 * ((value / first) - 1);
    }).reverse();
    plotData['tickers'][tickers[t]] = tickerData;

    var dataMin = Math.min(...tickerData);
    var dataMax = Math.max(...tickerData);
    min = dataMin < min ? dataMin : min;
    max = dataMax > max ? dataMax : max;
  }

  plotData['min'] = min;
  plotData['max'] = max;

  return plotData;
}

// add ticker stock to change plot
function plotStockChange(section, ticker, tickerString, color, clear=false) {
  var plotData = getChangePlotData(section);
  if (section == 'portfolio') {
    plotStockStacked(ticker, tickerString, color);
    var graph = dom.growthGraph;
    var xScale = growthX;
    var yScale = growthY;
    var mouseEnterHandler = handleMouseEnterPortfolio;
    var mouseLeaveHandler = handleMouseLeavePortfolio;
  } else if (section == 'compare') {
    var graph = dom.compareGraph;
    var xScale = compareX;
    var yScale = compareY;
    var mouseEnterHandler = handleMouseEnterCompare;
    var mouseLeaveHandler = handleMouseLeaveCompare;
  } else if (section == 'company') {
    var graph = dom.companyGraph;
    var xScale = companyX;
    var yScale = companyY;
    var mouseEnterHandler = null;
    var mouseLeaveHandler = null;
  }

  // rescale plots
  xScale.domain([0, plotData['dates'].length - 1]);
  yScale.domain([plotData['min'], plotData['max']]);
  var startLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(0.); });
  var tickerLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(d); })
    .defined(function(d) {
      return d != null;
    });

  // update current lines in plot
  var baseline = false;
  if (clear) {
    // new graph
    graph.selectAll('*').remove();
  } else {
    graph.selectAll('*').each(function() {
      var line = d3.select(this);
      var id = line.attr('id');
      if (id == `${section}-baseline`) {
        baseline = true;
        line.attr('d', startLine(plotData['dates']));
      } else if (id == `${section}-baseline-label`) {
        line.attr('x', xScale(0) - GRAPH_X_MARGIN)
          .attr('y', yScale(0) + GRAPH_Y_MARGIN - 1);
      } else if (id.endsWith(`${section}-line`)) {
        var company = id.split('-')[0];
        line.attr('d', tickerLine(plotData['tickers'][company]));
      }
    });
  }

  // draw baseline if not already in plot
  if (!baseline) {
    graph.append('text')
      .attr('id', `${section}-baseline-label`)
      .attr('x', xScale(0) - GRAPH_X_MARGIN)
      .attr('y', yScale(0) + 4)
      .classed('baseline-label', true)
      .text('0%');
    graph.append('path')
      .attr('id', `${section}-baseline`)
      .classed('baseline', true)
      .attr('d', startLine(plotData['dates']));
  }

  // draw ticker line
  graph.append('path')
    .attr('id', `${tickerString}-${section}-line`)
    .classed(color, true)
    .attr('d', tickerLine(plotData['tickers'][ticker]))
    .on("mouseover", mouseEnterHandler)
    .on("mouseout", mouseLeaveHandler);
}

// redraw change plot, optionally forcing all lines to have a color
function updateChangePlot(section, color) {
  var plotData = getChangePlotData(section);
  if (section == 'portfolio') {
    updateStackedPlot();
    var graph = dom.growthGraph;
    var xScale = growthX;
    var yScale = growthY;
  } else if (section == 'compare') {
    var graph = dom.compareGraph;
    var xScale = compareX;
    var yScale = compareY;
  } else if (section == 'company') {
    var graph = dom.companyGraph;
    var xScale = companyX;
    var yScale = companyY;
  }

  // rescale plots
  xScale.domain([0, plotData['dates'].length - 1]);
  yScale.domain([plotData['min'], plotData['max']]);
  var startLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(0.); });
  var tickerLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(d); })
    .defined(function(d) {
      return d != null;
    });

  // update current lines in plot
  graph.selectAll('*').each(function() {
    var line = d3.select(this);
    var id = line.attr('id');
    if (id == `${section}-baseline`) {
      line.attr('d', startLine(plotData['dates']));
    } else if (id == `${section}-baseline-label`) {
      line.attr('x', xScale(0) - GRAPH_X_MARGIN)
        .attr('y', yScale(0) + GRAPH_Y_MARGIN - 1);
    } else if (id.endsWith(`${section}-line`)) {
      var ticker = id.split('-')[0];
      if (color != undefined) {
        line.classed('red green', false).classed(color, true);
      }
      line.attr('d', tickerLine(plotData['tickers'][ticker]));
    }
  });
}

// add ticker stock to stacked plot
function plotStockStacked(ticker, tickerString, color) {
  var plotData = getStackedPlotData();
  var graph = dom.volumeGraph;
  var xScale = volumeX;
  var yScale = volumeY;

  // rescale plots
  xScale.domain([0, plotData['dates'].length - 1]);
  yScale.domain([plotData['min'], plotData['max']]);
  var startLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(0.); });
  var tickerLine = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(d); })
    .defined(function(d) {
      return d != null;
    });
  var area = d3.area()
    .x(function(d, i) { return xScale(i); })
    .y0(dom.volumeGraphContainer.height() - GRAPH_Y_MARGIN)
    .y1(function(d) { return yScale(d); })
    .defined(function(d) {
      return d != null;
    });

  // update current lines in plot
  var baseline = false;
  graph.selectAll('*').each(function() {
    var line = d3.select(this);
    var id = line.attr('id');
    if (id == 'volume-baseline') {
      baseline = true;
      line.attr('d', startLine(plotData['dates']));
    } else if (id == 'volume-baseline-label') {
      line.attr('x', xScale(0) - GRAPH_X_MARGIN)
        .attr('y', yScale(0) + GRAPH_Y_MARGIN - 1);
    } else if (id.endsWith('volume-line')) {
      var idArray = id.split('-');
      var company = idArray[0];
      if (idArray[2] == 'line') {
        line.attr('d', tickerLine(plotData['tickers'][company]));
      } else if (idArray[2] == 'area') {
        line.attr('d', area(plotData['tickers'][company]));
      }
    }
  });

  // draw baseline if not already in plot
  if (!baseline) {
    graph.append('text')
      .attr('id', 'volume-baseline-label')
      .attr('x', xScale(0) - GRAPH_X_MARGIN)
      .attr('y', yScale(0) + 4)
      .classed('baseline-label', true)
      .text('$0');
    graph.append('path')
      .attr('id', 'volume-baseline')
      .classed('baseline', true)
      .attr('d', startLine(plotData['dates']));
  }

  var tickerData = plotData['tickers'][ticker];

  // draw ticker line
  graph.insert('path', ':nth-child(2)')
    .attr('id', `${tickerString}-volume-line`)
    .classed(color, true)
    .attr('d', tickerLine(tickerData))
    .on("mouseover", handleMouseEnterPortfolio)
    .on("mouseout", handleMouseLeavePortfolio);

  // draw area
  graph.insert('path', ':nth-child(2)')
    .attr('id', `${tickerString}-volume-area`)
    .classed(color, true)
    .classed('fill', true)
    .attr('d', area(tickerData))
    .on("mouseover", handleMouseEnterPortfolio)
    .on("mouseout", handleMouseLeavePortfolio);
}

// redraw stacked plot
function updateStackedPlot() {
  var plotData = getStackedPlotData();
  var graph = dom.volumeGraph;
  var xScale = growthX;
  var yScale = growthY;

  // rescale plots
    xScale.domain([0, plotData['dates'].length - 1]);
    yScale.domain([plotData['min'], plotData['max']]);
    var startLine = d3.line()
      .x(function(d, i) { return xScale(i); })
      .y(function(d) { return yScale(0.); });
    var tickerLine = d3.line()
      .x(function(d, i) { return xScale(i); })
      .y(function(d) { return yScale(d); })
      .defined(function(d) {
        return d != null;
      });
    var area = d3.area()
      .x(function(d, i) { return xScale(i); })
      .y0(dom.volumeGraphContainer.height() - GRAPH_Y_MARGIN)
      .y1(function(d) { return yScale(d); })
      .defined(function(d) {
        return d != null;
      });

  // update current lines in plot
  graph.selectAll('*').each(function() {
    var line = d3.select(this);
    var id = line.attr('id');
    if (id == 'volume-baseline') {
      line.attr('d', startLine(plotData['dates']));
    } else if (id == 'volume-baseline-label') {
      line.attr('x', xScale(0) - GRAPH_X_MARGIN)
        .attr('y', yScale(0) + GRAPH_Y_MARGIN - 1);
    } else if (id.endsWith('volume-area') || id.endsWith('volume-line')) {
      var idArray = id.split('-');
      var company = idArray[0];
      if (idArray[2] == 'line') {
        line.attr('d', tickerLine(plotData['tickers'][company]));
      } else if (idArray[2] == 'area') {
        line.attr('d', area(plotData['tickers'][company]));
      }
    }
  });
}

// mouseenter event listener on compare plot
function handleMouseEnterCompare() {
  var ticker = $(this).attr('id').split('-')[0];
  $(`#${ticker}-compare-item, #${ticker}-compare-row`).addClass('hover');
  $(`#${ticker}-compare-line`).addClass('thick');
}

// mouseleave event listener on compare plot
function handleMouseLeaveCompare() {
  var ticker = $(this).attr('id').split('-')[0];
  $(`#${ticker}-compare-item, #${ticker}-compare-row`).removeClass('hover');
  $(`#${ticker}-compare-line`).removeClass('thick');
}

// mouseenter event listener on portfolio plot
function handleMouseEnterPortfolio() {
  var ticker = $(this).attr('id').split('-')[0];
  $(`#${ticker}-portfolio-item, #${ticker}-portfolio-row, #${ticker}-volume-area`).addClass('hover');
  $(`#${ticker}-volume-line, #${ticker}-portfolio-line`).addClass('thick');
}

// mouseleave event listener on portfolio plot
function handleMouseLeavePortfolio() {
  var ticker = $(this).attr('id').split('-')[0];
  $(`#${ticker}-portfolio-item, #${ticker}-portfolio-row, #${ticker}-volume-area`).removeClass('hover');
  $(`#${ticker}-volume-line, #${ticker}-portfolio-line`).removeClass('thick');
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

  if (section == 'portfolio') {
    // show section
    dom.portfolioHidden.removeClass('hide');

    // set scale of portfolio page plots
    if (volumeX == undefined || volumeY == undefined || growthX == undefined || growthY == undefined) {
      volumeX = d3.scaleTime().range([GRAPH_X_MARGIN, dom.volumeGraphContainer.width()]);
      volumeY = d3.scaleLinear().range([dom.volumeGraphContainer.height() - GRAPH_Y_MARGIN, GRAPH_Y_MARGIN]);
      growthX = d3.scaleTime().range([GRAPH_X_MARGIN, dom.growthGraphContainer.width()]);
      growthY = d3.scaleLinear().range([dom.growthGraphContainer.height() - GRAPH_Y_MARGIN, GRAPH_Y_MARGIN]);
    }

    // pick color
    var color = COLORS[portfolioColor];
    portfolioColor += 1;
    if (portfolioColor == COLORS.length) {
      portfolioColor = 0;
    }

    // create elements
    createCompareItem(dom, ticker, section, color);
    plotStockChange(section, ticker, tickerString, color);
    createPortfolioTableRow(dom, ticker, portfolioTimeRange, color);
    createCompanyClickListener($(`#${tickerString}-portfolio-table`), ticker);
    addCompanyHoverHandlers(ticker, section);
  } else if (section == 'compare') {
    // show section
    dom.compareHidden.removeClass('hide');

    // set scale of compare page plot
    if (compareX == undefined || compareY == undefined) {
      compareX = d3.scaleTime().range([GRAPH_X_MARGIN, dom.compareGraphContainer.width()]);
      compareY = d3.scaleLinear().range([dom.compareGraphContainer.height() - GRAPH_Y_MARGIN, GRAPH_Y_MARGIN]);
    }

    // pick color
    var color = COLORS[compareColor];
    compareColor += 1;
    if (compareColor == COLORS.length) {
      compareColor = 0;
    }

    // create elements
    createCompareItem(dom, ticker, section, color);
    plotStockChange(section, ticker, tickerString, color);
    createCompareTableRow(dom, ticker, compareTimeRange, color);
    createCompanyClickListener($(`#${tickerString}-compare-table`), ticker);
    addCompanyHoverHandlers(ticker, section);

    // create click event listener for removing stock
    $(`#${tickerString}-remove`).click(function() {
      data.removeCompareStock(ticker);
      $(`#${tickerString}-compare-item`).remove();
      $(`#${tickerString}-compare-row`).remove();
      d3.select(`#${tickerString}-compare-line`).remove();

      if (data.getCompareTickers.length == 0) {
        dom.compareStocks.addClass('hide');
        dom.doneButton.click();
        dom.compareButtons.addClass('hide');
      }
    });
  } else if (section == 'suggested') {
    createCompareItem(dom, ticker, section);
  }
  createCompanyClickListener($(`#${tickerString}-${section}-item`), ticker);

  if (section == 'button') {
    // element is entire compare button on company page, not just checkbox
    var element = dom.compareButton;
    // remove previous click event listeners
    element.off('click');
  } else {
    var element = $(`#${tickerString}-check-${section}`);
  }

  element.click(function(e) {
    $(this).blur();
    e.stopPropagation();

    data.toggleCompareChecked(ticker);
    
    // check/uncheck all other checkmarks
    $(`[id^='${tickerString}-check']`).each(function(i, value) {
      $(value).children('i').first().toggleClass('check');
    });

    // show/hide row in compare table
    $(`#${tickerString}-compare-row`).toggleClass('hide');

    if (section != 'compare' && !data.getCompareTickers().includes(ticker)) {
      // add to compare
      data.addToCompareStocks(ticker);
      createCheckClickListener(ticker, 'compare')
    } else {
      // show/hide plot
      var line = d3.select(`#${tickerString}-compare-line`);
      line.classed('hide', !line.classed('hide'));
    }

    if (section == 'search') {
      dom.searchInput.focus();
    } else if (section == 'company' || section == 'button') {
      // make compare button green on company page
      dom.compareButton.toggleClass('positive');
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
    } else {
      dom.compareHidden.removeClass('hide');
    }
  });
}

// add hover handlers for graph, item, and table row
// associated with this ticker
function addCompanyHoverHandlers(ticker, section) {
  if (section == 'compare') {
    $(`#${ticker}-compare-item`).hover(handleMouseEnterCompare, handleMouseLeaveCompare);
    $(`#${ticker}-compare-row`).hover(handleMouseEnterCompare, handleMouseLeaveCompare);
    // plot hover set upon plot drawing
  } else if (section == 'portfolio') {
    $(`#${ticker}-portfolio-item`).hover(handleMouseEnterPortfolio, handleMouseLeavePortfolio);
    $(`#${ticker}-portfolio-row`).hover(handleMouseEnterPortfolio, handleMouseLeavePortfolio);
    // plot hover (for both plots) set upon plot drawing
  }
  
}

// populates company page content
function loadCompanyPage(ticker) {
  companyTicker = ticker;

  // reset time range selector
  companyTimeRange = '1D';
  dom.companySelector.children().each(function(i, value) {
    $(value).removeClass('active');
  });
  dom.companySelector.children().first().addClass('active');

  // creat compare button
  dom.compareButton.children().first().replaceWith(createCheckButton(ticker, 'company'));
  if (data.getCompareChecked(ticker)) {
    dom.compareButton.addClass('positive');
  } else {
    dom.compareButton.removeClass('positive');
  }
  createCheckClickListener(ticker, 'company');
  createCheckClickListener(ticker, 'button');

  // populate company information
  var change = data.getChange(ticker, companyTimeRange);
  var stats = data.getStats(ticker, companyTimeRange);
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
  
  // set scale of company page plot
  if (companyX == undefined || companyY == undefined) {
    companyX = d3.scaleTime().range([GRAPH_X_MARGIN, dom.companyGraphContainer.width()]);
    companyY = d3.scaleLinear().range([dom.companyGraphContainer.height() - GRAPH_Y_MARGIN, GRAPH_Y_MARGIN]);
  }
  
  // escape . and ^ characters in tickers
  var tickerString = ticker.replace('.', '\\.').replace('^', '\\^');
  plotStockChange('company', ticker, tickerString, getColor(change), true)
}

// update portfolio row
// hoverRange is only set when hovering
// timeRange should be the same as hoverRange when hoverRange is set
function updatePortfolioRow(ticker, timeRange, hoverRange) {
  var change = data.getPortfolioChange(ticker, timeRange);
  var element = $(`#${ticker}-portfolio-change`);
  
  $(`#${ticker}-portfolio-value`).text(data.getPortfolioValue(ticker, hoverRange).withCommas());
  $(`#${ticker}-portfolio-percent`).text(data.getPortfolioPercent(ticker, hoverRange).withCommas());
  element.text(change.withCommas());
  element.siblings().removeClass('up down').addClass(getArrow(change));
  element.parent().removeClass('green red').addClass(getColor(change));
}

// update compare row
// hoverRange is only set when hovering
// timeRange should be the same as hoverRange when hoverRange is set
function updateCompareRow(ticker, timeRange, hoverRange) {
  var change = data.getChange(ticker, timeRange);
  var element = $(`#${ticker}-compare-change`);

  $(`#${ticker}-compare-price`).text(data.getPrice(ticker, hoverRange).withCommas());
  element.text(change.withCommas());
  element.siblings().removeClass('up down').addClass(getArrow(change));
  element.parent().removeClass('green red').addClass(getColor(change));
}

// update company page
// hoverRange is only set when hovering
// timeRange should be the same as hoverRange when hoverRange is set
function updateCompanyPage(ticker, timeRange, hoverRange) {
  var change = data.getChange(ticker, timeRange);
  var stats = data.getStats(ticker, timeRange);
  
  updateChangePlot('company', getColor(change));

  dom.companyPrice.text(data.getPrice(ticker, hoverRange).withCommas());
  dom.companyChange.text(change.withCommas());
  dom.companyChange.siblings().removeClass('up down').addClass(getArrow(change));
  dom.companyChange.parent().removeClass('green red').addClass(getColor(change));
  dom.companyStart.text(stats.start.withCommas(timeRange));
  dom.companyHigh.text(stats.high.withCommas(timeRange));
  dom.companyLow.text(stats.low.withCommas(timeRange));
}


//////////////////////////////
// Load page content
//////////////////////////////

// portfolio value
dom.portfolioValue.text(data.getPortfolioValue().withCommas());

// load stocks
data.getPortfolioTickers().map(x => createCheckClickListener(x, 'portfolio'));
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
    updateChangePlot(section);
    data.getPortfolioTickers().map(x => updatePortfolioRow(x, portfolioTimeRange));
  } else if (section == 'compare') {
    compareTimeRange = timeRange;
    updateChangePlot(section);
    data.getCompareTickers().map(x => updateCompareRow(x, compareTimeRange));
  } else if (section == 'company') {
    companyTimeRange = timeRange;
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
  dom.portfolioHidden.removeClass('hide');
  if (newStock) {
    createCheckClickListener(companyTicker, 'portfolio');
  } else {
    updateChangePlot('portfolio');
    updatePortfolioRow(companyTicker, portfolioTimeRange);
  }
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

