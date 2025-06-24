import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: {
        title: 'Dashboard'
      }
    },
    {
      path: '/forms',
      name: 'FormsManagement',
      component: () => import('../views/FormsManagement.vue'),
      meta: {
        title: 'Forms Management'
      }
    },
    {
      path: '/forms/create',
      name: 'FormBuilder',
      component: () => import('../views/FormBuilder.vue'),
      meta: {
        title: 'Form Builder'
      }
    },
    {
      path: '/builder/:id',
      name: 'Builder',
      component: () => import('../views/FormBuilder.vue'),
      props: true,
      meta: {
        title: 'Form Builder'
      }
    },
    {
      path: '/forms/:id/edit',
      name: 'FormEditor',
      component: () => import('../views/FormBuilder.vue'),
      props: true,
      meta: {
        title: 'Edit Form'
      }
    },
    {
      path: '/forms/:id/preview',
      name: 'FormPreview',
      component: () => import('../views/FormPreview.vue'),
      props: true,
      meta: {
        title: 'Form Preview'
      }
    },
    {
      path: '/submissions',
      name: 'SubmissionsOverview',
      component: () => import('../views/SubmissionsOverview.vue'),
      meta: {
        title: 'Submissions Overview'
      }
    },
    {
      path: '/submissions/:formId',
      name: 'FormSubmissions', 
      component: () => import('../views/FormSubmissions.vue'),
      props: true,
      meta: {
        title: 'Form Submissions'
      }
    },
    {
      path: '/submissions/:formId/:submissionId',
      name: 'SubmissionDetail',
      component: () => import('../views/SubmissionDetail.vue'),
      props: true,
      meta: {
        title: 'Submission Details'
      }
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('../views/Analytics.vue'),
      meta: {
        title: 'Analytics'
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue'),
      meta: {
        title: 'Settings'
      }
    }
  ]
})

// Update document title based on route
router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - Form Builder` : 'Form Builder';
})

export default router
