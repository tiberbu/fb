<template>
  <div class="dashboard">
    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-file-alt" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ stats.totalForms }}
          </h3>
          <p class="stat-label">
            Total Forms
          </p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon submissions">
          <i class="fas fa-inbox" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ stats.totalSubmissions }}
          </h3>
          <p class="stat-label">
            Total Submissions
          </p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="fas fa-chart-line" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ stats.activeForms }}
          </h3>
          <p class="stat-label">
            Active Forms
          </p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon recent">
          <i class="fas fa-clock" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ stats.recentSubmissions }}
          </h3>
          <p class="stat-label">
            This Week
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="dashboard-section">
      <h2 class="section-title">
        Quick Actions
      </h2>
      <div class="action-cards">
        <router-link 
          to="/builder" 
          class="action-card create"
        >
          <div class="action-icon">
            <i class="fas fa-plus-circle" />
          </div>
          <h3>Create New Form</h3>
          <p>Start building a new form from scratch</p>
        </router-link>
        
        <router-link 
          to="/forms" 
          class="action-card manage"
        >
          <div class="action-icon">
            <i class="fas fa-edit" />
          </div>
          <h3>Manage Forms</h3>
          <p>Edit, duplicate, or delete existing forms</p>
        </router-link>
        
        <router-link 
          to="/submissions" 
          class="action-card view"
        >
          <div class="action-icon">
            <i class="fas fa-eye" />
          </div>
          <h3>View Submissions</h3>
          <p>Review and analyze form responses</p>
        </router-link>
        
        <router-link 
          to="/analytics" 
          class="action-card analytics"
        >
          <div class="action-icon">
            <i class="fas fa-chart-bar" />
          </div>
          <h3>Analytics</h3>
          <p>View performance insights and reports</p>
        </router-link>
      </div>
    </div>

    <!-- Recent Forms -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2 class="section-title">
          Recent Forms
        </h2>
        <router-link 
          to="/forms" 
          class="view-all-link"
        >
          View All
        </router-link>
      </div>
      
      <div class="forms-grid">
        <div 
          v-if="loading"
          class="loading-state"
        >
          <i class="fas fa-spinner fa-spin" />
          <p>Loading forms...</p>
        </div>
        
        <div 
          v-else-if="recentForms.length === 0"
          class="empty-state"
        >
          <i class="fas fa-file-alt" />
          <h3>No Forms Yet</h3>
          <p>Create your first form to get started</p>
          <router-link 
            to="/builder" 
            class="btn btn-primary"
          >
            Create Form
          </router-link>
        </div>
        
        <div 
          v-for="form in recentForms" 
          v-else
          :key="form._id"
          class="form-card"
        >
          <div class="form-header">
            <h4 class="form-title">
              {{ form.name }}
            </h4>
            <div class="form-actions">
              <button 
                class="action-btn"
                @click="editForm(form._id)"
              >
                <i class="fas fa-edit" />
              </button>
              <button 
                class="action-btn"
                @click="viewSubmissions(form._id)"
              >
                <i class="fas fa-inbox" />
              </button>
            </div>
          </div>
          
          <p class="form-description">
            {{ form.description || 'No description provided' }}
          </p>
          
          <div class="form-meta">
            <span class="form-status">
              <i 
                class="fas fa-circle"
                :class="form.isActive ? 'text-green-500' : 'text-gray-400'"
              />
              {{ form.isActive ? 'Active' : 'Inactive' }}
            </span>
            <span class="form-date">
              Updated {{ formatDate(form.updatedAt) }}
            </span>
          </div>
          
          <div class="form-stats">
            <div class="stat-item">
              <i class="fas fa-eye" />
              <span>{{ form.submissionCount || 0 }} submissions</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-layer-group" />
              <span>{{ form.fields?.length || 0 }} fields</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2 class="section-title">
          Recent Submissions
        </h2>
        <router-link 
          to="/submissions" 
          class="view-all-link"
        >
          View All
        </router-link>
      </div>
      
      <div class="submissions-list">
        <div 
          v-if="recentSubmissions.length === 0"
          class="empty-state"
        >
          <i class="fas fa-inbox" />
          <h3>No Submissions Yet</h3>
          <p>Submissions will appear here once users start filling out your forms</p>
        </div>
        
        <div 
          v-for="submission in recentSubmissions" 
          v-else
          :key="submission._id"
          class="submission-item"
          @click="viewSubmission(submission._id)"
        >
          <div class="submission-content">
            <h4 class="submission-form">
              {{ submission.formName }}
            </h4>
            <p class="submission-date">
              {{ formatDate(submission.submittedAt) }}
            </p>
          </div>
          <div class="submission-action">
            <i class="fas fa-chevron-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFormAPI } from '@/composables/useFormAPI'

const router = useRouter()
const { savedForms, submissions, loading, loadSavedForms, loadSubmissions } = useFormAPI()

const recentForms = computed(() => {
  return savedForms.value.slice(0, 6)
})

const recentSubmissions = computed(() => {
  return submissions.value.slice(0, 5)
})

const stats = computed(() => ({
  totalForms: savedForms.value.length,
  totalSubmissions: submissions.value.length,
  activeForms: savedForms.value.filter((f: any) => f.isActive).length,
  recentSubmissions: submissions.value.filter((s: any) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(s.submittedAt) > weekAgo
  }).length
}))

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const editForm = (formId: string) => {
  router.push(`/builder/${formId}`)
}

const viewSubmissions = (formId: string) => {
  router.push(`/forms/${formId}/submissions`)
}

const viewSubmission = (submissionId: string) => {
  router.push(`/submissions/${submissionId}`)
}

onMounted(async () => {
  await Promise.all([
    loadSavedForms(),
    loadSubmissions()
  ])
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.25rem;
}

.stat-icon.submissions {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.recent {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Dashboard Sections */
.dashboard-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* Action Cards */
.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  display: block;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.action-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.action-card.create .action-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-card.manage .action-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.action-card.view .action-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.action-card.analytics .action-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.action-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.action-card p {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Forms Grid */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.form-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.form-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.form-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.75rem;
}

.form-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
}

.form-date {
  color: #9ca3af;
}

.form-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Submissions List */
.submissions-list {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.submission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submission-item:last-child {
  border-bottom: none;
}

.submission-item:hover {
  background: #f9fafb;
}

.submission-form {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.submission-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.submission-action {
  color: #9ca3af;
}

/* Empty and Loading States */
.empty-state,
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state i,
.loading-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-cards {
    grid-template-columns: 1fr;
  }
  
  .forms-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
