import { IncidentFormType } from "@/pages/Incidents/incident-type/IncidentForm";
import {
  CourtBranch,
  CourtRecord,
  CrimeCategory,
  Ethnicities,
  GangAffiliation,
  IssueCategory,
  Law,
  Offense,
  PDLtoVisit,
  Precinct,
  UserAccounts,
  VisitorRecord,
} from "./definitions";
import {
  DeviceSettingPayload,
  EditDeviceSettingRecord,
  EditResponse,
  GlobalSettingsResponse,
  GroupAffiliationResponse,
  GroupRole,
  IncidentCategoryResponse,
  IncidentTypeResponse,
  MainGateLog,
  NonPDLVisitorPayload,
  OTPAccount,
  PersonFormPayload,
  PersonnelForm,
  Relationship,
  Role,
  ServiceProviderPayload,
  ThreatLevel,
  VisitLogForm,
  VisitorUpdatePayload,
  WatchlistPerson,
} from "./issues-difinitions";
import { PDLs } from "./pdl-definitions";
import { PaginatedResponse } from "./queries";
import { BASE_URL, BASE_URL_BIOMETRIC } from "./urls";
import { IncidentFormCategory } from "@/pages/Incidents/incident-category/AddIncidentCategory";
import { Permission } from "./spdefinitions";

export const deletePDL = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/pdls/pdl/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete PDL");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPDL = async (
  token: string,
  id: number,
  data: Partial<PDLs>
): Promise<PDLs> => {
  const url = `${BASE_URL}/api/pdls/pdl/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update PDL");
  return res.json();
};

export const deleteGangAffiliation = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/pdls/gang-affiliations/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Gang Affiliation");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchGangAffiliation = async (
  token: string,
  id: number,
  data: Partial<GangAffiliation>
): Promise<GangAffiliation> => {
  const url = `${BASE_URL}/api/pdls/gang-affiliations/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Gang Affiliation");
  return res.json();
};

export const patchCourtBranch = async (
  token: string,
  id: number,
  data: Partial<CourtBranch>
): Promise<CourtBranch> => {
  const url = `${BASE_URL}/api/standards/court-branch/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Court Branch");
  return res.json();
};

export const deletePrecincts = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/pdls/precinct/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Precincts");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPrecinct = async (
  token: string,
  id: number,
  data: Partial<Precinct>
): Promise<Precinct> => {
  const url = `${BASE_URL}/api/pdls/precinct/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Precincts");
  return res.json();
};

export const deleteOffense = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/standards/offense/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Offense");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchOffenses = async (
  token: string,
  id: number,
  data: Partial<Offense>
): Promise<Offense> => {
  const url = `${BASE_URL}/api/standards/offense/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Offense");
  return res.json();
};

export const deleteLaw = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/standards/law/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Law");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchLaw = async (
  token: string,
  id: number,
  data: Partial<Law>
): Promise<Law> => {
  const url = `${BASE_URL}/api/standards/law/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Law");
  return res.json();
};

export const deleteCrimeCategory = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/standards/crime-category/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Crime Category");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchCrimeCategory = async (
  token: string,
  id: number,
  data: Partial<CrimeCategory>
): Promise<CrimeCategory> => {
  const url = `${BASE_URL}/api/standards/crime-category/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Crime Category");
  return res.json();
};

export const patchEthnicity = async (
  token: string,
  id: number,
  data: Partial<Ethnicities>
): Promise<Ethnicities> => {
  const url = `${BASE_URL}/api/codes/ethnicities/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Ethnicity");
  return res.json();
};

export const patchCourt = async (
  token: string,
  id: number,
  data: Partial<CourtRecord>
): Promise<CourtRecord> => {
  const url = `${BASE_URL}/api/standards/court/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Court");
  return res.json();
};

export async function getRelationship(token: string): Promise<Relationship[]> {
  const res = await fetch(`${BASE_URL}/api/pdls/relationship/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Relationship data.");
  }

  return res.json();
}

export const deleteRelationship = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/pdls/relationship/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Relationship");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchRelationship = async (
  token: string,
  id: number,
  data: Partial<Relationship>
): Promise<Relationship> => {
  const url = `${BASE_URL}/api/pdls/relationship/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Relationship");
  return res.json();
};

export const deletePdltoVisit = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/codes/pdl-to-visit/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete PdltoVisit");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPdltoVisit = async (
  token: string,
  id: number,
  data: Partial<PDLtoVisit>
): Promise<PDLtoVisit> => {
  const url = `${BASE_URL}/api/codes/pdl-to-visit/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update PDL to Visit");
  return res.json();
};

