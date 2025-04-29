<template>
  <div class="number-control">
    <label :for="fieldName">{{ label }}</label>
    <input
      type="number"
      :id="fieldName"
      v-model="value"
      :placeholder="placeholder"
      @input="updateValue"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'NumberControl',
  props: {
    label: {
      type: String as PropType<string>,
      required: true,
    },
    fieldName: {
      type: String as PropType<string>,
      required: true,
    },
    placeholder: {
      type: String as PropType<string>,
      default: '',
    },
    modelValue: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(newValue: number) {
        this.$emit('update:modelValue', newValue);
      },
    },
  },
  methods: {
    updateValue() {
      this.$emit('input', this.value);
    },
  },
});
</script>

<style scoped>
.number-control {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.number-control label {
  margin-bottom: 0.5rem;
}

.number-control input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>