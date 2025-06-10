import { StatusFormType } from "@/pages/oasis/maintenance/forms/StatusForm";
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
import { AudienceFormType } from "@/pages/oasis/maintenance/forms/AudienceForm";
import { CategoryFormType } from "@/pages/oasis/maintenance/forms/CategoriesForm";
import { CertaintyFormType } from "@/pages/oasis/maintenance/forms/CertaintyForm";
import { CodeFormType } from "@/pages/oasis/maintenance/forms/CodeForm";
import { MessageTypeFormType } from "@/pages/oasis/maintenance/forms/MessageTypeForm";
import { ScopeFormType } from "@/pages/oasis/maintenance/forms/ScopeForm";
import { RestrictionFormType } from "@/pages/oasis/maintenance/forms/RestrictionForm";
import { NoteFormType } from "@/pages/oasis/maintenance/forms/NoteForm";
import { LanguageFormType } from "@/pages/oasis/maintenance/forms/LanguageForm";
import { EventCodeFormType } from "@/pages/oasis/maintenance/forms/EventCodeForm";
import { InstructionFormType } from "@/pages/oasis/maintenance/forms/InstructionForm";
import { ParameterReferenceFormType } from "@/pages/oasis/maintenance/forms/ParameterForm";
import { GeocodeFormType } from "@/pages/oasis/maintenance/forms/GeocodeForm";
import { EventFormType } from "@/pages/oasis/maintenance/forms/EventForm";

export async function getOASISRestrictions(
  token: string
): Promise<PaginatedResponse<OASISRestrictions>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-restriction/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Restrictions.");
  }

  return res.json();
}

export async function postOASISRestriction(
  token: string,
  payload: RestrictionFormType
): Promise<OASISRestrictions> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-restriction/`, {
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

export async function patchOASISRestriction(
  token: string,
  id: number,
  payload: Partial<RestrictionFormType>
): Promise<OASISRestrictions> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-restriction/${id}/`,
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

export async function deleteOASISRestriction(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-restriction/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete restriction.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISStatus(
  token: string
): Promise<PaginatedResponse<OASISStatus>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-status/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Status.");
  }

  return res.json();
}

export async function postOASISStatus(
  token: string,
  payload: StatusFormType
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-status/`, {
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

export async function patchOASISStatus(
  token: string,
  id: number,
  payload: Partial<StatusFormType>
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-status/${id}/`, {
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

export async function deleteOASISStatus(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-status/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete Status.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISMessageTypes(
  token: string
): Promise<PaginatedResponse<OASISMessageType>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-msg-type/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Message Types.");
  }

  return res.json();
}

export async function postOASISMessageType(
  token: string,
  payload: MessageTypeFormType
): Promise<OASISAudience> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-msg-type/`, {
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

export async function patchOASISMessageType(
  token: string,
  id: number,
  payload: Partial<MessageTypeFormType>
): Promise<OASISAudience> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-msg-type/${id}/`,
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

export async function deleteOASISMessageType(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-msg-type/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete message type.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISCodes(
  token: string
): Promise<PaginatedResponse<OASISCode>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-code/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Codes.");
  }

  return res.json();
}

export async function postOASISCode(
  token: string,
  payload: CodeFormType
): Promise<OASISAudience> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-code/`, {
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

export async function patchOASISCode(
  token: string,
  id: number,
  payload: Partial<CodeFormType>
): Promise<OASISAudience> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-code/${id}/`, {
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

export async function deleteOASISCode(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-code/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete code.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISNotes(
  token: string
): Promise<PaginatedResponse<OASISNote>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-note/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Notes.");
  }

  return res.json();
}

export async function postOASISNote(
  token: string,
  payload: NoteFormType
): Promise<OASISNote> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-note/`, {
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

export async function patchOASISNote(
  token: string,
  id: number,
  payload: Partial<NoteFormType>
): Promise<OASISNote> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-note/${id}/`, {
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

export async function deleteOASISNote(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-note/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete note.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISEventCodes(
  token: string
): Promise<PaginatedResponse<OASISEventCode>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-event-code/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Events.");
  }

  return res.json();
}

