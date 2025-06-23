<template>
  <div class="formulas-panel">
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <span>Formulas</span>
        <button 
          @click="toggleFormulas" 
          class="ml-2 text-xs text-blue-600 hover:text-blue-800"
          type="button"
        >
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </h4>
      
      <div v-if="expanded">
        <div 
          v-for="(formula, index) in localFormulas" 
          :key="index" 
          class="formula-item bg-gray-50 border border-gray-200 rounded mb-3 p-3"
        >
          <div class="flex justify-between mb-2">
            <div class="flex items-center">
              <span class="text-xs font-medium text-gray-700">Formula {{ index + 1 }}</span>
              <div class="ml-2">
                <span 
                  class="text-xs py-1 px-2 rounded-full" 
                  :class="getTypeClass(formula.type)"
                >
                  {{ formula.type.charAt(0).toUpperCase() + formula.type.slice(1) }}
                </span>
              </div>
            </div>
            <div class="flex items-center">
              <button 
                @click="removeFormula(index)"
                class="text-red-500 hover:text-red-700 text-sm"
                title="Remove formula"
                type="button"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="mb-2">
            <select 
              v-model="formula.type"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="calculation">Calculation (value)</option>
              <option value="visibility">Visibility</option>
              <option value="readonly">Readonly</option>
              <option value="required">Required</option>
            </select>
          </div>
          
          <div class="mb-2">
            <textarea 
              v-model="formula.expression"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
              rows="3"
              placeholder="Enter formula expression. Use field('fieldname') to reference other fields."
            ></textarea>
          </div>
          
          <div class="formula-help text-xs text-gray-500 mb-2">
            <div v-if="formula.type === 'calculation'">
              <p>Return the calculated value for this field.</p>
              <p class="italic">Example: field('price') * field('quantity')</p>
            </div>
            <div v-else-if="formula.type === 'visibility'">
              <p>Return true to show or false to hide.</p>
              <p class="italic">Example: field('show_details') === true</p>
            </div>
            <div v-else-if="formula.type === 'readonly'">
              <p>Return true to make readonly or false for editable.</p>
              <p class="italic">Example: field('locked') === true</p>
            </div>
            <div v-else-if="formula.type === 'required'">
              <p>Return true to make required or false for optional.</p>
              <p class="italic">Example: field('has_details') === true</p>
            </div>
          </div>
          
          <div class="flex items-center">
            <label class="inline-flex items-center">
              <input 
                type="checkbox" 
                v-model="formula.enabled" 
                class="mr-1"
              >
              <span class="text-xs text-gray-600">Enabled</span>
            </label>
          </div>
          
          <div v-if="availableFields?.length" class="mt-3 pt-2 border-t border-gray-200">
            <div class="text-xs font-medium text-gray-600 mb-1">Available Fields</div>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="field in availableFields"
                :key="field.name"
                @click="insertFieldReference(index, field.name)"
                class="text-xs px-2 py-1 bg-gray-100 text-blue-600 rounded hover:bg-gray-200"
                type="button"
              >
                {{ field.label || field.name }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center">
          <button
            @click="addFormula"
            class="text-sm text-blue-600 flex items-center"
            type="button"
          >
            <i class="fas fa-plus mr-1"></i>
            Add Formula
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Formula } from '../../types';

const props = defineProps<{
  formulas?: Formula[];
  availableFields?: any[];
}>();

const emit = defineEmits<{
  (e: 'update', formulas: Formula[]): void;
}>();

// Local copy of formulas that we'll edit
const localFormulas = ref<Formula[]>([]);
const expanded = ref(false);

// Initialize local formulas from props
watch(() => props.formulas, (newValue) => {
  if (newValue) {
    localFormulas.value = JSON.parse(JSON.stringify(newValue));
  } else {
    localFormulas.value = [];
  }
}, { immediate: true, deep: true });

// Watch for changes in local formulas and emit updates
watch(localFormulas, (newValue) => {
  emit('update', JSON.parse(JSON.stringify(newValue)));
}, { deep: true });

// Toggle the expanded state
function toggleFormulas() {
  expanded.value = !expanded.value;
}

// Add a new formula
function addFormula() {
  localFormulas.value.push({
    type: 'calculation',
    expression: '',
    enabled: true
  });
}

// Remove a formula
function removeFormula(index: number) {
  localFormulas.value.splice(index, 1);
}

// Insert a field reference into the formula
function insertFieldReference(formulaIndex: number, fieldName: string) {
  const formula = localFormulas.value[formulaIndex];
  if (!formula) return;
  
  const insertion = `field('${fieldName}')`;
  const textarea = document.activeElement;
  
  if (textarea && textarea.tagName === 'TEXTAREA') {
    // If a textarea is focused, insert at cursor position
    const start = (textarea as HTMLTextAreaElement).selectionStart || 0;
    const end = (textarea as HTMLTextAreaElement).selectionEnd || 0;
    formula.expression = formula.expression.substring(0, start) + insertion + formula.expression.substring(end);
  } else {
    // Otherwise append to the end
    formula.expression += formula.expression ? ' ' + insertion : insertion;
  }
}

// Get CSS class based on formula type
function getTypeClass(type: string): string {
  switch (type) {
    case 'calculation':
      return 'bg-purple-100 text-purple-800';
    case 'visibility':
      return 'bg-blue-100 text-blue-800';
    case 'readonly':
      return 'bg-yellow-100 text-yellow-800';
    case 'required':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script>

<style scoped>
.formula-item {
  position: relative;
}
</style>
