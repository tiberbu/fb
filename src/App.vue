<template>
  <div class="app-layout">
    <!-- Sidebar Navigation -->
    <aside class="app-sidebar">
      <div class="app-sidebar-header">
        <h2 class="app-title">
          <i class="fas fa-clipboard-list" />
          Form Builder
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
              class="btn btn-primary"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFormCreation } from '@/composables/useFormCreation'
import './assets/css/form-builder-enhanced.css'
import './assets/css/form-inputs.css'

const route = useRoute()
const { createNewForm } = useFormCreation()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'Dashboard':
      return 'Dashboard'
    case 'FormsManagement':
      return 'Forms Management'
    case 'FormBuilder':
      return 'Form Builder'
    case 'SubmissionsOverview':
      return 'Submissions Overview'
    case 'FormSubmissions':
      return 'Form Submissions'
    case 'SubmissionDetail':
      return 'Submission Details'
    case 'Analytics':
      return 'Analytics'
    case 'Settings':
      return 'Settings'
    default:
      return 'Form Builder'
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
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* App Sidebar Styles */
.app-sidebar {
  width: 260px;
  background: white;
  color: #374151;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-right: 1px solid #e5e7eb;
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

.app-title i {
  font-size: 1.5rem;
  color: #6b7280;
}

.app-sidebar-nav {
  padding: 1rem 0;
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
  border-right: 3px solid #6b7280;
  font-weight: 600;
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

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-primary {
  background: #374151;
  color: white;
  box-shadow: 0 2px 4px rgba(55, 65, 81, 0.3);
}

.btn-primary:hover {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(55, 65, 81, 0.4);
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
