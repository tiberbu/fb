<template>
  <div class="accordion-section border border-gray-200 rounded mb-2">
    <button
      class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-left rounded-t"
      :class="{ 'rounded-b': !isOpen }"
      @click="toggle"
    >
      <span class="text-sm font-medium text-gray-700">{{ title }}</span>
      <i 
        class="fas fa-chevron-down text-gray-500 text-xs transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    
    <div 
      v-show="isOpen"
      class="p-3 border-t border-gray-200 bg-white rounded-b"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  initiallyOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initiallyOpen: false
});

const isOpen = ref(props.initiallyOpen);

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
