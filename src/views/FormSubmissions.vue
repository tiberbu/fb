<template>
  <div class="form-submissions">
    <!-- Form Info Header -->
    <div class="form-info-section">
      <div 
        v-if="loading && !formInfo"
        class="loading-state"
      >
        <i class="fas fa-spinner fa-spin" />
        <p>Loading form information...</p>
      </div>
      
      <div 
        v-else-if="formInfo"
        class="form-info-card"
      >
        <div class="form-details">
          <h2 class="form-name">
            {{ formInfo.name }}
          </h2>
          <p 
            v-if="formInfo.description"
            class="form-description"
          >
            {{ formInfo.description }}
          </p>
          
          <div class="form-meta">
            <div class="meta-item">
              <i class="fas fa-calendar" />
              <span>Created {{ formatDate(formInfo.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-edit" />
              <span>Updated {{ formatDate(formInfo.updatedAt) }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-layer-group" />
              <span>{{ formInfo.fields?.length || 0 }} fields</span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <router-link 
            :to="`/builder/${formId}`"
            class="btn btn-secondary"
          >
            <i class="fas fa-edit" />
            Edit Form
          </router-link>
          
          <router-link 
            :to="`/forms/${formId}/preview`"
            class="btn btn-secondary"
          >
            <i class="fas fa-eye" />
            Preview
          </router-link>
        </div>
      </div>
    </div>

    <!-- Submissions Stats -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-inbox" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ filteredSubmissions.length }}
          </h3>
          <p class="stat-label">
            Total Submissions
          </p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon today">
          <i class="fas fa-calendar-day" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ todaySubmissions }}
          </h3>
          <p class="stat-label">
            Today
          </p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon week">
          <i class="fas fa-calendar-week" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ weekSubmissions }}
          </h3>
          <p class="stat-label">
            This Week
          </p>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-section">
      <div class="search-filters">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search submissions..."
            class="search-input"
          >
        </div>
        
        <select 
          v-model="statusFilter"
          class="form-select"
        >
          <option value="">
            All Statuses
          </option>
          <option value="submitted">
            Submitted
          </option>
          <option value="processed">
            Processed
          </option>
          <option value="archived">
            Archived
          </option>
        </select>
        
        <input 
          v-model="dateFilter"
          type="date"
          class="form-input"
        >
      </div>
      
      <div class="action-buttons">
        <button 
          :disabled="loading"
          class="btn btn-secondary"
          @click="refreshSubmissions"
        >
          <i 
            class="fas fa-sync-alt"
            :class="{ 'fa-spin': loading }"
          />
          Refresh
        </button>
        
        <button 
          :disabled="selectedSubmissions.length === 0"
          class="btn btn-secondary"
          @click="exportSelected"
        >
          <i class="fas fa-download" />
          Export ({{ selectedSubmissions.length }})
        </button>
      </div>
    </div>

    <!-- Submissions List -->
    <div class="submissions-section">
      <div 
        v-if="loading && formSubmissions.length === 0"
        class="loading-state"
      >
        <i class="fas fa-spinner fa-spin" />
        <p>Loading submissions...</p>
      </div>
      
      <div 
        v-else-if="filteredSubmissions.length === 0"
        class="empty-state"
      >
        <i class="fas fa-inbox" />
        <h3>{{ hasFilters ? 'No submissions found' : 'No submissions yet' }}</h3>
        <p>
          {{ hasFilters 
            ? 'Try adjusting your search or filter criteria' 
            : 'Submissions will appear here once users fill out this form' 
          }}
        </p>
        <router-link 
          v-if="!hasFilters"
          :to="`/forms/${formId}/preview`"
          class="btn btn-primary"
        >
          <i class="fas fa-eye" />
          Preview Form
        </router-link>
      </div>
      
      <div 
        v-else
        class="submissions-container"
      >
        <!-- Bulk Actions -->
        <div class="bulk-actions">
          <div class="selection-info">
            <input 
              v-model="selectAll"
              type="checkbox"
              class="checkbox"
              @change="toggleSelectAll"
            >
            <span class="selection-text">
              {{ selectedSubmissions.length > 0 
                ? `${selectedSubmissions.length} selected` 
                : `${filteredSubmissions.length} submissions` 
              }}
            </span>
          </div>
          
          <div 
            v-if="selectedSubmissions.length > 0"
            class="bulk-action-buttons"
          >
            <button 
              class="bulk-btn"
              @click="markAsProcessed"
            >
              <i class="fas fa-check" />
              Mark as Processed
            </button>
            <button 
              class="bulk-btn"
              @click="archiveSelected"
            >
              <i class="fas fa-archive" />
              Archive
            </button>
          </div>
        </div>

        <!-- Submissions Grid -->
        <div class="submissions-grid">
          <div 
            v-for="submission in paginatedSubmissions"
            :key="submission._id"
            class="submission-card"
            :class="{ 'selected': selectedSubmissions.includes(submission._id) }"
          >
            <div class="submission-header">
              <div class="submission-select">
                <input 
                  v-model="selectedSubmissions"
                  type="checkbox"
                  class="checkbox"
                  :value="submission._id"
                >
              </div>
              
              <div class="submission-meta">
                <span class="submission-date">
                  {{ formatDate(submission.submittedAt) }}
                </span>
                <span class="submission-time">
                  {{ formatTime(submission.submittedAt) }}
                </span>
              </div>
              
              <div class="submission-status">
                <span 
                  class="status-badge"
                  :class="submission.status"
                >
                  {{ submission.status }}
                </span>
              </div>
            </div>
            
            <div class="submission-content">
              <div class="submission-data">
                <div 
                  v-for="(value, key) in getDisplayData(submission.data)"
                  :key="key"
                  class="data-item"
                >
                  <span class="data-label">{{ formatFieldName(String(key)) }}:</span>
                  <span class="data-value">{{ formatFieldValue(value) }}</span>
                </div>
              </div>
              
              <div class="submission-actions">
                <button 
                  title="View Details"
                  class="action-btn view"
                  @click="viewSubmission(submission._id)"
                >
                  <i class="fas fa-eye" />
                </button>
                
                <button 
                  title="Export"
                  class="action-btn export"
                  @click="exportSubmission(submission._id)"
                >
                  <i class="fas fa-download" />
                </button>
                
                <div class="dropdown">
                  <button 
                    title="More Actions"
                    class="action-btn more"
                    @click="toggleDropdown(submission._id)"
                  >
                    <i class="fas fa-ellipsis-v" />
                  </button>
                  
                  <div 
                    v-if="activeDropdown === submission._id"
                    class="dropdown-menu"
                  >
                    <button 
                      class="dropdown-item"
                      @click="updateStatus(submission._id, 'processed')"
                    >
                      <i class="fas fa-check" />
                      Mark as Processed
                    </button>
                    
                    <button 
                      class="dropdown-item"
                      @click="updateStatus(submission._id, 'archived')"
                    >
                      <i class="fas fa-archive" />
                      Archive
                    </button>
                    
                    <hr class="dropdown-divider">
                    
                    <button 
                      class="dropdown-item danger"
                      @click="deleteSubmission(submission._id)"
                    >
                      <i class="fas fa-trash" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div 
          v-if="totalPages > 1"
          class="pagination-container"
        >
          <div class="pagination-info">
            Showing {{ paginationStart }}-{{ paginationEnd }} of {{ filteredSubmissions.length }} submissions
          </div>
          
          <div class="pagination-controls">
            <button 
              :disabled="currentPage === 1"
              class="pagination-btn"
              @click="goToPage(currentPage - 1)"
            >
              <i class="fas fa-chevron-left" />
            </button>
            
            <span class="page-numbers">
              <button 
                v-for="page in visiblePages"
                :key="page"
                class="page-btn"
                :class="{ active: page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </span>
            
            <button 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
              @click="goToPage(currentPage + 1)"
            >
              <i class="fas fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormAPI } from '@/composables/useFormAPI'

