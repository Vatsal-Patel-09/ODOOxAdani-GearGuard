const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Equipment {
    id: string;
    name: string;
    serial_number: string;
    category: string;
    department?: string;
    location?: string;
    status?: string;
    is_scrapped: boolean;
    purchase_date?: string;
    warranty_expiry?: string;
}

export interface MaintenanceTeam {
    id: string;
    name: string;
    description?: string;
    members?: User[];
    created_at?: string;
}

export interface MaintenanceRequest {
    id: string;
    subject: string;
    title?: string;
    description?: string;
    request_type: string;
    status: string;
    priority?: string;
    equipment_id?: string;
    equipment_name?: string;
    maintenance_team_id?: string;
    team_name?: string;
    scheduled_date?: string;
    created_at?: string;
}

export interface Stats {
    total_equipment: number;
    active_requests: number;
    total_teams: number;
    scheduled_today: number;
    requests_by_status: {
        new: number;
        in_progress: number;
        repaired: number;
        scrap: number;
    };
}

// Helper function to get auth token
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
        const parsed = JSON.parse(user);
        return parsed.access_token || null;
    } catch {
        return null;
    }
}

// Helper function to get auth headers
export function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Generic API fetch
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
            ...headers,
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'API request failed');
    }

    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

// Auth functions
export async function login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    return response.json();
}

export async function register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
}

// Equipment API
export async function getEquipment(): Promise<Equipment[]> {
    return apiFetch<Equipment[]>('/equipment');
}

export async function getEquipmentById(id: string): Promise<Equipment> {
    return apiFetch<Equipment>(`/equipment/${id}`);
}

export async function createEquipment(data: Partial<Equipment>): Promise<Equipment> {
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
    return apiFetch<void>(`/equipment/${id}`, {
        method: 'DELETE',
    });
}

export async function getEquipmentRequests(equipmentId: string): Promise<MaintenanceRequest[]> {
    return apiFetch<MaintenanceRequest[]>(`/equipment/${equipmentId}/requests`);
}

export async function getEquipmentRequestCount(equipmentId: string): Promise<number> {
    try {
        const requests = await getEquipmentRequests(equipmentId);
        return requests.length;
    } catch {
        return 0;
    }
}

// Teams API
export async function getTeams(): Promise<MaintenanceTeam[]> {
    return apiFetch<MaintenanceTeam[]>('/teams');
}

export async function getTeamById(id: string): Promise<MaintenanceTeam> {
    return apiFetch<MaintenanceTeam>(`/teams/${id}`);
}

export async function createTeam(data: Partial<MaintenanceTeam>): Promise<MaintenanceTeam> {
    return apiFetch<MaintenanceTeam>('/teams', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateTeam(id: string, data: Partial<MaintenanceTeam>): Promise<MaintenanceTeam> {
    return apiFetch<MaintenanceTeam>(`/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteTeam(id: string): Promise<void> {
    return apiFetch<void>(`/teams/${id}`, {
        method: 'DELETE',
    });
}

// Requests API
export async function getRequests(): Promise<MaintenanceRequest[]> {
    return apiFetch<MaintenanceRequest[]>('/requests');
}

export async function getRequestById(id: string): Promise<MaintenanceRequest> {
    return apiFetch<MaintenanceRequest>(`/requests/${id}`);
}

export async function createRequest(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
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

export async function deleteRequest(id: string): Promise<void> {
    return apiFetch<void>(`/requests/${id}`, {
        method: 'DELETE',
    });
}

// Stats API
export async function getStats(): Promise<Stats> {
    return apiFetch<Stats>('/stats');
}
