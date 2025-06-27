<template>
  <div
    ref="container"
    class="form-builder-container"
    @click="clearSelection"
  >
    <!-- Top Action Bar - Above Everything -->
    <div class="top-action-bar">
      <div class="action-bar-left">
        <h3 class="form-title">
          {{ formName || 'Untitled Form' }}
        </h3>
        <span 
          v-if="isDirty && !isSaving" 
          class="unsaved-indicator"
        >•</span>
      </div>
      
      <div class="action-buttons">
        <button 
          class="action-btn btn-sm" 
          :title="isPreviewMode ? 'Back to Builder' : 'Preview Form'"
          @click="previewForm"
        >
          <i :class="isPreviewMode ? 'fas fa-edit' : 'fas fa-eye'" />
          <span>{{ isPreviewMode ? 'Edit' : 'Preview' }}</span>
        </button>
        
        <button 
          class="action-btn btn-sm" 
          title="Export as JSON"
          @click="exportForm"
        >
          <i class="fas fa-download" />
          <span>Export JSON</span>
        </button>
        
        <button 
          class="action-btn primary btn-sm" 
          title="Save Changes"
          :disabled="isSaving || !isDirty"
          @click="saveFormToAPI"
        >
          <i 
            :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"
          />
          <span>{{ isSaving ? 'Saving...' : (isDirty ? 'Save Changes' : 'Saved') }}</span>
        </button>
      </div>
    </div>

    <!-- Form Container - Now Full Width -->
    <div class="form-container">
      <div class="form-main">
        <!-- Preview Mode -->
        <div v-if="isPreviewMode" class="preview-mode">
          <FormPreview
            :id="props.id"
            :form-data="getFormData()"
          />
        </div>

        <!-- Builder Mode -->
        <div v-else class="builder-mode">
          <!-- Header with Sidebar Toggle -->
          <FormBuilderHeader
            :show-sidebar="showSidebar"
            :has-selection="hasSelection"
            :selection-type="selectionType"
            @toggle-sidebar="toggleSidebar"
          />

          <!-- Dynamic Layout System -->
          <FormBuilderLayouts
            :form-layout="formLayout"
            :tabs="tabs"
            :active-tab="activeTab"
            :editing-tab-index="editingTabIndex"
            :current-tab-sections="currentTabSections"
            :selected-section="selectedSection"
            :selected-row="selectedRow"
            :selected-column="selectedColumn"
            :show-field-selector="showFieldSelector"
            :active-section="activeSection"
            :active-row-index="activeRowIndex"
            :active-column="activeColumn"
            @update:active-tab="activeTab = $event"
            @handle-tab-order-changed="handleTabOrderChanged"
            @add-tab="addTab"
            @open-tab-properties="openTabProperties"
            @toggle-accordion-tab="toggleAccordionTab"
            @add-section="addSection"
            @select-section="selectSection"
            @open-section-menu="openSectionMenu"
            @select-row="selectRow"
            @delete-row="deleteRow"
            @select-column="selectColumn"
            @edit-control="editControl"
            @delete-control="deleteControl"
            @open-field-selector="(section, rowIndex, colIndex) => openFieldSelector(section, rowIndex, colIndex)"
            @add-field-to-column="(section: any, rowIndex: number, columnIndex: number, type?: string) => addFieldToColumn(section, rowIndex, columnIndex, type as ControlType)"
            @close-field-selector="closeFieldSelector"
            @add-column-to-row="addColumnToRow"
            @add-row-to-section="addRowToSection"
            @update-sections="updateSections"
            @update-column-fields="updateColumnFields"
          />
        </div>
      </div>
    </div>

    <!-- Sidebar (only show in builder mode) -->
    <FormBuilderSidebar
      v-if="!isPreviewMode"
      :show-sidebar="showSidebar"
      :selected-control="selectedControl"
      :selected-section="selectedSection"
      :selected-column="selectedColumn"
      :selected-row="selectedRow"
      :selected-tab="selectedTab"
      :tabs="tabs"
      :form-name="formName"
      :form-description="formDescription"
      :form-id="formId"
      :is-published="isPublished"
      :form-layout="formLayout"
      :field-search-query="fieldSearchQuery"
      :filtered-field-types="filteredFieldTypes"
      :is-saving="isSaving"
      :is-dirty="isDirty"
      @update:form-name="formName = $event"
      @update:form-description="formDescription = $event"
      @update:form-id="formId = $event"
      @update:is-published="isPublished = $event"
      @update:form-layout="formLayout = $event"
      @update:field-search-query="fieldSearchQuery = $event"
      @update-tab-name="updateTabName"
      @update-tab-description="updateTabDescription"
      @duplicate-tab="duplicateTab"
      @delete-tab="deleteTab"
      @close-sidebar="closeSidebar"
      @update-control="updateControl"
      @update-section="updateSection"
      @delete-control="deleteControl"
      @delete-section="deleteSection"
      @delete-column="deleteColumn"
      @delete-row="deleteRow"
      @export-form="exportForm"
      @save-form="saveFormToAPI"
      @handle-file-import="handleFileImport"
      @open-formula-preview="openFormulaPreview"
      @copy-to-clipboard="copyToClipboard"
      @add-control="(type: string) => addControl(type as ControlType)"
      @get-section-by-id="getSectionById"
      @get-formatted-json="getFormattedJson"
      @get-icon-for-field-type="getIconForFieldType"
      @get-field-type-description="getFieldTypeDescription"
    />

    <!-- Field Selector Sidebar -->
    <FieldSelectorSidebar
      :is-open="showFieldSelector"
      @select-field-type="handleFieldTypeSelected"
      @close="closeFieldSelector"
    />
    
    <!-- Temporary Debug Button -->
    <button 
      v-if="currentTabSections.length > 0" 
      class="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded z-50"
      @click="testAddField"
    >
      Test Add Field
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { Control, ControlType } from "../../types";
import FormBuilderHeader from "./components/FormBuilderHeader.vue";
import FormBuilderLayouts from "./components/FormBuilderLayouts.vue";
import FormBuilderSidebar from "./components/FormBuilderSidebar.vue";
import FieldSelectorSidebar from "../../components/ui/FieldSelectorSidebar.vue";
import FormPreview from "../FormPreview.vue";
import { useFormBuilderComposable } from "./composables/useFormBuilderComposable";

