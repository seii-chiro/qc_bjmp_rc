import { deleteIssue_Category, getOrganization, getUser, PaginatedResponse, patchIssue_Category } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import moment from "moment";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import AddIssueCategory from "./AddIssueCategory";
import bjmp from '../../../../assets/Logo/QCJMD.png'
import { getIssueCategory } from "@/lib/query";
import { BASE_URL } from "@/lib/urls";

type IssueCategory = {
    id: number;
    updated_by: string;
    updated_at: string; 
    name: string;
    description: string;
    categorization_rule: string;
};

const IssueCategory = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectIssueCategory, setSelctedIssueCategory] = useState<IssueCategory | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const fetchIssueCategory = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/issues_v2/issue-categories/?search=${search}`, {
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
        queryKey: ["category", debouncedSearch],
        queryFn: () => fetchIssueCategory(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "category",
            "category-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<IssueCategory>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/issues_v2/issue-categories/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Issue Category data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const { data: OrganizationData } = useQuery({
        queryKey: ['organization'],
        queryFn: () => getOrganization(token ?? "")
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
            queryClient.invalidateQueries({ queryKey: ["category"] });
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
    queryClient.invalidateQueries({ queryKey: ["category"] });
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

    const dataSource = data?.results?.map((issue_category, index) => (
        {
            key: index + 1,
            id: issue_category?.id,
            name: issue_category?.name ?? '',
            description: issue_category?.description ?? '',
            categorization_rule: issue_category?.categorization_rule,
            updated_at: issue_category?.updated_at ?? '',
            updated_by: issue_category?.updated_by ?? '',
        }
    )) || [];

    const columns: ColumnsType<IssueCategory> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
            width: 100,
        },
        {
            title: 'Issue Category',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Categorization Rule',
            dataIndex: 'categorization_rule',
            key: 'categorization_rule',
            sorter: (a, b) => a.categorization_rule.localeCompare(b.categorization_rule),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
        },
        // {
        //     title: "Updated At",
        //     dataIndex: "updated_at",
        //     key: "updated_at",
        //     render: (value) => moment(value).format("MMMM D, YYYY h:mm A"),
        //     sorter: (a, b) => moment(a.updated_at).diff(moment(b.updated_at)),
        // },
        // {
        //     title: 'Updated By',
        //     dataIndex: 'updated_by',
        //     key: 'updated_by',
        //     sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
        // },
        {
            title: "Action",
            key: "action",
            fixed: 'right',
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
    const fetchAllIssueCategory = async () => {
        const res = await fetch(`${BASE_URL}/api/issues_v2/issue-categories/?limit=1000`, {
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
            const PreparedBy = `${UserData?.first_name ?? ''} ${UserData.last_name ?? ''}`;

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 11; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllIssueCategory();
            } else {
                allData = await fetchIssueCategory(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((issue_category, index) => ({
                key: index + 1,
                id: issue_category?.id,
                name: issue_category?.name ?? '',
                categorization_rule: issue_category?.categorization_rule ?? '',
                description: issue_category?.description ?? '',
                updated_at: issue_category?.updated_at ?? '',
                updated_by: issue_category?.updated_by ?? '',
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
            const tableData = printSource.map((item, idx) => [
                idx + 1,
                item.name || '',
                item.description || '',
                item.categorization_rule || ''
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Issue Category', 'Categorization Rule', 'Description']],
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
                allData = await fetchAllIssueCategory();
            } else {
                allData = await fetchIssueCategory(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((issue_category, index) => ({
                key: index + 1,
                id: issue_category?.id,
                name: issue_category?.name ?? '',
                categorization_rule: issue_category?.categorization_rule,
                description: issue_category?.description ?? '',
                updated_at: issue_category?.updated_at ?? '',
                updated_by: issue_category?.updated_by ?? '',
            }));
        
        const exportData = printSource.map((category, index) => {
            return {
                "No.": index + 1,
                "Issue Category": category?.name,
                "Categorization": category?.categorization_rules,
                "Description": category?.description,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "IssueCategory");
        XLSX.writeFile(wb, "IssueCategory.xlsx");
    };

        const handleExportCSV = async () => {
        try {

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllIssueCategory();
            } else {
                allData = await fetchIssueCategory(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((issue_category, index) => ({
                key: index + 1,
                id: issue_category?.id,
                name: issue_category?.name ?? '',
                categorization_rule: issue_category?.categorization_rule,
                description: issue_category?.description ?? '',
                updated_at: issue_category?.updated_at ?? '',
                updated_by: issue_category?.updated_by ?? '',
            }));
        
        const exportData = printSource.map((category, index) => {
            return {
                "No.": index + 1,
                "Issue Category": category?.name,
                "Categorization": category?.categorization_rules,
                "Description": category?.description,
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
            link.setAttribute("download", "IssueCategory.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
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

    const mapIssueCategory = ((issue_category, index) => (
        {
            key: index + 1,
            id: issue_category?.id,
            name: issue_category?.name ?? '',
            description: issue_category?.description ?? '',
            categorization_rule: issue_category?.categorization_rule,
            updated_at: issue_category?.updated_at ?? '',
            updated_by: issue_category?.updated_by ?? '',
        }
    ));
    return (
        <div>
        {contextHolder}
        <h1 className="text-3xl font-bold text-[#1E365D]">Issue Category</h1>
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
                    onClick={showModal}
                        >
                    <GoPlus />
                        Add Issue Category
                </button>
            </div>
        </div>
        <Table
            className="overflow-x-auto"
            loading={isFetching || searchLoading}
            columns={columns}
                dataSource={debouncedSearch
                        ? (searchData?.results || []).map(mapIssueCategory)
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
                width="40%"
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Form.Item
                    name="name"
                    label="Issue Type Name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="categorization_rule"
                    label="Categorization Rule"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
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
                width="40%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
            <AddIssueCategory onClose={handleCancel} />
            </Modal>
        </div>
    )
}

export default IssueCategory
