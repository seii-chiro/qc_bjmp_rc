import { BASE_URL } from "./urls";

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

export async function getIncidentTypes(token: string): Promise<IncidentType[]> {
  const res = await fetch(`${BASE_URL}/api/incidents/incident-types/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Incidents Types.");
  }

  return res.json();
}
