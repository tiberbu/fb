<template>
  <div
    ref="container"
    class="form-builder-container"
    @click="clearSelection"
  >
    <!-- Form Container - Now Full Width -->
    <div class="form-container">
      <div class="form-main">
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
          @open-field-selector="openFieldSelector"
          @add-field-to-column="(section: any, rowIndex: number, columnIndex: number, type?: string) => addFieldToColumn(section, rowIndex, columnIndex, type as ControlType)"
          @close-field-selector="closeFieldSelector"
          @add-column-to-row="addColumnToRow"
          @add-row-to-section="addRowToSection"
          @update-sections="updateSections"
          @update-column-fields="updateColumnFields"
        />
      </div>
    </div>

    <!-- Sidebar -->
    <FormBuilderSidebar
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
      @delete-control="deleteControl"
      @delete-section="deleteSection"
      @delete-column="deleteColumn"
      @delete-row="deleteRow"
      @export-form="exportForm"
      @handle-file-import="handleFileImport"
      @open-formula-preview="openFormulaPreview"
      @copy-to-clipboard="copyToClipboard"
      @add-control="(type: string) => addControl(type as ControlType)"
      @get-section-by-id="getSectionById"
      @get-formatted-json="getFormattedJson"
      @get-icon-for-field-type="getIconForFieldType"
      @get-field-type-description="getFieldTypeDescription"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { Control, ControlType } from "../../types";
import FormBuilderHeader from "./components/FormBuilderHeader.vue";
import FormBuilderLayouts from "./components/FormBuilderLayouts.vue";
import FormBuilderSidebar from "./components/FormBuilderSidebar.vue";
import { useFormBuilderComposable } from "./composables/useFormBuilderComposable";

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
  fieldSearchQuery,
  
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
  addColumnToRow,
  exportForm,
  handleFileImport,
  getFormattedJson,
  openFormulaPreview,
  copyToClipboard,
  handleTabOrderChanged,
  openSectionMenu,
  getIconForFieldType,
  getFieldTypeDescription
} = useFormBuilderComposable(emit);

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

// Keyboard shortcut handler
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === '`') {
    e.preventDefault();
    toggleSidebar();
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
