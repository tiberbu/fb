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
  | 'html';

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
}

export interface Section {
  id: string;
  title: string;
  collapsible?: boolean;
  rows?: Array<any>; // Rows containing columns
  columns?: Array<any>; // Legacy support for direct columns
  formulas?: Formula[]; // Formula support for sections
  isHidden?: boolean;
}

export interface Tab {
  label: string;
  sections: Section[];
  formulas?: Formula[]; // Formula support for tabs
  isHidden?: boolean;
}
