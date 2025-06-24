<template>
  <div class="form-sidebar-layout">
    <div class="form-builder-sidebar-nav">
      <div class="form-builder-sidebar-header">
        <button
          class="add-tab-button w-full text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300"
          @click="$emit('add-tab')"
        >
          <i class="fas fa-plus text-xs mr-2" />
          Add Page
        </button>
      </div>
      
      <nav class="sidebar-menu">
        <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Form Pages
        </div>
        <div 
          v-for="(tab, index) in tabs" 
          :key="index"
          :class="[
            'sidebar-menu-item',
            activeTab === index ? 'active' : ''
          ]"
          @click="$emit('update:active-tab', index)"
          @dblclick.stop="$emit('open-tab-properties', index)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3">
                <i class="fas fa-file-alt text-gray-600 text-sm" />
              </div>
              <div>
                <span class="font-medium">{{ tab.label }}</span>
                <div class="text-xs text-gray-500 mt-1">
                  {{ tab.sections?.length || 0 }} sections
                </div>
              </div>
            </div>
            <button 
              title="Edit page"
              class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-600 p-2 rounded transition-all duration-200"
              @click.stop="$emit('open-tab-properties', index)"
            >
              <i class="fas fa-cog text-xs" />
            </button>
          </div>
        </div>
      </nav>
      
      <div class="px-4 py-4 border-t border-gray-200 mt-auto">
        <div class="bg-blue-50 p-3 rounded-lg">
          <div class="flex items-center text-blue-700 text-sm">
            <i class="fas fa-lightbulb mr-2" />
            <span class="font-medium">Tip</span>
          </div>
          <p class="text-blue-600 text-xs mt-1">
            Click on a page to edit its content, or use the settings icon for page options.
          </p>
        </div>
      </div>
    </div>
    
    <div class="form-builder-sidebar-content">
      <div class="form-builder-sidebar-content-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg mr-3">
              <i class="fas fa-edit text-blue-600" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-800">
                {{ tabs[activeTab]?.label || 'Page Content' }}
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                Design and configure the content for this page
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Page {{ activeTab + 1 }} of {{ tabs.length }}
            </div>
          </div>
        </div>
      </div>
      <div class="tab-sections-container">
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
          @select-row="(sectionId, rowIndex) => $emit('select-row', { sectionId, rowIndex })"
          @delete-row="(sectionId, rowIndex) => $emit('delete-row', { sectionId, rowIndex })"
          @select-column="(sectionId, columnIndex) => $emit('select-column', { sectionId, columnIndex })"
          @edit-control="$emit('edit-control', $event)"
          @delete-control="$emit('delete-control', $event)"
          @open-field-selector="(section, rowIndex, colIndex) => $emit('open-field-selector', { section, rowIndex, colIndex })"
          @add-field-to-column="(section, rowIndex, colIndex, type) => $emit('add-field-to-column', { section, rowIndex, columnIndex: colIndex, type })"
          @close-field-selector="$emit('close-field-selector')"
          @add-column-to-row="(section, rowIndex) => $emit('add-column-to-row', { section, rowIndex })"
          @add-row-to-section="$emit('add-row-to-section', $event)"
          @update-sections="$emit('update-sections', $event)"
          @update-column-fields="(sectionId, rowIndex, columnIndex, fields) => $emit('update-column-fields', { sectionId, rowIndex, columnIndex, fields })"
        />
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
  'update:active-tab': [value: number];
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
</script>
