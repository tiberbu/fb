// Example integration with Vue.js Form Builder
// Add this to your Vue.js app to integrate with the form server

const API_BASE_URL = 'http://localhost:3001/api';

export class FormServerAPI {
  // Form Configuration Methods
  
  /**
   * Save a form configuration to the server
   */
  async saveFormConfiguration(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/form-configurations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || 'Untitled Form',
          description: formData.description || '',
          configuration: formData.configuration,
          createdBy: formData.createdBy || 'form-builder-user'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save form configuration');
      }

      return result.data;
    } catch (error) {
      console.error('Error saving form configuration:', error);
      throw error;
    }
  }

  /**
   * Get all form configurations
   */
  async getFormConfigurations(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/form-configurations?page=${page}&limit=${limit}&isActive=true`
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch form configurations');
      }

      return result;
    } catch (error) {
      console.error('Error fetching form configurations:', error);
      throw error;
    }
  }

  /**
   * Get a specific form configuration
   */
  async getFormConfiguration(formId) {
    try {
      const response = await fetch(`${API_BASE_URL}/form-configurations/${formId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch form configuration');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching form configuration:', error);
      throw error;
    }
  }

  /**
   * Update a form configuration
   */
  async updateFormConfiguration(formId, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/form-configurations/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          configuration: formData.configuration,
          updatedBy: formData.updatedBy || 'form-builder-user'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update form configuration');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating form configuration:', error);
      throw error;
    }
  }

  // Form Submission Methods

  /**
   * Submit form data
   */
  async submitFormData(formConfigurationId, submissionData, submittedBy = 'anonymous') {
    try {
      const response = await fetch(`${API_BASE_URL}/form-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formConfigurationId,
          submissionData,
          submittedBy,
          metadata: {
            submissionTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            source: 'form-builder-frontend'
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit form data');
      }

      return result.data;
    } catch (error) {
      console.error('Error submitting form data:', error);
      throw error;
    }
  }

  /**
   * Get submissions for a specific form
   */
  async getFormSubmissions(formConfigurationId, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/form-submissions/form/${formConfigurationId}?page=${page}&limit=${limit}`
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch form submissions');
      }

      return result;
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      throw error;
    }
  }

  /**
   * Get all form submissions
   */
  async getAllSubmissions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/form-submissions?${queryParams.toString()}`
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch submissions');
      }

      return result;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(submissionId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/form-submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update submission status');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  }
}

// Usage example in Vue.js component:
/*
<script setup>
import { ref, onMounted } from 'vue';
import { FormServerAPI } from './FormServerAPI.js';

const formAPI = new FormServerAPI();
const forms = ref([]);
const selectedForm = ref(null);
const submissions = ref([]);

// Load available forms on component mount
onMounted(async () => {
  try {
    const result = await formAPI.getFormConfigurations();
    forms.value = result.data;
  } catch (error) {
    console.error('Failed to load forms:', error);
  }
});

// Save current form configuration
const saveForm = async (formData) => {
  try {
    const savedForm = await formAPI.saveFormConfiguration(formData);
    console.log('Form saved successfully:', savedForm);
    // Refresh forms list
    const result = await formAPI.getFormConfigurations();
    forms.value = result.data;
  } catch (error) {
    console.error('Failed to save form:', error);
  }
};

// Load a specific form for editing or viewing
const loadForm = async (formId) => {
  try {
    const form = await formAPI.getFormConfiguration(formId);
    selectedForm.value = form;
    // Load submissions for this form
    const submissionsResult = await formAPI.getFormSubmissions(formId);
    submissions.value = submissionsResult.data;
  } catch (error) {
    console.error('Failed to load form:', error);
  }
};

// Submit form data
const submitForm = async (formId, formData, userName = 'anonymous') => {
  try {
    const submission = await formAPI.submitFormData(formId, formData, userName);
    console.log('Form submitted successfully:', submission);
    // Refresh submissions
    const submissionsResult = await formAPI.getFormSubmissions(formId);
    submissions.value = submissionsResult.data;
  } catch (error) {
    console.error('Failed to submit form:', error);
  }
};
</script>
*/

export default FormServerAPI;
