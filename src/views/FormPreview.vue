<template>
  <div class="form-preview-container">
    <!-- Paper Form Layout -->
    <div 
      v-if="hasFormContent" 
      class="paper-form"
    >
      <!-- Form Header -->
      <div class="form-header">
        <h1 class="form-title">
          {{ formMetadata.formName || 'Untitled Form' }}
        </h1>
        <p 
          v-if="formMetadata.formDescription" 
          class="form-description"
        >
          {{ formMetadata.formDescription }}
        </p>
      </div>

      <!-- Form Content -->
      <form 
        class="form-content"
        @submit.prevent="submitForm"
      >
        <!-- Tabs Layout -->
        <div 
          v-if="formLayout === 'tabs'" 
          class="form-tabs-layout"
        >
          <div class="tabs-header">
            <div class="tabs-container">
              <button
                v-for="(tab, tabIndex) in visibleTabs"
                :key="tabIndex"
                type="button"
                :class="['tab-button', { active: activeTabIndex === tabIndex }]"
                @click="activeTabIndex = tabIndex"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
          
          <div class="tab-content">
            <div 
              v-if="currentTab" 
              class="tab-sections"
            >
              <FormPreviewSections 
                :sections="currentTab.sections"
                :form-values="formValues"
                :field-visibility="fieldVisibility"
                :field-read-only="fieldReadOnly"
                :field-required="fieldRequired"
                :section-visibility="sectionVisibility"
                @update-field="updateFieldValue"
              />
            </div>
          </div>
        </div>

        <!-- Accordion Layout -->
        <div 
          v-else-if="formLayout === 'accordion'" 
          class="form-accordion-layout"
        >
          <div
            v-for="(tab, tabIndex) in visibleTabs"
            :key="tabIndex"
            class="accordion-item"
          >
            <button
              type="button"
              :class="['accordion-header', { active: expandedAccordions.includes(tabIndex) }]"
              @click="toggleAccordion(tabIndex)"
            >
              <span class="accordion-title">{{ tab.label }}</span>
              <i :class="['fas', expandedAccordions.includes(tabIndex) ? 'fa-chevron-up' : 'fa-chevron-down']" />
            </button>
            
            <div 
              v-show="expandedAccordions.includes(tabIndex)" 
              class="accordion-content"
            >
              <FormPreviewSections 
                :sections="tab.sections"
                :form-values="formValues"
                :field-visibility="fieldVisibility"
                :field-read-only="fieldReadOnly"
                :field-required="fieldRequired"
                :section-visibility="sectionVisibility"
                @update-field="updateFieldValue"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar Layout -->
        <div 
          v-else-if="formLayout === 'sidebar'" 
          class="form-sidebar-layout"
        >
          <div class="sidebar-nav">
            <div class="sidebar-header">
              <h3>Form Pages</h3>
            </div>
            <nav class="sidebar-menu">
              <button
                v-for="(tab, tabIndex) in visibleTabs"
                :key="tabIndex"
                type="button"
                :class="['sidebar-menu-item', { active: activeTabIndex === tabIndex }]"
                @click="activeTabIndex = tabIndex"
              >
                <span class="sidebar-item-label">{{ tab.label }}</span>
                <div class="page-indicator">
                  {{ tabIndex + 1 }}
                </div>
              </button>
            </nav>
          </div>
          
          <div class="sidebar-content">
            <div 
              v-if="currentTab" 
              class="page-header"
            >
              <h2 class="page-title">
                {{ currentTab.label }}
              </h2>
              <div class="page-meta">
                Page {{ activeTabIndex + 1 }} of {{ visibleTabs.length }}
              </div>
            </div>
            
            <div class="page-sections">
              <FormPreviewSections 
                :sections="currentTab.sections"
                :form-values="formValues"
                :field-visibility="fieldVisibility"
                :field-read-only="fieldReadOnly"
                :field-required="fieldRequired"
                :section-visibility="sectionVisibility"
                @update-field="updateFieldValue"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-footer">
          <button 
            type="submit" 
            class="submit-button"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>

    <!-- Empty State -->
    <div 
      v-else 
      class="empty-form"
    >
      <div class="empty-icon">
        <i class="fas fa-file-alt" />
      </div>
      <h3>No Form Content</h3>
      <p>Create a form in the builder to see the preview here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { evaluateFormula } from '../utils/formula-evaluator';
