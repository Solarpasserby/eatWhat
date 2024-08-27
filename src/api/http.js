import axios from "axios";

const instance = axios.create({
  baseURL:
    "https://eat.vincent.0nline.tech/",
});

// // 添加请求拦截器
// instance.interceptors.request.use(
//   (config) => {
//     // 在请求中添加 Token
//     // const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     // 请求错误时的处理
//     console.log(error);
//     return Promise.reject(error);
//   }
// );

async function getDishesByCanteen(canteen) {
  try {
    const res = await instance.get(`/dish/${canteen}/all`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

async function getNewDishes(canteen) {
  try {
    const res = await instance.get(`/new/${canteen}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

async function getDishById(id) {
  try {
    const res = await instance.get(`/dish/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

async function getCarousel(canteen) {
  try {
    const res = await instance.get(`/carousel/${canteen}`);
    return res;
  } catch (error) {
    console.log(error);
  }
}

function postUploadExcel(formData) {
  return instance.post("/dish/excel", formData, {
    "Content-Type": "multipart/form-data",
  });
}

function postAddDish(csAddData) {
  return instance.post("/dish", csAddData, {
    "Content-Type": "application/json",
  });
}

function postCarousel(carousel) {
  return instance.post("/carousel", carousel, {
    "Content-Type": "application/json",
  });
}

function postNewDish(id) {
  return instance.post(`/new?id=${id}`);
}

function putEditDish(dish) {
  return instance.put("/dish", dish, {
    "Content-Type": "application/json",
  });
}

function deleteDishById (id) {
  return instance.delete(`/dish/${id}`);
}

function deleteNewDish(id) {
  return instance.delete(`/new/${id}`);
}

export { getDishesByCanteen, getNewDishes, getDishById, getCarousel, postUploadExcel, postAddDish, postCarousel, postNewDish, putEditDish, deleteDishById, deleteNewDish };
