<!-- FieldControl.vue - Parent component for all field controls -->
<template>
  <div>
  
    <component
    :is="getControlComponent()"
    :df="df"
    :value="value"
    :read-only="readOnly"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
  </div>
  
</template>

<script setup>
import { computed } from 'vue';
import DataControl from './controls/DataControl.vue';
import TextControl from './controls/TextControl.vue';
import TextAreaControl from './controls/TextAreaControl.vue';
import CheckboxControl from './controls/CheckboxControl.vue';
import SelectControl from './controls/SelectControl.vue';
import DateControl from './controls/DateControl.vue';
import NumberControl from './controls/NumberControl.vue';

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
  'Text Area': TextAreaControl,
  'Textarea': TextAreaControl,
  'Select': SelectControl,
  'Checkbox': CheckboxControl,
  'Date': DateControl,
  'Number': NumberControl,
  // Default control for other field types
  'default': DataControl
};

// Get the appropriate component for the field type
function getControlComponent() {
  return fieldTypeMap[props.df.fieldtype] || fieldTypeMap.default;
}
</script>
