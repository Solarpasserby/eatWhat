import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const instance = axios.create({
  baseURL: "https://eat.vincent.0nline.tech/",
});

// 是否正在刷新的标记
let isRefreshing = false;
// 重试队列，每一项将是一个待执行的函数形式
let requests = [];

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在请求中添加 Token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求错误时的处理
    console.log(error);
    return Promise.reject(error);
  }
);

function refreshToken() {
  var postBody = localStorage.getItem("rawToken");
  return instance.post("/users/token/refresh", JSON.parse(postBody), {
    "Content-Type": "application/json",
  });
}

function setToken(token, rawToken) {
  instance.defaults.headers["Authorization"] = `Bearer ${token}`;
  localStorage.setItem("token", token);
  localStorage.setItem("rawToken", rawToken);
}

instance.interceptors.response.use(
  (response) => {
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    if (response.status === 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    if (error.response.status === 401) {
      var config = error.config; //获取401失败请求的axios中的config配置数据

      if (!isRefreshing) {
        //没有刷新
        isRefreshing = true;

        return refreshToken()
          .then(
            (res) => {
              const token = res.data.access_token;
              const rawToken = res.data;

              setToken(token, rawToken);
              config.headers["Authorization"] = `Bearer ${token}`;
              // 已经刷新了token，将所有队列中的请求进行重试
              requests.forEach((cb) => cb(token));
              requests = [];
              return instance(config);
            },
            (err) => {
              alert(error.response.data.message);
              router.push("/login"); //跳转到登录页
            }
          )
          .catch((res) => {
            console.error("rawtoken error =>", res);
          })
          .finally(() => {
            //无论是否有触发异常，该语句都会执行
            isRefreshing = false;
          });
      } else {
        // 保存函数 等待执行
        // 吧请求都保存起来 等刷新完成后再一个一个调用
        new Promise((resolve) => {
          // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
          requests.push((token) => {
            config.headers["Authorization"] = `Bearer ${token}`;
            resolve(instance(config));
          });
        });
      }
    }
    return Promise.reject(error.response);
  }
);

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

function deleteDishById(id) {
  return instance.delete(`/dish/${id}`);
}

function deleteNewDish(id) {
  return instance.delete(`/new/${id}`);
}

export {
  setToken,
  getDishesByCanteen,
  getNewDishes,
  getDishById,
  getCarousel,
  postUploadExcel,
  postAddDish,
  postCarousel,
  postNewDish,
  putEditDish,
  deleteDishById,
  deleteNewDish,
};
