import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { 
  createLayout, 
  sectionBoilerplate
} from '../utils/form-builder-utils';
import { isLocalId } from '../utils/id-utils';
import { toast } from '../composables/useToast';
import { StoredFieldsAPI } from '../services/StoredFieldsAPI';
import type { DocField, FormState, Tab, Field } from '../types/form-builder';
import type { Control } from '../types';
import FormBuilderAPI from '../services/FormBuilderAPI';

export const useFormBuilderStore = defineStore('form-builder-store', () => {
  // API instance
  const api = new FormBuilderAPI();
  
  // State
  const doctype = ref<string>('');
  const docfields = ref<DocField[]>([]);
  const customDocfields = ref<DocField[]>([]);
  const form = ref<FormState>({
    layout: { tabs: [] },
    activeTab: null,
    selectedField: null,
  });
  const dirty = ref<boolean>(false);
  const readOnly = ref<boolean>(false);
  const isCustomizeForm = ref<boolean>(false);
  const preview = ref<boolean>(false);
  const drag = ref<boolean>(false);
  const getAnimation = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

  // New API-related state
  const currentFormId = ref<string | null>(null);
  const formName = ref<string>('');
  const formDescription = ref<string>('');
  const isSaving = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const savedForms = ref<any[]>([]);

  // Getters
  const getDocfields = computed((): DocField[] => {
    return isCustomizeForm.value ? customDocfields.value : docfields.value;
  });

  const currentTab = computed((): Tab | undefined => {
    return form.value.layout.tabs?.find(tab => tab.df.name === form.value.activeTab);
  });

  const notUsingInput = computed((): boolean => {
    const activeElement = document.activeElement;
    return activeElement?.hasAttribute('readonly') ||
      activeElement?.hasAttribute('disabled') ||
      (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA');
  });

  // Actions
  function selected(name: string): boolean {
    return form.value.selectedField?.name === name;
  }

  function getDf(fieldtype: string, fieldname = '', label = ''): DocField {
    const id = Math.random().toString(36).substring(2, 10);
    return {
      name: id,
      fieldtype: fieldtype,
      fieldname: fieldname || `field_${id}`,
      label: label || '',
      isCustomField: isCustomizeForm.value ? 1 : 0
    };
  }

  function hasStandardField(field: Field | Tab | any): boolean {
    if (!isCustomizeForm.value) return false;
    if (!field.df.isCustomField) return true;

    const fieldTypeMap: Record<string, string> = {
      'Tab Break': 'sections',
      'Section Break': 'columns',
      'Column Break': 'fields',
    };
    
    const children = fieldTypeMap[field.df.fieldtype];

    if (!children) return false;

    return field[children].some((child: Field | Tab | any) => {
      if (!child.df.isCustomField) return true;
      return hasStandardField(child);
    });
  }

  function isUserGeneratedField(field: Field | Tab | any): boolean {
    return Boolean(field.df.isCustomField && !field.df.isSystemGenerated);
  }

  async function fetch(): Promise<void> {
    // This would be implemented to fetch form data from the server
    // For now, we'll create a simple layout structure
    form.value.layout = createLayout();
    if (form.value.layout.tabs?.length > 0) {
      form.value.activeTab = form.value.layout.tabs[0].df.name;
    }
  }

  function activateTab(tab: Tab): void {
    form.value.activeTab = tab.df.name;
  }

  function addNewTab(): void {
    const newTab: Tab = {
      df: getDf('Tab Break', '', 'New Tab'),
      sections: [sectionBoilerplate()],
    };
    form.value.layout.tabs.push(newTab);
    form.value.activeTab = newTab.df.name;
    dirty.value = true;
  }

  // API Integration Methods
  async function saveFormConfiguration(name: string, description = ''): Promise<any> {
    isSaving.value = true;
    try {
      const formData = {
        name,
        description,
        configuration: form.value,
        createdBy: 'form-builder-user',
      };

      const result = await api.saveFormConfiguration(formData);
      
      if (result && result.data && result.data._id) {
        currentFormId.value = result.data._id;
        formName.value = name;
        formDescription.value = description;
        dirty.value = false;
        
        // Show success toast
        toast.success('Form Saved', 'Form configuration saved successfully');
        
        return result.data;
      } else {
        throw new Error('Invalid response from server - missing form ID');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Show error toast
      toast.error('Save Failed', `Failed to save form: ${errorMessage}`);
      
      console.error('Error saving form configuration:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateFormConfiguration(): Promise<any> {
    if (!currentFormId.value) {
      throw new Error('No form ID available for update');
    }

    // Check if this is a local ID (fallback from failed creation)
    // MongoDB ObjectIds are 24 character hex strings
    if (isLocalId(currentFormId.value)) {
      // This is a local ID, we need to create a new form instead of updating
      toast.info('Creating New Form', 'Converting local form to database record');
      return await saveFormConfiguration(formName.value, formDescription.value);
    }

    isSaving.value = true;
    try {
      const formData = {
        name: formName.value,
        description: formDescription.value,
        configuration: form.value,
        updatedBy: 'form-builder-user',
      };

      const result = await api.updateFormConfiguration(currentFormId.value, formData);
      dirty.value = false;
      
      // Show success toast
      toast.success('Form Updated', 'Form configuration updated successfully');
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Show error toast
      toast.error('Update Failed', `Failed to update form: ${errorMessage}`);
      
      throw error;
    } finally {
      isSaving.value = false;
    }
  }

  async function loadFormConfiguration(formId: string): Promise<void> {
    isLoading.value = true;
    try {
      const result = await api.getFormConfiguration(formId);
      
      if (result && result.data) {
        const formData = result.data;
        
        // Set the form configuration from the API response
        if (formData.configuration) {
          form.value = formData.configuration;
        } else {
          // Initialize with default layout if no configuration
          form.value = {
            layout: createLayout(),
            activeTab: null,
            selectedField: null,
          };
        }
        
        currentFormId.value = formData._id;
        formName.value = formData.name;
        formDescription.value = formData.description || '';
        
        if (form.value.layout.tabs?.length > 0) {
          form.value.activeTab = form.value.layout.tabs[0].df.name;
        }
        
        dirty.value = false;
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function loadSavedForms(): Promise<void> {
    isLoading.value = true;
    try {
      const result = await api.getFormConfigurations();
      savedForms.value = result.data;
    } finally {
      isLoading.value = false;
    }
  }

  function newForm(): void {
    form.value = {
      layout: createLayout(),
      activeTab: null,
      selectedField: null,
    };
    
    if (form.value.layout.tabs?.length > 0) {
      form.value.activeTab = form.value.layout.tabs[0].df.name;
    }
    
    currentFormId.value = null;
    formName.value = '';
    formDescription.value = '';
    dirty.value = false;
  }

  // Save field configuration as template
  async function saveFieldConfiguration(control: Control, options: {
    name?: string;
    description?: string;
    tags?: string[];
  } = {}) {
    try {
      await StoredFieldsAPI.saveFieldConfiguration(control, options);
      toast.success('Field configuration saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving field configuration:', error);
      toast.error('Failed to save field configuration');
      throw error;
    }
  }

  // Add field from stored configuration
  function addField(control: Control) {
    console.log('addField called with:', control)
    console.log('currentTab.value:', currentTab.value)
    
    // This would add the field to the current form
    // Implementation depends on your form structure
    if (currentTab.value && currentTab.value.sections.length > 0) {
      const firstSection = currentTab.value.sections[0];
      console.log('firstSection:', firstSection)
      
      if (firstSection.columns && firstSection.columns.length > 0) {
        const firstColumn = firstSection.columns[0];
        console.log('firstColumn before:', firstColumn)
        
        if (!firstColumn.fields) {
          firstColumn.fields = [];
        }
        
        // Convert Control to Field format expected by the form builder
        const field = {
          df: {
            name: control.name || control.id,
            fieldtype: control.type,
            fieldname: control.name || control.id,
            label: control.label,
            description: control.description,
            reqd: control.required || false,
            readOnly: false, // Default value since Control doesn't have isReadonly
            hidden: false,   // Default value since Control doesn't have isHidden
            options: control.options?.map(opt => typeof opt === 'string' ? opt : opt.label || opt.value).join('\n') || '',
            placeholder: control.placeholder,
            rows: control.rows,
            default: control.defaultValue,
            min: control.min,
            max: control.max,
            step: control.step,
            accept: control.accept,
            multiple: control.multiple
          },
          name: control.name || control.id
        };
        
        console.log('Generated field:', field)
        firstColumn.fields.push(field);
        console.log('firstColumn after:', firstColumn)
        dirty.value = true;
        console.log('Field added successfully')
      } else {
        console.log('No columns found in first section')
      }
    } else {
      console.log('No currentTab or sections found')
    }
  }

  return { 
    doctype,
    form,
    dirty,
    readOnly,
    isCustomizeForm,
    preview,
    drag,
    getAnimation,
    
    // New API-related state
    currentFormId,
    formName,
    formDescription,
    isSaving,
    isLoading,
    savedForms,
    
    // ...existing code...
    getDocfields,
    currentTab,
    notUsingInput,
    selected,
    getDf,
    hasStandardField,
    isUserGeneratedField,
    fetch,
    activateTab,
    addNewTab,
    
    // New API methods
    saveFormConfiguration,
    updateFormConfiguration,
    loadFormConfiguration,
    loadSavedForms,
    newForm,
    saveFieldConfiguration,
    addField
  };
});
