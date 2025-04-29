<template>
  <div class="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Form Preview</h2>
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
      >
        Back to Editor
      </button>
    </div>
    
    <form @submit.prevent="submitForm" class="space-y-6">
      <div v-for="control in sortedControls" :key="control.id" class="space-y-2">
        <component 
          :is="getControlComponent(control.type)"
          :control="control"
          v-model="formValues[control.name]"
        />
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFormStore } from '../stores/form';

// Import control components
import TextControl from '../components/controls/TextControl.vue';
import NumberControl from '../components/controls/NumberControl.vue';
import SelectControl from '../components/controls/SelectControl.vue';
import CheckboxControl from '../components/controls/CheckboxControl.vue';
import DateControl from '../components/controls/DateControl.vue';

const router = useRouter();
const formStore = useFormStore();

const formValues = ref<Record<string, any>>({});

const sortedControls = computed(() => {
  return [...formStore.controls].sort((a, b) => a.order - b.order);
});

const getControlComponent = (type: string) => {
  const components = {
    text: TextControl,
    number: NumberControl,
    select: SelectControl,
    checkbox: CheckboxControl,
    date: DateControl
  };
  
  return components[type as keyof typeof components] || TextControl;
};

const goBack = () => {
  router.push('/');
};

const submitForm = () => {
  console.log('Form submitted with values:', formValues.value);
  alert('Form submitted! Check console for data.');
};

onMounted(() => {
  // Initialize form values
  formStore.controls.forEach(control => {
    formValues.value[control.name] = null;
  });
});
</script>
