type RecordStatus = number | string | null;

export type OASISAlertFormType = {
  status_id: number | null;
  msg_type_id: number | null;
  scope_id: number | null;
  identifier: string | null;
  sender: string | null;
  sent: string | null;
  source: string | null;
  restriction: string | null;
  addresses: string | null;
  code: string | null;
  note: string | null;
  references: string | null;
  incidents: string | null;
  infos: Info[] | null;
  record_status?: RecordStatus;
};

export type Info = {
  alert_id: number | null;
  language_id: number | null;
  category_id: number | null;
  response_type_id: number | null;
  urgency_id: number | null;
  severity_id: number | null;
  certainty_id: number | null;
  audience_id: number | null;
  instruction_id: number | null;
  areas: Area[] | null;
  event: string | null;
  event_code: string | null;
  effective: string | null;
  onset: string | null;
  expires: string | null;
  sender_name: string | null;
  headline: string | null;
  description: string | null;
  web: string | null;
  contact: string | null;
  record_status?: RecordStatus;
};

export type Area = {
  info_id: number | null;
  area_desc: string | null;
  polygon: string | null;
  circle: string | null;
  geocode: string | null;
  altitude: string | null;
  ceiling: string | null;
  record_status?: RecordStatus;
};

export type OASISRestrictions = {
  id: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  restriction_text: string;
  description: string;
  record_status: number | null;
};

export type OASISStatus = {
  id: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  code: string;
  description: string;
  record_status: number | null;
};

export type OASISStatus = {
  id: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  code: string;
  description: string;
  record_status: number | null;
};

export type OASISNote = {
  id: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  note_text: string;
  description: string;
  record_status: number | null;
};

export type OASISEventCode = {
  id: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  value_name: string;
  value: string;
  description: string;
  record_status: number | null;
};

export type OASISLanguage = OASISStatus & {
    name: string;
};

export type OASISMessageType = OASISStatus;
export type OASISCode = OASISStatus;
export type OASISUrgency = OASISStatus;
export type OASISSeverity = OASISStatus;
export type OASISScope = OASISStatus;
export type OASISResponseType = OASISStatus;
export type OASISCertainty = OASISStatus;
export type OASISCategory = OASISStatus;
