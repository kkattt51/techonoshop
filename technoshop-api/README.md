# Technoshop
## API

Для запуска API необходимо установить Node.JS
RUN: `node index.js`

Доступные методы:
`GET` /api/category - получить список категорий
`POST` /api/goods - создать товар, в теле запроса нужно передать объект {title: string,price: number,display: number,description: string, category: string,image: string}
`PATCH` /api/goods/{id} - изменить товар с ID, в теле запроса нужно передать объект {title: string,price: number,display: number,description: string, category: string,image: string}
`DELETE` /api/goods/{id} - удалить товар по ID
`GET` /api/goods - получить список товаров
`GET` /api/goods/{id} - получить товар по его ID
`GET` /api/goods?{search=""} - найти товар по названию
`GET` /api/goods?{list="{id},{id}"} - получить товары по id
`GET` /api/goods?{category=""&maxprice=""} - фильтрация
Параметры:
- category
- minprice
- maxprice
- mindisplay
- maxdisplay




## License
MIT

