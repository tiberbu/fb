<!-- FieldControl.vue - Parent component for all field controls -->
<template>
  <component
    :is="getControlComponent()"
    :df="df"
    :value="value"
    :read-only="readOnly"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from 'vue';
import DataControl from './controls/DataControl.vue';
import TextControl from './controls/TextControl.vue';
import CheckControl from './controls/CheckControl.vue';
import SelectControl from './controls/SelectControl.vue';
import LinkControl from './controls/LinkControl.vue';
import AttachControl from './controls/AttachControl.vue';
import TableControl from './controls/TableControl.vue';
import ButtonControl from './controls/ButtonControl.vue';
import TextEditorControl from './controls/TextEditorControl.vue';
import CodeControl from './controls/CodeControl.vue';

const props = defineProps({
  df: {
    type: Object,
    required: true
  },
  value: {
    type: [String, Number, Boolean, Object, Array],
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

// Map of field types to control components
const fieldTypeMap = {
  'Data': DataControl,
  'Text': TextControl,
  'Text Editor': TextEditorControl,
  'Link': LinkControl,
  'Select': SelectControl,
  'Check': CheckControl,
  'Attach': AttachControl,
  'Attach Image': AttachControl,
  'Table': TableControl,
  'Button': ButtonControl,
  'Code': CodeControl,
  // Default control for other field types
  'default': DataControl
};

// Get the appropriate component for the field type
function getControlComponent() {
  return fieldTypeMap[props.df.fieldtype] || fieldTypeMap.default;
}
</script>
