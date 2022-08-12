import { wrapperSort } from "./elems";
import { getGoods } from "./serviceAPI";
import { tableRender } from "./tableView";

export const sortController = () => {
  wrapperSort.addEventListener("click", async ({ target }) => {
    const sortField = target.dataset.sort;

    if (sortField) {
      const goods = await getGoods();

      switch (sortField) {
        case "id":
        case "price":
          if (target.dataset.direction === "up") {
            target.dataset.direction = "down";
            goods.sort((a, b) => (a[sortField] > b[sortField] ? -1 : 1));
          } else {
            target.dataset.direction = "up";
            goods.sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1));
          }
          break;
        case "title":
        case "category":
          if (target.dataset.direction === "up") {
            target.dataset.direction = "down";
            goods.sort((a, b) => b[sortField].localCompare(a[sortField], "ru"));
          } else {
            target.dataset.direction = "up";
            goods.sort((a, b) => a[sortField].localCompare(b[sortField], "ru"));
          }
          break;
      }

      tableRender(goods);
    }
  });
};
