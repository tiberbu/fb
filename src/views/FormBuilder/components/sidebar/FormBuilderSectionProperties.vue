<template>
  <div class="section-properties">
    <h3 class="font-medium text-gray-700 mb-3">
      Section Properties
    </h3>
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        Section: "{{ sectionTitle || 'Untitled Section' }}"
      </p>
    </div>
    <div class="mb-4">
      <button
        class="delete-section-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        @click="$emit('delete-section', sectionId)"
      >
        <i class="fas fa-trash-alt mr-2" />Delete Section
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  sectionId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'delete-section': [sectionId: string];
  'get-section-by-id': [id: string];
}>();

// Get section title (this would need to be connected to the actual section data)
const sectionTitle = computed(() => {
  // This would need to be implemented to get the actual section title
  // For now, return a placeholder
  return 'Section Title';
});
</script>
