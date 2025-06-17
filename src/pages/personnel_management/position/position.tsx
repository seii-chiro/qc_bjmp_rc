import { getPosition, deletePosition, getUser, updatePosition, getRank, getOrganization, PaginatedResponse } from "@/lib/queries"
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
import AddPosition from "./AddPosition";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { BASE_URL } from "@/lib/urls";

type Position = {
    key: number | null;
    id: number;
    position_code: string;
    position_title: string;
    position_level: string;
    position_type: string;
    rank_required: number;
    organization: number;
    is_active: boolean;
};

const Position = () => {
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
    const [position, setPosition] = useState<Position | null>(null);
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

    const fetchPosition = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/codes/positions/?search=${search}`, {
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
        queryKey: ["position", debouncedSearch],
        queryFn: () => fetchPosition(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "position",
            "position-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<Position>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/codes/positions/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Position data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePosition(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["position"] });
            messageApi.success("Position deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Position");
        },
    });

    const showModal = () => {
        setIsModalOpen(true);
        };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const { mutate: editPosition, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: Position) =>
            updatePosition(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["position"] });
            messageApi.success("Position updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Position");
        },
    });

    const handleEdit = (record: Position) => {
        setPosition(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (position && position.id) {
            const updatedPosition: Position = {
                ...position,
                ...values,
            };
            editPosition(updatedPosition);
        } else {
            messageApi.error("Selected Position is invalid");
        }
    };

    const dataSource = data?.results?.map((position, index) => (
        {
            key: index + 1,
            id: position?.id,
            organization: position?.organization ,
            position_code: position?.position_code ?? '',
            position_title: position?.position_title ?? '',
            position_level: position?.position_level ?? '',
            position_type: position?.position_type ?? '',
            is_active: position?.is_active ?? '',
        }
    )) || [];

    const columns: ColumnsType<Position> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Position Code',
            dataIndex: 'position_code',
            key: 'position_code',
            sorter: (a, b) => a.position_code.localeCompare(b.position_code),
        },
        {
            title: 'Position Title',
            dataIndex: 'position_title',
            key: 'position_title',
            sorter: (a, b) => a.position_title.localeCompare(b.position_title),
        },
        {
            title: 'Position Level',
            dataIndex: 'position_level',
            key: 'position_level',
            sorter: (a, b) => a.position_level.localeCompare(b.position_level),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.position_level))
            //     ).map(position_level => ({
            //         text: position_level,
            //         value: position_level,
            //     }))
            // ],
            // onFilter: (value, record) => record.position_level === value,
        },
        {
            title: 'Position Type',
            dataIndex: 'position_type',
            key: 'position_type',
            sorter: (a, b) => a.position_type.localeCompare(b.position_type),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.position_type))
            //     ).map(position_type => ({
            //         text: position_type,
            //         value: position_type,
            //     }))
            // ],
            // onFilter: (value, record) => record.position_type === value,
        },
        {
        },
        {
            title: "Actions",
            key: "actions",
            fixed: 'right',
            render: (_: any, record: Position) => (
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

    const fetchAllPosition = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/positions/?limit=1000`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return await res.json();
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
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
                allData = await fetchAllPosition();
            } else {
                allData = await fetchPosition(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((position, index) => ({
                key: index + 1,
                id: position?.id,
                position_code: position?.position_code ?? '',
                position_title: position?.position_title ?? '',
                position_level: position?.position_level ?? '',
                position_type: position?.position_type ?? '',
                is_active: position?.is_active ?? '',
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
                doc.text("Position Report", 10, 15); 
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
                item.position_code || '',
                item.position_title || '',
                item.position_level || '',
                item.position_type || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Code', 'Position', 'Level', 'Position Type']],
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
                allData = await fetchAllPosition();
            } else {
                allData = await fetchPosition(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((position, index) => ({
                key: index + 1,
                id: position?.id,
                position_code: position?.position_code ?? '',
                position_title: position?.position_title ?? '',
                position_level: position?.position_level ?? '',
                position_type: position?.position_type ?? '',
                is_active: position?.is_active ?? '',
            }));

        const exportData = printSource.map((position, index) => {
            return {
                "No.": index + 1,
                "Position Code": position?.position_code,
                "Position": position?.position_title,
                "Position Level": position?.position_level,
                "Position Type": position?.position_type,
                "Is Active": position?.is_active,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PersonnelPosition");
        XLSX.writeFile(wb, "PersonnelPosition.xlsx");
    };

    const handleExportCSV = async () => {
        try {
        let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPosition();
            } else {
                allData = await fetchPosition(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((position, index) => ({
                key: index + 1,
                id: position?.id,
                position_code: position?.position_code ?? '',
                position_title: position?.position_title ?? '',
                position_level: position?.position_level ?? '',
                position_type: position?.position_type ?? '',
                is_active: position?.is_active ?? '',
            }));

        const exportData = printSource.map((position, index) => {
            return {
                "No.": index + 1,
                "Position Code": position?.position_code,
                "Position": position?.position_title,
                "Position Level": position?.position_level,
                "Position Type": position?.position_type,
                "Is Active": position?.is_active,
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
            link.setAttribute("download", "PersonnelPosition.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

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
        setPosition(prevForm => ({
            ...prevForm,
            organization_id: value
        }));
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

    const mapPosition = (position, index) => ({
            key: index + 1,
            id: position?.id,
            position_code: position?.position_code ?? '',
            position_title: position?.position_title ?? '',
            position_level: position?.position_level ?? '',
            position_type: position?.position_type ?? '',
            is_active: position?.is_active ?? '',
    });

    return (
        <div>
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Position</h1>
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
                            value={searchText}
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
                        Add Position
                    </button>
                    </div>
                    
                </div>
                <div className="overflow-x-auto overflow-y-auto h-full">
                    <Table
                        className="overflow-x-auto"
                        loading={isFetching || searchLoading}
                        columns={columns}
                            dataSource={debouncedSearch
                                    ? (searchData?.results || []).map(mapPosition)
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
                title="Position Report"
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
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                style={{  overflowY: "auto" }} 
                width="40%"
            >
            <AddPosition onClose={handleCancel} />
            </Modal>
            <Modal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width="40%"
            >
                <h1 className="font-bold text-lg mb-2">Edit Position</h1>
                <h2 className="font-semibold text-lg">Organization</h2>
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                    name="organization"
                >
                    <Select 
                        className="h-[3rem] w-full text-sm font-medium"
                        showSearch
                        placeholder="Organization"
                        optionFilterProp="label"
                        onChange={onOrganizationChange}
                        options={organizationData?.results?.map(organization => (
                            {
                                value: organization.id,
                                label: organization?.org_name
                            }
                        ))}/>
                </Form.Item>
                <h2 className="font-semibold text-lg">Position Code</h2>
                    <Form.Item
                    name="position_code"
                >
                    <Input className="h-[3rem] w-full text-sm font-medium"/>
                </Form.Item>
                <h2 className="font-semibold text-lg">Position</h2>
                <Form.Item
                    name="position_title"
                >
                    <Input className="h-[3rem] w-full text-sm font-medium"/>
                </Form.Item>
                <h2 className="font-semibold text-lg">Position Level</h2>
                <Form.Item
                    name="position_level"
                >
                    <Input className="h-[3rem] w-full text-sm font-medium"/>
                </Form.Item>
                <h2 className="font-semibold text-lg">Position Type</h2>
                <Form.Item
                    name="position_type"
                >
                    <Input className="h-[3rem] w-full text-sm font-medium"/>
                </Form.Item>
                
                </Form>
            </Modal>
        </div>
    )
}

export default Position
