function createCheckButton(ticker, location='compare', color='') {
  return `
    <button id="${ticker}-check-${location}" type="button" class="mini basic circular ui icon ${color} middle button">
      <i class="${backend.getCompareChecked(ticker) ? 'check ' : ''} icon"></i>
    </button>
  `;
}

function createCompanyHeader(ticker) {
  $('#company-page>.header').html(`
    <div class="ui right floated basic button">
      Buy
    </div>
    <div id="${ticker}-check-button" class="ui right floated basic button">
      ${createCheckButton(ticker, 'company')}
      <div id="compare-button" class="middle inline">
        Compare${backend.getCompareChecked(ticker) ? 'd ' : ''}
      </div>
    </div>
    ${ticker}
    <div class="sub header">${backend.getCompany(ticker)}</div>
  `);
}

function createCompareItem(ticker, color='') {
  $('#compare-stocks').append(`
    <a id="${ticker}-item" class="compare-button ui basic fluid ${color} left button">
      ${createCheckButton(ticker, 'compare', color)}
      <div class="middle inline">
        ${ticker}
      </div>
    </a>
  `);
}

function createCompareTableRow(ticker) {
  var data = backend.getData(ticker);
  $('#compare-table').append(`
    <tr id="${ticker}-compare-row" class="${backend.getCompareChecked(ticker) ? '' : 'hide'}">
      <td id="${ticker}-table"><a href="#">${ticker}</a></td>
      <td class="right aligned">$1000.00</td>
      <td class="right aligned">2.5%</td>
      <td class="right aligned">${data['mkt_cap']}</td>
      <td class="right aligned">${data['pe_ratio']}</td>
    </tr>
  `);
}
