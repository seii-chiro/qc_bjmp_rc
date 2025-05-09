import { CourtBranch, CourtRecord, CrimeCategory, Ethnicities, GangAffiliation, Law, Offense, PDLtoVisit, Precinct, User, VisitorRecord } from "./definitions";
import { MainGateLog, NonPDLVisitorPayload, OTPAccount, PersonFormPayload, PersonnelForm, Relationship, Role, ServiceProviderPayload, VisitLogForm, VisitorUpdatePayload } from "./issues-difinitions";
import { PDLs } from "./pdl-definitions";
import { BASE_URL } from "./urls";

export const deletePDL = async (token: string, id: number) => {
    const response = await fetch(
        `${BASE_URL}/api/pdls/pdl/${id}/`,
        {
        method: "DELETE",
        headers: {
            Authorization: `Token ${token}`,
        },
        }
    );

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
    const response = await fetch(
        `${BASE_URL}/api/pdls/precinct/${id}/`,
        {
        method: "DELETE",
        headers: {
            Authorization: `Token ${token}`,
        },
        }
    );

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
    const response = await fetch(
        `${BASE_URL}/api/standards/offense/${id}/`,
        {
        method: "DELETE",
        headers: {
            Authorization: `Token ${token}`,
        },
        }
    );

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
    const response = await fetch(
        `${BASE_URL}/api/standards/law/${id}/`,
        {
        method: "DELETE",
        headers: {
            Authorization: `Token ${token}`,
        },
        }
    );

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

export async function getRelationship(
    token: string
    ): Promise<Relationship[]> {
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
    const response = await fetch(
        `${BASE_URL}/api/pdls/relationship/${id}/`,
        {
        method: "DELETE",
        headers: {
            Authorization: `Token ${token}`,
        },
        }
    );

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
    const response = await fetch(
        `${BASE_URL}/api/codes/pdl-to-visit/${id}/`,
        {
        method: "DELETE",
        headers: {
            Authorization: `Token ${token}`,
        },
        }
    );

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
    const response = await fetch(
        `${BASE_URL}/api/codes/personnel/${id}/`,
        {
        method: "DELETE",
        headers: {
            Authorization: `Token ${token}`,
        },
        }
    );

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

export async function getVisitor(
    token: string
    ): Promise<VisitorRecord[]> {
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
    data: Partial<User>
    ): Promise<User> => {
    const url = `${BASE_URL}/api/user/me/`;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update User");
    return res.json();
};

export async function getRole(
    token: string
    ): Promise<Role[]> {
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
    ): Promise<Role[]> {
    const res = await fetch(`${BASE_URL}/api/standards/permissions/`, {
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

export async function getVisitLog(
    token: string
    ): Promise<VisitLogForm[]> {
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

export async function getVisitorSpecific(id: string,
    token: string
    ): Promise<VisitorRecord[]> {
    const res = await fetch(`${BASE_URL}/api/visit-logs/visitor/?id_number=${id}`, {
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch Visitor Specifi data.");
    }
    return res.json();
}

export async function getMainGate(
    token: string
    ): Promise<MainGateLog[]> {
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

export async function getPDLStation(
    token: string
    ): Promise<MainGateLog[]> {
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

export async function getVisitorStation(
    token: string
    ): Promise<MainGateLog[]> {
    const res = await fetch(`${BASE_URL}/api/visit-logs/visitor-station-visits/`, {
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch Visitor Station data.");
    }
    return res.json();
}

export async function getOTP(
    token: string
    ): Promise<OTPAccount[]> {
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
    const res = await fetch(`${BASE_URL}/api/service-providers/service-providers/`, {
        headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        },
    });
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