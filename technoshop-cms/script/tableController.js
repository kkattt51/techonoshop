import { tableGoods } from "./elems.js";
import { modalController } from "./modalController.js";
import { getGoods } from "./serviceAPI.js";
import { tableRender } from "./tableView.js";

export const tableController = async () => {

  modalController({
    delegation: {
      parent: tableGoods,
      target: './table-goods-item',
      targetExclude: './btn-delete',
    }
  })

  const goods = await getGoods();
  tableRender(goods);
};
