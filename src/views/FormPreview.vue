<template>
  <div class="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-semibold">{{ formMetadata.formName || 'Form Preview' }}</h2>
        <p v-if="formMetadata.formDescription" class="text-gray-600 mt-1">
          {{ formMetadata.formDescription }}
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="importForm"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-file-import mr-1" /> Import
        </button>
        <button
          @click="$emit('back')"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back to Editor
        </button>
      </div>
    </div>
    
    <div v-if="!hasFormContent" class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <i class="fas fa-file-import text-4xl text-gray-400 mb-3" />
      <p class="text-gray-500">No form loaded. Please import a form JSON file.</p>
    </div>
    
    <form v-else @submit.prevent="submitForm" class="space-y-6">
      <div v-for="(tab, tabIndex) in formData.tabs" :key="tabIndex">
        <div class="mb-6">
          <h3 class="text-xl font-medium border-b pb-2 mb-4">{{ tab.label }}</h3>
          
          <div v-for="(section, sectionIndex) in tab.sections" :key="section.id" class="mb-8">
            <div class="flex items-center mb-3">
              <h4 class="font-medium text-lg">{{ section.title || 'Untitled Section' }}</h4>
            </div>
            
            <div v-for="(row, rowIndex) in section.rows" :key="row.id" class="mb-4">
              <div class="flex gap-4">
                <div 
                  v-for="(column, colIndex) in row.columns" 
                  :key="colIndex"
                  :class="[
                    'flex-1',
                    column.fields && column.fields.length === 0 ? 'hidden' : ''
                  ]"
                >
                  <div v-for="field in column.fields" :key="field.id" class="mb-4">
                    <component 
                      :is="getControlComponent(field.type)"
                      :control="field"
                      v-model="formValues[field.name]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pt-4">
        <button
          type="submit"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { useFormStore } from '../stores/form';

// Import control components
import TextControl from '../components/controls/TextControl.vue';
import NumberControl from '../components/controls/NumberControl.vue';
import SelectControl from '../components/controls/SelectControl.vue';
import CheckboxControl from '../components/controls/CheckboxControl.vue';
import DateControl from '../components/controls/DateControl.vue';

// Define the form data structure
interface FormMetadata {
  formName: string;
  formDescription: string;
  formId: string;
  isPublished: boolean;
  dateCreated: string;
  lastUpdated: string;
}

interface FormStructure {
  metadata: FormMetadata;
  tabs: Array<{
    label: string;
    sections: Array<any>;
  }>;
}

const router = useRouter();
const formStore = useFormStore();

const formValues = ref<Record<string, any>>({});
const props = defineProps<{ formData?: any }>();
const emit = defineEmits(['back']);

// Use passed formData if available, otherwise fallback to localStorage
const formData = ref(props.formData || { 
  metadata: {
    formName: '',
    formDescription: '',
    formId: '',
    isPublished: false,
    dateCreated: '',
    lastUpdated: ''
  }, 
  tabs: [] 
});
const formMetadata = computed(() => formData.value.metadata || {});
const hasFormContent = computed(() => formData.value?.tabs?.length > 0);
const fileInput = ref<HTMLInputElement | null>(null);

const getControlComponent = (type: string) => {
  const components = {
    text: TextControl,
    textarea: TextControl,
    number: NumberControl,
    select: SelectControl,
    check: CheckboxControl,
    checkbox: CheckboxControl,
    date: DateControl,
    file: TextControl,
    link: TextControl
  };
  
  return components[type as keyof typeof components] || TextControl;
};

const goBack = () => {
  router.push('/');
};

const submitForm = () => {
  // Form submission logic
  alert('Form submitted with values: ' + JSON.stringify(formValues.value));
};

const importForm = () => {
  // Create a hidden file input element
  if (!fileInput.value) {
    fileInput.value = document.createElement('input');
    fileInput.value.type = 'file';
    fileInput.value.accept = 'application/json';
    
    fileInput.value.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            formData.value = JSON.parse(result);
            localStorage.setItem('savedFormStructure', result);
            initializeFormValues();
          } catch (error) {
            // Handle error without console
            alert('Invalid form file format');
          }
        };
        
        reader.readAsText(file);
      }
    });
  }
  
  // Trigger the file input
  fileInput.value.click();
};

function initializeFormValues() {
  formValues.value = {};
  
  // Flatten all fields from all tabs, sections, rows, and columns
  formData.value.tabs.forEach(tab => {
    tab.sections.forEach(section => {
      section.rows.forEach((row: any) => {
        row.columns.forEach((column: any) => {
          if (column.control) {
            formValues.value[column.control.id] = column.control.defaultValue || '';
          }
        });
      });
    });
  });
}

onMounted(() => {
  if (!props.formData) {
    const savedForm = localStorage.getItem('savedFormStructure');
    if (savedForm) {
      try {
        formData.value = JSON.parse(savedForm);
        initializeFormValues();
      } catch (error) {
        alert('Error loading saved form data');
      }
    }
  } else {
    initializeFormValues();
  }
});
</script>
