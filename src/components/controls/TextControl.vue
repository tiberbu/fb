<template>
  <div class="control frappe-control">
    <div class="control-label" :class="{ reqd: df.reqd }">{{ df.label || '' }}</div>
    <textarea
      class="form-control"
      :value="value"
      :disabled="readOnly || df.readOnly"
      :placeholder="df.placeholder || ''"
      :rows="df.rows || 3"
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
.form-control {
  min-height: 80px;
}
</style>
