<template>
  <div class="forms-management">
    <!-- Header Actions -->
    <div class="page-actions">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search forms..."
            class="search-input"
          >
        </div>
      </div>
      
      <div class="action-buttons">
        <button 
          :disabled="loading"
          class="btn btn-secondary"
          @click="refreshForms"
        >
          <i 
            class="fas fa-sync-alt"
            :class="{ 'fa-spin': loading }"
          />
          Refresh
        </button>
        
        <button 
          :disabled="loading || isCreating"
          class="btn btn-primary"
          @click="createNewForm"
        >
          <i 
            :class="isCreating ? 'fas fa-spinner fa-spin' : 'fas fa-plus'"
          />
          {{ isCreating ? 'Creating...' : 'New Form' }}
        </button>
      </div>
    </div>

    <!-- Forms Grid -->
    <div class="forms-container">
      <div 
        v-if="loading && savedForms.length === 0"
        class="loading-state"
      >
        <i class="fas fa-spinner fa-spin" />
        <p>Loading forms...</p>
      </div>
      
      <div 
        v-else-if="filteredForms.length === 0"
        class="empty-state"
      >
        <i class="fas fa-file-alt" />
        <h3>{{ searchQuery ? 'No forms found' : 'No forms yet' }}</h3>
        <p>
          {{ searchQuery ? 'Try adjusting your search criteria' : 'Create your first form to get started' }}
        </p>
        <button
          v-if="!searchQuery"
          :disabled="isCreating"
          class="btn btn-primary"
          @click="createNewForm"
        >
          <i 
            :class="isCreating ? 'fas fa-spinner fa-spin' : 'fas fa-plus'"
          />
          {{ isCreating ? 'Creating...' : 'Create Form' }}
        </button>
      </div>
      
      <div 
        v-else
        class="forms-grid"
      >
        <div 
          v-for="form in filteredForms" 
          :key="form._id"
          class="form-card"
        >
          <div class="form-header">
            <div class="form-status-indicator">
              <div 
                class="status-dot"
                :class="form.isActive ? 'active' : 'inactive'"
              />
            </div>
            
            <div class="form-actions">
              <button 
                title="Edit Form"
                class="action-btn edit"
                @click="editForm(form._id)"
              >
                <i class="fas fa-edit" />
              </button>
              
              <button 
                title="Preview Form"
                class="action-btn view"
                @click="previewForm(form._id)"
              >
                <i class="fas fa-eye" />
              </button>
              
              <button 
                title="View Submissions"
                class="action-btn submissions"
                @click="viewSubmissions(form._id)"
              >
                <i class="fas fa-inbox" />
              </button>
              
              <div class="dropdown">
                <button 
                  title="More Actions"
                  class="action-btn more"
                  @click="toggleDropdown(form._id)"
                >
                  <i class="fas fa-ellipsis-v" />
                </button>
                
                <div 
                  v-if="activeDropdown === form._id"
                  class="dropdown-menu"
                >
                  <button 
                    class="dropdown-item"
                    @click="duplicateForm(form._id)"
                  >
                    <i class="fas fa-copy" />
                    Duplicate
                  </button>
                  
                  <button 
                    class="dropdown-item"
                    @click="toggleFormStatus(form._id, form.isActive)"
                  >
                    <i :class="form.isActive ? 'fas fa-pause' : 'fas fa-play'" />
                    {{ form.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  
                  <hr class="dropdown-divider">
                  
                  <button 
                    class="dropdown-item danger"
                    @click="confirmDeleteForm(form._id, form.name)"
                  >
                    <i class="fas fa-trash" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-content">
            <h3 class="form-title">
              {{ form.name }}
            </h3>
            
            <p class="form-description">
              {{ form.description || 'No description provided' }}
            </p>
            
            <div class="form-meta">
              <div class="meta-item">
                <i class="fas fa-layer-group" />
                <span>{{ form.fields?.length || 0 }} fields</span>
              </div>
              
              <div class="meta-item">
                <i class="fas fa-eye" />
                <span>{{ form.submissionCount || 0 }} submissions</span>
              </div>
              
              <div class="meta-item">
                <i class="fas fa-calendar" />
                <span>{{ formatDate(form.updatedAt) }}</span>
              </div>
            </div>
            
            <div class="form-tags">
              <span 
                class="tag"
                :class="form.isActive ? 'active' : 'inactive'"
              >
                {{ form.isActive ? 'Active' : 'Inactive' }}
              </span>
              
              <span 
                v-if="form.category"
                class="tag category"
              >
                {{ form.category }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteModal"
      class="modal-overlay"
      @click="cancelDelete"
    >
      <div 
        class="modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>Delete Form</h3>
          <button 
            class="modal-close"
            @click="cancelDelete"
          >
            <i class="fas fa-times" />
          </button>
        </div>
        
        <div class="modal-body">
          <p>
            Are you sure you want to delete the form "<strong>{{ formToDelete.name }}</strong>"?
          </p>
          <p class="warning-text">
            This action cannot be undone. All form submissions will also be deleted.
          </p>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-secondary"
            @click="cancelDelete"
          >
            Cancel
          </button>
          
          <button 
            :disabled="loading"
            class="btn btn-danger"
            @click="deleteForm"
          >
            <i 
              v-if="loading"
              class="fas fa-spinner fa-spin"
            />
            <i 
              v-else
              class="fas fa-trash"
            />
            Delete Form
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
import { useFormCreation } from '@/composables/useFormCreation'

const router = useRouter()
const { savedForms, loading, loadSavedForms, deleteForm: deleteFormAPI } = useFormAPI()
const { createNewForm, isCreating } = useFormCreation()

const searchQuery = ref('')
const activeDropdown = ref<string | null>(null)
const showDeleteModal = ref(false)
const formToDelete = ref<{ id: string; name: string }>({ id: '', name: '' })

const filteredForms = computed(() => {
  if (!searchQuery.value) return savedForms.value
  
  const query = searchQuery.value.toLowerCase()
  return savedForms.value.filter((form: any) => 
    form.name.toLowerCase().includes(query) ||
    form.description?.toLowerCase().includes(query)
  )
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const refreshForms = async () => {
  await loadSavedForms()
}

const editForm = (formId: string) => {
  router.push(`/builder/${formId}`)
}

const previewForm = (formId: string) => {
  router.push(`/forms/${formId}/preview`)
}

const viewSubmissions = (formId: string) => {
  router.push(`/forms/${formId}/submissions`)
}

const duplicateForm = async (formId: string) => {
  try {
    const originalForm = savedForms.value.find((f: any) => f._id === formId)
    if (!originalForm) return
    
    // TODO: Implement form duplication when API endpoint is available
    // const duplicatedForm = {
    //   name: `${originalForm.name} (Copy)`,
    //   description: originalForm.description,
    //   configuration: originalForm.configuration,
    //   createdBy: 'current-user'
    // }
    
    await refreshForms()
    closeDropdown()
  } catch (error) {
    // Handle error silently for now
    closeDropdown()
  }
}

const toggleFormStatus = async (_formId: string, _isActive: boolean) => {
  try {
    // TODO: Update API to support isActive field
    // await updateForm(formId, { isActive: !isActive })
    closeDropdown()
  } catch (error) {
    // Handle error silently for now
    closeDropdown()
  }
}

const confirmDeleteForm = (formId: string, formName: string) => {
  formToDelete.value = { id: formId, name: formName }
  showDeleteModal.value = true
  closeDropdown()
}

const deleteForm = async () => {
  try {
    await deleteFormAPI(formToDelete.value.id)
    showDeleteModal.value = false
    formToDelete.value = { id: '', name: '' }
  } catch (error) {
    // Handle error silently for now
    showDeleteModal.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  formToDelete.value = { id: '', name: '' }
}

const toggleDropdown = (formId: string) => {
  activeDropdown.value = activeDropdown.value === formId ? null : formId
}

const closeDropdown = () => {
  activeDropdown.value = null
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown')) {
    closeDropdown()
  }
}

onMounted(async () => {
  await loadSavedForms()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.forms-management {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Actions */
.page-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-bar {
  flex: 1;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
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
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
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
  white-space: nowrap;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

/* Forms Grid */
.forms-container {
  min-height: 400px;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.form-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s ease;
}

.form-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0 1.5rem;
}

.form-status-indicator {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.active {
  background: #10b981;
}

.status-dot.inactive {
  background: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 0.25rem;
  position: relative;
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

.action-btn.edit:hover {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.view:hover {
  background: #d1fae5;
  color: #059669;
}

.action-btn.submissions:hover {
  background: #fef3c7;
  color: #d97706;
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
  min-width: 140px;
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

.form-content {
  padding: 1rem 1.5rem 1.5rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.form-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.form-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
}

.form-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag.active {
  background: #d1fae5;
  color: #065f46;
}

.tag.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.tag.category {
  background: #e0e7ff;
  color: #3730a3;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #374151;
}

.warning-text {
  color: #ef4444;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    max-width: none;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .forms-grid {
    grid-template-columns: 1fr;
  }
  
  .form-meta {
    gap: 0.75rem;
  }
  
  .meta-item {
    font-size: 0.6875rem;
  }
}
</style>
