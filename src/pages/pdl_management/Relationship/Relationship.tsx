import { deleteRelationship, getRelationship, patchRelationship } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Table } from "antd";
import moment from "moment";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import AddRelationship from "./AddRelationship";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { getOrganization, getUser, PaginatedResponse } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";

type RelationshipForm = {
    id: number;
    updated_by: string;
    record_status: string;
    updated_at: string;
    relationship_name: string;
    description: string;
};

const Relationship = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectRelationship, setSelctedRelationship] = useState<RelationshipForm | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const fetchRelationship = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/pdls/relationship/?search=${search}`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
        return () => clearTimeout(timeout);
    }, [searchText]);

    const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ["relationship", debouncedSearch],
        queryFn: () => fetchRelationship(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "relationship",
            "relationship-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<RelationshipForm>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/pdls/relationship/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch PDL Relationship data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const { data: OrganizationData } = useQuery({
        queryKey: ['organization'],
        queryFn: () => getOrganization(token ?? "")
    })

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteRelationship(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["relationship"] });
            messageApi.success("Relationship deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Relationship");
        },
    });

    const { mutate: editRelationship, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: RelationshipForm) =>
            patchRelationship(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["relationship"] });
            messageApi.success("Relationship updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Relationship");
        },
    });

    const handleEdit = (record: RelationshipForm) => {
        setSelctedRelationship(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (selectRelationship && selectRelationship.id) {
            const updatedRelationship: RelationshipForm = {
                ...selectRelationship,
                ...values,
            };
            editRelationship(updatedRelationship);
        } else {
            messageApi.error("Selected Relationship is invalid");
        }
    };

    const dataSource = data?.results?.map((relationship, index ) => ({
        key: index + 1,
        id: relationship?.id,
        relationship_name: relationship?.relationship_name ?? 'N/A',
        description: relationship?.description ?? 'N/A',
        updated_at: relationship?.updated_at ?? '', 
        updated_by: relationship?.updated_by ?? 'N/A',
        organization: relationship?.organization ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const columns = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
        title: "Relationship Name",
        dataIndex: "relationship_name",
        key: "relationship_name",
        sorter: (a, b) => a.relationship_name.localeCompare(b.relationship_name),
        },
        {
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: (a, b) => a.description.localeCompare(b.description),
        },
        {
            title: "Updated At",
            dataIndex: "updated_at",
            key: "updated_at",
            render: (value) => value ? moment(value).format("YYYY-MM-DD hh:mm:ss A") : "",
        },
        {
            title: 'Updated By',
            dataIndex: 'updated_by',
            key: 'updated_by',
        },
        {
        title: "Actions",
        key: "actions",
        render: (_: any, record: RelationshipForm) => (
            <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
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
    ];

    const fetchAllRelationship = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/relationship/?limit=100`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return await res.json();
    };

    const handleExportPDF = async () => {
        setIsLoading(true);
        setLoadingMessage("Generating PDF... Please wait.");
        
        try {
            const doc = new jsPDF();
            const headerHeight = 48;
            const footerHeight = 32;
            const organizationName = OrganizationData?.results?.[0]?.org_name || ""; 
            const PreparedBy = dataSource[0]?.updated || "";

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 28; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllRelationship();
            } else {
                allData = await fetchRelationship(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((relationship, index) => ({
                key: index + 1,
                id: relationship?.id,
                relationship_name: relationship?.relationship_name ?? 'N/A',
                description: relationship?.description ?? 'N/A',
                updated_at: relationship?.updated_at ?? '', 
                updated_by: relationship?.updated_by ?? 'N/A',
            }));

            const addHeader = () => {
                const pageWidth = doc.internal.pageSize.getWidth(); 
                const imageWidth = 30;
                const imageHeight = 30; 
                const margin = 10; 
                const imageX = pageWidth - imageWidth - margin;
                const imageY = 12;

                doc.addImage(bjmp, 'PNG', imageX, imageY, imageWidth, imageHeight);
                doc.setTextColor(0, 102, 204);
                doc.setFontSize(16);
                doc.text("Relationship Report", 10, 15); 
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.text(`Organization Name: ${organizationName}`, 10, 25);
                doc.text("Report Date: " + formattedDate, 10, 30);
                doc.text("Prepared By: " + PreparedBy, 10, 35);
                doc.text("Department/ Unit: IT", 10, 40);
                doc.text("Report Reference No.: " + reportReferenceNo, 10, 45);
            };

            addHeader(); 
            const tableData = printSource.map((item, idx) => [
                idx + 1,
                item.relationship_name || '',
                item.description || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Relationship', 'Description']],
                    body: pageData,
                    startY: startY,
                    margin: { top: 0, left: 10, right: 10 },
                    styles: {
                        fontSize: 10,
                    },
                    didDrawPage: function (data) {
                        if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                            addHeader(); 
                        }
                    },
                });
        
                if (i + maxRowsPerPage < tableData.length) {
                    doc.addPage();
                    startY = headerHeight;
                }
            }
        
            const pageCount = doc.internal.getNumberOfPages();
            for (let page = 1; page <= pageCount; page++) {
                doc.setPage(page);
                const footerText = [
                    "Document Version: Version 1.0",
                    "Confidentiality Level: Internal use only",
                    "Contact Info: " + PreparedBy,
                    `Timestamp of Last Update: ${formattedDate}`
                ].join('\n');
                const footerX = 10;
                const footerY = doc.internal.pageSize.height - footerHeight + 15;
                const pageX = doc.internal.pageSize.width - doc.getTextWidth(`${page} / ${pageCount}`) - 10;
                doc.setFontSize(8);
                doc.text(footerText, footerX, footerY);
                doc.text(`${page} / ${pageCount}`, pageX, footerY);
            }
        
            const pdfOutput = doc.output('datauristring');
            setPdfDataUrl(pdfOutput);
            setIsPdfModalOpen(true);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the PDF. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
    };

    const handleExportExcel = async () => {
        let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllRelationship();
            } else {
                allData = await fetchRelationship(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((relationship, index) => ({
                key: index + 1,
                id: relationship?.id,
                relationship_name: relationship?.relationship_name ?? 'N/A',
                description: relationship?.description ?? 'N/A',
                updated_at: relationship?.updated_at ?? '', 
                updated_by: relationship?.updated_by ?? 'N/A',
            }));

        const exportData = printSource.map((relationship, index) => {
            return {
                "No.": index + 1,
                "Relationship": relationship?.relationship_name,
                "Description": relationship?.description,
                "Updated by": relationship?.updated_by,
                "Updated at": relationship?.updated_at,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relationship");
        XLSX.writeFile(wb, "Relationship.xlsx");
    };

        const handleExportCSV = async () => {
        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllRelationship();
            } else {
                allData = await fetchRelationship(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((relationship, index) => ({
                key: index + 1,
                id: relationship?.id,
                relationship_name: relationship?.relationship_name ?? 'N/A',
                description: relationship?.description ?? 'N/A',
                updated_at: relationship?.updated_at ?? '', 
                updated_by: relationship?.updated_by ?? 'N/A',
            }));

        const exportData = printSource.map((relationship, index) => {
            return {
                "No.": index + 1,
                "Relationship": relationship?.relationship_name,
                "Description": relationship?.description,
                "Updated by": relationship?.updated_by,
                "Updated at": relationship?.updated_at,
            };
        });

            const csvContent = [
                Object.keys(exportData[0]).join(","),
                ...exportData.map(item => Object.values(item).join(",")) 
            ].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "Relationship.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

    const menu = (
        <Menu>
            <Menu.Item>
                <a onClick={handleExportExcel}>
                    {isLoading ? <span className="loader"></span> : 'Export Excel'}
                </a>
            </Menu.Item>
            <Menu.Item>
                <a onClick={handleExportCSV}>
                    {isLoading ? <span className="loader"></span> : 'Export CSV'}
                </a>
            </Menu.Item>
        </Menu>
    );

    const totalRecords = debouncedSearch 
    ? data?.count || 0
    : data?.count || 0;

    const mapRelationship = (relation, index) => ({
            key: index + 1,
            id: relation?.id,
            relationship_name: relation?.relationship_name,
            description: relation?.description,
    });

    return (
        <div className="p-4">
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Relationship</h1>
            <div className="flex items-center justify-between my-4">
                <div className="flex gap-2">
                    <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                        <a className="ant-dropdown-link gap-2 flex items-center" onClick={e => e.preventDefault()}>
                            {isLoading ? <span className="loader"></span> : <GoDownload />}
                            {isLoading ? ' Loading...' : ' Export'}
                        </a>
                    </Dropdown>
                    <button 
                        className={`bg-[#1E365D] py-2 px-5 rounded-md text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                        onClick={handleExportPDF} 
                        disabled={isLoading}
                    >
                        {isLoading ? loadingMessage : 'PDF Report'}
                    </button>
                </div>
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder="Search Relationship..."
                        value={searchText}
                        className="py-2 md:w-64 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button
                        className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center justify-center"
                        onClick={showModal}
                            >
                        <GoPlus />
                            Add Relationship
                    </button>
                </div>
            </div>
        <Table
            className="overflow-x-auto"
            loading={isFetching || searchLoading}
            columns={columns}
                dataSource={debouncedSearch
                        ? (searchData?.results || []).map(mapRelationship)
                            : dataSource}
                scroll={{ x: 'max-content' }} 
                pagination={{
                current: page,
                pageSize: limit,
                total: totalRecords,
                pageSizeOptions: ['10', '20', '50', '100'],
                    showSizeChanger: true, 
                    onChange: (newPage, newPageSize) => {
                        setPage(newPage);
                        setLimit(newPageSize); 
                    },
                }}
            rowKey="id"
        />
            <Modal
                title="Relationship Report"
                open={isPdfModalOpen}
                onCancel={handleClosePdfModal}
                footer={null}
                width="80%"
            >
                {pdfDataUrl && (
                    <iframe
                        src={pdfDataUrl}
                        title="PDF Preview"
                        style={{ width: '100%', height: '80vh', border: 'none' }}
                    />
                )}
            </Modal>
            <Modal
                title="Relationship"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Form.Item
                    name="relationship_name"
                    label="Relationship Name"
                    rules={[{ required: true, message: "Please input the Relationship name" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: "Please input a description" }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
                </Form>
            </Modal>
            <Modal
                className="overflow-y-auto rounded-lg scrollbar-hide"
                title="Add Relationship"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="30%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
                <AddRelationship onClose={handleCancel} />
            </Modal>
        </div>
    )
}

export default Relationship
