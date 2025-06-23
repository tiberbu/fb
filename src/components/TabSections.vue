<template>
  <div class="tab-sections">
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
          @click="$emit('add-section')"
        >
          <i class="fas fa-plus text-xs mr-1" />
          <span>Add Section</span>
        </button>
      </div>
    </div>

    <draggable
      :model-value="currentTabSections"
      @update:model-value="$emit('update-sections', $event)"
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
            @click="$emit('select-section', section)"
          >
            <div class="section-title">
              <span>{{ section.title || "Untitled Section" }}</span>
              <i
                v-if="section.collapsible"
                class="fas fa-chevron-down ml-2"
              />
            </div>
            <div class="section-actions">
              <button @click.stop="$emit('open-section-menu', section)">
                <i class="fas fa-ellipsis-h" />
              </button>
            </div>
          </div>

          <div class="section-rows">
            <div
              v-for="(row, rowIndex) in section.rows"
              :key="row.id"
              class="row-wrapper"
              :class="{ 'selected-row': selectedRow?.sectionId === section.id && selectedRow?.rowIndex === rowIndex }"
            >
              <div 
                class="row-header"
                @click="$emit('select-row', section.id, rowIndex)"
              >
                <span>Row {{ rowIndex + 1 }}</span>
                <button 
                  @click.stop="$emit('delete-row', section.id, rowIndex)"
                  class="text-red-500 hover:text-red-700 text-xs"
                >
                  <i class="fas fa-trash" />
                </button>
              </div>
              
              <div class="row-columns">
                <div
                  v-for="(column, colIndex) in row.columns"
                  :key="colIndex"
                  class="column-wrapper"
                  :class="{ 
                    'selected-column': selectedColumn?.sectionId === section.id && selectedColumn?.columnIndex === colIndex 
                  }"
                >
                  <div 
                    class="column-header"
                    @click="$emit('select-column', section.id, colIndex)"
                  >
                    <span>Column {{ colIndex + 1 }}</span>
                  </div>
                  
                  <draggable
                    :model-value="column.fields"
                    @update:model-value="$emit('update-column-fields', section.id, colIndex, $event)"
                    group="fields"
                    item-key="id"
                    ghost-class="ghost-item"
                    class="column"
                  >
                    <template #item="{ element: field }">
                      <DraggableItem
                        :control="field"
                        @edit="$emit('edit-control', field)"
                        @delete="$emit('delete-control', field.id)"
                      />
                    </template>
                    <template #footer>
                      <div class="add-field-container relative">
                        <button
                          class="add-field-button"
                          @click="$emit('open-field-selector', section, rowIndex, colIndex)"
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
                                $emit('add-field-to-column', section, rowIndex, colIndex, type)
                            "
                            @close="$emit('close-field-selector')"
                          />
                        </div>
                      </div>
                    </template>
                  </draggable>
                </div>

                <button
                  v-if="row.columns.length < 3"
                  class="add-column-button"
                  @click="$emit('add-column-to-row', section, rowIndex)"
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
              @click="$emit('add-row-to-section', section)"
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
        @click="$emit('add-section')"
      >
        <i class="fas fa-plus text-xs mr-1" />
        Add Section
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import DraggableItem from "./ui/DraggableItem.vue";
import FieldTypeSelector from "./ui/FieldTypeSelector.vue";

// Props
defineProps<{
  currentTabSections: any[];
  selectedSection: string | null;
  selectedRow: { sectionId: string; rowIndex: number } | null;
  selectedColumn: { sectionId: string; columnIndex: number } | null;
  showFieldSelector: boolean;
  activeSection: string | null;
  activeRowIndex: number | null;
  activeColumn: number | null;
}>();

// Emits
defineEmits([
  'add-section',
  'select-section',
  'open-section-menu',
  'select-row',
  'delete-row',
  'select-column',
  'edit-control',
  'delete-control',
  'open-field-selector',
  'add-field-to-column',
  'close-field-selector',
  'add-column-to-row',
  'add-row-to-section',
  'update-sections',
  'update-column-fields'
]);
</script>