export const deletePersonnel = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/codes/personnel/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Personnel");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPersonnel = async (
  token: string,
  id: number,
  data: Partial<PersonnelForm>
): Promise<PersonnelForm> => {
  const url = `${BASE_URL}/api/codes/personnel/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Personnel");
  return res.json();
};

export const patchPerson = async (
  token: string,
  id: number,
  data: Partial<PersonFormPayload>
): Promise<PersonFormPayload> => {
  const url = `${BASE_URL}/api/standards/persons/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Person");
  return res.json();
};

export const patchVisitor = async (
  token: string,
  id: number,
  data: Partial<VisitorUpdatePayload>
): Promise<VisitorUpdatePayload> => {
  const url = `${BASE_URL}/api/visitors/visitor/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Visitor");
  return res.json();
};

export async function getVisitor(token: string): Promise<VisitorRecord[]> {
  const res = await fetch(`${BASE_URL}/api/visitors/visitor/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Visitor data.");
  }
  return res.json();
}

export const patchUsers = async (
  token: string,
  id: number,
  data: Partial<UserAccounts>
): Promise<UserAccounts> => {
  const url = `${BASE_URL}/api/user/users/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Users");
  return res.json();
};

export async function getRole(token: string): Promise<GroupRole[]> {
  const res = await fetch(`${BASE_URL}/api/standards/groups/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Role data.");
  }
  return res.json();
}

export async function getPermission(
  token: string
): Promise<PaginatedResponse<Permission>> {
  const res = await fetch(`${BASE_URL}/api/standards/permissions/?limit=10000`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Permission data.");
  }

  return res.json();
}

export async function getVisitLog(token: string): Promise<VisitLogForm[]> {
  const res = await fetch(`${BASE_URL}/api/visit-logs/visits/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Visit Log data.");
  }
  return res.json();
}

export async function getVisitorSpecific(
  id: string,
  token: string
): Promise<VisitorRecord[]> {
  const res = await fetch(
    `${BASE_URL}/api/visit-logs/visitor/?id_number=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch Visitor Specifi data.");
  }
  return res.json();
}

export async function getMainGate(token: string): Promise<MainGateLog[]> {
  const res = await fetch(`${BASE_URL}/api/visit-logs/main-gate-visits/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Main Gate data.");
  }
  return res.json();
}

export async function getPDLStation(token: string): Promise<MainGateLog[]> {
  const res = await fetch(`${BASE_URL}/api/visit-logs/pdl-station-visits/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch PDL Station data.");
  }
  return res.json();
}

export async function getVisitorStation(token: string): Promise<MainGateLog[]> {
  const res = await fetch(
    `${BASE_URL}/api/visit-logs/visitor-station-visits/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch Visitor Station data.");
  }
  return res.json();
}

export async function getOTP(token: string): Promise<OTPAccount[]> {
  const res = await fetch(`${BASE_URL}/api/login_v2/account-lockouts/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch OTP data.");
  }
  return res.json();
}

export const deleteOTP = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/login_v2/account-lockouts/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete OTP");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export async function getService_Provider(
  token: string
): Promise<ServiceProviderPayload[]> {
  const res = await fetch(
    `${BASE_URL}/api/service-providers/service-providers/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch Services Provider data.");
  }
  return res.json();
}

export const deleteServiceProvider = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/service-providers/service-providers/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Service Provider");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export async function getNonPDL_Visitor(
  token: string
): Promise<NonPDLVisitorPayload[]> {
  const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Non-PDL Visitor data.");
  }
  return res.json();
}

export async function getDeviceSetting(
  token: string
): Promise<DeviceSettingPayload[]> {
  const res = await fetch(`${BASE_URL}/api/codes/device-settings/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Device Setting data.");
  }
  return res.json();
}

export const deleteDeviceSetting = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/codes/device-settings/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Device Setting");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchDeviceSetting = async (
  token: string,
  id: number,
  data: Partial<EditDeviceSettingRecord>
): Promise<EditDeviceSettingRecord> => {
  const url = `${BASE_URL}/api/codes/device-settings/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Device Setting");
  return res.json();
};

export async function getWatchlistPerson(
  token: string
): Promise<WatchlistPerson[]> {
  const res = await fetch(`${BASE_URL}/api/whitelists/whitelisted-persons/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Watchlist data.");
  }
  return res.json();
}

