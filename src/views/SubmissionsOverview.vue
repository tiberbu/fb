<template>
  <div class="submissions-overview">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-inbox" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">
            {{ stats.total }}
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
            {{ stats.today }}
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
            {{ stats.thisWeek }}
          </h3>
          <p class="stat-label">
            This Week
          </p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon forms">
          <i class="fas fa-file-alt" />
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
    </div>

    <!-- Filter and Search -->
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
          v-model="selectedFormFilter"
          class="form-select"
        >
          <option value="">
            All Forms
          </option>
          <option 
            v-for="form in uniqueForms"
            :key="form._id"
            :value="form._id"
          >
            {{ form.name }}
          </option>
        </select>
        
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
          Export Selected
        </button>
      </div>
    </div>

    <!-- Submissions Table -->
    <div class="submissions-section">
      <div 
        v-if="loading && submissions.length === 0"
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
        <h3>{{ searchQuery || selectedFormFilter || statusFilter ? 'No submissions found' : 'No submissions yet' }}</h3>
        <p>
          {{ searchQuery || selectedFormFilter || statusFilter 
            ? 'Try adjusting your filters or search criteria' 
            : 'Submissions will appear here once users start filling out your forms' 
          }}
        </p>
      </div>
      
      <div 
        v-else
        class="submissions-table-container"
      >
        <table class="submissions-table">
          <thead>
            <tr>
              <th class="checkbox-column">
                <input 
                  v-model="selectAll"
                  type="checkbox"
                  class="checkbox"
                  @change="toggleSelectAll"
                >
              </th>
              <th class="sortable-header">
                <button 
                  class="sort-button"
                  @click="sortBy('formName')"
                >
                  Form Name
                  <i 
                    class="fas"
                    :class="getSortIcon('formName')"
                  />
                </button>
              </th>
              <th class="sortable-header">
                <button 
                  class="sort-button"
                  @click="sortBy('submittedAt')"
                >
                  Submitted
                  <i 
                    class="fas"
                    :class="getSortIcon('submittedAt')"
                  />
                </button>
              </th>
              <th class="sortable-header">
                <button 
                  class="sort-button"
                  @click="sortBy('submittedBy')"
                >
                  Submitted By
                  <i 
                    class="fas"
                    :class="getSortIcon('submittedBy')"
                  />
                </button>
              </th>
              <th class="sortable-header">
                <button 
                  class="sort-button"
                  @click="sortBy('status')"
                >
                  Status
                  <i 
                    class="fas"
                    :class="getSortIcon('status')"
                  />
                </button>
              </th>
              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="submission in paginatedSubmissions"
              :key="submission._id"
              class="submission-row"
              :class="{ 'selected': selectedSubmissions.includes(submission._id) }"
            >
              <td class="checkbox-column">
                <input 
                  v-model="selectedSubmissions"
                  type="checkbox"
                  class="checkbox"
                  :value="submission._id"
                >
              </td>
              <td class="form-name-cell">
                <div class="form-info">
                  <h4 class="form-name">
                    {{ submission.formName }}
                  </h4>
                  <p class="form-id">
                    ID: {{ submission.formId }}
                  </p>
                </div>
              </td>
              <td class="date-cell">
                <div class="date-info">
                  <span class="date">{{ formatDate(submission.submittedAt) }}</span>
                  <span class="time">{{ formatTime(submission.submittedAt) }}</span>
                </div>
              </td>
              <td class="user-cell">
                <div class="user-info">
                  <i class="fas fa-user user-icon" />
                  <span>{{ submission.submittedBy || 'Anonymous' }}</span>
                </div>
              </td>
              <td class="status-cell">
                <span 
                  class="status-badge"
                  :class="submission.status"
                >
                  {{ submission.status }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
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
              </td>
            </tr>
          </tbody>
        </table>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormAPI } from '@/composables/useFormAPI'

const router = useRouter()
const { savedForms, submissions, loading, loadSavedForms, loadSubmissions, updateSubmissionStatus } = useFormAPI()

// Reactive state
const searchQuery = ref('')
const selectedFormFilter = ref('')
const statusFilter = ref('')
const selectedSubmissions = ref<string[]>([])
const selectAll = ref(false)
const activeDropdown = ref<string | null>(null)
const sortField = ref('submittedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed properties
const uniqueForms = computed(() => {
  const formMap = new Map()
  submissions.value.forEach((submission: any) => {
    if (!formMap.has(submission.formId)) {
      formMap.set(submission.formId, {
        _id: submission.formId,
        name: submission.formName
      })
    }
  })
  return Array.from(formMap.values())
})

const stats = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  return {
    total: submissions.value.length,
    today: submissions.value.filter((s: any) => new Date(s.submittedAt) >= today).length,
    thisWeek: submissions.value.filter((s: any) => new Date(s.submittedAt) >= weekAgo).length,
    activeForms: savedForms.value.filter((f: any) => f.isActive).length
  }
})

const filteredSubmissions = computed(() => {
  let filtered = submissions.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((submission: any) =>
      submission.formName.toLowerCase().includes(query) ||
      submission.submittedBy?.toLowerCase().includes(query)
    )
  }

  // Filter by form
  if (selectedFormFilter.value) {
    filtered = filtered.filter((submission: any) => 
      submission.formId === selectedFormFilter.value
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter((submission: any) => 
      submission.status === statusFilter.value
    )
  }

  // Sort
  return filtered.sort((a: any, b: any) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]
    
    if (sortField.value === 'submittedAt') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
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

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return 'fa-sort'
  return sortOrder.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedSubmissions.value = paginatedSubmissions.value.map((s: any) => s._id)
  } else {
    selectedSubmissions.value = []
  }
}

const refreshSubmissions = async () => {
  await loadSubmissions()
}

const viewSubmission = (submissionId: string) => {
  router.push(`/submissions/${submissionId}`)
}

const exportSubmission = (_submissionId: string) => {
  // TODO: Implement single submission export
}

const exportSelected = () => {
  // TODO: Implement bulk export
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
.submissions-overview {
  max-width: 1400px;
  margin: 0 auto;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.today {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.week {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.forms {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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
  margin-bottom: 1.5rem;
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Submissions Table */
.submissions-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.submissions-table-container {
  overflow-x: auto;
}

.submissions-table {
  width: 100%;
  border-collapse: collapse;
}

.submissions-table th,
.submissions-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.submissions-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.sortable-header {
  width: auto;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.sort-button:hover {
  color: #1f2937;
}

.checkbox-column {
  width: 50px;
}

.actions-column {
  width: 120px;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #667eea;
}

.submission-row {
  transition: background-color 0.2s ease;
}

.submission-row:hover {
  background: #f9fafb;
}

.submission-row.selected {
  background: #f0f9ff;
}

.form-name-cell .form-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  font-size: 0.875rem;
}

.form-id {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.date-cell .date-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.date {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.user-cell .user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  color: #9ca3af;
  font-size: 0.875rem;
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

.actions-cell .action-buttons {
  display: flex;
  gap: 0.25rem;
  align-items: center;
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
  margin: 0;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }
  
  .search-input-wrapper {
    min-width: auto;
  }
  
  .action-buttons {
    justify-content: stretch;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .submissions-table {
    font-size: 0.875rem;
  }
  
  .submissions-table th,
  .submissions-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
