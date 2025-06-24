<template>
  <div class="form-preview-container">
    <!-- Print header (only visible when printing) -->
    <div class="print-header">
      <h1 class="print-title">
        {{ formData.metadata?.formName || 'Form' }}
      </h1>
      <p 
        v-if="formData.metadata?.formDescription" 
        class="print-description"
      >
        {{ formData.metadata.formDescription }}
      </p>
    </div>

    <!-- Form content starts here (screen header removed to avoid duplication) -->
    <div 
      v-if="formData.tabs && formData.tabs.length > 0" 
      class="form-main"
    >
      <!-- Tabs Layout (default) -->
      <div 
        v-if="formLayout === 'tabs' || !formLayout" 
        class="form-tabs"
      >
        <div class="form-tabs-header screen-only">
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
              {{ tab.df?.label || tab.label }}
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
                v-if="getSectionTitle(section)"
                class="section-header"
              >
                <h3 class="section-title">
                  {{ getSectionTitle(section) }}
                </h3>
                <span 
                  v-if="getSectionCollapsible(section)" 
                  class="section-collapse-icon screen-only"
                >
                  <i class="fas fa-chevron-down" />
                </span>
              </div>
              
              <div class="section-content">
                <div 
                  v-for="(row, rowIndex) in getSectionRows(section)" 
                  :key="rowIndex" 
                  class="preview-row"
                >
                  <div 
                    v-for="(column, columnIndex) in getRowColumns(row)" 
                    :key="columnIndex" 
                    class="preview-column"
                    :class="`col-span-${12 / getRowColumns(row).length}`"
                  >
                    <div 
                      v-for="field in getColumnFields(column)" 
                      :key="getFieldId(field)" 
                      class="field-wrapper"
                    >
                      <FormControl
                        :control="{
                          id: getFieldId(field),
                          type: getFieldType(field),
                          label: getFieldLabel(field),
                          name: getFieldName(field),
                          required: getFieldRequired(field),
                          placeholder: getFieldPlaceholder(field),
                          options: getFieldOptions(field),
                          description: getFieldDescription(field),
                          isReadonly: getFieldReadOnly(field),
                          order: 0
                        }"
                        :model-value="fieldValues[getFieldName(field)] || ''"
                        :is-required="getFieldRequired(field)"
                        :is-read-only="getFieldReadOnly(field)"
                        @update:model-value="updateFieldValue(getFieldName(field), $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion Layout -->
      <div 
        v-else-if="formLayout === 'accordion'" 
        class="form-accordion"
      >
        <div 
          v-for="(tab, tabIndex) in formData.tabs" 
          :key="tabIndex"
          class="accordion-item"
          :class="{ active: activeTabIndex === tabIndex }"
        >
          <div 
            class="accordion-header"
            @click="toggleAccordionTab(tabIndex)"
          >
            <div class="accordion-header-content">
              <div class="flex items-center">
                <i 
                  class="fas fa-chevron-right accordion-chevron"
                  :class="{ 'rotate-90': activeTabIndex === tabIndex }"
                />
                <span class="accordion-title">{{ tab.df?.label || tab.label }}</span>
                <span class="accordion-badge">
                  {{ tab.sections?.length || 0 }}
                </span>
              </div>
            </div>
          </div>
          
          <div 
            v-if="activeTabIndex === tabIndex"
            class="accordion-content"
          >
            <div 
              v-for="(section, sectionIndex) in tab.sections" 
              :key="sectionIndex"
              class="preview-section"
            >
              <div 
                v-if="getSectionTitle(section)"
                class="section-header"
              >
                <h3 class="section-title">
                  {{ getSectionTitle(section) }}
                </h3>
                <span 
                  v-if="getSectionCollapsible(section)" 
                  class="section-collapse-icon screen-only"
                >
                  <i class="fas fa-chevron-down" />
                </span>
              </div>
              
              <div class="section-content">
                <div 
                  v-for="(row, rowIndex) in getSectionRows(section)" 
                  :key="rowIndex" 
                  class="preview-row"
                >
                  <div 
                    v-for="(column, columnIndex) in getRowColumns(row)" 
                    :key="columnIndex" 
                    class="preview-column"
                    :class="`col-span-${12 / getRowColumns(row).length}`"
                  >
                    <div 
                      v-for="field in getColumnFields(column)" 
                      :key="getFieldId(field)" 
                      class="field-wrapper"
                    >
                      <FormControl
                        :control="{
                          id: getFieldId(field),
                          type: getFieldType(field),
                          label: getFieldLabel(field),
                          name: getFieldName(field),
                          required: getFieldRequired(field),
                          placeholder: getFieldPlaceholder(field),
                          options: getFieldOptions(field),
                          description: getFieldDescription(field),
                          isReadonly: getFieldReadOnly(field),
                          order: 0
                        }"
                        :model-value="fieldValues[getFieldName(field)] || ''"
                        :is-required="getFieldRequired(field)"
                        :is-read-only="getFieldReadOnly(field)"
                        @update:model-value="updateFieldValue(getFieldName(field), $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Layout -->
      <div 
        v-else-if="formLayout === 'sidebar'"
        class="form-sidebar-layout flex"
      >
        <!-- Sidebar Navigation -->
        <div class="sidebar-nav w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 screen-only">
          <div class="p-4">
            <div 
              v-for="(tab, tabIndex) in formData.tabs" 
              :key="tabIndex"
              class="sidebar-menu-item"
            >
              <div 
                :class="[
                  'flex items-center p-3 rounded-lg cursor-pointer transition-colors',
                  activeTabIndex === tabIndex 
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
                @click="activeTabIndex = tabIndex"
              >
                <i class="fas fa-folder mr-3" />
                <span class="font-medium">{{ tab.df?.label || tab.label }}</span>
                <span class="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {{ tab.sections?.length || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar Content -->
        <div class="sidebar-content flex-1">
          <div 
            v-for="(tab, tabIndex) in formData.tabs" 
            v-show="activeTabIndex === tabIndex"
            :key="tabIndex"
          >
            <div class="sidebar-content-header">
              <h2 class="text-lg font-semibold text-gray-800">
                {{ tab.df?.label || tab.label }}
              </h2>
            </div>
            
            <div 
              v-for="(section, sectionIndex) in tab.sections" 
              :key="sectionIndex"
              class="preview-section"
            >
              <div 
                v-if="getSectionTitle(section)"
                class="section-header"
              >
                <h3 class="section-title">
                  {{ getSectionTitle(section) }}
                </h3>
                <span 
                  v-if="getSectionCollapsible(section)" 
                  class="section-collapse-icon screen-only"
                >
                  <i class="fas fa-chevron-down" />
                </span>
              </div>
              
              <div class="section-content">
                <div 
                  v-for="(row, rowIndex) in getSectionRows(section)" 
                  :key="rowIndex" 
                  class="preview-row"
                >
                  <div 
                    v-for="(column, columnIndex) in getRowColumns(row)" 
                    :key="columnIndex" 
                    class="preview-column"
                    :class="`col-span-${12 / getRowColumns(row).length}`"
                  >
                    <div 
                      v-for="field in getColumnFields(column)" 
                      :key="getFieldId(field)" 
                      class="field-wrapper"
                    >
                      <FormControl
                        :control="{
                          id: getFieldId(field),
                          type: getFieldType(field),
                          label: getFieldLabel(field),
                          name: getFieldName(field),
                          required: getFieldRequired(field),
                          placeholder: getFieldPlaceholder(field),
                          options: getFieldOptions(field),
                          description: getFieldDescription(field),
                          isReadonly: getFieldReadOnly(field),
                          order: 0
                        }"
                        :model-value="fieldValues[getFieldName(field)] || ''"
                        :is-required="getFieldRequired(field)"
                        :is-read-only="getFieldReadOnly(field)"
                        @update:model-value="updateFieldValue(getFieldName(field), $event)"
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

    <!-- Empty state -->
    <div 
      v-else 
      class="empty-form"
    >
      <div class="empty-form-message">
        <div class="empty-form-icon">
          <i class="fas fa-file-alt" />
        </div>
        <h3>No form content available</h3>
        <p>Please add some tabs and sections to preview the form.</p>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="form-actions screen-only">
      <button 
        class="submit-button"
        @click="handleSubmit"
      >
        Submit Form
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
// Import the unified form control component
import FormControl from './FormControl.vue';

