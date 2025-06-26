<template>
  <div class="form-submissions">
    <div class="submissions-header">
      <h2>Form Submissions</h2>
      
      <div class="filters">
        <select 
          v-model="selectedFormId" 
          class="form-select"
          @change="loadSubmissions"
        >
          <option value="">All Forms</option>
          <option 
            v-for="form in savedForms" 
            :key="form._id" 
            :value="form._id"
          >
            {{ form.name }}
          </option>
        </select>
        
        <button 
          class="btn btn-primary btn-sm"
          @click="loadSubmissions"
        >
          Refresh
        </button>
      </div>
    </div>

    <div 
      v-if="isLoading" 
      class="loading"
    >
      Loading submissions...
    </div>

    <div 
      v-else-if="submissions.length === 0" 
      class="no-submissions"
    >
      <div class="empty-state">
        <i class="fas fa-inbox" />
        <h3>No submissions found</h3>
        <p>Submissions will appear here once users fill out your forms.</p>
      </div>
    </div>

    <div 
      v-else 
      class="submissions-list"
    >
      <div 
        v-for="submission in submissions" 
        :key="submission._id"
        class="submission-card"
      >
        <div class="submission-header">
          <div class="submission-info">
            <h4>{{ submission.formName }}</h4>
            <div class="submission-meta">
              <span class="submission-id">ID: {{ submission.submissionId }}</span>
              <span class="submission-date">{{ formatDate(submission.createdAt) }}</span>
              <span class="submission-user">by {{ submission.submittedBy }}</span>
            </div>
          </div>
          
          <div class="submission-actions">
            <select 
              :value="submission.status" 
              class="status-select"
              @change="updateStatus(submission._id, $event)"
            >
              <option value="submitted">Submitted</option>
              <option value="processed">Processed</option>
              <option value="archived">Archived</option>
            </select>
            
            <button 
              class="btn btn-sm btn-outline"
              @click="toggleDetails(submission._id)"
            >
              <i 
                :class="[
                  'fas', 
                  expandedSubmissions.includes(submission._id) ? 'fa-chevron-up' : 'fa-chevron-down'
                ]" 
              />
            </button>
          </div>
        </div>

        <div 
          v-if="expandedSubmissions.includes(submission._id)"
          class="submission-details"
        >
          <h5>Submitted Data:</h5>
          <div class="data-display">
            <div 
              v-for="(value, key) in submission.submissionData" 
              :key="key"
              class="data-field"
            >
              <label class="field-label">{{ formatFieldLabel(key) }}:</label>
              <div class="field-value">{{ formatFieldValue(value) }}</div>
            </div>
          </div>
          
          <div 
            v-if="submission.metadata" 
            class="metadata"
          >
            <h6>Metadata:</h6>
            <div class="metadata-grid">
              <div 
                v-if="submission.metadata.userAgent"
                class="metadata-item"
              >
                <span class="metadata-label">User Agent:</span>
                <span class="metadata-value">{{ submission.metadata.userAgent }}</span>
              </div>
              <div 
                v-if="submission.metadata.ipAddress"
                class="metadata-item"
              >
                <span class="metadata-label">IP Address:</span>
                <span class="metadata-value">{{ submission.metadata.ipAddress }}</span>
              </div>
              <div 
                v-if="submission.metadata.source"
                class="metadata-item"
              >
                <span class="metadata-label">Source:</span>
                <span class="metadata-value">{{ submission.metadata.source }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div 
      v-if="pagination && pagination.pages > 1"
      class="pagination"
    >
      <button 
        class="btn btn-outline"
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >
        Previous
      </button>
      
      <span class="page-info">
        Page {{ pagination.page }} of {{ pagination.pages }}
      </span>
      
      <button 
        class="btn btn-outline"
        :disabled="pagination.page >= pagination.pages"
        @click="changePage(pagination.page + 1)"
      >
        Next
      </button>
    </div>

    <!-- Success/Error Messages -->
    <div 
      v-if="message" 
      :class="['message', messageType]"
    >
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFormAPI } from '../composables/useFormAPI';
import { useFormBuilderStore } from '../stores/form-builder-store';

const formAPI = useFormAPI();
const store = useFormBuilderStore();

// State
const selectedFormId = ref('');
const expandedSubmissions = ref<string[]>([]);
const message = ref('');
const messageType = ref('success');
const pagination = ref<any>(null);

// Computed
const submissions = computed(() => formAPI.submissions.value);
const isLoading = computed(() => formAPI.loading.value);
const savedForms = computed(() => store.savedForms);

// Methods
const loadSubmissions = async (page = 1) => {
  try {
    const result = await formAPI.loadSubmissions(
      selectedFormId.value || undefined, 
      page, 
      20
    );
    pagination.value = result.pagination;
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : 'Failed to load submissions',
      'error'
    );
  }
};

const updateStatus = async (submissionId: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newStatus = target.value as 'submitted' | 'processed' | 'archived';
  
  try {
    await formAPI.updateSubmissionStatus(submissionId, newStatus);
    showMessage('Status updated successfully', 'success');
    // Refresh submissions to get updated data
    await loadSubmissions(pagination.value?.page || 1);
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : 'Failed to update status',
      'error'
    );
    // Revert the select value
    target.value = submissions.value.find(s => s._id === submissionId)?.status || 'submitted';
  }
};

const toggleDetails = (submissionId: string) => {
  const index = expandedSubmissions.value.indexOf(submissionId);
  if (index > -1) {
    expandedSubmissions.value.splice(index, 1);
  } else {
    expandedSubmissions.value.push(submissionId);
  }
};

const changePage = (page: number) => {
  loadSubmissions(page);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatFieldLabel = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatFieldValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

// Load data on mount
onMounted(async () => {
  await store.loadSavedForms();
  await loadSubmissions();
});
</script>

<style scoped>
.form-submissions {
  padding: 20px;
}

.submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.submissions-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 200px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-outline {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #6b7280;
  font-size: 16px;
}

.no-submissions {
  padding: 60px 20px;
}

.empty-state {
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #374151;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.submission-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.submission-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.submission-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.submission-details {
  padding: 16px;
}

.submission-details h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.data-display {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.data-field {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
}

.field-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.field-value {
  color: #111827;
  font-size: 14px;
  word-break: break-word;
}

.metadata {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.metadata h6 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.metadata-grid {
  display: grid;
  gap: 8px;
}

.metadata-item {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
  font-size: 12px;
}

.metadata-label {
  color: #6b7280;
  font-weight: 500;
}

.metadata-value {
  color: #374151;
  word-break: break-word;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: #10b981;
  color: white;
}

.message.error {
  background: #ef4444;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
