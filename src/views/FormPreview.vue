<template>
  <div class="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-semibold">{{ formMetadata.formName || 'Form Preview' }}</h2>
        <p v-if="formMetadata.formDescription" class="text-gray-600 mt-1">
          {{ formMetadata.formDescription }}
        </p>
      </div>
      <div class="flex gap-3">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          @click="importForm"
        >
          <i class="fas fa-file-import mr-1" /> Import
        </button>
        <button
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          @click="goBackToBuilder"
        >
          <i class="fas fa-arrow-left mr-1" /> Back to Builder
        </button>
      </div>
    </div>
    
    <div v-if="!hasFormContent" class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <i class="fas fa-file-import text-4xl text-gray-400 mb-3" />
      <p class="text-gray-500">No form loaded. Please import a form JSON file.</p>
    </div>
    
    <form v-else @submit.prevent="submitForm" class="space-y-6">
      <div 
        v-for="(tab, tabIndex) in formData.tabs" 
        :key="tabIndex"
        v-show="!isTabHidden(tabIndex)"
      >
        <div class="mb-6">
          <h3 class="text-xl font-medium border-b pb-2 mb-4">{{ tab.label }}</h3>
          
          <template v-for="(section, sectionIndex) in tab.sections" :key="section.id">
            <div 
              class="mb-8"
              v-show="!isSectionHidden(section.id)"
            >
              <div class="flex items-center mb-3">
                <h4 class="font-medium text-lg">{{ section.title || 'Untitled Section' }}</h4>
              </div>
              
              <div v-for="(row, rowIndex) in section.rows" :key="row.id" class="mb-4">
                <div class="flex gap-4">
                  <div 
                    v-for="(column, colIndex) in row.columns" 
                    :key="colIndex"
                    :class="[
                      'flex-1',
                      column.fields && column.fields.length === 0 ? 'hidden' : ''
                    ]"
                  >
                    <div 
                      v-for="field in column.fields" 
                      :key="field.id" 
                      :class="getFieldClasses(field)"
                      :style="getFieldStyles(field)"
                      v-show="!isFieldHidden(field.id)"
                    >
                      <FormControl
                        :control="field"
                        :model-value="getFieldValue(field)"
                        :is-required="isFieldRequired(field)"
                        :is-read-only="isFieldReadOnly(field)"
                        :is-preview="true"
                        @update:model-value="updateFieldValue(field, $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <div class="pt-4">
        <button
          type="submit"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, watch } from 'vue';
import { useRouter } from 'vue-router';
import { evaluateFormula } from '../utils/formula-evaluator';
import type { Formula } from '../types';

// Import the unified form control component
import FormControl from '../components/FormControl.vue';

const router = useRouter();
const props = defineProps<{ 
  formData?: any;
  id?: string;
}>();

// Navigation function
function goBackToBuilder() {
  if (props.id) {
    router.push(`/builder/${props.id}`);
  } else {
    router.push('/forms');
  }
}

// Form values and state
const formValues = ref<Record<string, any>>({});
const fieldVisibility = ref<Record<string, boolean>>({});
const fieldReadOnly = ref<Record<string, boolean>>({});
const fieldRequired = ref<Record<string, boolean>>({});
const tabVisibility = ref<Record<number, boolean>>({});
const sectionVisibility = ref<Record<string, boolean>>({});

// Use passed formData if available, otherwise fallback to localStorage
const formData = ref(props.formData || { 
  metadata: {
    formName: '',
    formDescription: '',
    formId: '',
    isPublished: false,
    dateCreated: '',
    lastUpdated: ''
  }, 
  tabs: [] 
});

const formMetadata = computed(() => formData.value.metadata || {});
const hasFormContent = computed(() => formData.value?.tabs?.length > 0);
const fileInput = ref<HTMLInputElement | null>(null);

// Watch for changes in form values and re-evaluate formulas
watch(formValues, () => {
  evaluateAllFormulas();
}, { deep: true });

// Watch for formData changes
watch(() => props.formData, (newData) => {
  if (newData) {
    formData.value = newData;
    initializeFormValues();
  }
}, { immediate: true });

// Form value handling functions
function getFieldValue(field: any) {
  // Return calculated value or stored value
  return formValues.value[field.name] !== undefined 
    ? formValues.value[field.name] 
    : field.defaultValue || '';
}

