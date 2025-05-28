import { deleteIncidentType, getIncidentCategory, getIncidentType } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import IncidentForm from "./IncidentForm";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { IncidentTypeResponse } from "@/lib/issues-difinitions";


const IncidentType = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<Partial<IncidentTypeResponse> | undefined>(undefined);
    const queryClient = useQueryClient();
    // const [pdfDataUrl, setPdfDataUrl] = useState(null);
    // const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const { data: incidentType, refetch: refetchIncidentTypes } = useQuery({
        queryKey: ["incident-type"],
        queryFn: () => getIncidentType(token ?? ""),
    });

    const { data: incidentCategories } = useQuery({
        queryKey: ["incident-category"],
        queryFn: () => getIncidentCategory(token ?? ""),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteIncidentType(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incident-type"] });
            message.success("Incident Type deleted successfully");
        },
        onError: (error) => {
            message.error(error.message || "Failed to delete Incident Type");
        },
    });

    const showEditModal = (record: Partial<IncidentTypeResponse>) => {
        setEditRecord(record);
        setIsModalOpen(true);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const dataSource = incidentType?.results?.map((incident_type, index) => ({
        key: index + 1,
        id: incident_type?.id,
        name: incident_type?.name ?? "N/A",
        description: incident_type?.description ?? "N/A",
        updated_by: incident_type?.updated_by ?? "N/A",
        category: incident_type?.category ?? null,
    })) || [];

    const filteredData = dataSource?.filter((incident_type) =>
        Object.values(incident_type).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<{ key: number; name: string; description: string; updated_by: string; }> = [
        {
            title: 'No.',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Incident Type',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.name))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.name === value,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.description))
                ).map(description => ({
                    text: description,
                    value: description,
                }))
            ],
            onFilter: (value, record) => record.description === value,
        },
        {
            title: 'Updated By',
            dataIndex: 'updated_by',
            key: 'updated_by',
            sorter: (a, b) => a.description.localeCompare(b.updated_by),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.updated_by))
                ).map(description => ({
                    text: description,
                    value: description,
                }))
            ],
            onFilter: (value, record) => record.updated_by === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <div className="flex gap-2 w-full items-center justify-center">
                    <Button
                        className="text-blue-600 border-blue-600"
                        onClick={() => showEditModal(record)}
                    >
                        <AiOutlineEdit />
                    </Button>
                    <Button
                        danger
                        onClick={() => {
                            Modal.confirm({
                                centered: true,
                                title: 'Are you sure?',
                                content: `Delete "${record.name}" incident type?`,
                                okText: 'Yes, delete it',
                                cancelText: 'Cancel',
                                onOk: () => {
                                    const incident = incidentType?.results.find(i => i.name === record.name);
                                    if (incident?.id) {
                                        deleteMutation.mutate(incident.id);
                                    } else {
                                        message.error("Incident ID not found.");
                                    }
                                },
                            });
                        }}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        }
    ]
    return (
        <>
            <Modal
                open={isModalOpen}
                onCancel={handleCancel}
                onClose={handleCancel}
                footer={[]}
                centered
            >
                <IncidentForm
                    editRecord={editRecord}
                    onClose={handleCancel}
                    refetchIncidentTypes={refetchIncidentTypes}
                    incidentCategory={incidentCategories || { count: 0, next: null, previous: null, results: [] }}
                />
            </Modal>

            <div className="w-full h-full flex flex-col gap-4 mt-1">
                <div className="w-full flex justify-between items-center">
                    <h1 className="font-bold text-xl">Incident Types</h1>
                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="🔍 Search incident types..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                            className="w-60 h-10"
                        />
                        <Button
                            type="primary"
                            className="h-10"
                            onClick={showModal}
                        >
                            <span className="flex gap-1 items-center">
                                <Plus />
                                <span className="font-semibold">
                                    Add Incident Type
                                </span>
                            </span>
                        </Button>
                    </div>
                </div>
                <Table
                    dataSource={filteredData}
                    columns={columns}
                />
            </div>
        </>
    )
}

export default IncidentType
