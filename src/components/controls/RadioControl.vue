<template>
  <div class="field-wrapper">
    <label 
      v-if="df.label" 
      class="field-label"
      :class="{ 'required': df.reqd }"
    >
      {{ df.label }}
    </label>
    <div class="radio-group">
      <div 
        v-for="(option, index) in df.options" 
        :key="index"
        class="radio-option"
      >
        <input
          :id="`${df.fieldname}_${index}`"
          :value="option.value"
          :checked="value === option.value"
          :name="df.fieldname"
          type="radio"
          :required="df.reqd"
          :disabled="readOnly"
          class="radio-input"
          @change="$emit('update:modelValue', option.value)"
        >
        <label 
          :for="`${df.fieldname}_${index}`"
          class="radio-label"
        >
          {{ option.label }}
        </label>
      </div>
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
    type: [String, Number],
    default: ''
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
  margin-bottom: 0.5rem;
}

.field-label.required::after {
  content: " *";
  color: #dc2626;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
}

.radio-input {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  accent-color: #3b82f6;
}

.radio-input:disabled {
  opacity: 0.5;
}

.radio-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.radio-input:disabled + .radio-label {
  color: #6b7280;
  cursor: not-allowed;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
