import { tableGoods } from "./elems.js";
import { modalController } from "./modalController.js";
import { getGoods, deleteGoods } from "./serviceAPI.js";
import { modal, tableRender } from "./tableView.js";

export const tableController = async () => {

  modalController({
    delegation: {
      parent: tableGoods,
      target: './table-goods-item',
      targetExclude: './btn-delete',
    }
  })

  tableGoods.addEventListener('click', async ({target}) => {
    const delBtn = target.closest('btn-delete');
    if (delBtn) {
      const row = delBtn.closest('.table-goods-item');
      const isDel = await deleteGoods(row.dataset.id);

      if (isDel) {
        row.remove();
      }
    }
  });

  const goods = await getGoods();
  tableRender(goods);
};
