<template>
  <div 
    class="table-control" 
    :class="fieldClasses"
  >
    <label 
      v-if="df.label" 
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      <!-- {{ df.label }} -->
      <span 
        v-if="df.reqd" 
        class="text-red-500 ml-1"
      >*</span>
    </label>
    
    <div 
      v-if="df.helpText" 
      class="text-xs text-gray-500 mb-2"
    >
      {{ df.helpText }}
    </div>

    <!-- Table Container -->
    <div class="table-container border border-gray-300 rounded-lg overflow-hidden">
      <!-- Table Header -->
      <div 
        v-if="tableColumns.length > 0" 
        class="table-header bg-gray-50 border-b border-gray-200"
      >
        <div class="table-row-flex">
          <div 
            v-for="column in tableColumns" 
            :key="column.id"
            class="table-cell flex-1 px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            {{ column.label }}
            <span 
              v-if="column.required" 
              class="text-red-500 ml-1"
            >*</span>
          </div>
          <div 
            v-if="allowActions" 
            class="table-cell w-20 px-3 py-2 text-sm font-medium text-gray-700 text-center"
          >
            Actions
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="table-body">
        <!-- Existing Rows -->
        <div 
          v-for="(row, rowIndex) in tableData" 
          :key="rowIndex"
          class="table-row-flex border-b border-gray-100 last:border-b-0 hover:bg-gray-25"
        >
          <div 
            v-for="column in tableColumns" 
            :key="column.id"
            class="table-cell flex-1 px-3 py-2 border-r border-gray-200 last:border-r-0"
          >
            <div class="text-sm text-gray-900">
              {{ formatCellValue(row[column.name], column.type) }}
            </div>
          </div>
          <div 
            v-if="allowActions" 
            class="table-cell w-20 px-3 py-2 text-center"
          >
            <div class="flex justify-center space-x-1">
              <button
                v-if="allowEdit"
                type="button"
                title="Edit row"
                class="text-blue-600 hover:text-blue-800 p-1"
                @click.prevent="editRow(rowIndex)"
              >
                <i class="fas fa-edit text-xs" />
              </button>
              <button
                v-if="allowDelete"
                type="button"
                title="Delete row"
                class="text-red-600 hover:text-red-800 p-1"
                @click.prevent="deleteRow(rowIndex)"
              >
                <i class="fas fa-trash text-xs" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div 
          v-if="tableData.length === 0" 
          class="text-center py-8 text-gray-500"
        >
          <i class="fas fa-table text-3xl mb-2 text-gray-300" />
          <p class="text-sm">
            No data available
          </p>
          <p class="text-xs text-gray-400">
            Click "Add Row" to get started
          </p>
        </div>
      </div>

      <!-- Add Row Button -->
      <div 
        v-if="allowAdd && !readonly" 
        class="table-footer bg-gray-50 px-3 py-2 border-t border-gray-200"
      >
        <button
          type="button"
          :disabled="!!(maxRows && tableData.length >= maxRows)"
          class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          @click.prevent="addRow"
        >
          <i class="fas fa-plus text-xs" />
          <span>Add Row</span>
          <span 
            v-if="maxRows" 
            class="text-xs text-gray-500"
          >({{ tableData.length }}/{{ maxRows }})</span>
        </button>
      </div>
    </div>

    <!-- No Form Selected State -->
    <div 
      v-if="!linkedFormId" 
      class="text-center py-8 text-gray-500 border border-gray-300 rounded-lg bg-gray-50"
    >
      <i class="fas fa-link text-3xl mb-2 text-gray-300" />
      <p class="text-sm">
        No form selected
      </p>
      <p class="text-xs text-gray-400">
        Configure the table in the properties panel
      </p>
    </div>

    <!-- Table Data Modal -->
    <div 
      v-if="showModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <div class="modal-header px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? 'Edit Row' : 'Add New Row' }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ isEditing ? 'Edit existing row data' : 'Add new row to table' }}
            </p>
          </div>
          <button 
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click.prevent="closeModal"
          >
            <i class="fas fa-times" />
          </button>
        </div>
        
        <div class="modal-body px-6 py-4 overflow-y-auto max-h-96">
          <div 
            v-if="tableColumns.length === 0" 
            class="text-center py-4 text-gray-500"
          >
            <p>No columns available. Please configure the table in the properties panel.</p>
          </div>
          
          <div 
            v-else 
            class="space-y-4"
          >
            <div 
              v-for="column in tableColumns" 
              :key="column.id" 
              class="form-group"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ column.label }}
                <span 
                  v-if="column.required" 
                  class="text-red-500 ml-1"
                >*</span>
              </label>
              
              <!-- Text Input -->
              <input
                v-if="column.type === 'text' || column.type === 'email' || column.type === 'phone' || column.type === 'url'"
                v-model="currentRowData[column.name]"
                :type="getInputType(column.type)"
                :placeholder="column.placeholder"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Textarea -->
              <textarea
                v-else-if="column.type === 'textarea'"
                v-model="currentRowData[column.name]"
                :placeholder="column.placeholder"
                :required="column.required"
                :rows="column.rows || 3"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <!-- Number Input -->
              <input
                v-else-if="column.type === 'number'"
                v-model.number="currentRowData[column.name]"
                type="number"
                :placeholder="column.placeholder"
                :required="column.required"
                :min="column.min"
                :max="column.max"
                :step="column.step"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Select Dropdown -->
              <select
                v-else-if="column.type === 'select'"
                v-model="currentRowData[column.name]"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  Select an option...
                </option>
                <option 
                  v-for="option in column.options" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              
              <!-- Date Input -->
              <input
                v-else-if="column.type === 'date'"
                v-model="currentRowData[column.name]"
                type="date"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- DateTime Input -->
              <input
                v-else-if="column.type === 'datetime'"
                v-model="currentRowData[column.name]"
                type="datetime-local"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Checkbox -->
              <div 
                v-else-if="column.type === 'checkbox'" 
                class="flex items-center"
              >
                <input
                  v-model="currentRowData[column.name]"
                  type="checkbox"
                  :required="column.required"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ column.placeholder || column.label }}</span>
              </div>
              
              <!-- Default fallback -->
              <input
                v-else
                v-model="currentRowData[column.name]"
                type="text"
                :placeholder="column.placeholder"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <div 
                v-if="column.helpText" 
                class="text-xs text-gray-500 mt-1"
              >
                {{ column.helpText }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click.prevent="closeModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="color: white !important;"
            @click.prevent="saveRow"
          >
            {{ isEditing ? 'Update' : 'Add' }} Row
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useFormBuilderStore } from '../../stores/form-builder-store';
import type { Control } from '../../types';