const route = useRoute()
const router = useRouter()
const { savedForms, submissions, loading, loadSavedForms, loadSubmissions, updateSubmissionStatus } = useFormAPI()

const formId = computed(() => route.params.formId as string)

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const selectedSubmissions = ref<string[]>([])
const selectAll = ref(false)
const activeDropdown = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Computed properties
const formInfo = computed(() => {
  return savedForms.value.find((form: any) => form._id === formId.value)
})

const formSubmissions = computed(() => {
  return submissions.value.filter((submission: any) => submission.formId === formId.value)
})

const filteredSubmissions = computed(() => {
  let filtered = formSubmissions.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((submission: any) =>
      submission.submittedBy?.toLowerCase().includes(query) ||
      JSON.stringify(submission.data).toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((submission: any) => 
      submission.status === statusFilter.value
    )
  }

  // Date filter
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    filtered = filtered.filter((submission: any) => {
      const submissionDate = new Date(submission.submittedAt)
      return submissionDate.toDateString() === filterDate.toDateString()
    })
  }

  return filtered.sort((a: any, b: any) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
})

const hasFilters = computed(() => {
  return !!(searchQuery.value || statusFilter.value || dateFilter.value)
})

const todaySubmissions = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return formSubmissions.value.filter((s: any) => 
    new Date(s.submittedAt) >= today
  ).length
})

