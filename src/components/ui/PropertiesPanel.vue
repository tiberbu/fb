<template>
  <div class="properties-panel p-4">
    <h3 class="text-lg font-medium text-gray-800 mb-4">
      {{ isSection ? 'Section Properties 1' : 'Field Properties' }}
    </h3>
    
    <!-- Section Properties -->
    <template v-if="isSection && store.form.selectedField">
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Section Title</label>
        <input 
          type="text" 
          v-model="store.form.selectedField.label" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
      </div>
      
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Description</label>
        <textarea 
          v-model="store.form.selectedField.description" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          rows="3"
        ></textarea>
      </div>
      
      <div class="mb-4">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="collapsible-toggle" 
            v-model="store.form.selectedField.collapsible" 
            class="mr-2"
          >
          <label for="collapsible-toggle" class="text-sm text-gray-600">Collapsible Section</label>
        </div>
      </div>
      
      <!-- Delete Section Button -->
      <div class="flex justify-between mt-6">
        <button 
          @click="deleteSection" 
          class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
        >
          Delete Section
        </button>
      </div>
    </template>
    
    <!-- Field Properties -->
    <template v-else-if="control">
      <!-- Common Properties -->
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Label</label>
        <input 
          type="text" 
          v-model="control.label" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
      </div>
      
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Name</label>
        <input 
          type="text" 
          v-model="control.name" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
      </div>
      
      <!-- Placeholder (for text-like fields) -->
      <div v-if="['text', 'textarea', 'number', 'date', 'link'].includes(control.type)" class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Placeholder</label>
        <input 
          type="text" 
          v-model="control.placeholder" 
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
      </div>
      
      <!-- Options (for select fields) -->
      <div v-if="control.type === 'select'" class="mb-4">
        <label class="block text-sm text-gray-600 mb-1">Options</label>
        <div v-for="(option, index) in control.options" :key="index" class="flex mb-2">
          <input 
            type="text" 
            v-model="option.label" 
            placeholder="Label"
            class="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm"
          >
          <input 
            type="text" 
            v-model="option.value" 
            placeholder="Value"
            class="flex-1 border border-gray-300 border-l-0 px-3 py-2 text-sm"
          >
          <button 
            @click="removeOption(index)" 
            class="bg-red-50 text-red-500 px-2 rounded-r border border-l-0 border-gray-300"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <button 
          @click="addOption" 
          class="w-full py-1 bg-gray-50 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-100"
        >
          <i class="fas fa-plus mr-1"></i> Add Option
        </button>
      </div>
      
      <!-- Required toggle -->
      <div class="mb-4">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="required-toggle" 
            v-model="control.required" 
            class="mr-2"
          >
          <label for="required-toggle" class="text-sm text-gray-600">Required Field</label>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex justify-between mt-6">
        <button 
          @click="$emit('delete', control.id)"
          class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
        >
          Delete Field
        </button>
        <button 
          @click="$emit('update', control)" 
          class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          Update Field
        </button>
      </div>
    </template>
    
    <div v-else class="text-center py-6 text-gray-500">
      Select a field to edit its properties
    </div>
  </div>
</template>

<script setup lang="ts">
import { Control } from '../../types';
import { computed } from 'vue';
import { useFormBuilderStore } from '../../stores/form-builder-store';
import { confirmDialog } from '../../utils/form-builder-utils';

const props = defineProps({
  control: {
    type: Object as () => Control,
    required: true
  }
});

const emit = defineEmits(['update', 'delete']);
const store = useFormBuilderStore();

// Check if the selected field is a section
const isSection = computed(() => {
  return store.form.selectedField?.fieldtype === 'Section Break' || 
         store.form.selectedField?.type === 'Section Break';
});

function addOption() {
  if (props.control.options) {
    const newIndex = props.control.options.length + 1;
    props.control.options.push({
      label: `Option ${newIndex}`,
      value: `option_${newIndex}`
    });
  }
}

function removeOption(index: number) {
  if (props.control.options) {
    props.control.options.splice(index, 1);
  }
}

function deleteSection() {
  // Check if a section is selected
  const currentField = store.form.selectedField;
  if (!currentField || currentField.fieldtype !== 'Section Break') return;
  
  // Check if it's a standard field in customize form mode
  if (store.isCustomizeForm && currentField.isCustomField === 0) {
    alert("Cannot delete standard field. You can hide it if you want");
    return;
  }
  
  confirmDialog(
    "Delete Section",
    `Are you sure you want to delete the section "${currentField.label || 'Untitled Section'}"?`,
    () => {
      // Find and delete the section
      const currentTab = store.currentTab;
      if (!currentTab) return;
      
      const sectionIndex = currentTab.sections.findIndex(section => 
        section.df.name === currentField.name
      );
      
      if (sectionIndex > -1) {
        // Check if section has fields
        const hasFields = currentTab.sections[sectionIndex].columns.some(column => 
          column.fields && column.fields.length > 0
        );
        
        if (hasFields) {
          // If section has fields, ask if they should be moved to previous section
          confirmDialog(
            "Section Contains Fields",
            "This section contains fields. Would you like to move them to the previous section?",
            () => {
              // Move fields to previous section
              if (sectionIndex > 0) {
                const prevSection = currentTab.sections[sectionIndex - 1];
                const currentSection = currentTab.sections[sectionIndex];
                
                // Move columns to previous section
                prevSection.columns = [...prevSection.columns, ...currentSection.columns];
              }
              
              // Then delete the section
              currentTab.sections.splice(sectionIndex, 1);
              store.form.selectedField = null;
            },
            "Move Fields",
            () => {
              // Just delete section and its fields
              currentTab.sections.splice(sectionIndex, 1);
              store.form.selectedField = null;
            },
            "Delete Everything"
          );
        } else {
          // If section is empty, just delete it
          currentTab.sections.splice(sectionIndex, 1);
          store.form.selectedField = null;
        }
      }
    },
    "Delete"
  );
}

function deleteField() {
  // Find the field in the current tab's sections
  const currentField = store.form.selectedField;
  if (!currentField) return;
  
  if (store.isCustomizeForm && currentField.isCustomField === 0) {
    alert("Cannot delete standard field. You can hide it if you want");
    return;
  }
  
  confirmDialog(
    "Delete Field",
    `Are you sure you want to delete the field "${currentField.label || currentField.name}"?`,
    () => {
      // Find the field in the form structure and remove it
      const currentTab = store.currentTab;
      if (!currentTab) return;
      
      // Search through all sections and columns to find the field
      for (const section of currentTab.sections) {
        for (const column of section.columns) {
          const fieldIndex = column.fields.findIndex(field => field.df.name === currentField.name);
          if (fieldIndex > -1) {
            // Remove the field from column
            column.fields.splice(fieldIndex, 1);
            // Clear selected field
            store.form.selectedField = null;
            return;
          }
        }
      }
    },
    "Delete"
  );
}
</script>

<style>
.properties-panel {
  background-color: white;
  border-left: 1px solid #e5e7eb;
  height: 100%;
  overflow: auto;
}
</style>