export async function postOASISEventCode(
  token: string,
  payload: EventCodeFormType
): Promise<OASISEventCode> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-event-code/`, {
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

export async function patchOASISEventCode(
  token: string,
  id: number,
  payload: Partial<EventCodeFormType>
): Promise<OASISEventCode> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-event-code/${id}/`,
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

export async function deleteOASISEventCode(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-event-code/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete event code.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISCertainty(
  token: string
): Promise<PaginatedResponse<OASISCertainty>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-certainty/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Certainties.");
  }

  return res.json();
}

export async function postOASISCertainty(
  token: string,
  payload: CertaintyFormType
): Promise<OASISAudience> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-certainty/`, {
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

export async function patchOASISCertainty(
  token: string,
  id: number,
  payload: Partial<CertaintyFormType>
): Promise<OASISAudience> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-certainty/${id}/`,
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

export async function deleteOASISCertainty(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-certainty/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete certainty.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISUrgency(
  token: string
): Promise<PaginatedResponse<OASISUrgency>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-urgency/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Urgencies.");
  }

  return res.json();
}

export async function postOASISUrgency(
  token: string,
  payload: StatusFormType
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-urgency/`, {
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

export async function patchOASISUrgency(
  token: string,
  id: number,
  payload: Partial<StatusFormType>
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-urgency/${id}/`, {
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

export async function deleteOASISUrgency(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-urgency/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete urgency.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISSeverity(
  token: string
): Promise<PaginatedResponse<OASISSeverity>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-severity/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Severities.");
  }

  return res.json();
}

export async function postOASISSeverity(
  token: string,
  payload: StatusFormType
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-severity/`, {
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

export async function patchOASISSeverity(
  token: string,
  id: number,
  payload: Partial<StatusFormType>
): Promise<OASISStatus> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-severity/${id}/`,
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

export async function deleteOASISSeverity(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-severity/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete severity.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISCategories(
  token: string
): Promise<PaginatedResponse<OASISCategory>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-category/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Categories.");
  }

  return res.json();
}

export async function postOASISCategories(
  token: string,
  payload: CategoryFormType
): Promise<OASISAudience> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-category/`, {
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

export async function patchOASISCategories(
  token: string,
  id: number,
  payload: Partial<CategoryFormType>
): Promise<OASISAudience> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-category/${id}/`,
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

export async function deleteOASISCategories(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-category/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete Category.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISLanguages(
  token: string
): Promise<PaginatedResponse<OASISLanguage>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-language/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Languages.");
  }

  return res.json();
}

export async function postOASISLanguage(
  token: string,
  payload: LanguageFormType
): Promise<OASISLanguage> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-language/`, {
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

export async function patchOASISLanguage(
  token: string,
  id: number,
  payload: Partial<LanguageFormType>
): Promise<OASISLanguage> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-language/${id}/`,
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

export async function deleteOASISLanguage(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-language/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete language.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISScopes(
  token: string
): Promise<PaginatedResponse<OASISScope>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-scope/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Scopes.");
  }

  return res.json();
}

export async function postOASISScopes(
  token: string,
  payload: ScopeFormType
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-scope/`, {
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

export async function patchOASISScopes(
  token: string,
  id: number,
  payload: Partial<ScopeFormType>
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-scope/${id}/`, {
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

export async function deleteOASISScopes(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-scope/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete Scope.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISResponseTypes(
  token: string
): Promise<PaginatedResponse<OASISResponseType>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-response-type/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Response Types.");
  }

  return res.json();
}

export async function postOASISResponseTypes(
  token: string,
  payload: StatusFormType
): Promise<OASISStatus> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-response-type/`, {
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

export async function patchOASISResponseTypes(
  token: string,
  id: number,
  payload: Partial<StatusFormType>
): Promise<OASISStatus> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-response-type/${id}/`,
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

export async function deleteOASISResponseTypes(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-response-type/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete Status.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISAudience(
  token: string
): Promise<PaginatedResponse<OASISAudience>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-audience/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch audience.");
  }

  return res.json();
}