import type { Formula } from '../types';
import FormPreviewSections from '../components/FormPreviewSections.vue';

const props = defineProps<{ 
  formData?: any;
  id?: string;
}>();

// Form state
const formValues = ref<Record<string, any>>({});
const fieldVisibility = ref<Record<string, boolean>>({});
const fieldReadOnly = ref<Record<string, boolean>>({});
const fieldRequired = ref<Record<string, boolean>>({});
const sectionVisibility = ref<Record<string, boolean>>({});

// Interactive layout state
const activeTabIndex = ref(0);
const expandedAccordions = ref<number[]>([0]); // First accordion expanded by default

// Form data
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

// Computed properties
const formMetadata = computed(() => formData.value?.metadata || {});
const formTabs = computed(() => formData.value?.tabs || []);
const formLayout = computed(() => formData.value?.layout || formData.value?.metadata?.formLayout || 'tabs');

const hasFormContent = computed(() => {
  return formTabs.value.length > 0 && 
         formTabs.value.some((tab: any) => 
           tab.sections && tab.sections.length > 0 &&
           tab.sections.some((section: any) => 
             section.rows && section.rows.length > 0 &&
             section.rows.some((row: any) => 
               row.columns && row.columns.length > 0 &&
               row.columns.some((col: any) => col.fields && col.fields.length > 0)
             )
           )
         );
});

const visibleTabs = computed(() => {
  return formTabs.value.filter(() => !isTabHidden());
});

// Current active tab
const currentTab = computed(() => {
  return visibleTabs.value[activeTabIndex.value] || null;
});

// Interactive layout methods
function toggleAccordion(index: number) {
  const accordionIndex = expandedAccordions.value.indexOf(index);
  if (accordionIndex > -1) {
    expandedAccordions.value.splice(accordionIndex, 1);
  } else {
    expandedAccordions.value.push(index);
  }
}

// Helper functions
function isTabHidden(): boolean {
  return false; // For preview, show all tabs
}

function isFieldHidden(fieldId: string): boolean {
  return fieldVisibility.value[fieldId] === false;
}

function isFieldRequired(field: any): boolean {
  return fieldRequired.value[field.id] === true || field.required === true;
}

// Form value handling functions
function updateFieldValue(field: any, value: any) {
  // Store the new value
  formValues.value[field.name] = value;
  
  // Re-evaluate formulas immediately after value change
  evaluateAllFormulas();
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
  alert('Form submitted successfully!');
};

// Get all form fields
function getAllFormFields() {
  const allFields: any[] = [];
  
  formTabs.value.forEach((tab: any) => {
    if (tab.sections) {
      tab.sections.forEach((section: any) => {
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
        }
      });
    }
  });
  
  return allFields;
}

//Initialize form states
function initializeFormStates() {
  // Reset states
  formValues.value = {};
  fieldVisibility.value = {};
  fieldReadOnly.value = {};
  fieldRequired.value = {};
  sectionVisibility.value = {};

  // Initialize field states
  const allFields = getAllFormFields();
  allFields.forEach(field => {
    // Set default values first - handle different field types appropriately
    if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
      formValues.value[field.name] = field.defaultValue;
    } else {
      // Set appropriate empty values based on field type
      switch (field.type) {
        case 'number':
        case 'range':
          formValues.value[field.name] = 0;
          break;
        case 'checkbox':
        case 'check':
          formValues.value[field.name] = false;
          break;
        case 'table':
          formValues.value[field.name] = [];
          break;
        case 'select':
        case 'radio':
          formValues.value[field.name] = '';
          break;
        default:
          // For text, email, phone, url, date, datetime, time, textarea, etc.
          formValues.value[field.name] = '';
      }
    }
    
    // Check if field has calculation formula - if so, make it read-only
    const hasCalculationFormula = field.formulas && field.formulas.some((f: Formula) => 
      f.type === 'calculation' && f.enabled
    );
    
    // Set initial states (will be overridden by formulas if applicable)
    fieldVisibility.value[field.id] = !field.hidden;
    fieldReadOnly.value[field.id] = hasCalculationFormula || field.isReadonly || false;
    fieldRequired.value[field.id] = field.required || false;
  });

  // Initialize all sections as visible
  formTabs.value.forEach((tab: any) => {
    if (tab.sections) {
      tab.sections.forEach((section: any) => {
        sectionVisibility.value[section.id] = true;
      });
    }
  });

  // Evaluate formulas after setting initial values
  // Use setTimeout to ensure all initial values are set before formula evaluation
  setTimeout(() => {
    evaluateAllFormulas();
  }, 0);
}

