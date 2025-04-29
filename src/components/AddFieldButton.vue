<template>
  <div class="add-field-button" @click.stop="openFieldSelector">
    <div class="button-content">
      <i class="fa fa-plus"></i>
      <span>Add Field</span>
    </div>
  </div>
</template>

<script setup>
import { useFormBuilderStore } from "../stores/form-builder-store";
import { ref } from "vue";

const props = defineProps({
  column: {
    type: Object,
    default: null
  },
  field: {
    type: Object,
    default: null
  }
});

const store = useFormBuilderStore();

// In a real implementation, this would open a field selector dialog or menu
// For now, we'll just add a text input field as a placeholder
function openFieldSelector() {
  const newField = {
    df: store.getDf("Data", "", "New Field"),
    name: Math.random().toString(36).substring(2, 10)
  };
  
  if (props.column) {
    const index = props.field 
      ? props.column.fields.indexOf(props.field) + 1 
      : props.column.fields.length;
    props.column.fields.splice(index, 0, newField);
  }
  
  // Select the newly added field
  store.form.selectedField = newField.df;
}
</script>

<style lang="scss" scoped>
.add-field-button {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--border-radius, 6px);
  background-color: transparent;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--control-bg, #f4f5f6);
  }
  
  .button-content {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted, #8d99a6);
    
    i {
      font-size: 0.75rem;
    }
    
    span {
      font-size: 0.875rem;
    }
  }
}
</style>
