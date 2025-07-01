<template>
  <div v-if="!authStore.isAuthenticated" class="min-h-screen">
    <router-view />
  </div>
  
  <div v-else class="app-layout">
    <!-- Sidebar Navigation -->
    <aside class="app-sidebar">
      <div class="app-sidebar-header">
        <h2 class="app-title">
          <img 
            src="/logo-icon.svg" 
            alt="TF Builder" 
            class="app-logo"
          >
          TF Builder
        </h2>
      </div>
      
      <nav class="app-sidebar-nav">
        <router-link 
          to="/" 
          class="nav-item"
          active-class="nav-item-active"
        >
          <i class="fas fa-tachometer-alt" />
          <span>Dashboard</span>
        </router-link>
        
        <router-link 
          to="/forms" 
          class="nav-item"
          active-class="nav-item-active"
        >
          <i class="fas fa-file-alt" />
          <span>Forms</span>
        </router-link>
        
        <router-link 
          to="/submissions" 
          class="nav-item"
          active-class="nav-item-active"
        >
          <i class="fas fa-inbox" />
          <span>Submissions</span>
        </router-link>
        
        <router-link 
          to="/analytics" 
          class="nav-item"
          active-class="nav-item-active"
        >
          <i class="fas fa-chart-bar" />
          <span>Analytics</span>
        </router-link>
        
        <!-- User Management for Admins -->
        <router-link 
          v-if="authStore.isAdmin"
          to="/analytics/users" 
          class="nav-item nav-item-sub"
          active-class="nav-item-active"
        >
          <i class="fas fa-users" />
          <span>User Management</span>
        </router-link>
        
        <div class="nav-divider" />
        
        <router-link 
          to="/settings" 
          class="nav-item"
          active-class="nav-item-active"
        >
          <i class="fas fa-cog" />
          <span>Settings</span>
        </router-link>
      </nav>

      <!-- User Menu -->
      <div class="app-sidebar-footer">
        <div class="user-menu" @click="showUserMenu = !showUserMenu">
          <div class="user-avatar">
            {{ authStore.user?.username.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ authStore.user?.username }}</div>
            <div class="user-role">{{ authStore.user?.role }}</div>
          </div>
          <i class="fas fa-chevron-up" :class="{ 'rotate-180': showUserMenu }" />
        </div>
        
        <div v-if="showUserMenu" class="user-dropdown">
          <button @click="logout" class="dropdown-item">
            <i class="fas fa-sign-out-alt" />
            Logout
          </button>
        </div>
      </div>
    </aside>
    
    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Header (hidden for Form Builder) -->
      <header 
        v-if="!isFormBuilderRoute"
        class="main-header"
      >
        <div class="header-content">
          <div class="page-info">
            <h1 class="page-title">
              {{ pageTitle }}
            </h1>
            <p class="page-subtitle">
              {{ pageSubtitle }}
            </p>
          </div>
          
          <div class="header-actions">
            <button 
              v-if="showCreateButton"
              class="btn btn-primary btn-sm"
              @click="navigateToCreate"
            >
              <i class="fas fa-plus" />
              Create Form
            </button>
          </div>
        </div>
      </header>

      <!-- Router View -->
      <div class="content-area">
        <router-view />
      </div>
    </main>
    
    <!-- Toast Notifications -->
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormCreation } from '@/composables/useFormCreation'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import './assets/css/form-builder-enhanced.css'
import './assets/css/form-inputs.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { createNewForm } = useFormCreation()
const { success } = useToast()

// Component state
const showUserMenu = ref(false)

// Initialize auth on app load
onMounted(async () => {
  await authStore.initializeAuth()
})

const pageTitle = computed(() => {
  switch (route.name) {
    case 'Dashboard':
      return 'Dashboard'
    case 'FormsManagement':
      return 'Forms Management'
    case 'FormBuilder':
      return 'TF Builder'
    case 'SubmissionsOverview':
      return 'Submissions Overview'
    case 'FormSubmissions':
      return 'Form Submissions'
    case 'SubmissionDetail':
      return 'Submission Details'
    case 'Analytics':
      return 'Analytics'
    case 'UserManagement':
      return 'User Management'
    case 'Settings':
      return 'Settings'
    default:
      return 'TF Builder'
  }
})

const pageSubtitle = computed(() => {
  switch (route.name) {
    case 'Dashboard':
      return 'Overview of your forms and submissions'
    case 'FormsManagement':
      return 'Create, edit, and manage your forms'
    case 'FormBuilder':
      return 'Design your form with drag and drop'
    case 'SubmissionsOverview':
      return 'View all form submissions'
    case 'FormSubmissions':
      return 'Submissions for selected form'
    case 'SubmissionDetail':
      return 'Detailed view of submission'
    case 'Analytics':
      return 'Form performance and insights'
    case 'UserManagement':
      return 'Manage users and permissions'
    case 'Settings':
      return 'Application settings and preferences'
    default:
      return ''
  }
})

const showCreateButton = computed(() => {
  return ['Dashboard', 'FormsManagement'].includes(route.name as string)
})

const isFormBuilderRoute = computed(() => {
  return ['FormBuilder', 'Builder', 'FormEditor'].includes(route.name as string)
})

const navigateToCreate = async () => {
  await createNewForm()
}

const logout = async () => {
  await authStore.logout()
  success('Logged out successfully')
  router.push('/login')
  showUserMenu.value = false
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-subtle);
}

/* App Sidebar Styles */
.app-sidebar {
  width: 260px;
  background: white;
  color: #374151;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.app-sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1f2937;
}

.app-logo {
  width: 1.75rem;
  height: 1.75rem;
  color: #374151;
}

.app-sidebar-nav {
  padding: 1rem 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: #f9fafb;
  color: #374151;
  transform: translateX(4px);
}

.nav-item-active {
  background-color: #f3f4f6;
  color: #1f2937;
  border-right: 3px solid #000000;
  font-weight: 600;
}

.nav-item-sub {
  padding-left: 3rem;
  font-size: 0.9rem;
}

.nav-item i {
  width: 1.25rem;
  text-align: center;
}

.nav-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 1.5rem;
}

/* User Menu Styles */
.app-sidebar-footer {
  border-top: 1px solid #e5e7eb;
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-menu:hover {
  background-color: #f9fafb;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #000000 0%, #374151 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
}

.user-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  text-align: left;
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f9fafb;
  color: #374151;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  max-width: none;
}

.page-info {
  flex: 1;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.content-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .sidebar-nav .nav-item span {
    display: none;
  }
  
  .app-title span {
    display: none;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .content-area {
    padding: 1rem;
  }
}

/* Global button and utility styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
