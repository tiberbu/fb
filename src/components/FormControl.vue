<template>
  <div
    class="form-control"
    :class="getFieldClasses()"
    :style="getFieldStyles()"
  >
    <!-- General label for all controls except table (table has its own label) -->
    <div 
      v-if="control.label && control.type !== 'table'" 
      class="field-label mb-1"
    >
      {{ control.label }}
      <span 
        v-if="isRequired" 
        class="text-red-500 ml-1"
      >*</span>
    </div>
    
    <div class="field-input">
      <!-- Text Input -->
      <input 
        v-if="control.type === 'text'"
        type="text"
        :placeholder="control.placeholder || 'Text input'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        @input="handleInputChange"
        :class="inputClasses"
      >
      
      <!-- Email Input -->
      <input 
        v-else-if="control.type === 'email'"
        type="email"
        :placeholder="control.placeholder || 'Enter email'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        :class="inputClasses"
        @input="handleInputChange"
      >
      
      <!-- Phone Input -->
      <input 
        v-else-if="control.type === 'phone'"
        type="tel"
        :placeholder="control.placeholder || 'Enter phone number'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        :class="inputClasses"
        @input="handleInputChange"
      >
      
      <!-- URL Input -->
      <input 
        v-else-if="control.type === 'url'"
        type="url"
        :placeholder="control.placeholder || 'Enter URL'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        :class="inputClasses"
        @input="handleInputChange"
      >
      
      <!-- Password Input -->
      <input 
        v-else-if="control.type === 'password'"
        type="password"
        :placeholder="control.placeholder || 'Enter password'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        @input="handleInputChange"
        :class="inputClasses"
        
      >
      
      <!-- Textarea -->
      <textarea
        v-else-if="control.type === 'textarea'"
        :placeholder="control.placeholder || 'Enter text'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        :rows="control.rows || 4"
        @input="handleTextareaChange"
        :class="inputClasses"
        
      />
      
      <!-- Number Input -->
      <input
        v-else-if="control.type === 'number'"
        type="number"
        :placeholder="control.placeholder || '0'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        :min="control.min"
        :max="control.max"
        :step="control.step || 'any'"
        @input="handleInputChange"
        :class="inputClasses"
        
      >
      
      <!-- Select -->
      <select
        v-else-if="control.type === 'select'"
        :value="modelValue"
        :disabled="isReadOnly"
        :required="isRequired"
        @change="handleSelectChange"
        :class="inputClasses"
        
      >
        <option value="">{{ control.placeholder || 'Select an option' }}</option>
        <option
          v-for="(option, i) in control.options"
          :key="i"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- Radio -->
      <div v-else-if="control.type === 'radio'" class="space-y-2">
        <div 
          v-for="(option, i) in control.options" 
          :key="i"
          class="flex items-center"
        >
          <input 
            type="radio" 
            :name="control.name"
            :value="option.value"
            :checked="modelValue === option.value"
            :disabled="isReadOnly"
            :required="isRequired && i === 0"
            @change="updateValue(option.value)"
            class="mr-2 text-blue-600 focus:ring-blue-500"
          >
          <label class="text-sm text-gray-700">{{ option.label }}</label>
        </div>
        <div v-if="!control.options?.length" class="flex items-center">
          <input type="radio" disabled class="mr-2">
          <span class="text-sm text-gray-500">No options available</span>
        </div>
      </div>
      
      <!-- Checkbox -->
      <div v-else-if="control.type === 'checkbox' || control.type === 'check'" class="flex items-center">
        <input 
          type="checkbox" 
          :checked="modelValue"
          :disabled="isReadOnly"
          :required="isRequired"
          @change="handleCheckboxChange"
          class="mr-2 text-blue-600 focus:ring-blue-500"
        >
        <label class="text-sm text-gray-700">
          {{ control.placeholder || control.label || 'Checkbox option' }}
        </label>
      </div>
      
      <!-- Date -->
      <input
        v-else-if="control.type === 'date'"
        type="date"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        :min="control.min"
        :max="control.max"
        @input="handleInputChange"
        :class="inputClasses"
        
      >
      
      <!-- DateTime -->
      <input
        v-else-if="control.type === 'datetime'"
        type="datetime-local"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        @input="handleInputChange"
        :class="inputClasses"
        
      >
      
      <!-- Time -->
      <input
        v-else-if="control.type === 'time'"
        type="time"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        @input="handleInputChange"
        :class="inputClasses"
        
      >
      
      <!-- File -->
      <div v-else-if="control.type === 'file'" class="w-full">
        <input 
          type="file" 
          :disabled="isReadOnly"
          :required="isRequired"
          :accept="control.accept"
          :multiple="control.multiple"
          @change="handleFileChange"
          :class="inputClasses"
          
        >
        <div v-if="modelValue" class="text-xs text-gray-600 mt-1">
          Selected: {{ modelValue }}
        </div>
      </div>
      
      <!-- Image -->
      <div v-else-if="control.type === 'image'" class="w-full">
        <input 
          type="file" 
          accept="image/*"
          :disabled="isReadOnly"
          :required="isRequired"
          @change="handleFileChange"
          :class="inputClasses"
          
        >
        <div class="text-xs text-gray-500 mt-1">Image upload</div>
        <div v-if="modelValue" class="text-xs text-gray-600 mt-1">
          Selected: {{ modelValue }}
        </div>
      </div>
      
      <!-- Range/Slider -->
      <div v-else-if="control.type === 'range'" class="w-full">
        <input
          type="range"
          :min="control.min || 0"
          :max="control.max || 100"
          :step="control.step || 1"
          :value="modelValue"
          :disabled="isReadOnly"
          @input="handleInputChange"
          class="w-full"
        >
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>{{ control.min || 0 }}</span>
          <span class="font-medium">{{ modelValue || (control.min || 0) }}</span>
          <span>{{ control.max || 100 }}</span>
        </div>
      </div>
      
      <!-- Color Picker -->
      <div v-else-if="control.type === 'color'" class="flex items-center space-x-2">
        <input
          type="color"
          :value="modelValue || '#000000'"
          :disabled="isReadOnly"
          @input="handleInputChange"
          class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
        >
        <input
          type="text"
          :placeholder="control.placeholder || '#000000'"
          :value="modelValue"
          :readonly="isReadOnly"
          :required="isRequired"
          @input="handleInputChange"
          :class="inputClasses"
          
        >
      </div>
      
      <!-- Hidden Field -->
      <div v-else-if="control.type === 'hidden'" class="hidden">
        <input 
          type="hidden" 
          :value="modelValue"
          :name="control.name"
        >
      </div>
      
      <!-- Read Only -->
      <div v-else-if="control.type === 'readonly'" class="w-full border border-gray-300 rounded px-2 py-1.5 bg-gray-100 text-sm text-gray-700">
        {{ modelValue || control.placeholder || 'Read-only content' }}
      </div>
      
      <!-- Divider -->
      <div v-else-if="control.type === 'divider'" class="w-full py-2">
        <hr class="border-gray-300">
        <div v-if="control.label" class="text-xs text-gray-500 text-center mt-2">
          {{ control.label }}
        </div>
      </div>
      
      <!-- HTML Content -->
      <div v-else-if="control.type === 'html'" class="w-full">
        <div 
          v-if="control.content"
          v-html="control.content"
          class="prose prose-sm max-w-none"
        />
        <div v-else class="border border-gray-300 rounded px-2 py-1.5 bg-yellow-50 text-sm text-gray-600">
          <i class="fas fa-code text-yellow-600 mr-1"></i>
          HTML Content Block
        </div>
      </div>
      
      <!-- Link (legacy support) -->
      <input
        v-else-if="control.type === 'link'"
        type="url"
        :placeholder="control.placeholder || 'https://example.com'"
        :value="modelValue"
        :readonly="isReadOnly"
        :required="isRequired"
        @input="handleInputChange"
        :class="inputClasses"
        
      >
      
      <!-- Table Control -->
      <div v-else-if="control.type === 'table'" class="w-full">
        <TableControl
          :key="`table-${control.id}-${control.tableColumns?.length || 0}-${control.linkedFormId || 'no-form'}`"
          :df="{
            fieldtype: 'Table',
            label: control.label,
            fieldname: control.name,
            reqd: control.required,
            placeholder: control.placeholder,
            helpText: control.helpText,
            linkedFormId: control.linkedFormId,
            linkedFormName: control.linkedFormName,
            tableColumns: control.tableColumns,
            maxRows: control.maxRows,
            minRows: control.minRows,
            allowAdd: control.allowAdd,
            allowDelete: control.allowDelete,
            allowEdit: control.allowEdit,
            tableData: control.tableData
          }"
          :value="modelValue"
          :readonly="isReadOnly"
          @update:model-value="$emit('update:modelValue', $event)"
          @update:table-data="handleTableDataUpdate"
        />
      </div>
      
      <!-- Default for unknown types -->
      <div v-else class="text-gray-500 text-sm p-3 border border-dashed border-gray-300 rounded">
        <i class="fas fa-question-circle mr-1"></i>
        Unsupported field type: {{ control.type }}
      </div>
    </div>
    
    <!-- Help text -->
    <div v-if="control.helpText" class="text-xs text-gray-500 mt-1">
      {{ control.helpText }}
    </div>
    
    <!-- Validation error -->
    <div v-if="error" class="text-xs text-red-500 mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Control } from '../types';
