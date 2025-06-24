<template>
  <div class="formula-preview">
    <div class="container mx-auto py-8 px-4">
      <div class="header mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Formula Preview Mode</h1>
        <p class="text-gray-600">Test your form's calculation and visibility formulas</p>
      </div>
      
      <div class="preview-container bg-white shadow-md rounded-lg overflow-hidden">
        <!-- Form Header -->
        <div class="form-header bg-gray-50 border-b px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-700">{{ formData.metadata?.formName || 'Untitled Form' }}</h2>
          <p class="text-sm text-gray-500">{{ formData.metadata?.formDescription || '' }}</p>
        </div>
        
        <!-- Form Body -->
        <div class="form-body p-6">
          <!-- No Form Data Message -->
          <div v-if="!formData.tabs || formData.tabs.length === 0" class="text-center py-10 text-gray-500">
            No form data available. Please go back to the Form Builder and save your form first.
          </div>
          
          <!-- Form Content -->
          <template v-else>
            <!-- Tabs -->
            <div v-if="formData.tabs.length > 1" class="tabs mb-6">
              <div class="tab-list flex border-b">
                <div
                  v-for="(tab, index) in visibleTabs"
                  :key="tab.id"
                  class="tab-item px-4 py-2 cursor-pointer"
                  :class="{ 'border-b-2 border-blue-500 text-blue-600 font-medium': activeTabIndex === index,
                            'text-gray-500 hover:text-gray-700': activeTabIndex !== index }"
                  @click="activeTabIndex = index"
                >
                  {{ tab.label || `Tab ${index + 1}` }}
                </div>
              </div>
            </div>
            
            <!-- Active Tab Content -->
            <div v-if="activeTab" class="tab-content">
              <!-- Sections -->
              <div v-for="section in visibleSections" :key="section.id" class="section mb-8">
                <div v-if="(!section.hideTitle && section.title) || (!section.hideSubtitle && section.subtitle)" class="section-header mb-4 pb-2 border-b">
                  <h3 v-if="!section.hideTitle && section.title" class="text-lg font-medium text-gray-700">{{ section.title }}</h3>
                  <p v-if="!section.hideSubtitle && section.subtitle" class="text-sm text-gray-600 mt-1">{{ section.subtitle }}</p>
                </div>
                
                <!-- Fields in this section -->
                <div class="section-body">
                  <div v-for="field in getVisibleFieldsInSection(section)" :key="field.id" class="field-container mb-4">
                    <div class="field-label mb-1">
                      <label class="block text-sm font-medium text-gray-700">
                        {{ field.label }}
                        <span v-if="field.required" class="text-red-500">*</span>
                      </label>
                    </div>
                    
                    <!-- Field Input based on type -->
                    <div class="field-input">
                      <!-- Text Input -->
                      <input
                        v-if="field.type === 'text'"
                        v-model="formValues[field.name]"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        :placeholder="field.placeholder || ''"
                        :disabled="isCalculatedField(field)"
                        @input="handleFieldChange"
                      >
                      
                      <!-- Textarea -->
                      <textarea
                        v-else-if="field.type === 'textarea'"
                        v-model="formValues[field.name]"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        :placeholder="field.placeholder || ''"
                      ></textarea>
                      
                      <!-- Number Input -->
                      <input
                        v-else-if="field.type === 'number'"
                        v-model.number="formValues[field.name]"
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        :placeholder="field.placeholder || ''"
                        :min="field.min"
                        :max="field.max"
                        :disabled="isCalculatedField(field)"
                        @input="handleFieldChange"
                      >
                      
                      <!-- Select Dropdown -->
                      <select
                        v-else-if="field.type === 'select'"
                        v-model="formValues[field.name]"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        @change="handleFieldChange"
                      >
                        <option value="" disabled selected>Select an option</option>
                        <option
                          v-for="option in field.options"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                      
                      <!-- Checkbox -->
                      <div v-else-if="field.type === 'check'" class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="formValues[field.name]"
                          class="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          @change="handleFieldChange"
                        >
                        <span class="ml-2 text-sm text-gray-600">{{ field.description || '' }}</span>
                      </div>
                      
                      <!-- Date Input -->
                      <input
                        v-else-if="field.type === 'date'"
                        v-model="formValues[field.name]"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        @input="handleFieldChange"
                      >
                      
                      <!-- Default Fallback -->
                      <input
                        v-else
                        v-model="formValues[field.name]"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        :placeholder="field.placeholder || ''"
                        @input="handleFieldChange"
                      >
                    </div>
                    
                    <!-- Field Description -->
                    <div v-if="field.description" class="field-description mt-1">
                      <p class="text-xs text-gray-500">{{ field.description }}</p>
                    </div>
                    
                    <!-- Formula Info -->
                    <div v-if="field.formula && showFormulaInfo" class="formula-info mt-1 text-xs bg-blue-50 text-blue-700 p-2 rounded">
                      <span class="font-medium">{{ field.formulaType === 'calculation' ? 'Calculation' : 'Visibility' }} formula: </span>
                      <code>{{ field.formula }}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Formula Debug Tools -->
        <div class="formula-debug-tools bg-gray-50 border-t px-6 py-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium text-gray-700">Formula Debug Tools</h3>
            <div class="controls flex space-x-3">
              <button
                @click="showFormulaInfo = !showFormulaInfo"
                class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              >
                {{ showFormulaInfo ? 'Hide Formulas' : 'Show Formulas' }}
              </button>
              <button
                @click="refreshCalculations"
                class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Recalculate All
              </button>
            </div>
          </div>
          
          <div class="form-values">
            <div class="mb-2">
              <label class="block text-sm font-medium text-gray-700">
                Current Field Values:
              </label>
              <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">{{ JSON.stringify(formValues, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions mt-6 flex justify-end">
        <button
          @click="goBackToBuilder"
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
        >
          Back to Form Builder
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { evaluateFormula, updateCalculatedFields } from '../utils/formula-evaluator';
import { Control } from '../types';

