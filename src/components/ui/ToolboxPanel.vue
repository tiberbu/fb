<template>
  <div class="toolbox-panel">
    <h3>Toolbox</h3>
    <div class="controls">
      <button @click="addControl('text')">Text</button>
      <button @click="addControl('number')">Number</button>
      <button @click="addControl('select')">Select</button>
      <button @click="addControl('checkbox')">Checkbox</button>
      <button @click="addControl('date')">Date</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ToolboxPanel',
  emits: ['add-control'],
  methods: {
    addControl(type: string) {
      this.$emit('add-control', type);
    }
  }
});
</script>

<style scoped>
.toolbox-panel {
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f9f9f9;
}

.controls {
  display: flex;
  flex-direction: column;
}

.controls button {
  margin: 5px 0;
}
</style>