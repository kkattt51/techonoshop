import { API_URI } from './const.js';

export const getGoods = async () => {
    const response = await fetch(`${API_URI}api/goods/${id ? id : '?nopage=true'}`);
    if (response.ok) {
        return response.json();
    }
    throw new Error(response.status);
}
export const postGoods = async (data) => {
    const response = await fetch(`${API_URI}api/goods`, {
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',    
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        return response.json();
    }
    throw new Error(response.status);
}

export const getCategory = async () => fetch(`${API_URI}api/category`).then(response => response.json());