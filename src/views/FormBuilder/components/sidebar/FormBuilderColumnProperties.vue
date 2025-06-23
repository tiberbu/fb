<template>
  <div class="column-properties">
    <h3 class="font-medium text-gray-700 mb-3">
      Column Properties
    </h3>
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        Column {{ selectedColumn.columnIndex + 1 }} in section "{{ sectionTitle || 'Untitled Section' }}"
      </p>
    </div>
    <div class="mb-4">
      <button
        class="delete-column-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        @click="$emit('delete-column', { sectionId: selectedColumn.sectionId, columnIndex: selectedColumn.columnIndex })"
      >
        <i class="fas fa-trash-alt mr-2" />Delete Column
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  selectedColumn: {sectionId: string; columnIndex: number};
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'delete-column': [event: {sectionId: string; columnIndex: number}];
  'get-section-by-id': [id: string];
}>();

// Get section title (this would need to be connected to the actual section data)
const sectionTitle = computed(() => {
  // This would need to be implemented to get the actual section title
  return 'Section Title';
});
</script>
