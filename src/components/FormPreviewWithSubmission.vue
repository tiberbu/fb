<template>
  <div class="form-preview-with-submission">
    <div class="preview-header">
      <h2>Form Preview & Testing</h2>
      
      <div class="form-selector">
        <label for="previewFormSelect">Select Form to Preview:</label>
        <select 
          id="previewFormSelect"
          v-model="selectedFormId" 
          class="form-select"
          @change="loadSelectedForm"
        >
          <option value="">Choose a form...</option>
          <option 
            v-for="form in savedForms" 
            :key="form._id" 
            :value="form._id"
          >
            {{ form.name }}
          </option>
        </select>
      </div>
    </div>

    <div 
      v-if="isLoading" 
      class="loading"
    >
      Loading form...
    </div>

    <div 
      v-else-if="!selectedFormConfig" 
      class="no-form-selected"
    >
      <div class="empty-state">
        <i class="fas fa-clipboard-list" />
        <h3>No Form Selected</h3>
        <p>Select a saved form from the dropdown above to preview and test it.</p>
      </div>
    </div>

    <div 
      v-else 
      class="form-preview-container"
    >
      <div class="form-info">
        <h3>{{ selectedFormConfig.name }}</h3>
        <p 
          v-if="selectedFormConfig.description"
          class="form-description"
        >
          {{ selectedFormConfig.description }}
        </p>
      </div>

      <form 
        class="preview-form"
        @submit.prevent="submitForm"
      >
        <div 
          v-for="tab in selectedFormConfig.configuration.layout.tabs" 
          :key="tab.df.name"
          class="form-tab"
        >
          <h4 
            v-if="selectedFormConfig.configuration.layout.tabs.length > 1"
            class="tab-title"
          >
            {{ tab.df.label || 'Untitled Tab' }}
          </h4>
          
          <div 
            v-for="section in tab.sections" 
            :key="section.df.name"
            class="form-section"
          >
            <div 
              v-if="!section.df.hideTitle"
              class="section-header"
            >
              <h5 class="section-title">{{ section.df.label || 'Untitled Section' }}</h5>
              <p 
                v-if="!section.df.hideSubtitle && section.df.description"
                class="section-subtitle"
              >
                {{ section.df.description }}
              </p>
            </div>
            
            <div 
              v-for="(row, rowIndex) in section.columns" 
              :key="rowIndex"
              class="form-row"
            >
              <div 
                v-for="(column, colIndex) in row.columns" 
                :key="colIndex"
                class="form-column"
                :style="{ flex: `1 1 ${100 / row.columns.length}%` }"
              >
                <div 
                  v-for="field in column.fields" 
                  :key="field.df.name"
                  class="form-field"
                >
                  <label 
                    :for="field.df.name"
                    class="field-label"
                  >
                    {{ field.df.label }}
                    <span 
                      v-if="field.df.reqd" 
                      class="required"
                    >*</span>
                  </label>
                  
                  <!-- Text Input -->
                  <input
                    v-if="['Data', 'Small Text'].includes(field.df.fieldtype)"
                    :id="field.df.name"
                    v-model="formData[field.df.name]"
                    type="text"
                    :placeholder="field.df.placeholder || ''"
                    :required="field.df.reqd"
                    class="form-input"
                  >
                  
                  <!-- Email Input -->
                  <input
                    v-else-if="field.df.fieldtype === 'Email'"
                    :id="field.df.name"
                    v-model="formData[field.df.name]"
                    type="email"
                    :placeholder="field.df.placeholder || ''"
                    :required="field.df.reqd"
                    class="form-input"
                  >
                  
                  <!-- Number Input -->
                  <input
                    v-else-if="['Int', 'Float', 'Currency'].includes(field.df.fieldtype)"
                    :id="field.df.name"
                    v-model="formData[field.df.name]"
                    type="number"
                    :step="field.df.fieldtype === 'Float' ? '0.01' : '1'"
                    :placeholder="field.df.placeholder || ''"
                    :required="field.df.reqd"
                    class="form-input"
                  >
                  
                  <!-- Date Input -->
                  <input
                    v-else-if="field.df.fieldtype === 'Date'"
                    :id="field.df.name"
                    v-model="formData[field.df.name]"
                    type="date"
                    :required="field.df.reqd"
                    class="form-input"
                  >
                  
                  <!-- Textarea -->
                  <textarea
                    v-else-if="field.df.fieldtype === 'Text'"
                    :id="field.df.name"
                    v-model="formData[field.df.name]"
                    :placeholder="field.df.placeholder || ''"
                    :required="field.df.reqd"
                    rows="3"
                    class="form-input"
                  ></textarea>
                  
                  <!-- Select -->
                  <select
                    v-else-if="field.df.fieldtype === 'Select'"
                    :id="field.df.name"
                    v-model="formData[field.df.name]"
                    :required="field.df.reqd"
                    class="form-input"
                  >
                    <option value="">Select an option...</option>
                    <option 
                      v-for="option in (field.df.options || '').split('\n').filter(Boolean)" 
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                  
                  <!-- Checkbox -->
                  <label
                    v-else-if="field.df.fieldtype === 'Check'"
                    class="checkbox-label"
                  >
                    <input
                      :id="field.df.name"
                      v-model="formData[field.df.name]"
                      type="checkbox"
                      class="checkbox-input"
                    >
                    {{ field.df.description || 'Check this box' }}
                  </label>
                  
                  <!-- Default fallback -->
                  <input
                    v-else
                    :id="field.df.name"
                    v-model="formData[field.df.name]"
                    type="text"
                    :placeholder="field.df.placeholder || ''"
                    :required="field.df.reqd"
                    class="form-input"
                  >
                  
                  <p 
                    v-if="field.df.description"
                    class="field-description"
                  >
                    {{ field.df.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit"
            :disabled="isSubmitting"
            class="btn btn-primary btn-sm"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
          </button>
          
          <button 
            type="button"
            class="btn btn-outline btn-sm"
            @click="clearForm"
          >
            Clear Form
          </button>
        </div>
      </form>
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
const selectedFormConfig = ref<any>(null);
const formData = ref<Record<string, any>>({});
const isSubmitting = ref(false);
const message = ref('');
const messageType = ref('success');

// Computed
const savedForms = computed(() => store.savedForms);
const isLoading = computed(() => store.isLoading);

// Methods
const loadSelectedForm = async () => {
  if (!selectedFormId.value) {
    selectedFormConfig.value = null;
    return;
  }
  
  try {
    const form = await store.loadFormConfiguration(selectedFormId.value);
    selectedFormConfig.value = form;
    clearForm();
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : 'Failed to load form',
      'error'
    );
  }
};

const clearForm = () => {
  formData.value = {};
};

const submitForm = async () => {
  if (!selectedFormId.value) return;
  
  isSubmitting.value = true;
  
  try {
    const result = await formAPI.submitForm(
      selectedFormId.value,
      formData.value,
      'preview-user'
    );
    
    showMessage('Form submitted successfully!', 'success');
    clearForm();
    
    // Optional: Show submission details
    setTimeout(() => {
      showMessage(`Submission ID: ${result.submissionId}`, 'success');
    }, 1000);
    
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : 'Failed to submit form',
      'error'
    );
  } finally {
    isSubmitting.value = false;
  }
};

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

// Load data on mount
onMounted(() => {
  store.loadSavedForms();
});
</script>

<style scoped>
.form-preview-with-submission {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.preview-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.preview-header h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.form-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-selector label {
  font-weight: 500;
  color: #374151;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #6b7280;
  font-size: 16px;
}

.no-form-selected {
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

.form-preview-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.form-info {
  margin-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 16px;
}

.form-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.form-description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.preview-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 8px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  margin-bottom: 8px;
}

.section-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.section-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: start;
}

.form-column {
  flex: 1;
  min-width: 0;
}

.form-field {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.checkbox-input {
  width: auto;
  margin: 0;
}

.field-description {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.btn {
  padding: 10px 20px;
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

.btn-outline:hover {
  background: #f9fafb;
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
