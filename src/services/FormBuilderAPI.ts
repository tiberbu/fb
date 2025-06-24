// API service for form builder backend integration
class FormBuilderAPI {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Form Configuration Methods
  async saveFormConfiguration(formData: any) {
    return this.makeRequest('/form-configurations', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async getFormConfigurations(page = 1, limit = 10, isActive = true) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      isActive: isActive.toString(),
    });
    
    return this.makeRequest(`/form-configurations?${params}`);
  }

  async getFormConfiguration(id: string) {
    return this.makeRequest(`/form-configurations/${id}`);
  }

  async updateFormConfiguration(id: string, formData: any) {
    return this.makeRequest(`/form-configurations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
  }

  async deleteFormConfiguration(id: string) {
    return this.makeRequest(`/form-configurations/${id}`, {
      method: 'DELETE',
    });
  }

  // Form Submission Methods
  async submitFormData(formConfigurationId: string, submissionData: any, submittedBy = 'anonymous') {
    return this.makeRequest('/form-submissions', {
      method: 'POST',
      body: JSON.stringify({
        formConfigurationId,
        submissionData,
        submittedBy,
        metadata: {
          submissionTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          source: 'form-builder-frontend',
        },
      }),
    });
  }

  async getFormSubmissions(formConfigurationId?: string, page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (formConfigurationId) {
      return this.makeRequest(`/form-submissions/form/${formConfigurationId}?${params}`);
    }

    return this.makeRequest(`/form-submissions?${params}`);
  }

  async getFormSubmission(id: string) {
    return this.makeRequest(`/form-submissions/${id}`);
  }

  async updateSubmissionStatus(id: string, status: 'submitted' | 'processed' | 'archived') {
    return this.makeRequest(`/form-submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteFormSubmission(id: string) {
    return this.makeRequest(`/form-submissions/${id}`, {
      method: 'DELETE',
    });
  }
}

export default FormBuilderAPI;