function updateFieldValue(field: any, value: any) {
  // Don't update calculated fields directly
  const hasActiveCalculation = field.formulas && field.formulas.some((f: Formula) => 
    f.type === 'calculation' && f.enabled
  );
  
  if (!hasActiveCalculation) {
    formValues.value[field.name] = value;
  }
}

// Visibility helpers
function isTabHidden(tabIndex: number): boolean {
  return tabVisibility.value[tabIndex] === false;
}

function isSectionHidden(sectionId: string): boolean {
  return sectionVisibility.value[sectionId] === false;
}

function isFieldHidden(fieldId: string): boolean {
  return fieldVisibility.value[fieldId] === false;
}

function isFieldReadOnly(field: any): boolean {
  // Check if field has a readonly formula that evaluates to true
  return fieldReadOnly.value[field.id] === true || field.isReadonly === true;
}

function isFieldRequired(field: any): boolean {
  // Check both static required property and formula-based required state
  return fieldRequired.value[field.id] === true || field.required === true;
}

// Form submission
const submitForm = () => {
  // Validate required fields
  const allFields = getAllFormFields();
  const invalidFields = allFields.filter(field => {
    // Skip hidden fields
    if (isFieldHidden(field.id)) return false;
    
    // Check if field is required and empty
    const isRequired = isFieldRequired(field);
    const value = formValues.value[field.name];
    const isEmpty = value === undefined || value === null || value === '';
    
    return isRequired && isEmpty;
  });
  
  if (invalidFields.length > 0) {
    alert(`Please fill in all required fields: ${invalidFields.map(f => f.label).join(', ')}`);
    return;
  }
  
  // Form submission logic
  alert('Form submitted with values: ' + JSON.stringify(formValues.value));
};

// Import form
const importForm = () => {
  // Create a hidden file input element
  if (!fileInput.value) {
    fileInput.value = document.createElement('input');
    fileInput.value.type = 'file';
    fileInput.value.accept = 'application/json';
    
    fileInput.value.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            formData.value = JSON.parse(result);
            localStorage.setItem('savedFormStructure', result);
            initializeFormValues();
          } catch (error) {
            alert('Invalid form file format');
          }
        };
        
        reader.readAsText(file);
      }
    });
  }
  
  // Trigger the file input
  fileInput.value.click();
};

// Collect all fields from the form
function getAllFormFields(): any[] {
  const allFields: any[] = [];
  
  if (!formData.value?.tabs) return allFields;
  
  formData.value.tabs.forEach((tab: any) => {
    if (!tab.sections) return;
    
    tab.sections.forEach((section: any) => {
      if (section.rows) {
        section.rows.forEach((row: any) => {
          row.columns.forEach((column: any) => {
            if (column.fields && Array.isArray(column.fields)) {
              allFields.push(...column.fields);
            }
          });
        });
      } else if (section.columns) {
        // For backward compatibility
        section.columns.forEach((column: any) => {
          if (column.fields && Array.isArray(column.fields)) {
            allFields.push(...column.fields);
          }
        });
      }
    });
  });
  
  return allFields;
}

// Initialize form values and formula evaluation
function initializeFormValues() {
  formValues.value = {};
  fieldVisibility.value = {};
  fieldReadOnly.value = {};
  fieldRequired.value = {};
  tabVisibility.value = {};
  sectionVisibility.value = {};
  
  // Initialize values for all fields
  const allFields = getAllFormFields();
  allFields.forEach(field => {
    // Set default values
    formValues.value[field.name] = field.defaultValue || '';
    
    // Set default visibility (all visible)
    fieldVisibility.value[field.id] = true;
    
    // Set default readonly state
    fieldReadOnly.value[field.id] = field.isReadonly || false;
    
    // Set default required state
    fieldRequired.value[field.id] = field.required || false;
  });
  
  // Initialize tab and section visibility
  if (formData.value?.tabs) {
    formData.value.tabs.forEach((tab: any, index: number) => {
      tabVisibility.value[index] = true;
      
      if (tab.sections) {
        tab.sections.forEach((section: any) => {
          sectionVisibility.value[section.id] = true;
        });
      }
    });
  }
  
  // Evaluate all formulas after initialization
  evaluateAllFormulas();
}

// Evaluate all formula types for fields, tabs, and sections
function evaluateAllFormulas() {
  const allFields = getAllFormFields();
  
  // First, process fields with calculation formulas to update values
  processCalculationFormulas(allFields);
  
  // Then process visibility, readonly, and required formulas
  processOtherFormulas(allFields);
  
  // Finally, process tab and section visibility formulas
  processTabAndSectionFormulas();
}

