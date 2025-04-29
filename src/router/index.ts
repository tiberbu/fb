import { createRouter, createWebHistory } from 'vue-router'
import FormBuilder from '../views/FormBuilder.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'FormBuilder',
      component: FormBuilder
    },
    {
      path: '/preview',
      name: 'FormPreview',
      component: () => import('../views/FormPreview.vue')
    }
  ]
})

export default router
