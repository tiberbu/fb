<template>
  <div class="table-control-properties">
    <!-- Table Configuration Section -->
    <AccordionSection 
      title="Table Configuration" 
      :initially-open="true"
    >
      <!-- Linked Form Selection -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">
          Linked Form
        </label>
        <select
          v-model="controlCopy.linkedFormId"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          @change="onLinkedFormChange"
        >
          <option value="">
            Select a form...
          </option>
          <option 
            v-for="form in availableForms" 
            :key="form._id" 
            :value="form._id"
          >
            {{ form.name }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          Choose a form whose fields will become table columns
        </p>
      </div>

      <!-- Selected Form Info -->
      <div 
        v-if="selectedForm" 
        class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-blue-900">
            {{ selectedForm.name }}
          </h4>
          <span class="text-xs text-blue-600">
            {{ tableColumns.length }} columns
          </span>
        </div>
        <p class="text-xs text-blue-700">
          {{ selectedForm.description || 'No description available' }}
        </p>
      </div>

      <!-- Table Settings -->
      <div class="space-y-4">
        <!-- Row Limits -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              Min Rows
            </label>
            <input
              v-model.number="controlCopy.minRows"
              type="number"
              min="0"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              Max Rows
            </label>
            <input
              v-model.number="controlCopy.maxRows"
              type="number"
              min="1"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
          </div>
        </div>

        <!-- Table Permissions -->
        <div class="space-y-2">
          <div class="flex items-center">
            <input
              v-model="controlCopy.allowAdd"
              type="checkbox"
              class="mr-2"
            >
            <label class="text-sm text-gray-600">
              Allow adding new rows
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="controlCopy.allowEdit"
              type="checkbox"
              class="mr-2"
            >
            <label class="text-sm text-gray-600">
              Allow editing existing rows
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="controlCopy.allowDelete"
              type="checkbox"
              class="mr-2"
            >
            <label class="text-sm text-gray-600">
              Allow deleting rows
            </label>
          </div>
        </div>
      </div>
    </AccordionSection>

    <!-- Column Configuration Section -->
    <AccordionSection 
      v-if="tableColumns.length > 0" 
      title="Column Configuration"
    >
      <p class="text-xs text-gray-500 mb-3">
        These columns are automatically generated from the selected form fields.
      </p>
      
      <div class="space-y-2">
        <div 
          v-for="(column, index) in tableColumns" 
          :key="column.id"
          class="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded"
        >
          <div class="flex items-center space-x-2">
            <i 
              class="fas text-sm text-gray-500"
              :class="getColumnIcon(column.type)"
            />
            <div>
              <div class="text-sm font-medium text-gray-900">
                {{ column.label }}
              </div>
              <div class="text-xs text-gray-500">
                {{ column.type }} • {{ column.name }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-1">
            <span 
              v-if="column.required" 
              class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
            >
              Required
            </span>
            <span class="text-xs text-gray-500">
              {{ index + 1 }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <div class="flex items-start">
          <i class="fas fa-info-circle text-yellow-600 text-sm mt-0.5 mr-2" />
          <div class="text-xs text-yellow-800">
            <strong>Note:</strong> To modify columns, edit the linked form structure. 
            Changes to the form will automatically update this table.
          </div>
        </div>
      </div>
    </AccordionSection>

    <!-- Preview Section -->
    <AccordionSection 
      v-if="tableColumns.length > 0" 
      title="Table Preview"
    >
      <div class="border border-gray-200 rounded overflow-hidden">
        <!-- Preview Header -->
        <div class="bg-gray-50 border-b border-gray-200">
          <div class="flex">
            <div 
              v-for="column in tableColumns.slice(0, 3)" 
              :key="column.id"
              class="flex-1 px-3 py-2 text-xs font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {{ column.label }}
            </div>
            <div 
              v-if="tableColumns.length > 3" 
              class="px-3 py-2 text-xs text-gray-500"
            >
              +{{ tableColumns.length - 3 }} more
            </div>
          </div>
        </div>
        
        <!-- Preview Empty State -->
        <div class="px-3 py-4 text-center text-gray-500">
          <i class="fas fa-table text-lg mb-1 text-gray-300" />
          <p class="text-xs">
            Table preview - data will appear here
          </p>
        </div>
      </div>
    </AccordionSection>

    <!-- Refresh Forms Button -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <button
        :disabled="loadingForms"
        class="w-full flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-300 rounded disabled:opacity-50"
        @click="loadAvailableForms"
      >
        <i 
          :class="loadingForms ? 'fa-spinner fa-spin' : 'fa-sync-alt'"
          class="fas text-xs mr-2"
        />
        {{ loadingForms ? 'Loading...' : 'Refresh Forms' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Control } from '../../types';
import AccordionSection from './AccordionSection.vue';
import { useFormAPI } from '../../composables/useFormAPI';

interface Props {
  control: Control;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update': [control: Control];
}>();

// Create a reactive copy of the control
const controlCopy = ref<Control>({ ...props.control });

// Watch for prop changes and update the copy
watch(() => props.control, (newControl) => {
  controlCopy.value = { ...newControl };
}, { deep: true });

// Emit updates when the copy changes
watch(controlCopy, (newControl) => {
  emit('update', { ...newControl });
}, { deep: true });

// Form API for loading available forms
const { savedForms, loadSavedForms, loading: loadingForms } = useFormAPI();

// Available forms for selection
const availableForms = computed(() => {
  return savedForms.value.filter(form => form.isActive !== false);
});

// Currently selected form
const selectedForm = computed(() => {
  if (!controlCopy.value.linkedFormId) return null;
  return availableForms.value.find(form => form._id === controlCopy.value.linkedFormId) || null;
});

// Table columns derived from selected form
const tableColumns = computed(() => {
  if (!selectedForm.value) return [];
  
  // Extract fields from the form configuration
  const fields: Control[] = [];
  
  if (selectedForm.value.configuration?.layout?.tabs) {
    selectedForm.value.configuration.layout.tabs.forEach((tab: any) => {
      if (tab.sections) {
        tab.sections.forEach((section: any) => {
          if (section.rows) {
            section.rows.forEach((row: any) => {
              if (row.columns) {
                row.columns.forEach((column: any) => {
                  if (column.fields) {
                    fields.push(...column.fields);
                  }
                });
              }
            });
          } else if (section.columns) {
            section.columns.forEach((column: any) => {
              if (column.fields) {
                fields.push(...column.fields);
              }
            });
          }
        });
      }
    });
  }
  
  return fields.filter(field => field.type !== 'divider' && field.type !== 'html');
});

// Update table columns when linked form changes
watch(tableColumns, (newColumns) => {
  controlCopy.value.tableColumns = [...newColumns];
  if (selectedForm.value) {
    controlCopy.value.linkedFormName = selectedForm.value.name;
  }
}, { deep: true, immediate: true });

// Also watch linkedFormId changes to ensure immediate updates
watch(() => controlCopy.value.linkedFormId, (newFormId, oldFormId) => {
  if (newFormId !== oldFormId) {
    // Force reactivity update
    if (tableColumns.value.length > 0) {
      controlCopy.value.tableColumns = [...tableColumns.value];
    }
  }
}, { immediate: true });

// Initialize default values
function initializeDefaults() {
  if (controlCopy.value.allowAdd === undefined) controlCopy.value.allowAdd = true;
  if (controlCopy.value.allowEdit === undefined) controlCopy.value.allowEdit = true;
  if (controlCopy.value.allowDelete === undefined) controlCopy.value.allowDelete = true;
  if (controlCopy.value.minRows === undefined) controlCopy.value.minRows = 0;
  if (controlCopy.value.maxRows === undefined) controlCopy.value.maxRows = 50;
}

// Handle linked form change
function onLinkedFormChange() {
  if (!controlCopy.value.linkedFormId) {
    controlCopy.value.linkedFormName = '';
    controlCopy.value.tableColumns = [];
  }
}

// Load available forms
async function loadAvailableForms() {
  try {
    await loadSavedForms();
  } catch (error) {
    // Handle error silently in production
    // Error will be shown through the useFormAPI error state
  }
}

// Get icon for column type
function getColumnIcon(type: string): string {
  switch (type) {
    case 'text': return 'fa-font';
    case 'textarea': return 'fa-align-left';
    case 'number': return 'fa-hashtag';
    case 'email': return 'fa-envelope';
    case 'phone': return 'fa-phone';
    case 'url': return 'fa-globe';
    case 'password': return 'fa-lock';
    case 'select': return 'fa-list';
    case 'radio': return 'fa-dot-circle';
    case 'checkbox': return 'fa-check-square';
    case 'date': return 'fa-calendar';
    case 'datetime': return 'fa-calendar-alt';
    case 'time': return 'fa-clock';
    case 'file': return 'fa-file-upload';
    case 'image': return 'fa-image';
    default: return 'fa-square';
  }
}

// Initialize on mount
onMounted(() => {
  initializeDefaults();
  loadAvailableForms();
});
</script>

<style scoped>
/* Table control properties specific styles */
</style>
