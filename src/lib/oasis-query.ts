import {
  OASISAlertFormType,
  OASISAudience,
  OASISCategory,
  OASISCertainty,
  OASISCode,
  OASISEventCode,
  OASISEventType,
  OASISGeocodeRef,
  OASISInstruction,
  OASISLanguage,
  OASISMessageType,
  OASISNote,
  OASISParameter,
  OASISParameterReference,
  OASISResponseType,
  OASISRestrictions,
  OASISScope,
  OASISSeverity,
  OASISStatus,
  OASISUrgency,
} from "./oasis-definitions";
import {
  OASISAlert,
  OASISAlertNotification,
} from "./oasis-response-definition";
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

export async function getOASISResponseTypes(
  token: string
): Promise<PaginatedResponse<OASISResponseType>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-response-type/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Response Types.");
  }

  return res.json();
}

export async function getOASISAudience(
  token: string
): Promise<PaginatedResponse<OASISAudience>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-audience/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch audience.");
  }

  return res.json();
}

export async function getOASISParameter(
  token: string
): Promise<PaginatedResponse<OASISParameter>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/parameter/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch parameters.");
  }

  return res.json();
}

export async function getOASISParameterReference(
  token: string
): Promise<PaginatedResponse<OASISParameterReference>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-parameter-reference/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch parameter references.");
  }

  return res.json();
}

export async function getOASISInstructions(
  token: string
): Promise<PaginatedResponse<OASISInstruction>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-instruction/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch instructions.");
  }

  return res.json();
}

export async function getOASISGeocodeRefs(
  token: string
): Promise<PaginatedResponse<OASISGeocodeRef>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-geocode-reference/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Geocode References.");
  }

  return res.json();
}

export async function getOASISEventTypes(
  token: string
): Promise<PaginatedResponse<OASISEventType>> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/event-type/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Event Types.");
  }

  return res.json();
}

export async function postOASISAlert(
  token: string,
  payload: OASISAlertFormType
): Promise<OASISAlert> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/alert/`, {
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

export async function postOASISAlertNotification(
  token: string,
  payload: { alert_id: number }
): Promise<OASISAlertNotification> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/user-alert-notification/`,
    {
      method: "POST",
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

export async function generateOASISAlertXML(
  token: string,
  alert_id: number
): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/alert/${alert_id}/to-xml/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch OASIS Alert XML.");
  }

  return res.text();
}
