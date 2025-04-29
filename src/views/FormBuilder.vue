<template>
  <div 
    ref="container"
    class="form-builder-container"
    @click="selectedControl = null"
  >
    <!-- Form Container -->
    <div class="form-container">
      <div 
        class="form-main" 
        :class="{ 'preview-mode': previewMode }"
      >
        <!-- Tabs -->
        <div class="form-tabs">
          <div class="form-tabs-header">
            <draggable
              v-model="tabs"
              group="tabs"
              item-key="label"
              :animation="150"
              handle=".tab-drag-handle"
              class="tabs-container"
              @end="handleTabOrderChanged"
            >
              <template #item="{ element: tab, index }">
                <div
                  :class="[
                    'tab',
                    activeTab === index ? 'active' : '',
                    editingTabIndex === index ? 'editing' : ''
                  ]"
                  @click="activeTab = index"
                >
                  <div class="tab-drag-handle">
                    <i class="fas fa-grip-lines text-gray-400 mr-2 text-xs"></i>
                  </div>
                  <span v-if="editingTabIndex !== index" @dblclick.stop="startEditingTab(index)">{{ tab.label }}</span>
                  <input 
                    v-else
                    type="text" 
                    v-model="tab.label" 
                    @blur="stopEditingTab"
                    @keyup.enter="stopEditingTab"
                    ref="tabInputRef"
                    class="tab-edit-input"
                    @click.stop
                  />
                  <div class="tab-actions">
                    <button
                      v-if="tabs.length > 1"
                      class="tab-close"
                      @click.stop="removeTab(index)"
                      title="Remove tab"
                    >
                      <i class="fas fa-times text-xs" />
                    </button>
                    <button
                      class="tab-edit"
                      @click.stop="startEditingTab(index)"
                      title="Rename tab"
                    >
                      <i class="fas fa-pencil-alt text-xs" />
                    </button>
                    <button
                      class="tab-duplicate"
                      @click.stop="duplicateTab(index)"
                      title="Duplicate tab"
                    >
                      <i class="fas fa-clone text-xs" />
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
            <div class="tab-actions-right">
              <button
                class="add-tab-button"
                @click="addTab"
                title="Add new tab"
              >
                <i class="fas fa-plus text-xs" />
              </button>
            </div>
          </div>

          <div class="tab-content">
            <div v-if="currentTabSections.length === 0" class="empty-form">
              <div class="text-gray-400 text-center py-10">
                Click the button below to add a section
              </div>
              <div class="flex justify-center">
                <button 
                  class="add-section-button"
                  @click="addSection"
                >
                  <i class="fas fa-plus text-xs mr-1" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            <draggable
              v-model="currentTabSections"
              group="sections"
              item-key="id"
              handle=".section-drag-handle"
              ghost-class="ghost-item"
              class="sections-container"
            >
              <template #item="{ element: section }">
                <div 
                  :class="[
                    'section', 
                    selectedSection === section.id ? 'selected' : ''
                  ]"
                >
                  <div class="section-header section-drag-handle" @click="selectSection(section)">
                    <div class="section-title">
                      <span>{{ section.title || 'Untitled Section' }}</span>
                      <i v-if="section.collapsible" class="fas fa-chevron-down ml-2" />
                    </div>
                    <div class="section-actions">
                      <button @click.stop="openSectionMenu(section)">
                        <i class="fas fa-ellipsis-h" />
                      </button>
                    </div>
                  </div>

                  <div class="section-columns">
                    <draggable
                      v-for="(column, colIndex) in section.columns"
                      :key="colIndex"
                      v-model="column.fields"
                      group="fields"
                      item-key="id"
                      ghost-class="ghost-item"
                      class="column"
                    >
                      <template #item="{ element: field }">
                        <DraggableItem 
                          :control="field"
                          :selected="selectedControl?.id === field.id"
                          @edit="editControl"
                          @delete="deleteControl"
                        />
                      </template>
                      <template #footer>
                        <div class="add-field-container relative">
                          <button 
                            class="add-field-button" 
                            @click="openFieldSelector(section, colIndex)"
                          >
                            <i class="fas fa-plus text-xs mr-1" />
                            Add Field
                          </button>
                          
                          <div 
                            v-if="showFieldSelector && activeSection === section.id && activeColumn === colIndex"
                            class="field-selector-container absolute z-10 top-full left-0 right-0 mt-1"
                          >
                            <FieldTypeSelector 
                              @select-field-type="(type) => addFieldToColumn(section, colIndex, type)" 
                              @close="closeFieldSelector" 
                            />
                          </div>
                        </div>
                      </template>
                    </draggable>
                    
                    <button 
                      v-if="section.columns.length < 3"
                      class="add-column-button"
                      @click="addColumnToSection(section)"
                    >
                      <i class="fas fa-plus text-xs mr-1" />
                      Add Column
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
            
            <div class="add-section-container">
              <button 
                class="add-section-button"
                @click="addSection"
              >
                <i class="fas fa-plus text-xs mr-1" />
                Add Section
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Form Controls/Sidebar -->
    <div class="form-controls" @click.stop>
      <div class="form-sidebar">
        <PropertiesPanel 
          v-if="selectedControl"
          :control="selectedControl"
          @update="updateControlProps"
        />
        <div v-else-if="selectedSection" class="section-properties">
          <h3 class="font-medium text-gray-700 mb-3">Section Properties</h3>
          <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-1">Title</label>
            <input 
              type="text" 
              v-model="getSectionById(selectedSection).title" 
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div class="mb-4">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="collapsible" 
                v-model="getSectionById(selectedSection).collapsible" 
                class="mr-2"
              />
              <label for="collapsible" class="text-sm text-gray-600">Collapsible</label>
            </div>
          </div>
        </div>
        <div v-else class="empty-sidebar">
          <div class="empty-state">
            <div class="icon-container mb-3">
              <i class="fas fa-mouse-pointer text-gray-400" />
            </div>
            <p class="text-gray-500 text-center">
              Select a field or section to edit its properties
            </p>
          </div>
          
          <div class="field-picker mt-8">
            <h3 class="font-medium text-gray-700 mb-3">Add New Field</h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="fieldType in fieldTypes"
                :key="fieldType.type"
                class="field-type-button"
                @click="addControl(fieldType.type)"
              >
                {{ fieldType.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import draggable from 'vuedraggable';
import { useFormStore } from '../stores/form';
import PropertiesPanel from '../components/ui/PropertiesPanel.vue';
import DraggableItem from '../components/ui/DraggableItem.vue';
import FieldTypeSelector from '../components/ui/FieldTypeSelector.vue';
import { Control, ControlType } from '../types';

const router = useRouter();
const formStore = useFormStore();
const container = ref<HTMLElement | null>(null);

// Form state
const tabs = ref<Array<{ label: string; sections: any[] }>>([
  {
    label: 'Details',
    sections: []
  },
  {
    label: 'More Info',
    sections: []
  }
]);
const activeTab = ref(0);
const selectedControl = ref<Control | null>(null);
const selectedSection = ref<string | null>(null);
const previewMode = ref(false);

// Tab editing state
const editingTabIndex = ref<number | null>(null);
const tabInputRef = ref<HTMLInputElement | null>(null);

// Field selector state
const showFieldSelector = ref(false);
const activeSection = ref<string | null>(null);
const activeColumn = ref<number | null>(null);

// Computed property for current tab sections (with getter and setter)
const currentTabSections = computed({
  get() {
    return tabs.value[activeTab.value]?.sections || [];
  },
  set(newSections) {
    if (tabs.value[activeTab.value]) {
      tabs.value[activeTab.value].sections = newSections;
    }
  }
});

// Field types
const fieldTypes = [
  { type: 'text', label: 'Text' },
  { type: 'textarea', label: 'Text Area' },
  { type: 'select', label: 'Select' },
  { type: 'check', label: 'Checkbox' },
  { type: 'date', label: 'Date' },
  { type: 'file', label: 'File' },
  { type: 'number', label: 'Number' },
  { type: 'link', label: 'Link' }
];

// Get current tab's sections
function getCurrentTabSections() {
  return tabs.value[activeTab.value]?.sections || [];
}

// Add a new tab
function addTab() {
  // Generate a unique name for the tab
  const tabNumber = tabs.value.length + 1;
  const tabName = `Tab ${tabNumber}`;
  
  // Create a new tab with proper structure
  const newTab = {
    label: tabName,
    sections: []
  };
  
  // Add the new tab to the tabs array
  tabs.value.push(newTab);
  
  // Set the active tab to the newly created tab
  activeTab.value = tabs.value.length - 1;
}

// Remove a tab
function removeTab(index: number) {
  if (tabs.value.length > 1) {
    tabs.value.splice(index, 1);
    if (activeTab.value >= tabs.value.length) {
      activeTab.value = tabs.value.length - 1;
    }
  }
}

// Duplicate a tab
function duplicateTab(index: number) {
  // Create a deep copy of the tab to duplicate
  const sourceTab = tabs.value[index];
  const duplicatedTab = JSON.parse(JSON.stringify(sourceTab));
  
  // Modify the copied tab's name
  duplicatedTab.label = `${sourceTab.label} (Copy)`;
  
  // Generate new unique IDs for all sections and fields in the duplicated tab
  regenerateIds(duplicatedTab);
  
  // Add the duplicated tab after the source tab
  tabs.value.splice(index + 1, 0, duplicatedTab);
  
  // Switch to the duplicated tab
  activeTab.value = index + 1;
}

// Regenerate IDs for duplicated tab contents
function regenerateIds(tab: any) {
  if (!tab.sections) return;
  
  tab.sections.forEach((section: any) => {
    // Assign new ID to section
    section.id = uuidv4();
    
    // Process columns and their fields
    if (section.columns) {
      section.columns.forEach((column: any) => {
        if (column.fields) {
          column.fields.forEach((field: any) => {
            // Assign new ID to each field
            field.id = uuidv4();
            // Give the field a unique name to avoid conflicts
            field.name = `${field.name}_${Date.now().toString().slice(-4)}`;
          });
        }
      });
    }
  });
}

// Add a new section
function addSection() {
  const newSection = {
    id: uuidv4(),
    title: `Section ${currentTabSections.value.length + 1}`,
    collapsible: false,
    columns: [
      {
        fields: []
      }
    ]
  };
  
  if (tabs.value[activeTab.value]) {
    tabs.value[activeTab.value].sections.push(newSection);
  }
}

// Select a section
function selectSection(section: any) {
  selectedSection.value = section.id;
  selectedControl.value = null;
}

// Get section by id
function getSectionById(id: string) {
  return currentTabSections.value.find(section => section.id === id) || {};
}

// Add a column to a section
function addColumnToSection(section: any) {
  if (section.columns.length < 3) {
    section.columns.push({
      fields: []
    });
  }
}

// Open section menu
function openSectionMenu(section: any) {
  // Implement section menu logic
  // console.log('Opening menu for section:', section.id);
}

// Field selector functions
function openFieldSelector(section: any, colIndex: number) {
  showFieldSelector.value = true;
  activeSection.value = section.id;
  activeColumn.value = colIndex;
}

function closeFieldSelector() {
  showFieldSelector.value = false;
  activeSection.value = null;
  activeColumn.value = null;
}

// Add a field to a column
function addFieldToColumn(section: any, columnIndex: number, type: ControlType = 'text') {
  const newControl: Control = {
    id: uuidv4(),
    type,
    label: `New ${type}`,
    name: `field_${Date.now()}`,
    required: false,
    placeholder: '',
    options: type === 'select' ? [{ label: 'Option 1', value: 'option_1' }] : [],
    order: 0
  };
  
  section.columns[columnIndex].fields.push(newControl);
  selectedControl.value = newControl;
  closeFieldSelector();
}

// Add a new control (field)
function addControl(type: ControlType) {
  const newControl: Control = {
    id: uuidv4(),
    type,
    label: `New ${type}`,
    name: `field_${Date.now()}`,
    required: false,
    placeholder: '',
    options: type === 'select' ? [{ label: 'Option 1', value: 'option_1' }] : [],
    order: 0
  };
  
  // Try to add to the first column of the first section if exists
  const sections = currentTabSections.value;
  if (sections.length > 0) {
    sections[0].columns[0].fields.push(newControl);
  } else {
    // Create a section if none exists
    addSection();
    // After adding a section, get the sections again
    if (tabs.value[activeTab.value]?.sections[0]) {
      tabs.value[activeTab.value].sections[0].columns[0].fields.push(newControl);
    }
  }
  
  selectedControl.value = newControl;
}

// Edit a control
function editControl(control: Control) {
  selectedControl.value = control;
  selectedSection.value = null;
}

// Delete a control
function deleteControl(id: string) {
  // Find and remove the control from any section/column
  const sections = currentTabSections.value;
  for (const section of sections) {
    for (const column of section.columns) {
      const index = column.fields.findIndex((field: any) => field.id === id);
      if (index !== -1) {
        column.fields.splice(index, 1);
        if (selectedControl.value?.id === id) {
          selectedControl.value = null;
        }
        return;
      }
    }
  }
}

// Update control properties
function updateControlProps(updatedControl: Control) {
  // Find and update the control in our data structure
  const sections = currentTabSections.value;
  for (const section of sections) {
    for (const column of section.columns) {
      const index = column.fields.findIndex((field: any) => field.id === updatedControl.id);
      if (index !== -1) {
        column.fields[index] = { ...updatedControl };
        return;
      }
    }
  }
}

// Preview the form
function previewForm() {
  previewMode.value = !previewMode.value;
}

// Tab editing functions
function startEditingTab(index: number) {
  editingTabIndex.value = index;
  // Focus the input after the next DOM update
  setTimeout(() => {
    if (tabInputRef.value) {
      tabInputRef.value.focus();
      tabInputRef.value.select();
    }
  }, 10);
}

function stopEditingTab() {
  // Trim whitespace and ensure tab has a label
  if (editingTabIndex.value !== null) {
    const tab = tabs.value[editingTabIndex.value];
    tab.label = tab.label.trim() || `Tab ${editingTabIndex.value + 1}`;
  }
  editingTabIndex.value = null;
}

// Handle tab reordering
function handleTabOrderChanged() {
  // If active tab content moved, update the activeTab index to follow it
  const newActiveTabIndex = tabs.value.findIndex((_, i) => i === activeTab.value);
  if (newActiveTabIndex !== -1) {
    activeTab.value = newActiveTabIndex;
  } else {
    // If the tab wasn't found (unlikely), set to first tab
    activeTab.value = 0;
  }
}
</script>

<style>
/* Import the Frappe Form Builder CSS */
@import '../assets/frappe-form-builder.css';
</style>
