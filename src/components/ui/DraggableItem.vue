<template>
  <div
    class="field"
    :class="getFieldClasses()"
    :style="getFieldStyles()"
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
      >
      
      <!-- Email Input -->
      <input 
        v-else-if="control.type === 'email'"
        type="email"
        :placeholder="control.placeholder || 'Enter email'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- Phone Input -->
      <input 
        v-else-if="control.type === 'phone'"
        type="tel"
        :placeholder="control.placeholder || 'Enter phone number'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- URL Input -->
      <input 
        v-else-if="control.type === 'url'"
        type="url"
        :placeholder="control.placeholder || 'Enter URL'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- Password Input -->
      <input 
        v-else-if="control.type === 'password'"
        type="password"
        :placeholder="control.placeholder || 'Enter password'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- Textarea -->
      <textarea
        v-else-if="control.type === 'textarea'"
        :placeholder="control.placeholder || 'Text area'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      />
      
      <!-- Number Input -->
      <input
        v-else-if="control.type === 'number'"
        type="number"
        :placeholder="control.placeholder || '0'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
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
        <option v-if="!control.options?.length">
          Select an option
        </option>
      </select>
      
      <!-- Radio -->
      <div v-else-if="control.type === 'radio'" class="space-y-1">
        <div 
          v-for="(option, i) in control.options" 
          :key="i"
          class="flex items-center"
        >
          <input 
            type="radio" 
            :name="control.name"
            disabled 
            class="mr-2"
          >
          <span class="text-sm text-gray-600">{{ option.label }}</span>
        </div>
        <div v-if="!control.options?.length" class="flex items-center">
          <input type="radio" disabled class="mr-2">
          <span class="text-sm text-gray-600">Radio option</span>
        </div>
      </div>
      
      <!-- Checkbox -->
      <div v-else-if="control.type === 'checkbox' || control.type === 'check'" class="flex items-center">
        <input 
          type="checkbox" 
          disabled 
          class="mr-2"
        >
        <span class="text-sm text-gray-600">{{ control.placeholder || 'Checkbox option' }}</span>
      </div>
      
      <!-- Date -->
      <input
        v-else-if="control.type === 'date'"
        type="date"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- DateTime -->
      <input
        v-else-if="control.type === 'datetime'"
        type="datetime-local"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- Time -->
      <input
        v-else-if="control.type === 'time'"
        type="time"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- File -->
      <div v-else-if="control.type === 'file'" class="w-full">
        <input 
          type="file" 
          disabled 
          class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50"
        >
      </div>
      
      <!-- Image -->
      <div v-else-if="control.type === 'image'" class="w-full">
        <input 
          type="file" 
          accept="image/*"
          disabled 
          class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50"
        >
        <div class="text-xs text-gray-500 mt-1">Image upload</div>
      </div>
      
      <!-- Range/Slider -->
      <div v-else-if="control.type === 'range'" class="w-full">
        <input
          type="range"
          :min="control.min || 0"
          :max="control.max || 100"
          disabled
          class="w-full"
        >
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>{{ control.min || 0 }}</span>
          <span>{{ control.max || 100 }}</span>
        </div>
      </div>
      
      <!-- Color Picker -->
      <div v-else-if="control.type === 'color'" class="flex items-center space-x-2">
        <input
          type="color"
          disabled
          class="w-8 h-8 border border-gray-300 rounded"
        >
        <input
          type="text"
          placeholder="#000000"
          disabled
          class="flex-1 border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
        >
      </div>
      
      <!-- Hidden Field -->
      <div v-else-if="control.type === 'hidden'" class="text-gray-500 text-sm p-1 italic">
        Hidden field (not visible to users)
      </div>
      
      <!-- Read Only -->
      <div v-else-if="control.type === 'readonly'" class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-100 text-sm text-gray-600">
        Read-only content
      </div>
      
      <!-- Divider -->
      <div v-else-if="control.type === 'divider'" class="w-full">
        <hr class="border-gray-300">
        <div class="text-xs text-gray-500 text-center mt-1">Section divider</div>
      </div>
      
      <!-- HTML Content -->
      <div v-else-if="control.type === 'html'" class="w-full border border-gray-300 rounded px-2 py-1 bg-yellow-50 text-sm">
        <i class="fas fa-code text-yellow-600 mr-1"></i>
        HTML Content Block
      </div>
      
      <!-- Link (legacy support) -->
      <input
        v-else-if="control.type === 'link'"
        type="url"
        :placeholder="control.placeholder || 'https://example.com'"
        disabled
        class="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50 text-sm"
      >
      
      <!-- Default for unknown types -->
      <div v-else class="text-gray-500 text-sm p-1 border border-dashed border-gray-300 rounded">
        <i class="fas fa-question-circle mr-1"></i>
        {{ control.type }} field
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Control } from '../../types';

const props = defineProps({
  control: {
    type: Object as () => Control,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
});

// Get CSS classes for the field
function getFieldClasses() {
  const classes = ['field'];
  
  // Add selected state
  if (props.selected) {
    classes.push('selected');
  }
  
  // Add custom CSS classes if specified
  if (props.control.cssClasses) {
    classes.push(...props.control.cssClasses.split(' ').filter(cls => cls.trim()));
  }
  
  return classes;
}

// Get inline styles for the field
function getFieldStyles() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles: any = {};
  
  // Apply padding styles
  if (props.control.padding) {
    if (props.control.padding.top) styles.paddingTop = props.control.padding.top;
    if (props.control.padding.right) styles.paddingRight = props.control.padding.right;
    if (props.control.padding.bottom) styles.paddingBottom = props.control.padding.bottom;
    if (props.control.padding.left) styles.paddingLeft = props.control.padding.left;
  }
  
  // Apply margin styles
  if (props.control.margin) {
    if (props.control.margin.top) styles.marginTop = props.control.margin.top;
    if (props.control.margin.right) styles.marginRight = props.control.margin.right;
    if (props.control.margin.bottom) styles.marginBottom = props.control.margin.bottom;
    if (props.control.margin.left) styles.marginLeft = props.control.margin.left;
  }
  
  return styles;
}

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