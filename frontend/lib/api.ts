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
