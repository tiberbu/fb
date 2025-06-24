<template>
  <div class="section-properties">
    <h3 class="font-medium text-gray-700 mb-3">
      <i class="fas fa-layer-group mr-2 text-blue-600" />
      Section Properties
    </h3>
    
    <div
      v-if="section"
      class="space-y-4"
    >
      <!-- Basic Properties Accordion -->
      <AccordionSection
        title="Basic Properties"
        :is-open="true"
      >
        <div class="space-y-4">
          <!-- Section Title -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">Section Title</label>
            <input 
              v-model="sectionCopy.title"
              type="text" 
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter section title"
              @input="updateSection"
            >
          </div>
          
          <!-- Section Subtitle/Description -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">Section Description</label>
            <textarea 
              v-model="sectionCopy.description" 
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter section description or subtitle"
              @input="updateSection"
            />
          </div>
          
          <!-- Section ID/Name -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">Section ID</label>
            <input 
              v-model="sectionCopy.id"
              type="text" 
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="section-id"
              @input="updateSection"
            >
            <p class="text-xs text-gray-500 mt-1">
              Unique identifier for this section
            </p>
          </div>
          
          <!-- Collapsible Toggle -->
          <div>
            <div class="flex items-center">
              <input 
                id="section-collapsible"
                v-model="sectionCopy.collapsible"
                type="checkbox" 
                class="mr-2 text-blue-600 focus:ring-blue-500"
                @change="updateSection"
              >
              <label
                for="section-collapsible"
                class="text-sm text-gray-600"
              >
                Make section collapsible
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Allow users to expand/collapse this section
            </p>
          </div>
          
          <!-- Hidden Toggle -->
          <div>
            <div class="flex items-center">
              <input 
                id="section-hidden"
                v-model="sectionCopy.isHidden"
                type="checkbox" 
                class="mr-2 text-blue-600 focus:ring-blue-500"
                @change="updateSection"
              >
              <label
                for="section-hidden"
                class="text-sm text-gray-600"
              >
                Hide section by default
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Section will be hidden unless shown by a formula
            </p>
          </div>
        </div>
      </AccordionSection>

      <!-- CSS Styling Accordion -->
      <AccordionSection title="CSS Styling">
        <div class="space-y-4">
          <!-- CSS Classes -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">CSS Classes</label>
            <input 
              v-model="sectionCopy.cssClasses"
              type="text" 
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="class1 class2 class3"
              @input="updateSection"
            >
            <p class="text-xs text-gray-500 mt-1">
              Add custom CSS classes (space-separated)
            </p>
          </div>
          
          <!-- Padding -->
          <div>
            <label class="block text-sm text-gray-600 mb-2">Padding</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <input 
                  v-model="sectionCopy.padding.top"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Top (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
              <div>
                <input 
                  v-model="sectionCopy.padding.right"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Right (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
              <div>
                <input 
                  v-model="sectionCopy.padding.bottom"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Bottom (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
              <div>
                <input 
                  v-model="sectionCopy.padding.left"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Left (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
            </div>
          </div>
          
          <!-- Margin -->
          <div>
            <label class="block text-sm text-gray-600 mb-2">Margin</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <input 
                  v-model="sectionCopy.margin.top"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Top (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
              <div>
                <input 
                  v-model="sectionCopy.margin.right"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Right (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
              <div>
                <input 
                  v-model="sectionCopy.margin.bottom"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Bottom (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
              <div>
                <input 
                  v-model="sectionCopy.margin.left"
                  type="text" 
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Left (e.g., 10px)"
                  @input="updateSection"
                >
              </div>
            </div>
          </div>
          
          <!-- Background Color -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">Background Color</label>
            <div class="flex items-center space-x-2">
              <input
                v-model="sectionCopy.backgroundColor"
                type="color"
                class="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                @input="updateSection"
              >
              <input
                v-model="sectionCopy.backgroundColor"
                type="text"
                class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="#ffffff or rgba(255,255,255,0.5)"
                @input="updateSection"
              >
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Formulas Accordion -->
      <AccordionSection title="Section Formulas">
        <div class="space-y-4">
          <p class="text-xs text-gray-500 mb-4">
            Add formulas to control section behavior. Formulas can control visibility, styling, and other dynamic behaviors.
          </p>
          
          <!-- Formula List -->
          <div
            v-if="sectionCopy.formulas && sectionCopy.formulas.length > 0"
            class="space-y-3"
          >
            <div 
              v-for="(formula, index) in sectionCopy.formulas" 
              :key="index"
              class="border border-gray-200 rounded p-3 bg-gray-50"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-700">{{ formula.type }} Formula</span>
                  <span 
                    class="ml-2 px-2 py-1 text-xs rounded-full"
                    :class="formula.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ formula.enabled ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <button 
                  class="text-red-600 hover:text-red-800 text-sm"
                  @click="removeFormula(index)"
                >
                  <i class="fas fa-times" />
                </button>
              </div>
              
              <div class="space-y-2">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Formula Type</label>
                  <select 
                    v-model="formula.type"
                    class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    @change="updateSection"
                  >
                    <option value="visibility">
                      Visibility
                    </option>
                    <option value="readonly">
                      Read Only
                    </option>
                    <option value="styling">
                      Custom Styling
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Expression</label>
                  <textarea 
                    v-model="formula.expression"
                    class="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                    rows="2"
                    placeholder="field('fieldname') === 'value'"
                    @input="updateSection"
                  />
                </div>
                
                <div class="flex items-center">
                  <input 
                    v-model="formula.enabled"
                    type="checkbox" 
                    class="mr-2 text-blue-600 focus:ring-blue-500"
                    @change="updateSection"
                  >
                  <label class="text-xs text-gray-600">Enable this formula</label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Add Formula Button -->
          <button 
            class="w-full py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded text-sm hover:bg-blue-100 flex items-center justify-center"
            @click="addFormula"
          >
            <i class="fas fa-plus mr-2" />
            Add Formula
          </button>
          
          <!-- Formula Examples -->
          <div class="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <h5 class="text-xs font-medium text-blue-700 mb-2">
              Formula Examples:
            </h5>
            <div class="space-y-2 text-xs text-blue-600">
              <div>
                <strong>Visibility:</strong> <code>field('category') === 'advanced'</code>
              </div>
              <div>
                <strong>Complex:</strong> <code>field('user_type') === 'admin' && field('enable_advanced') === true</code>
              </div>
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Section Actions -->
      <div class="border-t pt-4 space-y-3">
        <h4 class="font-medium text-gray-700">
          Actions
        </h4>
        
        <!-- Delete Section -->
        <button
          class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
          @click="deleteSection"
        >
          <i class="fas fa-trash-alt mr-2" />
          Delete Section
        </button>
      </div>
    </div>
    
    <div
      v-else
      class="text-center py-8 text-gray-500"
    >
      <i class="fas fa-exclamation-triangle text-3xl mb-2" />
      <p>Section not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AccordionSection from "../../../../components/ui/AccordionSection.vue";

interface Formula {
  expression: string;
  type: 'visibility' | 'readonly' | 'styling';
  enabled: boolean;
  dependsOn?: string[];
}

interface Section {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  isHidden?: boolean;
  cssClasses?: string;
  padding: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  backgroundColor?: string;
  formulas: Formula[];
  rows?: any[];
  columns?: any[];
}

interface Props {
  sectionId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'delete-section': [sectionId: string];
  'get-section-by-id': [id: string];
  'update-section': [section: Section];
}>();

// Create reactive copy of section data
const sectionCopy = ref<Section>({
  id: '',
  title: '',
  description: '',
  collapsible: false,
  isHidden: false,
  cssClasses: '',
  padding: {
    top: '',
    right: '',
    bottom: '',
    left: ''
  },
  margin: {
    top: '',
    right: '',
    bottom: '',
    left: ''
  },
  backgroundColor: '',
  formulas: []
});

// Mock section data - in real implementation, this would come from the store or props
const section = computed(() => {
  // This should be retrieved from the actual form builder store
  // For now, returning a mock section
  return {
    id: props.sectionId,
    title: 'Sample Section',
    description: 'Sample description',
    collapsible: false,
    isHidden: false,
    cssClasses: '',
    padding: { top: '', right: '', bottom: '', left: '' },
    margin: { top: '', right: '', bottom: '', left: '' },
    backgroundColor: '',
    formulas: []
  };
});

// Initialize section copy when section changes
watch(section, (newSection) => {
  if (newSection) {
    sectionCopy.value = JSON.parse(JSON.stringify(newSection));
    
    // Ensure properties exist with proper defaults
    if (!sectionCopy.value.padding) {
      sectionCopy.value.padding = { top: '', right: '', bottom: '', left: '' };
    }
    if (!sectionCopy.value.margin) {
      sectionCopy.value.margin = { top: '', right: '', bottom: '', left: '' };
    }
    if (!sectionCopy.value.formulas) {
      sectionCopy.value.formulas = [];
    }
  }
}, { immediate: true });

// Update section
function updateSection() {
  emit('update-section', sectionCopy.value);
}

// Add new formula
function addFormula() {
  if (!sectionCopy.value.formulas) {
    sectionCopy.value.formulas = [];
  }
  
  sectionCopy.value.formulas.push({
    expression: '',
    type: 'visibility',
    enabled: false,
    dependsOn: []
  });
  
  updateSection();
}

// Remove formula
function removeFormula(index: number) {
  if (sectionCopy.value.formulas) {
    sectionCopy.value.formulas.splice(index, 1);
    updateSection();
  }
}

// Delete section
function deleteSection() {
  if (confirm(`Are you sure you want to delete the section "${sectionCopy.value.title || 'Untitled Section'}"?`)) {
    emit('delete-section', props.sectionId);
  }
}

// Get section title for display
const sectionTitle = computed(() => {
  return section.value?.title || 'Untitled Section';
});
</script>
