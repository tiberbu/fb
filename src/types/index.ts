export type ControlType = 'text' | 'textarea' | 'number' | 'select' | 'check' | 'date' | 'file' | 'link';

export interface Option {
  label: string;
  value: string;
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
}
