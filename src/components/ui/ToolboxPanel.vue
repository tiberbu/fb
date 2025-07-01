<template>
  <div class="toolbox-panel">
    <!-- Tab Navigation -->
    <div class="tabs-nav mb-4">
      <button
        class="tab-button"
        :class="{ 'active': activeTab === 'new' }"
        @click="activeTab = 'new'"
      >
        <i class="fas fa-plus mr-2" />
        New Fields
      </button>
      <button
        class="tab-button"
        :class="{ 'active': activeTab === 'stored' }"
        @click="activeTab = 'stored'"
      >
        <i class="fas fa-archive mr-2" />
        Stored Fields
      </button>
    </div>

    <!-- New Fields Tab -->
    <div 
      v-if="activeTab === 'new'"
      class="tab-content"
    >
      <h3 class="section-title">
        Create New Field
      </h3>
      
      <!-- Search for new field types -->
      <div class="search-box mb-4">
        <i class="fas fa-search search-icon" />
        <input
          v-model="newFieldSearch"
          type="text"
          placeholder="Search field types..."
          class="search-input"
        >
      </div>

      <!-- Field type categories -->
      <div class="field-categories">
        <div
          v-for="category in filteredNewFieldCategories"
          :key="category.name"
          class="category-section mb-4"
        >
          <h4 class="category-title">{{ category.name }}</h4>
          <div class="field-types grid grid-cols-2 gap-2">
            <button
              v-for="fieldType in category.types"
              :key="fieldType.type"
              class="field-type-button"
              @click="addNewField(fieldType.type)"
            >
              <i :class="fieldType.icon" />
              <span>{{ fieldType.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stored Fields Tab -->
    <div v-if="activeTab === 'stored'" class="tab-content">
      <h3 class="section-title">Reuse Saved Fields</h3>
      
      <!-- Search and filter for stored fields -->
      <div class="search-box mb-3">
        <i class="fas fa-search search-icon" />
        <input
          v-model="storedFieldSearch"
          type="text"
          placeholder="Search saved fields..."
          class="search-input"
          @input="searchStoredFields"
        >
      </div>

      <!-- Field type filter -->
      <div class="filter-section mb-4">
        <select
          v-model="selectedFieldType"
          class="filter-select"
          @change="searchStoredFields"
        >
          <option value="">All Types</option>
          <option 
            v-for="type in fieldTypes" 
            :key="type"
            :value="type"
          >
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </option>
        </select>
      </div>

      <!-- Loading state -->
      <div v-if="isLoadingStoredFields" class="loading-state">
        <i class="fas fa-spinner fa-spin mr-2" />
        Loading stored fields...
      </div>

      <!-- Stored fields list -->
      <div v-else-if="storedFields.length > 0" class="stored-fields-list">
        <div
          v-for="field in storedFields"
          :key="field._id"
          class="stored-field-item"
          @click="addStoredField(field)"
        >
          <div class="field-info">
            <div class="field-header">
              <i :class="getFieldIcon(field.type)" />
              <span class="field-label">{{ field.label }}</span>
              <span class="field-type">{{ field.type }}</span>
            </div>
            <div v-if="field.description" class="field-description">
              {{ field.description }}
            </div>
            <div class="field-meta">
              <span class="usage-count">
                <i class="fas fa-chart-bar mr-1" />
                Used {{ field.usageCount }} times
              </span>
              <span class="field-tags">
                <i 
                  v-for="tag in field.tags.slice(0, 3)"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </i>
              </span>
            </div>
          </div>
          <div class="field-actions">
            <button
              class="action-button edit"
              title="Edit stored field"
              @click.stop="editStoredField(field)"
            >
              <i class="fas fa-edit" />
            </button>
            <button
              class="action-button delete"
              title="Delete stored field"
              @click.stop="deleteStoredField(field)"
            >
              <i class="fas fa-trash" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!isLoadingStoredFields" class="empty-state">
        <i class="fas fa-inbox text-4xl text-gray-400 mb-3" />
        <p class="text-gray-600">No stored fields found</p>
        <p class="text-xs text-gray-500">
          Save field configurations to reuse them later
        </p>
      </div>

      <!-- Pagination for stored fields -->
      <div 
        v-if="storedFields.length > 0 && pagination.totalPages > 1"
        class="pagination mt-4"
      >
        <button
          class="pagination-button"
          :disabled="pagination.currentPage <= 1"
          @click="changePage(pagination.currentPage - 1)"
        >
          <i class="fas fa-chevron-left" />
        </button>
        <span class="pagination-info">
          {{ pagination.currentPage }} / {{ pagination.totalPages }}
        </span>
        <button
          class="pagination-button"
          :disabled="pagination.currentPage >= pagination.totalPages"
          @click="changePage(pagination.currentPage + 1)"
        >
          <i class="fas fa-chevron-right" />
        </button>
      </div>
    </div>

    <!-- Save Field Modal -->
    <SaveFieldModal
      v-if="showSaveModal && fieldToSave"
      :field="fieldToSave"
      @save="handleSaveField"
      @cancel="showSaveModal = false"
    />

    <!-- Edit Stored Field Modal -->
    <EditStoredFieldModal
      v-if="showEditModal && fieldToEdit"
      :field="fieldToEdit"
      @save="handleEditField"
      @cancel="showEditModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useFormBuilderStore } from '../../stores/form-builder-store';
import { StoredFieldsAPI, type StoredField } from '../../services/StoredFieldsAPI';
import { useToast } from '../../composables/useToast';
import type { Control } from '../../types';
import SaveFieldModal from './SaveFieldModal.vue';
import EditStoredFieldModal from './EditStoredFieldModal.vue';

const store = useFormBuilderStore();
const toast = useToast();

// Tab state
const activeTab = ref<'new' | 'stored'>('new');

// New fields state
const newFieldSearch = ref('');

// Stored fields state
const storedFieldSearch = ref('');
const selectedFieldType = ref('');
const storedFields = ref<StoredField[]>([]);
const isLoadingStoredFields = ref(false);
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10
});

