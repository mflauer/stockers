function createCheckButton(ticker, location='compare') {
  return `
    <button id="${ticker}-check-${location}" type="button" class="mini circular ui icon middle button">
      <i class="${backend.getCompareChecked(ticker) ? 'check ' : ''} icon"></i>
    </button>
  `;
}

function createCompanyHeader(ticker) {
  $('#company-page>.header').html(`
    <div class="ui right floated basic button">
      Buy
    </div>
    <div class="ui right floated basic button">
      ${createCheckButton(ticker, 'button')}
      Compare
    </div>
    ${ticker}
    <div class="sub header">${backend.getCompany(ticker)}</div>
  `);
}

function createCompareItem(ticker) {
  $('#compare-stocks').append(`
    <a id="${ticker}-item" class="item">
      ${createCheckButton(ticker)}
      <div class="middle inline">
        ${ticker.toUpperCase()}
      </div>
    </a>
  `);
}

function createCompareTableRow(ticker) {
  var data = backend.getData(ticker);
  $('#compare-table').append(`
    <tr id="${ticker}-compare-row" class="${backend.getCompareChecked(ticker) ? '' : 'hide'}">
      <td>${ticker.toUpperCase()}</td>
      <td class="right aligned">$1000.00</td>
      <td class="right aligned">2.5%</td>
      <td class="right aligned">${data['mkt_cap']}</td>
      <td class="right aligned">${data['pe_ratio']}</td>
    </tr>
  `);
}
