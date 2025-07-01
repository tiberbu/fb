import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: {
        title: 'Login',
        requiresGuest: true
      }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: {
        title: 'Dashboard',
        requiresAuth: true
      }
    },
    {
      path: '/forms',
      name: 'FormsManagement',
      component: () => import('../views/FormsManagement.vue'),
      meta: {
        title: 'Forms Management',
        requiresAuth: true
      }
    },
    {
      path: '/forms/create',
      name: 'FormBuilder',
      component: () => import('../views/FormBuilder.vue'),
      meta: {
        title: 'Form Builder',
        requiresAuth: true
      }
    },
    {
      path: '/builder/:id',
      name: 'Builder',
      component: () => import('../views/FormBuilder.vue'),
      props: true,
      meta: {
        title: 'Form Builder',
        requiresAuth: true
      }
    },
    {
      path: '/forms/:id/edit',
      name: 'FormEditor',
      component: () => import('../views/FormBuilder.vue'),
      props: true,
      meta: {
        title: 'Edit Form',
        requiresAuth: true
      }
    },
    {
      path: '/forms/:id/preview',
      name: 'FormPreview',
      component: () => import('../views/FormPreview.vue'),
      props: true,
      meta: {
        title: 'Form Preview',
        requiresAuth: true
      }
    },
    {
      path: '/submissions',
      name: 'SubmissionsOverview',
      component: () => import('../views/SubmissionsOverview.vue'),
      meta: {
        title: 'Submissions Overview',
        requiresAuth: true
      }
    },
    {
      path: '/submissions/:formId',
      name: 'FormSubmissions', 
      component: () => import('../views/FormSubmissions.vue'),
      props: true,
      meta: {
        title: 'Form Submissions',
        requiresAuth: true
      }
    },
    {
      path: '/submissions/:formId/:submissionId',
      name: 'SubmissionDetail',
      component: () => import('../views/SubmissionDetail.vue'),
      props: true,
      meta: {
        title: 'Submission Details',
        requiresAuth: true
      }
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('../views/Analytics.vue'),
      meta: {
        title: 'Analytics',
        requiresAuth: true
      }
    },
    {
      path: '/analytics/users',
      name: 'UserManagement',
      component: () => import('../views/UserManagement.vue'),
      meta: {
        title: 'User Management',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue'),
      meta: {
        title: 'Settings',
        requiresAuth: true
      }
    }
  ]
})

// Authentication guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.user && authStore.token) {
    await authStore.initializeAuth()
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check if route requires admin access
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Dashboard' })
    return
  }
  
  // Redirect authenticated users away from guest pages
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }
  
  next()
})

// Update document title based on route
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - TF Builder` : 'TF Builder';
})

export default router
