<template>
  <div class="form-tabs-container">
    <div class="form-tabs">
      
      <draggable
        v-model="store.form.layout.tabs"
        group="tabs"
        item-key="id"
        :delay="isTouchScreenDevice() ? 200 : 0"
        :animation="200"
        :easing="store.getAnimation"
        :disabled="store.readOnly"
        class="sortable-tabs"
        handle=".tab-drag-handle"
        @start="dragged = true"
        @end="dragged = false"
      >
        <template #item="{ element: tab }">
          <div
            :class="[
              'tab',
              'tab-drag-handle',
              store.form.activeTab === tab.df.name ? 'active' : '',
              store.selected(tab.df.name) ? 'selected' : '',
            ]"
            :hidden="store.readOnly && tab.hidden"
            @click.stop="activateTab(tab)"
            @mouseover.stop="dragOver(tab)"
            @dblclick.stop="startEditingTab(tab)"
          >
            <EditableInput
              v-model="tab.df.label"
              :text="tab.df.label"
              :placeholder="'Tab Title'"
              @click.stop
            />
            <button
              v-if="hasTabs && !store.readOnly"
              type="button"
              class="remove-tab-btn"
              @click.stop="removeTab(tab, $event)"
            >
              <i class=""> x</i>
            </button>
          </div>
        </template>
      </draggable>
      <button
        v-if="!store.readOnly"
        type="button"
        class="add-tab-btn"
        @click.stop="addNewTab"
      >
       Add
      </button>
    </div>
    <div v-if="store.currentTab" class="tab-content">
      <draggable
        v-model="store.currentTab.sections"
        group="sections"
        item-key="id"
        :delay="isTouchScreenDevice() ? 200 : 0"
        :animation="200"
        :easing="store.getAnimation"
        :disabled="store.readOnly"
        class="sortable-sections"
      >
        <template #item="{ element: section }">
          <Section
            :tab="store.currentTab"
            :section="section"
            :data-is-user-generated="store.isUserGeneratedField(section)"
          />
        </template>
      </draggable>
      <div class="add-section" @click.stop="addNewSection" v-if="!store.readOnly">
        <div class="add-section-button">
          <i class="fa fa-plus"></i>
          <span>Add Section</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import Section from "./Section.vue";
import EditableInput from "./EditableInput.vue";
import { useFormBuilderStore } from "../stores/form-builder-store";
import { sectionBoilerplate, confirmDialog, isTouchScreenDevice } from "../utils/form-builder-utils";
import { ref, computed } from "vue";
import { useMagicKeys, whenever } from "@vueuse/core";

const store = useFormBuilderStore();

// delete/backspace to delete the field
const { Backspace } = useMagicKeys();
whenever(Backspace, (value) => {
  if (value && selected.value && store.notUsingInput) {
    removeTab(store.currentTab, "", true);
  }
});

const dragged = ref(false);
const selected = computed(() => store.selected(store.currentTab?.df.name || ''));
const hasTabs = computed(() => (store.form.layout.tabs?.length ?? 0) > 1);

function activateTab(tab) {
  store.activateTab(tab);
}

// This function is called when a tab is double-clicked
function startEditingTab(tab) {
  // Find the EditableInput component inside the tab and simulate a double-click
  // to activate its built-in editing capabilities
  const tabElement = document.querySelector(`.tab-drag-handle.${store.form.activeTab === tab.df.name ? 'active' : ''}`);
  if (tabElement) {
    const editableInput = tabElement.querySelector('.editable-input');
    if (editableInput) {
      // Create and dispatch a double-click event to trigger EditableInput's edit mode
      const event = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      editableInput.dispatchEvent(event);
    }
  }
}

function dragOver(tab) {
  !dragged.value &&
    setTimeout(() => {
      store.form.activeTab = tab.df.name;
    }, 500);
}

function addNewTab() {
  store.addNewTab();
}

function addNewSection() {
  let section = sectionBoilerplate();
  store.currentTab.sections.push(section);
  store.form.selectedField = section.df;
}

