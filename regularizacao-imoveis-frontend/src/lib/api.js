// Utilitário para comunicação com a API backend

const API_BASE_URL = 'http://localhost:5001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Para incluir cookies de sessão
      ...options,
    };

    // Se há dados no body e não é FormData, converter para JSON
    if (config.body && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    // Se é FormData, remover Content-Type para deixar o browser definir
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Se a resposta não é ok, tentar extrair erro
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Se não conseguir parsear JSON, usar status
        }
        throw new Error(errorMessage);
      }

      // Se não há conteúdo, retornar null
      if (response.status === 204) {
        return null;
      }

      // Tentar parsear JSON
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos de conveniência
  get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload de arquivo
  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

// Instância singleton
const api = new ApiClient();

// Serviços específicos da API
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const usersService = {
  getUsers: (params) => api.get('/users', params),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getRoles: () => api.get('/users/roles'),
};

export const propertiesService = {
  getProperties: (params) => api.get('/properties', params),
  getProperty: (id, params) => api.get(`/properties/${id}`, params),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  getStatusOptions: () => api.get('/properties/status-options'),
  getNeighborhoods: () => api.get('/properties/neighborhoods'),
  getPropertyProgress: (id) => api.get(`/properties/${id}/progress`),
};

export const stepsService = {
  getSteps: (params) => api.get('/steps', params),
  getStep: (id) => api.get(`/steps/${id}`),
  createStep: (data) => api.post('/steps', data),
  updateStep: (id, data) => api.put(`/steps/${id}`, data),
  deleteStep: (id) => api.delete(`/steps/${id}`),
  reorderSteps: (data) => api.post('/steps/reorder', data),
};

export const stepRecordsService = {
  getStepRecords: (params) => api.get('/step-records', params),
  getStepRecord: (id) => api.get(`/step-records/${id}`),
  updateStepRecord: (id, data) => api.put(`/step-records/${id}`, data),
  getPropertyStepRecords: (propertyId) => api.get(`/step-records/property/${propertyId}`),
  getStatusOptions: () => api.get('/step-records/status-options'),
  getOverdueRecords: () => api.get('/step-records/overdue'),
  getStatistics: () => api.get('/step-records/statistics'),
};

export const documentsService = {
  getDocuments: (params) => api.get('/documents', params),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) => api.upload('/documents/upload', formData),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  downloadDocument: (id) => {
    // Para download, usar window.open ou criar link
    window.open(`${API_BASE_URL}/documents/${id}/download`, '_blank');
  },
  getStepRecordDocuments: (stepRecordId) => api.get(`/documents/step-record/${stepRecordId}`),
  getDocumentTypes: () => api.get('/documents/types'),
  getStatistics: () => api.get('/documents/statistics'),
};

export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getPropertiesByStatus: () => api.get('/dashboard/properties-by-status'),
  getPropertiesByNeighborhood: () => api.get('/dashboard/properties-by-neighborhood'),
  getStepsProgress: () => api.get('/dashboard/steps-progress'),
  getMonthlyProgress: () => api.get('/dashboard/monthly-progress'),
  getOverdueSteps: () => api.get('/dashboard/overdue-steps'),
  getRecentActivities: (params) => api.get('/dashboard/recent-activities', params),
  getPerformanceMetrics: () => api.get('/dashboard/performance-metrics'),
};

export default api;

