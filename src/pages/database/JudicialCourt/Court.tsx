import { Button, Col, Dropdown, Form, Input, Menu, message, Modal, Row, Table } from "antd"
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { GoDownload, GoPlus } from "react-icons/go";
import AddCourt from "./AddCourt";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCourt, getCourt, getOrganization, getUser, PaginatedResponse } from "@/lib/queries";
import { patchCourt } from "@/lib/query";
import moment from "moment";
import { ColumnType } from "antd/es/table";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { BASE_URL } from "@/lib/urls";
import AddCourtBranch from "./AddCourtBranch";
import EditCourtBranch from "./EditCourtBranch";
import SeeMoreLess from "./SeeMoreLess";

type EditCourt = {
    id: number;
    created_by: string;
    updated_by: string;
    record_status: string;
    created_at: string; // Use Date if necessary
    updated_at: string; // Use Date if necessary
    court: string;
    description: string;
    code: string;
    jurisdiction: string;
    example_offenses: string;
    relevance_to_pdl: string;
    court_level: string;
};

type CourtBranch = {
    id: number;
    court: string;
    region: string;
    province: string;
    branch: string;
    judge: string;
    // add other fields if needed
};

const Court = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [isModalBranchOpen, setIsModalBranchOpen] = useState(false);
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [editBranchModal, setEditBranchModal] = useState<{ open: boolean, branch: CourtBranch | null }>({ open: false, branch: null });
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
    const [selectedCourtName, setSelectedCourtName] = useState<string>("");
    const [courtBranches, setCourtBranches] = useState<CourtBranch[]>([]);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [selectEditCourt, setSelectedEditCourt] = useState<EditCourt>({
        id: 0, 
        created_by: '', 
        updated_by: '', 
        record_status: '', 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        court: '',
        description: '',
        code: '',
        jurisdiction: '',
        example_offenses: '',
        relevance_to_pdl: '',
        court_level: '',
    })
    
    const fetchJudicialCourt = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/standards/court/?search=${search}`, {
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
        queryKey: ["court", debouncedSearch],
        queryFn: () => fetchJudicialCourt(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "court",
            "court-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<EditCourt>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/standards/court/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Court data.");
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

    const handleCancel = () => {
        setIsModalOpen(false);
        setIsModalBranchOpen(false);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
    };
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteCourt(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["court"] });
            messageApi.success("Court deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Court");
        },
    });

    const { mutate: editCourt, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: EditCourt) =>
            patchCourt(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["court"] });
            messageApi.success("Court updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Court");
        },
    });

    const handleUpdate = (values: any) => {
        if (selectEditCourt && selectEditCourt.id) {
            const updateCourt: EditCourt = {
                ...selectEditCourt,
                ...values,
            };
            editCourt(updateCourt);
        } else {
            messageApi.error("Selected Court is invalid");
        }
    };
    const dataSource = data?.results?.map((court) => (
        {
            id: court?.id,
            code: court?.code ?? '',
            court: court?.court ?? '',
            jurisdiction: court?.jurisdiction ?? '',
            example_offenses: court?.example_offenses ?? '',
            relevance_to_pdl: court?.relevance_to_pdl ?? '',
            court_level: court?.court_level ?? '',
            description: court?.description ?? '',
            updated_by: court?.updated_by ?? '',
            updated_at: moment(court?.updated_at).format('YYYY-MM-DD h:mm A') ?? '', 
        }
    )) || [];

    const columns: ColumnType<EditCourt> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: 'Court',
            dataIndex: 'court',
            key: 'court',
            sorter: (a, b) => a.court.localeCompare(b.court),
        },
        {
            title: 'Jurisdiction',
            dataIndex: 'jurisdiction',
            key: 'jurisdiction',
            sorter: (a, b) => a.jurisdiction.localeCompare(b.jurisdiction),
            render: (text: string) => <SeeMoreLess text={text} maxLength={80} />,
        },
        {
            title: 'Example Offenses',
            dataIndex: 'example_offenses',
            key: 'example_offenses',
            sorter: (a, b) => a.example_offenses.localeCompare(b.example_offenses),
            render: (text: string) => <SeeMoreLess text={text} maxLength={80} />,
        },
        {
            title: 'Relevance to PDL',
            dataIndex: 'relevance_to_pdl',
            key: 'relevance_to_pdl',
            sorter: (a, b) => a.relevance_to_pdl.localeCompare(b.relevance_to_pdl),
            render: (text: string) => <SeeMoreLess text={text} maxLength={80} />,
        },
        {
            title: 'Court Level',
            dataIndex: 'court_level',
            key: 'court_level',
            sorter: (a, b) => a.court_level.localeCompare(b.court_level),
            render: (text: string) => <SeeMoreLess text={text} maxLength={80} />,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            render: (text: string) => <SeeMoreLess text={text} maxLength={80} />,
        },
        {
            title: "Updated At",
            dataIndex: "updated_at",
            key: "updated_at",
            sorter: (a, b) => moment(a.updated_at).diff(moment(b.updated_at)),
        },
        {
            title: 'Updated By',
            dataIndex: 'updated_by',
            key: 'updated_by',
            sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            fixed: "right",
            render: (_: any, record: EditCourt) => (
                <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
                        <Button type="link" onClick={() => handleEdit(record)}>
                            <AiOutlineEdit />
                        </Button>
                <Button type="link" danger onClick={() => deleteMutation.mutate(record.id)}>
                    <AiOutlineDelete />
                </Button>
                </div>
            ),
        },
    ]

    useEffect(() => {
        if (isEditModalOpen && selectEditCourt.court) {
            fetch(`${BASE_URL}/api/standards/court-branch/?limit=1000`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch court branches");
                    return res.json();
                })
                .then(json => {
                    const filtered = (json.results || []).filter(
                        b => b.court?.toLowerCase() === selectEditCourt.court.toLowerCase()
                    );
                    setCourtBranches(filtered);
                })
                .catch(err => {
                    setCourtBranches([]);
                    console.error(err);
                });
        }
    }, [isEditModalOpen, selectEditCourt.court, token]);

    const handleEdit = (record: EditCourt) => {
        setSelectedEditCourt(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const refreshBranches = (courtName?: string) => {
        const name = courtName || selectEditCourt.court;
        if (name) {
            fetch(`${BASE_URL}/api/standards/court-branch/?limit=1000`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            })
                .then(res => res.json())
                .then(json => {
                    const filtered = (json.results || []).filter(
                        b => b.court?.toLowerCase() === name.toLowerCase()
                    );
                    setCourtBranches(filtered);
                });
        }
    };

    const handleRemoveBranch = (index: number) => {
        const branch = courtBranches[index];
        if (!branch || !branch.id) return;
        Modal.confirm({
            title: "Are you sure you want to remove this branch?",
            onOk: async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/standards/court-branch/${branch.id}/`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    });
                    if (!res.ok) throw new Error("Failed to delete branch");
                    setCourtBranches(prev => prev.filter((_, i) => i !== index));
                    message.success("Branch removed successfully");
                } catch (err) {
                    message.error("Failed to remove branch");
                }
            },
        });
    };
    const column = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Court',
            dataIndex: 'court',
            key: 'court',
        },
        {
            title: 'Region',
            dataIndex: 'region',
            key: 'region',
        },
        {
            title: 'Province',
            dataIndex: 'province',
            key: 'province',
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
        },
        {
            title: "Judge's Name",
            dataIndex: 'judge',
            key: 'judge',
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, __: any, index: number) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        ghost
                        onClick={() => setEditBranchModal({ open: true, branch: courtBranches[index] })}
                    >
                        <AiOutlineEdit />
                    </Button>
                    <Button danger onClick={() => handleRemoveBranch(index)}>
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        }
    ];

    const fetchAllCourt = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/court/?limit=1000`, {
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
            const PreparedBy = `${UserData?.first_name || ''} ${UserData?.last_name || ''}` || "";

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 14; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllCourt();
            } else {
                allData = await fetchJudicialCourt(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((court, index) => ({
                key: index + 1,
                id: court?.id,
                code: court?.code ?? '',
                court: court?.court ?? '',
                jurisdiction: court?.jurisdiction ?? '',
                example_offenses: court?.example_offenses ?? '',
                relevance_to_pdl: court?.relevance_to_pdl ?? '',
                court_level: court?.court_level ?? '',
                description: court?.description ?? '',
                updated_by: court?.updated_by ?? '',
                updated_at: moment(court?.updated_at).format('YYYY-MM-DD h:mm A') ?? '', 
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
                doc.text("Court Report", 10, 15); 
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
                item.code || '',
                item.court || '',
                item.jurisdiction || '',
                item.description || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Code', 'Court', 'Jurisdiction', 'Description']],
                    body: pageData,
                    startY: startY,
                    margin: { top: 0, left: 10, right: 10 },
                    styles: {
                        fontSize: 8,
                    },
                    columnStyles: {
                        3: { cellWidth: 100 },
                        4: { cellWidth: 100 },
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
                allData = await fetchAllCourt();
            } else {
                allData = await fetchJudicialCourt(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((court, index) => ({
            key: index + 1,
            id: court?.id,
            code: court?.code ?? '',
            court: court?.court ?? '',
            jurisdiction: court?.jurisdiction ?? '',
            example_offenses: court?.example_offenses ?? '',
            relevance_to_pdl: court?.relevance_to_pdl ?? '',
            court_level: court?.court_level ?? '',
            description: court?.description ?? '',
            updated_by: court?.updated_by ?? '',
            updated_at: moment(court?.updated_at).format('YYYY-MM-DD h:mm A') ?? '', 
            }));

        const exportData = printSource.map((court, index) => {
            return {
                "No.": index + 1,
                "Code": court?.code,
                "Court": court?.court,
                "Jurisdiction": court?.jurisdiction,
                "Example Offenses": court?.example_offenses,
                "Relevance to PDL": court?.relevance_to_pdl,
                "Court Level": court?.court_level,
                "Description": court?.description,
                "Updated At": court?.updated_at,
                "Updated By": court?.updated_by,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "JudicialCourt");
        XLSX.writeFile(wb, "JudicialCourt.xlsx");
    };

    const handleExportCSV = async () => {
        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllCourt();
            } else {
                allData = await fetchJudicialCourt(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((court, index) => ({
            key: index + 1,
            id: court?.id,
            code: court?.code ?? '',
            court: court?.court ?? '',
            jurisdiction: court?.jurisdiction ?? '',
            example_offenses: court?.example_offenses ?? '',
            relevance_to_pdl: court?.relevance_to_pdl ?? '',
            court_level: court?.court_level ?? '',
            description: court?.description ?? '',
            updated_by: court?.updated_by ?? '',
            updated_at: moment(court?.updated_at).format('YYYY-MM-DD h:mm A') ?? '', 
            }));

            const exportData = printSource.map((court, index) => {
                return {
                    "No.": index + 1,
                    "Code": court?.code,
                    "Court": court?.court,
                    "Jurisdiction": court?.jurisdiction,
                    "Example Offenses": court?.example_offenses,
                    "Relevance to PDL": court?.relevance_to_pdl,
                    "Court Level": court?.court_level,
                    "Description": court?.description,
                    "Updated At": court?.updated_at,
                    "Updated By": court?.updated_by,
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
            link.setAttribute("download", "JudicialCourt.csv");
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

    const mapCourt = (court, index) => ({
            key: index + 1,
            id: court?.id,
            code: court?.code ?? '',
            court: court?.court ?? '',
            jurisdiction: court?.jurisdiction ?? '',
            example_offenses: court?.example_offenses ?? '',
            relevance_to_pdl: court?.relevance_to_pdl ?? '',
            court_level: court?.court_level ?? '',
            description: court?.description ?? '',
            updated_by: court?.updated_by ?? '',
            updated_at: moment(court?.updated_at).format('YYYY-MM-DD h:mm A') ?? '', 
    });
    return (
        <div>
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Judicial Court</h1>
            <div className="flex justify-between items-center gap-2 my-4">
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
                    <button type="button" className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center justify-center" onClick={showModal}>
                        <GoPlus />
                        Add Judicial Court
                    </button>
                </div>
            </div>
            <Table
                className="overflow-x-auto"
                loading={isFetching || searchLoading}
                columns={columns}
                    dataSource={debouncedSearch
                            ? (searchData?.results || []).map(mapCourt)
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
                title="Judicial Court Report"
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
                width="60%"
                >
                <AddCourt onClose={handleCancel}/>
            </Modal>
            <Modal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width="60%"
                footer={[
                    <Button 
                        key="cancel" 
                        onClick={() => setIsEditModalOpen(false)} 
                        className="bg-white border border-[#1e365d] text-[#1e365d] px-3 py-2 rounded-md"
                    >
                        Cancel
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        onClick={() => form.submit()} 
                        className="bg-[#1E365D] text-white px-3 py-2 rounded-md"
                    >
                        Submit
                    </Button>,
                ]}
            >
                <h1 className="text-[#1E365D] font-bold text-lg mb-4">Edit Judicial Court</h1>
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <h1 className="text-[#1E365D] font-bold text-base mb-1">Code:</h1>
                            <Form.Item name="code">
                                <Input className="h-[3rem] border-gray-300 rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <h1 className="text-[#1E365D] font-bold text-base mb-1">Judicial Court Name:</h1>
                            <Form.Item name="court">
                                <Input className="h-[3rem] border-gray-300 rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <h1 className="text-[#1E365D] font-bold text-base mb-1">Court Level:</h1>
                            <Form.Item name="court_level" label="">
                                <Input className="h-[3rem] border-gray-300 rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <h1 className="text-[#1E365D] font-bold text-base mb-1">Jurisdiction:</h1>
                            <Form.Item name="jurisdiction">
                                <Input className="h-[3rem] border-gray-300 rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <h1 className="text-[#1E365D] font-bold text-base mb-1">Example Offenses:</h1>
                            <Form.Item name="example_offenses">
                                <Input className="h-[3rem] border-gray-300 rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <h1 className="text-[#1E365D] font-bold text-base mb-1">Relevance to PDL:</h1>
                            <Form.Item name="relevance_to_pdl" label="">
                                <Input className="h-[3rem] border-gray-300 rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <h1 className="text-[#1E365D] font-bold text-base mb-1">Description:</h1>
                            <Form.Item name="description">
                                <Input.TextArea className="h-[2rem] border-gray-300 rounded-lg" rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row className="flex justify-between items-center">
                        <Col span={12}>
                            <h1 className="text-[#1E365D] font-bold text-lg">Edit Judicial Court Branch</h1>
                        </Col>
                        <Col span={12} className="flex justify-end">
                            <Button
                                type="primary"
                                onClick={() => {
                                    setSelectedCourtId(selectEditCourt.id);
                                    setSelectedCourtName(selectEditCourt.court);
                                    setIsModalBranchOpen(true);
                                }}
                                className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center"
                            >
                                <GoPlus />
                                Add Branch
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Table
                            className="w-full"
                            columns={column}
                            dataSource={courtBranches}
                            rowKey="id"
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
                        />
                    </Row>
                </Form>
            </Modal>
            <Modal
                className="rounded-lg scrollbar-hide"
                title="Add Judicial Court Branch"
                open={isModalBranchOpen}
                onCancel={handleCancel}
                footer={null}
                width="40%"
                zIndex={1100}
            >
                <AddCourtBranch
                    courtId={selectedCourtId ?? 0}
                    courtName={selectedCourtName}
                    onCancel={handleCancel}
                    onBranchAdded={() => {
                        setIsModalBranchOpen(false);
                        fetch(`${BASE_URL}/api/standards/court-branch/?limit=1000`, {
                            headers: {
                                Authorization: `Token ${token}`,
                            },
                        })
                            .then(res => res.json())
                            .then(json => {
                                const filtered = (json.results || []).filter(
                                    b => b.court?.toLowerCase() === selectedCourtName.toLowerCase()
                                );
                                setCourtBranches(filtered);
                            });
                    }}
                />
            </Modal>
            <Modal
                open={editBranchModal.open}
                onCancel={() => setEditBranchModal({ open: false, branch: null })}
                footer={null}
                title="Edit Judicial Court Branch"
                width="50%"
            >
                {editBranchModal.branch && (
                    <EditCourtBranch
                        branch={editBranchModal.branch}
                        onCancel={() => setEditBranchModal({ open: false, branch: null })}
                        onBranchUpdated={() => {
                            setEditBranchModal({ open: false, branch: null });
                            refreshBranches();
                        }}
                    />
                )}
            </Modal>
        </div>
    )
}

export default Court
