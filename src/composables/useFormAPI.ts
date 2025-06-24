import { ref, computed } from 'vue';
import FormBuilderAPI from '../services/FormBuilderAPI';
import type { FormState } from '../types/form-builder';

const api = new FormBuilderAPI();

export function useFormAPI() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const savedForms = ref<any[]>([]);
  const submissions = ref<any[]>([]);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  // Save form configuration
  const saveForm = async (formData: {
    name: string;
    description?: string;
    configuration: FormState;
    createdBy?: string;
  }) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await api.saveFormConfiguration(formData);
      await loadSavedForms(); // Refresh the list
      return result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save form';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load all saved forms
  const loadSavedForms = async (page = 1, limit = 50) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await api.getFormConfigurations(page, limit);
      savedForms.value = result.data;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load forms';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load a specific form configuration
  const loadForm = async (formId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await api.getFormConfiguration(formId);
      return result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load form';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update form configuration
  const updateForm = async (formId: string, formData: {
    name?: string;
    description?: string;
    configuration?: FormState;
    updatedBy?: string;
  }) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await api.updateFormConfiguration(formId, formData);
      await loadSavedForms(); // Refresh the list
      return result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update form';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete form configuration
  const deleteForm = async (formId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      await api.deleteFormConfiguration(formId);
      await loadSavedForms(); // Refresh the list
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete form';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Submit form data
  const submitForm = async (formId: string, submissionData: any, submittedBy = 'anonymous') => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await api.submitFormData(formId, submissionData, submittedBy);
      return result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit form';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Load form submissions
  const loadSubmissions = async (formId?: string, page = 1, limit = 50) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await api.getFormSubmissions(formId, page, limit);
      submissions.value = result.data;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load submissions';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update submission status
  const updateSubmissionStatus = async (submissionId: string, status: 'submitted' | 'processed' | 'archived') => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await api.updateSubmissionStatus(submissionId, status);
      return result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update submission status';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    loading: isLoading,
    error,
    savedForms,
    submissions,
    hasError,
    
    // Actions
    clearError,
    saveForm,
    loadSavedForms,
    loadForm,
    updateForm,
    deleteForm,
    submitForm,
    loadSubmissions,
    updateSubmissionStatus,
  };
}
