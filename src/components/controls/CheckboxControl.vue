<template>
  <div class="checkbox-control">
    <label>
      <input type="checkbox" v-model="isChecked" />
      {{ label }}
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'CheckboxControl',
  props: {
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const isChecked = ref(props.modelValue);

    const updateValue = () => {
      emit('update:modelValue', isChecked.value);
    };

    return {
      isChecked,
      updateValue
    };
  },
  watch: {
    modelValue(newValue) {
      this.isChecked = newValue;
    }
  }
});
</script>

<style scoped>
.checkbox-control {
  display: flex;
  align-items: center;
}
</style>