<template>
  <div class="field-wrapper">
    <label 
      v-if="df.label" 
      class="field-label"
      :class="{ 'required': df.reqd }"
    >
      {{ df.label }}
    </label>
    <div class="color-input-container">
      <input
        :value="value"
        type="color"
        :required="df.reqd"
        :disabled="readOnly"
        class="color-input"
        @input="$emit('update:modelValue', $event.target.value)"
      >
      <input
        :value="value"
        type="text"
        :placeholder="df.placeholder || '#000000'"
        :required="df.reqd"
        :readonly="readOnly"
        :disabled="readOnly"
        class="color-text-input"
        @input="$emit('update:modelValue', $event.target.value)"
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
defineProps({
  df: {
    type: Object,
    required: true
  },
  value: {
    type: String,
    default: '#000000'
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
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

.color-input-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-input {
  width: 3rem;
  height: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  padding: 0;
}

.color-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-text-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out;
}

.color-text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.color-text-input:disabled,
.color-text-input:read-only {
  background-color: #f9fafb;
  color: #6b7280;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
