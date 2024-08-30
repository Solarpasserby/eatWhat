import { createRouter, createWebHistory } from 'vue-router'
import crud from '../views/CRUD.vue'
import login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/crud',
      name: 'crud',
      component: crud
    },
    {
      path: '/login',
      name: 'login',
      component: login
    }
  ]
})

export default router
