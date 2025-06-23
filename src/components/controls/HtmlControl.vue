<template>
  <div class="field-wrapper">
    <label 
      v-if="df.label" 
      class="field-label"
    >
      {{ df.label }}
    </label>
    <div 
      class="html-content"
      v-html="df.defaultValue || df.placeholder || '<p>HTML content goes here</p>'"
    />
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

.html-content {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  font-size: 0.875rem;
  line-height: 1.5;
}

.html-content :deep(h1),
.html-content :deep(h2),
.html-content :deep(h3),
.html-content :deep(h4),
.html-content :deep(h5),
.html-content :deep(h6) {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.html-content :deep(p) {
  margin-bottom: 0.5rem;
}

.html-content :deep(ul),
.html-content :deep(ol) {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
}

.html-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.html-content :deep(strong) {
  font-weight: 600;
}

.html-content :deep(em) {
  font-style: italic;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
