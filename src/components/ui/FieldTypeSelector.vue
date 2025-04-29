<template>
  <div class="field-type-selector">
    <div class="selector-header">
      <h3 class="text-gray-700 font-medium mb-2">Select Field Type</h3>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <i class="fas fa-times" />
      </button>
    </div>
    
    <div class="grid grid-cols-2 gap-2 mt-3">
      <button
        v-for="fieldType in fieldTypes"
        :key="fieldType.type"
        class="field-type-button flex items-center p-2 border rounded"
        @click="selectFieldType(fieldType.type)"
      >
        <div class="field-type-icon mr-2">
          <i class="fas" :class="getIconForFieldType(fieldType.type)" />
        </div>
        <div class="field-type-label">{{ fieldType.label }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ControlType } from '../../types';

const fieldTypes = [
  { type: 'text', label: 'Text' },
  { type: 'textarea', label: 'Text Area' },
  { type: 'select', label: 'Select' },
  { type: 'check', label: 'Checkbox' },
  { type: 'date', label: 'Date' },
  { type: 'file', label: 'File' },
  { type: 'number', label: 'Number' },
  { type: 'link', label: 'Link' }
];

const emit = defineEmits(['select-field-type', 'close']);

function selectFieldType(type: ControlType) {
  emit('select-field-type', type);
}

function getIconForFieldType(type: string) {
  switch (type) {
    case 'text':
      return 'fa-font';
    case 'textarea':
      return 'fa-align-left';
    case 'select':
      return 'fa-list';
    case 'check':
      return 'fa-check-square';
    case 'date':
      return 'fa-calendar';
    case 'file':
      return 'fa-file-upload';
    case 'number':
      return 'fa-hashtag';
    case 'link':
      return 'fa-link';
    default:
      return 'fa-square';
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
