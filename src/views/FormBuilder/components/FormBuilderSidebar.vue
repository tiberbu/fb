<template>
  <!-- Popover Sidebar Overlay -->
  <div
    v-if="showSidebar"
    class="sidebar-overlay"
    @click="$emit('close-sidebar')"
  />

  <!-- Popover Sidebar -->
  <div
    class="popover-sidebar"
    :class="{ 'open': showSidebar }"
    @click.stop
  >
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        Properties
      </h3>
      <button
        class="sidebar-close-button"
        @click="$emit('close-sidebar')"
      >
        <i class="fas fa-times" />
      </button>
    </div>
    <div class="sidebar-content">
      <!-- Tab Properties -->
      <FormBuilderTabProperties
        v-if="selectedTab !== null"
        :tab="getTabByIndex(selectedTab)"
        :tab-index="selectedTab"
        :total-tabs="tabs.length"
        @update-tab-name="(index: number, name: string) => $emit('update-tab-name', index, name)"
        @update-tab-description="(index: number, description: string) => $emit('update-tab-description', index, description)"
        @duplicate-tab="$emit('duplicate-tab', $event)"
        @delete-tab="$emit('delete-tab', $event)"
      />

      <!-- Control Properties -->
      <FormBuilderControlProperties
        v-else-if="selectedControl"
        :control="selectedControl"
        @update="$emit('update-control', $event)"
        @delete="$emit('delete-control', $event)"
      />

      <!-- Section Properties -->
      <FormBuilderSectionProperties
        v-else-if="selectedSection"
        :section-id="selectedSection"
        @delete-section="$emit('delete-section', $event)"
        @get-section-by-id="$emit('get-section-by-id', $event)"
      />

      <!-- Column Properties -->
      <FormBuilderColumnProperties
        v-else-if="selectedColumn"
        :selected-column="selectedColumn"
        @delete-column="$emit('delete-column', $event.sectionId, $event.columnIndex)"
        @get-section-by-id="$emit('get-section-by-id', $event)"
      />

      <!-- Row Properties -->
      <FormBuilderRowProperties
        v-else-if="selectedRow"
        :selected-row="selectedRow"
        @delete-row="$emit('delete-row', $event.sectionId, $event.rowIndex)"
        @get-section-by-id="$emit('get-section-by-id', $event)"
      />

      <!-- Form Configuration -->
      <FormBuilderFormConfiguration
        v-else
        :form-name="formName"
        :form-description="formDescription"
        :form-id="formId"
        :is-published="isPublished"
        :form-layout="formLayout"
        :field-search-query="fieldSearchQuery"
        :filtered-field-types="filteredFieldTypes"
        @update:form-name="$emit('update:form-name', $event)"
        @update:form-description="$emit('update:form-description', $event)"
        @update:form-id="$emit('update:form-id', $event)"
        @update:is-published="$emit('update:is-published', $event)"
        @update:form-layout="$emit('update:form-layout', $event)"
        @update:field-search-query="$emit('update:field-search-query', $event)"
        @export-form="$emit('export-form')"
        @handle-file-import="$emit('handle-file-import', $event)"
        @open-formula-preview="$emit('open-formula-preview')"
        @copy-to-clipboard="$emit('copy-to-clipboard')"
        @get-formatted-json="$emit('get-formatted-json')"
        @add-control="$emit('add-control', $event)"
        @get-icon-for-field-type="$emit('get-icon-for-field-type', $event)"
        @get-field-type-description="$emit('get-field-type-description', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Control } from "../../../types";
import FormBuilderControlProperties from "./sidebar/FormBuilderControlProperties.vue";
import FormBuilderSectionProperties from "./sidebar/FormBuilderSectionProperties.vue";
import FormBuilderColumnProperties from "./sidebar/FormBuilderColumnProperties.vue";
import FormBuilderRowProperties from "./sidebar/FormBuilderRowProperties.vue";
import FormBuilderFormConfiguration from "./sidebar/FormBuilderFormConfiguration.vue";
import FormBuilderTabProperties from "./sidebar/FormBuilderTabProperties.vue";

interface Props {
  showSidebar: boolean;
  selectedControl: Control | null;
  selectedSection: string | null;
  selectedColumn: {sectionId: string; columnIndex: number} | null;
  selectedRow: {sectionId: string; rowIndex: number} | null;
  selectedTab: number | null;
  tabs: Array<{ label: string; description?: string; sections: any[] }>;
  formName: string;
  formDescription: string;
  formId: string;
  isPublished: boolean;
  formLayout: string;
  fieldSearchQuery: string;
  filteredFieldTypes: Array<{ type: string; label: string }>;
}

const props = defineProps<Props>();

// Helper function to get tab by index
function getTabByIndex(index: number) {
  return props.tabs[index] || null;
}

defineEmits<{
  'close-sidebar': [];
  'update-control': [control: Control];
  'delete-control': [id: string];
  'delete-section': [sectionId: string];
  'delete-column': [sectionId: string, columnIndex: number];
  'delete-row': [sectionId: string, rowIndex: number];
  'update-tab-name': [index: number, name: string];
  'update-tab-description': [index: number, description: string];
  'duplicate-tab': [index: number];
  'delete-tab': [index: number];
  'update:form-name': [value: string];
  'update:form-description': [value: string];
  'update:form-id': [value: string];
  'update:is-published': [value: boolean];
  'update:form-layout': [value: string];
  'update:field-search-query': [value: string];
  'export-form': [];
  'handle-file-import': [event: Event];
  'open-formula-preview': [];
  'copy-to-clipboard': [];
  'get-formatted-json': [];
  'add-control': [type: string];
  'get-section-by-id': [id: string];
  'get-icon-for-field-type': [type: string];
  'get-field-type-description': [type: string];
}>();
</script>
