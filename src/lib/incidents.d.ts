export type IncidentFormType = {
  severity_id: number | null;
  type_id: number | null;
  status_id?: number | null;
  incident_code: string;
  name: string;
  incident_details: string;
  longitude_incident: number | null;
  latitude_incident: number | null;
  address_incident: string;
  longitude_reported: number | null;
  latitude_reported: number | null;
  incident_image_base64: string;
  incident_image?: string;
  address_reported: string;
};

export type IncidentType = {
  id: number;
  created_by: string;
  updated_by: string;
  category: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
};

export type SeverityLevel = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
};

export type Incident = {
  id: number;
  created_by: string;
  updated_by: string;
  user_assigned_to: string;
  user: string;
  severity: string;
  type: string;
  status: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  incident_code: string;
  name: string;
  incident_details: string;
  longitude_incident: number;
  latitude_incident: number;
  address_incident: string;
  longitude_reported: number;
  latitude_reported: number;
  incident_image_base64: string;
  incident_image: string;
  address_reported: string;
};

export type IncidentStatus = {
  id: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  record_status: number;
};
