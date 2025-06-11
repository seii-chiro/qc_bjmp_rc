export type WatchlistType = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
};

export type WatchlistRiskLevel = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  risk_severity: string;
  risk_value: number | null;
  description: string;
};

export type WatchlistThreatLevel = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  threat_level: string;
  description: string;
};
