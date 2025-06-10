import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getOrganization, getUser } from "@/lib/queries";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { BASE_URL } from "@/lib/urls";
import { deleteNonPDLVisitorIL, patchNonPDLIL } from "@/lib/personnel-queries";

type ImpactLevelPayload = {
    id: number,
    name: string,
    description: string,
}

const NonPDLVisitorImpactLevel = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [impactLevel, setImpactLevel] = useState<ImpactLevelPayload | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    
    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
    };

    async function fetchImpactLevel(
    token: string
    ): Promise<ImpactLevelPayload> {
    const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/impact-levels/`, {
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

    const { data: impactLevelData } = useQuery({
        queryKey: ['impact-level'],
        queryFn: () => fetchImpactLevel(token ?? ""),
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const { data: OrganizationData } = useQuery({
        queryKey: ['organization'],
        queryFn: () => getOrganization(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteNonPDLVisitorIL(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["impact-level"] });
            messageApi.success("Impact Level deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Impact Level");
        },
    });

    const { mutate: editNonPDLVisitorImpactLevel, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: ImpactLevelPayload) =>
            patchNonPDLIL(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["impact-level"] });
            messageApi.success("Non PDL Visitor Impact Level updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Non PDL Visitor Impact Level");
        },
    });

    const handleEdit = (record: ImpactLevelPayload) => {
        setImpactLevel(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (impactLevel && impactLevel.id) {
            const updatedNonPDLVisitorImpactLevel: ImpactLevelPayload = {
                ...impactLevel,
                ...values,
            };
            editNonPDLVisitorImpactLevel(updatedNonPDLVisitorImpactLevel);
        } else {
            messageApi.error("Selected Non PDL Visitor Impact Level is invalid");
        }
    };

const dataSource = impactLevelData?.results
    ?.slice()
    ?.sort((a, b) => b.id - a.id)
    ?.map((impact, index) => ({
        key: index + 1,
        id: impact?.id,
        name: impact?.name,
        description: impact?.description,
    }));

    const filteredData = dataSource?.filter((impact) =>
        Object.values(impact).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );
    const columns: ColumnsType<ImpactLevelPayload> = [
        {
            title: 'No.',
            key: 'index',
            render: (_text, _record, index) => index + 1,
        },
        {
            title: 'Non PDL Visitor Impact Level',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            defaultSortOrder: 'descend',
            sortDirections: ['descend', 'ascend'],
        },
        {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        sorter: (a, b) => a.description.localeCompare(b.description),
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        <AiOutlineEdit />
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => deleteMutation.mutate(record.id)}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        },
    ]
    return (
        <div>
                <Table
                className="overflow-x-auto"
                columns={columns}
                dataSource={filteredData}
                scroll={{ x: 'max-content' }} 
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                }}
            />
        </div>
    )
}

export default NonPDLVisitorImpactLevel
