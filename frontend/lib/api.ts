/**
 * API Client for GearGuard Backend
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api';

// Token management
const TOKEN_KEY = 'gearguard_token';
const USER_KEY = 'gearguard_user';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_technician: boolean;
  avatar_url?: string | null;
  department?: string | null;
  job_title?: string | null;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiError {
  detail: string;
}

// API error handling
class ApiException extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiException';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new ApiException(errorMessage, response.status);
  }
  
  return response.json();
}

// Auth API
export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.access_token);
    setStoredUser(response.user);
    return response;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.access_token);
    setStoredUser(response.user);
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
    }
  },

  getMe: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },
};

// Users API
export const usersApi = {
  list: async (params?: { skip?: number; limit?: number; is_technician?: boolean; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.is_technician !== undefined) searchParams.set('is_technician', params.is_technician.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    return apiRequest(`/users${query ? `?${query}` : ''}`);
  },

  getTechnicians: async () => {
    return apiRequest('/users/technicians');
  },

  get: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },
};

// Equipment API
export const equipmentApi = {
  list: async (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    return apiRequest(`/equipment${query ? `?${query}` : ''}`);
  },

  get: async (id: string) => {
    return apiRequest(`/equipment/${id}`);
  },

  create: async (data: Record<string, unknown>) => {
    return apiRequest('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Record<string, unknown>) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'DELETE',
    });
  },
};

// Teams API
export const teamsApi = {
  list: async () => {
    return apiRequest('/teams');
  },

  get: async (id: string) => {
    return apiRequest(`/teams/${id}`);
  },

  create: async (data: Record<string, unknown>) => {
    return apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Maintenance Requests API
export const requestsApi = {
  list: async (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    return apiRequest(`/requests${query ? `?${query}` : ''}`);
  },

  get: async (id: string) => {
    return apiRequest(`/requests/${id}`);
  },

  create: async (data: Record<string, unknown>) => {
    return apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStage: async (id: string, stage: string) => {
    return apiRequest(`/requests/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getKpis: async () => {
    return apiRequest('/dashboard/kpis');
  },

  getRecentRequests: async () => {
    return apiRequest('/dashboard/recent-requests');
  },
};

export { ApiException };
