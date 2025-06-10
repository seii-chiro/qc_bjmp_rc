import { PersonForm, WatchlistForm } from "@/pages/threat/AddWatchlist";
import { BASE_URL, BASE_URL_BIOMETRIC } from "./urls";
import { Person } from "./pdl-definitions";
import { BiometricRecordFace } from "./scanner-definitions";
import { PaginatedResponse } from "./queries";

export type WhiteListedRiskLevel = {
  id: number;
  created_by: string | null;
  updated_by: string | null;
  record_status: string; // Consider defining possible statuses
  created_at: string | null; // Can be Date if needed
  updated_at: string | null;
  risk_severity: string; // Enum for controlled values
  risk_value: number;
  description: string;
};

export type WhiteListedThreatLevel = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  threat_level: string;
  description: string;
};

export type WhiteListedType = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  created_at: string; // Consider using Date if handling timestamps as objects
  updated_at: string;
  name: string;
  description: string;
};

export type WatchlistPerson = {
  id: number;
  created_by: string;
  updated_by: string;
  record_status: string;
  person: string;
  white_listed_type: string;
  risk_level: string;
  threat_level: string;
  created_at: string; // Consider Date if needed
  updated_at: string;
  risks: string;
  threats: string;
  mitigation: string;
  remarks: string;
};

export async function getWhiteListedRiskLevels(
  token: string
): Promise<PaginatedResponse<WhiteListedRiskLevel>> {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/risk-levels/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch risk levels.");
  }

  return res.json();
}

export async function getWhiteListedThreatLevels(
  token: string
): Promise<PaginatedResponse<WhiteListedThreatLevel>> {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/threat-levels/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch threat levels.");
  }

  return res.json();
}

export async function getWhiteListedTypes(
  token: string
): Promise<PaginatedResponse<WhiteListedType>> {
  const res = await fetch(
    `${BASE_URL}/api/whitelists/whitelisted-types/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch whitelisted types.");
  }

  return res.json();
}

export async function postPerson(
  token: string,
  payload: PersonForm
): Promise<Person> {
  const res = await fetch(`${BASE_URL}/api/standards/persons/`, {
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

export async function postWatchlistPerson(
  token: string,
  payload: WatchlistForm
): Promise<WatchlistPerson> {
  const res = await fetch(`${BASE_URL}/api/whitelists/whitelisted-persons/`, {
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

export const enrollBiometrics = async (
  enrollForm: BiometricRecordFace
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const response = await fetch(
    `${BASE_URL_BIOMETRIC}/api/biometric/whitelist-biometric/enroll/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrollForm),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};

export const verifyFaceInWatchlist = async (verificationPayload: {
  template: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL_BIOMETRIC}/api/biometric/whitelist-biometric/identify/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.json();
      if (response.status === 400 || response.status === 404) {
        throw new Error("No Matches Found");
      } else {
        throw new Error(`${errorText?.message}`);
      }
    }

    return await response.json();
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Unknown error occurred"
    );
  }
};
