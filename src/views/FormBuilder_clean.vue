<template>
  <div
    ref="container"
    class="form-builder-container"
    @click="clearSelection"
  >
    <!-- Form Container - Now Full Width -->
    <div class="form-container">
      <div class="form-main">
        <!-- Header with Sidebar Toggle -->
        <div class="form-header">
          <button
            class="sidebar-toggle-button"
            @click="toggleSidebar"
            :class="{ 
              'active': showSidebar, 
              'has-selection': hasSelection 
            }"
          >
            <i class="fas fa-cog" />
            <span class="ml-2">
              Properties
              <span v-if="hasSelection" class="selection-indicator">({{ selectionType }})</span>
            </span>
          </button>
        </div>

        <!-- Dynamic Layout System -->
        <div class="form-layout-container">
          
          <!-- Tabs Layout -->
          <div v-if="formLayout === 'tabs'" class="form-tabs">
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
              <TabSections 
                :current-tab-sections="currentTabSections"
                :selected-section="selectedSection"
                :selected-row="selectedRow"
                :selected-column="selectedColumn"
                :show-field-selector="showFieldSelector"
                :active-section="activeSection"
                :active-row-index="activeRowIndex"
                :active-column="activeColumn"
                @add-section="addSection"
                @select-section="selectSection"
                @open-section-menu="openSectionMenu"
                @select-row="selectRow"
                @delete-row="deleteRow"
                @select-column="selectColumn"
                @edit-control="editControl"
                @delete-control="deleteControl"
                @open-field-selector="openFieldSelector"
                @add-field-to-column="addFieldToColumn"
                @close-field-selector="closeFieldSelector"
                @add-column-to-row="addColumnToRow"
                @add-row-to-section="addRowToSection"
                @update-sections="updateSections"
                @update-column-fields="updateColumnFields"
              />
            </div>
          </div>

          <!-- Accordion Layout -->
          <div v-else-if="formLayout === 'accordion'" class="form-accordion">
            <div class="accordion-header">
              <button
                class="add-tab-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300"
                @click="addTab"
              >
                
                Add Section Group
              </button>
            </div>
            
            <div class="accordion-container space-y-4">
              <div 
                v-for="(tab, index) in tabs" 
                :key="index"
                class="accordion-item"
              >
                <div 
                  class="accordion-header-item"
                  @click="toggleAccordionTab(index)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg mr-3">
                        <i 
                          class="fas fa-chevron-right transition-transform duration-300 text-blue-600"
                          :class="{ 'rotate-90': activeTab === index }"
                        />
                      </div>
                      <div class="flex items-center">
                        <i class="fas fa-folder text-blue-500 mr-2"></i>
                        <span class="font-medium text-gray-800">{{ tab.label }}</span>
                        <span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {{ tab.sections?.length || 0 }} sections
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="flex items-center text-xs text-gray-500">
                        <i class="fas fa-clock mr-1"></i>
                        <span>Updated recently</span>
                      </div>
                      <button 
                        @click.stop="openTabProperties(index)"
                        class="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        title="Edit section group"
                      >
                        <i class="fas fa-cog" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div 
                  v-if="activeTab === index"
                  class="accordion-content"
                >
                  <div class="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <div class="flex items-center">
                      <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                      <span class="text-blue-800 font-medium">{{ tab.label }} Content</span>
                    </div>
                    <p class="text-blue-700 text-sm mt-1">
                      Configure the sections and fields for this part of your form.
                    </p>
                  </div>
                  <TabSections 
                    :current-tab-sections="currentTabSections"
                    :selected-section="selectedSection"
                    :selected-row="selectedRow"
                    :selected-column="selectedColumn"
                    :show-field-selector="showFieldSelector"
                    :active-section="activeSection"
                    :active-row-index="activeRowIndex"
                    :active-column="activeColumn"
                    @add-section="addSection"
                    @select-section="selectSection"
                    @open-section-menu="openSectionMenu"
                    @select-row="selectRow"
                    @delete-row="deleteRow"
                    @select-column="selectColumn"
                    @edit-control="editControl"
                    @delete-control="deleteControl"
                    @open-field-selector="openFieldSelector"
                    @add-field-to-column="addFieldToColumn"
                    @close-field-selector="closeFieldSelector"
                    @add-column-to-row="addColumnToRow"
                    @add-row-to-section="addRowToSection"
                    @update-sections="updateSections"
                    @update-column-fields="updateColumnFields"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Layout -->
          <div v-else-if="formLayout === 'sidebar'" class="form-sidebar-layout">
            <div class="sidebar-nav">
              <div class="sidebar-header">
                <button
                  class="add-tab-button w-full text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300"
                  @click="addTab"
                >
                  <i class="fas fa-plus text-xs mr-2" />
                  Add Page
                </button>
              </div>
              
              <nav class="sidebar-menu">
                <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Form Pages
                </div>
                <div 
                  v-for="(tab, index) in tabs" 
                  :key="index"
                  :class="[
                    'sidebar-menu-item',
                    activeTab === index ? 'active' : ''
                  ]"
                  @click="activeTab = index"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3">
                        <i class="fas fa-file-alt text-gray-600 text-sm"></i>
                      </div>
                      <div>
                        <span class="font-medium">{{ tab.label }}</span>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ tab.sections?.length || 0 }} sections
                        </div>
                      </div>
                    </div>
                    <button 
                      @click.stop="openTabProperties(index)"
                      class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-600 p-2 rounded transition-all duration-200"
                      title="Edit page"
                    >
                      <i class="fas fa-cog text-xs" />
                    </button>
                  </div>
                </div>
              </nav>
              
              <div class="px-4 py-4 border-t border-gray-200 mt-auto">
                <div class="bg-blue-50 p-3 rounded-lg">
                  <div class="flex items-center text-blue-700 text-sm">
                    <i class="fas fa-lightbulb mr-2"></i>
                    <span class="font-medium">Tip</span>
                  </div>
                  <p class="text-blue-600 text-xs mt-1">
                    Click on a page to edit its content, or use the settings icon for page options.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="sidebar-content">
              <div class="sidebar-content-header">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="bg-blue-100 p-2 rounded-lg mr-3">
                      <i class="fas fa-edit text-blue-600"></i>
                    </div>
                    <div>
                      <h2 class="text-xl font-semibold text-gray-800">{{ tabs[activeTab]?.label || 'Page Content' }}</h2>
                      <p class="text-sm text-gray-600 mt-1">
                        Design and configure the content for this page
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Page {{ activeTab + 1 }} of {{ tabs.length }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-sections-container">
                <TabSections 
                  :current-tab-sections="currentTabSections"
                  :selected-section="selectedSection"
                  :selected-row="selectedRow"
                  :selected-column="selectedColumn"
                  :show-field-selector="showFieldSelector"
                  :active-section="activeSection"
                  :active-row-index="activeRowIndex"
                  :active-column="activeColumn"
                  @add-section="addSection"
                  @select-section="selectSection"
                  @open-section-menu="openSectionMenu"
                  @select-row="selectRow"
                  @delete-row="deleteRow"
                  @select-column="selectColumn"
                  @edit-control="editControl"
                  @delete-control="deleteControl"
                  @open-field-selector="openFieldSelector"
                  @add-field-to-column="addFieldToColumn"
                  @close-field-selector="closeFieldSelector"
                  @add-column-to-row="addColumnToRow"
                  @add-row-to-section="addRowToSection"
                  @update-sections="updateSections"
                  @update-column-fields="updateColumnFields"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Popover Sidebar Overlay -->
    <div
      v-if="showSidebar"
      class="sidebar-overlay"
      @click="closeSidebar"
    />

    <!-- Popover Sidebar -->
    <div
      class="popover-sidebar"
      :class="{ 'open': showSidebar }"
      @click.stop
    >
      <div class="sidebar-header">
        <h3 class="sidebar-title">Properties</h3>
        <button
          class="sidebar-close-button"
          @click="closeSidebar"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="sidebar-content">
        <div
          v-if="selectedControl"
          class="control-properties"
        >
          <PropertiesPanel
            :control="selectedControl"
            @update="updateControl"
            @delete="deleteControl"
          />
        </div>
        <div
          v-else-if="selectedSection"
          class="section-properties"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Section Properties
          </h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Section: "{{ getSectionById(selectedSection).title || 'Untitled Section' }}"
            </p>
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
          
          <!-- General Settings Accordion -->
          <AccordionSection title="General Settings">
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
              />
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
                >Form is published</label>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm text-gray-600 mb-1">Layout Type</label>
              <select
                v-model="formLayout"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="tabs">Tabs (Default)</option>
                <option value="accordion">Accordion</option>
                <option value="sidebar">Sidebar Navigation</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Choose how sections are displayed in the form
              </p>
            </div>
          </AccordionSection>
          
          <!-- Export & Import Accordion -->
          <AccordionSection title="Export & Import">
            <div class="mb-4">
              <button
                class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                @click="exportForm"
              >
                <i class="fas fa-file-export mr-2" />
                Export Form
              </button>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm text-gray-600 mb-2">Import Form</label>
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                @change="handleFileImport"
              >
              <p class="text-xs text-gray-500 mt-1">
                Import a previously exported form configuration
              </p>
            </div>
          </AccordionSection>
          
          <!-- Form Formulas Accordion -->
          <AccordionSection title="Form Formulas">
            <div class="mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-green-100 p-1 rounded-full mr-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4 text-green-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h4 class="font-medium text-gray-700">
                  Formula Testing
                </h4>
              </div>
              <p class="text-sm text-gray-500 mb-3 pl-7">
                Test your form formulas in a live preview environment to validate calculation and visibility rules.
              </p>
              <button
                class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                @click="openFormulaPreview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 012-2h2a2 2 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Test Form Formulas</span>
              </button>
            </div>
            
            <div class="formula-info bg-blue-50 p-3 rounded mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-blue-200 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="font-medium text-blue-700">Formula Features</h4>
              </div>
              <ul class="text-xs text-blue-700 list-disc pl-7">
                <li class="mb-1">Create calculated fields based on other field values</li>
                <li class="mb-1">Implement conditional visibility for fields, sections, and tabs</li>
                <li class="mb-1">Use mathematical operations and logical conditions in formulas</li>
                <li class="mb-1">Reference other fields using field('fieldname') syntax</li>
              </ul>
            </div>
            
            <div class="formula-types grid grid-cols-2 gap-3 mb-4">
              <div class="bg-purple-50 p-3 rounded border border-purple-100">
                <h5 class="text-xs font-medium text-purple-700 mb-2">Calculation Formulas</h5>
                <p class="text-xs text-purple-600 mb-2">
                  Automatically calculate values based on other fields.
                </p>
              </div>
              <div class="bg-amber-50 p-3 rounded border border-amber-100">
                <h5 class="text-xs font-medium text-amber-700 mb-2">Visibility Formulas</h5>
                <p class="text-xs text-amber-600 mb-2">
                  Show or hide elements based on conditions.
                </p>
              </div>
            </div>
            
            <div class="formula-examples mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-gray-200 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="font-medium text-gray-700">Example Formulas</h4>
              </div>
              <div class="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">BMI Calculation:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('weight') / (field('height') * field('height'))</pre>
                </div>
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">Total Price:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('price') * field('quantity') * (1 - field('discount') / 100)</pre>
                </div>
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">Show if age > 18:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('age') > 18</pre>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Complex condition:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('category') === 'premium' && field('subscription') === true</pre>
                </div>
              </div>
            </div>
          </AccordionSection>
          
          <!-- Form JSON Accordion -->
          <AccordionSection title="Form JSON">
            <div class="mb-4">
              <div class="flex justify-end mb-2">
                <button 
                  class="text-xs text-blue-600 hover:text-blue-800"
                  @click="copyToClipboard()"
                >
                  <i class="fas fa-copy mr-1" />
                  Copy to clipboard
                </button>
              </div>
              <div class="json-viewer">
                <pre class="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-80">{{ getFormattedJson() }}</pre>
              </div>
            </div>
          </AccordionSection>
          
          <!-- Field Picker Accordion -->
          <AccordionSection title="Add New Field">
            <div class="mb-3">
              <input
                v-model="fieldSearchQuery"
                type="text"
                placeholder="Search field types..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              <button
                v-for="fieldType in filteredFieldTypes"
                :key="fieldType.type"
                class="field-type-button flex items-center p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-left text-sm transition-colors"
                @click="addControl(fieldType.type as ControlType)"
              >
                <div class="field-type-icon mr-3 text-gray-500 w-5 text-center">
                  <i class="fas" :class="getIconForFieldType(fieldType.type)" />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ fieldType.label }}</div>
                  <div class="text-xs text-gray-500">{{ getFieldTypeDescription(fieldType.type) }}</div>
                </div>
              </button>
            </div>
            <div v-if="filteredFieldTypes.length === 0 && fieldSearchQuery" class="text-center py-4 text-gray-500 text-sm">
              No field types found matching "{{ fieldSearchQuery }}"
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>

    <!-- Popover Sidebar Overlay -->
    <div
      v-if="showSidebar"
      class="sidebar-overlay"
      @click="closeSidebar"
    />

    <!-- Popover Sidebar -->
    <div
      class="popover-sidebar"
      :class="{ 'open': showSidebar }"
      @click.stop
    >
      <div class="sidebar-header">
        <h3 class="sidebar-title">Properties</h3>
        <button
          class="sidebar-close-button"
          @click="closeSidebar"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="sidebar-content">
        <div
          v-if="selectedControl"
          class="control-properties"
        >
          <PropertiesPanel
            :control="selectedControl"
            @update="updateControl"
            @delete="deleteControl"
          />
        </div>
        <div
          v-else-if="selectedSection"
          class="section-properties"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Section Properties
          </h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Section: "{{ getSectionById(selectedSection).title || 'Untitled Section' }}"
            </p>
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
          
          <!-- General Settings Accordion -->
          <AccordionSection title="General Settings">
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
              />
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
                >Form is published</label>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm text-gray-600 mb-1">Layout Type</label>
              <select
                v-model="formLayout"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="tabs">Tabs (Default)</option>
                <option value="accordion">Accordion</option>
                <option value="sidebar">Sidebar Navigation</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Choose how sections are displayed in the form
              </p>
            </div>
          </AccordionSection>
          
          <!-- Export & Import Accordion -->
          <AccordionSection title="Export & Import">
            <div class="mb-4">
              <button
                class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                @click="exportForm"
              >
                <i class="fas fa-file-export mr-2" />
                Export Form
              </button>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm text-gray-600 mb-2">Import Form</label>
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                @change="handleFileImport"
              >
              <p class="text-xs text-gray-500 mt-1">
                Import a previously exported form configuration
              </p>
            </div>
          </AccordionSection>
          
          <!-- Form Formulas Accordion -->
          <AccordionSection title="Form Formulas">
            <div class="mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-green-100 p-1 rounded-full mr-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4 text-green-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h4 class="font-medium text-gray-700">
                  Formula Testing
                </h4>
              </div>
              <p class="text-sm text-gray-500 mb-3 pl-7">
                Test your form formulas in a live preview environment to validate calculation and visibility rules.
              </p>
              <button
                class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                @click="openFormulaPreview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 012-2h2a2 2 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Test Form Formulas</span>
              </button>
            </div>
            
            <div class="formula-info bg-blue-50 p-3 rounded mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-blue-200 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="font-medium text-blue-700">Formula Features</h4>
              </div>
              <ul class="text-xs text-blue-700 list-disc pl-7">
                <li class="mb-1">Create calculated fields based on other field values</li>
                <li class="mb-1">Implement conditional visibility for fields, sections, and tabs</li>
                <li class="mb-1">Use mathematical operations and logical conditions in formulas</li>
                <li class="mb-1">Reference other fields using field('fieldname') syntax</li>
              </ul>
            </div>
            
            <div class="formula-types grid grid-cols-2 gap-3 mb-4">
              <div class="bg-purple-50 p-3 rounded border border-purple-100">
                <h5 class="text-xs font-medium text-purple-700 mb-2">Calculation Formulas</h5>
                <p class="text-xs text-purple-600 mb-2">
                  Automatically calculate values based on other fields.
                </p>
              </div>
              <div class="bg-amber-50 p-3 rounded border border-amber-100">
                <h5 class="text-xs font-medium text-amber-700 mb-2">Visibility Formulas</h5>
                <p class="text-xs text-amber-600 mb-2">
                  Show or hide elements based on conditions.
                </p>
              </div>
            </div>
            
            <div class="formula-examples mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-gray-200 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="font-medium text-gray-700">Example Formulas</h4>
              </div>
              <div class="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">BMI Calculation:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('weight') / (field('height') * field('height'))</pre>
                </div>
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">Total Price:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('price') * field('quantity') * (1 - field('discount') / 100)</pre>
                </div>
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">Show if age > 18:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('age') > 18</pre>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Complex condition:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('category') === 'premium' && field('subscription') === true</pre>
                </div>
              </div>
            </div>
          </AccordionSection>
          
          <!-- Form JSON Accordion -->
          <AccordionSection title="Form JSON">
            <div class="mb-4">
              <div class="flex justify-end mb-2">
                <button 
                  class="text-xs text-blue-600 hover:text-blue-800"
                  @click="copyToClipboard()"
                >
                  <i class="fas fa-copy mr-1" />
                  Copy to clipboard
                </button>
              </div>
              <div class="json-viewer">
                <pre class="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-80">{{ getFormattedJson() }}</pre>
              </div>
            </div>
          </AccordionSection>
          
          <!-- Field Picker Accordion -->
          <AccordionSection title="Add New Field">
            <div class="mb-3">
              <input
                v-model="fieldSearchQuery"
                type="text"
                placeholder="Search field types..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              <button
                v-for="fieldType in filteredFieldTypes"
                :key="fieldType.type"
                class="field-type-button flex items-center p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-left text-sm transition-colors"
                @click="addControl(fieldType.type as ControlType)"
              >
                <div class="field-type-icon mr-3 text-gray-500 w-5 text-center">
                  <i class="fas" :class="getIconForFieldType(fieldType.type)" />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ fieldType.label }}</div>
                  <div class="text-xs text-gray-500">{{ getFieldTypeDescription(fieldType.type) }}</div>
                </div>
              </button>
            </div>
            <div v-if="filteredFieldTypes.length === 0 && fieldSearchQuery" class="text-center py-4 text-gray-500 text-sm">
              No field types found matching "{{ fieldSearchQuery }}"
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>

    <!-- Popover Sidebar Overlay -->
    <div
      v-if="showSidebar"
      class="sidebar-overlay"
      @click="closeSidebar"
    />

    <!-- Popover Sidebar -->
    <div
      class="popover-sidebar"
      :class="{ 'open': showSidebar }"
      @click.stop
    >
      <div class="sidebar-header">
        <h3 class="sidebar-title">Properties</h3>
        <button
          class="sidebar-close-button"
          @click="closeSidebar"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="sidebar-content">
        <div
          v-if="selectedControl"
          class="control-properties"
        >
          <PropertiesPanel
            :control="selectedControl"
            @update="updateControl"
            @delete="deleteControl"
          />
        </div>
        <div
          v-else-if="selectedSection"
          class="section-properties"
        >
          <h3 class="font-medium text-gray-700 mb-3">
            Section Properties
          </h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Section: "{{ getSectionById(selectedSection).title || 'Untitled Section' }}"
            </p>
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
          
          <!-- General Settings Accordion -->
          <AccordionSection title="General Settings">
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
              />
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
                >Form is published</label>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm text-gray-600 mb-1">Layout Type</label>
              <select
                v-model="formLayout"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="tabs">Tabs (Default)</option>
                <option value="accordion">Accordion</option>
                <option value="sidebar">Sidebar Navigation</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Choose how sections are displayed in the form
              </p>
            </div>
          </AccordionSection>
          
          <!-- Export & Import Accordion -->
          <AccordionSection title="Export & Import">
            <div class="mb-4">
              <button
                class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                @click="exportForm"
              >
                <i class="fas fa-file-export mr-2" />
                Export Form
              </button>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm text-gray-600 mb-2">Import Form</label>
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                @change="handleFileImport"
              >
              <p class="text-xs text-gray-500 mt-1">
                Import a previously exported form configuration
              </p>
            </div>
          </AccordionSection>
          
          <!-- Form Formulas Accordion -->
          <AccordionSection title="Form Formulas">
            <div class="mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-green-100 p-1 rounded-full mr-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4 text-green-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h4 class="font-medium text-gray-700">
                  Formula Testing
                </h4>
              </div>
              <p class="text-sm text-gray-500 mb-3 pl-7">
                Test your form formulas in a live preview environment to validate calculation and visibility rules.
              </p>
              <button
                class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                @click="openFormulaPreview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 012-2h2a2 2 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Test Form Formulas</span>
              </button>
            </div>
            
            <div class="formula-info bg-blue-50 p-3 rounded mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-blue-200 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="font-medium text-blue-700">Formula Features</h4>
              </div>
              <ul class="text-xs text-blue-700 list-disc pl-7">
                <li class="mb-1">Create calculated fields based on other field values</li>
                <li class="mb-1">Implement conditional visibility for fields, sections, and tabs</li>
                <li class="mb-1">Use mathematical operations and logical conditions in formulas</li>
                <li class="mb-1">Reference other fields using field('fieldname') syntax</li>
              </ul>
            </div>
            
            <div class="formula-types grid grid-cols-2 gap-3 mb-4">
              <div class="bg-purple-50 p-3 rounded border border-purple-100">
                <h5 class="text-xs font-medium text-purple-700 mb-2">Calculation Formulas</h5>
                <p class="text-xs text-purple-600 mb-2">
                  Automatically calculate values based on other fields.
                </p>
              </div>
              <div class="bg-amber-50 p-3 rounded border border-amber-100">
                <h5 class="text-xs font-medium text-amber-700 mb-2">Visibility Formulas</h5>
                <p class="text-xs text-amber-600 mb-2">
                  Show or hide elements based on conditions.
                </p>
              </div>
            </div>
            
            <div class="formula-examples mb-4">
              <div class="flex items-center mb-2">
                <div class="bg-gray-200 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="font-medium text-gray-700">Example Formulas</h4>
              </div>
              <div class="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">BMI Calculation:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('weight') / (field('height') * field('height'))</pre>
                </div>
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">Total Price:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('price') * field('quantity') * (1 - field('discount') / 100)</pre>
                </div>
                <div class="mb-3">
                  <div class="font-medium text-gray-700 mb-1">Show if age > 18:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('age') > 18</pre>
                </div>
                <div>
                  <div class="font-medium text-gray-700 mb-1">Complex condition:</div>
                  <pre class="bg-white p-2 rounded border border-gray-200">field('category') === 'premium' && field('subscription') === true</pre>
                </div>
              </div>
            </div>
          </AccordionSection>
          
          <!-- Form JSON Accordion -->
          <AccordionSection title="Form JSON">
            <div class="mb-4">
              <div class="flex justify-end mb-2">
                <button 
                  class="text-xs text-blue-600 hover:text-blue-800"
                  @click="copyToClipboard()"
                >
                  <i class="fas fa-copy mr-1" />
                  Copy to clipboard
                </button>
              </div>
              <div class="json-viewer">
                <pre class="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-80">{{ getFormattedJson() }}</pre>
              </div>
            </div>
          </AccordionSection>
          
          <!-- Field Picker Accordion -->
          <AccordionSection title="Add New Field">
            <div class="mb-3">
              <input
                v-model="fieldSearchQuery"
                type="text"
                placeholder="Search field types..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              <button
                v-for="fieldType in filteredFieldTypes"
                :key="fieldType.type"
                class="field-type-button flex items-center p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-left text-sm transition-colors"
                @click="addControl(fieldType.type as ControlType)"
              >
                <div class="field-type-icon mr-3 text-gray-500 w-5 text-center">
                  <i class="fas" :class="getIconForFieldType(fieldType.type)" />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ fieldType.label }}</div>
                  <div class="text-xs text-gray-500">{{ getFieldTypeDescription(fieldType.type) }}</div>
                </div>
              </button>
            </div>
            <div v-if="filteredFieldTypes.length === 0 && fieldSearchQuery" class="text-center py-4 text-gray-500 text-sm">
              No field types found matching "{{ fieldSearchQuery }}"
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, watch, onMounted, onUnmounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import draggable from "vuedraggable";
import PropertiesPanel from "../components/ui/PropertiesPanel.vue";
import DraggableItem from "../components/ui/DraggableItem.vue";
import FieldTypeSelector from "../components/ui/FieldTypeSelector.vue";
import FormulaManager from "../components/ui/FormulaManager.vue";
import AccordionSection from "../components/ui/AccordionSection.vue";
import TabSections from "../components/TabSections.vue";
import { Control, ControlType } from "../types";

