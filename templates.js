function createCheckButton(ticker, location='compare', color='') {
  var checked = backend.getCompareChecked(ticker);
  if (location == 'company' && checked) {
    color = 'positive';
  }
  return `
    <button id="${ticker}-check-${location}" type="button" class="mini circular ui icon ${color} middle button">
      <i class="${checked ? 'check ' : ''} icon"></i>
    </button>
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

function createCompareItem(dom, ticker, color='') {
  dom.compareStocks.append(`
    <a id="${ticker}-item" class="compare-item ui basic fluid ${color} left button">
      ${createCheckButton(ticker, 'compare', color)}
      <i class="remove icon hide"></i>
      <div class="middle inline">
        ${ticker}
      </div>

    </a>
  `);
}

function createCompareTableRow(dom, ticker) {
  var data = backend.getData(ticker);
  dom.compareTable.append(`
    <tr id="${ticker}-compare-row" class="${backend.getCompareChecked(ticker) ? '' : 'hide'}">
      <td id="${ticker}-table"><a href="#">${ticker}</a></td>
      <td class="right aligned">$1000.00</td>
      <td class="right aligned">2.5%</td>
      <td class="right aligned">${data['mkt_cap']}</td>
      <td class="right aligned">${data['pe_ratio']}</td>
    </tr>
  `);
}
