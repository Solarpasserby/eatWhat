import { createRouter, createWebHistory } from 'vue-router'
import crud from '../views/CRUD.vue'
import review from '../views/Review.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/crud',
      name: 'crud',
      component: crud
    },
    {
      path: '/review',
      name: 'review',
      component: review
    }
  ]
})

export default router
