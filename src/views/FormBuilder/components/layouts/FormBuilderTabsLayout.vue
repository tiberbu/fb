<template>
  <div class="form-tabs">
    <div class="form-tabs-header">
      <draggable
        v-model="tabsModel"
        group="tabs"
        item-key="label"
        :animation="150"
        handle=".tab-drag-handle"
        class="tabs-container"
        @end="$emit('handle-tab-order-changed')"
      >
        <template #item="{ element: tab, index }">
          <div
            :class="[
              'tab',
              activeTab === index ? 'active' : '',
              editingTabIndex === index ? 'editing' : '',
            ]"
            @click="$emit('update:active-tab', index)"
            @dblclick.stop="$emit('open-tab-properties', index)"
          >
            <div class="tab-drag-handle">
              <i class="fas fa-grip-lines text-gray-400 mr-2 text-xs" />
            </div>
            <span v-if="editingTabIndex !== index">{{ tab.label }}</span>
          </div>
        </template>
      </draggable>
      <div class="tab-actions-right">
        <button
          title="Add new tab"
          class="add-tab-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          @click="$emit('add-tab')"
        >
          New tab
        </button>
      </div>
    </div>

    <div class="tab-content">
      <TabSections 
        :current-tab-sections="currentTabSections"
        :selected-section="selectedSection"
        :selected-row="selectedRow"
        :selected-column="selectedColumn"
        :show-field-selector="showFieldSelector"
        :active-section="activeSection"
        :active-row-index="activeRowIndex"
        :active-column="activeColumn"
        @add-section="$emit('add-section')"
        @select-section="$emit('select-section', $event)"
        @open-section-menu="$emit('open-section-menu', $event)"
        @select-row="$emit('select-row', { sectionId: $event.sectionId, rowIndex: $event.rowIndex })"
        @delete-row="$emit('delete-row', { sectionId: $event.sectionId, rowIndex: $event.rowIndex })"
        @select-column="$emit('select-column', { sectionId: $event.sectionId, columnIndex: $event.columnIndex })"
        @edit-control="$emit('edit-control', $event)"
        @delete-control="$emit('delete-control', $event)"
        @open-field-selector="$emit('open-field-selector', { section: $event.section, rowIndex: $event.rowIndex, colIndex: $event.colIndex })"
        @add-field-to-column="$emit('add-field-to-column', { section: $event.section, rowIndex: $event.rowIndex, columnIndex: $event.columnIndex, type: $event.type })"
        @close-field-selector="$emit('close-field-selector')"
        @add-column-to-row="$emit('add-column-to-row', { section: $event.section, rowIndex: $event.rowIndex })"
        @add-row-to-section="$emit('add-row-to-section', $event)"
        @update-sections="$emit('update-sections', $event)"
        @update-column-fields="$emit('update-column-fields', { sectionId: $event.sectionId, rowIndex: $event.rowIndex, columnIndex: $event.columnIndex, fields: $event.fields })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";
import TabSections from "../../../../components/TabSections.vue";

interface Props {
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

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:active-tab': [value: number];
  'handle-tab-order-changed': [];
  'add-tab': [];
  'open-tab-properties': [index: number];
  'add-section': [];
  'select-section': [section: any];
  'open-section-menu': [section: any];
  'select-row': [event: {sectionId: string; rowIndex: number}];
  'delete-row': [event: {sectionId: string; rowIndex: number}];
  'select-column': [event: {sectionId: string; columnIndex: number}];
  'edit-control': [control: any];
  'delete-control': [id: string];
  'open-field-selector': [event: {section: any; rowIndex: number; colIndex: number}];
  'add-field-to-column': [event: {section: any; rowIndex: number; columnIndex: number; type?: string}];
  'close-field-selector': [];
  'add-column-to-row': [event: {section: any; rowIndex: number}];
  'add-row-to-section': [section: any];
  'update-sections': [sections: any[]];
  'update-column-fields': [event: {sectionId: string; rowIndex: number; columnIndex: number; fields: any[]}];
}>();

// Create a computed property for tabs to avoid mutation warning
const tabsModel = computed({
  get: () => props.tabs,
  set: (value) => {
    // We'll handle this through the emit
    emit('handle-tab-order-changed');
  }
});
</script>
