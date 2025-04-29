import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { 
  createLayout, 
  sectionBoilerplate,
  scrubFieldNames
} from '../utils/form-builder-utils';
import type { DocField, FormState, Tab, Field } from '../types/form-builder';

export const useFormBuilderStore = defineStore('form-builder-store', () => {
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
    getDocfields,
    currentTab,
    notUsingInput,
    selected,
    getDf,
    hasStandardField,
    isUserGeneratedField,
    fetch,
    activateTab,
    addNewTab
  };
});