const emit = defineEmits(['form-data-change']);

// Form configuration
const formName = ref("New Form");
const formDescription = ref("");
const formId = ref(`form-${Date.now()}`);
const isPublished = ref(false);
const formLayout = ref("tabs"); // tabs, accordion, sidebar

// Form state
const tabs = ref<Array<{ label: string; sections: any[]; formulas?: any[] }>>([
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

// File input reference
const fileInput = ref<HTMLInputElement | null>(null);

// Sidebar state
const showSidebar = ref(false);

// Field search functionality
const fieldSearchQuery = ref("");

// Emit form data changes whenever relevant data changes
watch([formName, formDescription, formId, isPublished, formLayout, tabs], () => {
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
      formLayout: formLayout.value,
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
  // Show sidebar when something is selected
  showSidebar.value = true;
}

// Sidebar toggle functions
function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

function closeSidebar() {
  showSidebar.value = false;
}

// Toggle accordion tab
function toggleAccordionTab(index: number) {
  activeTab.value = activeTab.value === index ? -1 : index;
}

// Clear all selections
function clearSelection() {
  selectedControl.value = null;
  selectedSection.value = null;
  selectedColumn.value = null;
  selectedRow.value = null;
  selectedTab.value = null;
  // Don't automatically close sidebar - let user decide
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

// Computed property to check if anything is selected
const hasSelection = computed(() => {
  return !!(selectedControl.value || selectedSection.value || selectedColumn.value || selectedRow.value || selectedTab.value !== null);
});

// Computed property to show what type of selection is active
const selectionType = computed(() => {
  if (selectedControl.value) return 'Field';
  if (selectedSection.value) return 'Section';
  if (selectedColumn.value) return 'Column';
  if (selectedRow.value) return 'Row';
  if (selectedTab.value !== null) return 'Tab';
  return '';
});

// Field types
const fieldTypes = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Text Area" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "url", label: "URL" },
  { type: "password", label: "Password" },
  { type: "select", label: "Select" },
  { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "datetime", label: "Date Time" },
  { type: "time", label: "Time" },
  { type: "file", label: "File Upload" },
  { type: "image", label: "Image Upload" },
  { type: "range", label: "Range/Slider" },
  { type: "color", label: "Color Picker" },
  { type: "link", label: "Link" },
  { type: "hidden", label: "Read Only" },
  { type: "divider", label: "Divider" },
  { type: "html", label: "HTML Content" },
];

// Computed property for filtered field types
const filteredFieldTypes = computed(() => {
  if (!fieldSearchQuery.value) {
    return fieldTypes;
  }
  
  const query = fieldSearchQuery.value.toLowerCase();
  return fieldTypes.filter(fieldType => 
    fieldType.label.toLowerCase().includes(query) || 
    fieldType.type.toLowerCase().includes(query) ||
    getFieldTypeDescription(fieldType.type).toLowerCase().includes(query)
  );
});

// Helper function to get icon for field type
function getIconForFieldType(type: string) {
  switch (type) {
    case 'text':
      return 'fa-font';
    case 'textarea':
      return 'fa-align-left';
    case 'number':
      return 'fa-hashtag';
    case 'email':
      return 'fa-envelope';
    case 'phone':
      return 'fa-phone';
    case 'url':
      return 'fa-globe';
    case 'password':
      return 'fa-lock';
    case 'select':
      return 'fa-list';
    case 'radio':
      return 'fa-dot-circle';
    case 'checkbox':
      return 'fa-check-square';
    case 'date':
      return 'fa-calendar';
    case 'datetime':
      return 'fa-calendar-alt';
    case 'time':
      return 'fa-clock';
    case 'file':
      return 'fa-file-upload';
    case 'image':
      return 'fa-image';
    case 'range':
      return 'fa-sliders-h';
    case 'color':
      return 'fa-palette';
    case 'link':
      return 'fa-link';
    case 'hidden':
      return 'fa-eye-slash';
    case 'readonly':
      return 'fa-eye';
    case 'divider':
      return 'fa-minus';
    case 'html':
      return 'fa-code';
    default:
      return 'fa-square';
  }
}

// Helper function to get description for field type
function getFieldTypeDescription(type: string) {
  switch (type) {
    case 'text':
      return 'Single line text input';
    case 'textarea':
      return 'Multi-line text input';
    case 'number':
      return 'Numeric input field';
    case 'email':
      return 'Email address input';
    case 'phone':
      return 'Phone number input';
    case 'url':
      return 'Website URL input';
    case 'password':
      return 'Password input field';
    case 'select':
      return 'Dropdown selection';
    case 'radio':
      return 'Radio button group';
    case 'checkbox':
      return 'Checkbox input';
    case 'date':
      return 'Date picker';
    case 'datetime':
      return 'Date and time picker';
    case 'time':
      return 'Time picker';
    case 'file':
      return 'File upload field';
    case 'image':
      return 'Image upload field';
    case 'range':
      return 'Range slider input';
    case 'color':
      return 'Color picker input';
    case 'link':
      return 'Clickable link field';
    case 'hidden':
      return 'Hidden input field';
    case 'readonly':
      return 'Read-only display';
    case 'divider':
      return 'Visual separator';
    case 'html':
      return 'Custom HTML content';
    default:
      return 'Input field';
  }
}

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
  // Show sidebar when section is selected
  showSidebar.value = true;
}

// Select a column
function selectColumn(sectionId: string, columnIndex: number) {
  selectedColumn.value = { sectionId, columnIndex };
  selectedSection.value = null;
  selectedControl.value = null;
  selectedTab.value = null; // Clear the selected tab when selecting a column
  // Show sidebar when column is selected
  showSidebar.value = true;
}

// Select a row
function selectRow(sectionId: string, rowIndex: number) {
  selectedRow.value = { sectionId, rowIndex };
  selectedSection.value = null;
  selectedControl.value = null;
  selectedColumn.value = null;
  selectedTab.value = null;
  // Show sidebar when row is selected
  showSidebar.value = true;
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

// Get all fields from all sections and tabs
function getAllFields(): Control[] {
  let fields: Control[] = [];
  
  // Gather fields from all tabs and sections
  tabs.value.forEach(tab => {
    if (tab.sections) {
      tab.sections.forEach(section => {
        if (section.rows) {
          section.rows.forEach((row: any) => {
            row.columns.forEach((column: any) => {
              if (column.fields) {
                fields = [...fields, ...column.fields];
              }
            });
          });
        } else if (section.columns) {
          // For backward compatibility
          section.columns.forEach((column: any) => {
            if (column.fields) {
              fields = [...fields, ...column.fields];
            }
          });
        }
      });
    }
  });
  
  return fields;
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
    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    name: `field_${type}_${Date.now()}`,
    required: false,
    order: (section.rows[rowIndex].columns[columnIndex].fields?.length || 0) + 1,
    options: (type === "select" || type === "radio") ? [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" }
    ] : undefined,
    // Initialize CSS styling properties
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
    }
  };

  if (!section.rows[rowIndex].columns[columnIndex].fields) {
    section.rows[rowIndex].columns[columnIndex].fields = [];
  }
  
  section.rows[rowIndex].columns[columnIndex].fields.push(newControl);
  closeFieldSelector();
  emitFormDataChange();
}

// Add a new control (field) from the sidebar
function addControl(type: ControlType) {
  if (currentTabSections.value.length === 0) {
    // Add a section first if none exists
    addSection();
  }

  // Get the first section in the current tab
  const section = currentTabSections.value[0];
  
  // Add the control to the first column of the first row
  if (section.rows && section.rows[0] && section.rows[0].columns) {
    addFieldToColumn(section, 0, 0, type);
  } else {
    // For backward compatibility with old structure
    if (!section.columns) {
      section.columns = [{ fields: [] }];
    }
    
    const newControl: Control = {
      id: uuidv4(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      name: `field_${type}_${Date.now()}`,
      required: false,
      order: (section.columns[0].fields?.length || 0) + 1,
      options: (type === "select" || type === "radio") ? [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" }
      ] : undefined,
      // Initialize CSS styling properties
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
      }
    };
    
    section.columns[0].fields.push(newControl);
  }
  
  emitFormDataChange();
}

// Edit a control
function editControl(control: Control) {
  selectedControl.value = control;
  selectedSection.value = null;
  selectedColumn.value = null;
  selectedTab.value = null;
  // Show sidebar when control is selected
  showSidebar.value = true;
}

// Delete a control
function deleteControl(id: string) {
  // Find the field in all sections and columns
  tabs.value.forEach(tab => {
    tab.sections.forEach(section => {
      if (section.rows) {
        section.rows.forEach((row: any) => {
          row.columns.forEach((column: any) => {
            if (column.fields) {
              const fieldIndex = column.fields.findIndex((field: Control) => field.id === id);
              if (fieldIndex !== -1) {
                column.fields.splice(fieldIndex, 1);
                if (selectedControl.value?.id === id) {
                  selectedControl.value = null;
                }
              }
            }
          });
        });
      } else if (section.columns) {
        // For backward compatibility
        section.columns.forEach((column: any) => {
          if (column.fields) {
            const fieldIndex = column.fields.findIndex((field: Control) => field.id === id);
            if (fieldIndex !== -1) {
              column.fields.splice(fieldIndex, 1);
              if (selectedControl.value?.id === id) {
                selectedControl.value = null;
              }
            }
          }
        });
      }
    });
  });
  
  emitFormDataChange();
}

// Load saved form data from localStorage
function loadSavedForm() {
  const savedForm = localStorage.getItem('savedFormStructure');
  if (savedForm) {
    try {
      const formData = JSON.parse(savedForm);
      if (formData && formData.metadata && formData.tabs) {
        // Update form metadata
        formName.value = formData.metadata.formName || 'New Form';
        formDescription.value = formData.metadata.formDescription || '';
        formId.value = formData.metadata.formId || `form-${Date.now()}`;
        isPublished.value = formData.metadata.isPublished || false;
        
        // Update tabs with validation
        if (Array.isArray(formData.tabs) && formData.tabs.length > 0) {
          tabs.value = formData.tabs;
          // Ensure we have at least one tab
          if (activeTab.value >= tabs.value.length) {
            activeTab.value = 0;
          }
        }
      }
    } catch (error) {
      // Handle error silently for production
      // console.warn('Failed to load saved form data:', error);
    }
  }
}

// Update control properties
function updateControlProps(updatedControl: Control) {
  const { id } = updatedControl;
  
  // Find and update the control in all sections and columns
  tabs.value.forEach(tab => {
    tab.sections.forEach(section => {
      if (section.rows) {
        section.rows.forEach((row: any) => {
          row.columns.forEach((column: any) => {
            if (column.fields) {
              const fieldIndex = column.fields.findIndex((field: Control) => field.id === id);
              if (fieldIndex !== -1) {
                column.fields[fieldIndex] = updatedControl;
              }
            }
          });
        });
      } else if (section.columns) {
        // For backward compatibility
        section.columns.forEach((column: any) => {
          if (column.fields) {
            const fieldIndex = column.fields.findIndex((field: Control) => field.id === id);
            if (fieldIndex !== -1) {
              column.fields[fieldIndex] = updatedControl;
            }
          }
        });
      }
    });
  });
  
  // Update the selected control if it's the one being edited
  if (selectedControl.value?.id === id) {
    selectedControl.value = updatedControl;
  }
  
  emitFormDataChange();
}

// Add a column to a row
function addColumnToRow(section: any, rowIndex: number) {
  if (!section.rows[rowIndex]) return;
  
  // Check if we can add more columns (limit to 3 columns per row)
  const currentColumns = section.rows[rowIndex].columns;
  if (currentColumns && currentColumns.length >= 3) {
    alert("Maximum of 3 columns per row is allowed");
    return;
  }
  
  // Add a new column to the row
  if (!section.rows[rowIndex].columns) {
    section.rows[rowIndex].columns = [];
  }
  
  section.rows[rowIndex].columns.push({
    fields: []
  });
  
  emitFormDataChange();
}

// Export form function
function exportForm() {
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
  
  // Create and trigger download
  const dataStr = JSON.stringify(formStructure, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${formId.value || 'form'}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import form function
function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const formData = JSON.parse(content);
      
      // Validate the imported data structure
      if (!formData || !formData.metadata || !formData.tabs) {
        alert('Invalid form file. Please make sure the file contains valid form configuration.');
        return;
      }
      
      // Confirm before importing
      if (confirm('This will replace the current form configuration. Are you sure you want to continue?')) {
        // Update form metadata
        formName.value = formData.metadata.formName || 'Imported Form';
        formDescription.value = formData.metadata.formDescription || '';
        formId.value = formData.metadata.formId || `form-${Date.now()}`;
        isPublished.value = formData.metadata.isPublished || false;
        
        // Update tabs with validation
        if (Array.isArray(formData.tabs) && formData.tabs.length > 0) {
          tabs.value = formData.tabs;
          // Reset active tab to first tab
          activeTab.value = 0;
          // Clear selections
          selectedControl.value = null;
          selectedSection.value = null;
          selectedColumn.value = null;
          selectedRow.value = null;
          selectedTab.value = null;
          
          // Emit the change
          emitFormDataChange();
          
          alert('Form imported successfully!');
        } else {
          alert('Invalid form data: no valid tabs found.');
        }
      }
    } catch (error) {
      alert('Error reading file. Please make sure it\'s a valid JSON file.');
    }
    
    // Clear the file input
    if (target) {
      target.value = '';
    }
  };
  
  reader.readAsText(file);
}

