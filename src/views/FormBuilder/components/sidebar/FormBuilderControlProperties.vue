<template>
  <div class="control-properties">
    <PropertiesPanel
      :control="control"
      @update="$emit('update', $event)"
      @delete="$emit('delete', $event)"
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
}>();
</script>
