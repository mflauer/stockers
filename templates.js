function createCompareItem(ticker) {
  $('#compare-stocks').append(`
    <div id="${ticker}-item" class="item">
      <button type="button" class="mini circular ui icon button compare-check-button">
        <i class="${backend.getCompareChecked(ticker) ? 'check ' : ''} icon"></i>
      </button>
      ${ticker.toUpperCase()}
    </div>
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