function isTabEmpty(tab) {
  // check if sections have columns and they contain fields
  return !tab.sections.some((section) => 
    section.columns.some((column) => column.fields.length > 0)
  );
}

function removeTab(tab, event, force = false) {
  // if remove_tab_btn is not visible then return
  if (!event?.currentTarget?.offsetParent && !force) return;

  if (store.isCustomizeForm && store.currentTab.df.isCustomField == 0) {
    alert("Cannot delete standard field. You can hide it if you want");
    throw "cannot delete standard field";
  } else if (store.hasStandardField(store.currentTab)) {
    deleteTab(tab);
  } else if (isTabEmpty(tab)) {
    deleteTab(tab, true);
  } else {
    confirmDialog(
      "Delete Tab",
      "Are you sure you want to delete the tab? All the sections along with fields in the tab will be moved to the previous tab.",
      () => deleteTab(tab),
      "Delete tab",
      () => deleteTab(tab, true),
      "Delete entire tab with fields"
    );
  }
}

function deleteTab(tab, withChildren = false) {
  let tabs = store.form.layout.tabs;
  let index = tabs.indexOf(tab);

  if (!withChildren) {
    if (index > 0) {
      let prevTab = tabs[index - 1];
      if (!isTabEmpty(tab)) {
        // move all sections from current tab to previous tab
        prevTab.sections = [...prevTab.sections, ...tab.sections];
      }
    } else {
      // create a new tab and push sections to it
      tabs.unshift({
        df: store.getDf("Tab Break", "", "Details"),
        sections: tab.sections,
        isFirst: true,
      });
      index++;
    }
  }

  // remove tab
  tabs.splice(index, 1);
  store.form.selectedField = null;
  store.form.activeTab = tabs[0]?.df.name;
}
</script>

<style lang="scss" scoped>
.form-tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .form-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color, #d1d8dd);
    position: sticky;
    top: 0;
    background-color: var(--card-bg, #fff);
    z-index: 10;
    align-items: center;
    overflow-x: auto;

    .sortable-tabs {
      display: flex;
    }

    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      min-width: 80px;
      text-align: center;
      position: relative;
      user-select: none;
      margin: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .editable-input {
        position: relative;
        width: 100%;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        
        &:after {
          content: '';
          position: absolute;
          right: -15px;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='12' height='12' stroke='currentColor' stroke-width='2' fill='none'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'%3E%3C/path%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
      }
      
      &:hover .editable-input:after {
        opacity: 0.5;
      }
      
      &:active .editable-input:after,
      &.active .editable-input:after {
        opacity: 0.7;
      }
      
      &.active {
        color: var(--text-color, #222);
        border-bottom-color: var(--primary-color, #4F46E5);
        background-color: var(--control-bg, #f4f5f6);
      }
      
      &.selected {
        background-color: var(--control-bg, #f4f5f6);
        box-shadow: 0 0 0 1px var(--primary-color, #4F46E5);
      }
      
      .remove-tab-btn {
        position: absolute;
        right: 5px;
        top: 5px;
        padding: 2px;
        display: none;
        background: none;
        border: none;
        color: var(--text-light, #6c7680);
        
        &:hover {
          color: var(--text-color, #222);
        }
      }
      
      &:hover .remove-tab-btn {
        display: block;
      }
    }
    
    .add-tab-btn {
      min-width: 30px;
      height: 30px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--text-muted, #8d99a6);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 5px;
      
      &:hover {
        color: var(--text-color, #222);
      }
    }
  }
  
  .tab-content {
    flex: 1;
    overflow-y: auto;
    
    .sortable-sections {
      min-height: 30px;
    }
    
    .add-section {
      display: flex;
      justify-content: center;
      padding: 15px 0;
      cursor: pointer;
      
      .add-section-button {
        display: flex;
        align-items: center;
        color: var(--text-muted, #8d99a6);
        padding: 8px 16px;
        border-radius: var(--border-radius, 6px);
        
        &:hover {
          background-color: var(--control-bg, #f4f5f6);
        }
        
        span {
          margin-left: 8px;
        }
      }
    }
  }
}
</style>
