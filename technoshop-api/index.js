// импорт стандартных библиотек Node.js
const {existsSync, mkdirSync, readFileSync, writeFileSync, writeFile, unlink} = require('fs');
const { createServer } = require("http");
const path = require("path");

// файл для базы данных
const DB_FILE = process.env.DB_FILE || path.resolve(__dirname, "db.json");
// номер порта, на котором будет запущен сервер
const PORT = process.env.PORT || 3024;
// префикс URI для всех методов приложения
const URI_PREFIX = "/api/goods";

function drainJson(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(JSON.parse(data));
    });
  });
}

/**
 * Класс ошибки, используется для отправки ответа с определённым кодом и описанием ошибки
 */
class ApiError extends Error {
  constructor(statusCode, data) {
    super();
    this.statusCode = statusCode;
    this.data = data;
  }
}

function isImageBase64(data) {
  return /^data:image/.test(data);
}

function isImageURL(data) {
  return /^img\//.test(data);
}

function dataURLtoFile(base64, id) {
  if (!existsSync("./img")) {
    mkdirSync("./img");
  }
  const format = base64.split(";")[0].split("/")[1];
  const ext = format === "svg+xml" ? "svg" : format === "jpeg" ? "jpg" : format;
  const base64Image = base64.split(";base64,").pop();
  writeFile(
    `./img/${id}.${ext}`,
    base64Image,
    { encoding: "base64" },
    (err) => {
      if (err) console.log(err);
    }
  );
  return `img/${id}.${ext}`;
}

const pagination = (goods, page, count, sort) => {
  const sortGoods = !sort.value
    ? goods
    : goods.sort((a, b) => {
        if (sort.value === "price") {
          if (sort.direction === "up") {
            return a.price > b.price ? 1 : -1;
          }
          return a.price > b.price ? -1 : 1;
        }

        if (sort.direction === "up") {
          return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
        }
        return a.title.toLowerCase() > b.title.toLowerCase() ? -1 : 1;
      });

  let end = count * page;
  let start = page === 1 ? 0 : end - count;

  const pages = Math.ceil(sortGoods.length / count);

  return {
    goods: sortGoods.slice(start, end),
    page,
    pages,
  };
};

function makeGoodsFromData(data, id) {
  const errors = [];

  function formattingArrStr(str) {
    if (!str) return false;
    return str
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => !!item)
      .map((item) => item[0].toUpperCase() + item.substring(1));
  }

  // составляем объект, где есть только необходимые поля
  const goods = {
    title: data.title,
    description: formattingArrStr(data.description),
    price: data.price,
    image: data.image ? data.image : data.imagesave,
    category: data.category,
    display: data.display ?? '',
  };


  // проверяем, все ли данные корректные и заполняем объект ошибок, которые нужно отдать клиенту
  if (!goods.title) {
    errors.push({ field: "title", message: "Не указано название товара" });
  }
  if (!goods.description) {
    errors.push({ field: "description", message: "Не указано описание" });
  }
  if (!goods.price) {
    errors.push({ field: "price", message: "Не указана цена" });
  }
  if (!goods.category) {
    errors.push({ field: "category", message: "Не указана категория товара" });
  }



  if (!goods.image) {
    errors.push({ field: "image", message: "Нет данных о изображении" });
  }

  if (isImageBase64(goods.image)) {
    const url = dataURLtoFile(goods.image, id);
    goods.image = url;
  } else if (!isImageURL(goods.image)) {
    errors.push({ field: "image", message: "Нет данных о изображении" });
  }

  if (errors.length) throw new ApiError(422, { errors });

  return goods;
}

function getGoodsList(params = {}) {
  const page = +params.page || 1;
  const paginationCount = params.count || 8;
  const sort = {
    value: params.sort,
    direction: params.direction || "up",
  };
  const goods = JSON.parse(readFileSync(DB_FILE) || "[]");

  let data = goods;

  if (params.search) {
    const search = params.search.trim().toLowerCase();
    data = goods.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.description.some((item) => item.toLowerCase().includes(search))
    );
  }

  if (params.list) {
    const list = params.list.trim().toLowerCase();
    return goods.filter((item) => list.includes(item.id));
  }

  if (params.category) {
    const category = params.category.trim().toLowerCase();
    const regExp = new RegExp(`^${category}$`);
    data = data.filter((item) => regExp.test(item.category.toLowerCase()));
  }

  if (params.color) {
    data = data.filter((item) => params.color?.includes(item.color));
  }

  if (params.minprice) {
    data = data.filter((item) => params.minprice <= item.price);
  }

  if (params.maxprice) {
    data = data.filter((item) => params.maxprice >= item.price);
  }

  if (params.mindisplay) {
    data = data.filter((item) => params.mindisplay <= item.display);
  }

  if (params.maxdisplay) {
    data = data.filter((item) => params.maxdisplay >= item.display);
  }

  if (params.nopage) return data;
  return pagination(data, page, paginationCount, sort);
}

function createGoods(data) {
  const id =
    Math.random().toString(10).substring(2, 8) +
    Date.now().toString(10).substring(9);
  const newItem = makeGoodsFromData(data, id);
  newItem.id = id;

  writeFileSync(DB_FILE, JSON.stringify([...getGoodsList({nopage: true}), newItem]), {
    encoding: "utf8",
  });
  return newItem;
}

function getItems(itemId) {
  const goods = JSON.parse(readFileSync(DB_FILE) || "[]");
  const item = goods.find(({ id }) => id === itemId);
  if (!item) throw new ApiError(404, { message: "Item Not Found" });
  return item;
}

function getCategory() {
  const goods = JSON.parse(readFileSync(DB_FILE) || "[]");
  const category = [...new Set(goods.map((item) => item.category))];
  return category;
}

