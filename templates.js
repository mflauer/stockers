function createCheckButton(ticker, location='compare', color='') {
  var checked = data.getCompareChecked(ticker);
  if (location == 'company' && checked) {
    color = 'positive';
  }
  return `
    <div id="${ticker}-check-${location}" class="mini circular ui icon ${color} button">
      <i class="${checked ? 'check ' : ''} icon"></i>
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

function createCompareTableRow(dom, ticker, timeRange) {
  var change = data.getChange(ticker, timeRange);
  dom.compareTable.append(`
    <tr id="${ticker}-compare-row" class="${data.getCompareChecked(ticker) ? '' : 'hide'}">
      <td><a id="${ticker}-table" href="#">${ticker}</a></td>
      <td class="right aligned">$${data.getPrice(ticker).withCommas()}</td>
      <td class="right aligned">
        <div class="${change >= 0 ? 'green' : 'red'}">
          <i class="caret ${change >= 0 ? 'up' : 'down'} icon"></i>
          <span id="${ticker}-compare-change">${change.withCommas()}</span>%
        </div>
      </td>
      <td class="right aligned">${data.getMktCap(ticker)}</td>
      <td class="right aligned">${data.getPERatio(ticker).withCommas()}</td>
    </tr>
  `);
}
