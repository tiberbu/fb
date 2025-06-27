<template>
  <div class="control-properties">
    <PropertiesPanel
      :control="control"
      @update="$emit('update', $event)"
      @delete="$emit('delete', $event)"
      @close-panel="$emit('close-panel')"
    />
  </div>
</template>

<script setup lang="ts">
import { Control } from "../../../../types";
import PropertiesPanel from "../../../../components/ui/PropertiesPanel.vue";

interface Props {
  control: Control;
}

defineProps<Props>();

defineEmits<{
  'update': [control: Control];
  'delete': [id: string];
  'close-panel': [];
}>();
</script>
