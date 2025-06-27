<template>
  <div class="field-type-selector">
    <div class="selector-header">
      <h3 class="text-gray-700 font-medium mb-2">Select Field Type</h3>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <i class="fas fa-times" />
      </button>
    </div>
    
    <div class="mb-3">
      <input
        v-model="fieldSearchQuery"
        type="text"
        placeholder="Search field types..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
    </div>
    
    <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
      <button
        v-for="fieldType in filteredFieldTypes"
        :key="fieldType.type"
        class="field-type-button flex items-center p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-left text-sm transition-colors"
        @click="selectFieldType(fieldType.type as ControlType)"
      >
        <div class="field-type-icon mr-3 text-gray-500 w-5 text-center">
          <i class="fas" :class="getIconForFieldType(fieldType.type)" />
        </div>
        <div class="flex-1">
          <div class="font-medium text-gray-900">{{ fieldType.label }}</div>
          <div class="text-xs text-gray-500">{{ getFieldTypeDescription(fieldType.type) }}</div>
        </div>
      </button>
    </div>
    
    <div v-if="filteredFieldTypes.length === 0 && fieldSearchQuery" class="text-center py-4 text-gray-500 text-sm">
      No field types found matching "{{ fieldSearchQuery }}"
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ControlType } from '../../types';

// Field search functionality
const fieldSearchQuery = ref("");

// Complete field types list (matching FormBuilder.vue)
const fieldTypes = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Text Area" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "url", label: "URL" },
  { type: "password", label: "Password" },
  { type: "select", label: "Select" },
  { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "datetime", label: "Date Time" },
  { type: "time", label: "Time" },
  { type: "file", label: "File Upload" },
  { type: "image", label: "Image Upload" },
  { type: "table", label: "Table" },
  { type: "range", label: "Range/Slider" },
  { type: "color", label: "Color Picker" },
  { type: "link", label: "Link" },
  { type: "hidden", label: "Hidden Field" },
  { type: "readonly", label: "Read Only" },
  { type: "divider", label: "Divider" },
  { type: "html", label: "HTML Content" },
];

// Computed property for filtered field types
const filteredFieldTypes = computed(() => {
  if (!fieldSearchQuery.value) {
    return fieldTypes;
  }
  
  const query = fieldSearchQuery.value.toLowerCase();
  return fieldTypes.filter(fieldType => 
    fieldType.label.toLowerCase().includes(query) || 
    fieldType.type.toLowerCase().includes(query) ||
    getFieldTypeDescription(fieldType.type).toLowerCase().includes(query)
  );
});

const emit = defineEmits(['select-field-type', 'close']);

function selectFieldType(type: ControlType) {
  emit('select-field-type', type);
}

// Helper function to get icon for field type (matching FormBuilder.vue)
function getIconForFieldType(type: string) {
  switch (type) {
    case 'text':
      return 'fa-font';
    case 'textarea':
      return 'fa-align-left';
    case 'number':
      return 'fa-hashtag';
    case 'email':
      return 'fa-envelope';
    case 'phone':
      return 'fa-phone';
    case 'url':
      return 'fa-globe';
    case 'password':
      return 'fa-lock';
    case 'select':
      return 'fa-list';
    case 'radio':
      return 'fa-dot-circle';
    case 'checkbox':
      return 'fa-check-square';
    case 'date':
      return 'fa-calendar';
    case 'datetime':
      return 'fa-calendar-alt';
    case 'time':
      return 'fa-clock';
    case 'file':
      return 'fa-file-upload';
    case 'image':
      return 'fa-image';
    case 'table':
      return 'fa-table';
    case 'range':
      return 'fa-sliders-h';
    case 'color':
      return 'fa-palette';
    case 'link':
      return 'fa-link';
    case 'hidden':
      return 'fa-eye-slash';
    case 'readonly':
      return 'fa-eye';
    case 'divider':
      return 'fa-minus';
    case 'html':
      return 'fa-code';
    default:
      return 'fa-square';
  }
}

// Helper function to get description for field type (matching FormBuilder.vue)
function getFieldTypeDescription(type: string) {
  switch (type) {
    case 'text':
      return 'Single line text input';
    case 'textarea':
      return 'Multi-line text input';
    case 'number':
      return 'Numeric input field';
    case 'email':
      return 'Email address input';
    case 'phone':
      return 'Phone number input';
    case 'url':
      return 'Website URL input';
    case 'password':
      return 'Password input field';
    case 'select':
      return 'Dropdown selection';
    case 'radio':
      return 'Radio button group';
    case 'checkbox':
      return 'Checkbox input';
    case 'date':
      return 'Date picker';
    case 'datetime':
      return 'Date and time picker';
    case 'time':
      return 'Time picker';
    case 'file':
      return 'File upload field';
    case 'image':
      return 'Image upload field';
    case 'table':
      return 'Table with columns from another form';
    case 'range':
      return 'Range slider input';
    case 'color':
      return 'Color picker input';
    case 'link':
      return 'Clickable link field';
    case 'hidden':
      return 'Hidden input field';
    case 'readonly':
      return 'Read-only display';
    case 'divider':
      return 'Visual separator';
    case 'html':
      return 'Custom HTML content';
    default:
      return 'Input field';
  }
}
</script>

<style>
.field-type-selector {
  @apply bg-white border border-gray-200 rounded-lg p-4 shadow-lg;
}

.selector-header {
  @apply flex justify-between items-center border-b border-gray-200 pb-2;
}

.field-type-button {
  @apply bg-gray-50 hover:bg-gray-100 text-left text-sm;
}

.field-type-button:hover {
  @apply border-blue-500;
}

.field-type-icon {
  @apply text-gray-500 w-5 text-center;
}
</style>
