export type AssetStatus =
  | 'Operational'
  | 'Issue Reported'
  | 'Under Inspection'
  | 'Under Maintenance'
  | 'Out of Service'
  | 'Retired';

export type IssueStatus =
  | 'Reported'
  | 'Assigned'
  | 'Inspection Started'
  | 'Maintenance In Progress'
  | 'Waiting for Parts'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Role = 'admin' | 'technician';

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  condition: string;
  status: AssetStatus;
  last_service_date: string | null;
  next_service_date: string | null;
  assigned_technician: string | null;
  created_at: string;
}

export interface Issue {
  id: string;
  issue_number: string;
  asset_id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: IssueStatus;
  reporter_name: string;
  reporter_contact: string | null;
  assigned_technician: string | null;
  ai_suggested_title: boolean;
  ai_suggested_category: boolean;
  ai_suggested_priority: boolean;
  ai_possible_causes: string[];
  ai_initial_checks: string[];
  evidence_url: string | null;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  issue_id: string;
  technician: string;
  notes: string;
  parts_used: string;
  cost: number;
  time_spent_minutes: number;
  final_condition: string;
  evidence_url: string | null;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  asset_id: string;
  issue_id: string | null;
  actor: string;
  action: string;
  created_at: string;
}

export interface AITriageResult {
  title: string;
  category: string;
  priority: Priority;
  possible_causes: string[];
  initial_checks: string[];
  recurring_pattern_warning: string | null;
}
