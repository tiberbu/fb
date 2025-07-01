<template>
  <div 
    class="table-control" 
    :class="fieldClasses"
  >
    <label 
      v-if="df.label" 
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ df.label }}
      <span 
        v-if="df.reqd" 
        class="text-red-500 ml-1"
      >*</span>
    </label>
    
    <div 
      v-if="df.helpText" 
      class="text-xs text-gray-500 mb-2"
    >
      {{ df.helpText }}
    </div>

    <!-- Table Container -->
    <div 
      v-if="tableColumns.length > 0"
      class="table-container border border-gray-300 rounded-lg overflow-hidden"
    >
      <!-- Default Columns Help Message -->
      <div 
        v-if="isUsingDefaultColumns" 
        class="bg-blue-50 border-b border-blue-200 px-3 py-2"
      >
        <div class="flex items-center text-xs text-blue-700">
          <i class="fas fa-info-circle mr-2" />
          <span>Default columns are shown. Configure custom columns in the properties panel.</span>
        </div>
      </div>
      
      <!-- Table Header -->
      <div 
        class="table-header bg-gray-50 border-b border-gray-200"
      >
        <div class="table-row-flex">
          <div 
            v-for="column in tableColumns" 
            :key="column.id"
            class="table-cell flex-1 px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            <div class="flex items-center">
              <i 
                v-if="column.type === 'table'" 
                class="fas fa-table text-blue-500 mr-2 text-xs" 
                title="Nested Table Field"
              />
              <span>{{ column.label }}</span>
              <span 
                v-if="column.required" 
                class="text-red-500 ml-1"
              >*</span>
            </div>
          </div>
          <div 
            v-if="allowActions" 
            class="table-cell w-20 px-3 py-2 text-sm font-medium text-gray-700 text-center"
          >
            Actions
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="table-body">
        <!-- Existing Rows -->
        <div 
          v-for="(row, rowIndex) in tableData" 
          :key="rowIndex"
          class="table-row-flex border-b border-gray-100 last:border-b-0 hover:bg-gray-25"
        >
          <div 
            v-for="column in tableColumns" 
            :key="column.id"
            class="table-cell flex-1 px-3 py-2 border-r border-gray-200 last:border-r-0"
          >
            <!-- Nested Table Display -->
            <div 
              v-if="column.type === 'table'" 
              class="nested-table-preview w-full"
            >
              <div class="flex items-center mb-2">
                <i class="fas fa-table text-blue-500 mr-2 text-xs" />
                <span class="text-xs font-medium text-gray-700">{{ column.label }}</span>
                <span class="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {{ formatCellValue(row[column.name], column.type) }}
                </span>
              </div>
              
              <!-- Nested Table Structure -->
              <div 
                v-if="row[column.name] && Array.isArray(row[column.name]) && row[column.name].length > 0"
                class="nested-table-container border border-gray-200 rounded-md overflow-hidden bg-white"
              >
                <!-- Nested Table Headers -->
                <div class="bg-gray-50 border-b border-gray-200">
                  <div class="flex text-xs">
                    <div 
                      v-for="nestedCol in getNestedTableColumnsForDisplay(column)" 
                      :key="nestedCol.id"
                      class="flex-1 px-2 py-1 font-medium text-gray-600 border-r border-gray-200 last:border-r-0 truncate"
                    >
                      {{ nestedCol.label }}
                    </div>
                  </div>
                </div>
                
                <!-- Nested Table Rows (show first 3 rows) -->
                <div class="max-h-24 overflow-y-auto">
                  <div 
                    v-for="(nestedRow, nestedIndex) in row[column.name].slice(0, 3)" 
                    :key="nestedIndex"
                    class="flex text-xs border-b border-gray-100 last:border-b-0"
                  >
                    <div 
                      v-for="nestedCol in getNestedTableColumnsForDisplay(column)" 
                      :key="nestedCol.id"
                      class="flex-1 px-2 py-1 text-gray-700 border-r border-gray-200 last:border-r-0 truncate"
                    >
                      {{ formatNestedCellValue(nestedRow[nestedCol.name], nestedCol.type) }}
                    </div>
                  </div>
                </div>
                
                <!-- Show more indicator -->
                <div 
                  v-if="row[column.name].length > 3"
                  class="bg-gray-25 px-2 py-1 text-xs text-gray-500 text-center border-t border-gray-200"
                >
                  ... and {{ row[column.name].length - 3 }} more rows
                </div>
              </div>
              
              <!-- Empty nested table -->
              <div 
                v-else
                class="text-center py-2 text-gray-400 border border-gray-200 rounded-md bg-gray-50"
              >
                <i class="fas fa-table text-gray-300 text-sm mb-1" />
                <div class="text-xs">
                  No data ({{ typeof row[column.name] }}: {{ Array.isArray(row[column.name]) ? 'array' : 'not array' }})
                </div>
              </div>
            </div>
            
            <!-- Regular Field Display -->
            <div 
              v-else 
              class="text-sm text-gray-900"
            >
              {{ formatCellValue(row[column.name], column.type) }}
            </div>
          </div>
          <div 
            v-if="allowActions" 
            class="table-cell w-20 px-3 py-2 text-center"
          >
            <div class="flex justify-center space-x-1">
              <button
                v-if="allowEdit"
                type="button"
                title="Edit row"
                class="text-blue-600 hover:text-blue-800 p-1"
                @click.prevent="editRow(rowIndex)"
              >
                <i class="fas fa-edit text-xs" />
              </button>
              <button
                v-if="allowDelete"
                type="button"
                title="Delete row"
                class="text-red-600 hover:text-red-800 p-1"
                @click.prevent="deleteRow(rowIndex)"
              >
                <i class="fas fa-trash text-xs" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div 
          v-if="tableData.length === 0" 
          class="text-center py-8 text-gray-500"
        >
          <i class="fas fa-table text-3xl mb-2 text-gray-300" />
          <p class="text-sm">
            No data available
          </p>
          <p class="text-xs text-gray-400">
            Click "Add Row" to get started
          </p>
        </div>
      </div>

      <!-- Add Row Button -->
      <div 
        v-if="allowAdd && !readonly" 
        class="table-footer bg-gray-50 px-3 py-2 border-t border-gray-200"
      >
        <button
          type="button"
          :disabled="!!(maxRows && tableData.length >= maxRows)"
          class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          @click.prevent="addRow"
        >
          <i class="fas fa-plus text-xs" />
          <span>Add Row</span>
          <span 
            v-if="maxRows" 
            class="text-xs text-gray-500"
          >({{ tableData.length }}/{{ maxRows }})</span>
        </button>
      </div>
    </div>

    <!-- No Columns Configured State -->
    <div 
      v-if="tableColumns.length === 0" 
      class="text-center py-8 text-gray-500 border border-gray-300 rounded-lg bg-gray-50"
    >
      <i class="fas fa-table text-3xl mb-2 text-gray-300" />
      <p class="text-sm">
        No table columns configured
      </p>
      <p class="text-xs text-gray-400">
        Configure table columns in the properties panel
      </p>
    </div>

    <!-- Table Data Modal -->
    <div 
      v-if="showModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <div class="modal-header px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? 'Edit Row' : 'Add New Row' }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ isEditing ? 'Edit existing row data' : 'Add new row to table' }}
            </p>
          </div>
          <button 
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click.prevent="closeModal"
          >
            <i class="fas fa-times" />
          </button>
        </div>
        
        <div class="modal-body px-6 py-4 overflow-y-auto max-h-96">
          <div 
            v-if="tableColumns.length === 0" 
            class="text-center py-4 text-gray-500"
          >
            <p>No columns available. Please configure the table in the properties panel.</p>
          </div>
          
          <div 
            v-else 
            class="space-y-4"
          >
            <div 
              v-for="column in tableColumns" 
              :key="column.id" 
              class="form-group"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ column.label }}
                <span 
                  v-if="column.required" 
                  class="text-red-500 ml-1"
                >*</span>
              </label>
              
              <!-- Text Input -->
              <input
                v-if="column.type === 'text' || column.type === 'email' || column.type === 'phone' || column.type === 'url'"
                v-model="currentRowData[column.name]"
                :type="getInputType(column.type)"
                :placeholder="column.placeholder"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Textarea -->
              <textarea
                v-else-if="column.type === 'textarea'"
                v-model="currentRowData[column.name]"
                :placeholder="column.placeholder"
                :required="column.required"
                :rows="column.rows || 3"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <!-- Number Input -->
              <input
                v-else-if="column.type === 'number'"
                v-model.number="currentRowData[column.name]"
                type="number"
                :placeholder="column.placeholder"
                :required="column.required"
                :min="column.min"
                :max="column.max"
                :step="column.step"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Select Dropdown -->
              <select
                v-else-if="column.type === 'select'"
                v-model="currentRowData[column.name]"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  Select an option...
                </option>
                <option 
                  v-for="option in column.options" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              
              <!-- Date Input -->
              <input
                v-else-if="column.type === 'date'"
                v-model="currentRowData[column.name]"
                type="date"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- DateTime Input -->
              <input
                v-else-if="column.type === 'datetime'"
                v-model="currentRowData[column.name]"
                type="datetime-local"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Checkbox -->
              <div 
                v-else-if="column.type === 'checkbox'" 
                class="flex items-center"
              >
                <input
                  v-model="currentRowData[column.name]"
                  type="checkbox"
                  :required="column.required"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ column.placeholder || column.label }}</span>
              </div>
              
              <!-- Nested Table Control -->
              <div 
                v-else-if="column.type === 'table'" 
                class="nested-table-wrapper border border-gray-200 rounded-md p-3 bg-gray-50"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">{{ column.label }} (Table)</span>
                  <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Nested Table</span>
                </div>
                
                <!-- Nested Table Data Display -->
                <div class="nested-table-data bg-white border border-gray-200 rounded-md">
                  <div 
                    v-if="!currentRowData[column.name] || !Array.isArray(currentRowData[column.name]) || currentRowData[column.name].length === 0"
                    class="text-center py-4 text-gray-500"
                  >
                    <i class="fas fa-table text-gray-300 mb-2" />
                    <p class="text-sm">
                      No nested table data
                    </p>
                  </div>
                  
                  <div 
                    v-else 
                    class="p-2"
                  >
                    <div class="text-xs text-gray-600 mb-2">
                      {{ currentRowData[column.name].length }} row(s) in nested table
                    </div>
                    <div class="max-h-32 overflow-y-auto">
                      <div 
                        v-for="(nestedRow, nestedIndex) in currentRowData[column.name]" 
                        :key="nestedIndex"
                        class="text-xs bg-gray-50 p-2 mb-1 rounded border flex justify-between items-start"
                      >
                        <div class="flex-1">
                          <div class="font-medium text-gray-700">
                            Row {{ nestedIndex + 1 }}
                          </div>
                          <div class="text-gray-600 mt-1">
                            <!-- Show preview of actual data if available -->
                            <div 
                              v-if="nestedRow.name || nestedRow.title || nestedRow.label"
                              class="truncate"
                            >
                              <strong>{{ nestedRow.name || nestedRow.title || nestedRow.label }}</strong>
                            </div>
                            <div 
                              v-if="nestedRow.description || nestedRow.value"
                              class="text-gray-500 truncate"
                            >
                              {{ nestedRow.description || nestedRow.value }}
                            </div>
                            <div class="text-gray-400 mt-1">
                              {{ Object.keys(nestedRow).length }} field(s)
                            </div>
                          </div>
                        </div>
                        <div class="flex space-x-1 ml-2">
                          <button
                            type="button"
                            title="Edit this row"
                            class="text-blue-600 hover:text-blue-800 p-1"
                            @click.stop="editNestedTableRow(column, nestedIndex)"
                          >
                            <i class="fas fa-edit text-xs" />
                          </button>
                          <button
                            type="button"
                            title="Delete this row"
                            class="text-red-600 hover:text-red-800 p-1"
                            @click.stop="removeNestedTableRowFromPreview(column.name, nestedIndex)"
                          >
                            <i class="fas fa-trash text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Nested Table Actions -->
                <div class="flex justify-between items-center mt-3">
                  <div class="text-xs text-gray-500">
                    <i class="fas fa-info-circle mr-1" />
                    {{ column.helpText || 'This field contains a nested table structure' }}
                  </div>
                  <div class="flex space-x-2">
                    <button
                      type="button"
                      class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      @click="addNestedTableRow(column)"
                    >
                      <i class="fas fa-plus mr-1" />
                      Add Row
                    </button>
                    <button
                      v-if="currentRowData[column.name] && currentRowData[column.name].length > 0"
                      type="button"
                      class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      @click="editNestedTable(column)"
                    >
                      <i class="fas fa-edit mr-1" />
                      Manage Table
                    </button>
                    <button
                      v-if="currentRowData[column.name] && currentRowData[column.name].length > 0"
                      type="button"
                      class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      @click="clearNestedTable(column.name)"
                    >
                      <i class="fas fa-trash mr-1" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Default fallback -->
              <input
                v-else
                v-model="currentRowData[column.name]"
                type="text"
                :placeholder="column.placeholder"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <div 
                v-if="column.helpText" 
                class="text-xs text-gray-500 mt-1"
              >
                {{ column.helpText }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click.prevent="closeModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="color: white !important;"
            @click.prevent="saveRow"
          >
            {{ isEditing ? 'Update' : 'Add' }} Row
          </button>
        </div>
      </div>
    </div>

    <!-- Nested Table Modal -->
    <div 
      v-if="showNestedTableModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-55"
      @click="closeNestedTableModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <div class="modal-header px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              Edit Nested Table: {{ currentNestedColumn?.label }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              Manage rows in the nested table
            </p>
          </div>
          <button 
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click.prevent="closeNestedTableModal"
          >
            <i class="fas fa-times" />
          </button>
        </div>
        
        <div class="modal-body px-6 py-4 overflow-y-auto max-h-96">
          <!-- Nested Table -->
          <div class="nested-table-container border border-gray-300 rounded-lg overflow-hidden">
            <!-- Headers -->
            <div class="bg-gray-50 border-b border-gray-200">
              <div class="table-row-flex">
                <div 
                  v-for="column in nestedTableColumns" 
                  :key="column.id"
                  class="table-cell flex-1 px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
                >
                  {{ column.label }}
                  <span 
                    v-if="column.required" 
                    class="text-red-500 ml-1"
                  >*</span>
                </div>
                <div class="table-cell w-24 px-3 py-2 text-sm font-medium text-gray-700 text-center">
                  Actions
                </div>
              </div>
            </div>
            
            <!-- Rows -->
            <div class="table-body">
              <div 
                v-for="(row, rowIndex) in nestedTableData" 
                :key="rowIndex"
                class="table-row-flex border-b border-gray-100 last:border-b-0"
              >
                <div 
                  v-for="column in nestedTableColumns" 
                  :key="column.id"
                  class="table-cell flex-1 px-3 py-2 border-r border-gray-200 last:border-r-0"
                >
                  <!-- Text Input -->
                  <input
                    v-if="column.type === 'text' || column.type === 'email' || column.type === 'phone' || column.type === 'url'"
                    v-model="row[column.name]"
                    :type="getInputType(column.type)"
                    :placeholder="column.placeholder || column.label"
                    :required="column.required"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                  
                  <!-- Number Input -->
                  <input
                    v-else-if="column.type === 'number'"
                    v-model.number="row[column.name]"
                    type="number"
                    :placeholder="column.placeholder || column.label"
                    :required="column.required"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                  
                  <!-- Select Dropdown -->
                  <select
                    v-else-if="column.type === 'select'"
                    v-model="row[column.name]"
                    :required="column.required"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">
                      Select...
                    </option>
                    <option 
                      v-for="option in column.options" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  
                  <!-- Date Input -->
                  <input
                    v-else-if="column.type === 'date'"
                    v-model="row[column.name]"
                    type="date"
                    :required="column.required"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                  
                  <!-- Textarea -->
                  <textarea
                    v-else-if="column.type === 'textarea'"
                    v-model="row[column.name]"
                    :placeholder="column.placeholder || column.label"
                    :required="column.required"
                    rows="2"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  
                  <!-- Checkbox -->
                  <div 
                    v-else-if="column.type === 'checkbox'" 
                    class="flex items-center justify-center"
                  >
                    <input
                      v-model="row[column.name]"
                      type="checkbox"
                      :required="column.required"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                  </div>
                  
                  <!-- Default Text Input -->
                  <input
                    v-else
                    v-model="row[column.name]"
                    type="text"
                    :placeholder="column.placeholder || column.label"
                    :required="column.required"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                </div>
                <div class="table-cell w-24 px-3 py-2 text-center">
                  <button
                    type="button"
                    title="Remove row"
                    class="text-red-600 hover:text-red-800 p-1"
                    @click.prevent="removeNestedRow(rowIndex)"
                  >
                    <i class="fas fa-trash text-xs" />
                  </button>
                </div>
              </div>
              
              <!-- Empty state -->
              <div 
                v-if="nestedTableData.length === 0" 
                class="text-center py-8 text-gray-500"
              >
                <i class="fas fa-table text-3xl mb-2 text-gray-300" />
                <p class="text-sm">
                  No rows in nested table
                </p>
              </div>
            </div>
            
            <!-- Add row button -->
            <div class="bg-gray-50 px-3 py-2 border-t border-gray-200">
              <button
                type="button"
                class="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                @click.prevent="addNestedRow"
              >
                <i class="fas fa-plus text-xs" />
                <span>Add Row</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click.prevent="closeNestedTableModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="color: white !important;"
            @click.prevent="saveNestedTable"
          >
            Save Table
          </button>
        </div>
      </div>
    </div>

    <!-- Nested Table Row Modal (for adding/editing individual nested table rows) -->
    <div 
      v-if="showNestedRowModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70"
      @click="closeNestedRowModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <div class="modal-header px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingNestedRowIndex !== null ? 'Edit' : 'Add' }} Row in {{ currentNestedColumn?.label }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ editingNestedRowIndex !== null ? 'Edit existing row data' : 'Add new row to nested table' }}
            </p>
          </div>
          <button 
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click.prevent="closeNestedRowModal"
          >
            <i class="fas fa-times" />
          </button>
        </div>
        
        <div class="modal-body px-6 py-4 overflow-y-auto max-h-96">
          <div 
            v-if="nestedTableColumns.length === 0" 
            class="text-center py-4 text-gray-500"
          >
            <p>No columns available for this nested table.</p>
          </div>
          
          <div 
            v-else 
            class="space-y-4"
          >
            <div 
              v-for="column in nestedTableColumns" 
              :key="column.id" 
              class="form-group"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ column.label }}
                <span 
                  v-if="column.required" 
                  class="text-red-500 ml-1"
                >*</span>
              </label>
              
              <!-- Text Input -->
              <input
                v-if="column.type === 'text' || column.type === 'email' || column.type === 'phone' || column.type === 'url'"
                v-model="currentNestedRowData[column.name]"
                :type="getInputType(column.type)"
                :placeholder="column.placeholder"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Textarea -->
              <textarea
                v-else-if="column.type === 'textarea'"
                v-model="currentNestedRowData[column.name]"
                :placeholder="column.placeholder"
                :required="column.required"
                :rows="column.rows || 3"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <!-- Number Input -->
              <input
                v-else-if="column.type === 'number'"
                v-model.number="currentNestedRowData[column.name]"
                type="number"
                :placeholder="column.placeholder"
                :required="column.required"
                :min="column.min"
                :max="column.max"
                :step="column.step"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Select Dropdown -->
              <select
                v-else-if="column.type === 'select'"
                v-model="currentNestedRowData[column.name]"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  Select an option...
                </option>
                <option 
                  v-for="option in column.options" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              
              <!-- Date Input -->
              <input
                v-else-if="column.type === 'date'"
                v-model="currentNestedRowData[column.name]"
                type="date"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- DateTime Input -->
              <input
                v-else-if="column.type === 'datetime'"
                v-model="currentNestedRowData[column.name]"
                type="datetime-local"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Checkbox -->
              <div 
                v-else-if="column.type === 'checkbox'" 
                class="flex items-center"
              >
                <input
                  v-model="currentNestedRowData[column.name]"
                  type="checkbox"
                  :required="column.required"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ column.placeholder || column.label }}</span>
              </div>
              
              <!-- Default fallback -->
              <input
                v-else
                v-model="currentNestedRowData[column.name]"
                type="text"
                :placeholder="column.placeholder"
                :required="column.required"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <div 
                v-if="column.helpText" 
                class="text-xs text-gray-500 mt-1"
              >
                {{ column.helpText }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click.prevent="closeNestedRowModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="color: white !important;"
            @click.prevent="saveNestedTableRow"
          >
            {{ editingNestedRowIndex !== null ? 'Update' : 'Add' }} Row
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useFormBuilderStore } from '../../stores/form-builder-store';
import type { Control } from '../../types';

