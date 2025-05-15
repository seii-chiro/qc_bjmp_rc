export type IncidentFormType = {
  severity_id: number | null;
  type_id: number | null;
  status_id: number | null;
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
