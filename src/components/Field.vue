<template>
  <div
    :class="[
      'field',
      selected ? 'selected' : hovered ? 'hovered' : '',
      field.df.fieldtype.toLowerCase().replace(' ', '-')
    ]"
    :title="field.df.fieldname"
    @click.stop="selectField"
    @mouseover.stop="hovered = true"
    @mouseout.stop="hovered = false"
  >
    <div class="field-content">
      <div class="field-label">
        <span v-if="field.df.label">{{ field.df.label }}</span>
        <span v-else class="placeholder">{{ 'Field Label' }}</span>
        <span v-if="field.df.reqd" class="required-field">*</span>
      </div>
      <div v-if="field.df.description" class="field-description">
        {{ field.df.description }}
      </div>
      <div class="field-control">
        <!-- This would contain the actual field control based on the field type -->
        <!-- For now, we'll just show a placeholder -->
        <div class="placeholder-control">
          {{ field.df.fieldtype || 'Text Field' }}
        </div>
      </div>
    </div>
    <div v-if="selected && !store.readOnly" class="field-actions">
      <button type="button" class="delete-field-btn" @click.stop="deleteField">
        <i class="fa fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFormBuilderStore } from "../stores/form-builder-store";
import { useMagicKeys, whenever } from "@vueuse/core";
import { confirmDialog } from "../utils/form-builder-utils";

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  field: {
    type: Object,
    required: true,
  },
});

const store = useFormBuilderStore();
const field = props.field;
const hovered = ref(false);
const selected = computed(() => store.selected(field.df.name));

// Keyboard shortcuts
const { Backspace, Delete } = useMagicKeys();
whenever(Backspace, (value) => {
  if (value && selected.value && store.notUsingInput) {
    deleteField();
  }
});

whenever(Delete, (value) => {
  if (value && selected.value && store.notUsingInput) {
    deleteField();
  }
});

function selectField() {
  store.form.selectedField = field.df;
}

function deleteField() {
  if (store.isCustomizeForm && !field.df.isCustomField) {
    alert("Cannot delete standard field. You can hide it if you want");
    return;
  }
  
  confirmDialog(
    "Delete Field",
    `Are you sure you want to delete the field "${field.df.label || field.df.fieldname}"?`,
    () => {
      const index = props.column.fields.indexOf(props.field);
      if (index > -1) {
        props.column.fields.splice(index, 1);
        store.form.selectedField = null;
      }
    },
    "Delete"
  );
}
</script>

<style lang="scss" scoped>
.field {
  position: relative;
  margin: 8px 0;
  padding: 10px;
  border-radius: var(--border-radius, 6px);
  border: 1px solid var(--border-color, #d1d8dd);
  background-color: var(--card-bg, #fff);
  box-shadow: var(--shadow-xs, 0 1px 3px rgba(0, 0, 0, 0.05));
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &.hovered {
    border-color: var(--gray-600, #4b5563);
  }
  
  &.selected {
    border-color: var(--primary-color, #4F46E5);
    box-shadow: 0 0 0 1px var(--primary-color, #4F46E5);
  }
  
  .field-content {
    .field-label {
      font-weight: 500;
      font-size: 0.875rem;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      
      .placeholder {
        color: var(--text-muted, #8d99a6);
        font-style: italic;
      }
      
      .required-field {
        color: var(--danger, #e53e3e);
        margin-left: 3px;
      }
    }
    
    .field-description {
      font-size: 0.75rem;
      color: var(--text-muted, #8d99a6);
      margin-bottom: 8px;
    }
    
    .field-control {
      .placeholder-control {
        height: 32px;
        background-color: var(--control-bg, #f4f5f6);
        border: 1px dashed var(--gray-400, #cbd5e1);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        color: var(--text-muted, #8d99a6);
      }
    }
  }
  
  .field-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    
    .delete-field-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted, #8d99a6);
      padding: 4px;
      border-radius: 4px;
      
      &:hover {
        color: var(--danger, #e53e3e);
        background-color: var(--control-bg, #f4f5f6);
      }
    }
  }
}
</style>