const props = defineProps<{
  id?: string
}>()

const emit = defineEmits(['form-data-change']);

// Use the composable for shared logic
const {
  // State
  formName,
  formDescription,
  formId,
  isPublished,
  formLayout,
  tabs,
  activeTab,
  selectedTab,
  selectedControl,
  selectedSection,
  selectedColumn,
  selectedRow,
  editingTabIndex,
  showFieldSelector,
  activeSection,
  activeRowIndex,
  activeColumn,
  showSidebar,
  isPreviewMode,
  fieldSearchQuery,
  isSaving,
  isDirty,
  
  // Computed
  currentTabSections,
  hasSelection,
  selectionType,
  filteredFieldTypes,
  
  // Methods
  openTabProperties,
  toggleSidebar,
  closeSidebar,
  toggleAccordionTab,
  clearSelection,
  addTab,
  duplicateTab,
  updateTabName,
  updateTabDescription,
  deleteTab,
  addSection,
  deleteSection,
  selectSection,
  selectColumn,
  selectRow,
  addRowToSection,
  deleteRow,
  getSectionById,
  deleteColumn,
  openFieldSelector,
  closeFieldSelector,
  addFieldToColumn,
  addControl,
  editControl,
  deleteControl,
  loadSavedForm,
  updateControlProps,
  updateSection,
  addColumnToRow,
  exportForm,
  handleFileImport,
  getFormattedJson,
  openFormulaPreview,
  copyToClipboard,
  handleTabOrderChanged,
  openSectionMenu,
  getIconForFieldType,
  getFieldTypeDescription,
  saveFormToAPI,
  togglePreviewMode,
  exitPreviewMode
} = useFormBuilderComposable(emit, props.id);

// Preview form functionality
function previewForm() {
  togglePreviewMode();
}

// Get form data formatted for preview component
function getFormData() {
  return {
    layout: formLayout.value, // Add layout at root level for FormPreview
    metadata: {
      formName: formName.value,
      formDescription: formDescription.value,
      formLayout: formLayout.value
    },
    tabs: tabs.value
  };
}

// Update control (wrapper for updateControlProps)
function updateControl(updatedControl: Control) {
  updateControlProps(updatedControl);
}

// Update sections
function updateSections(newSections: any[]) {
  if (tabs.value[activeTab.value]) {
    tabs.value[activeTab.value].sections = newSections;
  }
}

// Update column fields
function updateColumnFields(sectionId: string, rowIndex: number, columnIndex: number, fields: Control[]) {
  const section = getSectionById(sectionId);
  if (section.rows && section.rows[rowIndex] && section.rows[rowIndex].columns[columnIndex]) {
    section.rows[rowIndex].columns[columnIndex].fields = fields;
  }
}

// Handle field type selection from sidebar
function handleFieldTypeSelected(type: ControlType) {
  if (activeSection.value !== null && activeRowIndex.value !== null && activeColumn.value !== null) {
    // Find the section object
    const section = currentTabSections.value.find(s => s.id === activeSection.value);
    if (section) {
      addFieldToColumn(section, activeRowIndex.value, activeColumn.value, type);
    }
  }
}

// Test function to debug field adding
function testAddField() {
  if (currentTabSections.value.length > 0) {
    const section = currentTabSections.value[0];
    if (section.rows && section.rows.length > 0 && section.rows[0].columns && section.rows[0].columns.length > 0) {
      addFieldToColumn(section, 0, 0, 'text');
    }
  }
}

// Keyboard shortcut handler
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === '`') {
    e.preventDefault();
    toggleSidebar();
  }
  
  // Save shortcut (Ctrl+S or Cmd+S)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (isDirty.value && !isSaving.value) {
      saveFormToAPI();
    }
  }
};

// Initialize component - load saved form data on mount
onMounted(() => {
  loadSavedForm();
  // Add keyboard shortcut for toggling sidebar (Ctrl/Cmd + `)
  document.addEventListener('keydown', handleKeydown);
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Expose methods to parent component
defineExpose({
  loadSavedForm
});
</script>

<style src="./styles/FormBuilder.css"></style>
