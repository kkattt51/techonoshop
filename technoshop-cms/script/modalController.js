import { form } from './elems.js';
import { hidePreview } from './previewController.js';

const openModal = (modal, classOpen) => {
  modal.classList.add(classOpen);
};

const closeModal = (modal, classOpen) => {
  form.reset();
  hidePreview();
  modal.classList.remove(classOpen);
};

export const modalController = ({ modal, modalBtn, classOpen, classClose }) => {
  modalBtn.addEventListener('click', () => {
    openModal(modal, classOpen);
  });

  modal.addEventListener('click', ({ target }) => {
    if (target === modal || target.classList.contains(classClose)) {
      closeModal(modal, classOpen);
    }
  });
};