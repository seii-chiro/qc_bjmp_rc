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
import { deletePDLVisitationStatus, getPDLVisitationStatus, patchPDLVisitationStatus } from "@/lib/personnel-queries";
import AddPDLVisitationStatus from "./AddPDLVisitationStatus";

type PDLStatusPayload = {
    id: number,
    name: string,
    description: string,
}

const PDLVisitationStatus = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [pdlVisitationStatus, setpdlVisitationStatus] = useState<PDLStatusPayload | null>(null);
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

    const { data: pdlStatusData } = useQuery({
        queryKey: ['pdl-status'],
        queryFn: () => getPDLVisitationStatus(token ?? ""),
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
        mutationFn: (id: number) => deletePDLVisitationStatus(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pdl-status"] });
            messageApi.success("PDL Status deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete PDL Status");
        },
    });

    const { mutate: editpdlStatus, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: PDLStatusPayload) =>
            patchPDLVisitationStatus(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pdl-status"] });
            messageApi.success("pdl Status updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update pdl Status");
        },
    });

    const handleEdit = (record: PDLStatusPayload) => {
        setpdlVisitationStatus(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (pdlVisitationStatus && pdlVisitationStatus.id) {
            const updatedpdlVisitationStatus: PDLStatusPayload = {
                ...pdlVisitationStatus,
                ...values,
            };
            editpdlStatus(updatedpdlVisitationStatus);
        } else {
            messageApi.error("Selected PDL Status is invalid");
        }
    };

    const dataSource = pdlStatusData?.results
        ?.slice() // make a shallow copy
        ?.sort((a, b) => b.id - a.id) // sort by descending ID (newest first)
        ?.map((status, index) => ({
            key: index + 1,
            id: status?.id,
            name: status?.name,
            description: status?.description,
        }));

    const filteredData = dataSource?.filter((status) =>
        Object.values(status).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<PDLStatusPayload> = [
        {
            title: 'No.',
            key: 'index',
            render: (_text, _record, index) => index + 1,
        },
        {
            title: 'PDL Visitation Status',
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

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(dataSource);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PDLVisitationStatus");
        XLSX.writeFile(wb, "PDLVisitationStatus.xlsx");
    };

        const handleExportPDF = () => {
            const doc = new jsPDF();
            const headerHeight = 48;
            const footerHeight = 32;
            const organizationName = OrganizationData?.results?.[0]?.org_name || "";
            const PreparedBy = `${UserData?.results?.[0]?.first_name} ${UserData?.results?.[0]?.last_name}` || ''; 
        
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
        
            const maxRowsPerPage = 27; 
        
            let startY = headerHeight;
        
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
                doc.text("PDL Visitation Status Report", 10, 15); 
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.text(`Organization Name: ${organizationName}`, 10, 25);
                doc.text("Report Date: " + formattedDate, 10, 30);
                doc.text("Prepared By: " + PreparedBy, 10, 35);
                doc.text("Department/ Unit: IT", 10, 40);
                doc.text("Report Reference No.: " + reportReferenceNo, 10, 45);
            };
            
        
            addHeader(); 
        
    const isSearching = searchText.trim().length > 0;
    const tableData = (isSearching ? (filteredData || []) : (dataSource || [])).map((item, idx) => [
                idx + 1,
                item.name,
                item.description,
            ]);
        
            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'PDL Visitation Status', 'Description']],
                    body: pageData,
                    startY: startY,
                    margin: { top: 0, left: 10, right: 10 },
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
        };

        const menu = (
            <Menu>
                <Menu.Item>
                    <a onClick={handleExportExcel}>Export Excel</a>
                </Menu.Item>
                <Menu.Item>
                    <CSVLink data={dataSource} filename="PDLVisitationStatus.csv">
                        Export CSV
                    </CSVLink>
                </Menu.Item>
            </Menu>
        );

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">PDL Visitation Status</h1>
            <div className="flex items-center justify-between my-4">
                <div className="flex gap-2">
                    <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                        <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                            <GoDownload /> Export
                        </a>
                    </Dropdown>
                    <button className="bg-[#1E365D] py-2 px-5 rounded-md text-white" onClick={handleExportPDF}>
                        PDF Report
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
                            Add PDL Visitation Status
                    </button>
                </div>
            </div>
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
            <Modal
                title="PDL Visitation Status Report"
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
                title="Add PDL Visitation Status"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="30%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
                <AddPDLVisitationStatus
                    onClose={handleCancel}
                    onAdded={() => setPagination({ current: 1, pageSize: pagination.pageSize })}
                    />
            </Modal>
            <Modal
                title="Edit PDL Visitation Status"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Form.Item
                    name="name"
                    label="PDL Visitation Status Name"
                    rules={[{ required: true, message: "Please input the PDL Visitation Status name" }]}
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

export default PDLVisitationStatus