import { computed } from 'vue';
import TableControl from './controls/TableControl.vue';

const props = defineProps<{
  control: Control;
  modelValue?: any;
  isRequired?: boolean;
  isReadOnly?: boolean;
  error?: string;
  isPreview?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: any];
  'update:control': [control: Control]; // Add this to update the control configuration
}>();

// Computed property for input element classes
const inputClasses = computed(() => {
  const baseClasses = 'w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const readOnlyClasses = props.isReadOnly ? 'bg-gray-50' : '';
  return `${baseClasses} ${readOnlyClasses}`.trim();
});

// Update value handler
function updateValue(value: any) {
  emit('update:modelValue', value);
}

// Handle table data updates to persist in control configuration
function handleTableDataUpdate(tableData: any[]) {
  const updatedControl = { ...props.control };
  updatedControl.tableData = tableData;
  emit('update:control', updatedControl);
}

// File change handler
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    updateValue(file.name);
  } else {
    updateValue('');
  }
}

// Handle input events with proper typing
function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  updateValue(target.value);
}

// Handle textarea input events
function handleTextareaChange(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  updateValue(target.value);
}

// Handle select change events
function handleSelectChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  updateValue(target.value);
}

// Handle checkbox change events
function handleCheckboxChange(event: Event) {
  const target = event.target as HTMLInputElement;
  updateValue(target.checked);
}

// Get CSS classes for the field
function getFieldClasses() {
  const classes = ['form-control'];
  
  // Add preview mode class
  if (props.isPreview) {
    classes.push('form-control-preview');
  }
  
  // Add custom CSS classes if specified
  if (props.control.cssClasses) {
    classes.push(...props.control.cssClasses.split(' ').filter(cls => cls.trim()));
  }
  
  // Add error state
  if (props.error) {
    classes.push('has-error');
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
</script>

<style scoped>
.form-control {
  margin-bottom: 0.5rem;
}

.field-label {
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  color: #374151;
  margin-bottom: 0.25rem;
}

.has-error .field-input input,
.has-error .field-input select,
.has-error .field-input textarea {
  border-color: rgb(239 68 68);
}

.has-error .field-input input:focus,
.has-error .field-input select:focus,
.has-error .field-input textarea:focus {
  border-color: rgb(239 68 68);
  outline: 2px solid rgb(239 68 68);
  outline-offset: 2px;
}

/* Preview mode styling - remove borders from form control containers */
.form-control-preview {
  border: none !important;
  padding: 0 !important;
  background: transparent !important;
}

.form-control-preview:focus {
  box-shadow: none !important;
  outline: none !important;
}
</style>