// Modal state
const showSaveModal = ref(false);
const fieldToSave = ref<Control | null>(null);
const showEditModal = ref(false);
const fieldToEdit = ref<StoredField | null>(null);

// Field types for filtering
const fieldTypes = [
  'text', 'textarea', 'number', 'email', 'phone', 'url', 'password',
  'select', 'radio', 'checkbox', 'date', 'datetime', 'time',
  'file', 'image', 'range', 'color', 'hidden', 'readonly', 'table'
];

// New field categories
const newFieldCategories = [
  {
    name: 'Basic Fields',
    types: [
      { type: 'text', label: 'Text', icon: 'fas fa-font' },
      { type: 'textarea', label: 'Text Area', icon: 'fas fa-align-left' },
      { type: 'number', label: 'Number', icon: 'fas fa-hashtag' },
      { type: 'email', label: 'Email', icon: 'fas fa-envelope' },
      { type: 'phone', label: 'Phone', icon: 'fas fa-phone' },
      { type: 'url', label: 'URL', icon: 'fas fa-link' },
      { type: 'password', label: 'Password', icon: 'fas fa-lock' }
    ]
  },
  {
    name: 'Choice Fields',
    types: [
      { type: 'select', label: 'Select', icon: 'fas fa-caret-down' },
      { type: 'radio', label: 'Radio', icon: 'fas fa-dot-circle' },
      { type: 'checkbox', label: 'Checkbox', icon: 'fas fa-check-square' }
    ]
  },
  {
    name: 'Date & Time',
    types: [
      { type: 'date', label: 'Date', icon: 'fas fa-calendar-alt' },
      { type: 'datetime', label: 'Date Time', icon: 'fas fa-calendar-plus' },
      { type: 'time', label: 'Time', icon: 'fas fa-clock' }
    ]
  },
  {
    name: 'File & Media',
    types: [
      { type: 'file', label: 'File Upload', icon: 'fas fa-file-upload' },
      { type: 'image', label: 'Image', icon: 'fas fa-image' }
    ]
  },
  {
    name: 'Advanced',
    types: [
      { type: 'range', label: 'Range', icon: 'fas fa-sliders-h' },
      { type: 'color', label: 'Color', icon: 'fas fa-palette' },
      { type: 'table', label: 'Table', icon: 'fas fa-table' },
      { type: 'hidden', label: 'Hidden', icon: 'fas fa-eye-slash' },
      { type: 'readonly', label: 'Read Only', icon: 'fas fa-eye' }
    ]
  }
];