// Define types
interface FormData {
  metadata: {
    formName: string;
    formDescription?: string;
    formLayout?: string;
    [key: string]: any;
  };
  tabs: Array<{
    label?: string;
    df?: {
      label: string;
      name: string;
      fieldtype?: string;
    };
    sections: Array<{
      title?: string;
      collapsible?: boolean;
      df?: {
        label?: string;
        collapsible?: boolean;
      };
      columns?: Array<{
        fields: Array<{
          id?: string;
          type?: string;
          label?: string;
          name?: string;
          required?: boolean;
          placeholder?: string;
          options?: Array<{ label: string; value: string }>;
          df?: {
            name: string;
            fieldtype: string;
            label: string;
            fieldname: string;
            reqd?: boolean;
            placeholder?: string;
            options?: string | Array<any>;
            description?: string;
            readOnly?: boolean;
          };
        }>;
      }>;
      rows?: Array<{
        columns: Array<{
          fields: Array<{
            id: string;
            type: string;
            label: string;
            name: string;
            required?: boolean;
            placeholder?: string;
            options?: Array<{ label: string; value: string }>;
          }>;
        }>;
      }>;
    }>;
  }>;
}

// Props
const props = defineProps({
  formData: {
    type: Object as PropType<FormData>,
    required: true
  },
  formFields: {
    type: Array as PropType<{ type: string; props: Record<string, any> }[]>,
    default: () => []
  }
});

