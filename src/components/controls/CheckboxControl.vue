<template>
  <div class="field-wrapper">
    <div class="checkbox-wrapper">
      <input
        :id="df.fieldname"
        :checked="value"
        type="checkbox"
        :required="df.reqd"
        :disabled="readOnly"
        class="checkbox-input"
        @change="$emit('update:modelValue', $event.target.checked)"
      >
      <label 
        :for="df.fieldname"
        class="checkbox-label"
        :class="{ 'required': df.reqd }"
      >
        {{ df.label }}
      </label>
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
    type: Boolean,
    default: false
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

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  accent-color: #3b82f6;
}

.checkbox-input:disabled {
  opacity: 0.5;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label.required::after {
  content: " *";
  color: #dc2626;
}

.checkbox-input:disabled + .checkbox-label {
  color: #6b7280;
  cursor: not-allowed;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-left: 1.5rem;
}
</style>