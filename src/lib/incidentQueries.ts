/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Incident,
  IncidentFormType,
  IncidentStatus,
  IncidentType,
  SeverityLevel,
} from "./incidents";
import { PaginatedResponse } from "./queries";
import { BASE_URL } from "./urls";

export async function getIncidents(
  token: string
): Promise<PaginatedResponse<Incident>> {
  const res = await fetch(`${BASE_URL}/api/incidents/incidents/?limit=1000`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Incidents.");
  }

  return res.json();
}

export async function getIncidentTypes(
  token: string
): Promise<PaginatedResponse<IncidentType>> {
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

export async function getIncidentStatus(
  token: string
): Promise<PaginatedResponse<IncidentStatus>> {
  const res = await fetch(`${BASE_URL}/api/incidents/incident-statuses/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Incidents Status.");
  }

  return res.json();
}

export async function getSeverityLevels(
  token: string
): Promise<PaginatedResponse<SeverityLevel>> {
  const res = await fetch(`${BASE_URL}/api/incidents/incident-severities/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Incident Severity Levels.");
  }

  return res.json();
}

export async function addIncidentReport(
  token: string,
  payload: IncidentFormType
): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/incidents/incidents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to send an incident report.");
  }

  return res.json();
}

export async function patchIncident(token: string, id: number, payload: any) {
  const res = await fetch(`${BASE_URL}/api/incidents/incidents/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update incident.");
  return res.json();
}
