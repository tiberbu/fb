<!-- FieldControl.vue - Parent component for all field controls -->
<template>
  <div
    :class="getFieldClasses()"
    :style="getFieldStyles()"
  >
    <component
      :is="getControlComponent()"
      :df="df"
      :value="value"
      :read-only="readOnly"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import DataControl from './controls/DataControl.vue';
import TextControl from './controls/TextControl.vue';
import TextAreaControl from './controls/TextAreaControl.vue';
import CheckboxControl from './controls/CheckboxControl.vue';
import SelectControl from './controls/SelectControl.vue';
import DateControl from './controls/DateControl.vue';
import NumberControl from './controls/NumberControl.vue';
import EmailControl from './controls/EmailControl.vue';
import PhoneControl from './controls/PhoneControl.vue';
import UrlControl from './controls/UrlControl.vue';
import PasswordControl from './controls/PasswordControl.vue';
import RadioControl from './controls/RadioControl.vue';
import DateTimeControl from './controls/DateTimeControl.vue';
import TimeControl from './controls/TimeControl.vue';
import FileControl from './controls/FileControl.vue';
import ImageControl from './controls/ImageControl.vue';
import RangeControl from './controls/RangeControl.vue';
import ColorControl from './controls/ColorControl.vue';
import HiddenControl from './controls/HiddenControl.vue';
import ReadOnlyControl from './controls/ReadOnlyControl.vue';
import DividerControl from './controls/DividerControl.vue';
import HtmlControl from './controls/HtmlControl.vue';

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

defineEmits(['update:modelValue']);

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
  'Email': EmailControl,
  'Phone': PhoneControl,
  'URL': UrlControl,
  'Password': PasswordControl,
  'Radio': RadioControl,
  'Date Time': DateTimeControl,
  'DateTime': DateTimeControl,
  'Time': TimeControl,
  'File': FileControl,
  'Image': ImageControl,
  'Range': RangeControl,
  'Color': ColorControl,
  'Hidden': HiddenControl,
  'Read Only': ReadOnlyControl,
  'ReadOnly': ReadOnlyControl,
  'Divider': DividerControl,
  'HTML': HtmlControl,
  // Default control for other field types
  'default': DataControl
};

// Get the appropriate component for the field type
function getControlComponent() {
  return fieldTypeMap[props.df.fieldtype] || fieldTypeMap.default;
}

// Get CSS classes for the field
function getFieldClasses() {
  const classes = [];
  
  // Add custom CSS classes if specified
  if (props.df.cssClasses) {
    classes.push(...props.df.cssClasses.split(' ').filter(cls => cls.trim()));
  }
  
  return classes.join(' ');
}

// Get inline styles for the field
function getFieldStyles() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = {};
  
  // Apply padding styles
  if (props.df.padding) {
    if (props.df.padding.top) styles.paddingTop = props.df.padding.top;
    if (props.df.padding.right) styles.paddingRight = props.df.padding.right;
    if (props.df.padding.bottom) styles.paddingBottom = props.df.padding.bottom;
    if (props.df.padding.left) styles.paddingLeft = props.df.padding.left;
  }
  
  // Apply margin styles
  if (props.df.margin) {
    if (props.df.margin.top) styles.marginTop = props.df.margin.top;
    if (props.df.margin.right) styles.marginRight = props.df.margin.right;
    if (props.df.margin.bottom) styles.marginBottom = props.df.margin.bottom;
    if (props.df.margin.left) styles.marginLeft = props.df.margin.left;
  }
  
  return styles;
}
</script>
