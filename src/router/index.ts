import { createRouter, createWebHistory } from 'vue-router'
import FormContainer from '../views/FormContainer.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'FormContainer',
      component: FormContainer
    },
    {
      path: '/builder',
      name: 'FormBuilder',
      component: () => import('../views/FormBuilder.vue')
    },
    {
      path: '/preview',
      name: 'FormPreview',
      component: () => import('../views/FormPreview.vue')
    }
  ]
})

export default router