interface TableDocField {
  fieldtype: string;
  label: string;
  fieldname: string;
  reqd?: boolean;
  placeholder?: string;
  options?: any[];
  helpText?: string;
  linkedFormId?: string;
  linkedFormName?: string;
  tableColumns?: Control[];
  maxRows?: number;
  minRows?: number;
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  tableData?: any[]; // Add the tableData property
}

interface Props {
  df: TableDocField;
  value?: any[];
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  readonly: false
});

const emit = defineEmits<{
  'update:model-value': [value: any[]];
  'update:table-data': [data: any[]]; // Add this to update the control's tableData property
}>();

// Store
const formStore = useFormBuilderStore();

// Reactive data
const tableData = ref<any[]>([]);
const showModal = ref(false);
const currentRowData = ref<Record<string, any>>({});
const editingIndex = ref<number | null>(null);
const linkedFormFields = ref<any[]>([]);

// Computed properties
const linkedFormId = computed(() => {
  const formId = props.df.linkedFormId;
  
  // Debug logging
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: computed linkedFormId', { formId, df: props.df });
  }
  
  return formId;
});
const tableColumns = computed(() => {
  // Debug logging
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: computing tableColumns', {
      dfTableColumns: props.df.tableColumns,
      linkedFormId: props.df.linkedFormId,
      linkedFormFieldsLength: linkedFormFields.value.length,
      linkedFormFields: linkedFormFields.value
    });
  }
  
  // First priority: Use tableColumns from properties panel if available
  if (props.df.tableColumns && props.df.tableColumns.length > 0) {
    const columns = props.df.tableColumns.map(field => ({
      id: field.id || field.name,
      name: field.name,
      label: field.label || field.name,
      type: field.type?.toLowerCase() || 'text',
      required: field.required || false,
      placeholder: field.placeholder || '',
      helpText: field.helpText || field.description || '',
      options: field.options || [],
      min: field.min,
      max: field.max,
      step: field.step,
      rows: field.rows || 3
    }));
    
    if (typeof window !== 'undefined') {
      window.console?.log('TableControl: using tableColumns from props', columns);
    }
    
    return columns;
  }
  
  // Second priority: Use fields from the linked form (if we fetched them)
  if (linkedFormFields.value.length > 0) {
    const columns = linkedFormFields.value.map(field => ({
      id: field.name || field.fieldname,
      name: field.fieldname || field.name,
      label: field.label || field.fieldname,
      type: field.fieldtype?.toLowerCase() || 'text',
      required: field.reqd || false,
      placeholder: field.description || '',
      helpText: field.description || '',
      options: field.options || [],
      min: field.min,
      max: field.max,
      step: field.step,
      rows: field.rows || 3
    }));
    
    if (typeof window !== 'undefined') {
      window.console?.log('TableControl: using columns from fetched form fields', columns);
    }
    
    return columns;
  }
  
  // Third priority: Show test headers when no form is selected (for debugging)
  if (!props.df.linkedFormId) {
    const testColumns = [
      { 
        id: 'test1', 
        name: 'test1', 
        label: 'Test Column 1', 
        type: 'text', 
        required: false, 
        placeholder: '', 
        helpText: '', 
        options: [], 
        min: undefined,
        max: undefined,
        step: undefined,
        rows: 3 
      },
      { 
        id: 'test2', 
        name: 'test2', 
        label: 'Test Column 2', 
        type: 'text', 
        required: false, 
        placeholder: '', 
        helpText: '', 
        options: [],
        min: undefined,
        max: undefined,
        step: undefined,
        rows: 3 
      }
    ];
    
    if (typeof window !== 'undefined') {
      window.console?.log('TableControl: using test columns (no form selected)', testColumns);
    }
    
    return testColumns;
  }
  
  // Fallback: Empty array
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: no columns available, returning empty array');
  }
  
  return [];
});
const maxRows = computed(() => props.df.maxRows);
const minRows = computed(() => props.df.minRows);
const allowAdd = computed(() => props.df.allowAdd !== false);
const allowDelete = computed(() => props.df.allowDelete !== false);
const allowEdit = computed(() => props.df.allowEdit !== false);
const allowActions = computed(() => allowEdit.value || allowDelete.value);
const isEditing = computed(() => editingIndex.value !== null);
const readonly = computed(() => props.readonly);

