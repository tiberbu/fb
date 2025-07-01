<template>
  <div
    class="field"
    :class="getFieldClasses()"
    :style="getFieldStyles()"
    @click.stop="$emit('edit', control)"
  >
    <div class="field-header">
      <div class="field-label">
        {{ control.label }}
        <span v-if="control.required" class="text-red-500">*</span>
      </div>
      <div class="field-actions">
        <button
          class="text-gray-500 hover:text-gray-700 p-1 rounded"
          @click.stop="$emit('delete', control.id)"
        >
          <i class="fas fa-trash text-xs" />
        </button>
      </div>
    </div>

    <div class="field-preview">
      <FormControl
        :control="control"
        :model-value="null"
        :is-required="control.required"
        :is-read-only="true"
        :is-preview="true"
        :show-label="false"
        @save-field="$emit('save-field', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Control } from "../../types";
import FormControl from "../FormControl.vue";

const props = defineProps({
  control: {
    type: Object as () => Control,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

// Get CSS classes for the field
function getFieldClasses() {
  const classes = ["field"];

  // Add selected state
  if (props.selected) {
    classes.push("selected");
  }

  // Add custom CSS classes if specified
  if (props.control.cssClasses) {
    classes.push(
      ...props.control.cssClasses.split(" ").filter((cls) => cls.trim())
    );
  }

  return classes;
}

// Get inline styles for the field
function getFieldStyles() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles: any = {};

  // Apply padding styles
  if (props.control.padding) {
    if (props.control.padding.top)
      styles.paddingTop = props.control.padding.top;
    if (props.control.padding.right)
      styles.paddingRight = props.control.padding.right;
    if (props.control.padding.bottom)
      styles.paddingBottom = props.control.padding.bottom;
    if (props.control.padding.left)
      styles.paddingLeft = props.control.padding.left;
  }

  // Apply margin styles
  if (props.control.margin) {
    if (props.control.margin.top) styles.marginTop = props.control.margin.top;
    if (props.control.margin.right)
      styles.marginRight = props.control.margin.right;
    if (props.control.margin.bottom)
      styles.marginBottom = props.control.margin.bottom;
    if (props.control.margin.left)
      styles.marginLeft = props.control.margin.left;
  }

  return styles;
}

defineEmits(["edit", "delete", "save-field"]);
</script>

<style>
.field {
  border: 1px solid rgb(229 231 235);
  background-color: white;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
}

.field:hover {
  border-color: rgb(156 163 175);
}

.field.selected {
  border-color: rgb(59 130 246);
  box-shadow: 0 0 0 2px rgb(219 234 254);
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.field-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: rgb(55 65 81);
}

.field-preview {
  margin-bottom: 0.25rem;
}
</style>
