export interface SPPayload {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; 
    updated_at: string; 
    name: string;
    description: string;
}

export type NonPDLVisitorType = {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string;
    updated_at: string;
    non_pdl_visitor_type: string;
    description: string;
};

export type Permission = {
    id: number,
    name: string,
    codename: string,
    content_type: number
}

interface Permission {
    id: number;            // ID of the permission
    name: string;         // Name of the permission
    codename: string;     // Codename for the permission
    content_type: number; // Content type associated with the permission
}

interface GroupRoles {
    id: number;                   // ID of the group role
    name: string;                 // Name of the group role
    permissions: number[];        // Array of permission IDs
    full_permissions: Permission[]; // Array of full permission objects
}

interface PaginatedResponse<T> {
    count: number;               // Total number of items
    next: string | null;         // URL for the next page of results
    previous: string | null;     // URL for the previous page of results
    results: T[];                // Array of results
}

interface Impact {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    name: string;
    description: string;
    impact_level: number;
    risk: number;
}

interface RecommendedAction {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    name: string;
    description: string;
    risk: number;
}

interface Risk {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    name: string;
    description: string;
    risk_level: number;
    impacts: Impact[];
    recommended_action: RecommendedAction[];
}

interface IssueCategory {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    name: string;
    description: string;
    categorization_rule: string;
}

interface IssueType {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    issue_category: IssueCategory;
    risk: Risk;
    name: string;
    remarks: string;
    description: string;
}

interface Status {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    name: string;
    description: string;
}

interface YourMainType {
    id: number;
    created_by: string;
    updated_by: string;
    issue_type: IssueType;
    issue_category: IssueCategory;
    status: Status;
    record_status: string;
    created_at: string; // ISO 8601 format
    updated_at: string; // ISO 8601 format
    remarks: string;
}

interface NPImpactLevel {
    id: number;               // Unique identifier
    created_by: string;      // User who created the record
    updated_by: string;      // User who last updated the record
    record_status: string;    // Status of the record (e.g., active, inactive)
    created_at: string;      // Timestamp of creation in ISO 8601 format
    updated_at: string;      // Timestamp of last update in ISO 8601 format
    impact_level: string;    // Level of impact (e.g., Low, Medium, High)
    description: string;     // Description of the impact
}

interface NPThreatLevel {
    id: number;               // Unique identifier
    created_by: string;      // User who created the record
    updated_by: string;      // User who last updated the record
    record_status: string;    // Status of the record (e.g., active, inactive)
    created_at: string;      // Timestamp of creation in ISO 8601 format
    updated_at: string;      // Timestamp of last update in ISO 8601 format
    threat_level: string;    // Level of impact (e.g., Low, Medium, High)
    description: string;     // Description of the impact
}