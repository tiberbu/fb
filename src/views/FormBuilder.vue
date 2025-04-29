<template>
  <div
    ref="container"
    class="form-builder-container"
    @click="selectedControl = null"
  >
    <!-- Form Container -->
    <div class="form-container">
      <div class="form-main">
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
                    editingTabIndex === index ? 'editing' : '',
                  ]"
                  @click="activeTab = index"
                  @dblclick.stop="openTabProperties(index)"
                >
                  <div class="tab-drag-handle">
                    <i class="fas fa-grip-lines text-gray-400 mr-2 text-xs" />
                  </div>
                  <span v-if="editingTabIndex !== index">{{ tab.label }}</span>
                </div>
              </template>
            </draggable>
            <div class="tab-actions-right">
              <button
                title="Add new tab"
                class="add-tab-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                @click="addTab"
              >
                New tab
              </button>
            </div>
          </div>

          <div class="tab-content">
            <div
              v-if="currentTabSections.length === 0"
              class="empty-form"
            >
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
                    selectedSection === section.id ? 'selected' : '',
                  ]"
                >
                  <div
                    class="section-header section-drag-handle"
                    @click="selectSection(section)"
                  >
                    <div class="section-title">
                      <span>{{ section.title || "Untitled Section" }}</span>
                      <i
                        v-if="section.collapsible"
                        class="fas fa-chevron-down ml-2"
                      />
                    </div>
                    <div class="section-actions">
                      <button @click.stop="openSectionMenu(section)">
                        <i class="fas fa-ellipsis-h" />
                      </button>
                    </div>
                  </div>

                  <div class="section-rows">
                    <div 
                      v-for="(row, rowIndex) in section.rows || [{id: uuidv4(), columns: section.columns || []}]" 
                      :key="row.id || rowIndex"
                      :class="[
                        'row-wrapper',
                        selectedRow?.sectionId === section.id && 
                          selectedRow?.rowIndex === rowIndex ? 'selected-row' : ''
                      ]"
                    >
                      <div
                        class="row-header"
                        @click.stop="selectRow(section.id, rowIndex)"
                      >
                        <span>Row {{ rowIndex + 1 }}</span>
                      </div>
                      <div class="row-columns">
                        <div 
                          v-for="(column, colIndex) in row.columns" 
                          :key="colIndex"
                          :class="[
                            'column-wrapper', 
                            selectedColumn?.sectionId === section.id && 
                              selectedColumn?.columnIndex === colIndex ? 'selected-column' : ''
                          ]"
                        >
                          <div 
                            class="column-header"
                            @click.stop="selectColumn(section.id, colIndex)"
                          >
                            <span>Column {{ colIndex + 1 }}</span>
                          </div>
                          <draggable
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
                                @delete="(id) => { deleteControl(id); }"
                              />
                            </template>
                            <template #footer>
                              <div class="add-field-container relative">
                                <button
                                  class="add-field-button"
                                  @click="openFieldSelector(section, rowIndex, colIndex)"
                                >
                                  <i class="fas fa-plus text-xs mr-1" />
                                  Add Field
                                </button>

                                <div
                                  v-if="
                                    showFieldSelector &&
                                      activeSection === section.id &&
                                      activeRowIndex === rowIndex &&
                                      activeColumn === colIndex
                                  "
                                  class="field-selector-container absolute z-10 top-full left-0 right-0 mt-1"
                                >
                                  <FieldTypeSelector
                                    @select-field-type="
                                      (type) =>
                                        addFieldToColumn(section, rowIndex, colIndex, type)
                                    "
                                    @close="closeFieldSelector"
                                  />
                                </div>
                              </div>
                            </template>
                          </draggable>
                        </div>

                        <button
                          v-if="row.columns.length < 3"
                          class="add-column-button"
                          @click="addColumnToRow(section, rowIndex)"
                        >
                          <i class="fas fa-plus text-xs mr-1" />
                          Add Column
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="row-actions">
                    <button
                      class="add-row-button"
                      @click="addRowToSection(section)"
                    >
                      <i class="fas fa-plus text-xs mr-1" />
                      Add Row
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
    <div
      class="form-controls"
      @click.stop
    >
      <div class="form-sidebar">
        <PropertiesPanel
          v-if="selectedControl"
          :control="selectedControl"
          @update="updateControlProps"
          @delete="deleteControl"
        />
        <div
          v-else-if="selectedTab !== null"
          class="tab-properties"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Tab Properties
          </h3>
          <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-1">Tab Name</label>
            <input
              v-model="tabs[selectedTab].label"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
          </div>
          <div class="mb-4 flex gap-2">
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              @click="duplicateTab(selectedTab)"
            >
              <i class="fas fa-clone mr-2" />Duplicate Tab
            </button>
            <button
              v-if="tabs.length > 1"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              @click="deleteTab(selectedTab)"
            >
              <i class="fas fa-trash-alt mr-2" />Delete Tab
            </button>
          </div>
        </div>
        <div
          v-else-if="selectedSection"
          class="section-properties"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Section Properties
          </h3>
          <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-1">Title</label>
            <input
              v-model="getSectionById(selectedSection).title"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
          </div>
          <div class="mb-4">
            <div class="flex items-center">
              <input
                id="collapsible"
                v-model="getSectionById(selectedSection).collapsible"
                type="checkbox"
                class="mr-2"
              >
              <label
                for="collapsible"
                class="text-sm text-gray-600"
              >Collapsible</label>
            </div>
          </div>
          <div class="mb-4">
            <button
              class="delete-section-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              @click="deleteSection(selectedSection)"
            >
              <i class="fas fa-trash-alt mr-2" />Delete Section
            </button>
          </div>
        </div>
        <div
          v-else-if="selectedColumn"
          class="column-properties"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Column Properties
          </h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Column {{ selectedColumn.columnIndex + 1 }} in section "{{ getSectionById(selectedColumn.sectionId).title || 'Untitled Section' }}"
            </p>
          </div>
          <div class="mb-4">
            <button
              class="delete-column-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              @click="deleteColumn(selectedColumn.sectionId, selectedColumn.columnIndex)"
            >
              <i class="fas fa-trash-alt mr-2" />Delete Column
            </button>
          </div>
        </div>
        <div
          v-else-if="selectedRow"
          class="row-properties"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Row Properties
          </h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Row {{ selectedRow.rowIndex + 1 }} in section "{{ getSectionById(selectedRow.sectionId).title || 'Untitled Section' }}"
            </p>
          </div>
          <div class="mb-4">
            <button
              class="delete-row-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              @click="deleteRow(selectedRow.sectionId, selectedRow.rowIndex)"
            >
              <i class="fas fa-trash-alt mr-2" />Delete Row
            </button>
          </div>
        </div>
        <div
          v-else
          class="form-configuration"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Form Configuration
          </h3>
          
          <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-1">Form Name</label>
            <input
              v-model="formName"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Enter form name"
            >
          </div>

          <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-1">Form Description</label>
            <textarea
              v-model="formDescription"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows="3"
              placeholder="Describe the purpose of this form"
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-1">Form ID</label>
            <input
              v-model="formId"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="unique-form-id"
            >
          </div>
          
          <div class="mb-4">
            <div class="flex items-center">
              <input
                id="isPublished"
                v-model="isPublished"
                type="checkbox"
                class="mr-2"
              >
              <label
                for="isPublished"
                class="text-sm text-gray-600"
              >Published</label>
            </div>
          </div>
          
          <div class="mb-4 mt-4">
            <button
              class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              @click="exportForm"
            >
              <i class="fas fa-file-export mr-2" />Export Form
            </button>
          </div>
          
          <div class="field-picker mt-8">
            <h3 class="font-medium text-gray-700 mb-3">
              Add New Field
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="fieldType in fieldTypes"
                :key="fieldType.type"
                class="field-type-button"
                @click="addControl(fieldType.type as ControlType)"
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
import { ref, computed, defineEmits, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import draggable from "vuedraggable";
import PropertiesPanel from "../components/ui/PropertiesPanel.vue";
import DraggableItem from "../components/ui/DraggableItem.vue";
import FieldTypeSelector from "../components/ui/FieldTypeSelector.vue";
import { Control, ControlType } from "../types";

const emit = defineEmits(['form-data-change']);

// Form configuration
const formName = ref("New Form");
const formDescription = ref("");
const formId = ref(`form-${Date.now()}`);
const isPublished = ref(false);

// Form state
const tabs = ref<Array<{ label: string; sections: any[] }>>([
  {
    label: "Tab 1",
    sections: [],
  },
]);

const activeTab = ref(0);
const selectedTab = ref<number | null>(null);
const selectedControl = ref<Control | null>(null);
const selectedSection = ref<string | null>(null);
const selectedColumn = ref<{sectionId: string; columnIndex: number} | null>(null);
const selectedRow = ref<{sectionId: string; rowIndex: number} | null>(null);

// Tab editing state
const editingTabIndex = ref<number | null>(null);

// Field selector state
const showFieldSelector = ref(false);
const activeSection = ref<string | null>(null);
const activeRowIndex = ref<number | null>(null);
const activeColumn = ref<number | null>(null);

// Emit form data changes whenever relevant data changes
watch([formName, formDescription, formId, isPublished, tabs], () => {
  emitFormDataChange();
}, { deep: true });

// Function to emit the current form structure to parent component
function emitFormDataChange() {
  const formStructure = {
    metadata: {
      formName: formName.value,
      formDescription: formDescription.value,
      formId: formId.value,
      isPublished: isPublished.value,
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    tabs: tabs.value
  };
  
  // Save to localStorage for compatibility
  localStorage.setItem('savedFormStructure', JSON.stringify(formStructure));
  
  // Emit to parent
  emit('form-data-change', formStructure);
}

function openTabProperties(index: number) {
  // Select the tab for editing in the sidebar
  selectedTab.value = index;
  // Clear other selections
  selectedControl.value = null;
  selectedSection.value = null;
}

function closeTabProperties() {
  selectedTab.value = null;
}

// Computed property for current tab sections (with getter and setter)
const currentTabSections = computed({
  get() {
    return tabs.value[activeTab.value]?.sections || [];
  },
  set(newSections) {
    if (tabs.value[activeTab.value]) {
      tabs.value[activeTab.value].sections = newSections;
    }
  },
});

// Field types
const fieldTypes = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Text Area" },
  { type: "select", label: "Select" },
  { type: "check", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "file", label: "File" },
  { type: "number", label: "Number" },
  { type: "link", label: "Link" },
];

// Add a new tab
function addTab() {
  // Generate a unique name for the tab
  const tabNumber = tabs.value.length + 1;
  const tabName = `Tab ${tabNumber}`;
  // Create a new tab with proper structure
  const newTab = {
    label: tabName,
    sections: [],
  };
  // Add the new tab to the tabs array
  tabs.value.push(newTab);
  // Set the active tab to the newly created tab
  activeTab.value = tabs.value.length - 1;
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
    // Process rows, columns and their fields
    if (section.rows) {
      section.rows.forEach((row: any) => {
        // Assign new ID to row
        row.id = uuidv4();
        
        if (row.columns) {
          row.columns.forEach((column: any) => {
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
    } else if (section.columns) {
      // Handle legacy sections with direct columns (for backward compatibility)
      section.columns.forEach((column: any) => {
        if (column.fields) {
          column.fields.forEach((field: any) => {
            field.id = uuidv4();
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
    rows: [
      {
        id: uuidv4(),
        columns: [
          {
            fields: [],
          },
        ],
      }
    ],
  };
  if (tabs.value[activeTab.value]) {
    tabs.value[activeTab.value].sections.push(newSection);
  }
}

// Delete a section by id
function deleteSection(sectionId: string) {
  const sections = currentTabSections.value;
  const index = sections.findIndex((section: any) => section.id === sectionId);
  if (index !== -1) {
    sections.splice(index, 1);
    if (selectedSection.value === sectionId) {
      selectedSection.value = null;
    }
  }
}

// Select a section
function selectSection(section: any) {
  selectedSection.value = section.id;
  selectedControl.value = null;
  selectedColumn.value = null;
  selectedTab.value = null; // Clear the selected tab when selecting a section
}

// Select a column
function selectColumn(sectionId: string, columnIndex: number) {
  selectedColumn.value = { sectionId, columnIndex };
  selectedSection.value = null;
  selectedControl.value = null;
  selectedTab.value = null; // Clear the selected tab when selecting a column
}

// Select a row
function selectRow(sectionId: string, rowIndex: number) {
  selectedRow.value = { sectionId, rowIndex };
  selectedSection.value = null;
  selectedControl.value = null;
  selectedColumn.value = null;
  selectedTab.value = null;
}

// Add a row to a section
function addRowToSection(section: any) {
  section.rows.push({
    id: uuidv4(),
    columns: [
      {
        fields: [],
      },
    ],
  });
}

// Delete a row from a section
function deleteRow(sectionId: string, rowIndex: number) {
  const section = getSectionById(sectionId);
  // Only allow deleting if there's more than one row
  if (section.rows && section.rows.length > 1) {
    // Check if any columns in the row have fields
    const rowHasFields = section.rows[rowIndex].columns.some(
      (column: any) => column.fields && column.fields.length > 0
    );
    
    if (rowHasFields) {
      if (confirm("This row contains fields. Are you sure you want to delete it?")) {
        section.rows.splice(rowIndex, 1);
        if (selectedRow.value?.sectionId === sectionId && selectedRow.value?.rowIndex === rowIndex) {
          selectedRow.value = null;
        }
      }
    } else {
      section.rows.splice(rowIndex, 1);
      if (selectedRow.value?.sectionId === sectionId && selectedRow.value?.rowIndex === rowIndex) {
        selectedRow.value = null;
      }
    }
  } else {
    alert("Cannot delete the only row in a section.");
  }
}

// Get section by id
function getSectionById(id: string) {
  return currentTabSections.value.find((section) => section.id === id) || {};
}

// Delete a column from a section
function deleteColumn(sectionId: string, columnIndex: number) {
  const section = getSectionById(sectionId);
  // Only allow deleting if there's more than one column
  if (section.columns && section.columns.length > 1) {
    // If there are fields in this column, confirm deletion
    if (section.columns[columnIndex].fields && section.columns[columnIndex].fields.length > 0) {
      if (confirm("This column contains fields. Are you sure you want to delete it?")) {
        section.columns.splice(columnIndex, 1);
        selectedColumn.value = null;
      }
    } else {
      section.columns.splice(columnIndex, 1);
      selectedColumn.value = null;
    }
  } else {
    alert("Cannot delete the only column in a section.");
  }
}

// Field selector functions
function openFieldSelector(section: any, rowIndex: number, colIndex: number) {
  showFieldSelector.value = true;
  activeSection.value = section.id;
  activeRowIndex.value = rowIndex;
  activeColumn.value = colIndex;
}

function closeFieldSelector() {
  showFieldSelector.value = false;
  activeSection.value = null;
  activeRowIndex.value = null;
  activeColumn.value = null;
}

// Add a field to a column
function addFieldToColumn(
  section: any,
  rowIndex: number,
  columnIndex: number,
  type: ControlType = "text"
) {
  const newControl: Control = {
    id: uuidv4(),
    type,
    label: `New ${type}`,
    name: `field_${Date.now()}`,
    required: false,
    placeholder: "",
    options:
      type === "select" ? [{ label: "Option 1", value: "option_1" }] : [],
    order: 0,
  };
  section.rows[rowIndex].columns[columnIndex].fields.push(newControl);
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
    placeholder: "",
    options:
      type === "select" ? [{ label: "Option 1", value: "option_1" }] : [],
    order: 0,
  };
  // Try to add to the first column of the first section if exists
  const sections = currentTabSections.value;
  if (sections.length > 0 && sections[0].rows && sections[0].rows[0].columns.length > 0) {
    sections[0].rows[0].columns[0].fields.push(newControl);
  } else {
    // Create a section if none exists
    addSection();
    // After adding a section, get the sections again
    if (tabs.value[activeTab.value]?.sections[0]?.rows[0]?.columns[0]) {
      tabs.value[activeTab.value].sections[0].rows[0].columns[0].fields.push(
        newControl
      );
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
  // Find and remove the control from any section/row/column
  const sections = currentTabSections.value;
  for (const section of sections) {
    // Check if section uses the row structure
    if (section.rows) {
      // Look through rows
      for (const row of section.rows) {
        // Look through columns in the row
        for (const column of row.columns) {
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
    } else if (section.columns) {
      // Legacy support for sections with direct columns
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
}

// Update control properties
function updateControlProps(updatedControl: Control) {
  // Find and update the control in our data structure
  const sections = currentTabSections.value;
  for (const section of sections) {
    if (section.rows) {
      for (const row of section.rows) {
        for (const column of row.columns) {
          const index = column.fields.findIndex(
            (field: any) => field.id === updatedControl.id
          );
          if (index !== -1) {
            column.fields[index] = { ...updatedControl };
            return;
          }
        }
      }
    } else if (section.columns) {
      for (const column of section.columns) {
        const index = column.fields.findIndex(
          (field: any) => field.id === updatedControl.id
        );
        if (index !== -1) {
          column.fields[index] = { ...updatedControl };
          return;
        }
      }
    }
  }
}

function openSectionMenu(section: any) {
  // Implement section menu functionality here; for now, just show an alert
  alert(`Open menu for section: ${section.title || "Untitled Section"}`);
}

// Handle tab reordering
function handleTabOrderChanged() {
  // If active tab content moved, update the activeTab index to follow it
  const newActiveTabIndex = tabs.value.findIndex(
    (_, i) => i === activeTab.value
  );
  if (newActiveTabIndex !== -1) {
    activeTab.value = newActiveTabIndex;
  } else {
    // If the tab wasn't found (unlikely), set to first tab
    activeTab.value = 0;
  }
}

// Delete a tab function for the Tab Properties sidebar
function deleteTab(index: number) {
  if (tabs.value.length > 1) {
    tabs.value.splice(index, 1);
    closeTabProperties();
    if (activeTab.value >= tabs.value.length) {
      activeTab.value = tabs.value.length - 1;
    }
  }
}

// Add a column to a specific row
function addColumnToRow(section: any, rowIndex: number) {
  if (section.rows[rowIndex].columns.length < 3) {
    section.rows[rowIndex].columns.push({
      fields: [],
    });
  }
}

// Export form structure as JSON
function exportForm() {
  // Create form structure object with metadata and form content
  const formStructure = {
    metadata: {
      formName: formName.value,
      formDescription: formDescription.value,
      formId: formId.value,
      isPublished: isPublished.value,
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    tabs: tabs.value
  };
  
  // Convert to JSON string
  const jsonContent = JSON.stringify(formStructure, null, 2);
  
  // Save to localStorage for preview functionality
  localStorage.setItem('savedFormStructure', jsonContent);
  
  // Create a blob and download link
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${formName.value || 'form'}-${formId.value}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Replace the IIFE with a named function that can be called on mount
function loadSavedForm() {
  const savedForm = localStorage.getItem('savedFormStructure');
  if (savedForm) {
    try {
      const parsedForm = JSON.parse(savedForm);
      // Only update if there's valid data
      if (parsedForm.metadata && parsedForm.tabs && parsedForm.tabs.length) {
        formName.value = parsedForm.metadata.formName || formName.value;
        formDescription.value = parsedForm.metadata.formDescription || formDescription.value;
        formId.value = parsedForm.metadata.formId || formId.value;
        isPublished.value = parsedForm.metadata.isPublished || isPublished.value;
        tabs.value = parsedForm.tabs;
      }
    } catch (error) {
      // Silent fail, keep default form
    }
  }
}

// Ensure the form data loads properly on component mount
onMounted(() => {
  loadSavedForm();
});
</script>

<style>
/* Import the Frappe Form Builder CSS */
@import "../assets/frappe-form-builder.css";

.section-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

.row-wrapper {
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  background-color: #F9FAFB;
  padding: 8px;
}

.row-wrapper.selected-row {
  border: 2px solid #4F46E5;
}

.row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 8px;
  background-color: #F3F4F6;
  border-radius: 4px 4px 0 0;
  font-weight: 500;
  font-size: 13px;
  color: #4B5563;
  cursor: pointer;
}

.row-header:hover {
  background-color: #E5E7EB;
}

.row-columns {
  display: flex;
  gap: 12px;
}

.row-actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.add-row-button {
  background-color: #F3F4F6;
  color: #4B5563;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #D1D5DB;
  cursor: pointer;
  transition: all 0.2s;
}

.add-row-button:hover {
  background-color: #E5E7EB;
}

.column-wrapper {
  position: relative;
  flex: 1;
}

.column-wrapper.selected-column .column {
  border: 2px solid #4F46E5;
  border-radius: 4px;
}

.column-header {
  padding: 4px 8px;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  background-color: #F3F4F6;
  border-radius: 4px 4px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-header:hover {
  background-color: #E5E7EB;
}
</style>
