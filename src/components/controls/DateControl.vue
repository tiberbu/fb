<template>
  <div class="control frappe-control">
    <div class="control-label" :class="{ reqd: df.reqd }">{{ df.label || '' }}</div>
    <input
      type="date"
      class="form-control date-input"
      :value="value"
      :disabled="readOnly || df.readOnly"
      :placeholder="df.placeholder || ''"
      @input="(event) => $emit('update:modelValue', event.target.value)"
    />
    <div v-if="df.description" class="description" v-html="df.description"></div>
  </div>
</template>

<script setup>
const props = defineProps({
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

<style lang="scss" scoped>
.control {
  margin-bottom: 1rem;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
  margin-bottom: 0.375rem;
  
  &.reqd:after {
    content: "*";
    color: #EF4444;
    margin-left: 0.25rem;
  }
}

.form-control {
  width: 100%;
  height: 38px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  background-color: #FFFFFF;
  font-size: 0.875rem;
  color: #1F2937;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    border-color: #3B82F6;
    outline: 0;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  
  &:disabled {
    background-color: #F3F4F6;
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &.date-input {
    color: #1F2937;
    padding-right: 0.5rem;
  }
}

.description {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #6B7280;
}
</style>