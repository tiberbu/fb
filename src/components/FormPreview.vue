<template>
  <div class="form-preview-container">
    <div class="form-preview-header">
      <h2 
        class="form-title"
      >
        {{ formData.metadata?.formName || 'Form Preview' }}
      </h2>
      <div 
        v-if="formData.metadata?.formDescription" 
        class="form-description"
      >
        {{ formData.metadata.formDescription }}
      </div>
    </div>
    
    <div 
      v-if="formData.tabs && formData.tabs.length > 0" 
      class="form-main"
    >
      <!-- Tabs Header - Similar to FormBuilder -->
      <div class="form-tabs">
        <div class="form-tabs-header">
          <div class="tabs-container">
            <div
              v-for="(tab, tabIndex) in formData.tabs"
              :key="tabIndex"
              :class="[
                'tab',
                activeTabIndex === tabIndex ? 'active' : '',
              ]"
              @click="activeTabIndex = tabIndex"
            >
              {{ tab.label }}
            </div>
          </div>
        </div>
        
        <!-- Tab Content -->
        <div class="tab-content-container">
          <div 
            v-for="(tab, tabIndex) in formData.tabs" 
            v-show="activeTabIndex === tabIndex"
            :key="tabIndex" 
            class="tab-content"
          >
            <div 
              v-for="(section, sectionIndex) in tab.sections" 
              :key="sectionIndex"
              class="preview-section"
            >
              <div 
                v-if="section.title"
                class="section-header"
              >
                <h3>{{ section.title }}</h3>
                <span 
                  v-if="section.collapsible" 
                  class="section-collapse-icon"
                >
                  <i class="fas fa-chevron-down" />
                </span>
              </div>
              
              <div class="section-content">
                <div 
                  v-for="(row, rowIndex) in section.rows" 
                  :key="rowIndex" 
                  class="preview-row"
                >
                  <div 
                    v-for="(column, columnIndex) in row.columns" 
                    :key="columnIndex" 
                    class="preview-column"
                    :class="`col-span-${12 / row.columns.length}`"
                  >
                    <div 
                      v-for="field in column.fields" 
                      :key="field.id" 
                      class="field-wrapper"
                    >
                      <FieldControl
                        :df="{
                          fieldtype: convertFieldType(field.type),
                          label: field.label,
                          fieldname: field.name,
                          reqd: field.required,
                          placeholder: field.placeholder,
                          options: field.options
                        }"
                        :value="fieldValues[field.name] || ''"
                        @update:model-value="updateFieldValue(field.name, $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show message if no form data -->
    <div 
      v-else 
      class="empty-form"
    >
      <div class="empty-form-message">
        <i class="far fa-file-alt empty-form-icon" />
        <p>No form data available</p>
      </div>
    </div>

    <!-- Form actions -->
     
    <div 
      v-if="formData.tabs && formData.tabs.length > 0"
      class="form-actions" 
    >
      <button 
        class="submit-button" 
        @click="handleSubmit"
      >
        Submit Form
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import FieldControl from './FieldControl.vue';

// Define the form data structure types
interface FormField {
  id: string;
  type: string;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  options?: Array<any>;
  order?: number;
}

interface Column {
  fields: Array<FormField>;
}

interface Row {
  id: string;
  columns: Array<Column>;
}

interface Section {
  id: string;
  title: string;
  collapsible: boolean;
  rows: Array<Row>;
}

interface Tab {
  label: string;
  sections: Array<Section>;
}

interface FormMetadata {
  formName: string;
  formDescription: string;
  formId: string;
  isPublished: boolean;
  dateCreated: string;
  lastUpdated: string;
}

interface FormData {
  metadata: FormMetadata;
  tabs: Array<Tab>;
}

export default defineComponent({
  name: 'FormPreview',
  components: {
    FieldControl,
  },
  props: {
    formData: {
      type: Object as PropType<FormData>,
      required: true,
    },
    // Keep the old prop for backward compatibility
    formFields: {
      type: Array as PropType<Array<{ type: string; props: Record<string, any> }>>,
      default: () => [],
    },
  },
  emits: ['submit', 'back'],
  setup(props, { emit }) {
    const activeTabIndex = ref(0);
    const fieldValues = ref<Record<string, any>>({});

    // Convert from form builder field type to control component field type
    const convertFieldType = (type: string) => {
      // Map form JSON field types to FieldControl component types
      // based on available controls in the project
      const typeMap: Record<string, string> = {
        'text': 'Text',
        'textarea': 'Text Area',
        'number': 'Number',
        'date': 'Date',
        'checkbox': 'Checkbox',
        'check': 'Checkbox',
        'select': 'Select',
        'data': 'Data',
        'email': 'Data',
        'phone': 'Data',
        'url': 'Data',
        'password': 'Data',
        'radio': 'Select'
      };
      
      return typeMap[type] || 'Data';
    };

    const updateFieldValue = (name: string, value: any) => {
      fieldValues.value[name] = value;
    };
    
    const handleSubmit = () => {
      emit('submit', fieldValues.value);
    };

    return {
      activeTabIndex,
      fieldValues,
      convertFieldType,
      updateFieldValue,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
/* Import global form builder styles when used in isolation */
/* @import "../assets/frappe-form-builder.css"; */

.form-preview-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
  min-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.form-preview-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.form-description {
  margin-top: 8px;
  margin-bottom: 15px;
  color: #6b7280;
  font-size: 0.9rem;
}

.form-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Tab styling - matching FormBuilder */
.form-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.form-tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
  overflow-x: auto;
  padding: 0.5rem 1rem 0;
}

.tabs-container {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.tab {
  padding: 0.75rem 1.25rem;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
  user-select: none;
  margin-right: 0.5rem;
}

.tab:hover {
  background-color: #f9fafb;
}

.tab.active {
  border-bottom: 2px solid #3b82f6;
  color: #3b82f6;
  background-color: #f8fafc;
}

.tab-content-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section styling */
.preview-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.section-collapse-icon {
  cursor: pointer;
  color: #6b7280;
}

.section-content {
  padding: 16px;
}

/* Row and column styling */
.preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.preview-column {
  flex: 1;
  min-width: 200px;
}

.field-wrapper {
  margin-bottom: 16px;
}

/* Empty form state */
.empty-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 48px;
  background-color: #f9fafb;
}

.empty-form-message {
  text-align: center;
  color: #6b7280;
}

.empty-form-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

/* Form actions */
.form-actions {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #2563eb;
}

/* Column spans for responsive design */
.col-span-12 {
  width: 100%;
}

.col-span-6 {
  width: calc(50% - 8px);
}

.col-span-4 {
  width: calc(33.333% - 10.667px);
}
</style>