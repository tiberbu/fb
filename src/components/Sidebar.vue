<template>
  <div class="sidebar">
    <ToolboxPanel v-if="!store.form.selectedField" />
    <PropertiesPanel v-else />
  </div>
</template>

<script setup lang="ts">
import ToolboxPanel from './ui/ToolboxPanel.vue';
import PropertiesPanel from './ui/PropertiesPanel.vue';
import { useFormBuilderStore } from '../stores/form-builder-store';

const store = useFormBuilderStore();
</script>

<style scoped>
.sidebar {
  height: 100%;
  overflow-y: auto;
}
</style>