// Emits
const emit = defineEmits<{
  submit: [data: Record<string, any>];
  back: [];
}>();

// Setup
const activeTabIndex = ref(0);
const fieldValues = ref<Record<string, any>>({});

// Computed property for form layout
const formLayout = computed(() => {
  const layout = props.formData.metadata?.formLayout || 'tabs';
  return layout;
});

// Computed property for print mode detection
const isPrinting = computed(() => {
  return window.matchMedia && window.matchMedia('print').matches;
});

// Method to toggle accordion tabs
const toggleAccordionTab = (tabIndex: number) => {
  activeTabIndex.value = activeTabIndex.value === tabIndex ? -1 : tabIndex;
};

// Helper methods to handle both data formats (FormBuilder vs FormPreview)
const getSectionTitle = (section: any) => {
  return section.df?.label || section.title || '';
};

const getSectionCollapsible = (section: any) => {
  return section.df?.collapsible || section.collapsible || false;
};

const getSectionRows = (section: any) => {
  if (section.columns) {
    // FormBuilder format: sections have columns directly
    return [{ columns: section.columns }];
  }
  return section.rows || [];
};

const getRowColumns = (row: any) => {
  return row.columns || [];
};

const getColumnFields = (column: any) => {
  return column.fields || [];
};

const getFieldId = (field: any) => {
  return field.df?.name || field.id || field.name || '';
};

const getFieldType = (field: any) => {
  return field.df?.fieldtype || field.type || 'text';
};

const getFieldLabel = (field: any) => {
  return field.df?.label || field.label || '';
};

const getFieldName = (field: any) => {
  return field.df?.fieldname || field.name || '';
};

const getFieldRequired = (field: any) => {
  return field.df?.reqd || field.required || false;
};

const getFieldPlaceholder = (field: any) => {
  return field.df?.placeholder || field.placeholder || '';
};

const getFieldOptions = (field: any) => {
  return field.df?.options || field.options || [];
};

const getFieldDescription = (field: any) => {
  return field.df?.description || field.description || '';
};

const getFieldReadOnly = (field: any) => {
  return field.df?.readOnly || field.readOnly || false;
};

// Update field value
const updateFieldValue = (fieldName: string, value: any) => {
  fieldValues.value[fieldName] = value;
};

// Handle form submission
const handleSubmit = () => {
  emit('submit', fieldValues.value);
};

// Return reactive data and methods
defineExpose({
  activeTabIndex,
  fieldValues,
  formLayout,
  isPrinting,
  toggleAccordionTab,
  updateFieldValue,
  handleSubmit,
});
</script>

<style scoped>
/* Import form input styles to match builder appearance */
@import '../assets/css/form-inputs.css';

/* Base typography and spacing */
* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
}

.form-preview-container {
  height: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  color: #2d3748;
  overflow: auto;
  padding: 16px;
}

