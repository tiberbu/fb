import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Control } from '../types';

export const useFormStore = defineStore('form', () => {
  const controls = ref<Control[]>([]);
  
  function setControls(newControls: Control[]) {
    controls.value = newControls;
  }
  
  return { 
    controls, 
    setControls 
  };
});
