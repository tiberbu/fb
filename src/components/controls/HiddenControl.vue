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
      type="hidden"
      :name="df.fieldname"
    >
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
  margin-bottom: 0.5rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-style: italic;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
