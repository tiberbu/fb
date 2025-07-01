<template>
  <div class="properties-panel p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-800">
        {{ isSection ? 'Section Properties' : 'Field Properties' }}
      </h3>
      <div v-if="isAutoSaving" class="flex items-center text-xs text-blue-600">
        <i class="fas fa-spinner fa-spin mr-1"></i>
        Auto-saving...
      </div>
    </div>
    
    <!-- Section Properties -->
    <template v-if="isSection && store.form.selectedField">
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Section Title</label>
        <input 
          v-model="store.form.selectedField.label"
          type="text" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Description</label>
        <textarea 
          v-model="store.form.selectedField.description" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          rows="3"
        ></textarea>
      </div>
      
      <div class="mb-4">
        <div class="flex items-center">
          <input 
            v-model="store.form.selectedField.collapsible"
            type="checkbox" 
            id="collapsible-toggle" 
            class="mr-2"
          />
          <label for="collapsible-toggle" class="text-sm text-gray-600">Collapsible Section</label>
        </div>
      </div>
      
      <!-- Add formula visibility for sections -->
      <div class="mb-4 mt-6">
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-600">Visibility Formula</label>
          <button 
            class="text-xs text-blue-600 hover:underline"
            @click="toggleSectionFormulaEditor" 
          >
            {{ showSectionFormulaEditor ? 'Hide Formula' : 'Edit Formula' }}
          </button>
        </div>
        
        <div v-if="showSectionFormulaEditor" class="mt-2">
          <FormulaEditor
            :formula="store.form.selectedField.formula || ''"
            formula-type="visibility"
            :available-fields="allFields"
            @update="updateSectionFormula"
          />
        </div>
      </div>
      
      <!-- Delete Section Button -->
      <div class="flex justify-between mt-6">
        <button 
          class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          style="color: white !important;"
          @click="deleteSection" 
        >
          Delete Section
        </button>
      </div>
    </template>
    
    <!-- Field Properties -->
    <template v-else-if="control">
      <!-- Common Properties Accordion -->
      <AccordionSection title="Common Properties" :initially-open="true">
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">Label</label>
          <input 
            v-model="controlCopy.label"
            type="text" 
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">Name</label>
          <input 
            v-model="controlCopy.name"
            type="text" 
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
        </div>
        
        <!-- Required toggle -->
        <div class="mb-4">
          <div class="flex items-center">
            <input 
              id="required-toggle"
              v-model="controlCopy.required"
              type="checkbox" 
              class="mr-2"
            >
            <label 
              for="required-toggle" 
              class="text-sm text-gray-600"
            >
              Required Field
            </label>
          </div>
        </div>
      </AccordionSection>
      
      <!-- Placeholder Accordion (for text-like fields) -->
      <AccordionSection 
        v-if="controlCopy && ['text', 'textarea', 'number', 'date', 'link'].includes(controlCopy.type)" 
        title="Placeholder Settings"
      >
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">Placeholder</label>
          <input 
            v-model="controlCopy.placeholder"
            type="text" 
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
        </div>
      </AccordionSection>
      
      <!-- Options Accordion (for select fields) -->
      <AccordionSection 
        v-if="controlCopy && controlCopy.type === 'select'" 
        title="Options Configuration"
      >
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">Options</label>
          <div 
            v-for="(option, index) in controlCopy.options" 
            :key="index" 
            class="flex mb-2"
          >
            <input 
              v-model="option.label"
              type="text" 
              placeholder="Label"
              class="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm"
            >
            <input 
              v-model="option.value"
              type="text" 
              placeholder="Value"
              class="flex-1 border border-gray-300 border-l-0 px-3 py-2 text-sm"
            >
            <button 
              class="bg-red-50 text-red-500 px-2 rounded-r border border-l-0 border-gray-300"
              @click="removeOption(index)" 
            >
              <i class="fas fa-times" />
            </button>
          </div>
          
          <button 
            class="w-full py-1 bg-gray-50 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-100"
            @click="addOption" 
          >
            <i class="fas fa-plus mr-1" /> Add Option
          </button>
        </div>
      </AccordionSection>
      
      <!-- Table Control Properties -->
      <TableControlProperties
        v-if="controlCopy && controlCopy.type === 'table'"
        :control="controlCopy"
        @update="updateTableControl"
      />
      
      <!-- Enhanced Formula Settings Accordion -->
      <AccordionSection title="Field Formulas">
        <p class="text-xs text-gray-500 mb-4">
          Add multiple formulas to control field behavior. Each formula can control different aspects of the field.
        </p>
        
        <div class="formula-capabilities grid grid-cols-2 gap-2 mb-4">
          <div class="bg-purple-50 p-2 rounded border border-purple-100 text-xs">
            <div class="font-medium text-purple-700">Calculation</div>
            <div class="text-purple-600">Calculate field value using other fields</div>
          </div>
          <div class="bg-amber-50 p-2 rounded border border-amber-100 text-xs">
            <div class="font-medium text-amber-700">Visibility</div>
            <div class="text-amber-600">Show/hide field based on conditions</div>
          </div>
          <div class="bg-blue-50 p-2 rounded border border-blue-100 text-xs">
            <div class="font-medium text-blue-700">Readonly</div>
            <div class="text-blue-600">Make field read-only conditionally</div>
          </div>
          <div class="bg-red-50 p-2 rounded border border-red-100 text-xs">
            <div class="font-medium text-red-700">Mandatory</div>
            <div class="text-red-600">Make field required based on conditions</div>
          </div>
        </div>
        
        <FormulaManager
          title="Manage Formulas"
          :formulas="controlCopy.formulas || []"
          :available-fields="getAvailableFields(controlCopy)"
          element-type="field"
          :allowed-types="['calculation', 'visibility', 'readonly', 'required']"
          @update="updateFormulas"
        />
        
        <div v-if="hasActiveFormulas" class="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
          <div class="text-xs font-medium text-blue-700 mb-1">Active Formulas:</div>
          <div v-if="hasCalculationFormula" class="text-xs text-blue-600 flex items-center mb-1">
            <span class="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2" />
            <span>Calculation: Value will be computed based on formula</span>
          </div>
          <div v-if="hasVisibilityFormula" class="text-xs text-blue-600 flex items-center mb-1">
            <span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />
            <span>Visibility: Field will show/hide dynamically</span>
          </div>
          <div v-if="hasReadonlyFormula" class="text-xs text-blue-600 flex items-center mb-1">
            <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <span>Readonly: Field will be editable or readonly conditionally</span>
          </div>
          <div v-if="hasRequiredFormula" class="text-xs text-blue-600 flex items-center">
            <span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />
            <span>Required: Field will be mandatory based on conditions</span>
          </div>
        </div>
      </AccordionSection>
      
      <!-- CSS Styling Accordion -->
      <AccordionSection title="CSS Styling">
        <!-- CSS Classes -->
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">Custom CSS Classes</label>
          <input
            v-model="controlCopy.cssClasses"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="e.g., custom-field highlight important"
          >
          <p class="text-xs text-gray-500 mt-1">
            Add space-separated CSS class names to apply custom styling
          </p>
        </div>
        
        <!-- Padding -->
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">Padding</label>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Top</label>
              <input
                v-model="controlCopy.padding.top"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Right</label>
              <input
                v-model="controlCopy.padding.right"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Bottom</label>
              <input
                v-model="controlCopy.padding.bottom"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Left</label>
              <input
                v-model="controlCopy.padding.left"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
          </div>
        </div>
        
        <!-- Margin -->
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">Margin</label>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Top</label>
              <input
                v-model="controlCopy.margin.top"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Right</label>
              <input
                v-model="controlCopy.margin.right"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Bottom</label>
              <input
                v-model="controlCopy.margin.bottom"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Left</label>
              <input
                v-model="controlCopy.margin.left"
                type="text"
                class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="e.g., 8px, 1rem"
              >
            </div>
          </div>
        </div>
      </AccordionSection>
      
      <!-- Action Buttons -->
      <div class="flex justify-between mt-6">
        <div class="flex gap-2">
          <button 
            class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            style="color: white !important;"
            @click="deleteField"
          >
            Delete Field
          </button>
          <button 
            class="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            style="color: white !important;"
            @click="saveFieldConfiguration"
          >
            <i class="fas fa-save mr-1" />
            Save Field
          </button>
        </div>
        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          style="color: white !important;"
          @click="updateControl" 
        >
          Update Field
        </button>
      </div>
    </template>
    
    <div v-else class="text-center py-6 text-gray-500">
      Select a field to edit its properties
    </div>
    
    <!-- Save Field Modal -->
    <SaveFieldModal
      v-if="showSaveFieldModal && controlCopy"
      :field="controlCopy"
      @save="handleSaveField"
      @cancel="showSaveFieldModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { Control, Formula } from '../../types';