export async function postOASISAudience(
  token: string,
  payload: AudienceFormType
): Promise<OASISAudience> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-audience/`, {
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

export async function patchOASISAudience(
  token: string,
  id: number,
  payload: Partial<AudienceFormType>
): Promise<OASISAudience> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-audience/${id}/`,
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

export async function deleteOASISAudience(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-audience/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete Audience.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISParameter(
  token: string
): Promise<PaginatedResponse<OASISParameter>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/parameter/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch parameters.");
  }

  return res.json();
}

export async function getOASISParameterReference(
  token: string
): Promise<PaginatedResponse<OASISParameterReference>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-parameter-reference/?limit=10000`,
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

export async function postOASISParameterReference(
  token: string,
  payload: ParameterReferenceFormType
): Promise<OASISParameterReference> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-parameter-reference/`,
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

export async function patchOASISParameterReference(
  token: string,
  id: number,
  payload: Partial<ParameterReferenceFormType>
): Promise<OASISParameterReference> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-parameter-reference/${id}/`,
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

export async function deleteOASISParameterReference(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-parameter-reference/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete parameter reference.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISInstructions(
  token: string
): Promise<PaginatedResponse<OASISInstruction>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-instruction/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch instructions.");
  }

  return res.json();
}

export async function postOASISInstruction(
  token: string,
  payload: InstructionFormType
): Promise<OASISInstruction> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/cap-instruction/`, {
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

export async function patchOASISInstruction(
  token: string,
  id: number,
  payload: Partial<InstructionFormType>
): Promise<OASISInstruction> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-instruction/${id}/`,
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

export async function deleteOASISInstruction(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-instruction/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete instruction.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISGeocodeRefs(
  token: string
): Promise<PaginatedResponse<OASISGeocodeRef>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-geocode-reference/?limit=10000`,
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

export async function postOASISGeocodeRef(
  token: string,
  payload: GeocodeFormType
): Promise<OASISGeocodeRef> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-geocode-reference/`,
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

export async function patchOASISGeocodeRef(
  token: string,
  id: number,
  payload: Partial<GeocodeFormType>
): Promise<OASISGeocodeRef> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-geocode-reference/${id}/`,
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

export async function deleteOASISGeocodeRef(token: string, id: number) {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/cap-geocode-reference/${id}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete geocode reference.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISEventTypes(
  token: string
): Promise<PaginatedResponse<OASISEventType>> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/event-type/?limit=10000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Event Types.");
  }

  return res.json();
}

export async function postOASISEventType(
  token: string,
  payload: EventFormType
): Promise<OASISEventType> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/event-type/`, {
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

export async function patchOASISEventType(
  token: string,
  id: number,
  payload: Partial<EventFormType>
): Promise<OASISEventType> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/event-type/${id}/`, {
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

export async function deleteOASISEventType(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/event-type/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete event type.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getOASISAlerts(
  token: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<OASISAlert>> {
  const offset = (page - 1) * pageSize;
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/alert/?limit=${pageSize}&offset=${offset}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
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

export async function patchOASISAlert(
  token: string,
  id: number,
  payload: Partial<OASISAlertFormType>
): Promise<OASISAlert> {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/alert/${id}/`, {
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

export async function deleteOASISAlert(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/oasis_app_v1_2/alert/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete alert.");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
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

export async function getOASISAlertNotification(
  token: string,
  params: { limit?: number; offset?: number } = {}
): Promise<PaginatedResponse<OASISAlertNotification>> {
  const { limit = 10, offset = 0 } = params;

  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/user-alert-notification/?limit=${limit}&offset=${offset}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch OASIS Alert Notifications.");
  }

  return res.json();
}

export async function updateOASISAlertNotifStatus(
  token: string,
  notif_id: number,
  payload: { status: "read" | "unread" }
): Promise<OASISAlertNotification> {
  const res = await fetch(
    `${BASE_URL}/api/oasis_app_v1_2/user-alert-notification/${notif_id}/`,
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
    throw new Error("Failed to update OASIS Alert Notification Status.");
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

export async function generateOASISAlertXMLII(
  token: string,
  url: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/${url}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch OASIS Alert XML.");
  }

  return res.text();
}
