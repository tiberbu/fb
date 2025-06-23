<template>
  <div class="form-header">
    <button
      class="sidebar-toggle-button"
      :class="{ 
        'active': showSidebar, 
        'has-selection': hasSelection 
      }"
      @click="toggleSidebar"
    >
      <i class="fas fa-cog" />
      <span class="ml-2">
        Properties
        <span 
          v-if="hasSelection" 
          class="selection-indicator"
        >({{ selectionType }})</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showSidebar: boolean;
  hasSelection: boolean;
  selectionType: string;
}

defineProps<Props>();

const emit = defineEmits<{
  'toggle-sidebar': [];
}>();

function toggleSidebar() {
  emit('toggle-sidebar');
}
</script>
