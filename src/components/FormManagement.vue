<template>
  <div class="form-management">
    <!-- Form Actions Toolbar -->
    <div class="form-toolbar">
      <div class="toolbar-section">
        <button 
          class="btn btn-outline btn-sm" 
          title="New Form"
          @click="newForm"
        >
          <i class="fas fa-file-plus" />
          New
        </button>
        
        <button 
          class="btn btn-primary btn-sm" 
          title="Save Form"
          @click="openSaveModal"
        >
          <i class="fas fa-save" />
          {{ currentFormId ? 'Update' : 'Save' }}
        </button>
        
        <button 
          class="btn btn-outline btn-sm" 
          title="Load Form"
          @click="openLoadModal"
        >
          <i class="fas fa-folder-open" />
          Load
        </button>
      </div>
      
      <div class="toolbar-section">
        <div 
          v-if="currentFormId" 
          class="current-form-info"
        >
          <span class="form-name">{{ store.formName }}</span>
          <span 
            v-if="dirty" 
            class="unsaved-indicator"
          >*</span>
        </div>
      </div>
    </div>

    <!-- Save Form Modal -->
    <div 
      v-if="showSaveModal" 
      class="modal-overlay"
      @click="closeSaveModal"
    >
      <div 
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h3>{{ currentFormId ? 'Update Form' : 'Save Form' }}</h3>
          <button 
            class="close-btn"
            @click="closeSaveModal"
          >
            &times;
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="formName">Form Name *</label>
            <input
              id="formName"
              v-model="formName"
              type="text"
              placeholder="Enter form name"
              required
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label for="formDescription">Description</label>
            <textarea
              id="formDescription"
              v-model="formDescription"
              placeholder="Brief description of the form"
              rows="3"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-secondary btn-sm"
            @click="closeSaveModal"
          >
            Cancel
          </button>
          <button 
            class="btn btn-primary btn-sm"
            :disabled="!formName.trim() || isSaving"
            @click="handleSave"
          >
            {{ isSaving ? 'Saving...' : (currentFormId ? 'Update' : 'Save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Load Form Modal -->
    <div 
      v-if="showLoadModal" 
      class="modal-overlay"
      @click="closeLoadModal"
    >
      <div 
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h3>Load Saved Form</h3>
          <button 
            class="close-btn"
            @click="closeLoadModal"
          >
            &times;
          </button>
        </div>
        
        <div class="modal-body">
          <div 
            v-if="isLoading" 
            class="loading"
          >
            Loading forms...
          </div>
          
          <div 
            v-else-if="savedForms.length === 0" 
            class="no-forms"
          >
            No saved forms found. Create and save a form first.
          </div>
          
          <div 
            v-else 
            class="forms-list"
          >
            <div
              v-for="form in savedForms"
              :key="form._id"
              class="form-item"
              @click="handleLoad(form._id)"
            >
              <div class="form-item-header">
                <h4>{{ form.name }}</h4>
                <span class="form-date">{{ formatDate(form.updatedAt) }}</span>
              </div>
              <p 
                v-if="form.description" 
                class="form-description"
              >
                {{ form.description }}
              </p>
              <div class="form-meta">
                <span class="form-version">v{{ form.version }}</span>
                <span class="form-creator">by {{ form.updatedBy }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-secondary btn-sm"
            @click="closeLoadModal"
          >
            Cancel
          </button>
        </div>
      </div>
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
import { useFormBuilderStore } from '../stores/form-builder-store';
import { toast } from '../composables/useToast';

const store = useFormBuilderStore();

// Modal states
const showSaveModal = ref(false);
const showLoadModal = ref(false);

// Form data
const formName = ref('');
const formDescription = ref('');

// Message state
const message = ref('');
const messageType = ref('success');

// Computed properties
const currentFormId = computed(() => store.currentFormId);
const savedForms = computed(() => store.savedForms);
const isSaving = computed(() => store.isSaving);
const isLoading = computed(() => store.isLoading);
const dirty = computed(() => store.dirty);

// Open/close modals
const openSaveModal = () => {
  formName.value = store.formName;
  formDescription.value = store.formDescription;
  showSaveModal.value = true;
};

const closeSaveModal = () => {
  showSaveModal.value = false;
};

const openLoadModal = async () => {
  showLoadModal.value = true;
  await store.loadSavedForms();
};

const closeLoadModal = () => {
  showLoadModal.value = false;
};

// Form actions
const handleSave = async () => {
  try {
    if (currentFormId.value) {
      // Update existing form
      store.formName = formName.value;
      store.formDescription = formDescription.value;
      await store.updateFormConfiguration();
      // Toast will be shown from the store
    } else {
      // Create new form
      await store.saveFormConfiguration(formName.value, formDescription.value);
      // Toast will be shown from the store
    }
    closeSaveModal();
  } catch (error) {
    // Error toast will be shown from the store
  }
};

const handleLoad = async (formId: string) => {
  try {
    await store.loadFormConfiguration(formId);
    toast.success('Form Loaded', 'Form configuration loaded successfully');
    closeLoadModal();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load form';
    toast.error('Load Failed', errorMessage);
  }
};

const newForm = () => {
  if (dirty.value) {
    if (confirm('You have unsaved changes. Create a new form anyway?')) {
      store.newForm();
      toast.success('New Form', 'New form created successfully');
    }
  } else {
    store.newForm();
    toast.success('New Form', 'New form created successfully');
  }
};

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

// Load saved forms on mount
onMounted(() => {
  store.loadSavedForms();
});
</script>

<style scoped>
.form-management {
  position: relative;
}

.form-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Using standardized buttons from buttons.css */

.current-form-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-name {
  font-weight: 500;
  color: #374151;
}

.unsaved-indicator {
  color: #ef4444;
  font-weight: bold;
}

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

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.no-forms {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.forms-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.form-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.form-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.form-item-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.form-date {
  font-size: 12px;
  color: #6b7280;
}

.form-description {
  margin: 8px 0;
  color: #6b7280;
  font-size: 14px;
}

.form-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
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
