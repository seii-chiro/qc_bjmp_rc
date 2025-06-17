import { getRank, deleteRank, getUser, getOrganization, PaginatedResponse, updateRank } from "@/lib/queries"
import { useTokenStore } from "@/store/useTokenStore"
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select, Table } from "antd"
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import AddRank from "./AddRank";
import EditRank from "./EditRank";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { BASE_URL } from "@/lib/urls";

type Rank = {
    id: number;
    organization: number;
    rank_code: string;
    rank_name: string;
    category: string | null;
    class_level: number;
};

const Rank = () => {
const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const token = useTokenStore().token;
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [rank, setRank] = useState<Rank | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })
    
    const { data: OrganizationData } = useQuery({
        queryKey: ['organization'],
        queryFn: () => getOrganization(token ?? "")
    })
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteRank(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rank"] });
            messageApi.success("Rank deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Rank");
        },
    });

    const fetchRank = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/codes/ranks/?search=${search}`, {
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

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ["rank", debouncedSearch],
        queryFn: () => fetchRank(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "rank",
            "rank-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<Rank>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/codes/ranks/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Rank data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const { mutate: editRank, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: Rank) =>
            updateRank(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rank"] });
            messageApi.success("Rank updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Rank");
        },
    });

    const handleEdit = (record: Rank) => {
        setRank(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (rank && rank.id) {
            const updatedRank: Rank = {
                ...rank,
                ...values,
            };
            editRank(updatedRank);
        } else {
            messageApi.error("Selected Rank is invalid");
        }
    };

    const dataSource = data?.results?.map((rank) => ({
        id: rank?.id,
        organization: rank?.organization ?? '',
        rank_code: rank?.rank_code ?? '',
        rank_name: rank?.rank_name ?? '',
        category: rank?.category ?? '',
        class_level: rank?.class_level ?? '',
    })) || [];

    const columns: ColumnsType<Rank> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Rank Code',
            dataIndex: 'rank_code',
            key: 'rank_code',
            sorter: (a, b) => a.rank_code.localeCompare(b.rank_code),
        },
        {
            title: 'Rank Name',
            dataIndex: 'rank_name',
            key: 'rank_name',
            sorter: (a, b) => a.rank_name.localeCompare(b.rank_name),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => a.category.localeCompare(b.category),
        },
        {
            title: 'Class Level',
            dataIndex: 'class_level',
            key: 'class_level',
            sorter: (a, b) => a.class_level - b.class_level,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: 'right',
            render: (_: any, record: Rank) => (
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

    const fetchAllRank = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/ranks/?limit=1000`, {
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
                allData = await fetchAllRank();
            } else {
                allData = await fetchRank(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((rank, index) => ({
                key: index + 1,
                id: rank?.id,
                organization: rank?.organization ?? '',
                rank_code: rank?.rank_code ?? '',
                rank_name: rank?.rank_name ?? '',
                category: rank?.category ?? '',
                class_level: rank?.class_level ?? '',
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
                doc.text("Rank Report", 10, 15); 
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
                item.rank_code || '',
                item.rank_name || '',
                item.category || '',
                item.class_level || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Code', 'Rank', 'Category', 'Class Level']],
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
                allData = await fetchAllRank();
            } else {
                allData = await fetchRank(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((rank, index) => ({
                key: index + 1,
                id: rank?.id,
                organization: rank?.organization ?? '',
                rank_code: rank?.rank_code ?? '',
                rank_name: rank?.rank_name ?? '',
                category: rank?.category ?? '',
                class_level: rank?.class_level ?? '',
            }));

        const exportData = printSource.map((status, index) => {
            return {
                "No.": index + 1,
                "Rank Code": status?.rank_code,
                "Rank Name": status?.rank_name,
                "Category": status?.category,
                "Class Level": status?.class_level,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rank");
        XLSX.writeFile(wb, "Rank.xlsx");
    };
        const handleExportCSV = async () => {
        try {

        let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllRank();
            } else {
                allData = await fetchRank(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((rank, index) => ({
                key: index + 1,
                id: rank?.id,
                organization: rank?.organization ?? '',
                rank_code: rank?.rank_code ?? '',
                rank_name: rank?.rank_name ?? '',
                category: rank?.category ?? '',
                class_level: rank?.class_level ?? '',
            }));

        const exportData = printSource.map((status, index) => {
            return {
                "No.": index + 1,
                "Rank Code": status?.rank_code,
                "Rank Name": status?.rank_name,
                "Category": status?.category,
                "Class Level": status?.class_level,
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
            link.setAttribute("download", "Rank.csv");
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

    const mapRank = (rank, index) => ({
            key: index + 1,
            id: rank?.id,
            organization: rank?.organization ?? '',
            rank_code: rank?.rank_code ?? '',
            rank_name: rank?.rank_name ?? '',
            category: rank?.category ?? '',
            class_level: rank?.class_level ?? '',
    });


    const results = useQueries({
        queries: [
            {
                queryKey: ['organization'],
                queryFn: () => getOrganization(token ?? "")
            },
        ]
    });

    const organizationData = results[0].data;

    const onOrganizationChange = (value: number) => {
        setRankForm(prevForm => ({
            ...prevForm,
            organization_id: value
        }));
    };
    const onRankCategoryChange = (value: string) => {
        setRank(prevForm => ({
            ...prevForm,
            category: value
        }));
    };

    const rankCategories = [
        { value: 'Civilian', label: 'Civilian' },
        { value: 'Non-Commissioned', label: 'Non-Commissioned' },
        { value: 'Commissioned', label: 'Commissioned' },
        { value: 'Executive', label: 'Executive' },
    ];
    return (
        <div className="h-screen">
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Ranks</h1>
            <div className="w-full bg-white">
                <div className="my-4 flex justify-between gap-2">
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

                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative flex items-center">
                            <input
                                placeholder="Search"
                                type="text"
                                onChange={(e) => setSearchText(e.target.value)}
                                className="border border-gray-400 h-10 w-96 rounded-md px-2 active:outline-none focus:outline-none"
                            />
                            <LuSearch className="absolute right-[1%] text-gray-400" />
                        </div>
                        <button
                            className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center justify-center"
                            onClick={showModal}
                        >
                            <GoPlus />
                            Add Rank
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto overflow-y-auto h-full">
                <Table
                className="overflow-x-auto"
                loading={isFetching || searchLoading}
                columns={columns}
                    dataSource={debouncedSearch
                            ? (searchData?.results || []).map(mapRank)
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
                </div>
            </div>
            <Modal
                title="Rank Report"
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
                title="Add Rank"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="25%"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
                <AddRank onClose={handleCancel} />
            </Modal>
            <Modal
                title="Edit Rank"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                    label="Organization"
                    name="organization"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Organization"
                        optionFilterProp="label"
                        onChange={onOrganizationChange}
                        options={organizationData?.results?.map(organization => ({
                            value: organization.id,
                            label: organization?.org_name
                        }))}/>
                </Form.Item>
                <Form.Item
                    label="Rank Code"
                    name="rank_code"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Rank Name"
                    name="rank_name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Rank Category"
                    name="category"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Rank Category"
                        onChange={onRankCategoryChange}
                        options={rankCategories}
                    />
                </Form.Item>
                <Form.Item
                    label="Class Level"
                    name="class_level"
                >
                    <Input type="number" />
                </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Rank;