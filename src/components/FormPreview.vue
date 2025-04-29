<template>
  <div class="form-preview">
    <h2>Form Preview</h2>
    <form>
      <div v-for="(field, index) in formFields" :key="index">
        <component
          :is="field.type"
          v-bind="field.props"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'FormPreview',
  props: {
    formFields: {
      type: Array as PropType<Array<{ type: string; props: Record<string, any> }>>,
      required: true,
    },
  },
});
</script>

<style scoped>
.form-preview {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style>