function updateGoods(itemId, data) {
  const goods = getGoodsList({nopage: true});
  const itemIndex = goods.findIndex(({id}) => id === itemId);
  if (itemIndex === -1) throw new ApiError(404, {message: 'Goods Not Found'});
  Object.assign(goods[itemIndex], makeGoodsFromData({...goods[itemIndex], ...data}, itemId));
  writeFileSync(DB_FILE, JSON.stringify(goods), {encoding: 'utf8'});
  return goods[itemIndex];
}

function deleteGoods(itemId) {
  const goods = getGoodsList({nopage: true});
  const itemIndex = goods.findIndex(({id}) => id === itemId);

  if (itemIndex === -1) throw new ApiError(404, {message: 'Goods Not Found'});
  const item = goods.find(({id}) => id === itemId);
  unlink(`./${item.image}`, function(err){
    if (err) {
        console.log(err);
    } else {
        console.log("Файл удалён");
    }
});
  goods.splice(itemIndex, 1);
  writeFileSync(DB_FILE, JSON.stringify(goods), {encoding: 'utf8'});
  return {};
}

// создаём HTTP сервер, переданная функция будет реагировать на все запросы к нему
module.exports = server = createServer(async (req, res) => {
  // req - объект с информацией о запросе, res - объект для управления отправляемым ответом
  // чтобы не отклонять uri с img
  if (req.url.substring(1, 4) === "img") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/jpeg");
    require("fs").readFile(`.${req.url}`, (err, image) => {
      res.end(image);
    });
    return;
  }

  // этот заголовок ответа указывает, что тело ответа будет в JSON формате
  res.setHeader("Content-Type", "application/json");

  // CORS заголовки ответа для поддержки кросс-доменных запросов из браузера
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // запрос с методом OPTIONS может отправлять браузер автоматически для проверки CORS заголовков
  // в этом случае достаточно ответить с пустым телом и этими заголовками
  if (req.method === "OPTIONS") {
    // end = закончить формировать ответ и отправить его клиенту
    res.end();
    return;
  }

  if (req.url.includes("/api/category")) {
    const body = await (async () => {
      if (req.method === "GET") return getCategory();
    })();
    res.end(JSON.stringify(body));
    return;
  }

  // если URI не начинается с нужного префикса - можем сразу отдать 404
  if (!req.url || !req.url.startsWith(URI_PREFIX)) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Not Found" }));
    return;
  }

  // убираем из запроса префикс URI, разбиваем его на путь и параметры
  const [uri, query] = req.url.substring(URI_PREFIX.length).split("?");
  const queryParams = {};
  // параметры могут отсутствовать вообще или иметь вид a=b&b=c
  // во втором случае наполняем объект queryParams { a: 'b', b: 'c' }
  if (query) {
    for (const piece of query.split("&")) {
      const [key, value] = piece.split("=");
      queryParams[key] = value ? decodeURIComponent(value) : "";
    }
  }

  try {
    // обрабатываем запрос и формируем тело ответа
    const body = await (async () => {
      if (uri === "" || uri === "/") {
        if (req.method === "GET") return getGoodsList(queryParams);
        if (req.method === "POST") {
          const createdItem = createGoods(await drainJson(req));
          res.statusCode = 201;
          res.setHeader("Access-Control-Expose-Headers", "Location");
          res.setHeader("Location", `${URI_PREFIX}/${createdItem.id}`);
          return createdItem;
        }
      } else {
        // /api/goods/{id}
        // параметр {id} из URI запроса
        const itemId = uri.substring(1);
        if (req.method === "GET") return getItems(itemId);
        if (req.method === "PATCH")
          return updateGoods(itemId, await drainJson(req));
        if (req.method === "DELETE") return deleteGoods(itemId);
      }
      return null;
    })();
    res.end(JSON.stringify(body));
  } catch (err) {
    console.log("err: ", err);
    // обрабатываем сгенерированную нами же ошибку
    if (err instanceof ApiError) {
      res.writeHead(err.statusCode);
      res.end(JSON.stringify(err.data));
    } else {
      // если что-то пошло не так - пишем об этом в консоль и возвращаем 500 ошибку сервера
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Server Error" }));
    }
  }
})
  // выводим инструкцию, как только сервер запустился...
  .on("listening", () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `Сервер CRM запущен. Вы можете использовать его по адресу http://localhost:${PORT}`
      );
      console.log("Нажмите CTRL+C, чтобы остановить сервер");
      console.log("Доступные методы:");
      console.log(`GET /api/category - получить список категорий`);
      console.log(
        `POST ${URI_PREFIX} - создать товар, в теле запроса нужно передать объект {title: string,price: number,display: number,description: string, category: string,image: string}`
      );
      console.log(
        `PATCH ${URI_PREFIX}/{id} - изменить товар с ID, в теле запроса нужно передать объект {title: string,price: number,display: number,description: string, category: string,image: string}`
      );
      console.log(`DELETE ${URI_PREFIX}/{id} - удалить товар по ID`);
      console.log(`GET ${URI_PREFIX} - получить список товаров`);
      console.log(`GET ${URI_PREFIX}/{id} - получить товар по его ID`);
      console.log(`GET ${URI_PREFIX}?{search=""} - найти товар по названию`);
      console.log(
        `GET ${URI_PREFIX}?{category=""&maxprice=""} - фильтрация
Параметры:
        category
        minprice
        maxprice
        mindisplay
        maxdisplay`
      );
      console.log(
        `GET ${URI_PREFIX}?{list="{id},{id}"} - получить товары по id`
      );
    }
  })
  // ...и вызываем запуск сервера на указанном порту
  .listen(PORT);
