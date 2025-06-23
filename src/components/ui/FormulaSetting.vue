<template>
  <div class="formula-setting">
    <div class="formula-header mb-2">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">Formula Settings</span>
        <button 
          @click="toggleFormulaSection" 
          class="text-xs text-blue-600 hover:underline"
        >
          {{ showFormula ? 'Hide Formula' : 'Add Formula' }}
        </button>
      </div>
    </div>

    <div v-if="showFormula" class="formula-content py-2">
      <div class="mb-2">
        <label class="block text-xs text-gray-600 mb-1">Formula Type</label>
        <select 
          v-model="localFormulaType" 
          class="w-full border border-gray-300 rounded px-3 py-1 text-sm"
          @change="handleChange"
        >
          <option value="calculation">Calculation</option>
          <option value="visibility">Visibility</option>
        </select>
      </div>

      <div class="mb-2">
        <label class="block text-xs text-gray-600 mb-1">Formula</label>
        <textarea 
          v-model="localFormula" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
          rows="3"
          placeholder="Enter formula expression"
          @input="handleChange"
        ></textarea>
      </div>

      <div class="field-references mb-2">
        <label class="block text-xs text-gray-600 mb-1">Available Fields</label>
        <div class="flex flex-wrap gap-1">
          <div 
            v-for="field in availableFields" 
            :key="field.id" 
            class="field-reference px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded cursor-pointer hover:bg-blue-100"
            @click="insertFieldReference(field)"
          >
            {{ field.label }}
          </div>
        </div>
      </div>

      <div class="mb-2">
        <label class="block text-xs text-gray-600 mb-1">Examples</label>
        <div v-if="localFormulaType === 'calculation'" class="text-xs text-gray-500">
          <div>field('weight') / (field('height') * field('height')) // BMI</div>
          <div>field('price') * field('quantity') // Total</div>
        </div>
        <div v-else class="text-xs text-gray-500">
          <div>field('age') > 18 // Show if age > 18</div>
          <div>field('category') === 'premium' // Show for premium</div>
        </div>
      </div>
    </div>

    <div v-else-if="modelValue" class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
      <strong>{{ localFormulaType === 'calculation' ? 'Calculation' : 'Visibility' }} Formula:</strong>
      <div class="font-mono">{{ modelValue }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { Control } from '../../types';

interface Props {
  modelValue: string;
  formulaType: 'calculation' | 'visibility'; 
  availableFields: Control[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  formulaType: 'calculation',
  availableFields: () => []
});

const emit = defineEmits(['update:modelValue', 'update:formulaType', 'change']);

const showFormula = ref(Boolean(props.modelValue));
const localFormula = ref(props.modelValue);
const localFormulaType = ref(props.formulaType);

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  localFormula.value = newVal;
  showFormula.value = Boolean(newVal);
});

watch(() => props.formulaType, (newVal) => {
  localFormulaType.value = newVal;
});

function toggleFormulaSection() {
  showFormula.value = !showFormula.value;
  if (!showFormula.value && localFormula.value) {
    // Clear the formula when hiding
    localFormula.value = '';
    emit('update:modelValue', '');
    emit('change', { formula: '', formulaType: localFormulaType.value });
  }
}

function handleChange() {
  emit('update:modelValue', localFormula.value);
  emit('update:formulaType', localFormulaType.value);
  emit('change', {
    formula: localFormula.value,
    formulaType: localFormulaType.value,
    dependsOn: extractDependencies()
  });
}

function extractDependencies(): string[] {
  // Extract field names from formula like field('fieldName')
  const result = [];
  const regex = /field\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = regex.exec(localFormula.value)) !== null) {
    result.push(match[1]);
  }
  
  return result;
}

function insertFieldReference(field: Control) {
  const fieldRef = `field('${field.name}')`;
  const textarea = document.querySelector('.formula-setting textarea') as HTMLTextAreaElement;
  
  if (textarea) {
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    
    localFormula.value = 
      localFormula.value.substring(0, startPos) + 
      fieldRef + 
      localFormula.value.substring(endPos);
    
    nextTick(() => {
      textarea.focus();
      const newPos = startPos + fieldRef.length;
      textarea.setSelectionRange(newPos, newPos);
      handleChange();
    });
  } else {
    localFormula.value += fieldRef;
    handleChange();
  }
}
</script>

<style scoped>
.formula-setting {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.75rem;
  background-color: #f9fafb;
}
</style>