// Evaluate all formulas
function evaluateAllFormulas() {
  // Prevent infinite loops
  if (isEvaluatingFormulas) return;
  
  isEvaluatingFormulas = true;
  
  try {
    const allFields = getAllFormFields();
    
    // First pass: Handle calculation formulas in dependency order
    const calculationFields = allFields.filter(field => hasCalculationFormula(field));
    const sortedCalculationFields = sortFieldsByDependencies(calculationFields, allFields);
    
    sortedCalculationFields.forEach(field => {
      evaluateFieldFormulas(field, 'calculation');
    });
    
    // Second pass: Handle all other formulas (visibility, required, readonly)
    allFields.forEach(field => {
      evaluateFieldFormulas(field, 'visibility');
      evaluateFieldFormulas(field, 'required');
      evaluateFieldFormulas(field, 'readonly');
    });
    
    // Third pass: Handle section visibility
    evaluateSectionFormulas();
  } finally {
    // Always reset the flag
    isEvaluatingFormulas = false;
  }
}

// Helper function to check if field has calculation formula
function hasCalculationFormula(field: any): boolean {
  if (field.formulas && field.formulas.length > 0) {
    return field.formulas.some((f: Formula) => f.type === 'calculation' && f.enabled);
  }
  return false;
}

// Helper function to sort fields by dependencies for calculation formulas
function sortFieldsByDependencies(fields: any[], allFields: any[]): any[] {
  const fieldMap = new Map(allFields.map(f => [f.name, f]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: any[] = [];
  
  function visit(field: any) {
    if (visiting.has(field.name)) {
      // Circular dependency - skip to avoid infinite loop
      return;
    }
    if (visited.has(field.name)) {
      return;
    }
    
    visiting.add(field.name);
    
    // Find dependencies in calculation formulas
    const dependencies = getFieldDependencies(field);
    for (const dep of dependencies) {
      const depField = fieldMap.get(dep);
      if (depField && hasCalculationFormula(depField)) {
        visit(depField);
      }
    }
    
    visiting.delete(field.name);
    visited.add(field.name);
    result.push(field);
  }
  
  fields.forEach(field => {
    if (!visited.has(field.name)) {
      visit(field);
    }
  });
  
  return result;
}

// Helper function to get field dependencies from formulas
function getFieldDependencies(field: any): string[] {
  const dependencies: string[] = [];
  
  if (field.formulas && field.formulas.length > 0) {
    field.formulas.forEach((formula: Formula) => {
      if (formula.enabled) {
        const matches = formula.expression.match(/field\(['"]([^'"]+)['"]\)/g);
        if (matches) {
          matches.forEach(match => {
            const fieldName = match.match(/field\(['"]([^'"]+)['"]\)/)?.[1];
            if (fieldName && !dependencies.includes(fieldName)) {
              dependencies.push(fieldName);
            }
          });
        }
      }
    });
  }
  
  return dependencies;
}

// Evaluate formulas for a specific field and type
function evaluateFieldFormulas(field: any, formulaType: 'calculation' | 'visibility' | 'required' | 'readonly') {
  if (!field.formulas || field.formulas.length === 0) return;
  
  field.formulas.forEach((formula: Formula) => {
    if (formula.enabled && formula.type === formulaType) {
      try {
        const result = evaluateFormula(formula.expression, formValues.value);
        
        switch (formula.type) {
          case 'visibility':
            fieldVisibility.value[field.id] = Boolean(result);
            break;
          case 'required':
            fieldRequired.value[field.id] = Boolean(result);
            break;
          case 'readonly':
            const readonlyResult = Boolean(result);
            fieldReadOnly.value[field.id] = readonlyResult;
            
            // Debug logging in development
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log(`Readonly formula for field "${field.name}": ${result} -> ${readonlyResult}`);
            }
            break;
          case 'calculation':
            // Always update calculated value, even if the same
            // This ensures the UI reflects the correct calculated value
            const calculatedResult = result;
            
            // Format the result appropriately for the field type
            let formattedResult = calculatedResult;
            if (field.type === 'number' && typeof calculatedResult === 'number') {
              // Round to reasonable decimal places for display
              formattedResult = Math.round(calculatedResult * 100) / 100;
            }
            
            formValues.value[field.name] = formattedResult;
            
            // Debug logging in development
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log(`Calculated field "${field.name}": ${calculatedResult} -> ${formattedResult}`);
            }
            break;
        }
      } catch (error) {
        // Handle formula errors gracefully in preview mode
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn(`Formula evaluation error for field ${field.name} (${formulaType}):`, error);
        }
        
        // Set safe defaults on error
        switch (formulaType) {
          case 'visibility':
            fieldVisibility.value[field.id] = true; // Show field on error
            break;
          case 'required':
            fieldRequired.value[field.id] = field.required || false; // Use field's base requirement
            break;
          case 'readonly':
            fieldReadOnly.value[field.id] = field.isReadonly || false; // Use field's base readonly state
            break;
          case 'calculation':
            // Keep existing value on calculation error
            break;
        }
      }
    }
  });
}