/* Remove grey borders from form controls in preview mode */
.form-preview-container .form-control input,
.form-preview-container .form-control textarea,
.form-preview-container .form-control select {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* Optional: Add a subtle bottom border for visual separation */
.form-preview-container .form-control input:not([type="checkbox"]):not([type="radio"]),
.form-preview-container .form-control textarea,
.form-preview-container .form-control select {
  border-bottom: 1px solid #e5e7eb !important;
  border-radius: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Focus states for preview mode */
.form-preview-container .form-control input:focus,
.form-preview-container .form-control textarea:focus,
.form-preview-container .form-control select:focus {
  border-bottom: 2px solid #3b82f6 !important;
  background-color: transparent !important;
}

/* Print-specific styles */
@media print {
  .form-preview-container {
    margin: 0;
    padding: 0;
    background: white;
    font-size: 12px;
    line-height: 1.4;
  }
  
  .screen-only {
    display: none !important;
  }
  
  .print-header {
    display: block !important;
    margin-bottom: 1rem;
    border-bottom: 2px solid #000;
    padding-bottom: 0.5rem;
  }
  
  .screen-header {
    display: none !important;
  }
  
  .form-tabs-header {
    display: none !important;
  }
  
  .tab-content {
    display: block !important;
    page-break-inside: avoid;
  }
  
  .preview-section {
    break-inside: avoid;
    margin-bottom: 1rem;
    border: 1px solid #000;
  }
  
  .section-header {
    background-color: #f8f9fa !important;
    border-bottom: 1px solid #000 !important;
  }
  
  .print-tab-section {
    page-break-before: always;
  }
  
  .accordion-header-content {
    background: white !important;
    border: 1px solid #000 !important;
    border-bottom: 2px solid #000 !important;
    padding: 0.5rem 0 !important;
  }
  
  .accordion-item {
    margin-bottom: 1rem !important;
    border: 1px solid #000 !important;
    box-shadow: none !important;
  }
  
  .accordion-content {
    display: block !important;
    border: 1px solid #000 !important;
    border-top: none !important;
    padding: 0.75rem !important;
    animation: none !important;
  }
  
  .sidebar-nav {
    display: none !important;
  }
  
  .sidebar-content {
    padding: 0 !important;
  }
}

/* Screen-only elements */
.screen-only {
  display: block;
}

.print-header {
  display: none;
}

.print-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1a202c;
}

.print-description {
  font-size: 14px;
  color: #4a5568;
  margin: 0;
}

/* Screen header */
.screen-header {
  background: #374151;
  color: white;
  padding: 1.5rem 2rem;
  margin-bottom: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.form-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Main form layout */
.form-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
}

/* Tab styling */
.form-tabs {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px);
}

.form-tabs-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-container {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: auto;
}

.tab {
  padding: 1rem 1.5rem;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #718096;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
  margin-right: 0.5rem;
  font-size: 15px;
}

.tab:hover {
  color: #4a5568;
  background-color: #f7fafc;
}

.tab.active {
  border-bottom-color: #6b7280;
  color: #6b7280;
  background-color: #f7fafc;
  font-weight: 600;
}

/* Tab content */
.tab-content-container {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Section styling */
.preview-section {
  border: none;
  border-radius: 0;
  overflow: visible;
  background-color: transparent;
  margin-bottom: 1.5rem;
  box-shadow: none;
}

.accordion-content .preview-section {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.accordion-content .preview-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  background: transparent;
  border: none;
  margin-bottom: 0.75rem;
}

.accordion-content .section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  text-transform: none;
  letter-spacing: normal;
  line-height: 1.4;
}

.accordion-content .section-title {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.section-collapse-icon {
  cursor: pointer;
  color: #718096;
  transition: color 0.2s ease;
}

.section-collapse-icon:hover {
  color: #4a5568;
}

.section-content {
  padding: 0.25rem;
}

/* Row and column layout */
.preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.preview-row:last-child {
  margin-bottom: 0;
}

.preview-column {
  flex: 1;
  min-width: 200px;
  padding: 0;
}

.field-wrapper {
  margin-bottom: 0.5rem;
  padding: 0;
}

.field-wrapper:last-child {
  margin-bottom: 0;
}

/* Column responsive classes */
.col-span-12 {
  width: 100%;
}

.col-span-6 {
  width: calc(50% - 0.25rem);
}

.col-span-4 {
  width: calc(33.333% - 0.334rem);
}

/* Empty form state */
.empty-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 3rem;
  background: #f8f9fa;
  min-height: 400px;
}

.empty-form-message {
  text-align: center;
  color: #718096;
}

.empty-form-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

/* Form actions */
.form-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  background: #f8f9fa;
}

.submit-button {
  padding: 0.75rem 2rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 15px;
}

.submit-button:hover {
  background: #5a67d8;
}

/* Accordion Layout */
.form-accordion {
  padding: 1rem;
  width: 100%;
  max-width: none;
  margin: 0;
  background: #fafafa;
}

