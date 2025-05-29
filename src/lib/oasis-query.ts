import {
  OASISCategory,
  OASISCertainty,
  OASISCode,
  OASISEventCode,
  OASISLanguage,
  OASISMessageType,
  OASISNote,
  OASISRestrictions,
  OASISScope,
  OASISSeverity,
  OASISStatus,
  OASISUrgency,
} from "./oasis-definitions";
import { PaginatedResponse } from "./queries";
import { BASE_URL } from "./urls";

export async function getOASISRestrictions(
  token: string
): Promise<PaginatedResponse<OASISRestrictions>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-restriction/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Restrictions.");
  }

  return res.json();
}

export async function getOASISStatus(
  token: string
): Promise<PaginatedResponse<OASISStatus>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-status/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Status.");
  }

  return res.json();
}

export async function getOASISMessageTypes(
  token: string
): Promise<PaginatedResponse<OASISMessageType>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-msg-type/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Message Types.");
  }

  return res.json();
}

export async function getOASISCodes(
  token: string
): Promise<PaginatedResponse<OASISCode>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-code/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Codes.");
  }

  return res.json();
}

export async function getOASISNotes(
  token: string
): Promise<PaginatedResponse<OASISNote>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-note/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Notes.");
  }

  return res.json();
}

export async function getOASISEventCodes(
  token: string
): Promise<PaginatedResponse<OASISEventCode>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-event-code/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Events.");
  }

  return res.json();
}

export async function getOASISCertainty(
  token: string
): Promise<PaginatedResponse<OASISCertainty>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-certainty/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Certainties.");
  }

  return res.json();
}

export async function getOASISUrgency(
  token: string
): Promise<PaginatedResponse<OASISUrgency>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-urgency/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Urgencies.");
  }

  return res.json();
}

export async function getOASISSeverity(
  token: string
): Promise<PaginatedResponse<OASISSeverity>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-severity/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Severities.");
  }

  return res.json();
}

export async function getOASISCategories(
  token: string
): Promise<PaginatedResponse<OASISCategory>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-category/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Categories.");
  }

  return res.json();
}

export async function getOASISLanguages(
  token: string
): Promise<PaginatedResponse<OASISLanguage>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-language/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Languages.");
  }

  return res.json();
}

export async function getOASISScopes(
  token: string
): Promise<PaginatedResponse<OASISScope>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-scope/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Scopes.");
  }

  return res.json();
}