// Evaluate section visibility formulas
function evaluateSectionFormulas() {
  // Get all sections from all tabs
  formTabs.value.forEach((tab: any) => {
    if (tab.sections) {
      tab.sections.forEach((section: any) => {
        if (section.formulas && section.formulas.length > 0) {
          section.formulas.forEach((formula: Formula) => {
            if (formula.enabled && formula.type === 'visibility') {
              try {
                const result = evaluateFormula(formula.expression, formValues.value);
                sectionVisibility.value[section.id] = Boolean(result);
              } catch (error) {
                // Show section on error
                sectionVisibility.value[section.id] = true;
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.warn(`Section visibility formula error for section ${section.id}:`, error);
                }
              }
            }
          });
        } else {
          // Ensure section is visible if no formulas
          sectionVisibility.value[section.id] = true;
        }
      });
    }
  });
}

// Watch for form data changes
watch(() => props.formData, (newData) => {
  if (newData) {
    formData.value = newData;
    initializeFormStates();
  }
}, { immediate: true });

// Debugging helper for development
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore - Attach to window for debugging
  window.formPreviewDebug = {
    formValues,
    fieldVisibility,
    fieldReadOnly,
    fieldRequired,
    sectionVisibility,
    evaluateAllFormulas,
    getAllFormFields,
    isEvaluatingFormulas: () => isEvaluatingFormulas,
    // Helper to check specific field readonly state
    checkFieldReadOnly: (fieldId: string) => {
      return {
        fromState: fieldReadOnly.value[fieldId],
        allReadOnlyStates: fieldReadOnly.value
      };
    }
  };
}

// Watch for form values changes to re-evaluate formulas
// Note: We use a flag to prevent infinite loops from calculation formulas
let isEvaluatingFormulas = false;

watch(formValues, (newValues, oldValues) => {
  // Prevent infinite loops during formula evaluation
  if (isEvaluatingFormulas) return;
  
  // Only re-evaluate if we have fields with formulas and values actually changed
  if (newValues && oldValues) {
    const hasFormulasToEvaluate = getAllFormFields().some(field => 
      field.formulas && field.formulas.length > 0 && 
      field.formulas.some((f: Formula) => f.enabled)
    );
    
    if (hasFormulasToEvaluate) {
      // Check if any values actually changed (to avoid unnecessary evaluations)
      const valuesChanged = Object.keys(newValues).some(key => newValues[key] !== oldValues[key]);
      
      if (valuesChanged) {
        evaluateAllFormulas();
      }
    }
  }
}, { deep: true });

onMounted(() => {
  initializeFormStates();
});
</script>

