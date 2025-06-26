import { ref } from 'vue';
import { useRouter } from 'vue-router';
import FormBuilderAPI from '../services/FormBuilderAPI';
import { toast } from './useToast';

export function useFormCreation() {
  const router = useRouter();
  const api = new FormBuilderAPI();
  const isCreating = ref(false);

  const createNewForm = async () => {
    isCreating.value = true;
    
    try {
      // Create a new form in the database with minimal data
      const newFormData = {
        name: `New Form ${new Date().toLocaleDateString()}`,
        description: 'A new form created with Form Builder',
        configuration: {
          formId: `form-${Date.now()}`,
          isActive: true,
          isPublished: false,
          metadata: {
            formLayout: 'tabs',
            createdAt: new Date().toISOString(),
            version: '1.0.0'
          },
          tabs: [
            {
              label: 'Tab 1',
              sections: [
                {
                  id: `section-${Date.now()}`,
                  title: 'Section 1',
                  collapsible: false,
                  rows: [
                    {
                      id: `row-${Date.now()}`,
                      columns: [
                        {
                          fields: []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        createdBy: 'form-builder-user'
      };

      const response = await api.saveFormConfiguration(newFormData);
      
      if (response && response.data && response.data._id) {
        // Show success toast
        toast.success('Form Created', 'New form created successfully');
        
        // Navigate to the builder with the new form ID
        await router.push(`/builder/${response.data._id}`);
        return response.data._id;
      } else {
        throw new Error('Failed to get form ID from response');
      }
    } catch (error) {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Form Creation Failed', `Failed to create form: ${errorMessage}`);
      
      // Log the actual error for debugging
      console.error('Form creation failed:', error);
      
      // For now, still provide fallback but this should be investigated
      const fallbackId = `form-${Date.now()}`;
      await router.push(`/builder/${fallbackId}`);
      return fallbackId;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    createNewForm,
    isCreating
  };
}
