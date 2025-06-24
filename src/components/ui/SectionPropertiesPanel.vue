<template>
  <div
    v-if="sectionCopy"
    class="section-properties-panel"
  >
    <div class="mb-4">
      <h3 class="font-medium text-gray-700 mb-3">
        Section Properties
      </h3>
      <div class="mb-2">
        <p class="text-sm text-gray-600">
          Section: "{{ sectionCopy.title || 'Untitled Section' }}"
        </p>
      </div>
    </div>

    <!-- Basic Properties Accordion -->
    <AccordionSection title="Basic Properties">
      <!-- Section Title -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Section Title</label>
        <input
          v-model="sectionCopy.title"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Enter section title"
        >
      </div>

      <!-- Section Subtitle -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Section Subtitle</label>
        <input
          v-model="sectionCopy.subtitle"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Enter section subtitle (optional)"
        >
      </div>

      <!-- Section Description -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Section Description</label>
        <textarea
          v-model="sectionCopy.description"
          rows="3"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Enter section description (optional)"
        />
      </div>

      <!-- Collapsible Option -->
      <div class="mb-4">
        <div class="flex items-center">
          <input
            id="collapsible"
            v-model="sectionCopy.collapsible"
            type="checkbox"
            class="mr-2"
          >
          <label
            for="collapsible"
            class="text-sm text-gray-600"
          >
            Section is collapsible
          </label>
        </div>
      </div>

      <!-- Visibility Controls -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-2">Display Options</label>
        
        <!-- Hide Title Option -->
        <div class="flex items-center mb-2">
          <input
            id="hideTitle"
            v-model="sectionCopy.hideTitle"
            type="checkbox"
            class="mr-2"
          >
          <label
            for="hideTitle"
            class="text-sm text-gray-600"
          >
            Hide section title
          </label>
        </div>

        <!-- Hide Subtitle Option -->
        <div class="flex items-center">
          <input
            id="hideSubtitle"
            v-model="sectionCopy.hideSubtitle"
            type="checkbox"
            class="mr-2"
          >
          <label
            for="hideSubtitle"
            class="text-sm text-gray-600"
          >
            Hide section subtitle
          </label>
        </div>
      </div>
    </AccordionSection>

    <!-- Enhanced Formula Settings Accordion -->
    <AccordionSection title="Section Formulas">
      <p class="text-xs text-gray-500 mb-4">
        Add formulas to control section behavior. Section formulas can control visibility based on field values.
      </p>
      
      <div class="formula-capabilities grid grid-cols-1 gap-2 mb-4">
        <div class="bg-amber-50 p-2 rounded border border-amber-100 text-xs">
          <div class="font-medium text-amber-700">
            Visibility
          </div>
          <div class="text-amber-600">
            Show/hide section based on field conditions
          </div>
        </div>
      </div>
      
      <FormulaManager
        title="Manage Section Formulas"
        :formulas="sectionCopy.formulas || []"
        :available-fields="availableFields"
        :allowed-types="['visibility']"
        @update:formulas="updateFormulas"
      />
      
      <!-- Formula Status Indicators -->
      <div
        v-if="hasFormulas"
        class="mt-4 p-3 bg-blue-50 rounded border border-blue-200"
      >
        <h4 class="text-sm font-medium text-blue-700 mb-2">
          Active Formulas:
        </h4>
        <div class="space-y-1">
          <div
            v-if="hasVisibilityFormula"
            class="text-xs text-blue-600 flex items-center"
          >
            <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <span>Visibility: Section will show/hide dynamically</span>
          </div>
        </div>
      </div>
    </AccordionSection>
    
    <!-- CSS Styling Accordion -->
    <AccordionSection title="CSS Styling">
      <!-- CSS Classes -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Custom CSS Classes</label>
        <input
          v-model="sectionCopy.cssClasses"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="e.g., custom-section highlight important"
        >
        <p class="text-xs text-gray-500 mt-1">
          Add space-separated CSS class names to apply custom styling
        </p>
      </div>
      
      <!-- Padding -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-2">Padding</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Top</label>
            <input
              v-model="sectionCopy.padding!.top"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Right</label>
            <input
              v-model="sectionCopy.padding!.right"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Bottom</label>
            <input
              v-model="sectionCopy.padding!.bottom"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Left</label>
            <input
              v-model="sectionCopy.padding!.left"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
        </div>
      </div>
      
      <!-- Margin -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-2">Margin</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Top</label>
            <input
              v-model="sectionCopy.margin!.top"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Right</label>
            <input
              v-model="sectionCopy.margin!.right"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Bottom</label>
            <input
              v-model="sectionCopy.margin!.bottom"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Left</label>
            <input
              v-model="sectionCopy.margin!.left"
              type="text"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="e.g., 8px, 1rem"
            >
          </div>
        </div>
      </div>
    </AccordionSection>

    <!-- Actions -->
    <template v-if="sectionCopy">
      <div class="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          class="update-section-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          @click="updateSection"
        >
          Update Section
        </button>
        <button
          class="delete-section-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          @click="deleteSection"
        >
          <i class="fas fa-trash-alt mr-2" />Delete Section
        </button>
      </div>
    </template>
    
    <div
      v-else
      class="text-center py-6 text-gray-500"
    >
      Select a section to edit its properties
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Section, Formula, Control } from '../../types';
import { confirmDialog } from '../../utils/form-builder-utils';
import FormulaManager from './FormulaManager.vue';
import AccordionSection from './AccordionSection.vue';

