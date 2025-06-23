<template>
  <div>
    <!-- Use the new componentized FormBuilder -->
    <FormBuilderMain @form-data-change="handleFormDataChange" />
  </div>
</template>

<script setup lang="ts">
import FormBuilderMain from './FormBuilder/FormBuilder.vue';

// Handle form data changes from the FormBuilder component
function handleFormDataChange(formData: any) {
  // You can handle the form data changes here if needed
  // This might be used to sync with external systems or perform additional processing
  if (formData) {
    // console.log('Form data changed:', formData);
  }
}
</script>

<style>
/* The styles are now in the componentized FormBuilder */
</style>
