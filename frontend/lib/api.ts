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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  message: string;
}

export interface ApiError {
  detail: string;
}

export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  category: string;
  department: string | null;
  assigned_employee_id: string | null;
  maintenance_team_id: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  location: string | null;
  is_scrapped: boolean;
  created_at: string;
}

export interface MaintenanceTeam {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
}

export interface MaintenanceRequest {
  id: string;
  subject: string;
  description: string | null;
  request_type: string;
  status: string;
  equipment_id: string | null;
  maintenance_team_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_hours: number | null;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

// Helper function for API calls
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Auth
export async function register(
  name: string,
  email: string,
  password: string,
  role: string = 'user'
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Users
export async function getUsers(): Promise<User[]> {
  return apiFetch<User[]>('/users');
}

// Equipment
export async function getEquipments(filters?: {
  department?: string;
  category?: string;
  is_scrapped?: boolean;
}): Promise<Equipment[]> {
  const params = new URLSearchParams();
  if (filters?.department) params.set('department', filters.department);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.is_scrapped !== undefined) params.set('is_scrapped', String(filters.is_scrapped));

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Equipment[]>(`/equipment${query}`);
}

export async function getEquipment(id: string): Promise<Equipment> {
  return apiFetch<Equipment>(`/equipment/${id}`);
}

export async function createEquipment(data: Omit<Equipment, 'id' | 'is_scrapped' | 'created_at'>): Promise<Equipment> {
  return apiFetch<Equipment>('/equipment', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
  return apiFetch<Equipment>(`/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEquipment(id: string): Promise<void> {
  return apiFetch<void>(`/equipment/${id}`, { method: 'DELETE' });
}

export async function getEquipmentRequests(id: string): Promise<MaintenanceRequest[]> {
  return apiFetch<MaintenanceRequest[]>(`/equipment/${id}/requests`);
}

export async function getEquipmentRequestCount(id: string): Promise<{ equipment_id: string; open_request_count: number }> {
  return apiFetch(`/equipment/${id}/request-count`);
}

// Teams
export async function getTeams(): Promise<MaintenanceTeam[]> {
  return apiFetch<MaintenanceTeam[]>('/teams');
}

export async function getTeam(id: string): Promise<MaintenanceTeam & { members: TeamMember[] }> {
  return apiFetch(`/teams/${id}`);
}

export async function createTeam(data: { name: string; description?: string }): Promise<MaintenanceTeam> {
  return apiFetch<MaintenanceTeam>('/teams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTeam(id: string, data: { name?: string; description?: string }): Promise<MaintenanceTeam> {
  return apiFetch<MaintenanceTeam>(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTeam(id: string): Promise<void> {
  return apiFetch<void>(`/teams/${id}`, { method: 'DELETE' });
}

export async function addTeamMember(teamId: string, userId: string): Promise<TeamMember> {
  return apiFetch<TeamMember>(`/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  return apiFetch<void>(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return apiFetch<TeamMember[]>(`/teams/${teamId}/members`);
}

// Maintenance Requests
export async function getRequests(filters?: {
  status?: string;
  request_type?: string;
  team_id?: string;
  assigned_to?: string;
}): Promise<MaintenanceRequest[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status_filter', filters.status);
  if (filters?.request_type) params.set('request_type', filters.request_type);
  if (filters?.team_id) params.set('team_id', filters.team_id);
  if (filters?.assigned_to) params.set('assigned_to', filters.assigned_to);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<MaintenanceRequest[]>(`/requests${query}`);
}

export async function getRequest(id: string): Promise<MaintenanceRequest> {
  return apiFetch<MaintenanceRequest>(`/requests/${id}`);
}

export async function createRequest(data: {
  subject: string;
  description?: string;
  request_type: string;
  equipment_id?: string;
  scheduled_date?: string;
  created_by?: string;
}): Promise<MaintenanceRequest> {
  return apiFetch<MaintenanceRequest>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRequest(id: string, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
  return apiFetch<MaintenanceRequest>(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateRequestStatus(id: string, status: string): Promise<MaintenanceRequest> {
  return apiFetch<MaintenanceRequest>(`/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteRequest(id: string): Promise<void> {
  return apiFetch<void>(`/requests/${id}`, { method: 'DELETE' });
}

export async function getCalendarRequests(startDate?: string, endDate?: string): Promise<MaintenanceRequest[]> {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<MaintenanceRequest[]>(`/requests/calendar${query}`);
}
