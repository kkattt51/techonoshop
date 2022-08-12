import { tableGoods } from "./elems.js";
import { currencyFormatRUB } from "./utils.js";

const createRow = ({ id, title, category, price }) => {
  const tr = document.createElement("tr");
  tr.className = "table-row table-goods-item";
  tr.dataset.id = id;
  const tdId = document.createElement("td");
  tdId.textContent = id;
  const tdTitle = document.createElement("td");
  tdTitle.textContent = title;
  const tdCategory = document.createElement("td");
  tdCategory.textContent = category;
  const tdPrice = document.createElement("td");
  tdPrice.textContent = currencyFormatRUB(price);
  const tdButton = document.createElement("td");
  tdButton.className = "d-flex";
  const button = document.createElement("button");
  button.className = "btn-table btn-delete";
  button.insertAdjacentHTML(
    "afterbegin",
    `<svg width="30" height="30">
      <use href="#delete" />
    </svg>`
  );
  tdButton.append(button);
  tr.append(tdId, tdTitle, tdCategory, tdPrice, tdButton);
  return tr;
};

export const tableRender = (goods) => {
  tableGoods.textContent = "";
  const rows = goods.map(createRow);
  tableGoods.append(...rows);
};
