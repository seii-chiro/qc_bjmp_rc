import { PersonnelDesignationPayload } from "@/lib/issues-difinitions";
import { deletePersonnelDesignation, patchPersonnelDesignation } from "@/lib/personnel-queries";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import AddPersonnelDesignation from "./AddPersonnelDesignation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getOrganization, getUser, PaginatedResponse } from "@/lib/queries";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { BASE_URL } from "@/lib/urls";

type DesignationPayload = {
    id: number,
    name: string,
    description: string,
}
const PersonnelDesignation = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [personnelDesignation, setPersonnelDesignation] = useState<DesignationPayload | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
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
    const fetchPersonnelDesignation = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel-designations/?search=${search}`, {
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
        queryKey: ["personnel-designation", debouncedSearch],
        queryFn: () => fetchPersonnelDesignation(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "personnel-designation",
            "personnel-designation-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<PersonnelDesignationPayload>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/codes/personnel-designations/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Personnel Designation data.");
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
        mutationFn: (id: number) => deletePersonnelDesignation(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personnel-designation"] });
            messageApi.success("Personnel Designation deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Personnel Designation");
        },
    });

    const { mutate: editPersonnelDesignation, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: PersonnelDesignationPayload) =>
            patchPersonnelDesignation(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personnel-designation"] });
            messageApi.success("Personnel Designation updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Personnel Designation");
        },
    });

    const handleEdit = (record: PersonnelDesignationPayload) => {
        setPersonnelDesignation(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (personnelDesignation && personnelDesignation.id) {
            const updatedPersonnelDesignation: PersonnelDesignationPayload = {
                ...personnelDesignation,
                ...values,
            };
            editPersonnelDesignation(updatedPersonnelDesignation);
        } else {
            messageApi.error("Selected Personnel Designation is invalid");
        }
    };

    const dataSource = data?.results?.map((designation, index) => ({
        key: index + 1,
        id: designation?.id,
        name: designation?.name,
        description: designation?.description,
    }))

    const columns: ColumnsType<DesignationPayload> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Personnel Designation',
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

    const fetchAllPersonnelDesignation = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel-designations/?limit=1000`, {
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
            const doc = new jsPDF('landscape');
            const headerHeight = 48;
            const footerHeight = 32;
            const organizationName = OrganizationData?.results?.[0]?.org_name || ""; 
            const PreparedBy = `${UserData?.first_name} ${UserData?.last_name}` || ''; 

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 16; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPersonnelDesignation();
            } else {
                allData = await fetchPersonnelDesignation(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((designation, index) => ({
                key: index + 1,
                id: designation?.id,
                name: designation?.name,
                description: designation?.description,
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
                doc.text("Personnel Designation Report", 10, 15); 
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
                item.name || '',
                item.description || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Personnel Designation', 'Description']],
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
                allData = await fetchAllPersonnelDesignation();
            } else {
                allData = await fetchPersonnelDesignation(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((designation, index) => ({
                key: index + 1,
                id: designation?.id,
                name: designation?.name,
                description: designation?.description,
            }));

        const exportData = printSource.map((designation, index) => {
            return {
                "No.": index + 1,
                "Personnel Designation": designation?.name,
                "Description": designation?.description,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PersonnelDesignation");
        XLSX.writeFile(wb, "PersonnelDesignation.xlsx");
    };

    const handleExportCSV = async () => {
        try {

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPersonnelDesignation();
            } else {
                allData = await fetchPersonnelDesignation(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((designation, index) => ({
                key: index + 1,
                id: designation?.id,
                name: designation?.name,
                description: designation?.description,
            }));

        const exportData = printSource.map((designation, index) => {
            return {
                "No.": index + 1,
                "Personnel Designation": designation?.name,
                "Description": designation?.description,
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
            link.setAttribute("download", "PersonnelDesignation.csv");
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

    const mapPersonnelDesignation = (designation, index) => ({
            key: index + 1,
            id: designation?.id,
            name: designation?.name,
            description: designation?.description,
    });

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">Personnel Designation</h1>
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
                            Add Personnel Designation
                    </button>
                </div>
            </div>
            <Table
                className="overflow-x-auto"
                loading={isFetching || searchLoading}
                columns={columns}
                    dataSource={debouncedSearch
                            ? (searchData?.results || []).map(mapPersonnelDesignation)
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
                title="Personnel Designation Report"
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
                title="Add Personnel Designation"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="30%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
                <AddPersonnelDesignation onClose={handleCancel} />
            </Modal>
            <Modal
                title="Edit Personnel Designation"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Form.Item
                    name="name"
                    label="Personnel Designation Name"
                    rules={[{ required: true, message: "Please input the Personnel Designation name" }]}
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

export default PersonnelDesignation
