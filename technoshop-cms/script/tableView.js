import { tableGoods } from "./elems.js";
import { currencyFormatRUB } from "./utils.js";

export const renderRow = ({ id, title, category, price }) => {
  const rowGoods = document,createElement('tr');
  rowGoods.classList.add('table-row', 'table-goods-item');
  rowGoods.dataset.id = id;
  const tr = document.createElement("tr");
  tr.className = "table-row table-goods-item";
  
  rowGoods.innerHTML = `
    <td>${id}</td>
    <td>${title}</td>
    <td>${category}</td>
    <td class="text-end">${currencyFormatRUB(price)}</td>
    <td class="d-flex">
      <button class="btn-table btn-delete">
        <svg width="30" height="30">
          <use xlink:href="#delete" />
        </svg>
      </button>
    </td>
  `;

  tableGoods.append(rowGoods);
};

export const tableRender = (goods) => {
  tableGoods.textContent = "";
  const rows = goods.map(renderRow);
  tableGoods.append(...rows);
};