export const deletePerson = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/standards/persons/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete Watchlist Person");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const deleteWatchlistPerson = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/whitelists/whitelisted-persons/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete Watchlist Person");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export async function syncWatchlistBiometricDB(): Promise<{
  message: string;
  deleted_count: number;
}> {
  const res = await fetch(
    `${BASE_URL_BIOMETRIC}/api/biometric/whitelist-biometric/sync_db_biometric/`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to sync Watchlist data.");
  }
  return res.json();
}

export const deleteWatchlistPersonBiometric = async (
  token: string,
  id: number
) => {
  const url = `${BASE_URL_BIOMETRIC}/api/biometric/whitelist-biometric/delete-person/${id}/`;
  console.log("Deleting biometric person at:", url); // For debugging

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Watchlist Person Biometric");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export async function getGroupAffiliation(
  token: string
): Promise<GroupAffiliationResponse[]> {
  const res = await fetch(
    `${BASE_URL}/api/service-providers/service-provider-group-affiliations/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch Group Affiliation data.");
  }
  return res.json();
}

export const deleteGroupAffiliation = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/service-providers/service-provider-group-affiliations/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete Group Affiliations Person");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchGroupAffiliation = async (
  token: string,
  id: number,
  data: Partial<EditResponse>
): Promise<EditResponse> => {
  const url = `${BASE_URL}/api/service-providers/service-provider-group-affiliations/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Group Affiliation");
  return res.json();
};

export async function getIncidentCategory(
  token: string
): Promise<PaginatedResponse<IncidentCategoryResponse>> {
  const res = await fetch(`${BASE_URL}/api/incidents/incident-categories/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Incident Category data.");
  }
  return res.json();
}

export const postIncidentCategory = async (
  token: string,
  data: IncidentFormCategory
): Promise<IncidentCategoryResponse> => {
  const url = `${BASE_URL}/api/incidents/incident-categories/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add Incident Category");
  return res.json();
};

export const patchIncidentCategory = async (
  token: string,
  id: number,
  data: Partial<IncidentCategoryResponse>
): Promise<IncidentCategoryResponse> => {
  const url = `${BASE_URL}/api/incidents/incident-categories/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Incident Category");
  return res.json();
};

export const deleteIncidentCategory = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/incidents/incident-categories/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete Incident Category");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export async function getIncidentType(
  token: string
): Promise<PaginatedResponse<IncidentTypeResponse>> {
  const res = await fetch(`${BASE_URL}/api/incidents/incident-types/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Incident Type data.");
  }
  return res.json();
}

export const postIncidentType = async (
  token: string,
  data: IncidentFormType
): Promise<IncidentTypeResponse> => {
  const url = `${BASE_URL}/api/incidents/incident-types/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add an Incident Type");
  return res.json();
};

export const deleteIncidentType = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/incidents/incident-types/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete Incident Type");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchIncidentType = async (
  token: string,
  id: number,
  data: Partial<IncidentTypeResponse>
): Promise<IncidentTypeResponse> => {
  const url = `${BASE_URL}/api/incidents/incident-types/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Incident Type");
  return res.json();
};

export const patchSettings = async (
  token: string,
  id: number,
  data: Partial<GlobalSettingsResponse>
): Promise<GlobalSettingsResponse> => {
  const url = `${BASE_URL}/api/codes/global-system-settings/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update Settings");
  return res.json();
};

export async function getIssueCategory(
  token: string
): Promise<IssueCategory[]> {
  const res = await fetch(`${BASE_URL}/api/issues_v2/issue-categories/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Issue Category data.");
  }
  return res.json();
}

export async function getGroup_Role(token: string): Promise<GroupRole> {
  const res = await fetch(`${BASE_URL}/api/standards/groups/?limit=10000`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Group Role data.");
  }

  return res.json();
}

export const updateGroup_Roles = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/standards/groups/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Group Roles");
  }

  return response.json();
};

export const deleteGroup_Roles = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/standards/groups/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Group Roles");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const updateServiceProvided = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/service-providers/provided-services/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Service Provided");
  }

  return response.json();
};

export const deleteServiceProvided = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/service-providers/provided-services/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Service Provided");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const updateVisitorRelPersonnel = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Relationship");
  }

  return response.json();
};

export const deleteVisitorRelPersonnel = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Relationship");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export async function getThreatLevel(token: string): Promise<ThreatLevel> {
  const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/threat-levels/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Threat Level data.");
  }

  return res.json();
}

export const updateReasonforVisit = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/non-pdl-visitor/non-pdl-reason-visits/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Reason for Visit");
  }

  return response.json();
};

export const deleteReasonforVisit = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-reason-visits/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Reason for Visit");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const deleteUsers = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/user/users/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Users");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};