const props = defineProps({
  section: {
    type: Object as () => Section,
    required: true
  },
  availableFields: {
    type: Array as () => Control[],
    default: () => []
  }
});

const emit = defineEmits(['update', 'delete']);

// Create a local copy of the section to avoid mutating props directly
const sectionCopy = ref<Section | null>(null);

// Initialize sectionCopy from props
watch(() => props.section, (newSection) => {
  if (newSection) {
    sectionCopy.value = JSON.parse(JSON.stringify(newSection));
    
    // Initialize CSS styling properties if they don't exist
    if (sectionCopy.value) {
      if (!sectionCopy.value.padding) {
        sectionCopy.value.padding = {
          top: '',
          right: '',
          bottom: '',
          left: ''
        };
      }
      if (!sectionCopy.value.margin) {
        sectionCopy.value.margin = {
          top: '',
          right: '',
          bottom: '',
          left: ''
        };
      }
      if (!sectionCopy.value.cssClasses) {
        sectionCopy.value.cssClasses = '';
      }
      if (!sectionCopy.value.formulas) {
        sectionCopy.value.formulas = [];
      }
    }
  }
}, { immediate: true });

// Computed properties for formula indicators
const hasFormulas = computed(() => {
  if (!sectionCopy.value?.formulas) return false;
  return sectionCopy.value.formulas.length > 0 && sectionCopy.value.formulas.some(f => f.enabled);
});

const hasVisibilityFormula = computed(() => {
  if (!sectionCopy.value?.formulas) return false;
  return sectionCopy.value.formulas.some(f => f.type === 'visibility' && f.enabled);
});

// Update section formulas
function updateFormulas(formulas: Formula[]) {
  if (sectionCopy.value) {
    sectionCopy.value.formulas = formulas;
    
    // Update legacy formula properties for backward compatibility
    const visibilityFormula = formulas.find(f => f.type === 'visibility' && f.enabled);
    if (visibilityFormula) {
      sectionCopy.value.formula = visibilityFormula.expression;
      sectionCopy.value.formulaType = 'visibility';
      sectionCopy.value.dependsOn = visibilityFormula.dependsOn;
    } else {
      sectionCopy.value.formula = '';
      sectionCopy.value.formulaType = undefined;
      sectionCopy.value.dependsOn = [];
    }
  }
}

// Update the section
function updateSection() {
  if (sectionCopy.value) {
    emit('update', { ...sectionCopy.value });
  }
}

// Delete the section
function deleteSection() {
  if (sectionCopy.value) {
    confirmDialog(
      'Delete Section',
      'Are you sure you want to delete this section? This will also delete all fields within the section.',
      () => {
        if (sectionCopy.value) {
          emit('delete', sectionCopy.value.id);
        }
      },
      () => {
        // User cancelled - do nothing
      }
    );
  }
}
</script>

<style>
.section-properties-panel {
  background-color: white;
  height: 100%;
  overflow: auto;
}
</style>
