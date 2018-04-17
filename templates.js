function createCheckButton(ticker, location='compare', color='') {
  var checked = backend.getCompareChecked(ticker);
  if (location == 'company' && checked) {
    color = 'positive';
  }
  return `
    <div id="${ticker}-check-${location}" class="mini circular ui icon ${color} middle button">
      <i class="${checked ? 'check ' : ''} icon"></i>
    </div>
  `;
}

function createCompanyHeader(dom, ticker) {
  dom.companyTicker.text(ticker);
  dom.companyName.text(backend.getCompany(ticker));
  dom.compareButton.children().first().replaceWith(createCheckButton(ticker, 'company'));
  if (backend.getCompareChecked(ticker)) {
    dom.compareButton.addClass('positive');
  } else {
    dom.compareButton.removeClass('positive');
  }
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
  dom.compareTable.append(`
    <tr id="${ticker}-compare-row" class="${backend.getCompareChecked(ticker) ? '' : 'hide'}">
      <td id="${ticker}-table"><a href="#">${ticker}</a></td>
      <td class="right aligned">$${backend.getPrice(ticker)}</td>
      <td class="right aligned"><span id="${ticker}-compare-change">${backend.getChange(ticker, timeRange)}</span>%</td>
      <td class="right aligned">${backend.getMktCap(ticker)}</td>
      <td class="right aligned">${backend.getPERatio(ticker)}</td>
    </tr>
  `);
}
