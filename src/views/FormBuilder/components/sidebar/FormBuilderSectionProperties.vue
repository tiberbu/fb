<template>
  <div class="section-properties">
    <SectionPropertiesPanel
      :section="section"
      :available-fields="availableFields"
      @update="$emit('update-section', $event)"
      @delete="$emit('delete-section', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Section, Control } from "../../../../types";
import SectionPropertiesPanel from "../../../../components/ui/SectionPropertiesPanel.vue";

interface Props {
  sectionId: string;
  section?: Section;
  availableFields?: Control[];
}

const props = defineProps<Props>();

defineEmits<{
  'delete-section': [sectionId: string];
  'update-section': [section: Section];
  'get-section-by-id': [id: string];
}>();

// Create a default section if none provided
const section = computed(() => {
  if (props.section) {
    return props.section;
  }
  
  // Return a default section structure
  return {
    id: props.sectionId,
    title: 'Untitled Section',
    subtitle: '',
    description: '',
    collapsible: false,
    rows: [],
    columns: [],
    formulas: [],
    isHidden: false,
    cssClasses: '',
    padding: {
      top: '',
      right: '',
      bottom: '',
      left: ''
    },
    margin: {
      top: '',
      right: '',
      bottom: '',
      left: ''
    }
  } as Section;
});

const availableFields = computed(() => {
  return props.availableFields || [];
});
</script>
