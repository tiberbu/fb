<template>
  <div
    class="form-section-container"
    :style="{ borderBottom: props.section.df.hide_border ? 'none' : '' }"
  >
    <div
      :class="[
        'form-section',
        hovered ? 'hovered' : '',
        store.selected(section.df.name) ? 'selected' : '',
      ]"
      :title="section.df.fieldname"
      @click.stop="selectSection"
      @mouseover.stop="hovered = true"
      @mouseout.stop="hovered = false"
    >
      <div
        :class="[
          'section-header',
          section.df.label || section.df.collapsible ? 'has-label' : '',
          collapsed ? 'collapsed' : '',
        ]"
        :hidden="!section.df.label && store.readOnly"
      >
        <div class="section-label">
          <EditableInput
            :text="section.df.label"
            :placeholder="'Section Title'"
            v-model="section.df.label"
          />
          <div
            v-if="section.df.collapsible"
            class="collapse-indicator"
          >
            <i class="fa" :class="collapsed ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
          </div>
        </div>
        <div class="section-actions">
          <button
            v-if="!store.readOnly"
            type="button"
            class="remove-section-btn"
            @click.stop="removeSection"
            title="Delete section"
          >
            <i class="fa fa-times"></i>
          </button>
          <Dropdown v-if="!store.readOnly" :options="options" @click.stop />
        </div>
      </div>
      <div v-if="section.df.description" class="section-description">
        {{ section.df.description }}
      </div>
      <div
        class="section-columns"
        :class="{
          hidden: section.df.collapsible && collapsed,
          'has-one-column': section.columns.length === 1,
        }"
      >
        <draggable
          class="section-columns-container"
          v-model="section.columns"
          group="columns"
          item-key="id"
          :delay="isTouchScreenDevice() ? 200 : 0"
          :animation="200"
          :easing="store.getAnimation"
          :disabled="store.readOnly"
        >
          <template #item="{ element }">
            <Column
              :section="section"
              :column="element"
              :data-is-user-generated="store.isUserGeneratedField(element)"
            />
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import draggable from "vuedraggable";
import Column from "./Column.vue";
import EditableInput from "./EditableInput.vue";
import Dropdown from "./Dropdown.vue";
import { ref, computed } from "vue";
import { useFormBuilderStore } from "../stores/form-builder-store";
import {
  sectionBoilerplate,
  moveChildrenToParent,
  confirmDialog,
  isTouchScreenDevice,
} from "../utils/form-builder-utils";
import { useMagicKeys, whenever } from "@vueuse/core";

const props = defineProps(["tab", "section"]);
const store = useFormBuilderStore();
const section = props.section;

// delete/backspace to delete the section
const { Backspace } = useMagicKeys();
whenever(Backspace, (value) => {
  if (value && selected.value && store.notUsingInput) {
    removeSection();
  }
});

const hovered = ref(false);
const collapsed = ref(false);
const selected = computed(() => store.selected(props.section.df.name));
const column = computed(() => props.section.columns[props.section.columns.length - 1]);

// section
function addSectionBelow() {
  let index = props.tab.sections.indexOf(props.section);
  const newSections = [
    ...props.tab.sections.slice(0, index + 1),
    sectionBoilerplate(),
    ...props.tab.sections.slice(index + 1)
  ];
  emit("update:tab", { ...props.tab, sections: newSections });
}

function isSectionEmpty() {
  return !props.section.columns.some(
    (column) => (store.isCustomizeForm && !column.df.isCustomField) || column.fields.length
  );
}

function removeSection() {
  if (store.isCustomizeForm && props.section.df.isCustomField === 0) {
    alert("Cannot delete standard field. You can hide it if you want");
    throw "cannot delete standard field";
  } else if (store.hasStandardField(props.section)) {
    deleteSection();
  } else if (isSectionEmpty()) {
    deleteSection(true);
  } else {
    confirmDialog(
      "Delete Section",
      "Are you sure you want to delete the section? All the columns along with fields in the section will be moved to the previous section.",
      () => deleteSection(),
      "Delete section",
      () => deleteSection(true),
      "Delete entire section with fields"
    );
  }
}

function deleteSection(withChildren) {
  let sections = props.tab.sections;
  let index = sections.indexOf(props.section);

  if (!withChildren) {
    if (index > 0) {
      let prevSection = sections[index - 1];
      if (!isSectionEmpty()) {
        // move all columns from current section to previous section
        prevSection.columns = [...prevSection.columns, ...props.section.columns];
      }
    } else if (index == 0 && !isSectionEmpty()) {
      // create a new section and push columns to it
      sections.unshift({
        df: store.getDf("Section Break"),
        columns: props.section.columns,
        isFirst: true,
      });
      index++;
    }
  }

  // remove section
  sections.splice(index, 1);
  store.form.selectedField = null;
}

function selectSection() {
  if (props.section.df.collapsible) {
    collapsed.value = !collapsed.value;
  }
  store.form.selectedField = props.section.df;
}

function moveSectionsToTab() {
  let newTab = moveChildrenToParent(props, "tab", "section", store.form.layout);

const emit = defineEmits(["update:section", "update:tab"]);
  store.form.activeTab = newTab.df.name;
}

// column
// Removed redundant definition of emit; the emit from earlier is used.

