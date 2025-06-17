import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getOrganization, getUser } from "@/lib/queries";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { BASE_URL } from "@/lib/urls";
import { PaginatedResponse } from "@/lib/queries";
import { NonPDLVisitorType } from "@/lib/spdefinitions";
import { deleteNonPDLVisitorType, patchNonPDLVisitorType } from "@/lib/SPQuery";
import AddNPVisitorType from "./AddNPVisitorType";

const NPVisitorType = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [nonPDLVisitorType, setNonPDLVisitorType] = useState<NonPDLVisitorType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    const fetchNonPDLVisitorType = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/?search=${search}`, {
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
        queryKey: ["visitor-type", debouncedSearch],
        queryFn: () => fetchNonPDLVisitorType(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "visitor-type",
            "visitor-type-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<NonPDLVisitorType>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Non-PDL Visitor Type data.");
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

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteNonPDLVisitorType(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visitor-type"] });
            messageApi.success("Non-PDL Visitor Type deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Non-PDL Visitor Type");
        },
    });

    const { mutate: editNonPDLVisitorType, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: NonPDLVisitorType) =>
            patchNonPDLVisitorType(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visitor-type"] });
            messageApi.success("Non-PDL Visitor Type updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Non-PDL Visitor Type");
        },
    });
    const handleEdit = (record: NonPDLVisitorType) => {
        setNonPDLVisitorType(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (nonPDLVisitorType && nonPDLVisitorType.id) {
            const updateNonPDLVisitorType: NonPDLVisitorType = {
                ...nonPDLVisitorType,
                ...values,
            };
            editNonPDLVisitorType(updateNonPDLVisitorType);
        } else {
            messageApi.error("Selected Non-PDL Visitor Type is invalid");
        }
    };

    const dataSource = data?.results?.map((type, index) => ({
            key: index + 1,
            id: type?.id,
            non_pdl_visitor_type: type?.non_pdl_visitor_type,
            description: type?.description,
    }));

    const columns: ColumnsType<NonPDLVisitorType> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Non-PDL Visitor Type',
            dataIndex: 'non_pdl_visitor_type',
            key: 'non_pdl_visitor_type',
            sorter: (a, b) => a.non_pdl_visitor_type.localeCompare(b.non_pdl_visitor_type),
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

    const fetchAllNonPDLVisitorType = async () => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/?limit=1000`, {
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
            const PreparedBy = `${UserData?.first_name || ''} ${UserData?.last_name || ''}` || "";

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 24; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllNonPDLVisitorType();
            } else {
                allData = await fetchNonPDLVisitorType(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((type, index) => ({
            key: index + 1,
            id: type?.id,
            non_pdl_visitor_type: type?.non_pdl_visitor_type,
            description: type?.description,
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
                doc.text("Non-PDL Visitor Type Report", 10, 15); 
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
                item.non_pdl_visitor_type || '',
                item.description || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Non-PDL Visitor Type', 'Description']],
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

    const handleExportExcel = async () => {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllNonPDLVisitorType();
            } else {
                allData = await fetchNonPDLVisitorType(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((type, index) => ({
            key: index + 1,
            id: type?.id,
            non_pdl_visitor_type: type?.non_pdl_visitor_type,
            description: type?.description,
            updated_at: type?.updated_at,
            updated_by: type?.updated_by,
            }));

        const exportData = printSource.map((type, index) => {
            return {
                "No.": index + 1,
                "Non-PDL Visitor Type": type?.non_pdl_visitor_type,
                "Description": type?.description,
                "Updated At": type?.updated_at,
                "Updated By": type?.updated_by,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NonPDLVisitorType");
        XLSX.writeFile(wb, "NonPDLVisitorType.xlsx");
    };
        
    const handleExportCSV = async () => {
        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllNonPDLVisitorType();
            } else {
                allData = await fetchNonPDLVisitorType(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((type, index) => ({
            key: index + 1,
            id: type?.id,
            non_pdl_visitor_type: type?.non_pdl_visitor_type,
            description: type?.description,
            updated_at: type?.updated_at,
            updated_by: type?.updated_by,
            }));

        const exportData = printSource.map((type, index) => {
            return {
                "No.": index + 1,
                "Non-PDL Visitor Type": type?.non_pdl_visitor_type,
                "Description": type?.description,
                "Updated At": type?.updated_at,
                "Updated By": type?.updated_by,
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
            link.setAttribute("download", "NonPDLVisitorType.csv");
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

    const mapNonPDLVisitorType = (type, index) => ({
            key: index + 1,
            id: type?.id,
            non_pdl_visitor_type: type?.non_pdl_visitor_type,
            description: type?.description,
            updated_at: type?.updated_at,
            updated_by: type?.updated_by,
            });
    return (
        <div>
        {contextHolder}
        <h1 className="text-2xl font-bold text-[#1E365D]">Non-PDL Visitor Type</h1>
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
                        placeholder="Search..."
                        value={searchText}
                        className="py-2 md:w-64 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button
                        className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center justify-center"
                        onClick={showModal}>
                        <GoPlus />
                            Add Non-PDL Visitor Type
                    </button>
                </div>
            </div>
            <Table
            className="overflow-x-auto"
            loading={isFetching || searchLoading}
            columns={columns}
                dataSource={debouncedSearch
                        ? (searchData?.results || []).map(mapNonPDLVisitorType)
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
                title="Non-PDL Visitor Type Report"
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
                className="overflow-y-auto rounded-lg scrollbar-hide"
                title="Add Non-PDL Visitor Type"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="30%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
                <AddNPVisitorType
                    onClose={handleCancel}
                    />
            </Modal>
            <Modal
                title="Edit Non-PDL Visitor Type"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width="40%"
                
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Form.Item
                    name="non_pdl_visitor_type"
                    label="Non-PDL Visitor Type"
                    rules={[{ required: true, message: "Please input the Non-PDL Visitor Type" }]}
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
        </div>
    )
}

export default NPVisitorType
