function createStockItem(ticker, checked) {
  return `
    <div id="${ticker}-item" class="item">
      <button type="button" class="mini circular ui icon button compare-check-button">
        <i class="${checked ? 'check ' : ''} icon"></i>
      </button>
      <a>${ticker.toUpperCase()}</a>
    </div>
  `;
}

function createTableRow(ticker, hide, price, change, mkt_cap, pe_ratio) {
  return `
    <tr id="${ticker}-compare-row" class="${hide ? 'hide' : ''}">
      <td>${ticker.toUpperCase()}</td>
      <td class="right aligned">${price}</td>
      <td class="right aligned">${change}</td>
      <td class="right aligned">${mkt_cap}</td>
      <td class="right aligned">${pe_ratio}</td>
    </tr>
  `;
}
