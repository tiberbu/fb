<template>
  <div class="submission-detail">
    <div 
      v-if="loading && !submission"
      class="loading-state"
    >
      <i class="fas fa-spinner fa-spin" />
      <p>Loading submission...</p>
    </div>
    
    <div 
      v-else-if="submission"
      class="submission-container"
    >
      <!-- Header -->
      <div class="submission-header">
        <div class="header-content">
          <div class="submission-info">
            <h2 class="submission-title">
              Submission Details
            </h2>
            <div class="submission-meta">
              <div class="meta-item">
                <i class="fas fa-calendar" />
                <span>{{ formatDate(submission.submittedAt) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-clock" />
                <span>{{ formatTime(submission.submittedAt) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-user" />
                <span>{{ submission.submittedBy || 'Anonymous' }}</span>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <button 
              class="btn btn-secondary"
              @click="exportSubmission"
            >
              <i class="fas fa-download" />
              Export
            </button>
            
            <router-link 
              :to="`/forms/${submission.formId}/submissions`"
              class="btn btn-secondary"
            >
              <i class="fas fa-arrow-left" />
              Back to List
            </router-link>
          </div>
        </div>
        
        <div class="status-section">
          <div class="current-status">
            <span class="status-label">Status:</span>
            <span 
              class="status-badge"
              :class="submission.status"
            >
              {{ submission.status }}
            </span>
          </div>
          
          <div class="status-actions">
            <button 
              v-if="submission.status !== 'processed'"
              class="status-btn processed"
              @click="updateStatus('processed')"
            >
              <i class="fas fa-check" />
              Mark as Processed
            </button>
            
            <button 
              v-if="submission.status !== 'archived'"
              class="status-btn archived"
              @click="updateStatus('archived')"
            >
              <i class="fas fa-archive" />
              Archive
            </button>
          </div>
        </div>
      </div>

      <!-- Form Information -->
      <div class="form-info-section">
        <h3 class="section-title">
          Form Information
        </h3>
        
        <div class="form-info-card">
          <div class="form-details">
            <h4 class="form-name">
              {{ formInfo?.name || 'Unknown Form' }}
            </h4>
            <p 
              v-if="formInfo?.description"
              class="form-description"
            >
              {{ formInfo.description }}
            </p>
          </div>
          
          <div class="form-actions">
            <router-link 
              v-if="formInfo"
              :to="`/builder/${formInfo._id}`"
              class="btn btn-outline btn-sm"
            >
              <i class="fas fa-edit" />
              Edit Form
            </router-link>
          </div>
        </div>
      </div>

      <!-- Submission Data -->
      <div class="submission-data-section">
        <h3 class="section-title">
          Submission Data
        </h3>
        
        <div class="data-container">
          <div 
            v-if="!submission.data || Object.keys(submission.data).length === 0"
            class="empty-data"
          >
            <i class="fas fa-inbox" />
            <p>No data submitted</p>
          </div>
          
          <div 
            v-else
            class="data-fields"
          >
            <div 
              v-for="(value, key) in submission.data"
              :key="key"
              class="field-item"
            >
              <div class="field-header">
                <label class="field-label">
                  {{ formatFieldName(String(key)) }}
                </label>
                <span class="field-type">
                  {{ getFieldType(value) }}
                </span>
              </div>
              
              <div class="field-value">
                <div 
                  v-if="isImageUrl(value)"
                  class="image-value"
                >
                  <img 
                    :src="value"
                    :alt="String(key)"
                    class="field-image"
                  >
                  <a 
                    :href="value"
                    target="_blank"
                    class="image-link"
                  >
                    View Full Size
                  </a>
                </div>
                
                <div 
                  v-else-if="isUrl(value)"
                  class="url-value"
                >
                  <a 
                    :href="value"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="external-link"
                  >
                    {{ value }}
                    <i class="fas fa-external-link-alt" />
                  </a>
                </div>
                
                <div 
                  v-else-if="isEmail(value)"
                  class="email-value"
                >
                  <a 
                    :href="`mailto:${value}`"
                    class="email-link"
                  >
                    {{ value }}
                    <i class="fas fa-envelope" />
                  </a>
                </div>
                
                <div 
                  v-else-if="Array.isArray(value)"
                  class="array-value"
                >
                  <div 
                    v-for="(item, index) in value"
                    :key="index"
                    class="array-item"
                  >
                    {{ formatFieldValue(item) }}
                  </div>
                </div>
                
                <div 
                  v-else-if="typeof value === 'object' && value !== null"
                  class="object-value"
                >
                  <pre class="json-display">{{ JSON.stringify(value, null, 2) }}</pre>
                </div>
                
                <div 
                  v-else-if="isLongText(value)"
                  class="long-text-value"
                >
                  <div class="text-content">
                    {{ value }}
                  </div>
                  <button 
                    v-if="String(value).length > 200"
                    class="expand-btn"
                    @click="toggleExpanded(String(key))"
                  >
                    {{ expandedFields.includes(String(key)) ? 'Show Less' : 'Show More' }}
                  </button>
                </div>
                
                <div 
                  v-else
                  class="simple-value"
                >
                  {{ formatFieldValue(value) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="additional-info-section">
        <h3 class="section-title">
          Additional Information
        </h3>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Submission ID</span>
            <span class="info-value">{{ submission._id }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Form ID</span>
            <span class="info-value">{{ submission.formId }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">IP Address</span>
            <span class="info-value">{{ submission.ipAddress || 'Not recorded' }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">User Agent</span>
            <span class="info-value">{{ submission.userAgent || 'Not recorded' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div 
      v-else
      class="error-state"
    >
      <i class="fas fa-exclamation-triangle" />
      <h3>Submission Not Found</h3>
      <p>The requested submission could not be found.</p>
      <router-link 
        to="/submissions"
        class="btn btn-primary"
      >
        <i class="fas fa-arrow-left" />
        Back to Submissions
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFormAPI } from '@/composables/useFormAPI'

const route = useRoute()
const { savedForms, submissions, loading, loadSavedForms, loadSubmissions, updateSubmissionStatus } = useFormAPI()

const submissionId = computed(() => route.params.submissionId as string)
const expandedFields = ref<string[]>([])

const submission = computed(() => {
  return submissions.value.find((s: any) => s._id === submissionId.value)
})

const formInfo = computed(() => {
  if (!submission.value) return null
  return savedForms.value.find((form: any) => form._id === submission.value.formId)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatFieldName = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const formatFieldValue = (value: any) => {
  if (value === null || value === undefined) return 'No value'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const getFieldType = (value: any) => {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (isImageUrl(value)) return 'image'
  if (isUrl(value)) return 'url'
  if (isEmail(value)) return 'email'
  if (isLongText(value)) return 'text'
  return typeof value
}

const isImageUrl = (value: any) => {
  if (typeof value !== 'string') return false
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(value) || value.includes('data:image/')
}

const isUrl = (value: any) => {
  if (typeof value !== 'string') return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const isEmail = (value: any) => {
  if (typeof value !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const isLongText = (value: any) => {
  return typeof value === 'string' && value.length > 100
}

const toggleExpanded = (key: string) => {
  const index = expandedFields.value.indexOf(key)
  if (index > -1) {
    expandedFields.value.splice(index, 1)
  } else {
    expandedFields.value.push(key)
  }
}

const updateStatus = async (status: 'submitted' | 'processed' | 'archived') => {
  if (!submission.value) return
  
  try {
    await updateSubmissionStatus(submission.value._id, status)
  } catch (error) {
    // Handle error silently for now
  }
}

const exportSubmission = () => {
  if (!submission.value) return
  
  const exportData = {
    id: submission.value._id,
    formId: submission.value.formId,
    formName: formInfo.value?.name || 'Unknown Form',
    submittedAt: submission.value.submittedAt,
    submittedBy: submission.value.submittedBy,
    status: submission.value.status,
    data: submission.value.data
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `submission-${submission.value._id}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await Promise.all([
    loadSavedForms(),
    loadSubmissions()
  ])
})
</script>

<style scoped>
.submission-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.submission-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.submission-header {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  gap: 2rem;
}

.submission-info {
  flex: 1;
}

.submission-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.submission-meta {
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

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.current-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
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

.status-actions {
  display: flex;
  gap: 0.5rem;
}

.status-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: 1px solid;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn.processed {
  border-color: #059669;
  color: #059669;
  background: white;
}

.status-btn.processed:hover {
  background: #d1fae5;
}

.status-btn.archived {
  border-color: #6b7280;
  color: #6b7280;
  background: white;
}

.status-btn.archived:hover {
  background: #f3f4f6;
}

/* Form Info Section */
.form-info-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.form-info-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.form-details {
  flex: 1;
}

.form-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.form-description {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
}

/* Section Titles */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

/* Submission Data Section */
.submission-data-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.data-container {
  display: flex;
  flex-direction: column;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.empty-data i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.data-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-item {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1.5rem;
}

.field-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.field-type {
  font-size: 0.75rem;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.field-value {
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.5;
}

/* Field Value Types */
.image-value {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.image-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.8125rem;
  align-self: flex-start;
}

.image-link:hover {
  text-decoration: underline;
}

.url-value,
.email-value {
  word-break: break-all;
}

.external-link,
.email-link {
  color: #667eea;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.external-link:hover,
.email-link:hover {
  text-decoration: underline;
}

.array-value {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.array-item {
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border-left: 3px solid #667eea;
}

.object-value {
  position: relative;
}

.json-display {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.8125rem;
  overflow-x: auto;
  max-height: 300px;
}

.long-text-value {
  position: relative;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.expand-btn {
  margin-top: 0.5rem;
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.8125rem;
  cursor: pointer;
  text-decoration: underline;
}

.simple-value {
  word-break: break-word;
}

/* Additional Info Section */
.additional-info-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.info-value {
  font-size: 0.875rem;
  color: #1f2937;
  word-break: break-all;
}

/* Buttons */
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
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

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.loading-state i,
.error-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.error-state i {
  color: #f59e0b;
}

.error-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    align-self: stretch;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .status-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .status-actions {
    justify-content: center;
  }
  
  .form-info-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions {
    align-self: stretch;
  }
  
  .submission-meta {
    gap: 1rem;
  }
  
  .field-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