interface TableDocField {
  fieldtype: string;
  label: string;
  fieldname: string;
  reqd?: boolean;
  placeholder?: string;
  options?: any[];
  helpText?: string;
  linkedFormId?: string;
  linkedFormName?: string;
  tableColumns?: Control[];
  maxRows?: number;
  minRows?: number;
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  tableData?: any[]; // Add the tableData property
}

interface Props {
  df: TableDocField;
  value?: any[];
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  readonly: false
});

const emit = defineEmits<{
  'update:model-value': [value: any[]];
  'update:table-data': [data: any[]]; // Add this to update the control's tableData property
}>();

// Store
const formStore = useFormBuilderStore();

// Reactive data
const tableData = ref<any[]>([]);
const showModal = ref(false);
const currentRowData = ref<Record<string, any>>({});
const editingIndex = ref<number | null>(null);
const linkedFormFields = ref<any[]>([]);

// Nested table modal state
const showNestedTableModal = ref(false);
const currentNestedColumn = ref<any>(null);
const nestedTableData = ref<any[]>([]);
const nestedTableColumns = ref<any[]>([]);

// Nested table row editing state
const showNestedRowModal = ref(false);
const currentNestedRowData = ref<Record<string, any>>({});
const editingNestedRowIndex = ref<number | null>(null);

