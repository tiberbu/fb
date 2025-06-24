import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { 
  createLayout, 
  sectionBoilerplate
} from '../utils/form-builder-utils';
import type { DocField, FormState, Tab, Field } from '../types/form-builder';
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
      currentFormId.value = result._id;
      formName.value = name;
      formDescription.value = description;
      dirty.value = false;
      return result;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateFormConfiguration(): Promise<any> {
    if (!currentFormId.value) {
      throw new Error('No form ID available for update');
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
      return result;
    } finally {
      isSaving.value = false;
    }
  }

  async function loadFormConfiguration(formId: string): Promise<void> {
    isLoading.value = true;
    try {
      const result = await api.getFormConfiguration(formId);
      
      form.value = result.configuration;
      currentFormId.value = result._id;
      formName.value = result.name;
      formDescription.value = result.description || '';
      
      if (form.value.layout.tabs?.length > 0) {
        form.value.activeTab = form.value.layout.tabs[0].df.name;
      }
      
      dirty.value = false;
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
    newForm
  };
});
