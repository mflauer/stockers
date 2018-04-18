function createCheckButton(ticker, location='compare', color='') {
  var checked = data.getCompareChecked(ticker);
  if (location == 'company' && checked) {
    color = 'positive';
  }
  return `
    <div id="${ticker}-check-${location}" class="mini circular ui icon ${color} button">
      <i class="${checked ? 'check' : ''} icon"></i>
    </div>
  `;
}

function createCompareItem(dom, ticker, location, color='') {
  var isPortfolio = (location == 'portfolio');
  if (isPortfolio) {
    var element = dom.portfolioStocks;
    var icon = ''
  } else if (location == 'compare') {
    var element = dom.compareStocks;
    var icon = `<i id="${ticker}-remove" class="close link icon hide"></i>`;
  } else if (location == 'suggested') {
    var element = dom.suggestedStocks;
    var icon = '';
  }
  element.append(`
    <div id="${ticker}-${location}-item" class="${isPortfolio ? 'portfolio' : 'compare'}-item ui basic fluid ${color} left button">
      ${isPortfolio ? '' : createCheckButton(ticker, location, color)}
      ${icon}
      <div class="baseline inline">
        ${ticker}
      </div>
    </div>
  `);
}

function createPortfolioTableRow(dom, ticker, timeRange) {
  var change = data.getPortfolioChange(ticker, timeRange);
  dom.portfolioTable.append(`
    <tr id="${ticker}-portfolio-row">
      <td><a id="${ticker}-portfolio-table" href="#">${ticker}</a></td>
      <td class="right aligned">$<span id="${ticker}-portfolio-value">${data.getPortfolioValue(ticker).withCommas()}</span></td>
      <td class="right aligned">
        <div class="${getColor(change)}">
          <i class="caret ${getArrow(change)} icon"></i>
          <span id="${ticker}-portfolio-change">${getChange(change)}</span>
        </div>
      </td>
      <td class="right aligned"><span id="${ticker}-portfolio-percent">${data.getPortfolioPercent(ticker).withCommas()}</span>%</td>
    </tr>
  `);
}

function createCompareTableRow(dom, ticker, timeRange) {
  var change = data.getChange(ticker, timeRange);
  dom.compareTable.append(`
    <tr id="${ticker}-compare-row" class="${data.getCompareChecked(ticker) ? '' : 'hide'}">
      <td><a id="${ticker}-compare-table" href="#">${ticker}</a></td>
      <td class="right aligned">$<span id="${ticker}-compare-price">${data.getPrice(ticker).withCommas()}</span></td>
      <td class="right aligned">
        <div class="${getColor(change)}">
          <i class="caret ${getArrow(change)} icon"></i>
          <span id="${ticker}-compare-change">${getChange(change)}</span>
        </div>
      </td>
      <td class="right aligned">${data.getMktCap(ticker)}</td>
      <td class="right aligned">${data.getPERatio(ticker).withCommas()}</td>
    </tr>
  `);
}
