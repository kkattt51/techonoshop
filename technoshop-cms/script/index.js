import { modalBtn, modal } from "./elems.js";
import { formController } from "./formController.js";
import { modalController } from "./modalController.js";
import { previewController } from "./previewController.js";
import { sortController } from "./sortController.js";
import { tableController } from "./tableController.js";

const init = () => {
  modalController({
    btn: modalBtn,
  });
  previewController();
  tableController();
  formController();
  sortController();
};

init();