<style scoped>
/* 
 * Z-Index Stacking Order:
 * - Field Selector Sidebar: 250 (when adding fields)
 * - Field Selector Backdrop: 240
 * - Sidebar menu items: 210
 * - Sidebar nav: 200
 * - Sidebar layout & content: 150
 * - Top action bar: 100 (from FormBuilder)
 * - Accordion headers active: 60
 * - Paper form: 50
 */

.form-preview-container {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
  width: 100%;
}

.paper-form {
  background: white;
  width: 100%;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  position: relative;
  z-index: 50;
}

.form-header {
  padding: 28px 40px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.form-description {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.form-content {
  width: 100%;
}

/* Tabs Layout */
.form-tabs-layout {
  width: 100%;
}

.tabs-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 40px;
}

.tabs-container {
  display: flex;
  gap: 2px;
  overflow-x: auto;
}

.tab-button {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--primary);
  background: var(--primary-light, rgba(23, 23, 23, 0.05));
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: white;
}

.tab-content {
  padding: 32px 40px;
}

.tab-sections {
  width: 100%;
}

/* Accordion Layout */
.form-accordion-layout {
  width: 100%;
}

.accordion-item {
  border-bottom: 1px solid #e2e8f0;
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  width: 100%;
  padding: 20px 40px;
  background: #fafbfc;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.accordion-header:hover {
  background: #f1f5f9;
}

.accordion-header.active {
  background: white;
  color: var(--primary);
  border-left: 4px solid var(--primary);
  position: relative;
  z-index: 60;
}

.accordion-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.accordion-header i {
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.accordion-content {
  padding: 32px 40px;
  background: white;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Sidebar Layout */
.form-sidebar-layout {
  display: flex;
  width: 100%;
  min-height: 500px;
  position: relative;
  z-index: 150;
}

.sidebar-nav {
  width: 280px;
  background: #f8f9fa;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
  z-index: 200;
  position: relative;
}

.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.sidebar-menu {
  padding: 16px 0;
}

.sidebar-menu-item {
  width: 100%;
  padding: 12px 24px;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: #64748b;
  font-weight: 500;
  position: relative;
  z-index: 210;
}

.sidebar-menu-item:hover {
  background: var(--primary-light, rgba(23, 23, 23, 0.05));
  color: var(--primary);
}

.sidebar-menu-item.active {
  background: var(--primary);
  color: white;
}

.sidebar-item-label {
  flex: 1;
  text-align: left;
}

.page-indicator {
  background: rgba(100, 116, 139, 0.2);
  color: #64748b;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.sidebar-menu-item.active .page-indicator {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.sidebar-content {
  flex: 1;
  background: white;
  position: relative;
  z-index: 150;
}

.page-header {
  padding: 28px 40px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.page-meta {
  color: #64748b;
  font-size: 0.9rem;
}

.page-sections {
  padding: 32px 40px;
}

/* Form Footer */
.form-footer {
  padding: 24px 40px;
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.submit-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(23, 23, 23, 0.2);
  min-width: 120px;
}

.submit-button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(23, 23, 23, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

/* Empty State */
.empty-form {
  text-align: center;
  padding: 80px 40px;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 24px;
  opacity: 0.3;
}

.empty-form h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-form p {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-preview-container {
    padding: 16px;
  }
  
  .form-header,
  .tab-content,
  .accordion-content,
  .page-sections {
    padding: 20px;
  }
  
  .form-footer {
    padding: 20px;
  }
  
  .form-sidebar-layout {
    flex-direction: column;
  }
  
  .sidebar-nav {
    width: 100%;
    order: 2;
  }
  
  .sidebar-content {
    order: 1;
  }
  
  .tabs-container {
    padding: 0 16px;
  }
  
  .tab-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}

@media print {
  .form-preview-container {
    padding: 0;
    background: white;
  }
  
  .paper-form {
    box-shadow: none;
    border-radius: 0;
  }
  
  .tabs-header,
  .accordion-header,
  .sidebar-nav {
    display: none;
  }
  
  .tab-content,
  .accordion-content,
  .page-sections {
    padding: 20px 0;
  }
  
  .form-footer {
    display: none;
  }
}
</style>
