/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAccounts } from "@/lib/definitions"
import { getIncidents, getIncidentStatus, getIncidentTypes, getSeverityLevels, patchIncident } from "@/lib/incidentQueries"
import { IncidentStatus, IncidentType, SeverityLevel } from "@/lib/incidents"
import { getUsers } from "@/lib/queries"
import { useTokenStore } from "@/store/useTokenStore"
import { useQuery, useMutation } from "@tanstack/react-query"
import { message, Select, Table } from "antd"
import { NavLink } from "react-router-dom"

const IncidentTable = () => {
    const token = useTokenStore()?.token

    const { data: incidents, isLoading: incidentsLoading, refetch } = useQuery({
        queryKey: ['incidents', 'incidentID'],
        queryFn: () => getIncidents(token ?? ""),
    })

    const { data: incidentTypes } = useQuery<IncidentType[]>({
        queryKey: ['indident-types', 'table'],
        queryFn: () => getIncidentTypes(token ?? ""),
    })

    const { data: severityLevels } = useQuery<SeverityLevel[]>({
        queryKey: ['indident-severity-levels', 'table'],
        queryFn: () => getSeverityLevels(token ?? ""),
    })

    const { data: incidentStatus } = useQuery<IncidentStatus[]>({
        queryKey: ['indident-status', 'table'],
        queryFn: () => getIncidentStatus(token ?? ""),
    })

    const { data: users } = useQuery<UserAccounts[]>({
        queryKey: ['users', 'incident-table'],
        queryFn: () => getUsers(token ?? ""),
    })

    const patchMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: any }) =>
            patchIncident(token ?? "", id, payload),
        onSuccess: () => {
            message.success("Incident updated!")
            refetch();
        },
        onError: () => message.error("Failed to update incident."),
    });

    const getTypeName = (type: string) =>
        incidentTypes?.find(incident => incident?.name === type)?.name || "";

    const getSeverityName = (severity: string) =>
        severityLevels?.find((s) => s.name === severity)?.name || "";


    const columns = [
        {
            title: "Date/Time",
            dataIndex: "created_at",
            key: "created_at",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            title: "Incident Description",
            dataIndex: "incident_details",
            key: "incident_details",
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type: string) => getTypeName(type),
        },
        {
            title: "Severity",
            dataIndex: "severity",
            key: "severity",
            render: (severity: string) => getSeverityName(severity),
        },
        {
            title: "Incident Status",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: any) => (
                <Select
                    value={
                        incidentStatus?.find(s => s.name === status)?.id
                    }
                    style={{ width: 150 }}
                    options={incidentStatus?.map(status => ({
                        label: status.name,
                        value: status.id,
                    }))}
                    onChange={value => {
                        patchMutation.mutate({ id: record.id, payload: { status_id: value } });
                    }}
                />
            ),
        },
        {
            title: "Assigned Responder",
            dataIndex: "user_assigned_to",
            key: "user_assigned_to",
            render: (user_assigned_to: string | null, record: any) => {
                const assignedUserId = users?.find(user => user.email === user_assigned_to)?.id ?? null;
                return (
                    <Select
                        value={assignedUserId}
                        style={{ width: 150 }}
                        allowClear
                        placeholder="Assign user"
                        options={users?.map(user => ({
                            label: user.email,
                            value: user.id,
                        }))}
                        onChange={value => {
                            patchMutation.mutate({
                                id: record.id,
                                payload: { user_assigned_to_id: value ?? null }
                            });
                        }}
                    />
                );
            },
        },
        {
            title: "Reporter",
            dataIndex: "user",
            key: "user",
        },
        {
            title: "Incident Address",
            dataIndex: "address_incident",
            key: "address_incident",
        },
        {
            title: "Reporter Address",
            dataIndex: "address_reported",
            key: "address_reported",
        },
    ];

    return (
        <>
            <div className="w-full flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-4">Incident Reports</h1>
                <NavLink
                    to="/jvms/incidents/report"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                    Report an Incident
                </NavLink>
            </div>
            <Table
                columns={columns}
                dataSource={incidents || []}
                loading={incidentsLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
        </>
    )
}

export default IncidentTable