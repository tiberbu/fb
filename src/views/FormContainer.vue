<template>
  <div class="form-container-wrapper flex flex-col min-h-screen">
    <!-- Top Header -->
    <div class="builder-nav-bar bg-gray-100 p-3 flex justify-between items-center  border-gray-300">
      <h1 class="text-xl font-semibold text-gray-800">
        {{ formName }}
      </h1>
      <button 
        class="toggle-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center"
        @click="toggleView"
      >
        <i 
          :class="[showPreview ? 'fas fa-edit' : 'fas fa-eye']" 
          class="mr-2" 
        /> 
        {{ showPreview ? 'Edit Form' : 'Preview Form' }}
      </button>
    </div>

    <div class="view-container mt-4">
      <!-- Show either FormBuilder or FormPreview based on state -->
      <div v-if="!showPreview">
        <FormBuilder 
          ref="formBuilderRef"
          @form-data-change="updateFormData" 
        />
      </div>
      <FormPreview 
        v-else-if="formPreviewData"
        :form-data="formPreviewData" 
        @back="toggleView" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import FormBuilder from './FormBuilder.vue';
import FormPreview from '../components/FormPreview.vue'; // Updated import path

// Define the form data structure types for better type checking
interface FormData {
  metadata: {
    formName: string;
    formDescription: string;
    formId: string;
    isPublished: boolean;
    formLayout: string;
    dateCreated: string;
    lastUpdated: string;
  };
  tabs: Array<{
    label: string;
    description?: string;
    sections: Array<any>;
  }>;
}

// Toggle state between builder and preview
const showPreview = ref(false);
const formPreviewData = ref<FormData | null>(null);
const formName = ref('New Form');
const formBuilderRef = ref<InstanceType<typeof FormBuilder> | null>(null);

// Update form name when data changes
watch(() => formPreviewData.value?.metadata?.formName, (newName) => {
  if (newName) {
    formName.value = newName;
  }
});

// Toggle between builder and preview views
async function toggleView() {
  if (!showPreview.value) {
    // When switching TO preview, ensure we have the latest form data
    // Always ensure we have the most recent data from localStorage
    const savedForm = localStorage.getItem('savedFormStructure');
    if (savedForm) {
      try {
        const parsedData = JSON.parse(savedForm);
        formPreviewData.value = parsedData;
      } catch (error) {
        // Handle error gracefully
        alert('Error loading form data');
        return; // Don't toggle if we can't load data
      }
    } else if (!formPreviewData.value) {
      alert('No form data available for preview');
      return;
    }
  }
  
  // Toggle the view state
  showPreview.value = !showPreview.value;
}

// Handle form data change from FormBuilder
function updateFormData(data: FormData) {
  // Ensure the data has the expected structure before passing to preview
  if (data && data.metadata && data.tabs) {
    formPreviewData.value = data;
    
    if (data.metadata.formName) {
      formName.value = data.metadata.formName;
    }
    
    // Save to localStorage as a backup
    localStorage.setItem('savedFormStructure', JSON.stringify(data));
  } else {
    // Log warning without using console
    alert('Received form data has unexpected structure');
  }
}

// On mount, check if there's saved form data to update the form name
onMounted(() => {
  const savedForm = localStorage.getItem('savedFormStructure');
  if (savedForm) {
    try {
      const formData = JSON.parse(savedForm);
      if (formData?.metadata?.formName) {
        formName.value = formData.metadata.formName;
      }
      formPreviewData.value = formData;
    } catch (error) {
      // Handle error without console statements
      alert('Error loading saved form data');
    }
  }
});
</script>

<style scoped>
.form-container-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.view-container {
  flex: 1;
}
</style>
