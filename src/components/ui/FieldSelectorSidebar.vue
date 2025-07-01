<template>
  <div 
    v-if="isOpen" 
    class="field-selector-sidebar fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col"
    style="z-index: 250;"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header flex-shrink-0 px-6 py-5 border-b border-gray-200 bg-white">
      <div class="flex items-start justify-between">
        <div class="flex-1 pr-4">
          <h2 class="text-xl font-semibold text-gray-900 mb-1">
            Add Field
          </h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Choose a field type or reuse a saved field
          </p>
        </div>
        <button
          class="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close sidebar"
          @click="$emit('close')"
        >
          <i class="fas fa-times text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex-shrink-0 px-4 pt-4 border-b border-gray-100 bg-white">
      <div class="tabs-nav flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          class="tab-button flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all"
          :class="{ 'active bg-white text-blue-600 shadow-sm': activeTab === 'new', 'text-gray-600 hover:text-gray-900': activeTab !== 'new' }"
          @click="activeTab = 'new'"
        >
          <i class="fas fa-plus mr-2" />
          New Fields
        </button>
        <button
          class="tab-button flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all"
          :class="{ 'active bg-white text-blue-600 shadow-sm': activeTab === 'stored', 'text-gray-600 hover:text-gray-900': activeTab !== 'stored' }"
          @click="activeTab = 'stored'"
        >
          <i class="fas fa-archive mr-2" />
          Saved Fields
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="flex-shrink-0 p-4 border-b border-gray-100 bg-gray-50">
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="activeTab === 'new' ? 'Search field types...' : 'Search saved fields...'"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
      </div>
      
      <!-- Field type filter for stored fields -->
      <div 
        v-if="activeTab === 'stored'" 
        class="mt-3"
      >
        <select
          v-model="typeFilter"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">
            All Types
          </option>
          <option 
            v-for="type in availableFieldTypes" 
            :key="type"
            :value="type"
          >
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <!-- New Fields Tab -->
      <div v-if="activeTab === 'new'">
        <!-- Basic Fields -->
        <div class="field-category">
          <div class="category-header sticky top-0 px-4 py-3 bg-gray-50 border-b border-gray-100 z-10">
            <h3 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Basic Fields
            </h3>
          </div>
          <div class="field-list p-3 space-y-1">
            <button
              v-for="fieldType in filteredBasicFields"
              :key="fieldType.type"
              class="field-type-item w-full flex items-center p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg text-left transition-all group"
              @click="selectFieldType(fieldType.type as ControlType)"
            >
              <div class="field-icon mr-3 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 text-sm">
                <i 
                  class="fas"
                  :class="getIconForFieldType(fieldType.type)"
                />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 text-sm">
                  {{ fieldType.label }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  {{ getFieldTypeDescription(fieldType.type) }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Advanced Fields -->
        <div class="field-category">
          <div class="category-header sticky top-0 px-4 py-3 bg-gray-50 border-b border-gray-100 z-10">
            <h3 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Advanced Fields
            </h3>
          </div>
          <div class="field-list p-3 space-y-1">
            <button
              v-for="fieldType in filteredAdvancedFields"
              :key="fieldType.type"
              class="field-type-item w-full flex items-center p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg text-left transition-all group"
              @click="selectFieldType(fieldType.type as ControlType)"
            >
              <div class="field-icon mr-3 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 text-sm">
                <i 
                  class="fas"
                  :class="getIconForFieldType(fieldType.type)"
                />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 text-sm">
                  {{ fieldType.label }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  {{ getFieldTypeDescription(fieldType.type) }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Layout & Display -->
        <div class="field-category">
          <div class="category-header sticky top-0 px-4 py-3 bg-gray-50 border-b border-gray-100 z-10">
            <h3 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Layout & Display
            </h3>
          </div>
          <div class="field-list p-3 space-y-1">
            <button
              v-for="fieldType in filteredLayoutFields"
              :key="fieldType.type"
              class="field-type-item w-full flex items-center p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg text-left transition-all group"
              @click="selectFieldType(fieldType.type as ControlType)"
            >
              <div class="field-icon mr-3 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 text-sm">
                <i 
                  class="fas"
                  :class="getIconForFieldType(fieldType.type)"
                />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 text-sm">
                  {{ fieldType.label }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  {{ getFieldTypeDescription(fieldType.type) }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- No Results for New Fields -->
        <div 
          v-if="allFilteredFields.length === 0 && searchQuery"
          class="flex items-center justify-center p-8"
        >
          <div class="text-center">
            <i class="fas fa-search text-4xl text-gray-300 mb-4" />
            <p class="text-gray-500 text-sm">
              No field types found matching "{{ searchQuery }}"
            </p>
            <p class="text-gray-400 text-xs mt-2">
              Try a different search term
            </p>
          </div>
        </div>
      </div>

      <!-- Stored Fields Tab -->
      <div v-else-if="activeTab === 'stored'">
        <!-- Loading state -->
        <div 
          v-if="isLoadingStoredFields"
          class="flex items-center justify-center p-8"
        >
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mb-3" />
            <p class="text-gray-600 text-sm">
              Loading saved fields...
            </p>
          </div>
        </div>

        <!-- Stored fields list -->
        <div 
          v-else-if="storedFields.length > 0"
          class="stored-fields-list p-3 space-y-2"
        >
          <div
            v-for="field in storedFields"
            :key="field._id"
            class="stored-field-item p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group"
            @click="selectStoredField(field)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center mb-2">
                  <div class="field-icon mr-3 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 text-sm">
                    <i 
                      class="fas"
                      :class="getIconForFieldType(field.type)"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-900 text-sm truncate">
                      {{ field.label }}
                    </h4>
                    <div class="flex items-center mt-1">
                      <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {{ field.type }}
                      </span>
                      <span class="ml-2 text-xs text-gray-500">
                        <i class="fas fa-chart-bar mr-1" />
                        {{ field.usageCount }} uses
                      </span>
                    </div>
                  </div>
                </div>
                <p 
                  v-if="field.description"
                  class="text-xs text-gray-600 mb-2 line-clamp-2"
                >
                  {{ field.description }}
                </p>
                <div 
                  v-if="field.tags && field.tags.length > 0"
                  class="flex flex-wrap gap-1"
                >
                  <span
                    v-for="tag in field.tags.slice(0, 3)"
                    :key="tag"
                    class="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                  >
                    {{ tag }}
                  </span>
                  <span
                    v-if="field.tags.length > 3"
                    class="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    +{{ field.tags.length - 3 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state for stored fields -->
        <div 
          v-else-if="!isLoadingStoredFields"
          class="flex items-center justify-center p-8"
        >
          <div class="text-center">
            <i class="fas fa-archive text-4xl text-gray-300 mb-4" />
            <p class="text-gray-500 text-sm">
              No saved fields found
            </p>
            <p class="text-gray-400 text-xs mt-2">
              Save field configurations to reuse them later
            </p>
          </div>
        </div>

        <!-- Pagination for stored fields -->
        <div 
          v-if="storedFields.length > 0 && pagination.totalPages > 1"
          class="flex items-center justify-center gap-3 p-4 border-t border-gray-100"
        >
          <button
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.currentPage <= 1"
            @click="changePage(pagination.currentPage - 1)"
          >
            <i class="fas fa-chevron-left" />
          </button>
          <span class="text-sm text-gray-600">
            {{ pagination.currentPage }} / {{ pagination.totalPages }}
          </span>
          <button
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.currentPage >= pagination.totalPages"
            @click="changePage(pagination.currentPage + 1)"
          >
            <i class="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black bg-opacity-25"
    style="z-index: 240;"
    @click="$emit('close')"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { ControlType, Control } from '@/types'
import { StoredFieldsAPI } from '@/services/StoredFieldsAPI'
import { useToast } from '@/composables/useToast'

interface FieldType {
  type: string
  label: string
}

interface StoredField {
  _id: string
  name: string
  label: string
  type: string
  description?: string
  tags?: string[]
  usageCount: number
  configuration: any
  fieldData: Control
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'select-field-type', fieldType: ControlType): void
  (e: 'select-stored-field', control: Control): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { success: showToast } = useToast()

// Keep reference to props for potential future use
const isOpen = computed(() => props.isOpen)

// Reactive state
const activeTab = ref<'new' | 'stored'>('new')
const searchQuery = ref('')
const storedFieldSearchQuery = ref('')
const isLoadingStoredFields = ref(false)
const storedFields = ref<StoredField[]>([])
const typeFilter = ref('')
const sortBy = ref<'name' | 'usageCount' | 'createdAt'>('name')

// Pagination state
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 20
})

// Field type definitions
const FIELD_TYPES: FieldType[] = [
  // Basic Fields
  { type: 'text', label: 'Text Input' },
  { type: 'textarea', label: 'Text Area' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Phone' },
  { type: 'number', label: 'Number' },
  { type: 'currency', label: 'Currency' },
  { type: 'date', label: 'Date' },
  { type: 'time', label: 'Time' },
  { type: 'datetime', label: 'Date & Time' },
  { type: 'select', label: 'Select' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'radio', label: 'Radio' },
  { type: 'file', label: 'File Upload' },
  
  // Advanced Fields
  { type: 'multiselect', label: 'Multi-Select' },
  { type: 'rating', label: 'Rating' },
  { type: 'slider', label: 'Slider' },
  { type: 'password', label: 'Password' },
  { type: 'url', label: 'URL' },
  { type: 'color', label: 'Color Picker' },
  { type: 'image', label: 'Image Upload' },
  { type: 'signature', label: 'Signature' },
  { type: 'geolocation', label: 'Geolocation' },
  { type: 'table', label: 'Table' },
  
  // Layout & Display
  { type: 'html', label: 'HTML' },
  { type: 'heading', label: 'Heading' },
  { type: 'break', label: 'Line Break' },
  { type: 'divider', label: 'Divider' }
]

const BASIC_FIELD_TYPES = ['text', 'textarea', 'email', 'phone', 'number', 'currency', 'date', 'time', 'datetime', 'select', 'checkbox', 'radio', 'file']
const ADVANCED_FIELD_TYPES = ['multiselect', 'rating', 'slider', 'password', 'url', 'color', 'image', 'signature', 'geolocation', 'table']
const LAYOUT_FIELD_TYPES = ['html', 'heading', 'break', 'divider']

// Computed properties
const filteredFields = computed(() => {
  if (!searchQuery.value) return FIELD_TYPES
  return FIELD_TYPES.filter(field => 
    field.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    field.type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredBasicFields = computed(() => 
  filteredFields.value.filter(field => BASIC_FIELD_TYPES.includes(field.type))
)

const filteredAdvancedFields = computed(() => 
  filteredFields.value.filter(field => ADVANCED_FIELD_TYPES.includes(field.type))
)

const filteredLayoutFields = computed(() => 
  filteredFields.value.filter(field => LAYOUT_FIELD_TYPES.includes(field.type))
)

const allFilteredFields = computed(() => [
  ...filteredBasicFields.value,
  ...filteredAdvancedFields.value,
  ...filteredLayoutFields.value
])

const availableFieldTypes = computed(() => {
  return Array.from(new Set(FIELD_TYPES.map(f => f.type))).sort()
})

// Methods
const selectFieldType = (fieldType: ControlType) => {
  emit('select-field-type', fieldType)
}

const selectStoredField = async (field: StoredField) => {
  try {
    // Check if fieldData exists, otherwise fall back to configuration
    let controlData
    if (field.fieldData) {
      controlData = field.fieldData
    } else if (field.configuration) {
      // Fallback to configuration if fieldData doesn't exist
      controlData = {
        type: field.type,
        label: field.label,
        name: field.name,
        required: false,
        ...field.configuration
      }
    } else {
      // Create basic control from field properties
      controlData = {
        type: field.type,
        label: field.label,
        name: field.name,
        required: false
      }
    }
    
    // Use the stored fieldData which contains the complete Control configuration
    const control: Control = {
      ...controlData,
      id: `field_${Date.now()}`, // Generate new unique ID
      name: controlData.name || `field_${Date.now()}`, // Ensure we have a name
      order: 0 // Reset order for new field
    }

    // Emit the stored field selection to parent component
    emit('select-stored-field', control)

    // Track usage
    await StoredFieldsAPI.markFieldAsUsed(field._id)
    
    // Update local usage count
    const fieldIndex = storedFields.value.findIndex(f => f._id === field._id)
    if (fieldIndex !== -1) {
      storedFields.value[fieldIndex].usageCount++
    }

    showToast('Field added to form successfully')
    emit('close')
  } catch (error) {
    showToast('Failed to add field to form')
  }
}

const loadStoredFields = async () => {
  if (isLoadingStoredFields.value) return

  try {
    isLoadingStoredFields.value = true
    
    const response = await StoredFieldsAPI.getStoredFields({
      search: storedFieldSearchQuery.value,
      type: typeFilter.value || undefined,
      page: pagination.value.currentPage,
      limit: pagination.value.pageSize,
      sortBy: sortBy.value
    })

    storedFields.value = response.data
    pagination.value = {
      currentPage: response.pagination.currentPage,
      totalPages: response.pagination.totalPages,
      totalItems: response.pagination.totalItems,
      pageSize: pagination.value.pageSize
    }
  } catch (error) {
    showToast('Failed to load saved fields')
  } finally {
    isLoadingStoredFields.value = false
  }
}

const changePage = async (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.currentPage = page
  await loadStoredFields()
}

const getIconForFieldType = (type: string): string => {
  const iconMap: Record<string, string> = {
    text: 'fa-font',
    textarea: 'fa-align-left',
    email: 'fa-envelope',
    phone: 'fa-phone',
    number: 'fa-hashtag',
    currency: 'fa-dollar-sign',
    date: 'fa-calendar',
    time: 'fa-clock',
    datetime: 'fa-calendar-alt',
    select: 'fa-list',
    multiselect: 'fa-list-check',
    checkbox: 'fa-check-square',
    radio: 'fa-dot-circle',
    file: 'fa-file',
    image: 'fa-image',
    rating: 'fa-star',
    slider: 'fa-sliders-h',
    password: 'fa-lock',
    url: 'fa-link',
    color: 'fa-palette',
    signature: 'fa-signature',
    geolocation: 'fa-map-marker-alt',
    table: 'fa-table',
    html: 'fa-code',
    heading: 'fa-heading',
    break: 'fa-minus',
    divider: 'fa-grip-lines'
  }
  return iconMap[type] || 'fa-question'
}

const getFieldTypeDescription = (type: string): string => {
  const descriptionMap: Record<string, string> = {
    text: 'Single line text input',
    textarea: 'Multi-line text input',
    email: 'Email address input',
    phone: 'Phone number input',
    number: 'Numeric input',
    currency: 'Currency amount input',
    date: 'Date picker',
    time: 'Time picker',
    datetime: 'Date and time picker',
    select: 'Single choice dropdown',
    multiselect: 'Multiple choice dropdown',
    checkbox: 'Single checkbox',
    radio: 'Radio button group',
    file: 'File upload',
    image: 'Image upload',
    rating: 'Star rating input',
    slider: 'Range slider',
    password: 'Password input',
    url: 'URL input',
    color: 'Color picker',
    signature: 'Digital signature',
    geolocation: 'Location coordinates',
    table: 'Data table',
    html: 'Custom HTML content',
    heading: 'Section heading',
    break: 'Line break',
    divider: 'Visual divider'
  }
  return descriptionMap[type] || 'Unknown field type'
}

// Watchers
watch(activeTab, (newTab) => {
  if (newTab === 'stored') {
    loadStoredFields()
  }
})

// Debounced watch for search and filters
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch([storedFieldSearchQuery, typeFilter, sortBy], () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
    loadStoredFields()
  }, 300)
})

// Lifecycle
onMounted(() => {
  if (activeTab.value === 'stored') {
    loadStoredFields()
  }
})
</script>

<style scoped>
/* 
 * Field Selector Sidebar Z-Index: 250
 * Must be higher than FormBuilder top action bar (z-index: 100)
 */
.field-selector-sidebar {
  transform: translateX(0);
  transition: transform 0.3s ease-in-out;
  /* Ensure proper scrolling container */
  min-height: 0;
}

/* Header styling improvements */
.sidebar-header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sidebar-header h2 {
  line-height: 1.2;
}

.sidebar-header p {
  line-height: 1.4;
  max-width: 280px;
}

.field-type-item {
  /* Improve field item styling */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.field-type-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-type-item:hover .field-icon {
  transform: scale(1.05);
}

.field-category:last-child .field-list {
  padding-bottom: 2rem;
}

/* Improved scrollbar styling */
.field-selector-sidebar ::-webkit-scrollbar {
  width: 8px;
}

.field-selector-sidebar ::-webkit-scrollbar-track {
  background: #f8fafc;
}

.field-selector-sidebar ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  border: 1px solid #f8fafc;
}

.field-selector-sidebar ::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Category header styling */
.category-header {
  backdrop-filter: blur(8px);
}

/* Search input focus improvements */
.field-selector-sidebar input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Close button improvements */
.sidebar-header button:hover i {
  transform: scale(1.1);
}

.sidebar-header button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
