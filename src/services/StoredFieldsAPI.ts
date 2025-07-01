import { Control } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002';

interface StoredField {
  _id: string;
  name: string;
  label: string;
  type: string;
  configuration: any;
  fieldData: Control;
  tags: string[];
  description: string;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredFieldsResponse {
  success: boolean;
  data: StoredField[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface StoredFieldResponse {
  success: boolean;
  data: StoredField;
}

export class StoredFieldsAPI {
  // Get all stored fields with search and filtering
  static async getStoredFields(params: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<StoredFieldsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/api/stored-fields?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stored fields: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get a specific stored field by ID
  static async getStoredField(id: string): Promise<StoredFieldResponse> {
    const response = await fetch(`${API_BASE_URL}/api/stored-fields/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stored field: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Create a new stored field
  static async createStoredField(fieldData: {
    name: string;
    label: string;
    type: string;
    configuration?: any;
    fieldData: Control;
    tags?: string[];
    description?: string;
    createdBy?: string;
  }): Promise<StoredFieldResponse> {
    const response = await fetch(`${API_BASE_URL}/api/stored-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create stored field: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Update a stored field
  static async updateStoredField(id: string, fieldData: Partial<{
    name: string;
    label: string;
    type: string;
    configuration: any;
    fieldData: Control;
    tags: string[];
    description: string;
  }>): Promise<StoredFieldResponse> {
    const response = await fetch(`${API_BASE_URL}/api/stored-fields/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update stored field: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Delete a stored field
  static async deleteStoredField(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/stored-fields/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete stored field: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Mark a stored field as used (increment usage count)
  static async markFieldAsUsed(id: string): Promise<StoredFieldResponse> {
    const response = await fetch(`${API_BASE_URL}/api/stored-fields/${id}/use`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to mark field as used: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get field type statistics
  static async getFieldTypeStats(): Promise<{
    success: boolean;
    data: Array<{
      _id: string;
      count: number;
      totalUsage: number;
    }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/stored-fields/stats/types`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch field type statistics: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Helper method to save a field configuration
  static async saveFieldConfiguration(
    control: Control,
    options: {
      name?: string;
      description?: string;
      tags?: string[];
    } = {}
  ): Promise<StoredFieldResponse> {
    const fieldData = {
      name: options.name || control.name || `field_${Date.now()}`,
      label: control.label || 'Untitled Field',
      type: control.type,
      configuration: {
        placeholder: control.placeholder,
        helpText: control.helpText,
        options: control.options,
        formulas: control.formulas,
        cssClasses: control.cssClasses,
        padding: control.padding,
        margin: control.margin,
        // Add any other configuration properties
        ...control
      },
      fieldData: control,
      tags: options.tags || [control.type],
      description: options.description || '',
      createdBy: 'user'
    };

    return this.createStoredField(fieldData);
  }
}

export type { StoredField, StoredFieldsResponse, StoredFieldResponse };
