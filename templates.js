function createCheckButton(ticker, location='compare', color='') {
  var checked = data.getCompareChecked(ticker);
  if (location == 'company' && checked) {
    color = 'positive';
  }
  return `
    <div id="${ticker}-check-${location}" class="mini circular ui icon ${color} middle button">
      <i class="${checked ? 'check ' : ''} icon"></i>
    </div>
  `;
}

function createCompareItem(dom, ticker, color='', suggested=false) {
  if (suggested) {
    var element = dom.suggestedStocks;
    var location = 'suggested';
    var icon = '';
  } else {
    var element = dom.compareStocks;
    var location = 'compare';
    var icon = `<i id="${ticker}-remove" class="close link icon hide"></i>`;
  }
  element.append(`
    <div id="${ticker}-item" class="compare-item ui basic fluid ${color} left button">
      ${createCheckButton(ticker, location, color)}
      ${icon}
      <div class="middle inline">
        ${ticker}
      </div>
    </div>
  `);
}

function createCompareTableRow(dom, ticker, timeRange) {
  var change = data.getChange(ticker, timeRange);
  dom.compareTable.append(`
    <tr id="${ticker}-compare-row" class="${data.getCompareChecked(ticker) ? '' : 'hide'}">
      <td id="${ticker}-table"><a href="#">${ticker}</a></td>
      <td class="right aligned">$${data.getPrice(ticker)}</td>
      <td class="right aligned">
        <div class="${change >= 0 ? 'green' : 'red'}">
          <i class="caret ${change >= 0 ? 'up' : 'down'} icon"></i>
          <span id="${ticker}-compare-change">${change}</span>%
        </div>
      </td>
      <td class="right aligned">${data.getMktCap(ticker)}</td>
      <td class="right aligned">${data.getPERatio(ticker)}</td>
    </tr>
  `);
}
