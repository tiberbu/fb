<template>
  <div 
    v-if="isOpen" 
    class="field-selector-sidebar fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Add Field</h2>
        <button 
          @click="$emit('close')"
          class="p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <i class="fas fa-times text-gray-500" />
        </button>
      </div>
      <p class="text-sm text-gray-600 mt-1">Choose a field type to add to your form</p>
    </div>

    <!-- Search -->
    <div class="p-4 border-b border-gray-100">
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <input
          v-model="fieldSearchQuery"
          type="text"
          placeholder="Search field types..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
      </div>
    </div>

    <!-- Field Categories -->
    <div class="flex-1 overflow-y-auto">
      <!-- Basic Fields -->
      <div class="field-category">
        <div class="category-header px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Basic Fields</h3>
        </div>
        <div class="field-list p-2">
          <button
            v-for="fieldType in filteredBasicFields"
            :key="fieldType.type"
            class="field-type-item w-full flex items-center p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg text-left transition-all group"
            @click="selectFieldType(fieldType.type as ControlType)"
          >
            <div class="field-icon mr-3 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 text-sm">
              <i class="fas" :class="getIconForFieldType(fieldType.type)" />
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900 text-sm">{{ fieldType.label }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ getFieldTypeDescription(fieldType.type) }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Advanced Fields -->
      <div class="field-category">
        <div class="category-header px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Advanced Fields</h3>
        </div>
        <div class="field-list p-2">
          <button
            v-for="fieldType in filteredAdvancedFields"
            :key="fieldType.type"
            class="field-type-item w-full flex items-center p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg text-left transition-all group"
            @click="selectFieldType(fieldType.type as ControlType)"
          >
            <div class="field-icon mr-3 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 text-sm">
              <i class="fas" :class="getIconForFieldType(fieldType.type)" />
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900 text-sm">{{ fieldType.label }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ getFieldTypeDescription(fieldType.type) }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Layout & Display -->
      <div class="field-category">
        <div class="category-header px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layout & Display</h3>
        </div>
        <div class="field-list p-2">
          <button
            v-for="fieldType in filteredLayoutFields"
            :key="fieldType.type"
            class="field-type-item w-full flex items-center p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg text-left transition-all group"
            @click="selectFieldType(fieldType.type as ControlType)"
          >
            <div class="field-icon mr-3 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 text-sm">
              <i class="fas" :class="getIconForFieldType(fieldType.type)" />
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900 text-sm">{{ fieldType.label }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ getFieldTypeDescription(fieldType.type) }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="allFilteredFields.length === 0 && fieldSearchQuery" class="p-8 text-center">
      <i class="fas fa-search text-3xl text-gray-300 mb-3" />
      <p class="text-gray-500 text-sm">No field types found matching "{{ fieldSearchQuery }}"</p>
    </div>
  </div>

  <!-- Backdrop -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black bg-opacity-25 z-40"
    @click="$emit('close')"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ControlType } from '../../types';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits(['select-field-type', 'close']);

// Field search functionality
const fieldSearchQuery = ref("");

// Field categories
const basicFields = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Text Area" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "url", label: "URL" },
  { type: "password", label: "Password" },
];

const advancedFields = [
  { type: "select", label: "Select" },
  { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "datetime", label: "Date Time" },
  { type: "time", label: "Time" },
  { type: "file", label: "File Upload" },
  { type: "image", label: "Image Upload" },
  { type: "range", label: "Range/Slider" },
  { type: "color", label: "Color Picker" },
];

const layoutFields = [
  { type: "link", label: "Link" },
  { type: "hidden", label: "Hidden Field" },
  { type: "readonly", label: "Read Only" },
  { type: "divider", label: "Divider" },
  { type: "html", label: "HTML Content" },
];

// Filtered field categories based on search
const filteredBasicFields = computed(() => {
  if (!fieldSearchQuery.value) return basicFields;
  const query = fieldSearchQuery.value.toLowerCase();
  return basicFields.filter(field => 
    field.label.toLowerCase().includes(query) || 
    field.type.toLowerCase().includes(query) ||
    getFieldTypeDescription(field.type).toLowerCase().includes(query)
  );
});

const filteredAdvancedFields = computed(() => {
  if (!fieldSearchQuery.value) return advancedFields;
  const query = fieldSearchQuery.value.toLowerCase();
  return advancedFields.filter(field => 
    field.label.toLowerCase().includes(query) || 
    field.type.toLowerCase().includes(query) ||
    getFieldTypeDescription(field.type).toLowerCase().includes(query)
  );
});

const filteredLayoutFields = computed(() => {
  if (!fieldSearchQuery.value) return layoutFields;
  const query = fieldSearchQuery.value.toLowerCase();
  return layoutFields.filter(field => 
    field.label.toLowerCase().includes(query) || 
    field.type.toLowerCase().includes(query) ||
    getFieldTypeDescription(field.type).toLowerCase().includes(query)
  );
});

const allFilteredFields = computed(() => [
  ...filteredBasicFields.value,
  ...filteredAdvancedFields.value,
  ...filteredLayoutFields.value
]);

function selectFieldType(type: ControlType) {
  console.log(`FieldSelectorSidebar: Field type ${type} clicked`);
  emit('select-field-type', type);
}

// Helper function to get icon for field type
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
      return 'fa-link';
    case 'password':
      return 'fa-lock';
    case 'select':
      return 'fa-chevron-down';
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
    case 'range':
      return 'fa-sliders-h';
    case 'color':
      return 'fa-palette';
    case 'link':
      return 'fa-external-link-alt';
    case 'hidden':
      return 'fa-eye-slash';
    case 'readonly':
      return 'fa-eye';
    case 'divider':
      return 'fa-minus';
    case 'html':
      return 'fa-code';
    default:
      return 'fa-question';
  }
}

// Helper function to get field type description
function getFieldTypeDescription(type: string) {
  switch (type) {
    case 'text':
      return 'Single line text input';
    case 'textarea':
      return 'Multi-line text input';
    case 'number':
      return 'Numeric input with validation';
    case 'email':
      return 'Email address with validation';
    case 'phone':
      return 'Phone number input';
    case 'url':
      return 'Website URL input';
    case 'password':
      return 'Password input (hidden text)';
    case 'select':
      return 'Dropdown selection';
    case 'radio':
      return 'Single choice from options';
    case 'checkbox':
      return 'Multiple choice selection';
    case 'date':
      return 'Date picker';
    case 'datetime':
      return 'Date and time picker';
    case 'time':
      return 'Time picker';
    case 'file':
      return 'File upload control';
    case 'image':
      return 'Image upload control';
    case 'range':
      return 'Slider for numeric ranges';
    case 'color':
      return 'Color picker control';
    case 'link':
      return 'Clickable link element';
    case 'hidden':
      return 'Hidden field for data storage';
    case 'readonly':
      return 'Display-only field';
    case 'divider':
      return 'Visual separator line';
    case 'html':
      return 'Custom HTML content';
    default:
      return 'Form field';
  }
}
</script>

<style scoped>
.field-selector-sidebar {
  transform: translateX(0);
  transition: transform 0.3s ease-in-out;
}

.field-type-item:hover .field-icon {
  transform: scale(1.05);
}

.field-category:last-child .field-list {
  padding-bottom: 2rem;
}

/* Custom scrollbar */
.field-selector-sidebar ::-webkit-scrollbar {
  width: 6px;
}

.field-selector-sidebar ::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.field-selector-sidebar ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.field-selector-sidebar ::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
