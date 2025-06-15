import {
  GroupAffiliation,
  NonPdlVisitorReasonVisit,
  NonPDLVisitorType,
  PDLVisitStatus,
  PersonnelStatus,
  PersonnelType,
  ProvidedService,
  Relationship,
  RelationshipOfVisitorToPersonnel,
  ServiceProviderRemarks,
  ServiceProviderType,
} from "./definitions";
import { PaginatedResponse } from "./queries";
import { BASE_URL } from "./urls";

export async function getPersonnelTypes(
  token: string
): Promise<PaginatedResponse<PersonnelType>> {
  const res = await fetch(`${BASE_URL}/api/codes/personnel-type/?limit=1000`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (res.status === 403) {
    throw new Error(
      "Access denied: You are not authorized to view Personnel Type data."
    );
  }

  if (!res.ok) {
    throw new Error("Failed to fetch Personnel Type data.");
  }

  return res.json();
}

export async function getPersonnelStatuses(
  token: string
): Promise<PaginatedResponse<PersonnelStatus>> {
  const res = await fetch(
    `${BASE_URL}/api/codes/personnel-status/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (res.status === 403) {
    throw new Error(
      "Access denied: You are not authorized to view Personnel Status data."
    );
  }

  if (!res.ok) {
    throw new Error("Failed to fetch Personnel Status data.");
  }

  return res.json();
}

export async function getNonPdlVisitorReasons(
  token: string
): Promise<PaginatedResponse<NonPdlVisitorReasonVisit>> {
  const res = await fetch(
    `${BASE_URL}/api/non-pdl-visitor/non-pdl-reason-visits/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Reasons data.");
  }

  return res.json();
}

export async function getRelationships(
  token: string
): Promise<PaginatedResponse<Relationship>> {
  const res = await fetch(`${BASE_URL}/api/pdls/relationship/?limit=1000`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Relationships data.");
  }

  return res.json();
}

export async function getRelationshipOfVisitorToPersonnel(
  token: string
): Promise<PaginatedResponse<RelationshipOfVisitorToPersonnel>> {
  const res = await fetch(
    `${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch realtionship of visitor to personnel data."
    );
  }

  return res.json();
}

export async function getProvidedServices(
  token: string
): Promise<PaginatedResponse<ProvidedService>> {
  const res = await fetch(
    `${BASE_URL}/api/service-providers/provided-services/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Provided Service data.");
  }

  return res.json();
}

export async function getServiceProviderTypes(
  token: string
): Promise<PaginatedResponse<ServiceProviderType>> {
  const res = await fetch(
    `${BASE_URL}/api/service-providers/service-provider-visitor-types/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Service Provider Types data.");
  }

  return res.json();
}

export async function getServiceProviderRemarks(
  token: string
): Promise<PaginatedResponse<ServiceProviderRemarks>> {
  const res = await fetch(
    `${BASE_URL}/api/service-providers/service-provider-remarks-many/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Service Provider Remarks data.");
  }

  return res.json();
}

export async function getGroupAffiliations(
  token: string
): Promise<PaginatedResponse<GroupAffiliation>> {
  const res = await fetch(
    `${BASE_URL}/api/service-providers/service-provider-group-affiliations/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Affiliations data.");
  }

  return res.json();
}

export async function getPDLVisitStatuses(
  token: string
): Promise<PaginatedResponse<PDLVisitStatus>> {
  const res = await fetch(
    `${BASE_URL}/api/pdls/pdl-visitation-statuses/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch PDL Visit Statuses data.");
  }

  return res.json();
}

export async function getNonPDLVisitorTypes(
  token: string
): Promise<PaginatedResponse<NonPDLVisitorType>> {
  const res = await fetch(
    `${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/?limit=1000`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Non PDL Visitor Type data.");
  }

  return res.json();
}

export const fetchSettings = async (token: string) => {
  const res = await fetch(`${BASE_URL}/api/codes/global-system-settings/`, {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
};