// Reactive trigger for nested table updates
const nestedTableFieldsUpdateTrigger = ref(0);

// Computed properties
const linkedFormId = computed(() => {
  return props.df.linkedFormId;
});
const tableColumns = computed(() => {
  // First priority: Use tableColumns from properties panel if available
  if (props.df.tableColumns && props.df.tableColumns.length > 0) {
    const columns = props.df.tableColumns.map(field => ({
      id: field.id || field.name,
      name: field.name,
      label: field.label || field.name,
      type: field.type?.toLowerCase() || 'text',
      required: field.required || false,
      placeholder: field.placeholder || '',
      helpText: field.helpText || field.description || '',
      options: field.options || [],
      min: field.min,
      max: field.max,
      step: field.step,
      rows: field.rows || 3
    }));
    
    return columns;
  }
  
  // Second priority: Use fields from the linked form (if we fetched them)
  if (linkedFormFields.value.length > 0) {
    const columns = linkedFormFields.value.map(field => ({
      id: field.name || field.fieldname,
      name: field.fieldname || field.name,
      label: field.label || field.fieldname,
      type: field.fieldtype?.toLowerCase() || 'text',
      required: field.reqd || false,
      placeholder: field.description || '',
      helpText: field.description || '',
      options: field.options || [],
      min: field.min,
      max: field.max,
      step: field.step,
      rows: field.rows || 3
    }));
    
    return columns;
  }
  
  // Third priority: Show default columns when no configuration is available
  if (!props.df.linkedFormId && (!props.df.tableColumns || props.df.tableColumns.length === 0)) {
    return [
      { 
        id: 'name', 
        name: 'name', 
        label: 'Name', 
        type: 'text', 
        required: true, 
        placeholder: 'Enter name', 
        helpText: 'Enter the name for this row', 
        options: [], 
        min: undefined,
        max: undefined,
        step: undefined,
        rows: 3 
      },
      { 
        id: 'description', 
        name: 'description', 
        label: 'Description', 
        type: 'textarea', 
        required: false, 
        placeholder: 'Enter description', 
        helpText: 'Optional description for this row', 
        options: [],
        min: undefined,
        max: undefined,
        step: undefined,
        rows: 3 
      },
      { 
        id: 'value', 
        name: 'value', 
        label: 'Value', 
        type: 'number', 
        required: false, 
        placeholder: 'Enter value', 
        helpText: 'Numeric value for this row', 
        options: [],
        min: undefined,
        max: undefined,
        step: undefined,
        rows: 3 
      }
    ];
  }
  
  // Fallback: Empty array
  return [];
});

