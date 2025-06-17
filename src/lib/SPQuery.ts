import { BASE_URL } from "./urls";

export const patchNonPDLVisitor = async (
    token: string,
    id: number,
    updatedData: any
    ) => {
    const url = `${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/${id}/`;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error("Failed to update Non-PDL Visitor");
    }

    return response.json();
};

export const deleteNonPDLVisitor = async (token: string, id: number) => {
    const response = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/${id}/`, {
        method: "DELETE",
        headers: {
        Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete Non-PDL Visitor");
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const patchNonPDLVisitorType = async (
    token: string,
    id: number,
    updatedData: any
    ) => {
    const url = `${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/${id}/`;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error("Failed to update Non-PDL Visitor Type");
    }

    return response.json();
};

export const deleteNonPDLVisitorType = async (token: string, id: number) => {
    const response = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/${id}/`, {
        method: "DELETE",
        headers: {
        Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete Non-PDL Visitor Type");
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const patchEthnicityProvince = async (
    token: string,
    id: number,
    updatedData: any
    ) => {
    const url = `${BASE_URL}/api/codes/ethnicity-provinces/${id}/`;
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error("Failed to update Ethnicity Province");
    }

    return response.json();
};

export const deleteEthnicityProvince = async (token: string, id: number) => {
    const response = await fetch(`${BASE_URL}/api/codes/ethnicity-provinces/${id}/`, {
        method: "DELETE",
        headers: {
        Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete Ethnicity Province");
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};