// Get formatted JSON for preview
function getFormattedJson() {
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
  
  return JSON.stringify(formStructure, null, 2);
}

// Open formula preview
function openFormulaPreview() {
  // Save current form structure for formula preview
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
  
  localStorage.setItem('previewFormStructure', JSON.stringify(formStructure));
  
  // Open in new window/tab
  window.open('/formula-preview', '_blank');
}

// Copy to clipboard function
function copyToClipboard() {
  const jsonText = getFormattedJson();
  navigator.clipboard.writeText(jsonText).then(() => {
    alert('JSON copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy to clipboard');
  });
}

// Tab formula management
function updateTabFormulas(formulas: any[]) {
  if (selectedTab.value !== null && tabs.value[selectedTab.value]) {
    // Add formulas property to tab if it doesn't exist
    const tab = tabs.value[selectedTab.value] as any;
    if (!tab.formulas) {
      tab.formulas = [];
    }
    tab.formulas = formulas;
    emitFormDataChange();
  }
}

// Section formula management  
function updateSectionFormulas(formulas: any[]) {
  if (selectedSection.value) {
    const section = getSectionById(selectedSection.value);
    if (section) {
      section.formulas = formulas;
      emitFormDataChange();
    }
  }
}

// Handle tab order change
function handleTabOrderChanged() {
  emitFormDataChange();
}