function addColumn() {
  const newColumn = {
    fields: [],
    df: store.getDf("Column Break"),
  };
  const updatedSection = { ...props.section, columns: [...props.section.columns, newColumn] };
  emit("update:section", updatedSection);
}

function removeColumn() {
  if (store.isCustomizeForm && column.value.df.isCustomField === 0) {
    alert("Cannot delete standard field. You can hide it if you want");
    throw "cannot delete standard field";
  } else if (column.value.fields.length == 0 || store.hasStandardField(column.value)) {
    deleteColumn();
  } else {
    confirmDialog(
      "Delete Column",
      "Are you sure you want to delete the column? All the fields in the column will be moved to the previous column.",
      () => deleteColumn(),
      "Delete column",
      () => deleteColumn(true),
      "Delete entire column with fields"
    );
  }
}

function deleteColumn(withChildren) {
  // move all fields to previous column
  let columns = props.section.columns;
  let index = columns.length - 1;

  if (withChildren && index == 0 && columns.length == 1) {
    if (column.value.fields.length == 0) {
      alert("Section must have at least one column");
      throw "section must have at least one column";
    }

    columns.unshift({
      df: store.getDf("Column Break"),
      fields: [],
      isFirst: true,
    });
    index++;
  }

  if (!withChildren) {
    if (index > 0) {
      let prevColumn = columns[index - 1];
      prevColumn.fields = [...prevColumn.fields, ...column.value.fields];
    } else {
      if (column.value.fields.length == 0) {
        // set next column as first column
        let nextColumn = columns[index + 1];
        if (nextColumn) {
          nextColumn.isFirst = true;
        } else {
          alert("Section must have at least one column");
          throw "section must have at least one column";
        }
      } else {
        // create a new column if current column has fields and push fields to it
        columns.unshift({
          df: store.getDf("Column Break"),
          fields: column.value.fields,
          isFirst: true,
        });
        index++;
      }
    }
  }

  // remove column
  columns.splice(index, 1);
  store.form.selectedField = null;
}

const options = computed(() => {
  let groups = [
    {
      group: "Section",
      items: [
        { label: "Add section below", onClick: addSectionBelow },
        { label: "Remove section", onClick: removeSection },
      ],
    },
    {
      group: "Column",
      items: [{ label: "Add column", onClick: addColumn }],
    },
  ];

  // add remove column option if there are more than one columns
  if (props.section.columns.length > 1) {
    groups[1].items.push({
      label: "Remove column",
      tooltip: "Remove last column",
      onClick: removeColumn,
    });
  } else if (props.section.columns[0].fields.length) {
    // add remove all fields option if there is only one column and it has fields
    groups[1].items.push({
      label: "Empty column",
      tooltip: "Remove all fields in the column",
      onClick: () => deleteColumn(true),
    });
  }

  // add move to tab option if the current section is not the first section
  if (props.tab.sections.indexOf(props.section) > 0) {
    groups[0].items.push({
      label: "Move sections to new tab",
      tooltip: "Move current and all subsequent sections to a new tab",
      onClick: moveSectionsToTab,
    });
  }

  return groups;
});
</script>

<style lang="scss" scoped>
.form-section-container {
  border-bottom: 1px solid var(--border-color, #d1d8dd);
  background-color: var(--fg-color, #fff);

  &:last-child {
    border-bottom: none;
  }

  .form-section {
    background-color: inherit;
    border: 1px solid transparent;
    border-radius: var(--border-radius, 6px);
    padding: 1rem;
    cursor: pointer;

    &:last-child {
      border-bottom-left-radius: var(--border-radius, 6px);
      border-bottom-right-radius: var(--border-radius, 6px);
    }

    &.hovered,
    &.selected {
      border-color: var(--border-primary, #4F46E5);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;

      &.collapsed {
        padding-bottom: 0;
      }

      &.has-label {
        display: flex;
      }

      .section-label {
        display: flex;
        align-items: center;

        :deep(span) {
          font-weight: 600;
          color: var(--heading-color, #222);
        }

        .collapse-indicator {
          margin-left: 7px;
          cursor: pointer;
        }
      }

      .section-actions {
        display: flex;
        gap: 4px;
        align-items: center;

        .remove-section-btn {
          padding: 4px 6px;
          background-color: var(--danger-bg, rgba(255, 76, 76, 0.1));
          border: 1px solid var(--danger-border, rgba(255, 76, 76, 0.3));
          color: var(--danger, #ff5c5c);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          
          &:hover {
            background-color: var(--danger-bg-hover, rgba(255, 76, 76, 0.2));
            color: var(--danger-darker, #ff3535);
          }
        }
      } 

      .btn-section {
        display: inline-flex;
        gap: 2px;
      }
    }

    .section-description {
      margin-bottom: 10px;
      font-size: var(--text-xs, 12px);
      color: var(--text-muted, #8d99a6);
    }

    .section-columns {
      &.hidden {
        display: none;
      }

      &.has-one-column {
        .column {
          max-width: 100%;
        }
      }
    }

    .section-columns-container {
      display: flex;
      min-height: 2rem;
      border-radius: var(--border-radius, 6px);
      flex-wrap: wrap;
      gap: 10px;
    }
  }
}
</style>
