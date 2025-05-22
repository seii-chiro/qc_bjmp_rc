import { IncidentTypeResponse } from "@/lib/issues-difinitions";
import { getUser } from "@/lib/queries";
import { deleteIncidentType, getIncidentType } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";


const IncidentType = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [IncidentType, setIncidentType] = useState<IncidentTypeResponse | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data } = useQuery({
        queryKey: ["incident-type"],
        queryFn: () => getIncidentType(token ?? ""),
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteIncidentType(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incident-type"] });
            messageApi.success("Incident Type deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Incident Type");
        },
    });

    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const dataSource = data?.results?.map((incident_type, index) => ({
        key: index + 1,
        id: incident_type?.id,
        name: incident_type?.name ?? "N/A",
        description: incident_type?.description ?? "N/A",
        organization: incident_type?.organization ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const filteredData = dataSource?.filter((incident_type) =>
        Object.values(incident_type).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<IncidentTypeResponse> = [
        {
            title: 'No.',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
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
    ]
    return (
        <div>
            <Table dataSource={filteredData} columns={columns} />
        </div>
    )
}

export default IncidentType
