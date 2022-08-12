import { getGoods } from "./serviceAPI.js";
import { tableRender } from "./tableView.js";

export const tableController = async () => {
  const goods = await getGoods();
  tableRender(goods);
};
