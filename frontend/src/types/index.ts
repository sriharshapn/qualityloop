export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'Action Required' | 'Resolved';
export type ActionOutcome = 'Pending verification' | 'Successful' | 'Partially successful' | 'Unsuccessful';
export type ActionStatus = 'Proposed' | 'Accepted' | 'In Progress' | 'Completed' | 'Rejected';

export interface Incident {
  id: string;
  title: string;
  product_name: string;
  product_id: string;
  batch_number: string;
  defect_category: string;
  severity: SeverityLevel;
  description: string;
  production_stage: string;
  machine?: string | null;
  supplier?: string | null;
  quantity_affected: number;
  status: IncidentStatus;
  image_url?: string | null;
  created_at: string;
}

export interface HistoricalMemory {
  id: string;
  original_incident_id?: string;
  previous_defect: string;
  verified_root_cause?: string;
  corrective_action: string;
  recorded_outcome: string;
  relevance_reason: string;
  source: string;
  confidence?: number;
}

export interface RecommendationItem {
  id: string;
  action: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  target_stage?: string;
  expected_impact: string;
  grounded_in_memory: boolean;
}

export interface Investigation {
  id: string;
  incident_id: string;
  summary: string;
  possible_root_causes: string[];
  recommendations: RecommendationItem[];
  evidence: string[];
  recalled_memories: HistoricalMemory[];
  confidence_level: 'Low' | 'Medium' | 'High';
  created_at: string;
}

export interface CorrectiveAction {
  id: string;
  incident_id: string;
  action_description: string;
  status: ActionStatus;
  outcome: ActionOutcome;
  feedback?: string | null;
  verified_root_cause?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface MemoryEvent {
  id: string;
  incident_id?: string;
  event_type: 'RETAIN' | 'RECALL' | 'REFLECT' | 'BANK_INIT';
  operation_status: 'SUCCESS' | 'FAILED' | 'WARNING';
  query_or_content: string;
  response_summary: string;
  latency_ms: number;
  created_at: string;
}

export interface DashboardStats {
  total_incidents: number;
  open_incidents: number;
  resolved_incidents: number;
  recurring_defects: number;
  retained_experiences: number;
  categories: { name: string; count: number }[];
  recent_incidents: Incident[];
  recent_memory_events: MemoryEvent[];
  stage_trends: { stage: string; count: number; high_severity: number }[];
}

export interface SettingsConfig {
  hindsight_bank_id: string;
  hindsight_connected: boolean;
  gemini_connected: boolean;
  gemini_model?: string;
  memory_status: string;
  engine_mode: string;
  storage_engine: string;
}
