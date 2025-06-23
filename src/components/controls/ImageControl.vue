<template>
  <div class="field-wrapper">
    <label 
      v-if="df.label" 
      class="field-label"
      :class="{ 'required': df.reqd }"
    >
      {{ df.label }}
    </label>
    <input
      :value="value"
      type="file"
      accept="image/*"
      :required="df.reqd"
      :disabled="readOnly"
      class="field-input"
      @change="handleFileChange"
    >
    <div 
      v-if="imagePreview" 
      class="image-preview"
    >
      <img 
        :src="imagePreview" 
        alt="Preview"
        class="preview-image"
      >
    </div>
    <div 
      v-if="df.description" 
      class="field-description"
    >
      {{ df.description }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);
const imagePreview = ref('');

const props = defineProps({
  df: {
    type: Object,
    required: true
  },
  value: {
    type: [String, File],
    default: ''
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    emit('update:modelValue', file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Watch for external value changes
watch(() => props.value, (newValue) => {
  if (typeof newValue === 'string' && newValue) {
    imagePreview.value = newValue;
  } else if (!newValue) {
    imagePreview.value = '';
  }
});
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.field-label.required::after {
  content: " *";
  color: #dc2626;
}

.field-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out;
  background-color: white;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
}

.image-preview {
  margin-top: 0.5rem;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
