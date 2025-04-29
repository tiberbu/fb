<template>
  <div class="editable-input" @dblclick.stop="startEditing">
    <span v-if="!isEditing" :class="{ 'placeholder': !modelValue }">
      {{ modelValue || placeholder }}
    </span>
    <input
      v-else
      ref="input"
      v-model="inputValue"
      @blur="stopEditing"
      @keydown.enter="stopEditing"
      @keydown.esc="cancelEditing"
      @click.stop
      type="text"
      :placeholder="placeholder"
      class="form-control input-sm"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Edit'
  },
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const isEditing = ref(false);
const inputValue = ref(props.modelValue);
const input = ref(null);

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue;
});

function startEditing() {
  isEditing.value = true;
  nextTick(() => {
    input.value?.focus();
    input.value?.select();
  });
}

function stopEditing() {
  isEditing.value = false;
  emit('update:modelValue', inputValue.value);
}

function cancelEditing() {
  isEditing.value = false;
  inputValue.value = props.modelValue;
}
</script>

<style lang="scss" scoped>
.editable-input {
  cursor: pointer;
  min-width: 30px;
  min-height: 20px;
  display: inline-block;
  
  span {
    padding: 4px 0;
    display: inline-block;
    
    &.placeholder {
      color: var(--text-muted, #8d99a6);
      font-style: italic;
    }
  }
  
  input {
    padding: 2px 6px;
    border: 1px solid var(--border-color, #d1d8dd);
    border-radius: var(--border-radius, 4px);
    background-color: var(--card-bg, #fff);
    transition: border-color 0.15s ease-in-out;
    width: 100%;
    min-width: 100px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color, #4F46E5);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    }
  }
}
</style>