// Open section menu (stub function)
function openSectionMenu(section: any) {
  // eslint-disable-next-line no-console
  console.log('Section menu for:', section.title);
}

// Delete tab function
function deleteTab(index: number) {
  if (tabs.value.length > 1) {
    tabs.value.splice(index, 1);
    if (activeTab.value >= tabs.value.length) {
      activeTab.value = tabs.value.length - 1;
    }
    if (selectedTab.value === index) {
      selectedTab.value = null;
    }
    emitFormDataChange();
  }
}

// Keyboard shortcut handler
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === '`') {
    e.preventDefault();
    toggleSidebar();
  }
};

// Initialize component - load saved form data on mount
onMounted(() => {
  loadSavedForm();
  // Add keyboard shortcut for toggling sidebar (Ctrl/Cmd + `)
  document.addEventListener('keydown', handleKeydown);
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Expose methods to parent component
defineExpose({
  loadSavedForm
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

/* Sidebar styles */
.popover-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background-color: #fff;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.popover-sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.sidebar-close-button {
  background: #3b82f6 !important;
  color: white !important;
  border: 1px solid #3b82f6 !important;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Ensure icons are white */
.sidebar-close-button i {
  color: white !important;
}

/* Ensure text/span elements are white */
.sidebar-close-button span {
  color: white !important;
}

.sidebar-close-button:hover {
  background: #2563eb !important;
  border-color: #2563eb !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.sidebar-content {
  padding: 16px;
  overflow-y: auto;
  height: calc(100% - 64px);
}

.control-properties,
.section-properties,
.column-properties,
.row-properties,
.form-configuration {
  margin-bottom: 24px;
}

h3.font-medium {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 12px;
}

.text-sm {
  font-size: 14px;
  color: #6B7280;
}

.text-xs {
  font-size: 12px;
  color: #6B7280;
}

.bg-gray-50 {
  background-color: #F9FAFB;
}

.border {
  border: 1px solid #E5E7EB;
}

.rounded {
  border-radius: 8px;
}

.px-3 {
  padding-left: 12px;
  padding-right: 12px;
}

.py-2 {
  padding-top: 8px;
  padding-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.cursor-pointer {
  cursor: pointer;
}

.transition {
  transition: all 0.2s;
}

.hover\:bg-gray-100:hover {
  background-color: #F3F4F6;
}

.hover\:bg-blue-600:hover {
  background-color: #2563EB;
}

.text-blue-600 {
  color: #2563EB;
}

.bg-blue-500 {
  background-color: #3B82F6;
}

.bg-red-500 {
  background-color: #EF4444;
}

.hover\:bg-red-600:hover {
  background-color: #DC2626;
}

.delete-section-button,
.delete-column-button,
.delete-row-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-section-button i,
.delete-column-button i,
.delete-row-button i {
  margin-right: 4px;
}

.formula-info {
  border-left: 4px solid #3B82F6;
  background-color: #F0F9FF;
  padding: 12px;
  border-radius: 4px;
}

.formula-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.formula-examples {
  background-color: #F9FAFB;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #E5E7EB;
}

.json-viewer {
  background-color: #F9FAFB;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #E5E7EB;
  overflow-x: auto;
}

.field-type-button {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.field-type-button:hover {
  background-color: #F3F4F6;
}

.field-type-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

/* Accordion Layout Styles */
.form-accordion {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.accordion-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.accordion-header h2 {
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.accordion-container {
  space-y: 12px;
}

.accordion-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.accordion-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.accordion-header-item {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e2e8f0;
}

.accordion-header-item:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
}

.accordion-header-item .fas.fa-chevron-right {
  color: #3b82f6;
  font-size: 14px;
  transition: all 0.3s ease;
}

.accordion-header-item .fas.fa-chevron-right.rotate-90 {
  transform: rotate(90deg);
}

.accordion-header-item span {
  color: #1e293b;
  font-weight: 600;
  font-size: 16px;
}

.accordion-header-item button {
  color: #64748b;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.accordion-header-item button:hover {
  background: #e2e8f0;
  color: #3b82f6;
}

.accordion-content {
  padding: 24px;
  background: white;
  border-top: none;
}

/* Sidebar Layout Styles */
.form-sidebar-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}

.sidebar-nav {
  width: 320px;
  background: white;
  border-right: 1px solid #e2e8f0;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.sidebar-nav .sidebar-header {
  padding: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-bottom: 1px solid #2563eb;
}

.sidebar-nav .sidebar-header h3 {
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-nav .add-tab-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.sidebar-nav .add-tab-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sidebar-menu {
  padding: 16px 0;
}

.sidebar-menu-item {
  margin: 4px 16px;
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #475569;
  font-weight: 500;
  border: 2px solid transparent;
}

.sidebar-menu-item:hover {
  background: #f1f5f9;
  color: #3b82f6;
  transform: translateX(4px);
}

.sidebar-menu-item.active {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-color: #3b82f6;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.sidebar-menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #3b82f6;
  border-radius: 0 4px 4px 0;
}

.sidebar-menu-item button {
  color: #94a3b8;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0;
}

.sidebar-menu-item:hover button {
  opacity: 1;
}

.sidebar-menu-item button:hover {
  background: #e2e8f0;
  color: #3b82f6;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.sidebar-content-header {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.sidebar-content-header h2 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-content .tab-sections-container {
  padding: 32px;
}

/* Enhanced Add Tab Buttons */
.add-tab-button {
  position: relative;
  overflow: hidden;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  color: white !important;
}

.add-tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.add-tab-button:hover::before {
  left: 100%;
}

.add-tab-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Enhanced spacing and animations */
.accordion-item + .accordion-item {
  margin-top: 16px;
}

.sidebar-menu-item {
  position: relative;
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .form-sidebar-layout {
    flex-direction: column;
  }
  
  .sidebar-nav {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  
  .sidebar-menu {
    display: flex;
    overflow-x: auto;
    padding: 16px;
  }
  
  .sidebar-menu-item {
    min-width: 120px;
    margin-right: 8px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .form-accordion {
    padding: 16px;
  }
  
  .accordion-header {
    padding: 16px;
  }
  
  .accordion-header h2 {
    font-size: 24px;
  }
  
  .accordion-header-item {
    padding: 16px;
  }
  
  .accordion-content {
    padding: 16px;
  }
}

/* Enhanced animations and transitions */
.form-layout-container {
  transition: all 0.5s ease-in-out;
}

/* Enhanced animation for accordion expand/collapse */
.accordion-content {
  animation: slideDown 0.3s ease-out;
  transform-origin: top;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 1000px;
  }
}

/* Pulse animation for active sidebar item */
.sidebar-menu-item.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  50% {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
  }
  100% {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
}

/* Enhanced tooltip styles */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  animation: fadeInTooltip 0.3s ease-in-out 0.5s both;
}

[title]:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  opacity: 0;
  animation: fadeInTooltip 0.3s ease-in-out 0.5s both;
}

@keyframes fadeInTooltip {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Enhanced focus states for accessibility */
.accordion-header-item:focus,
.sidebar-menu-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Beautiful scrollbar for sidebar */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Hover effects for better interaction feedback */
.accordion-header-item:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.sidebar-menu-item:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* Subtle animations for field dragging */
.draggable-item {
  transition: all 0.2s ease;
}

.draggable-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Enhanced mobile responsiveness for smaller screens */
@media (max-width: 640px) {
  .form-accordion {
    padding: 12px;
    margin: 8px;
  }
  
  .accordion-header {
    padding: 16px 12px;
  }
  
  .accordion-header h2 {
    font-size: 20px;
  }
  
  .accordion-header-item {
    padding: 16px 12px;
    font-size: 14px;
  }
  
  .accordion-content {
    padding: 16px 12px;
  }
  
  .sidebar-nav {
    width: 100%;
    height: 120px;
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .sidebar-menu {
    display: flex;
    padding: 8px;
    min-width: max-content;
  }
  
  .sidebar-menu-item {
    min-width: 140px;
    margin-right: 8px;
    margin-bottom: 0;
    font-size: 14px;
  }
  
  .form-sidebar-layout {
    flex-direction: column;
  }
  
  .sidebar-content {
    margin-left: 0;
    margin-top: 16px;
  }
}
</style>
