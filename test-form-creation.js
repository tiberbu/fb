// Test script to verify form creation API
const testFormCreation = async () => {
  const apiUrl = 'http://localhost:3002/api/form-configurations';
  
  const testFormData = {
    name: 'Test Form',
    description: 'A test form to verify API',
    configuration: {
      formId: 'test-form-001',
      isActive: true,
      isPublished: false,
      metadata: {
        formLayout: 'tabs',
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      },
      tabs: [
        {
          label: 'Test Tab',
          sections: [
            {
              id: 'section-test',
              title: 'Test Section',
              collapsible: false,
              rows: [
                {
                  id: 'row-test',
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
    createdBy: 'test-user'
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFormData)
    });

    const result = await response.json();
    console.log('Form creation test result:', result);
    
    if (result.success) {
      console.log('✅ Form creation API is working correctly');
      return result.data._id;
    } else {
      console.log('❌ Form creation failed:', result.message);
      console.log('Validation errors:', result.errors);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  testFormCreation();
} else {
  // Node.js environment
  console.log('Run this in browser console or include fetch polyfill');
}
