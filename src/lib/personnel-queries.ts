/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PersonnelApplicationStatusPayload,
  PersonnelDesignationPayload,
} from "./issues-difinitions";
import { BASE_URL } from "./urls";

export async function getPersonnelDesignation(
  token: string
): Promise<PersonnelDesignationPayload> {
  const res = await fetch(`${BASE_URL}/api/codes/personnel-designations/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Personnel Designation data.");
  }

  return res.json();
}

export const deletePersonnelDesignation = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/codes/personnel-designations/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Personnel Designation");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPersonnelDesignation = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/codes/personnel-designations/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Personnel Designation");
  }

  return response.json();
};

{
  /* PERSONNEL PERSON RELATIONSHIP */
}

export async function getPersonnelStatus(
  token: string
): Promise<PersonnelDesignationPayload> {
  const res = await fetch(`${BASE_URL}/api/codes/personnel-status/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Personnel Status data.");
  }

  return res.json();
}

export const deletePersonnelStatus = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/codes/personnel-status/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Personnel Status");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPersonnelStatus = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/codes/personnel-status/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Personnel Status");
  }

  return response.json();
};

{
  /* PERSONNEL TYPE */
}

export async function getPersonnelType(
  token: string
): Promise<PersonnelDesignationPayload> {
  const res = await fetch(`${BASE_URL}/api/codes/personnel-type/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Personnel Type data.");
  }

  return res.json();
}

export const deletePersonnelType = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/codes/personnel-type/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Personnel Type");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPersonnelType = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/codes/personnel-type/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Personnel Type");
  }

  return response.json();
};

{
  /* PERSONNEL APPLICATION STATUS */
}

export async function getPersonnelApplicationStatus(
  token: string
): Promise<PersonnelApplicationStatusPayload> {
  const res = await fetch(
    `${BASE_URL}/api/pdls/personnel-application-statuses/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Personnel Status data.");
  }

  return res.json();
}

export const deletePersonnelApplicationStatus = async (
  token: string,
  id: number
) => {
  const response = await fetch(
    `${BASE_URL}/api/pdls/personnel-application-statuses/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Personnel Status");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPersonnelApplicationStatus = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/pdls/personnel-application-statuses/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update Personnel Status");
  }

  return response.json();
};

// PDL MAINTENANCE

{
  /* PDL VISITATION STATUS */
}

export async function getPDLVisitationStatus(
  token: string
): Promise<PersonnelApplicationStatusPayload> {
  const res = await fetch(`${BASE_URL}/api/pdls/pdl-visitation-statuses/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch PDL Visitation Status data.");
  }

  return res.json();
}

export const deletePDLVisitationStatus = async (token: string, id: number) => {
  const response = await fetch(
    `${BASE_URL}/api/pdls/pdl-visitation-statuses/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete PDL Visitation Status");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPDLVisitationStatus = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/pdls/pdl-visitation-statuses/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update PDL Visitation Status");
  }

  return response.json();
};

export async function getPDLCategory(
  token: string
): Promise<PersonnelApplicationStatusPayload> {
  const res = await fetch(`${BASE_URL}/api/pdls/pdl-category/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch PDL Category data.");
  }

  return res.json();
}

export const deletePDLCategory = async (token: string, id: number) => {
  const response = await fetch(`${BASE_URL}/api/pdls/pdl-category/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete PDL Category");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const patchPDLCategory = async (
  token: string,
  id: number,
  updatedData: any
) => {
  const url = `${BASE_URL}/api/pdls/pdl-category/${id}/`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update PDL Category");
  }

    return response.json();
};

export const deleteNonPDLVisitorIL = async (token: string, id: number) => {
    const response = await fetch(`${BASE_URL}/api/non-pdl-visitor/impact-levels/${id}/`, {
        method: "DELETE",
        headers: {
        Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete Non PDL Visitor Impact Level");
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const patchNonPDLIL = async (
    token: string,
    id: number,
    updatedData: any
    ) => {
    const url = `${BASE_URL}/api/non-pdl-visitor/impact-levels/${id}/`;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error("Failed to update Non PDL Visitor Impact Level");
    }

    return response.json();
};