const weekSubmissions = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return formSubmissions.value.filter((s: any) => 
    new Date(s.submittedAt) >= weekAgo
  ).length
})

const totalPages = computed(() => 
  Math.ceil(filteredSubmissions.value.length / itemsPerPage.value)
)

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSubmissions.value.slice(start, end)
})

const paginationStart = computed(() => 
  (currentPage.value - 1) * itemsPerPage.value + 1
)

const paginationEnd = computed(() => 
  Math.min(currentPage.value * itemsPerPage.value, filteredSubmissions.value.length)
)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFieldName = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const formatFieldValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  }
  return value
}

const getDisplayData = (data: any) => {
  // Show only first 3 fields for preview
  const entries = Object.entries(data || {})
  return Object.fromEntries(entries.slice(0, 3))
}

const refreshSubmissions = async () => {
  await loadSubmissions()
}

const exportSelected = () => {
  // TODO: Implement bulk export
}

const exportSubmission = (_submissionId: string) => {
  // TODO: Implement single submission export
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedSubmissions.value = paginatedSubmissions.value.map((s: any) => s._id)
  } else {
    selectedSubmissions.value = []
  }
}

const markAsProcessed = async () => {
  for (const submissionId of selectedSubmissions.value) {
    await updateSubmissionStatus(submissionId, 'processed')
  }
  selectedSubmissions.value = []
  selectAll.value = false
}

const archiveSelected = async () => {
  for (const submissionId of selectedSubmissions.value) {
    await updateSubmissionStatus(submissionId, 'archived')
  }
  selectedSubmissions.value = []
  selectAll.value = false
}

const viewSubmission = (submissionId: string) => {
  router.push(`/submissions/${submissionId}`)
}

const updateStatus = async (submissionId: string, status: 'submitted' | 'processed' | 'archived') => {
  try {
    await updateSubmissionStatus(submissionId, status)
    closeDropdown()
  } catch (error) {
    // Handle error silently for now
    closeDropdown()
  }
}

const deleteSubmission = async (_submissionId: string) => {
  // TODO: Implement submission deletion
  closeDropdown()
}

const toggleDropdown = (submissionId: string) => {
  activeDropdown.value = activeDropdown.value === submissionId ? null : submissionId
}

const closeDropdown = () => {
  activeDropdown.value = null
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown')) {
    closeDropdown()
  }
}

// Watch for route changes
watch(() => route.params.formId, async (newFormId) => {
  if (newFormId) {
    currentPage.value = 1
    selectedSubmissions.value = []
    selectAll.value = false
    await loadSubmissions()
  }
}, { immediate: true })

onMounted(async () => {
  await Promise.all([
    loadSavedForms(),
    loadSubmissions()
  ])
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.form-submissions {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Info Section */
.form-info-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.form-info-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  gap: 2rem;
}

.form-details {
  flex: 1;
}

.form-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.form-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.form-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
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
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.stat-icon.total {
  background: #6b7280;
}

.stat-icon.today {
  background: #9ca3af;
}

.stat-icon.week {
  background: #4b5563;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Controls Section */
.controls-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.search-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

.form-select,
.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 120px;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #374151;
  color: white;
  box-shadow: 0 2px 4px rgba(55, 65, 81, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(55, 65, 81, 0.4);
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: 1px solid #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  border-color: #4b5563;
}

/* Submissions Section */
.submissions-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.submissions-container {
  display: flex;
  flex-direction: column;
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #6b7280;
}

.selection-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.bulk-action-buttons {
  display: flex;
  gap: 0.5rem;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* Submissions Grid */
.submissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.submission-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.submission-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.submission-card.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.submission-select {
  display: flex;
  align-items: center;
}

.submission-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: center;
}

.submission-date {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.submission-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.submission-status {
  display: flex;
  align-items: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.submitted {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.processed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.archived {
  background: #f3f4f6;
  color: #6b7280;
}

.submission-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submission-data {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.data-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 100px;
}

.data-value {
  color: #374151;
  flex: 1;
}

.submission-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.view:hover {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.export:hover {
  background: #d1fae5;
  color: #059669;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 160px;
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: #fef2f2;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.page-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

/* Empty and Loading States */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
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
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-info-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions {
    align-self: stretch;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .search-filters {
    flex-direction: column;
  }
  
  .search-input-wrapper {
    min-width: auto;
  }
  
  .action-buttons {
    justify-content: stretch;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .bulk-action-buttons {
    justify-content: center;
  }
  
  .submissions-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
