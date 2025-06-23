<template>
  <div class="field-wrapper">
    <label 
      v-if="df.label" 
      class="field-label"
      :class="{ 'required': df.reqd }"
    >
      {{ df.label }}
      <span class="range-value">{{ value }}</span>
    </label>
    <input
      :value="value"
      type="range"
      :min="df.min || 0"
      :max="df.max || 100"
      :step="df.step || 1"
      :required="df.reqd"
      :disabled="readOnly"
      class="field-input range-input"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <div class="range-labels">
      <span class="range-min">{{ df.min || 0 }}</span>
      <span class="range-max">{{ df.max || 100 }}</span>
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
    type: [Number, String],
    default: 0
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.field-label.required::after {
  content: " *";
  color: #dc2626;
}

.range-value {
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.range-input {
  width: 100%;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: #d1d5db;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.range-input::-moz-range-thumb {
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.range-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
