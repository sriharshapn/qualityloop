import {
  Incident,
  Investigation,
  CorrectiveAction,
  MemoryEvent,
  DashboardStats,
  SettingsConfig
} from '../types';

const API_BASE = '/api';

export const api = {
  // Dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/incidents/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Incidents
  getIncidents: async (filters?: {
    status?: string;
    category?: string;
    severity?: string;
    search?: string;
  }): Promise<Incident[]> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  getIncident: async (id: string): Promise<Incident> => {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch incident ${id}`);
    return res.json();
  },

  createIncident: async (data: Omit<Incident, 'id' | 'status' | 'created_at'>): Promise<Incident> => {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },

  // Investigations
  getInvestigation: async (incidentId: string): Promise<Investigation> => {
    const res = await fetch(`${API_BASE}/investigations/${incidentId}`);
    if (!res.ok) throw new Error(`Failed to fetch investigation for ${incidentId}`);
    return res.json();
  },

  runInvestigation: async (incidentId: string, forceRefresh = false): Promise<Investigation> => {
    const res = await fetch(`${API_BASE}/investigations/${incidentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force_refresh: forceRefresh })
    });
    if (!res.ok) throw new Error(`Failed to run investigation for ${incidentId}`);
    return res.json();
  },

  // Corrective Actions
  getActions: async (incidentId: string): Promise<CorrectiveAction[]> => {
    const res = await fetch(`${API_BASE}/actions/incident/${incidentId}`);
    if (!res.ok) throw new Error('Failed to fetch actions');
    return res.json();
  },

  updateAction: async (actionId: string, update: Partial<CorrectiveAction>): Promise<CorrectiveAction> => {
    const res = await fetch(`${API_BASE}/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update corrective action');
    return res.json();
  },

  // Memory
  getMemoryStatus: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/memory/status`);
    if (!res.ok) throw new Error('Failed to fetch memory status');
    return res.json();
  },

  getMemoryEvents: async (limit = 50, eventType?: string): Promise<MemoryEvent[]> => {
    const url = eventType ? `${API_BASE}/memory/events?limit=${limit}&event_type=${eventType}` : `${API_BASE}/memory/events?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch memory events');
    return res.json();
  },

  manualRecall: async (query: string) => {
    const res = await fetch(`${API_BASE}/memory/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return res.json();
  },

  manualReflect: async (query: string) => {
    const res = await fetch(`${API_BASE}/memory/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return res.json();
  },

  // Live Learning Demonstration
  resetDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    return res.json();
  },

  runBeforeDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/run-before`, { method: 'POST' });
    return res.json();
  },

  recordLearningDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/record-learning`, { method: 'POST' });
    return res.json();
  },

  runAfterDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/run-after`, { method: 'POST' });
    return res.json();
  },

  // Settings
  getSettings: async (): Promise<SettingsConfig> => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  updateSettings: async (data: { gemini_model?: string }): Promise<SettingsConfig> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  }
};
