<template>
  <div class="divider-wrapper">
    <div 
      v-if="df.label" 
      class="divider-label"
    >
      {{ df.label }}
    </div>
    <hr class="divider-line">
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
.divider-wrapper {
  margin: 1.5rem 0;
}

.divider-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  margin-bottom: 0.5rem;
}

.divider-line {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #d1d5db, transparent);
  margin: 0;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  margin-top: 0.5rem;
}
</style>
