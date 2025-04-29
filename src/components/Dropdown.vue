<template>
  <div class="dropdown" v-click-outside="close">
    <button type="button" class="dropdown-toggle" @click="toggle">
      <i class="fa fa-ellipsis-h"></i>
    </button>
    <div v-if="isOpen" class="dropdown-menu">
      <div v-for="(group, i) in options" :key="i" class="dropdown-group">
        <div class="dropdown-group-title" v-if="group.group">{{ group.group }}</div>
        <div
          v-for="(item, j) in group.items"
          :key="j"
          class="dropdown-item"
          @click="handleClick(item)"
          v-tooltip="item.tooltip"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
});

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

function handleClick(item) {
  if (item.onClick) {
    item.onClick();
  }
  close();
}

// Simple click outside directive
// In a real implementation, you might want to use a proper directive or library
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  },
};

// Simple tooltip directive
// In a real implementation, you might want to use a proper tooltip library
const vTooltip = {
  mounted(el, binding) {
    if (binding.value) {
      el.setAttribute('title', binding.value);
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.setAttribute('title', binding.value);
    } else {
      el.removeAttribute('title');
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  
  .dropdown-toggle {
    background: none;
    border: none;
    padding: 6px;
    border-radius: var(--border-radius, 6px);
    cursor: pointer;
    color: var(--text-muted, #8d99a6);
    
    &:hover {
      background-color: var(--control-bg, #f4f5f6);
      color: var(--text-color, #222);
    }
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    min-width: 180px;
    padding: 8px 0;
    margin: 2px 0 0;
    background-color: var(--card-bg, #fff);
    border: 1px solid var(--border-color, #d1d8dd);
    border-radius: var(--border-radius, 6px);
    box-shadow: var(--shadow-sm, 0 2px 5px rgba(0, 0, 0, 0.1));
  }
  
  .dropdown-group {
    padding: 4px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--border-color, #d1d8dd);
    }
  }
  
  .dropdown-group-title {
    padding: 5px 15px;
    font-size: var(--text-xs, 12px);
    color: var(--text-muted, #8d99a6);
    font-weight: 500;
  }
  
  .dropdown-item {
    padding: 8px 15px;
    cursor: pointer;
    white-space: nowrap;
    
    &:hover {
      background-color: var(--control-bg, #f4f5f6);
    }
  }
}
</style>
