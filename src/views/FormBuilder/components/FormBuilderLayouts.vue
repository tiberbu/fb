<template>
  <div class="form-layout-container">
    <!-- Tabs Layout -->
    <FormBuilderTabsLayout
      v-if="formLayout === 'tabs'"
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
      @update:active-tab="$emit('update:active-tab', $event)"
      @handle-tab-order-changed="$emit('handle-tab-order-changed')"
      @add-tab="$emit('add-tab')"
      @open-tab-properties="$emit('open-tab-properties', $event)"
      @add-section="$emit('add-section')"
      @select-section="$emit('select-section', $event)"
      @open-section-menu="$emit('open-section-menu', $event)"
      @select-row="$emit('select-row', $event.sectionId, $event.rowIndex)"
      @delete-row="$emit('delete-row', $event.sectionId, $event.rowIndex)"
      @select-column="$emit('select-column', $event.sectionId, $event.columnIndex)"
      @edit-control="$emit('edit-control', $event)"
      @delete-control="$emit('delete-control', $event)"
      @open-field-selector="$emit('open-field-selector', $event.section, $event.rowIndex, $event.colIndex)"
      @add-field-to-column="$emit('add-field-to-column', $event.section, $event.rowIndex, $event.columnIndex, $event.type)"
      @close-field-selector="$emit('close-field-selector')"
      @add-column-to-row="$emit('add-column-to-row', $event.section, $event.rowIndex)"
      @add-row-to-section="$emit('add-row-to-section', $event)"
      @update-sections="$emit('update-sections', $event)"
      @update-column-fields="$emit('update-column-fields', $event.sectionId, $event.rowIndex, $event.columnIndex, $event.fields)"
    />

    <!-- Accordion Layout -->
    <FormBuilderAccordionLayout
      v-else-if="formLayout === 'accordion'"
      :tabs="tabs"
      :active-tab="activeTab"
      :current-tab-sections="currentTabSections"
      :selected-section="selectedSection"
      :selected-row="selectedRow"
      :selected-column="selectedColumn"
      :show-field-selector="showFieldSelector"
      :active-section="activeSection"
      :active-row-index="activeRowIndex"
      :active-column="activeColumn"
      @add-tab="$emit('add-tab')"
      @toggle-accordion-tab="$emit('toggle-accordion-tab', $event)"
      @open-tab-properties="$emit('open-tab-properties', $event)"
      @add-section="$emit('add-section')"
      @select-section="$emit('select-section', $event)"
      @open-section-menu="$emit('open-section-menu', $event)"
      @select-row="$emit('select-row', $event.sectionId, $event.rowIndex)"
      @delete-row="$emit('delete-row', $event.sectionId, $event.rowIndex)"
      @select-column="$emit('select-column', $event.sectionId, $event.columnIndex)"
      @edit-control="$emit('edit-control', $event)"
      @delete-control="$emit('delete-control', $event)"
      @open-field-selector="$emit('open-field-selector', $event.section, $event.rowIndex, $event.colIndex)"
      @add-field-to-column="$emit('add-field-to-column', $event.section, $event.rowIndex, $event.columnIndex, $event.type)"
      @close-field-selector="$emit('close-field-selector')"
      @add-column-to-row="$emit('add-column-to-row', $event.section, $event.rowIndex)"
      @add-row-to-section="$emit('add-row-to-section', $event)"
      @update-sections="$emit('update-sections', $event)"
      @update-column-fields="$emit('update-column-fields', $event.sectionId, $event.rowIndex, $event.columnIndex, $event.fields)"
    />

    <!-- Sidebar Layout -->
    <FormBuilderSidebarLayout
      v-else-if="formLayout === 'sidebar'"
      :tabs="tabs"
      :active-tab="activeTab"
      :current-tab-sections="currentTabSections"
      :selected-section="selectedSection"
      :selected-row="selectedRow"
      :selected-column="selectedColumn"
      :show-field-selector="showFieldSelector"
      :active-section="activeSection"
      :active-row-index="activeRowIndex"
      :active-column="activeColumn"
      @update:active-tab="$emit('update:active-tab', $event)"
      @add-tab="$emit('add-tab')"
      @open-tab-properties="$emit('open-tab-properties', $event)"
      @add-section="$emit('add-section')"
      @select-section="$emit('select-section', $event)"
      @open-section-menu="$emit('open-section-menu', $event)"
      @select-row="$emit('select-row', $event.sectionId, $event.rowIndex)"
      @delete-row="$emit('delete-row', $event.sectionId, $event.rowIndex)"
      @select-column="$emit('select-column', $event.sectionId, $event.columnIndex)"
      @edit-control="$emit('edit-control', $event)"
      @delete-control="$emit('delete-control', $event)"
      @open-field-selector="$emit('open-field-selector', $event.section, $event.rowIndex, $event.colIndex)"
      @add-field-to-column="$emit('add-field-to-column', $event.section, $event.rowIndex, $event.columnIndex, $event.type)"
      @close-field-selector="$emit('close-field-selector')"
      @add-column-to-row="$emit('add-column-to-row', $event.section, $event.rowIndex)"
      @add-row-to-section="$emit('add-row-to-section', $event)"
      @update-sections="$emit('update-sections', $event)"
      @update-column-fields="$emit('update-column-fields', $event.sectionId, $event.rowIndex, $event.columnIndex, $event.fields)"
    />
  </div>
</template>

<script setup lang="ts">
import FormBuilderTabsLayout from './layouts/FormBuilderTabsLayout.vue';
import FormBuilderAccordionLayout from './layouts/FormBuilderAccordionLayout.vue';
import FormBuilderSidebarLayout from './layouts/FormBuilderSidebarLayout.vue';

interface Props {
  formLayout: string;
  tabs: Array<{ label: string; sections: any[]; formulas?: any[] }>;
  activeTab: number;
  editingTabIndex: number | null;
  currentTabSections: any[];
  selectedSection: string | null;
  selectedRow: {sectionId: string; rowIndex: number} | null;
  selectedColumn: {sectionId: string; columnIndex: number} | null;
  showFieldSelector: boolean;
  activeSection: string | null;
  activeRowIndex: number | null;
  activeColumn: number | null;
}

defineProps<Props>();

defineEmits<{
  'update:active-tab': [value: number];
  'handle-tab-order-changed': [];
  'add-tab': [];
  'open-tab-properties': [index: number];
  'toggle-accordion-tab': [index: number];
  'add-section': [];
  'select-section': [section: any];
  'open-section-menu': [section: any];
  'select-row': [sectionId: string, rowIndex: number];
  'delete-row': [sectionId: string, rowIndex: number];
  'select-column': [sectionId: string, columnIndex: number];
  'edit-control': [control: any];
  'delete-control': [id: string];
  'open-field-selector': [section: any, rowIndex: number, colIndex: number];
  'add-field-to-column': [section: any, rowIndex: number, columnIndex: number, type?: string];
  'close-field-selector': [];
  'add-column-to-row': [section: any, rowIndex: number];
  'add-row-to-section': [section: any];
  'update-sections': [sections: any[]];
  'update-column-fields': [sectionId: string, rowIndex: number, columnIndex: number, fields: any[]];
}>();
</script>
