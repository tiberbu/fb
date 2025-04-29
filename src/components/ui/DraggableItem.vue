<template>
  <div
    class="field"
    :class="{ 'selected': selected }"
    @click.stop="$emit('edit', control)"
  >
    <div class="field-header">
      <div class="field-label">
        {{ control.label }}
        <span v-if="control.required" class="text-red-500">*</span>
      </div>
      <div class="field-actions">
        <button 
          class="text-gray-500 hover:text-gray-700 p-1 rounded"
          @click.stop="$emit('delete', control.id)"
        >
          <i class="fas fa-trash text-xs" />
        </button>
      </div>
    </div>
    
    <div class="field-preview">
      <!-- Text Input -->
      <input 
        v-if="control.type === 'text'"
        type="text"
        :placeholder="control.placeholder || 'Text input'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      />
      
      <!-- Textarea -->
      <textarea
        v-else-if="control.type === 'textarea'"
        :placeholder="control.placeholder || 'Text area'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      />
      
      <!-- Select -->
      <select
        v-else-if="control.type === 'select'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
        <option
          v-for="(option, i) in control.options"
          :key="i"
          :value="option.value"
        >
          {{ option.label }}
        </option>
        <option v-if="!control.options?.length">Select an option</option>
      </select>
      
      <!-- Checkbox -->
      <div v-else-if="control.type === 'check'" class="flex items-center">
        <input type="checkbox" disabled class="mr-2" />
        <span class="text-sm text-gray-600">{{ control.placeholder || 'Checkbox option' }}</span>
      </div>
      
      <!-- Date -->
      <input
        v-else-if="control.type === 'date'"
        type="date"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      />
      
      <!-- File -->
      <div v-else-if="control.type === 'file'" class="w-full">
        <input type="file" disabled class="w-full text-sm" />
      </div>
      
      <!-- Number -->
      <input
        v-else-if="control.type === 'number'"
        type="number"
        :placeholder="control.placeholder || '0'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      />
      
      <!-- Link -->
      <input
        v-else-if="control.type === 'link'"
        type="url"
        :placeholder="control.placeholder || 'https://example.com'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      />
      
      <!-- Default for unknown types -->
      <div v-else class="text-gray-500 text-sm p-1">{{ control.type }} field</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Control } from '../../types';

defineProps({
  control: {
    type: Object as () => Control,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit', 'delete']);
</script>

<style>
.field {
  @apply border border-gray-200 bg-white rounded mb-2 p-3 hover:border-gray-400;
}

.field.selected {
  @apply border-blue-500 ring-2 ring-blue-100;
}

.field-header {
  @apply flex justify-between items-center mb-2;
}

.field-label {
  @apply font-medium text-sm text-gray-700;
}

.field-preview {
  @apply mb-1;
}
</style>