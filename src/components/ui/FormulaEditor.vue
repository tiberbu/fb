<template>
  <div class="formula-editor">
    <div class="formula-editor-header">
      <div class="formula-type-selector">
        <label class="formula-label">Formula Type:</label>
        <select
          v-model="localFormulaType"
          class="formula-type-select"
          @change="emitUpdate"
        >
          <option value="calculation">Calculation</option>
          <option value="visibility">Visibility</option>
        </select>
      </div>
    </div>
    
    <div class="formula-editor-body">
      <div class="formula-expression">
        <label class="formula-label">Formula Expression:</label>
        <textarea
          v-model="localFormula"
          class="formula-input"
          placeholder="Enter your formula here"
          rows="4"
          @input="emitUpdate"
        ></textarea>
      </div>
      
      <div class="formula-fields mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Available Fields:</h4>
        <div class="available-fields">
          <div 
            v-for="field in availableFields" 
            :key="field.id"
            class="field-pill"
            @click="insertField(field)"
          >
            {{ field.label }} ({{ field.name }})
          </div>
        </div>
      </div>
      
      <div class="formula-functions mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Functions:</h4>
        <div class="available-functions">
          <div 
            v-for="fn in availableFunctions" 
            :key="fn.name"
            class="function-pill"
            @click="insertFunction(fn)"
          >
            {{ fn.name }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="localFormulaType === 'calculation'" class="formula-help mt-4">
      <h4 class="text-sm font-medium text-gray-600">Example Calculations:</h4>
      <ul class="text-xs text-gray-500 pl-4 list-disc">
        <li>BMI: field('weight') / (field('height') * field('height'))</li>
        <li>Total: field('price') * field('quantity')</li>
        <li>Percentage: field('obtained') / field('total') * 100</li>
      </ul>
    </div>
    
    <div v-else class="formula-help mt-4">
      <h4 class="text-sm font-medium text-gray-600">Example Visibility Rules:</h4>
      <ul class="text-xs text-gray-500 pl-4 list-disc">
        <li>Show if age > 18: field('age') > 18</li>
        <li>Show if option selected: field('category') === 'premium'</li>
        <li>Complex condition: field('age') >= 18 && field('agreed_terms') === true</li>
      </ul>
    </div>
    
    <div class="formula-validation mt-2">
      <div v-if="validationError" class="text-red-500 text-xs">
        {{ validationError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Control } from '../../types';
import { validateFormula } from '../../utils/formula-evaluator';

interface Props {
  formula?: string;
  formulaType?: 'calculation' | 'visibility';
  availableFields: Control[];
}

interface Function {
  name: string;
  template: string;
  description: string;
}

const props = withDefaults(defineProps<Props>(), {
  formula: '',
  formulaType: 'calculation'
});

const emit = defineEmits(['update']);

const localFormula = ref(props.formula || '');
const localFormulaType = ref(props.formulaType);
const validationError = ref('');

// Predefined functions available for formulas
const availableFunctions = ref<Function[]>([
  { 
    name: 'field()', 
    template: "field('fieldName')",
    description: 'Get value of a field' 
  },
  { 
    name: 'sum()', 
    template: "sum(field1, field2, ...)", 
    description: 'Sum multiple fields' 
  },
  { 
    name: 'avg()', 
    template: "avg(field1, field2, ...)", 
    description: 'Average of multiple fields' 
  },
  { 
    name: 'if()', 
    template: "if(condition, trueValue, falseValue)", 
    description: 'Conditional logic' 
  },
  { 
    name: 'min()', 
    template: "min(field1, field2, ...)", 
    description: 'Minimum value' 
  },
  { 
    name: 'max()', 
    template: "max(field1, field2, ...)",  
    description: 'Maximum value' 
  }
]);

watch(
  () => props.formula,
  (newVal) => {
    if (newVal !== localFormula.value) {
      localFormula.value = newVal || '';
    }
  }
);

watch(
  () => props.formulaType,
  (newVal) => {
    if (newVal !== localFormulaType.value) {
      localFormulaType.value = newVal || 'calculation';
    }
  }
);

function insertField(field: Control) {
  const fieldReference = `field('${field.name}')`;
  
  // Insert at cursor position or append to the end
  const textarea = document.querySelector('.formula-input') as HTMLTextAreaElement;
  if (textarea) {
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    
    localFormula.value = 
      localFormula.value.substring(0, startPos) +
      fieldReference +
      localFormula.value.substring(endPos);
      
    // Set cursor after inserted field
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + fieldReference.length, startPos + fieldReference.length);
    }, 0);
  } else {
    localFormula.value += fieldReference;
  }
  
  emitUpdate();
}

function insertFunction(fn: Function) {
  const fnTemplate = fn.template;
  
  // Insert at cursor position or append to the end
  const textarea = document.querySelector('.formula-input') as HTMLTextAreaElement;
  if (textarea) {
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    
    localFormula.value = 
      localFormula.value.substring(0, startPos) +
      fnTemplate +
      localFormula.value.substring(endPos);
      
    // Set cursor after inserted function
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + fnTemplate.length, startPos + fnTemplate.length);
    }, 0);
  } else {
    localFormula.value += fnTemplate;
  }
  
  emitUpdate();
}

function emitUpdate() {
  // Validate formula before emitting update
  try {
    validationError.value = validateFormula(localFormula.value, props.availableFields);
  } catch (error) {
    if (error instanceof Error) {
      validationError.value = error.message;
    } else {
      validationError.value = 'Invalid formula';
    }
  }
  
  emit('update', {
    formula: localFormula.value,
    formulaType: localFormulaType.value,
    isValid: !validationError.value,
    dependsOn: extractDependencies(localFormula.value)
  });
}

function extractDependencies(formula: string): string[] {
  // Extract all field('fieldName') references
  const fieldRegex = /field\(['"]([^'"]+)['"]\)/g;
  const dependencies = [];
  let match;
  
  while ((match = fieldRegex.exec(formula)) !== null) {
    if (match[1]) {
      dependencies.push(match[1]);
    }
  }
  
  return dependencies;
}

onMounted(() => {
  // Validate initial formula
  emitUpdate();
});
</script>

<style scoped>
.formula-editor {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.formula-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.formula-type-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
}

.formula-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  font-family: monospace;
}

.available-fields, .available-functions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.field-pill, .function-pill {
  background-color: #e0e7ff;
  color: #4f46e5;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: inline-block;
}

.field-pill:hover, .function-pill:hover {
  background-color: #c7d2fe;
}

.function-pill {
  background-color: #fef3c7;
  color: #d97706;
}

.function-pill:hover {
  background-color: #fde68a;
}
</style>
