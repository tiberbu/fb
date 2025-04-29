<template>
  <div
    :class="['column', selected ? 'selected' : hovered ? 'hovered' : '']"
    :title="column.df.fieldname"
    @click.stop="store.form.selectedField = column.df"
    @mouseover.stop="hovered = true"
    @mouseout.stop="hovered = false"
  >
    <div
      v-if="column.df.label"
      class="column-header"
      :hidden="!column.df.label && store.readOnly"
    >
      <div class="column-label">
        <span>{{ column.df.label }}</span>
      </div>
    </div>
    <div v-if="column.df.description" class="column-description">
      {{ column.df.description }}
    </div>
    <draggable
      class="column-container"
      v-model="column.fields"
      group="fields"
      :delay="isTouchScreenDevice() ? 200 : 0"
      :animation="200"
      :easing="store.getAnimation"
      item-key="id"
      :disabled="store.readOnly"
    >
      <template #item="{ element }">
        <Field
          :column="column"
          :field="element"
          :data-is-user-generated="store.isUserGeneratedField(element)"
        />
      </template>
    </draggable>
    <div class="empty-column" :hidden="store.readOnly">
      <AddFieldButton :column="column" />
    </div>
    <div v-if="column.fields.length" class="add-new-field-btn">
      <AddFieldButton :field="column.fields[column.fields.length - 1]" :column="column" />
    </div>
  </div>
</template>

<script setup>
import draggable from "vuedraggable";
import Field from "./Field.vue";
import AddFieldButton from "./AddFieldButton.vue";
import { computed, ref } from "vue";
import { useFormBuilderStore } from "../stores/form-builder-store";
import { isTouchScreenDevice } from "../utils/form-builder-utils";
import { useMagicKeys, whenever } from "@vueuse/core";

const props = defineProps(["section", "column"]);
const store = useFormBuilderStore();
const column = props.column;

// delete/backspace to delete the field
const { Backspace } = useMagicKeys();
whenever(Backspace, (value) => {
  if (value && selected.value && store.notUsingInput) {
    const sectionComponent = getSectionComponent();
    if (sectionComponent && typeof sectionComponent.removeColumn === 'function') {
      sectionComponent.removeColumn();
    }
  }
});

function getSectionComponent() {
  // This is a simplified method - in a real implementation, 
  // you might use inject/provide pattern or some other method to access section methods
  return null;
}

const hovered = ref(false);
const selected = computed(() => store.selected(props.column.df.name));
</script>

<style lang="scss" scoped>
.column {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--bg-light-gray, #f8f8f8);
  border-radius: var(--border-radius, 6px);
  border: 1px dashed var(--gray-400, #cbd5e1);
  padding: 0.5rem;
  margin-left: 4px;
  margin-right: 4px;

  &.hovered,
  &.selected {
    border-color: var(--border-primary, #4F46E5);
    border-style: solid;
  }

  .column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.5rem;
    padding-left: 0.3rem;

    .column-label {
      :deep(span) {
        font-weight: 600;
        color: var(--heading-color, #222);
      }
    }
  }

  .column-description {
    margin-bottom: 10px;
    font-size: var(--text-xs, 12px);
    color: var(--text-muted, #8d99a6);
  }

  .column-container {
    min-height: 2rem;
    padding-bottom: 0.5rem;
  }

  .empty-column {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    border: 1px dashed var(--gray-300, #e2e8f0);
    border-radius: var(--border-radius, 6px);
    background-color: var(--control-bg, #f4f5f6);
    margin-top: 0.5rem;

    &:hover {
      border-color: var(--gray-500, #64748b);
    }
  }

  .add-new-field-btn {
    margin-top: 10px;
  }
}

@media (min-width: 992px) {
  .column {
    flex: 1 0 0%;
  }
}
</style>
