<template>
  <div class="tab-properties">
    <div class="properties-header">
      <div class="flex items-center mb-4">
        <div class="bg-blue-100 p-2 rounded-lg mr-3">
          <i class="fas fa-folder text-blue-600" />
        </div>
        <div>
          <h3 class="font-medium text-gray-700">
            Tab Properties
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            Configure this tab's settings
          </p>
        </div>
      </div>
    </div>

    <div class="properties-content space-y-4">
      <!-- Tab Name -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          Tab Name
        </label>
        <input
          v-model="tabName"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter tab name"
          @blur="updateTabName"
          @keyup.enter="updateTabName"
        >
        <p class="text-xs text-gray-500 mt-1">
          This name will appear on the tab header
        </p>
      </div>

      <!-- Tab Description -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          Description (Optional)
        </label>
        <textarea
          v-model="tabDescription"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          placeholder="Describe what this tab contains"
          @blur="updateTabDescription"
        />
      </div>

      <!-- Tab Statistics -->
      <div class="bg-gray-50 p-3 rounded-lg">
        <h4 class="font-medium text-gray-700 mb-2">
          Tab Information
        </h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Sections:</span>
            <span class="font-medium ml-1">{{ tab?.sections?.length || 0 }}</span>
          </div>
          <div>
            <span class="text-gray-500">Fields:</span>
            <span class="font-medium ml-1">{{ totalFields }}</span>
          </div>
        </div>
      </div>

      <!-- Tab Actions -->
      <div class="border-t pt-4 space-y-3">
        <h4 class="font-medium text-gray-700">
          Actions
        </h4>
        
        <!-- Duplicate Tab -->
        <button
          class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center transition-colors"
          @click="duplicateTab"
        >
          <i class="fas fa-copy mr-2" />
          Duplicate Tab
        </button>

        <!-- Delete Tab -->
        <button
          v-if="!isLastTab"
          class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center transition-colors"
          @click="confirmDeleteTab"
        >
          <i class="fas fa-trash-alt mr-2" />
          Delete Tab
        </button>
        
        <div
          v-else
          class="text-xs text-gray-500 text-center py-2"
        >
          Cannot delete the last remaining tab
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showDeleteConfirm = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        @click.stop
      >
        <div class="flex items-center mb-4">
          <div class="bg-red-100 p-2 rounded-full mr-3">
            <i class="fas fa-exclamation-triangle text-red-600" />
          </div>
          <h3 class="font-medium text-gray-900">
            Delete Tab
          </h3>
        </div>
        
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete the tab "{{ tab?.label }}"? This will permanently remove all sections and fields within this tab.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            @click="deleteTab"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Tab {
  label: string;
  description?: string;
  sections: any[];
}

const props = defineProps<{
  tab: Tab | null;
  tabIndex: number;
  totalTabs: number;
}>();

const emit = defineEmits<{
  'update-tab-name': [index: number, name: string];
  'update-tab-description': [index: number, description: string];
  'duplicate-tab': [index: number];
  'delete-tab': [index: number];
}>();

const tabName = ref('');
const tabDescription = ref('');
const showDeleteConfirm = ref(false);

// Computed properties
const isLastTab = computed(() => props.totalTabs <= 1);

const totalFields = computed(() => {
  if (!props.tab?.sections) return 0;
  return props.tab.sections.reduce((total, section) => {
    if (section.rows) {
      return total + section.rows.reduce((rowTotal: number, row: any) => {
        if (row.columns) {
          return rowTotal + row.columns.reduce((colTotal: number, col: any) => {
            return colTotal + (col.fields?.length || 0);
          }, 0);
        }
        return rowTotal;
      }, 0);
    }
    return total;
  }, 0);
});

// Watch for tab changes
watch(() => props.tab, (newTab) => {
  if (newTab) {
    tabName.value = newTab.label || '';
    tabDescription.value = newTab.description || '';
  }
}, { immediate: true });

// Methods
function updateTabName() {
  if (tabName.value.trim() && tabName.value !== props.tab?.label) {
    emit('update-tab-name', props.tabIndex, tabName.value.trim());
  }
}

function updateTabDescription() {
  emit('update-tab-description', props.tabIndex, tabDescription.value);
}

function duplicateTab() {
  emit('duplicate-tab', props.tabIndex);
}

function confirmDeleteTab() {
  showDeleteConfirm.value = true;
}

function deleteTab() {
  emit('delete-tab', props.tabIndex);
  showDeleteConfirm.value = false;
}
</script>

<style scoped>
/* Component-specific styles */
.tab-properties {
  padding: 1rem;
}

.properties-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
</style>
