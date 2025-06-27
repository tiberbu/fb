export type ControlType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'checkbox'
  | 'check' 
  | 'date' 
  | 'datetime'
  | 'time'
  | 'file' 
  | 'image'
  | 'link' 
  | 'email'
  | 'phone'
  | 'url'
  | 'password'
  | 'radio'
  | 'range'
  | 'color'
  | 'hidden'
  | 'readonly'
  | 'divider'
  | 'html'
  | 'table';

export interface Option {
  label: string;
  value: string;
}

export interface Formula {
  expression: string;
  type: 'calculation' | 'visibility' | 'readonly' | 'required';
  enabled: boolean;
  dependsOn?: string[];
}

export interface Control {
  id: string;
  type: ControlType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  options?: Option[];
  order: number;
  defaultValue?: any;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  content?: string;
  helpText?: string;
  // Table control specific properties
  linkedFormId?: string; // For table controls - ID of the form to use for table structure
  linkedFormName?: string; // Display name of the linked form
  tableColumns?: Control[]; // For table controls - fields that will be used as columns
  maxRows?: number; // Maximum number of rows allowed
  minRows?: number; // Minimum number of rows required
  allowAdd?: boolean; // Allow adding new rows
  allowDelete?: boolean; // Allow deleting rows
  allowEdit?: boolean; // Allow editing existing rows
  tableData?: any[]; // Table data for preview/runtime
  // CSS Styling properties
  cssClasses?: string;
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  // Legacy formula support (for backward compatibility)
  formula?: string;
  formulaType?: 'calculation' | 'visibility';
  // Enhanced formula support
  formulas?: Formula[];
  isHidden?: boolean;
  isReadonly?: boolean;
  dependsOn?: string[];
  // Field definition for compatibility with Field component
  df?: {
    fieldtype?: string;
    fieldname?: string;
    label?: string;
    name?: string;
    isCustomField?: number;
    required?: boolean;
    description?: string;
  };
}

export interface Section {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  collapsible?: boolean;
  hideTitle?: boolean; // Hide the section title
  hideSubtitle?: boolean; // Hide the section subtitle
  rows?: Array<any>; // Rows containing columns
  columns?: Array<any>; // Legacy support for direct columns
  formulas?: Formula[]; // Formula support for sections
  isHidden?: boolean;
  // CSS Styling properties
  cssClasses?: string;
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  // Legacy formula support (for backward compatibility)
  formula?: string;
  formulaType?: 'visibility';
  isReadonly?: boolean;
  dependsOn?: string[];
}

export interface Tab {
  label: string;
  sections: Section[];
  formulas?: Formula[]; // Formula support for tabs
  isHidden?: boolean;
}
