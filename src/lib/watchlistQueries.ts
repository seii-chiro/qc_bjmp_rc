import { WatchlistTypeFormType } from "@/pages/threat/forms/WatchlistTypeForm";
import { PaginatedResponse } from "./queries";
import { BASE_URL } from "./urls";
import {
  WatchlistRiskLevel,
  WatchlistThreatLevel,
  WatchlistType,
} from "./watchlist-definitions";
import { WatchlistRiskLevelFormType } from "@/pages/threat/forms/WatchlistRiskLevelForm";
import { WatchlistThreatLevelFormType } from "@/pages/threat/forms/WatchlistThreatLevelForm";

export async function getWatchlistTypes(
  token: string
): Promise<PaginatedResponse<WatchlistType>> {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/whitelisted-types/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Watchlist Types.");
  }

  return res.json();
}

export async function postWatchlistType(
  token: string,
  payload: WatchlistTypeFormType
): Promise<WatchlistType> {
  const res = await fetch(`${BASE_URL}/api/whitelists/whitelisted-types/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export async function patchWatchlistType(
  token: string,
  id: number,
  payload: Partial<WatchlistTypeFormType>
): Promise<WatchlistType> {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/whitelisted-types/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export async function deleteWatchlistType(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/whitelisted-types/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete watchlist type.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getWatchlistRiskLevel(
  token: string
): Promise<PaginatedResponse<WatchlistRiskLevel>> {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/risk-levels/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Watchlist Risk Level.");
  }

  return res.json();
}

export async function postWatchlistRiskLevel(
  token: string,
  payload: WatchlistRiskLevelFormType
): Promise<WatchlistRiskLevel> {
  const res = await fetch(`${BASE_URL}/api/whitelists/risk-levels/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export async function patchWatchlistRiskLevel(
  token: string,
  id: number,
  payload: Partial<WatchlistRiskLevelFormType>
): Promise<WatchlistRiskLevel> {
  const res = await fetch(`${BASE_URL}/api/whitelists/risk-levels/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export async function deleteWatchlistRiskLevel(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/whitelists/risk-levels/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete watchlist risk level.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getWatchlistThreatLevel(
  token: string
): Promise<PaginatedResponse<WatchlistThreatLevel>> {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/threat-levels/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Watchlist Threat Level.");
  }

  return res.json();
}

export async function postWatchlistThreatLevel(
  token: string,
  payload: WatchlistThreatLevelFormType
): Promise<WatchlistThreatLevel> {
  const res = await fetch(`${BASE_URL}/api/whitelists/threat-levels/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export async function patchWatchlistThreatLevel(
  token: string,
  id: number,
  payload: Partial<WatchlistThreatLevelFormType>
): Promise<WatchlistThreatLevel> {
  const res = await fetch(`${BASE_URL}/api/whitelists/threat-levels/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export async function deleteWatchlistThreatLevel(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/whitelists/threat-levels/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete watchlist threat level.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function patchWatchlistPerson(
  token: string,
  id: number,
  payload: Partial<{
    person_id: number | null;
    white_listed_type_id: number | null;
    risk_level_id: number | null;
    threat_level_id: number | null;
    risks: string;
    threats: string;
    mitigation: string;
    remarks: string;
  }>
) {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/whitelisted-persons/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

// PATCH a person record
export async function patchPerson(
  token: string,
  id: number,
  payload: Partial<{
    gender_id: number | null;
    nationality_id: number | null;
    civil_status_id: number | null;
    first_name: string;
    last_name: string;
    middle_name: string;
  }>
) {
  const res = await fetch(`${BASE_URL}/api/standards/persons/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}
