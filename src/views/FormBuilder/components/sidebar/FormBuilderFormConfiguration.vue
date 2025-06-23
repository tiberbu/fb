<template>
  <div class="form-configuration">
    <h3 class="font-medium text-gray-700 mb-3">
      Form Configuration
    </h3>
    
    <!-- General Settings Accordion -->
    <AccordionSection title="General Settings">
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Form Name</label>
        <input
          :value="formName"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Enter form name"
          @input="$emit('update:form-name', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Form Description</label>
        <textarea
          :value="formDescription"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          rows="3"
          placeholder="Describe the purpose of this form"
          @input="$emit('update:form-description', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Form ID</label>
        <input
          :value="formId"
          type="text"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="unique-form-id"
          @input="$emit('update:form-id', ($event.target as HTMLInputElement).value)"
        >
      </div>
      
      <div class="mb-4">
        <div class="flex items-center">
          <input
            id="isPublished"
            :checked="isPublished"
            type="checkbox"
            class="mr-2"
            @change="$emit('update:is-published', ($event.target as HTMLInputElement).checked)"
          >
          <label
            for="isPublished"
            class="text-sm text-gray-600"
          >Form is published</label>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Layout Type</label>
        <select
          :value="formLayout"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          @change="$emit('update:form-layout', ($event.target as HTMLSelectElement).value)"
        >
          <option value="tabs">
            Tabs (Default)
          </option>
          <option value="accordion">
            Accordion
          </option>
          <option value="sidebar">
            Sidebar Navigation
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          Choose how sections are displayed in the form
        </p>
      </div>
    </AccordionSection>
    
    <!-- Export & Import Accordion -->
    <AccordionSection title="Export & Import">
      <div class="mb-4">
        <button
          class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
          @click="$emit('export-form')"
        >
          <i class="fas fa-file-export mr-2" />
          Export Form
        </button>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-2">Import Form</label>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          @change="$emit('handle-file-import', $event)"
        >
        <p class="text-xs text-gray-500 mt-1">
          Import a previously exported form configuration
        </p>
      </div>
    </AccordionSection>
    
    <!-- Form Formulas Accordion -->
    <FormBuilderFormulasSection
      @open-formula-preview="$emit('open-formula-preview')"
    />
    
    <!-- Form JSON Accordion -->
    <AccordionSection title="Form JSON">
      <div class="mb-4">
        <div class="flex justify-end mb-2">
          <button 
            class="text-xs text-blue-600 hover:text-blue-800"
            @click="$emit('copy-to-clipboard')"
          >
            <i class="fas fa-copy mr-1" />
            Copy to clipboard
          </button>
        </div>
        <div class="json-viewer">
          <pre class="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-80">{{ formattedJson }}</pre>
        </div>
      </div>
    </AccordionSection>
    
    <!-- Field Picker Accordion -->
    <AccordionSection title="Add New Field">
      <div class="mb-3">
        <input
          :value="fieldSearchQuery"
          type="text"
          placeholder="Search field types..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="$emit('update:field-search-query', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        <button
          v-for="fieldType in filteredFieldTypes"
          :key="fieldType.type"
          class="field-type-button flex items-center p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-left text-sm transition-colors"
          @click="$emit('add-control', fieldType.type)"
        >
          <div class="field-type-icon mr-3 text-gray-500 w-5 text-center">
            <i 
              class="fas" 
              :class="getIconForFieldType(fieldType.type)" 
            />
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900">
              {{ fieldType.label }}
            </div>
            <div class="text-xs text-gray-500">
              {{ getFieldTypeDescription(fieldType.type) }}
            </div>
          </div>
        </button>
      </div>
      <div 
        v-if="filteredFieldTypes.length === 0 && fieldSearchQuery" 
        class="text-center py-4 text-gray-500 text-sm"
      >
        No field types found matching "{{ fieldSearchQuery }}"
      </div>
    </AccordionSection>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AccordionSection from "../../../../components/ui/AccordionSection.vue";
import FormBuilderFormulasSection from "./FormBuilderFormulasSection.vue";

interface Props {
  formName: string;
  formDescription: string;
  formId: string;
  isPublished: boolean;
  formLayout: string;
  fieldSearchQuery: string;
  filteredFieldTypes: Array<{ type: string; label: string }>;
}

defineProps<Props>();

const emit = defineEmits<{
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
  'get-icon-for-field-type': [type: string];
  'get-field-type-description': [type: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

// Get formatted JSON (this would need to be passed down or computed)
const formattedJson = computed(() => {
  // This would need to emit to get the formatted JSON
  return '// JSON will be displayed here';
});

// Helper functions that would need to be passed down or imported
function getIconForFieldType(type: string): string {
  // This would need to emit to get the icon
  emit('get-icon-for-field-type', type);
  return 'fa-square'; // Default fallback
}

function getFieldTypeDescription(type: string): string {
  // This would need to emit to get the description
  emit('get-field-type-description', type);
  return 'Input field'; // Default fallback
}
</script>
