<template>
  <div
    v-if="shouldRender"
    ref="container"
    class="form-builder-container"
    @click="store.form.selectedField = null"
  >
    <div class="form-container">
      <div 
        class="form-main"
        :class="[store.preview ? 'preview' : '']"
      >
        <Tabs />
      </div>
    </div>
    <div 
      class="form-controls"
      @click.stop
    >
      <div class="form-sidebar">
        <Sidebar />
      </div>
    </div>
  </div>
  <div id="autocomplete-area" />
</template>

<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Tabs from "./Tabs.vue";
import { computed, onMounted, watch, ref } from "vue";
import { useFormBuilderStore } from "../stores/form-builder-store";
import { onClickOutside } from "@vueuse/core";
import "../assets/css/form-builder-enhanced.css";

const store = useFormBuilderStore();

const shouldRender = computed(() => {
  return Object.keys(store.form.layout).length !== 0;
});

const container = ref(null);
onClickOutside(container, () => (store.form.selectedField = null), {
  ignore: [".combo-box-options"],
});

watch(
  () => store.form.layout,
  () => (store.dirty = true),
  { deep: true }
);

onMounted(() => store.fetch());
</script>

<style lang="scss" scoped>
.form-builder-container {
  margin: -15px -20px -5px;
  display: flex;

  &.resizing {
    user-select: none;
    cursor: col-resize;
  }

  .form-controls {
    position: relative;
    width: 28%;
    min-width: 300px;
  }

  .form-container {
    flex: 1;
    background-color: var(--disabled-control-bg, #f8f8f8);
  }

  .form-sidebar {
    border-left: 1px solid var(--border-color, #d1d8dd);
    border-bottom-right-radius: var(--border-radius, 6px);
    height: 100%;
  }

  .form-main {
    border-radius: var(--border-radius, 6px);
    border: 1px solid var(--border-color, #d1d8dd);
    background-color: var(--card-bg, #fff);
    margin: 5px;
  }

  :deep(.section-columns.has-one-column .field) {
    input.form-control,
    .signature-field {
      width: calc(50% - 19px);
    }

    .select-input {
      width: calc(50% - 19px);

      input.form-control {
        width: 100%;
      }
    }
  }

  :deep(.column-container .field.sortable-chosen) {
    background-color: var(--bg-light-gray, #f8f8f8);
    border-radius: var(--border-radius-sm, 4px);
    border: 1px solid transparent;
    padding: 0.3rem;
  }
}

#autocomplete-area {
  position: fixed;
  z-index: 1000;
}
</style>
