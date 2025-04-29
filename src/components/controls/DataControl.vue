<template>
  <div class="control frappe-control">
    <div class="control-label" :class="{ reqd: df.reqd }">{{ df.label || '' }}</div>
    <input
      class="form-control"
      type="text"
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
