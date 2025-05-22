import { deleteIssue_Category, getIssueCategories, getUser, patchIssue_Category } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import moment from "moment";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import AddIssueCategory from "./AddIssueCategory";
import bjmp from '../../../../assets/Logo/QCJMD.png'

type IssueCategory = {
    id: number;
    updated_by: string;
    updated_at: string; 
    name: string;
    description: string;
};

const IssueCategory = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectIssueCategory, setSelctedIssueCategory] = useState<IssueCategory | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data } = useQuery({
        queryKey: ['issue-categories'],
        queryFn: () => getIssueCategories(token ?? ""),
    })
    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteIssue_Category(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["issue-categories"] });
            messageApi.success("Issue Category deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Issue Category");
        },
    });

const { mutate: editIssueCategory, isLoading: isUpdating } = useMutation({
    mutationFn: (updated: IssueCategory) =>
    patchIssue_Category(token ?? "", updated.id, updated),
    onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["issue-categories"] });
    messageApi.success("Issue Category updated successfully");
    setIsEditModalOpen(false);
    },
    onError: () => {
    messageApi.error("Failed to update Issue Category");
    },
});

const handleEdit = (record: IssueCategory) => {
    setSelctedIssueCategory(record);
    form.setFieldsValue(record);
    setIsEditModalOpen(true);
};

const handleUpdate = (values: any) => {
    if (selectIssueCategory && selectIssueCategory.id) {
    const updatedRisk: IssueCategory = {
        ...selectIssueCategory,
        ...values,
    };
    editIssueCategory(updatedRisk);
    } else {
    messageApi.error("Selected Issue Type is invalid");
    }
};

    const dataSource = data?.results?.map((issue_category) => (
        {
            key: issue_category?.id,
            id: issue_category?.id,
            name: issue_category?.name ?? 'N/A',
            description: issue_category?.description ?? 'N/A',
            updated_at: issue_category?.updated_at ?? 'N/A',
            updated_by: issue_category?.updated_by ?? 'N/A',
            organization: issue_category?.organization ?? 'Bureau of Jail Management and Penology',
            updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
        }
    )) || [];

    const filteredData = dataSource?.filter((issue_category) =>
        Object.values(issue_category).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<IssueCategory> = [
         {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) =>
                (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Issue Category',
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
            title: "Updated At",
            dataIndex: "updated_at",
            key: "updated_at",
            render: (value) => moment(value).format("MMMM D, YYYY h:mm A"),
            sorter: (a, b) => moment(a.updated_at).diff(moment(b.updated_at)),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => moment(item.updated_at).format("MMMM D, YYYY h:mm A")))
                ).map(dateTime => ({
                    text: dateTime,
                    value: dateTime,
                }))
            ],
            onFilter: (value, record) =>
                moment(record.updated_at).format("MMMM D, YYYY h:mm A") === value,
        },
        {
            title: 'Updated By',
            dataIndex: 'updated_by',
            key: 'updated_by',
            sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.updated_by))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.updated_by === value,
        },
        
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div>
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
        XLSX.utils.book_append_sheet(wb, ws, "IssueCategory");
        XLSX.writeFile(wb, "IssueCategory.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const headerHeight = 48;
        const footerHeight = 32;
        const organizationName = dataSource[0]?.organization || ""; 
        const PreparedBy = dataSource[0]?.updated || ''; 
    
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;
    
        const maxRowsPerPage = 29; 
    
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
            doc.text("Issue Category Report", 10, 15); 
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
                head: [['No.', 'Issue Category', 'Description']],
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

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
    };
    const menu = (
        <Menu>
            <Menu.Item>
                <a onClick={handleExportExcel}>Export Excel</a>
            </Menu.Item>
            <Menu.Item>
                <CSVLink data={dataSource} filename="IssueCategory.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
        {contextHolder}
        <h1 className="text-3xl font-bold text-[#1E365D]">Issue Category</h1>
        <div className="flex items-center justify-between my-4">
        <div className="flex gap-2">
                        <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                            <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                                <GoDownload /> Export
                            </a>
                        </Dropdown>
                        <button className="bg-[#1E365D] py-2 px-5 rounded-md text-white" onClick={handleExportPDF}>
                            Print Report
                        </button>
                    </div>
            <div className="flex gap-2 items-center">
                <Input
                    placeholder="Search Issue Category..."
                    value={searchText}
                    className="py-2 md:w-64 w-full"
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button
                    className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center justify-center"
                    onClick={showModal}
                        >
                    <GoPlus />
                        Add Issue Category
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
                title="Issue Category Report"
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
                title="Edit Issue Category"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Form.Item
                    name="name"
                    label="Issue Type Name"
                    rules={[{ required: true, message: "Please input the issue type name" }]}
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
                title="Add Issue Category"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="30%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
            <AddIssueCategory onClose={handleCancel} />
            </Modal>
        </div>
    )
}

export default IssueCategory
