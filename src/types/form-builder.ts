/**
 * Type definitions for the form builder components
 */

export interface DocField {
  name: string;
  fieldtype: string;
  fieldname: string;
  label: string;
  description?: string;
  reqd?: boolean;
  readOnly?: boolean;
  isCustomField?: number; // 0 or 1
  isSystemGenerated?: boolean;
  hidden?: boolean;
  options?: string | any[];
  collapsible?: number; // 0 or 1
  hide_border?: boolean;
  rows?: number;
  placeholder?: string;
}

export interface Field {
  df: DocField;
  name?: string;
}

export interface Column {
  df: DocField;
  fields: Field[];
  isFirst?: boolean;
}

export interface Section {
  df: DocField;
  columns: Column[];
  isFirst?: boolean;
}

export interface Tab {
  df: DocField;
  sections: Section[];
  isFirst?: boolean;
  hidden?: boolean;
}

export interface FormLayout {
  tabs: Tab[];
}

export interface FormState {
  layout: FormLayout;
  activeTab: string | null;
  selectedField: DocField | null;
}