const router = useRouter();
const formData = reactive<any>({});
const formValues = reactive<Record<string, any>>({});
const activeTabIndex = ref(0);
const showFormulaInfo = ref(false);

// Load form data from localStorage on mount
onMounted(() => {
  try {
    const savedForm = localStorage.getItem('previewFormStructure');
    if (savedForm) {
      Object.assign(formData, JSON.parse(savedForm));
      initializeFormValues();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error loading form data:', e);
  }
});

// Get the active tab
const activeTab = computed(() => {
  if (!formData.tabs || formData.tabs.length === 0) {
    return null;
  }
  return formData.tabs[activeTabIndex.value];
});

// Filter tabs based on visibility formulas
const visibleTabs = computed(() => {
  if (!formData.tabs) return [];
  
  return formData.tabs.filter((tab: any) => {
    // Check if tab has a visibility formula
    if (tab.formula && tab.formulaType === 'visibility') {
      try {
        return evaluateFormula(tab.formula, formValues, 'visibility');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Error evaluating visibility for tab ${tab.label}:`, e);
        return true; // Default to visible on error
      }
    }
    return true; // No formula, so it's visible
  });
});

// Filter sections based on visibility formulas
const visibleSections = computed(() => {
  if (!activeTab.value || !activeTab.value.sections) return [];
  
  return activeTab.value.sections.filter((section: any) => {
    // Check if section has a visibility formula
    if (section.formula && section.formulaType === 'visibility') {
      try {
        return evaluateFormula(section.formula, formValues, 'visibility');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Error evaluating visibility for section ${section.title}:`, e);
        return true; // Default to visible on error
      }
    }
    return true; // No formula, so it's visible
  });
});

// Initialize form values from default values and apply formulas
function initializeFormValues() {
  const allFields = getAllFields();
  
  // Initialize with default values
  allFields.forEach(field => {
    if (field.defaultValue !== undefined) {
      formValues[field.name] = field.defaultValue;
    } else {
      // Set empty defaults based on field type
      switch (field.type) {
        case 'number':
          formValues[field.name] = null;
          break;
        case 'check':
          formValues[field.name] = false;
          break;
        case 'select':
          formValues[field.name] = '';
          break;
        default:
          formValues[field.name] = '';
      }
    }
  });
  
  // Apply calculations
  refreshCalculations();
}

// Get all fields from all tabs, sections
function getAllFields(): Control[] {
  const allFields: Control[] = [];
  
  if (formData.tabs) {
    formData.tabs.forEach((tab: any) => {
      if (tab.sections) {
        tab.sections.forEach((section: any) => {
          // Handle both row-based and column-based layouts
          if (section.rows) {
            section.rows.forEach((row: any) => {
              if (row.columns) {
                row.columns.forEach((column: any) => {
                  if (column.fields) {
                    allFields.push(...column.fields);
                  }
                });
              }
            });
          } else if (section.columns) {
            // For backward compatibility
            section.columns.forEach((column: any) => {
              if (column.fields) {
                allFields.push(...column.fields);
              }
            });
          }
        });
      }
    });
  }
  
  return allFields;
}

// Get visible fields in a section
function getVisibleFieldsInSection(section: any): Control[] {
  let fields: Control[] = [];
  
  // Handle both row-based and column-based layouts
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
    // For backward compatibility
    section.columns.forEach((column: any) => {
      if (column.fields) {
        fields.push(...column.fields);
      }
    });
  }
  
  // Filter by visibility formulas
  return fields.filter(field => {
    if (field.formula && field.formulaType === 'visibility') {
      try {
        return evaluateFormula(field.formula, formValues, 'visibility');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Error evaluating visibility for field ${field.name}:`, e);
        return true; // Default to visible on error
      }
    }
    return true; // No formula, so it's visible
  });
}

// Check if a field has a calculation formula
function isCalculatedField(field: Control): boolean {
  return Boolean(field.formula && field.formulaType === 'calculation');
}

// Handle field value changes
function handleFieldChange() {
  refreshCalculations();
}

// Refresh all calculations and visibility rules
function refreshCalculations() {
  const allFields = getAllFields();
  
  // Update calculated fields
  const updatedValues = updateCalculatedFields(allFields, formValues);
  Object.assign(formValues, updatedValues);
  
  // Visibility is handled by the computed properties in the template
}

// Navigate back to the form builder
function goBackToBuilder() {
  router.push('/');
}

// Watch for changes that might affect visibility
watch(formValues, () => {
  // Just trigger a reactivity update that will refresh computed properties
// Fix: Set to proper index or remove this line if not needed
// activeTabIndex.value = activeTabIndex.value;
}, { deep: true });
</script>

<style scoped>
.formula-preview {
  min-height: 100vh;
  background-color: #f9fafb;
}

.field-container.calculated {
  background-color: rgba(243, 244, 246, 0.7);
}

.field-container.hidden {
  display: none;
}
</style>
