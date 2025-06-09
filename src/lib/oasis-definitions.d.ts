type RecordStatus = number | string | null;

export type OASISAlertFormType = {
  status_id: number | null;
  msg_type_id: number | null;
  scope_id: number | null;
  identifier?: string | null;
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
  alert_id?: number | null;
  language_id: number | null;
  category_id: number | null;
  response_type: string | null;
  urgency_id: number | null;
  severity_id: number | null;
  certainty_id: number | null;
  audience: string | null;
  instruction: string | null;
  areas: Area[] | null;
  event: string | null;
  event_code: number | null;
  effective: string | null;
  onset: string | null;
  expires: string | null;
  sender_name: string | null;
  headline: string | null;
  description: string | null;
  web: string | null;
  contact: string | null;
  parameter: string | null;
  record_status?: RecordStatus;
};

export type Area = {
  info_id?: number | null;
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
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  restriction_text: string;
  description: string;
  record_status: number | null;
};

export type OASISStatus = {
  id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  code: string;
  description: string;
  record_status: number | null;
};

export type OASISStatus = {
  id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  code: string;
  description: string;
  record_status: number | null;
};

export type OASISNote = {
  id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  note_text: string;
  description: string;
  record_status: number | null;
};

export type OASISEventCode = {
  id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  value_name: string;
  value: string;
  description: string;
  record_status: number | null;
};

export type OASISAudience = {
  id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  audience_text: string;
  description: string;
  record_status: RecordStatus;
};

export type OASISParameter = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  info: string;
  created_at: string;
  updated_at: string;
  value_name: string;
  value: string;
};

export type OASISParameterReference = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  final_parameter: string;
  created_at: string;
  updated_at: string;
  param_name: string;
  param_value: string;
  description: string;
};

export type OASISInstruction = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  instruction_text: string;
  category: string;
  description: string;
};

export type OASISGeocode = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  area: string;
  geocode: string;
  created_at: string;
  updated_at: string;
};
export type OASISGeocodeRef = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  value_name: string;
  value: string;
  location_name: string;
  description: string;
  group: string;
  final_value: string;
};

export type OASISEventType = {
  id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  name: string;
  category: string;
  emoji: string;
  description: string;
  record_status: RecordStatus;
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
export type OASISResponseType = OASISStatus;
