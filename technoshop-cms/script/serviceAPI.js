import { API_URI } from './const.js';

export const getGoods = () => fetch(`${API_URI}/goods?nopage=true`).then(response => response.json());

export const getCategory = () => fetch(`${API_URI}/category`).then(response => response.json());