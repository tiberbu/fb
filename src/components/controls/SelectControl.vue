<template>
  <div class="control frappe-control">
    <div class="control-label" :class="{ reqd: df.reqd }">{{ df.label || '' }}</div>
    <div class="select-input">
      <select
        class="form-control"
        :value="value"
        :disabled="readOnly || df.readOnly"
        @change="(event) => $emit('update:modelValue', event.target.value)"
      >
        <option value="">{{ df.placeholder || 'Select' }}</option>
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="select-icon">
        <i class="fa fa-chevron-down"></i>
      </div>
    </div>
    <div v-if="df.description" class="description" v-html="df.description"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

// Parse options from options string or array
const options = computed(() => {
  if (!props.df.options) return [];
  
  if (typeof props.df.options === 'string') {
    return props.df.options.split('\n')
      .filter(opt => opt.trim())
      .map(opt => ({
        label: opt.trim(),
        value: opt.trim()
      }));
  } else if (Array.isArray(props.df.options)) {
    return props.df.options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      } else {
        return { label: opt.label || opt.value, value: opt.value };
      }
    });
  }
  
  return [];
});

defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.select-input {
  position: relative;
  
  .select-icon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--text-muted, #9CA3AF);
    font-size: 12px;
  }
  
  select {
    appearance: none;
    padding-right: 24px;
  }
}
</style>
