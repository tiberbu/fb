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
      <!-- Tabs Layout (default) -->
      <div 
        v-if="formLayout === 'tabs' || !formLayout" 
        class="form-tabs"
      >
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

      <!-- Accordion Layout -->
      <div 
        v-else-if="formLayout === 'accordion'" 
        class="form-accordion"
      >
        <div 
          v-for="(tab, tabIndex) in formData.tabs" 
          :key="tabIndex"
          class="accordion-item"
        >
          <div 
            class="accordion-header"
            @click="toggleAccordionTab(tabIndex)"
          >
            <div class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
              <div class="flex items-center">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg mr-3">
                  <i 
                    class="fas fa-chevron-right transition-transform duration-300 text-blue-600"
                    :class="{ 'rotate-90': activeTabIndex === tabIndex }"
                  />
                </div>
                <div class="flex items-center">
                  <i class="fas fa-folder text-blue-500 mr-2" />
                  <span class="font-medium text-gray-800">{{ tab.label }}</span>
                  <span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {{ tab.sections?.length || 0 }} sections
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            v-if="activeTabIndex === tabIndex"
            class="accordion-content p-4 border-l border-r border-b border-gray-200 rounded-b-lg"
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

      <!-- Sidebar Layout -->
      <div 
        v-else-if="formLayout === 'sidebar'" 
        class="form-sidebar-layout flex"
      >
        <div class="sidebar-nav bg-gray-50 border-r border-gray-200 w-64 flex-shrink-0">
          <div class="p-4">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Form Pages
            </h3>
            <div 
              v-for="(tab, tabIndex) in formData.tabs" 
              :key="tabIndex"
              :class="[
                'sidebar-menu-item p-3 rounded-lg cursor-pointer transition-colors',
                activeTabIndex === tabIndex ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              ]"
              @click="activeTabIndex = tabIndex"
            >
              <div class="flex items-center">
                <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3">
                  <i class="fas fa-file-alt text-gray-600 text-sm" />
                </div>
                <div>
                  <span class="font-medium">{{ tab.label }}</span>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ tab.sections?.length || 0 }} sections
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sidebar-content flex-1 p-6">
          <div class="sidebar-content-header mb-6">
            <div class="flex items-center">
              <div class="bg-blue-100 p-2 rounded-lg mr-3">
                <i class="fas fa-edit text-blue-600" />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-800">
                  {{ formData.tabs[activeTabIndex]?.label || 'Page Content' }}
                </h2>
                <p class="text-sm text-gray-600 mt-1">
                  Complete the information for this page
                </p>
              </div>
            </div>
          </div>
          
          <div 
            v-for="(section, sectionIndex) in formData.tabs[activeTabIndex]?.sections || []" 
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
import { defineComponent, PropType, ref, computed } from 'vue';
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
  formLayout?: 'tabs' | 'accordion' | 'sidebar';
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

    // Computed property for form layout
    const formLayout = computed(() => {
      const layout = props.formData.metadata?.formLayout || 'tabs';
      return layout;
    });

    // Method to toggle accordion tabs
    const toggleAccordionTab = (tabIndex: number) => {
      activeTabIndex.value = activeTabIndex.value === tabIndex ? -1 : tabIndex;
    };

    // Convert from form builder field type to control component field type
    const convertFieldType = (type: string) => {
      // Map form JSON field types to FieldControl component types
      // based on available controls in the project
      const typeMap: Record<string, string> = {
        'text': 'Text',
        'textarea': 'Text Area',
        'number': 'Number',
        'date': 'Date',
        'datetime': 'Date Time',
        'time': 'Time',
        'checkbox': 'Checkbox',
        'check': 'Checkbox',
        'select': 'Select',
        'radio': 'Radio',
        'email': 'Email',
        'phone': 'Phone',
        'url': 'URL',
        'password': 'Password',
        'file': 'File',
        'image': 'Image',
        'range': 'Range',
        'color': 'Color',
        'hidden': 'Hidden',
        'readonly': 'Read Only',
        'divider': 'Divider',
        'html': 'HTML',
        'link': 'URL',
        // Legacy support
        'data': 'Data'
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
      formLayout,
      toggleAccordionTab,
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

/* Accordion Layout Styles */
.form-accordion {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.accordion-item {
  margin-bottom: 1rem;
}

.accordion-header {
  cursor: pointer;
}

.accordion-content {
  background-color: #fafafa;
  border-top: none !important;
  border-radius: 0 0 8px 8px;
}

.rotate-90 {
  transform: rotate(90deg);
}

/* Sidebar Layout Styles */
.form-sidebar-layout {
  height: 100%;
  min-height: 500px;
}

.sidebar-nav {
  min-height: 500px;
}

.sidebar-menu-item {
  margin-bottom: 0.5rem;
}

.sidebar-content {
  overflow-y: auto;
}

.sidebar-content-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

/* Utility classes for flex layouts */
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

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.p-4 {
  padding: 1rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-2 {
  padding: 0.5rem;
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

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.border {
  border-width: 1px;
}

.border-r {
  border-right-width: 1px;
}

.border-l {
  border-left-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-800 {
  color: #1f2937;
}

.text-blue-600 {
  color: #2563eb;
}

.text-blue-700 {
  color: #1d4ed8;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
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

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}
</style>