import { ref, computed, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { Control, ControlType } from "../../../types";

export function useFormBuilderComposable(emit: any) {
  // Form configuration
  const formName = ref("New Form");
  const formDescription = ref("");
  const formId = ref(`form-${Date.now()}`);
  const isPublished = ref(false);
  const formLayout = ref("tabs"); // tabs, accordion, sidebar

  // Form state
  const tabs = ref<Array<{ label: string; description?: string; sections: any[]; formulas?: any[] }>>([
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

  // Emit form data changes whenever relevant data changes
  watch([formName, formDescription, formId, isPublished, formLayout, tabs], () => {
    emitFormDataChange();
  }, { deep: true });

  // Computed properties
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

  const hasSelection = computed(() => {
    return !!(selectedControl.value || selectedSection.value || selectedColumn.value || selectedRow.value || selectedTab.value !== null);
  });

  const selectionType = computed(() => {
    if (selectedControl.value) return 'Field';
    if (selectedSection.value) return 'Section';
    if (selectedColumn.value) return 'Column';
    if (selectedRow.value) return 'Row';
    if (selectedTab.value !== null) return 'Tab';
    return '';
  });

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

  // Functions
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
    selectedTab.value = index;
    selectedControl.value = null;
    selectedSection.value = null;
    showSidebar.value = true;
  }

  function toggleSidebar() {
    showSidebar.value = !showSidebar.value;
  }

  function closeSidebar() {
    showSidebar.value = false;
  }

  function toggleAccordionTab(index: number) {
    activeTab.value = activeTab.value === index ? -1 : index;
  }

  function clearSelection() {
    selectedControl.value = null;
    selectedSection.value = null;
    selectedColumn.value = null;
    selectedRow.value = null;
    selectedTab.value = null;
  }

  function addTab() {
    const tabNumber = tabs.value.length + 1;
    const tabName = `Tab ${tabNumber}`;
    const newTab = {
      label: tabName,
      sections: [],
    };
    tabs.value.push(newTab);
    activeTab.value = tabs.value.length - 1;
  }

  function duplicateTab(index: number) {
    const sourceTab = tabs.value[index];
    const duplicatedTab = JSON.parse(JSON.stringify(sourceTab));
    duplicatedTab.label = `${sourceTab.label} (Copy)`;
    regenerateIds(duplicatedTab);
    tabs.value.splice(index + 1, 0, duplicatedTab);
    activeTab.value = index + 1;
  }

  function updateTabName(index: number, name: string) {
    if (tabs.value[index] && name.trim()) {
      tabs.value[index].label = name.trim();
    }
  }

  function updateTabDescription(index: number, description: string) {
    if (tabs.value[index]) {
      if (!tabs.value[index].description) {
        tabs.value[index].description = '';
      }
      tabs.value[index].description = description;
    }
  }

  function regenerateIds(tab: any) {
    if (!tab.sections) return;
    tab.sections.forEach((section: any) => {
      section.id = uuidv4();
      if (section.rows) {
        section.rows.forEach((row: any) => {
          row.id = uuidv4();
          if (row.columns) {
            row.columns.forEach((column: any) => {
              if (column.fields) {
                column.fields.forEach((field: any) => {
                  field.id = uuidv4();
                  field.name = `${field.name}_${Date.now().toString().slice(-4)}`;
                });
              }
            });
          }
        });
      } else if (section.columns) {
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

  function selectSection(section: any) {
    selectedSection.value = section.id;
    selectedControl.value = null;
    selectedColumn.value = null;
    selectedTab.value = null;
    showSidebar.value = true;
  }

  function selectColumn(sectionId: string, columnIndex: number) {
    selectedColumn.value = { sectionId, columnIndex };
    selectedSection.value = null;
    selectedControl.value = null;
    selectedTab.value = null;
    showSidebar.value = true;
  }

  function selectRow(sectionId: string, rowIndex: number) {
    selectedRow.value = { sectionId, rowIndex };
    selectedSection.value = null;
    selectedControl.value = null;
    selectedColumn.value = null;
    selectedTab.value = null;
    showSidebar.value = true;
  }

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

  function deleteRow(sectionId: string, rowIndex: number) {
    const section = getSectionById(sectionId);
    if (section.rows && section.rows.length > 1) {
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

  function getSectionById(id: string) {
    return currentTabSections.value.find((section) => section.id === id) || {};
  }

  function deleteColumn(sectionId: string, columnIndex: number) {
    const section = getSectionById(sectionId);
    if (section.columns && section.columns.length > 1) {
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

  function getAllFields(): Control[] {
    let fields: Control[] = [];
    
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

  function addControl(type: ControlType) {
    if (currentTabSections.value.length === 0) {
      addSection();
    }

    const section = currentTabSections.value[0];
    
    if (section.rows && section.rows[0] && section.rows[0].columns) {
      addFieldToColumn(section, 0, 0, type);
    } else {
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

  function editControl(control: Control) {
    selectedControl.value = control;
    selectedSection.value = null;
    selectedColumn.value = null;
    selectedTab.value = null;
    showSidebar.value = true;
  }

  function deleteControl(id: string) {
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

  function loadSavedForm() {
    const savedForm = localStorage.getItem('savedFormStructure');
    if (savedForm) {
      try {
        const formData = JSON.parse(savedForm);
        if (formData && formData.metadata && formData.tabs) {
          formName.value = formData.metadata.formName || 'New Form';
          formDescription.value = formData.metadata.formDescription || '';
          formId.value = formData.metadata.formId || `form-${Date.now()}`;
          isPublished.value = formData.metadata.isPublished || false;
          formLayout.value = formData.metadata.formLayout || 'tabs';
          
          if (Array.isArray(formData.tabs) && formData.tabs.length > 0) {
            tabs.value = formData.tabs;
            if (activeTab.value >= tabs.value.length) {
              activeTab.value = 0;
            }
          }
        }
      } catch (error) {
        // Handle error silently for production
      }
    }
  }

  function updateControlProps(updatedControl: Control) {
    const { id } = updatedControl;
    
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
    
    if (selectedControl.value?.id === id) {
      selectedControl.value = updatedControl;
    }
    
    emitFormDataChange();
  }

  function addColumnToRow(section: any, rowIndex: number) {
    if (!section.rows[rowIndex]) return;
    
    const currentColumns = section.rows[rowIndex].columns;
    if (currentColumns && currentColumns.length >= 3) {
      alert("Maximum of 3 columns per row is allowed");
      return;
    }
    
    if (!section.rows[rowIndex].columns) {
      section.rows[rowIndex].columns = [];
    }
    
    section.rows[rowIndex].columns.push({
      fields: []
    });
    
    emitFormDataChange();
  }

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
    
    const dataStr = JSON.stringify(formStructure, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${formId.value || 'form'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  function handleFileImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const formData = JSON.parse(content);
        
        if (!formData || !formData.metadata || !formData.tabs) {
          alert('Invalid form file. Please make sure the file contains valid form configuration.');
          return;
        }
        
        if (confirm('This will replace the current form configuration. Are you sure you want to continue?')) {
          formName.value = formData.metadata.formName || 'Imported Form';
          formDescription.value = formData.metadata.formDescription || '';
          formId.value = formData.metadata.formId || `form-${Date.now()}`;
          isPublished.value = formData.metadata.isPublished || false;
          
          if (Array.isArray(formData.tabs) && formData.tabs.length > 0) {
            tabs.value = formData.tabs;
            activeTab.value = 0;
            selectedControl.value = null;
            selectedSection.value = null;
            selectedColumn.value = null;
            selectedRow.value = null;
            selectedTab.value = null;
            
            emitFormDataChange();
            
            alert('Form imported successfully!');
          } else {
            alert('Invalid form data: no valid tabs found.');
          }
        }
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.');
      }
      
      if (target) {
        target.value = '';
      }
    };
    
    reader.readAsText(file);
  }

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

  function openFormulaPreview() {
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
    
    window.open('/formula-preview', '_blank');
  }

  function copyToClipboard() {
    const jsonText = getFormattedJson();
    navigator.clipboard.writeText(jsonText).then(() => {
      alert('JSON copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  }

  function updateTabFormulas(formulas: any[]) {
    if (selectedTab.value !== null && tabs.value[selectedTab.value]) {
      const tab = tabs.value[selectedTab.value] as any;
      if (!tab.formulas) {
        tab.formulas = [];
      }
      tab.formulas = formulas;
      emitFormDataChange();
    }
  }

  function updateSectionFormulas(formulas: any[]) {
    if (selectedSection.value) {
      const section = getSectionById(selectedSection.value);
      if (section) {
        section.formulas = formulas;
        emitFormDataChange();
      }
    }
  }

  function handleTabOrderChanged() {
    emitFormDataChange();
  }

  function openSectionMenu(section: any) {
    // TODO: Implement section menu functionality
    alert(`Section menu for: ${section.title}`);
  }

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

  return {
    // State
    formName,
    formDescription,
    formId,
    isPublished,
    formLayout,
    tabs,
    activeTab,
    selectedTab,
    selectedControl,
    selectedSection,
    selectedColumn,
    selectedRow,
    editingTabIndex,
    showFieldSelector,
    activeSection,
    activeRowIndex,
    activeColumn,
    fileInput,
    showSidebar,
    fieldSearchQuery,
    fieldTypes,
    
    // Computed
    currentTabSections,
    hasSelection,
    selectionType,
    filteredFieldTypes,
    
    // Methods
    emitFormDataChange,
    openTabProperties,
    toggleSidebar,
    closeSidebar,
    toggleAccordionTab,
    clearSelection,
    addTab,
    duplicateTab,
    updateTabName,
    updateTabDescription,
    addSection,
    deleteSection,
    selectSection,
    selectColumn,
    selectRow,
    addRowToSection,
    deleteRow,
    getSectionById,
    deleteColumn,
    getAllFields,
    openFieldSelector,
    closeFieldSelector,
    addFieldToColumn,
    addControl,
    editControl,
    deleteControl,
    loadSavedForm,
    updateControlProps,
    addColumnToRow,
    exportForm,
    handleFileImport,
    getFormattedJson,
    openFormulaPreview,
    copyToClipboard,
    updateTabFormulas,
    updateSectionFormulas,
    handleTabOrderChanged,
    openSectionMenu,
    deleteTab,
    getIconForFieldType,
    getFieldTypeDescription
  };
}
