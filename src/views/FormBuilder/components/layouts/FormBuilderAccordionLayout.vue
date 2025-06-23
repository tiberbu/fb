<template>
  <div class="form-accordion">
    <div class="accordion-header">
      <button
        class="add-tab-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300"
        @click="$emit('add-tab')"
      >
        <i class="fas fa-plus text-xs mr-2" />
        Add Section Group
      </button>
    </div>
    
    <div class="accordion-container space-y-4">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="accordion-item"
      >
        <div 
          class="accordion-header-item"
          @click="$emit('toggle-accordion-tab', index)"
          @dblclick.stop="$emit('open-tab-properties', index)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg mr-3">
                <i 
                  class="fas fa-chevron-right transition-transform duration-300 text-blue-600"
                  :class="{ 'rotate-90': activeTab === index }"
                />
              </div>
              <div class="flex items-center">
                <i class="fas fa-folder text-blue-500 mr-2" />
                <span class="font-medium text-gray-800">{{ tab.label }}</span>
                <span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {{ tab.sections?.length || 0 }} sections
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex items-center text-xs text-gray-500">
                <i class="fas fa-clock mr-1" />
                <span>Updated recently</span>
              </div>
              <button 
                title="Edit section group"
                class="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                @click.stop="$emit('open-tab-properties', index)"
              >
                <i class="fas fa-cog" />
              </button>
            </div>
          </div>
        </div>
        
        <div 
          v-if="activeTab === index"
          class="accordion-content"
        >
          <div class="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <div class="flex items-center">
              <i class="fas fa-info-circle text-blue-600 mr-2" />
              <span class="text-blue-800 font-medium">{{ tab.label }} Content</span>
            </div>
            <p class="text-blue-700 text-sm mt-1">
              Configure the sections and fields for this part of your form.
            </p>
          </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import TabSections from "../../../../components/TabSections.vue";

interface Props {
  tabs: Array<{ label: string; sections: any[]; formulas?: any[] }>;
  activeTab: number;
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
  'add-tab': [];
  'toggle-accordion-tab': [index: number];
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
</script>