import { computed, ref, watch } from 'vue';
import { useFormBuilderStore } from '../../stores/form-builder-store';
import { confirmDialog } from '../../utils/form-builder-utils';
import { StoredFieldsAPI } from '../../services/StoredFieldsAPI';
import { useToast } from '../../composables/useToast';
import FormulaEditor from './FormulaEditor.vue';
import FormulaManager from './FormulaManager.vue';
import AccordionSection from './AccordionSection.vue';
import TableControlProperties from './TableControlProperties.vue';
import SaveFieldModal from './SaveFieldModal.vue';

const props = defineProps({
  control: {
    type: Object as () => Control,
    required: true
  }
});

const emit = defineEmits(['update', 'delete', 'close-panel']);
const store = useFormBuilderStore();
const toast = useToast();

// Auto-save functionality
const autoSaveTimeout = ref<number | null>(null);
const isAutoSaving = ref(false);

// Auto-save function
async function autoSave() {
  if (!controlCopy.value) return;
  
  isAutoSaving.value = true;
  try {
    // Emit update to parent to save changes
    emit('update', controlCopy.value);
    
    // Force persistence to localStorage by getting current form state
    const currentFormStructure = {
      metadata: {
        formName: store.formName || 'New Form',
        formDescription: store.formDescription || '',
        formId: store.currentFormId || `form-${Date.now()}`,
        isPublished: false, // This would come from form metadata if available
        formLayout: 'tabs', // Default layout
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      tabs: store.form.layout?.tabs || []
    };
    
    // Save to localStorage to ensure persistence
    localStorage.setItem('savedFormStructure', JSON.stringify(currentFormStructure));
    
    // Mark form as dirty to indicate changes
    store.dirty = true;
    
    // If there's a form API and formId, save to backend
    if (store.currentFormId && store.currentFormId !== 'new') {
      // You can integrate with your form API here for auto-save to backend
      // await store.saveFormConfiguration(store.formName, store.formDescription);
    }
  } catch (error) {
    // Handle auto-save error silently or with a toast notification
    // eslint-disable-next-line no-console
    console.error('Auto-save failed:', error);
  } finally {
    isAutoSaving.value = false;
  }
}

// Debounced auto-save
function triggerAutoSave() {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
  
  autoSaveTimeout.value = window.setTimeout(() => {
    autoSave();
  }, 1000); // Auto-save after 1 second of inactivity
}

// Create a local copy of the control to avoid mutating props directly
const controlCopy = ref<Control | null>(null);

// Formula editor state
const showSectionFormulaEditor = ref(false);

// Formula state
const formula = ref('');
const formulaType = ref<'calculation' | 'visibility'>('calculation');

// Save field modal state
const showSaveFieldModal = ref(false);

// Initialize controlCopy from props
watch(() => props.control, (newControl) => {
  if (newControl) {
    controlCopy.value = JSON.parse(JSON.stringify(newControl));
    formula.value = newControl.formula || '';
    formulaType.value = newControl.formulaType || 'calculation';
    
    // Initialize CSS styling properties if they don't exist
    if (controlCopy.value) {
      if (!controlCopy.value.padding) {
        controlCopy.value.padding = {
          top: '',
          right: '',
          bottom: '',
          left: ''
        };
      }
      if (!controlCopy.value.margin) {
        controlCopy.value.margin = {
          top: '',
          right: '',
          bottom: '',
          left: ''
        };
      }
      if (!controlCopy.value.cssClasses) {
        controlCopy.value.cssClasses = '';
      }
    }
  }
}, { immediate: true });

// Watch for changes in controlCopy to trigger auto-save
watch(controlCopy, () => {
  if (controlCopy.value) {
    triggerAutoSave();
  }
}, { deep: true });

// Check if the selected field is a section
const isSection = computed(() => {
  return store.form.selectedField?.fieldtype === 'Section Break';
});

// Get all fields in the form
const allFields = computed(() => {
  // Gather all fields from all tabs, sections, and columns
  let fields: Control[] = [];
  
  if (store.form.layout.tabs) {
    store.form.layout.tabs.forEach((tab: any) => {
      if (tab.sections) {
        tab.sections.forEach((section: any) => {
          if (section.rows) {
            section.rows.forEach((row: any) => {
              row.columns.forEach((column: any) => {
                if (column.fields) {
                  fields = [...fields, ...column.fields];
                }
              });
            });
          } else if (section.columns) {
            // For backward compatibility
            section.columns.forEach((column: any) => {
              if (column.fields) {
                fields = [...fields, ...column.fields];
              }
            });
          }
        });
      }
    });
  }
  
  return fields;
});

// Get available fields for formulas (excluding current field to prevent circular references)
function getAvailableFields(currentControl: Control): Control[] {
  if (!currentControl) return [];
  return allFields.value.filter(field => field.id !== currentControl.id);
}

// Toggle the section formula editor visibility
function toggleSectionFormulaEditor() {
  showSectionFormulaEditor.value = !showSectionFormulaEditor.value;
}

// Update the formula for a section
function updateSectionFormula(formulaData: {
  formula: string;
  formulaType: 'visibility';
  isValid: boolean;
  dependsOn: string[];
}) {
  if (store.form.selectedField) {
    // Create a local copy and use type assertion to add formula properties
    const updatedField = { ...store.form.selectedField } as any;
    
    // Update formula properties
    updatedField.formula = formulaData.formula;
    updatedField.formulaType = 'visibility'; // Sections only support visibility formulas
    updatedField.dependsOn = formulaData.dependsOn;
    
    // Update the field in store
    store.form.selectedField = updatedField;
  }
}

// New function to handle multiple formulas
function updateFormulas(newFormulas: Formula[]) {
  if (!controlCopy.value) return;
  
  // Update formulas in the local copy
  controlCopy.value.formulas = newFormulas;
  
  // Update dependsOn to include all fields referenced across all formulas
  const allDependencies = new Set<string>();
  newFormulas.forEach(formula => {
    if (formula.dependsOn) {
      formula.dependsOn.forEach(dep => allDependencies.add(dep));
    }
  });
  controlCopy.value.dependsOn = Array.from(allDependencies);
}

// Update the control (emit to parent)
function updateControl() {
  if (controlCopy.value) {
    emit('update', controlCopy.value);
    // Hide the panel after update
    emit('close-panel');
    // Clear selected field
    store.form.selectedField = null;
  }
}

// Update table control properties
function updateTableControl(updatedControl: Control) {
  controlCopy.value = updatedControl;
}

// Delete the field
function deleteField() {
  if (controlCopy.value) {
    emit('delete', controlCopy.value.id);
    // Hide the panel after delete
    emit('close-panel');
    // Clear selected field
    store.form.selectedField = null;
  }
}

function addOption() {
  if (!controlCopy.value?.options) {
    controlCopy.value = {
      ...controlCopy.value as Control,
      options: []
    };
  }
  
  if (!controlCopy.value.options) {
    controlCopy.value.options = [];
  }
  
  const newIndex = controlCopy.value.options.length + 1;
  controlCopy.value.options.push({
    label: `Option ${newIndex}`,
    value: `option_${newIndex}`
  });
}

function removeOption(index: number) {
  if (controlCopy.value?.options) {
    controlCopy.value.options.splice(index, 1);
  }
}

function deleteSection() {
  // Check if a section is selected
  const currentField = store.form.selectedField;
  if (!currentField || currentField.fieldtype !== 'Section Break') return;
  
  // Check if it's a standard field in customize form mode
  if (store.isCustomizeForm && currentField.isCustomField === 0) {
    alert("Cannot delete standard field. You can hide it if you want");
    return;
  }
  
  confirmDialog(
    "Delete Section",
    `Are you sure you want to delete the section "${currentField.label || 'Untitled Section'}"?`,
    () => {
      // Find and delete the section
      const currentTab = store.currentTab;
      if (!currentTab) return;
      
      const sectionIndex = currentTab.sections.findIndex((section: any) => 
        section.df.name === currentField.name
      );
      
      if (sectionIndex > -1) {
        // Check if section has fields
        const hasFields = currentTab.sections[sectionIndex].columns.some((column: any) => 
          column.fields && column.fields.length > 0
        );
        
        if (hasFields) {
          // If section has fields, ask if they should be moved to the previous section
          confirmDialog(
            "Section Contains Fields",
            "This section contains fields. Would you like to move them to the previous section?",
            () => {
              // Move fields to previous section
              if (sectionIndex > 0) {
                const prevSection = currentTab.sections[sectionIndex - 1];
                const currentSection = currentTab.sections[sectionIndex];
                
                // Move columns to previous section
                prevSection.columns = [...prevSection.columns, ...currentSection.columns];
              }
              
              // Then delete the section
              currentTab.sections.splice(sectionIndex, 1);
              store.form.selectedField = null;
            },
            () => {
              // Just delete section and its fields
              currentTab.sections.splice(sectionIndex, 1);
              store.form.selectedField = null;
            },
            "Delete Everything"
          );
        } else {
          // If section is empty, just delete it
          currentTab.sections.splice(sectionIndex, 1);
          store.form.selectedField = null;
        }
      }
    }
  );
}

// Computed properties for formula status
const hasActiveFormulas = computed(() => {
  if (!controlCopy.value?.formulas) return false;
  return controlCopy.value.formulas.some(f => f.enabled);
});

const hasCalculationFormula = computed(() => {
  if (!controlCopy.value?.formulas) return false;
  return controlCopy.value.formulas.some(f => f.type === 'calculation' && f.enabled);
});

const hasVisibilityFormula = computed(() => {
  if (!controlCopy.value?.formulas) return false;
  return controlCopy.value.formulas.some(f => f.type === 'visibility' && f.enabled);
});

const hasReadonlyFormula = computed(() => {
  if (!controlCopy.value?.formulas) return false;
  return controlCopy.value.formulas.some(f => f.type === 'readonly' && f.enabled);
});

const hasRequiredFormula = computed(() => {
  if (!controlCopy.value?.formulas) return false;
  return controlCopy.value.formulas.some(f => f.type === 'required' && f.enabled);
});

// Save field configuration as template
function saveFieldConfiguration() {
  if (controlCopy.value) {
    showSaveFieldModal.value = true;
  }
}

// Handle save field modal
async function handleSaveField(fieldData: { name: string; description: string; tags: string[] }) {
  if (!controlCopy.value) return;
  
  try {
    await StoredFieldsAPI.saveFieldConfiguration(controlCopy.value, fieldData);
    toast.success('Field configuration saved successfully');
    showSaveFieldModal.value = false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Error saving field configuration:', error);
    console.error('Error saving field configuration:', error);
    toast.error('Failed to save field configuration');
  }
}
</script>

<style>
.properties-panel {
  background-color: white;
  border-left: 1px solid #e5e7eb;
  height: 100%;
  overflow: auto;
}
</style>