// Computed properties
const filteredNewFieldCategories = computed(() => {
  if (!newFieldSearch.value) return newFieldCategories;
  
  const searchTerm = newFieldSearch.value.toLowerCase();
  return newFieldCategories.map(category => ({
    ...category,
    types: category.types.filter(type => 
      type.label.toLowerCase().includes(searchTerm) || 
      type.type.toLowerCase().includes(searchTerm)
    )
  })).filter(category => category.types.length > 0);
});

// Methods
function addNewField(fieldType: string) {
  const newField = {
    id: `field_${Date.now()}`,
    type: fieldType,
    name: `${fieldType}_${Date.now()}`,
    label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`,
    required: false,
    placeholder: '',
    helpText: '',
    ...(fieldType === 'select' && { options: [] }),
    ...(fieldType === 'radio' && { options: [] })
  } as Control;

  store.addField(newField);
  toast.success(`${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} field added`);
}

async function searchStoredFields() {
  if (activeTab.value !== 'stored') return;
  
  isLoadingStoredFields.value = true;
  try {
    const response = await StoredFieldsAPI.getStoredFields({
      search: storedFieldSearch.value,
      type: selectedFieldType.value,
      page: pagination.value.currentPage,
      limit: pagination.value.itemsPerPage
    });

    storedFields.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error searching stored fields:', error);
    toast.error('Failed to load stored fields');
  } finally {
    isLoadingStoredFields.value = false;
  }
}

async function addStoredField(storedField: StoredField) {
  try {
    // Create a new field from the stored field data
    const newField = {
      ...storedField.fieldData,
      id: `field_${Date.now()}`, // Generate new ID
      name: `${storedField.fieldData.name}_${Date.now()}` // Make name unique
    } as Control;

    store.addField(newField);
    
    // Mark the stored field as used
    await StoredFieldsAPI.markFieldAsUsed(storedField._id);
    
    toast.success(`Added "${storedField.label}" field to form`);
    
    // Refresh the stored fields to update usage count
    await searchStoredFields();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error adding stored field:', error);
    toast.error('Failed to add stored field');
  }
}

function editStoredField(field: StoredField) {
  fieldToEdit.value = field;
  showEditModal.value = true;
}

async function deleteStoredField(field: StoredField) {
  if (confirm(`Are you sure you want to delete "${field.label}"?`)) {
    try {
      await StoredFieldsAPI.deleteStoredField(field._id);
      toast.success('Stored field deleted');
      await searchStoredFields();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting stored field:', error);
      toast.error('Failed to delete stored field');
    }
  }
}

async function changePage(page: number) {
  pagination.value.currentPage = page;
  await searchStoredFields();
}

async function handleSaveField(fieldData: { name: string; description: string; tags: string[] }) {
  if (!fieldToSave.value) return;
  
  try {
    await StoredFieldsAPI.saveFieldConfiguration(fieldToSave.value, fieldData);
    toast.success('Field configuration saved');
    showSaveModal.value = false;
    fieldToSave.value = null;
    
    // Refresh stored fields if we're on that tab
    if (activeTab.value === 'stored') {
      await searchStoredFields();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving field:', error);
    toast.error('Failed to save field configuration');
  }
}

async function handleEditField(updatedField: StoredField) {
  try {
    await StoredFieldsAPI.updateStoredField(updatedField._id, {
      name: updatedField.name,
      label: updatedField.label,
      description: updatedField.description,
      tags: updatedField.tags
    });
    toast.success('Stored field updated');
    showEditModal.value = false;
    fieldToEdit.value = null;
    await searchStoredFields();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating stored field:', error);
    toast.error('Failed to update stored field');
  }
}

function getFieldIcon(fieldType: string): string {
  const iconMap: Record<string, string> = {
    text: 'fas fa-font',
    textarea: 'fas fa-align-left',
    number: 'fas fa-hashtag',
    email: 'fas fa-envelope',
    phone: 'fas fa-phone',
    url: 'fas fa-link',
    password: 'fas fa-lock',
    select: 'fas fa-caret-down',
    radio: 'fas fa-dot-circle',
    checkbox: 'fas fa-check-square',
    date: 'fas fa-calendar-alt',
    datetime: 'fas fa-calendar-plus',
    time: 'fas fa-clock',
    file: 'fas fa-file-upload',
    image: 'fas fa-image',
    range: 'fas fa-sliders-h',
    color: 'fas fa-palette',
    table: 'fas fa-table',
    hidden: 'fas fa-eye-slash',
    readonly: 'fas fa-eye'
  };
  return iconMap[fieldType] || 'fas fa-question-circle';
}

// Event handlers for field saving
function handleFieldSave(control: Control) {
  fieldToSave.value = control;
  showSaveModal.value = true;
}

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'stored') {
    searchStoredFields();
  }
});

// Load stored fields on mount if the stored tab is active
onMounted(() => {
  if (activeTab.value === 'stored') {
    searchStoredFields();
  }
  
  // Listen for field save events from the form builder
  // In a real app, you might use a global event bus or store
});

// Expose method for saving fields from external components
defineExpose({
  saveField: handleFieldSave
});
</script>

<style scoped>
.toolbox-panel {
  background-color: white;
  border-right: 1px solid #e5e7eb;
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

/* Tab Navigation */
.tabs-nav {
  display: flex;
  background-color: #f3f4f6;
  border-radius: 6px;
  padding: 2px;
}

.tab-button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-button:hover {
  color: #374151;
}

.tab-button.active {
  background-color: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Section Titles */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.category-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Search Box */
.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Filter Select */
.filter-select {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
}

/* Field Types Grid */
.field-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.field-type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
  text-align: center;
}

.field-type-button:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  color: #3b82f6;
}

.field-type-button i {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Stored Fields List */
.stored-fields-list {
  max-height: 60vh;
  overflow-y: auto;
}

.stored-field-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;
}

.stored-field-item:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.field-info {
  flex: 1;
  min-width: 0;
}

.field-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.field-header i {
  color: #6b7280;
  margin-right: 8px;
  font-size: 0.875rem;
}

.field-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  margin-right: 8px;
}

.field-type {
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.field-description {
  color: #6b7280;
  font-size: 0.75rem;
  margin-bottom: 6px;
  line-height: 1.4;
}

.field-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
}

.usage-count {
  color: #6b7280;
  display: flex;
  align-items: center;
}

.field-tags {
  display: flex;
  gap: 4px;
}

.tag {
  background-color: #dbeafe;
  color: #3b82f6;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 0.6875rem;
}

.field-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.stored-field-item:hover .field-actions {
  opacity: 1;
}

.action-button {
  padding: 4px 6px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background-color 0.2s;
}

.action-button.edit {
  background-color: #f3f4f6;
  color: #6b7280;
}

.action-button.edit:hover {
  background-color: #e5e7eb;
}

.action-button.delete {
  background-color: #fef2f2;
  color: #ef4444;
}

.action-button.delete:hover {
  background-color: #fee2e2;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
}

.pagination-button {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>