.accordion-item {
  margin-bottom: 0.75rem;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.accordion-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.accordion-item.active {
  border-color: #6b7280;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.accordion-item.active .accordion-header-content .flex {
  border-left-color: #6b7280;
}

.accordion-item.active .accordion-title {
  color: #6b7280;
}

.accordion-item.active .accordion-badge {
  background-color: #6b7280;
  color: white;
}

.accordion-header {
  cursor: pointer;
  width: 100%;
  padding: 0;
  position: relative;
}

.accordion-header-content {
  width: 100%;
  padding: 0;
  background: #ffffff;
  border: none;
  border-radius: 0;
  transition: background-color 0.2s ease;
}

.accordion-header-content:hover {
  background: #f9fafb;
}

.accordion-header-content .flex {
  padding: 1rem 1.25rem;
  border-left: 4px solid transparent;
  transition: border-color 0.2s ease;
}

.accordion-item:hover .accordion-header-content .flex {
  border-left-color: #6b7280;
}

.accordion-chevron {
  color: #6b7280;
  margin-right: 0.75rem;
  transition: all 0.2s ease;
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.accordion-item:hover .accordion-chevron {
  color: #6b7280;
}

.accordion-title {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
  flex: 1;
  line-height: 1.4;
}

.accordion-badge {
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 11px;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-left: auto;
  font-weight: 500;
  min-width: 24px;
  text-align: center;
}

.accordion-item:hover .accordion-badge {
  background-color: #6b7280;
  color: white;
}

.accordion-content {
  background-color: #ffffff;
  border: none !important;
  border-radius: 0;
  padding: 1.25rem !important;
  width: 100%;
  border-top: 1px solid #f3f4f6 !important;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

.rotate-90 {
  transform: rotate(90deg);
}

/* Sidebar Layout */
.form-sidebar-layout {
  min-height: calc(100vh - 120px);
}

.sidebar-nav {
  background: #f8f9fa;
  padding: 0.75rem;
}

.sidebar-menu-item {
  margin-bottom: 0.25rem;
}

.sidebar-content {
  overflow-y: auto;
  padding: 0.75rem;
}

.sidebar-content-header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.375rem;
  margin-bottom: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .screen-header {
    padding: 0.75rem;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .form-description {
    font-size: 14px;
  }
  
  .tab-content-container {
    padding: 0.5rem;
  }
  
  .form-accordion {
    padding: 0.75rem;
    background: white;
  }
  
  .accordion-item {
    margin-bottom: 0.5rem;
  }
  
  .accordion-header-content .flex {
    padding: 0.75rem 1rem;
  }
  
  .accordion-content {
    padding: 1rem !important;
  }
  
  .preview-row {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .preview-column {
    width: 100% !important;
    min-width: unset;
    padding: 0;
  }
  
  .col-span-6,
  .col-span-4 {
    width: 100%;
  }
  
  .section-content {
    padding: 0.25rem;
  }
  
  .field-wrapper {
    margin-bottom: 0.375rem;
    padding: 0;
  }
  
  .form-sidebar-layout {
    flex-direction: column;
  }
  
  .sidebar-nav {
    width: 100% !important;
  }
  
  .sidebar-content {
    padding: 0.5rem !important;
  }
  
  .accordion-header-content {
    padding: 0;
  }
  
  .accordion-title {
    font-size: 14px;
  }
}

/* Form controls will use their own styling from control components */
.form-preview-container :deep(.control) {
  margin-bottom: 0.5rem;
}

/* Utility classes */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.flex-1 {
  flex: 1;
}

.w-64 {
  width: 16rem;
}

.p-4 {
  padding: 1rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-6 {
  padding: 1.5rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-auto {
  margin-left: auto;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.rounded-lg {
  border-radius: 4px;
}

.rounded-full {
  border-radius: 4px;
}

.bg-gray-50 {
  background-color: #f8f9fa;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-200 {
  background-color: #e9ecef;
}

.bg-blue-50 {
  background-color: #ebf4ff;
}

.bg-blue-100 {
  background-color: #bee3f8;
}

.border {
  border-width: 1px;
}

.border-r {
  border-right-width: 1px;
}

.border-l {
  border-left-width: 1px;
  border-left-color: inherit;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-200 {
  border-color: #e2e8f0;
}

.text-gray-500 {
  color: #718096;
}

.text-gray-600 {
  color: #4a5568;
}

.text-gray-800 {
  color: #2d3748;
}

.text-blue-500 {
  color: #4299e1;
}

.text-blue-600 {
  color: #3182ce;
}

.text-blue-700 {
  color: #2c5282;
}

.text-xs {
  font-size: 0.75rem;
}

.text-xl {
  font-size: 1.25rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.transition-transform {
  transition-property: transform;
  transition-duration: 300ms;
  transition-timing-function: ease;
}

.duration-300 {
  transition-duration: 300ms;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}
</style>
