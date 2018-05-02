function createCheckButton(ticker, section='compare', color='') {
  var checked = data.getCompareChecked(ticker);
  var shade = section == 'search' ? '' : 'dark';
  if (section == 'company') {
    shade = '';
    color = checked ? 'positive' : color;
  }
  return `
    <div id="${ticker}-check-${section}" class="basic circular ui icon ${shade} ${color} ${checked ? 'checked' : ''} button check-button">
      <i class="${checked ? 'check' : ''} icon"></i>
    </div>
  `;
}

function createCompareItem(dom, ticker, section, color='white') {
  var isPortfolio = (section == 'portfolio');
  var isSuggested = (section == 'suggested');
  if (isPortfolio) {
    var element = dom.portfolioStocks;
    var icon = '';
    var hide = !data.isTickerInRange(ticker, '1Y');
  } else if (section == 'compare') {
    var element = dom.compareStocks;
    var icon = `<i id="${ticker}-remove" class="close link icon hide"></i>`;
    var hide = false;
  } else if (section == 'suggested') {
    var element = dom.suggestedStocks;
    var icon = '';
    var hide = false;
  }
  element.append(`
    <div id="${ticker}-${section}-item" class="${isPortfolio ? 'portfolio' : 'compare'}-item ui fluid ${color} left button dark ${hide ? 'hide' : ''}">
      ${isPortfolio ? '' : createCheckButton(ticker, section, color)}
      ${icon}
      <div class="baseline inline">
        ${ticker}
      </div>
    </div>
  `);
}

function createPortfolioTableRow(dom, ticker, timeRange, color) {
  var change = data.getPortfolioChange(ticker, timeRange);
  dom.portfolioTable.append(`
    <tr id="${ticker}-portfolio-row" class="${data.isTickerInRange(ticker, '1Y') ? '' : 'hide'}">
      <td><a id="${ticker}-portfolio-table" class="${color}" href="#">${ticker}</a></td>
      <td class="right aligned">$<span id="${ticker}-portfolio-value">${data.getPortfolioValue(ticker).withCommas()}</span></td>
      <td id="${ticker}-portfolio-shares" class="right aligned">${data.getPortfolioShares(ticker)}</td>
      <td class="right aligned">
        <div class="${getColor(change)}">
          <i class="caret ${getArrow(change)} icon"></i>
          <span id="${ticker}-portfolio-change">${change.withCommas()}</span>%
        </div>
      </td>
      <td class="right aligned"><span id="${ticker}-portfolio-percent">${data.getPortfolioPercent(ticker).withCommas()}</span>%</td>
    </tr>
  `);
}

function createCompareTableRow(dom, ticker, timeRange, color) {
  var change = data.getChange(ticker, timeRange);
  dom.compareTable.append(`
    <tr id="${ticker}-compare-row" class="${data.getCompareChecked(ticker) ? '' : 'hide'}">
      <td><a id="${ticker}-compare-table" class="${color}" href="#">${ticker}</a></td>
      <td class="right aligned">$<span id="${ticker}-compare-price">${data.getPrice(ticker).withCommas()}</span></td>
      <td class="right aligned">
        <div class="${getColor(change)}">
          <i class="caret ${getArrow(change)} icon"></i>
          <span id="${ticker}-compare-change">${change.withCommas()}</span>%
        </div>
      </td>
      <td class="right aligned">${data.getMktCap(ticker)}</td>
      <td class="right aligned">${data.getPERatio(ticker).withCommas()}</td>
    </tr>
  `);
}