const fieldClasses = computed(() => {
  const classes = ['table-control'];
  if (props.df.reqd) classes.push('required');
  return classes.join(' ');
});

// Initialize table data from props.value OR props.df.tableData
watch(() => props.value, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    tableData.value = [...newValue];
  } else {
    tableData.value = [];
  }
}, { immediate: true });

// Also initialize from df.tableData (for form builder mode)
watch(() => props.df.tableData, (newTableData) => {
  if (newTableData && Array.isArray(newTableData) && newTableData.length > 0) {
    tableData.value = [...newTableData];
  }
}, { immediate: true });

// Watch for df prop changes (entire object)
watch(() => props.df, (newDf, oldDf) => {
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: df prop changed', { 
      newDf, 
      oldDf,
      newTableColumnsLength: newDf.tableColumns?.length || 0,
      oldTableColumnsLength: oldDf?.tableColumns?.length || 0,
      newLinkedFormId: newDf.linkedFormId,
      oldLinkedFormId: oldDf?.linkedFormId
    });
  }
}, { deep: true, immediate: true });

// Watch for df.tableColumns changes (from properties panel)
watch(() => props.df.tableColumns, (newColumns, oldColumns) => {
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: df.tableColumns changed', { 
      newColumns, 
      oldColumns,
      newLength: newColumns?.length || 0,
      oldLength: oldColumns?.length || 0
    });
  }
}, { deep: true, immediate: true });

// Watch for linked form changes and fetch form fields
watch(linkedFormId, async (newFormId, oldFormId) => {
  // Debug logging
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: linkedFormId changed', { newFormId, oldFormId, df: props.df });
  }
  
  if (newFormId) {
    await fetchLinkedFormFields(newFormId);
  } else {
    linkedFormFields.value = [];
  }
}, { immediate: true });

// Emit changes to both value and control configuration
watch(tableData, (newData) => {
  emit('update:model-value', [...newData]);
  emit('update:table-data', [...newData]);
}, { deep: true });