// Check if we're using default columns (to show help message)
const isUsingDefaultColumns = computed(() => {
  return !props.df.linkedFormId && 
         (!props.df.tableColumns || props.df.tableColumns.length === 0) &&
         tableColumns.value.length > 0;
});

const maxRows = computed(() => props.df.maxRows);
const minRows = computed(() => props.df.minRows);
const allowAdd = computed(() => props.df.allowAdd !== false);
const allowDelete = computed(() => props.df.allowDelete !== false);
const allowEdit = computed(() => props.df.allowEdit !== false);
const allowActions = computed(() => allowEdit.value || allowDelete.value);
const isEditing = computed(() => editingIndex.value !== null);
const readonly = computed(() => props.readonly);

const fieldClasses = computed(() => {
  const classes = ['table-control'];
  if (props.df.reqd) classes.push('required');
  return classes.join(' ');
});

// Initialize table data from props.value OR props.df.tableData
watch(() => props.value, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    tableData.value = [...newValue];
    
    // Initialize nested table data for existing rows
    tableData.value.forEach(row => {
      initializeNestedTableDataForRow(row);
    });
  } else {
    tableData.value = [];
  }
}, { immediate: true });

// Also initialize from df.tableData (for form builder mode)
watch(() => props.df.tableData, (newTableData) => {
  if (newTableData && Array.isArray(newTableData) && newTableData.length > 0) {
    tableData.value = [...newTableData];
    
    // Initialize nested table data for existing rows
    tableData.value.forEach(row => {
      initializeNestedTableDataForRow(row);
    });
  }
}, { immediate: true });

// Watch for df prop changes - handle form loading after refresh
watch(() => props.df, (newDf, oldDf) => {
  // Check if linkedFormId has become available
  if (newDf.linkedFormId && newDf.linkedFormId !== oldDf?.linkedFormId) {
    // Fetch linked form fields when linkedFormId becomes available
    fetchLinkedFormFields(newDf.linkedFormId);
  }
}, { deep: true, immediate: true });

// Watch for linkedFormId changes directly
watch(linkedFormId, async (newFormId, oldFormId) => {
  if (newFormId !== oldFormId && newFormId) {
    await fetchLinkedFormFields(newFormId);
  } else if (!newFormId) {
    linkedFormFields.value = [];
  }
}, { immediate: true });

// Watch for changes in tableColumns and reinitialize nested table data
watch(() => tableColumns.value, (newColumns) => {
  // Reinitialize nested table data for all existing rows when columns change
  tableData.value.forEach(row => {
    initializeNestedTableDataForRow(row);
  });
}, { deep: true });