function processCalculationFormulas(fields: any[]) {
  // Process fields with calculation formulas
  fields.forEach(field => {
    if (!field.formulas || !Array.isArray(field.formulas)) return;
    
    // Look for active calculation formula
    const calcFormula = field.formulas.find((f: any) => f.type === 'calculation' && f.enabled);
    if (calcFormula) {
      try {
        // Evaluate the calculation formula
        const result = evaluateFormula(calcFormula.expression, formValues.value, 'calculation');
        
        // Update the field value with the calculation result
        formValues.value[field.name] = result;
      } catch (error) {
        // Handle errors silently in preview mode
      }
    }
  });
}

function processOtherFormulas(fields: any[]) {
  // Process other formula types (visibility, readonly, required)
  fields.forEach(field => {
    if (!field.formulas || !Array.isArray(field.formulas)) return;
    
    // Process each non-calculation formula
    field.formulas.forEach((formula: any) => {
      if (!formula.enabled || formula.type === 'calculation') return;
      
      try {
        const result = evaluateFormula(formula.expression, formValues.value, formula.type as any);
        
        switch (formula.type) {
          case 'visibility':
            fieldVisibility.value[field.id] = Boolean(result);
            break;
          case 'readonly':
            fieldReadOnly.value[field.id] = Boolean(result);
            break;
          case 'required':
            fieldRequired.value[field.id] = Boolean(result);
            break;
        }
      } catch (error) {
        // Handle errors silently in preview mode
      }
    });
  });
}

function processTabAndSectionFormulas() {
  // Process tab visibility formulas
  if (formData.value?.tabs) {
    formData.value.tabs.forEach((tab: any, index: number) => {
      if (!tab.formulas || !Array.isArray(tab.formulas)) return;
      
      // Look for active visibility formula for the tab
      const visibilityFormula = tab.formulas.find(
        (f: any) => f.type === 'visibility' && f.enabled
      );
      
      if (visibilityFormula) {
        try {
          const isVisible = evaluateFormula(
            visibilityFormula.expression, 
            formValues.value, 
            'visibility'
          );
          tabVisibility.value[index] = Boolean(isVisible);
        } catch (error) {
          // Handle errors silently in preview mode
        }
      }
      
      // Process section visibility formulas
      if (tab.sections) {
        tab.sections.forEach((section: any) => {
          if (!section.formulas || !Array.isArray(section.formulas)) return;
          
          // Look for active visibility formula for the section
          const sectionVisibilityFormula = section.formulas.find(
            (f: any) => f.type === 'visibility' && f.enabled
          );
          
          if (sectionVisibilityFormula) {
            try {
              const isVisible = evaluateFormula(
                sectionVisibilityFormula.expression, 
                formValues.value, 
                'visibility'
              );
              sectionVisibility.value[section.id] = Boolean(isVisible);
            } catch (error) {
              // Handle errors silently in preview mode
            }
          }
        });
      }
    });
  }
}

// Get CSS classes for a field
function getFieldClasses(field: any) {
  const classes = ['mb-4'];
  
  // Add custom CSS classes if specified
  if (field.cssClasses) {
    classes.push(...field.cssClasses.split(' ').filter((cls: any) => cls.trim()));
  }
  
  return classes;
}

// Get inline styles for a field
function getFieldStyles(field: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles: any = {};
  
  // Apply padding styles
  if (field.padding) {
    if (field.padding.top) styles.paddingTop = field.padding.top;
    if (field.padding.right) styles.paddingRight = field.padding.right;
    if (field.padding.bottom) styles.paddingBottom = field.padding.bottom;
    if (field.padding.left) styles.paddingLeft = field.padding.left;
  }
  
  // Apply margin styles
  if (field.margin) {
    if (field.margin.top) styles.marginTop = field.margin.top;
    if (field.margin.right) styles.marginRight = field.margin.right;
    if (field.margin.bottom) styles.marginBottom = field.margin.bottom;
    if (field.margin.left) styles.marginLeft = field.margin.left;
  }
  
  return styles;
}

onMounted(() => {
  if (!props.formData) {
    const savedForm = localStorage.getItem('savedFormStructure');
    if (savedForm) {
      try {
        formData.value = JSON.parse(savedForm);
      } catch (error) {
        alert('Error loading saved form data');
      }
    }
  }
  
  // Initialize form values and evaluate formulas
  initializeFormValues();
});
</script>
