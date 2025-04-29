<template>
  <div class="date-control">
    <label :for="controlId">{{ label }}</label>
    <input
      type="date"
      :id="controlId"
      v-model="dateValue"
      @input="updateValue"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

export default defineComponent({
  name: 'DateControl',
  props: {
    modelValue: {
      type: String as PropType<string>,
      required: true,
    },
    label: {
      type: String as PropType<string>,
      required: true,
    },
    controlId: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const dateValue = ref(props.modelValue);

    watch(() => props.modelValue, (newValue) => {
      dateValue.value = newValue;
    });

    const updateValue = () => {
      emit('update:modelValue', dateValue.value);
    };

    return {
      dateValue,
      updateValue,
    };
  },
});
</script>

<style scoped>
.date-control {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.date-control label {
  margin-bottom: 0.5rem;
}
</style>