// Watch for nested table columns with linkedFormId and fetch their fields
watch(() => tableColumns.value, async (newColumns) => {
  // Check if any nested table columns have linkedFormId
  for (const column of newColumns) {
    if (column.type === 'table' && (column as any).linkedFormId) {
      const nestedLinkedFormId = (column as any).linkedFormId;
      // Fetch fields for nested table
      await fetchLinkedFormFieldsForNestedTable(nestedLinkedFormId, column);
      // Continue to handle all nested tables, not just the first one
    }
  }
}, { deep: true, immediate: true });

// Fetch linked form fields for nested tables
async function fetchLinkedFormFieldsForNestedTable(formId: string, nestedColumn: any) {
  if (!formId) return;
  
  try {
    // Load saved forms to get the form configuration
    await formStore.loadSavedForms();
    
    // Find the linked form in saved forms
    const linkedForm = formStore.savedForms.find(form => form._id === formId);
    
    if (linkedForm && linkedForm.configuration) {
      // Extract all data fields from the form configuration
      const fields: any[] = [];
      
      // Navigate through the form structure: tabs -> sections -> rows -> columns -> fields
      if (linkedForm.configuration.layout && linkedForm.configuration.layout.tabs) {
        linkedForm.configuration.layout.tabs.forEach((tab: any) => {
          if (tab.sections) {
            tab.sections.forEach((section: any) => {
              if (section.rows) {
                section.rows.forEach((row: any) => {
                  if (row.columns) {
                    row.columns.forEach((column: any) => {
                      if (column.fields) {
                        column.fields.forEach((field: any) => {
                          // Only include data fields (exclude layout/UI elements)
                          if (field.type && 
                              !['Tab Break', 'Section Break', 'Column Break', 'HTML', 'Divider'].includes(field.type)) {
                            // Convert field format to match what TableControl expects
                            const convertedField = {
                              fieldname: field.name,
                              label: field.label,
                              fieldtype: field.type,
                              reqd: field.required || false,
                              description: field.helpText || field.placeholder || '',
                              options: field.options || [],
                              min: field.min,
                              max: field.max,
                              step: field.step,
                              rows: field.rows || 3
                            };
                            fields.push(convertedField);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      // Store the linked form fields for this specific nested column
      if (!nestedColumn.linkedFormFields) {
        nestedColumn.linkedFormFields = [];
      }
      nestedColumn.linkedFormFields = fields;
      
      // Trigger reactive update for nested table displays
      nestedTableFieldsUpdateTrigger.value++;
      
      /* eslint-disable no-console */
      console.info(`TableControl: Successfully loaded ${fields.length} fields for nested table "${nestedColumn.label}" from linked form "${linkedForm.name}"`);
      /* eslint-enable no-console */
    }
  } catch (error) {
    /* eslint-disable no-console */
    console.error('TableControl: Error fetching linked form fields for nested table:', error);
    /* eslint-enable no-console */
    if (nestedColumn.linkedFormFields) {
      nestedColumn.linkedFormFields = [];
    }
  }
}

// Emit changes to both value and control configuration
watch(tableData, (newData) => {
  emit('update:model-value', [...newData]);
  emit('update:table-data', [...newData]);
}, { deep: true });

// Fetch linked form fields and populate table columns
async function fetchLinkedFormFields(formId: string) {
  if (!formId) return;
  
  try {
    // Load saved forms to get the form configuration
    await formStore.loadSavedForms();
    
    // Find the linked form in saved forms
    const linkedForm = formStore.savedForms.find(form => form._id === formId);
    
    if (linkedForm && linkedForm.configuration) {
      // Extract all data fields from the form configuration
      const fields: any[] = [];
      
      // Navigate through the form structure: tabs -> sections -> rows -> columns -> fields
      if (linkedForm.configuration.layout && linkedForm.configuration.layout.tabs) {
        linkedForm.configuration.layout.tabs.forEach((tab: any) => {
          if (tab.sections) {
            tab.sections.forEach((section: any) => {
              if (section.rows) {
                section.rows.forEach((row: any) => {
                  if (row.columns) {
                    row.columns.forEach((column: any) => {
                      if (column.fields) {
                        column.fields.forEach((field: any) => {
                          // Only include data fields (exclude layout/UI elements)
                          if (field.type && 
                              !['Tab Break', 'Section Break', 'Column Break', 'HTML', 'Divider'].includes(field.type)) {
                            // Convert field format to match what TableControl expects
                            const convertedField = {
                              fieldname: field.name,
                              label: field.label,
                              fieldtype: field.type,
                              reqd: field.required || false,
                              description: field.helpText || field.placeholder || '',
                              options: field.options || [],
                              min: field.min,
                              max: field.max,
                              step: field.step,
                              rows: field.rows || 3
                            };
                            fields.push(convertedField);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      // Update linked form fields - this will trigger tableColumns recomputation
      linkedFormFields.value = fields;
      
      /* eslint-disable no-console */
      console.info(`TableControl: Successfully loaded ${fields.length} fields from linked form "${linkedForm.name}"`);
      /* eslint-enable no-console */
    } else {
      linkedFormFields.value = [];
    }
  } catch (error) {
    /* eslint-disable no-console */
    console.error('TableControl: Error fetching linked form fields:', error);
    /* eslint-enable no-console */
    linkedFormFields.value = [];
  }
}

// Helper function to initialize nested table data for a row
function initializeNestedTableDataForRow(rowData: Record<string, any>) {
  // Get current table columns, including both configured and linked form fields
  const currentColumns = tableColumns.value;
  
  currentColumns.forEach(column => {
    if (column.type === 'table') {
      if (!rowData[column.name] || !Array.isArray(rowData[column.name])) {
        rowData[column.name] = [];
      }
    }
  });
  
  // Also check for any table columns from df.tableColumns that might not be in computed tableColumns yet
  if (props.df.tableColumns && props.df.tableColumns.length > 0) {
    props.df.tableColumns.forEach((column: any) => {
      if (column.type === 'table') {
        if (!rowData[column.name] || !Array.isArray(rowData[column.name])) {
          rowData[column.name] = [];
        }
      }
    });
  }
}

// Methods
function addRow() {
  if (maxRows.value && tableData.value.length >= maxRows.value) {
    return;
  }
  
  currentRowData.value = {};
  
  // Initialize nested table data for all table columns
  initializeNestedTableDataForRow(currentRowData.value);
  
  editingIndex.value = null;
  showModal.value = true;
}

function editRow(index: number) {
  currentRowData.value = { ...tableData.value[index] };
  
  // Initialize nested table data for all table columns
  initializeNestedTableDataForRow(currentRowData.value);
  
  editingIndex.value = index;
  showModal.value = true;
}

function deleteRow(index: number) {
  if (confirm('Are you sure you want to delete this row?')) {
    tableData.value.splice(index, 1);
  }
}

function saveRow() {
  // Validate required fields
  const missingFields = tableColumns.value.filter(column => 
    column.required && !currentRowData.value[column.name]
  );
  
  if (missingFields.length > 0) {
    alert(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
    return;
  }
  
  if (isEditing.value && editingIndex.value !== null) {
    // Update existing row
    tableData.value[editingIndex.value] = { ...currentRowData.value };
  } else {
    // Add new row
    tableData.value.push({ ...currentRowData.value });
  }
  
  closeModal();
}

function closeModal() {
  showModal.value = false;
  currentRowData.value = {};
  editingIndex.value = null;
}

// Format cell values for display, including special handling for nested tables
function formatCellValue(value: any, type: string): string {
  if (value == null || value === '') return '-';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'checkbox':
      return value ? 'Yes' : 'No';
    case 'number':
      return typeof value === 'number' ? value.toString() : value;
    case 'table':
      // Handle nested table data
      if (Array.isArray(value)) {
        const rowCount = value.length;
        return rowCount === 0 ? 'Empty table' : `${rowCount} row${rowCount !== 1 ? 's' : ''}`;
      } else if (typeof value === 'object' && value !== null) {
        // If it's an object, it might be a single table row
        return 'Table data';
      }
      return 'Table (no data)';
    default:
      return String(value);
  }
}

// Format nested cell values (simpler version for nested table display)
function formatNestedCellValue(value: any, type: string): string {
  if (value == null || value === '') return '-';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleDateString();
    case 'checkbox':
      return value ? '✓' : '✗';
    case 'number':
      return typeof value === 'number' ? value.toString() : value;
    default:
      return String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value);
  }
}

// Get nested table columns for display in the preview
function getNestedTableColumnsForDisplay(column: any): any[] {
  // Access the trigger to make this function reactive to field loading
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = nestedTableFieldsUpdateTrigger.value;
  
  let columnsToUse: any[] = [];
  
  // Priority 1: Use tableColumns from the column configuration
  if (column.tableColumns && column.tableColumns.length > 0) {
    columnsToUse = column.tableColumns;
  }
  // Priority 2: Use linkedFormFields if the column has fetched linked form fields
  else if (column.linkedFormId && column.linkedFormFields && column.linkedFormFields.length > 0) {
    columnsToUse = column.linkedFormFields;
  }
  // Priority 3: Check if this column is from tableColumns and has nested configuration
  else if (column.type === 'table') {
    const mainColumn = tableColumns.value.find(col => col.name === column.name) as any;
    if (mainColumn && mainColumn.tableColumns) {
      columnsToUse = mainColumn.tableColumns;
    } else if (mainColumn && mainColumn.linkedFormFields && mainColumn.linkedFormFields.length > 0) {
      columnsToUse = mainColumn.linkedFormFields;
    }
  }
  // Priority 4: Check the original df.tableColumns for nested table configurations
  else if (props.df.tableColumns && props.df.tableColumns.length > 0) {
    const nestedTableColumn = props.df.tableColumns.find((col: any) => col.name === column.name && col.type === 'table');
    if (nestedTableColumn && (nestedTableColumn as any).tableColumns) {
      columnsToUse = (nestedTableColumn as any).tableColumns;
    } else if (nestedTableColumn && (nestedTableColumn as any).linkedFormFields) {
      columnsToUse = (nestedTableColumn as any).linkedFormFields;
    }
  }
  // Priority 5: Use linkedFormFields if the column has a linkedFormId (fallback to main table)
  else if (column.linkedFormId && linkedFormFields.value.length > 0) {
    columnsToUse = linkedFormFields.value;
  }
  
  // Configure nested table columns for display
  if (columnsToUse.length > 0) {
    const configuredColumns = columnsToUse.map((col: any) => ({
      id: col.id || col.name || col.fieldname,
      name: col.name || col.fieldname,
      label: col.label || col.name || col.fieldname,
      type: (col.type || col.fieldtype || 'text').toLowerCase()
    }));
    
    return configuredColumns;
  } else {
    // Fallback columns for display
    const fallbackColumns = [
      { id: 'name', name: 'name', label: 'Name', type: 'text' },
      { id: 'value', name: 'value', label: 'Value', type: 'text' }
    ];
    
    return fallbackColumns;
  }
}

function getInputType(fieldType: string): string {
  switch (fieldType) {
    case 'email': return 'email';
    case 'phone': return 'tel';
    case 'url': return 'url';
    case 'password': return 'password';
    default: return 'text';
  }
}

// Nested table methods
function editNestedTable(column: any) {
  // Initialize nested table data if it doesn't exist
  if (!currentRowData.value[column.name]) {
    currentRowData.value[column.name] = [];
  }
  
  // Set up nested table modal
  currentNestedColumn.value = column;
  nestedTableData.value = [...(currentRowData.value[column.name] || [])];
  
  // Try to get columns from the nested table configuration (multiple sources)
  let columnsToUse: any[] = [];
  
  // Debug logging to understand what we have
  if (typeof window !== 'undefined') {
    window.console?.log('editNestedTable called with column:', {
      column,
      columnName: column.name,
      columnType: column.type,
      hasTableColumns: !!(column.tableColumns),
      tableColumns: column.tableColumns,
      hasLinkedFormId: !!(column.linkedFormId),
      linkedFormId: column.linkedFormId,
      currentTableColumns: tableColumns.value
    });
  }
  
  // Priority 1: Use tableColumns from the column configuration
  if (column.tableColumns && column.tableColumns.length > 0) {
    columnsToUse = column.tableColumns;
    if (typeof window !== 'undefined') {
      window.console?.log('Using column.tableColumns:', columnsToUse);
    }
  }
  // Priority 2: Check if this column is from tableColumns and has nested configuration
  else if (column.type === 'table') {
    // Find the column in the main tableColumns array to get its nested configuration
    const mainColumn = tableColumns.value.find(col => col.name === column.name) as any;
    if (mainColumn && mainColumn.tableColumns) {
      columnsToUse = mainColumn.tableColumns;
      if (typeof window !== 'undefined') {
        window.console?.log('Using mainColumn.tableColumns:', columnsToUse);
      }
    }
  }
  // Priority 3: Use linkedFormFields if the column has a linkedFormId
  else if (column.linkedFormId && linkedFormFields.value.length > 0) {
    columnsToUse = linkedFormFields.value;
    if (typeof window !== 'undefined') {
      window.console?.log('Using linkedFormFields:', columnsToUse);
    }
  }
  // Priority 4: Try to get from the current form's fields if we can find the nested table field
  else if (column.linkedFormId) {
    // Look for nested table configuration in the current form structure
    const currentForm = formStore.form;
    if (currentForm && currentForm.layout && currentForm.layout.tabs) {
      for (const tab of currentForm.layout.tabs) {
        for (const section of tab.sections || []) {
          for (const col of section.columns || []) {
            for (const field of col.fields || []) {
              const fieldDf = field.df as any; // Type assertion for accessing custom properties
              if ((field.name === column.name || fieldDf.fieldname === column.name) && fieldDf.tableColumns) {
                columnsToUse = fieldDf.tableColumns;
                break;
              }
            }
            if (columnsToUse.length > 0) break;
          }
          if (columnsToUse.length > 0) break;
        }
        if (columnsToUse.length > 0) break;
      }
    }
  }
  
  // Configure nested table columns
  if (columnsToUse.length > 0) {
    nestedTableColumns.value = columnsToUse.map((col: any) => ({
      id: col.id || col.name || col.fieldname,
      name: col.name || col.fieldname,
      label: col.label || col.name || col.fieldname,
      type: (col.type || col.fieldtype || 'text').toLowerCase(),
      required: col.required || col.reqd || false,
      placeholder: col.placeholder || '',
      helpText: col.helpText || col.description || '',
      options: col.options || [],
      min: col.min,
      max: col.max,
      step: col.step,
      rows: col.rows || 3
    }));
    
    // Debug logging
    if (typeof window !== 'undefined') {
      window.console?.log('Nested table columns configured:', {
        sourceColumns: columnsToUse,
        configuredColumns: nestedTableColumns.value,
        columnName: column.name
      });
    }
  } else {
    // Fallback to intelligent default columns based on the nested table context
    nestedTableColumns.value = [
      { id: 'name', name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter name', helpText: '', options: [] },
      { id: 'description', name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Enter description', helpText: '', options: [] },
      { id: 'value', name: 'value', label: 'Value', type: 'text', required: false, placeholder: 'Enter value', helpText: '', options: [] },
      { id: 'type', name: 'type', label: 'Type', type: 'select', required: false, placeholder: '', helpText: '', options: [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'date', label: 'Date' }
      ]}
    ];
    
    // Debug logging for fallback
    if (typeof window !== 'undefined') {
      window.console?.log('Using fallback nested table columns:', {
        column: column,
        fallbackColumns: nestedTableColumns.value
      });
    }
  }
  
  showNestedTableModal.value = true;
}

function clearNestedTable(columnName: string) {
  if (confirm('Are you sure you want to clear all nested table data?')) {
    currentRowData.value[columnName] = [];
  }
}

function addNestedRow() {
  const newRow: Record<string, any> = {};
  
  // Initialize fields based on the actual nested table columns
  nestedTableColumns.value.forEach(col => {
    // Initialize with appropriate default values based on field type
    switch (col.type) {
      case 'number':
        newRow[col.name] = 0;
        break;
      case 'checkbox':
        newRow[col.name] = false;
        break;
      case 'date':
        newRow[col.name] = '';
        break;
      case 'datetime':
        newRow[col.name] = '';
        break;
      case 'select':
        newRow[col.name] = '';
        break;
      case 'textarea':
        newRow[col.name] = '';
        break;
      case 'email':
      case 'phone':
      case 'url':
      case 'text':
      default:
        newRow[col.name] = '';
    }
  });
  
  // Add system fields for tracking
  newRow.id = `nested_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  newRow.created_at = new Date().toISOString();
  
  // Add the new row to the nested table data
  nestedTableData.value.push(newRow);
  
  // Debug logging
  if (typeof window !== 'undefined') {
    window.console?.log('Added new nested row:', {
      newRow,
      columns: nestedTableColumns.value,
      totalRows: nestedTableData.value.length
    });
  }
}

function removeNestedRow(index: number) {
  if (confirm('Are you sure you want to remove this row?')) {
    nestedTableData.value.splice(index, 1);
  }
}

function saveNestedTable() {
  // Validate required fields in nested table
  const requiredColumns = nestedTableColumns.value.filter(col => col.required);
  
  if (requiredColumns.length > 0) {
    const invalidRows = nestedTableData.value.filter(row => 
      requiredColumns.some(col => !row[col.name] || row[col.name] === '')
    );
    
    if (invalidRows.length > 0) {
      const requiredFieldNames = requiredColumns.map(col => col.label).join(', ');
      alert(`Please fill in all required fields (${requiredFieldNames}) in all rows before saving.`);
      return;
    }
  }
  
  if (currentNestedColumn.value) {
    currentRowData.value[currentNestedColumn.value.name] = [...nestedTableData.value];
  }
  closeNestedTableModal();
}

function closeNestedTableModal() {
  // Initialize nested table data if it doesn't exist
  if (!currentRowData.value[column.name]) {
    currentRowData.value[column.name] = [];
  }
  
  // Set up for new nested row
  currentNestedColumn.value = column;
  editingNestedRowIndex.value = null;
  
  // If the column has a linkedFormId but no linkedFormFields, fetch them first
  if (column.linkedFormId && (!column.linkedFormFields || column.linkedFormFields.length === 0)) {
    await fetchLinkedFormFieldsForNestedTable(column.linkedFormId, column);
  }
  
  // Get the columns for the nested table
  getNestedTableColumns(column);
  
  // Initialize empty row data
  currentNestedRowData.value = {};
  nestedTableColumns.value.forEach(col => {
    switch (col.type) {
      case 'number':
        currentNestedRowData.value[col.name] = 0;
        break;
      case 'checkbox':
        currentNestedRowData.value[col.name] = false;
        break;
      case 'date':
      case 'datetime':
      case 'select':
      case 'textarea':
      case 'email':
      case 'phone':
      case 'url':
      case 'text':
      default:
        currentNestedRowData.value[col.name] = '';
    }
  });
  
  // Show the nested row modal
  showNestedRowModal.value = true;
}

// Edit existing row in nested table
async function editNestedTableRow(column: any, rowIndex: number) {
  currentNestedColumn.value = column;
  editingNestedRowIndex.value = rowIndex;
  
  // If the column has a linkedFormId but no linkedFormFields, fetch them first
  if (column.linkedFormId && (!column.linkedFormFields || column.linkedFormFields.length === 0)) {
    await fetchLinkedFormFieldsForNestedTable(column.linkedFormId, column);
  }
  
  // Get the columns for the nested table
  getNestedTableColumns(column);
  
  // Copy existing row data
  const existingRow = currentRowData.value[column.name][rowIndex];
  currentNestedRowData.value = { ...existingRow };
  
  showNestedRowModal.value = true;
}

// Save nested table row
function saveNestedTableRow() {
  if (!currentNestedColumn.value) return;
  
  // Validate required fields
  const requiredColumns = nestedTableColumns.value.filter(col => col.required);
  if (requiredColumns.length > 0) {
    const invalidFields = requiredColumns.filter(col => 
      !currentNestedRowData.value[col.name] || currentNestedRowData.value[col.name] === ''
    );
    
    if (invalidFields.length > 0) {
      const fieldNames = invalidFields.map(col => col.label).join(', ');
      alert(`Please fill in all required fields: ${fieldNames}`);
      return;
    }
  }
  
  // Add system fields
  if (!currentNestedRowData.value.id) {
    currentNestedRowData.value.id = `nested_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  currentNestedRowData.value.updated_at = new Date().toISOString();
  
  // Initialize nested table array if needed
  if (!currentRowData.value[currentNestedColumn.value.name]) {
    currentRowData.value[currentNestedColumn.value.name] = [];
  }
  
  // Add or update row
  if (editingNestedRowIndex.value !== null) {
    // Update existing row
    currentRowData.value[currentNestedColumn.value.name][editingNestedRowIndex.value] = { ...currentNestedRowData.value };
  } else {
    // Add new row
    currentNestedRowData.value.created_at = new Date().toISOString();
    currentRowData.value[currentNestedColumn.value.name].push({ ...currentNestedRowData.value });
  }
  
  closeNestedRowModal();
}

// Close nested row modal
function closeNestedRowModal() {
  showNestedRowModal.value = false;
  currentNestedColumn.value = null;
  currentNestedRowData.value = {};
  editingNestedRowIndex.value = null;
  nestedTableColumns.value = [];
}

// Get columns for nested table (extracted from editNestedTable for reuse)
function getNestedTableColumns(column: any) {
  let columnsToUse: any[] = [];
  
  // Priority 1: Use tableColumns from the column configuration
  if (column.tableColumns && column.tableColumns.length > 0) {
    columnsToUse = column.tableColumns;
  }
  // Priority 2: Use linkedFormFields if the column has a linkedFormId and we've fetched the fields
  else if (column.linkedFormId && column.linkedFormFields && column.linkedFormFields.length > 0) {
    columnsToUse = column.linkedFormFields;
  }
  // Priority 3: Check if this column is from tableColumns and has nested configuration
  else if (column.type === 'table') {
    const mainColumn = tableColumns.value.find(col => col.name === column.name) as any;
    if (mainColumn && mainColumn.tableColumns) {
      columnsToUse = mainColumn.tableColumns;
    }
  }
  // Priority 4: Check the original df.tableColumns for nested table configurations
  else if (props.df.tableColumns && props.df.tableColumns.length > 0) {
    const nestedTableColumn = props.df.tableColumns.find((col: any) => col.name === column.name && col.type === 'table');
    if (nestedTableColumn && (nestedTableColumn as any).tableColumns) {
      columnsToUse = (nestedTableColumn as any).tableColumns;
    }
  }
  // Priority 5: Use linkedFormFields if the column has a linkedFormId (fallback to main table linked fields)
  else if (column.linkedFormId && linkedFormFields.value.length > 0) {
    columnsToUse = linkedFormFields.value;
  }
  // Priority 6: Try to fetch from a linked form if linkedFormId is specified (trigger async fetch)
  else if (column.linkedFormId) {
    // Trigger async fetch and return early - the fetch will update the column.linkedFormFields
    fetchLinkedFormFieldsForNestedTable(column.linkedFormId, column).then(() => {
      // Re-run this function after fields are loaded
      getNestedTableColumns(column);
    });
    return; // Early return to avoid setting fallback columns immediately
  }
  
  // Configure nested table columns
  if (columnsToUse.length > 0) {
    nestedTableColumns.value = columnsToUse.map((col: any) => ({
      id: col.id || col.name || col.fieldname,
      name: col.name || col.fieldname,
      label: col.label || col.name || col.fieldname,
      type: (col.type || col.fieldtype || 'text').toLowerCase(),
      required: col.required || col.reqd || false,
      placeholder: col.placeholder || '',
      helpText: col.helpText || col.description || '',
      options: col.options || [],
      min: col.min,
      max: col.max,
      step: col.step,
      rows: col.rows || 3
    }));
    
    if (typeof window !== 'undefined') {
      window.console?.log('Successfully configured nested table columns:', nestedTableColumns.value);
    }
  } else {
    // Fallback columns
    nestedTableColumns.value = [
      { id: 'name', name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter name', helpText: '', options: [] },
      { id: 'description', name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Enter description', helpText: '', options: [] },
      { id: 'value', name: 'value', label: 'Value', type: 'text', required: false, placeholder: 'Enter value', helpText: '', options: [] }
    ];
    
    if (typeof window !== 'undefined') {
      window.console?.log('Using fallback columns, no configuration found for:', {
        columnName: column.name,
        columnType: column.type,
        fallbackColumns: nestedTableColumns.value
      });
    }
  }
}

// Remove nested table row from preview
function removeNestedTableRowFromPreview(columnName: string, rowIndex: number) {
  if (confirm('Are you sure you want to remove this row?')) {
    if (currentRowData.value[columnName] && Array.isArray(currentRowData.value[columnName])) {
      currentRowData.value[columnName].splice(rowIndex, 1);
    }
  }
}

onMounted(async () => {
  // Initialize with minimum rows if specified
  if (minRows.value && tableData.value.length < minRows.value) {
    const rowsToAdd = minRows.value - tableData.value.length;
    for (let i = 0; i < rowsToAdd; i++) {
      tableData.value.push({});
    }
  }
  
  // If we have a linkedFormId, fetch the linked form fields immediately
  if (props.df.linkedFormId) {
    await fetchLinkedFormFields(props.df.linkedFormId);
  }
  
  // Also check for nested tables with linkedFormId and fetch their fields
  if (props.df.tableColumns && props.df.tableColumns.length > 0) {
    for (const column of props.df.tableColumns) {
      if (column.type === 'table' && (column as any).linkedFormId) {
        await fetchLinkedFormFieldsForNestedTable((column as any).linkedFormId, column as any);
      }
    }
  }
});
</script>

<style scoped>
.table-control {
  margin-bottom: 1rem;
}

.table-container {
  background: white;
}

.table-row-flex {
  display: flex;
  min-height: 40px;
}

.table-cell {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.table-header .table-cell {
  background-color: #f9fafb;
}

.modal-header {
  background-color: #f9fafb;
}

.hover\:bg-gray-25:hover {
  background-color: #fafafa;
}

/* Form styling in modal */
.form-group label {
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Required field styling */
.required .table-container {
  border-color: #ef4444;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-row-flex {
    flex-direction: column;
  }
  
  .table-cell {
    border-right: none !important;
    border-bottom: 1px solid #e5e7eb;
    justify-content: space-between;
  }
  
  .table-cell:last-child {
    border-bottom: none;
  }
  
  .table-header .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    min-width: 100px;
  }
}

/* Nested table modal styling */
.nested-table-container {
  background: white;
}

.nested-table-container .table-cell input,
.nested-table-container .table-cell textarea,
.nested-table-container .table-cell select {
  font-size: 12px;
  padding: 4px 8px;
}

/* Nested table wrapper improvements */
.nested-table-wrapper {
  position: relative;
}

.nested-table-wrapper::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%);
  border-radius: 6px;
  z-index: -1;
}

/* Better visual distinction for nested tables */
.nested-table-data {
  position: relative;
  overflow: hidden;
}

.nested-table-data::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
}

/* Nested table preview styling */
.nested-table-preview {
  min-height: 60px;
}

.nested-table-preview .nested-table-container {
  font-size: 11px;
  max-width: 100%;
}

.nested-table-preview .nested-table-container .flex {
  min-height: 20px;
}

.nested-table-preview .nested-table-container .flex > div {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments for nested tables */
@media (max-width: 768px) {
  .nested-table-preview .nested-table-container {
    display: none;
  }
  
  .nested-table-preview .flex.items-center {
    justify-content: space-between;
  }
}
</style>
