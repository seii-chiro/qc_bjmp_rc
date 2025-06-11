/* eslint-disable @typescript-eslint/no-explicit-any */
import { getIncidents, getIncidentStatus, getIncidentTypes, getSeverityLevels, patchIncident } from "@/lib/incidentQueries"
import { getUsers } from "@/lib/queries"
import { BASE_URL } from "@/lib/urls"
import { useTokenStore } from "@/store/useTokenStore"
import { useQuery, useMutation } from "@tanstack/react-query"
import { message, Select, Table, Popconfirm, Dropdown, Button, Modal, MenuProps } from "antd"
import { useState } from "react"
import { CSVLink } from "react-csv"
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { GoDownload } from "react-icons/go"
import { NavLink } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { generatePDFReport, PDFColumn } from "../oasis/generatePDF"
import { useUserStore } from "@/store/useUserStore"
import { FaPlus } from "react-icons/fa"

const IncidentTable = () => {
    const token = useTokenStore()?.token
    const user = useUserStore(state => state.user)
    const navigate = useNavigate();
    const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
    const [isPDFModalOpen, setIsPDFModalOpen] = useState(false)

    const { data: incidents, isLoading: incidentsLoading, refetch } = useQuery({
        queryKey: ['incidents', 'incidentID'],
        queryFn: () => getIncidents(token ?? ""),
    })

    const { data: incidentTypes } = useQuery({
        queryKey: ['indident-types', 'table'],
        queryFn: () => getIncidentTypes(token ?? ""),
    })

    const { data: severityLevels } = useQuery({
        queryKey: ['indident-severity-levels', 'table'],
        queryFn: () => getSeverityLevels(token ?? ""),
    })

    const { data: incidentStatus } = useQuery({
        queryKey: ['indident-status', 'table'],
        queryFn: () => getIncidentStatus(token ?? ""),
    })

    const { data: users } = useQuery({
        queryKey: ['users', 'incident-table'],
        queryFn: () => getUsers(token ?? ""),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => fetch(
            `${BASE_URL}/api/incidents/incidents/${id}/`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
            }
        ),
        onSuccess: () => {
            message.success("Incident deleted!");
            refetch();
        },
        onError: () => message.error("Failed to delete incident."),
    });


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
        incidentTypes?.results?.find(incident => incident?.name === type)?.name || "";

    const getSeverityName = (severity: string) =>
        severityLevels?.results?.find((s) => s.name === severity)?.name || "";


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
            render: (status: string, record: any) => {
                // Set color and font style based on status
                let color = "#1890ff"; // default blue for "Open"
                let background = "#e6f4ff"; // light blue for open
                const fontWeight = "bold";
                if (status.toLowerCase() === "pending") {
                    color = "orange";
                    background = "#fff7e6"; // light orange
                } else if (status.toLowerCase() === "closed") {
                    color = "green";
                    background = "#f6ffed"; // light green
                } else if (status.toLowerCase() === "open") {
                    color = "#1890ff";
                    background = "#e6f4ff";
                }

                return (
                    <Select
                        className={
                            status.toLowerCase() === "pending"
                                ? "!bg-orange-50"
                                : status.toLowerCase() === "closed"
                                    ? "!bg-green-50"
                                    : "!bg-blue-50"
                        }
                        value={incidentStatus?.results?.find(s => s.name === status)?.id}
                        style={{
                            width: 150,
                            color,
                            fontWeight,
                            background,
                            border: `1px solid ${color}`,
                            borderRadius: 8,
                        }}
                        options={incidentStatus?.results?.map(status => ({
                            label: (
                                <span
                                    style={{
                                        color:
                                            status.name.toLowerCase() === "pending"
                                                ? "orange"
                                                : status.name.toLowerCase() === "closed"
                                                    ? "green"
                                                    : "#1890ff",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {status.name}
                                </span>
                            ),
                            value: status.id,
                        }))}
                        onChange={value => {
                            patchMutation.mutate({ id: record.id, payload: { status_id: value } });
                        }}
                    />
                );
            },
        },
        {
            title: "Assigned Responder",
            dataIndex: "user_assigned_to",
            key: "user_assigned_to",
            render: (user_assigned_to: string | null, record: any) => {
                const assignedUserId = users?.results?.find(user => user.email === user_assigned_to)?.id ?? null;
                return (
                    <Select
                        value={assignedUserId}
                        style={{ width: 150 }}
                        allowClear
                        placeholder="Assign user"
                        options={users?.results?.map(user => ({
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
        {
            title: "Actions",
            key: "actions",
            align: "center" as const,
            render: (_: any, record: any) => (
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => navigate("/jvms/incidents/report", { state: record })}
                    >
                        <AiOutlineEdit />
                    </button>
                    <Popconfirm
                        title="Are you sure to delete this incident?"
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button
                            className="text-red-500 hover:text-red-700"
                        >
                            <AiOutlineDelete />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const handleGeneratePDF = () => {
        const headers: PDFColumn[] = columns
            ?.filter(col => col.title !== "Actions")
            .map(col => ({
                header: typeof col.title === "string" ? col.title : "",
                dataKey: typeof col.key === "string" ? col.key : ""
            }));

        const title = "Watchlist Risk Level";
        const filename = title;

        const preparedBy = user?.first_name && user?.last_name ? `${user?.first_name} ${user?.last_name}` : user?.email

        const result = generatePDFReport({
            title,
            headers,
            data: incidents?.results || [],
            filename,
            orientation: "landscape",
            showDate: true,
            showPageNumbers: true,
            modalPreview: true,
            preview: true,
            preparedBy
        });

        if (result.success && result.pdfDataUrl) {
            setPdfDataUrl(result.pdfDataUrl);
        }

        return result;
    };

    const handleOpenPDFModal = () => {
        handleGeneratePDF();
        setIsPDFModalOpen(true);
    };

    const handleClosePDFModal = () => {
        setIsPDFModalOpen(false);
        setPdfDataUrl('');
    };

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(incidents?.results || []);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Watchlist_Risk_Levels");
        XLSX.writeFile(wb, "Watchlist_Risk_Levels.xlsx");
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <a onClick={handleExportExcel}>Export Excel</a>
            ),
        },
        {
            key: '2',
            label: (
                <CSVLink data={incidents?.results || []} filename="Watchlist_Risk_Levels.csv">
                    Export CSV
                </CSVLink>
            ),
        },
    ];

    return (
        <>
            <Modal
                title="PDF Preview"
                width="90%"
                style={{ top: 20 }}
                footer={null}
                open={isPDFModalOpen}
                onClose={handleClosePDFModal}
                onCancel={handleClosePDFModal}
            >
                {pdfDataUrl ? (
                    <iframe
                        src={pdfDataUrl}
                        width="100%"
                        height="800px"
                        style={{ border: 'none' }}
                        title="PDF Preview"
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        Loading PDF preview...
                    </div>
                )}
            </Modal>
            <div className="w-full flex flex-col mb-4">
                <h1 className="text-2xl font-bold mb-4">Incident Reports</h1>

                <div className="w-full flex justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                            <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" menu={{ items }}>
                                <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                                    <GoDownload /> Export
                                </a>
                            </Dropdown>
                        </div>
                        <Button
                            onClick={handleOpenPDFModal}
                            className="h-10 w-32 bg-[#1E365D] text-white font"
                        >
                            Print Report
                        </Button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <NavLink
                            to="/jvms/incidents/report"
                            className="bg-[#1E365D] flex gap-1 items-center text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                        >
                            <FaPlus /> Report an Incident
                        </NavLink>
                    </div>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={(incidents?.results || []).slice().reverse()}
                loading={incidentsLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
        </>
    )
}

export default IncidentTable