// Fetch linked form fields
async function fetchLinkedFormFields(formId: string) {
  try {
    // Debug logging
    if (typeof window !== 'undefined') {
      window.console?.log('TableControl: fetchLinkedFormFields called', { formId });
    }
    
    // Load saved forms to get the form configuration
    await formStore.loadSavedForms();
    
    // Debug logging
    if (typeof window !== 'undefined') {
      window.console?.log('TableControl: savedForms loaded', formStore.savedForms);
    }
    
    // Find the linked form in saved forms
    const linkedForm = formStore.savedForms.find(form => form._id === formId);
    
    if (typeof window !== 'undefined') {
      window.console?.log('TableControl: linkedForm found', linkedForm);
    }
    
    if (linkedForm && linkedForm.configuration) {
      // Extract all fields from the form configuration
      const fields: any[] = [];
      
      // Navigate through tabs -> sections -> columns -> fields
      if (linkedForm.configuration.layout && linkedForm.configuration.layout.tabs) {
        linkedForm.configuration.layout.tabs.forEach((tab: any) => {
          if (tab.sections) {
            tab.sections.forEach((section: any) => {
              if (section.columns) {
                section.columns.forEach((column: any) => {
                  if (column.fields) {
                    column.fields.forEach((field: any) => {
                      // Only include data fields (not layout fields)
                      if (field.df && field.df.fieldtype && 
                          !['Tab Break', 'Section Break', 'Column Break', 'HTML'].includes(field.df.fieldtype)) {
                        fields.push(field.df);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      if (typeof window !== 'undefined') {
        window.console?.log('TableControl: extracted fields', fields);
      }
      
      linkedFormFields.value = fields;
    } else {
      linkedFormFields.value = [];
    }
  } catch (error) {
    // Handle error silently - form fields will remain empty
    if (typeof window !== 'undefined') {
      window.console?.log('TableControl: error fetching fields', error);
    }
    linkedFormFields.value = [];
  }
}

// Methods
function addRow() {
  // Debug logging
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: addRow called', {
      maxRows: maxRows.value,
      currentLength: tableData.value.length,
      tableColumns: tableColumns.value
    });
  }
  
  if (maxRows.value && tableData.value.length >= maxRows.value) {
    return;
  }
  
  currentRowData.value = {};
  editingIndex.value = null;
  showModal.value = true;
  
  // Debug logging
  if (typeof window !== 'undefined') {
    window.console?.log('TableControl: modal should be open', {
      showModal: showModal.value,
      currentRowData: currentRowData.value,
      tableColumns: tableColumns.value.length
    });
  }
}

function editRow(index: number) {
  currentRowData.value = { ...tableData.value[index] };
  editingIndex.value = index;
  showModal.value = true;
}

function deleteRow(index: number) {
  if (confirm('Are you sure you want to delete this row?')) {
    tableData.value.splice(index, 1);
  }
}

function saveRow() {
  // Validate required fields
  const missingFields = tableColumns.value.filter(column => 
    column.required && !currentRowData.value[column.name]
  );
  
  if (missingFields.length > 0) {
    alert(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
    return;
  }
  
  if (isEditing.value && editingIndex.value !== null) {
    // Update existing row
    tableData.value[editingIndex.value] = { ...currentRowData.value };
  } else {
    // Add new row
    tableData.value.push({ ...currentRowData.value });
  }
  
  closeModal();
}

function closeModal() {
  showModal.value = false;
  currentRowData.value = {};
  editingIndex.value = null;
}

function formatCellValue(value: any, type: string): string {
  if (value == null || value === '') return '-';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'checkbox':
      return value ? 'Yes' : 'No';
    case 'number':
      return typeof value === 'number' ? value.toString() : value;
    default:
      return String(value);
  }
}

function getInputType(fieldType: string): string {
  switch (fieldType) {
    case 'email': return 'email';
    case 'phone': return 'tel';
    case 'url': return 'url';
    case 'password': return 'password';
    default: return 'text';
  }
}

onMounted(() => {
  // Initialize with minimum rows if specified
  if (minRows.value && tableData.value.length < minRows.value) {
    const rowsToAdd = minRows.value - tableData.value.length;
    for (let i = 0; i < rowsToAdd; i++) {
      tableData.value.push({});
    }
  }
});
</script>

<style scoped>
.table-control {
  margin-bottom: 1rem;
}

.table-container {
  background: white;
}

.table-row-flex {
  display: flex;
  min-height: 40px;
}

.table-cell {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.table-header .table-cell {
  background-color: #f9fafb;
}

.modal-header {
  background-color: #f9fafb;
}

.hover\:bg-gray-25:hover {
  background-color: #fafafa;
}

/* Form styling in modal */
.form-group label {
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Required field styling */
.required .table-container {
  border-color: #ef4444;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-row-flex {
    flex-direction: column;
  }
  
  .table-cell {
    border-right: none !important;
    border-bottom: 1px solid #e5e7eb;
    justify-content: space-between;
  }
  
  .table-cell:last-child {
    border-bottom: none;
  }
  
  .table-header .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    min-width: 100px;
  }
}
</style>
