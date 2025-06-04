import { PDLs } from "@/lib/pdl-definitions";
import { getUser } from "@/lib/queries";
import { deletePDL, patchPDL } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { NavLink, useSearchParams } from "react-router-dom";
import { BASE_URL } from "@/lib/urls";
import { PaginatedResponse } from "@/pages/personnel_management/personnel/personnel-backup";

const PDLtable = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectPDL, setSelectedPDL] = useState<PDLs | null>(null);
    const [genderColumnFilter, setGenderColumnFilter] = useState<string[]>([]);
    const [statusColumnFilter, setstatusColumnFilter] = useState<string[]>([]);
    const [visitationColumnFilter, setvisitationColumnFilter] = useState<string[]>([]);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [allPDLs, setAllPDLs] = useState<PDLs[]>([]);
    const fetchPDLs = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl/?search=${search}`, {
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
        queryKey: ["pdls", debouncedSearch],
        queryFn: () => fetchPDLs(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data: pdlData, isFetching } = useQuery({
        queryKey: ['pdls', 'pdls-table', page],
        queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/pdls/pdl/?page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch PDLs data.');
            }

            return res.json();
        },
        behavior: keepPreviousData(),
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePDL(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pdls"] });
            messageApi.success("PDL deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete PDL");
        },
    });

    const { mutate: editPDL, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: PDLs) =>
            patchPDL(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pdls"] });
            messageApi.success("PDL updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update PDL");
        },
    });

    const handleUpdate = (values: any) => {
        if (selectPDL?.id) {
            const updatedPDL: PDLs = {
                ...selectPDL,
                ...values,
            };
            editPDL(updatedPDL);
        } else {
            messageApi.error("Selected PDL is invalid");
        }
    };

    const [searchParams] = useSearchParams();
    const gender = searchParams.get("gender") || "all";
    const genderList = gender !== "all" ? gender.split(",").map(decodeURIComponent) : [];

    const { data: pdlsGenderData, isLoading: pdlsByGenderLoading } = useQuery({
            queryKey: ['pdls', 'pdls-table', page, genderList],
            queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
                const offset = (page - 1) * limit;
                const res = await fetch(
                    `${BASE_URL}/api/pdls/pdl/?gender=${encodeURIComponent (genderList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Token ${token}`,
                        },
                    }
                );
        
                if (!res.ok) {
                    throw new Error('Failed to fetch PDL Gender data.');
                }
        
                return res.json();
            },
            enabled: !!token,
        });

    const genderFilteredPDLIds = new Set(
        (pdlsGenderData?.results || []).map(pdl => pdl.id)
    );

    const status = searchParams.get("status") || "all";
    const statusList = status !== "all" ? status.split(",").map(decodeURIComponent) : [];

    useEffect(() => {
    if (genderList.length > 0 && JSON.stringify(genderColumnFilter) !== JSON.stringify(genderList)) {
        setGenderColumnFilter(genderList);
    }
    }, [genderList, genderColumnFilter]);

    useEffect(() => {
    if (statusList.length > 0 && JSON.stringify(statusColumnFilter) !== JSON.stringify(statusList)) {
        setstatusColumnFilter(statusList);
    }
    }, [statusList, statusColumnFilter]);

    const { data: pdlStatusData, isLoading: pdlByStatusLoading } = useQuery({
        queryKey: ['pdls', 'pdls-table', page, statusList],
            queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
                const offset = (page - 1) * limit;
                const res = await fetch(
                    `${BASE_URL}/api/pdls/pdl/?status=${encodeURIComponent(statusList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Token ${token}`,
                        },
                    }
                );
        
                if (!res.ok) {
                    throw new Error('Failed to fetch PDL Status data.');
                }
        
                return res.json();
            },
        enabled: !!token,
    });

    const statusFilteredPDLIds = new Set(
        (pdlStatusData?.results || []).map(pdl => pdl.id)
    );

    const dataSource = (pdlData?.results || []).filter(pdl =>
    gender === "all" ? true : genderFilteredPDLIds.has(pdl.id) && 
    status === "all" ? true : statusFilteredPDLIds.has(pdl.id) 
    ).map((pdl, index) => ({
        key: index + 1,
        id: pdl?.id,
        pdl_reg_no: pdl?.pdl_reg_no ?? 'N/A',
        visitation_status: pdl?.visitation_status ?? 'N/A',
        first_name: pdl?.person?.first_name ?? 'N/A',
        middle_name: pdl?.person?.middle_name ?? '',
        last_name: pdl?.person?.last_name ?? '',
        name: `${pdl?.person?.first_name ?? 'N/A'} ${pdl?.person?.middle_name ?? ''} ${pdl?.person?.last_name ?? 'N/A'}`,
        cell_no: pdl?.cell?.cell_no ?? 'N/A',
        floor: pdl?.cell?.floor ?? 'N/A',
        cell_name: pdl?.cell?.cell_name ?? 'N/A',
        gender: pdl?.person?.gender?.gender_option ?? '',
        // gang_affiliation: pdl?.gang_affiliation ?? 'N/A',
        // look: pdl?.look ?? 'N/A',
        status: pdl?.status ?? 'N/A',
        date_of_admission: pdl?.date_of_admission ?? 'N/A',
        organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

        const filteredData = dataSource.filter(pdl => {
            const matchesSearch = Object.values(pdl).some(value =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            );

            const matchesGender = genderColumnFilter.length === 0 || genderColumnFilter.includes(pdl.gender);
            const matchesStatus = statusColumnFilter.length === 0 || statusColumnFilter.includes(pdl.status);
            const matchesVisitationStatus = visitationColumnFilter.length === 0 || visitationColumnFilter.includes(pdl.visitation_status);

            return matchesSearch && matchesGender && matchesStatus && matchesVisitationStatus;
            });

            const columns: ColumnsType<PDLs> = [
                {
                    title: 'No.',
                    key: 'no',
                    render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
                },
                {
                    title: 'PDL Name',
                    dataIndex: 'name',
                    key: 'name',
                    sorter: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(), 
                },
                {
                    title: 'Gender',
                    dataIndex: 'gender',
                    key: 'gender',
                    sorter: (a, b) => a.gender.localeCompare(b.gender),
                    filters: Array.from(
                        new Set((pdlsGenderData?.results || []).map(pdl => pdl?.person?.gender?.gender_option))
                    )
                        .filter(Boolean)
                        .map(gender => ({ text: gender, value: gender })),
                    onFilter: (value, record) => record.gender === value,
                    filteredValue: genderColumnFilter,
                },
                {
                    title: 'Dorm Name',
                    dataIndex: 'cell_name',
                    key: 'cell_name',
                    sorter: (a, b) => a.cell_name.localeCompare(b.cell_name),
                },
                {
                    title: 'Annex',
                    dataIndex: 'floor',
                    key: 'floor',
                    sorter: (a, b) => a.floor.localeCompare(b.floor),
                },
                {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    sorter: (a, b) => a.status.localeCompare(b.status),
                    filters: [
                        ...Array.from(new Set(allPDLs.map(item => item.status)))
                            .filter(status => status)
                            .map(status => ({ text: status, value: status }))
                    ],
                    onFilter: (value, record) => record.status === value,
                    filteredValue: statusColumnFilter,
                },
                {
                    title: 'Visitation Status',
                    dataIndex: 'visitation_status',
                    key: 'visitation_status',
                    sorter: (a, b) => a.visitation_status.localeCompare(b.visitation_status),
                    filters: [
                        ...Array.from(new Set(allPDLs.map(item => item.visitation_status)))
                            .filter(visitation_status => visitation_status)
                            .map(visitation_status => ({ text: visitation_status, value: visitation_status }))
                    ],
                    onFilter: (value, record) => record.visitation_status === value,
                    filteredValue: visitationColumnFilter,
                },
                {
                    title: "Action",
                    key: "action",
                    render: (_: any, record: any) => (
                        <div className="flex gap-2">
                            <NavLink to="update" state={{ pdl: record }} className={"flex items-center justify-center"}>
                                <AiOutlineEdit />
                            </NavLink>
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

    const fetchAllPDLs = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        return data;
    };

    const lastPrintIndexRef = useRef(0);

const handleExportPDF = async () => {
    setIsLoading(true);
    setLoadingMessage("Generating PDF... Please wait.");

    const doc = new jsPDF();
    const headerHeight = 48;
    const footerHeight = 32;
    const MAX_ROWS_PER_PRINT = 800;

    let printSource;

        const isFiltering = (
        filteredData.length > 0 ||
        gender !== "all" ||
        status !== "all" ||
        genderColumnFilter.length > 0 ||
        statusColumnFilter.length > 0 ||
        visitationColumnFilter.length > 0
        );

    if (isFiltering) {
        printSource = filteredData.map((pdl, index) => ({
            key: index + 1,
            id: pdl?.id,
            pdl_reg_no: pdl?.pdl_reg_no ?? '',
            name: pdl?.name,
            gender: pdl?.gender ?? '',
            cell_name: pdl?.cell_name ?? '',
            floor: pdl?.floor ?? '',
            visitation_status: pdl?.visitation_status ?? '',
            status: pdl?.status ?? '',
            date_of_admission: pdl?.date_of_admission ?? '',
            organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
            updated: `${UserData?.first_name ?? ""} ${UserData?.last_name ?? ""}`,
        }));
        lastPrintIndexRef.current = 0;
    } else {
        // Print MAX_ROWS_PER_PRINT rows starting from lastPrintIndexRef.current from all PDLs
        const allData = await fetchAllPDLs();
        const allResults = allData?.results || [];

        printSource = allResults
            .slice(lastPrintIndexRef.current, lastPrintIndexRef.current + MAX_ROWS_PER_PRINT)
            .map((pdl, index) => ({
                key: lastPrintIndexRef.current + index + 1,
                id: pdl?.id,
                pdl_reg_no: pdl?.pdl_reg_no ?? 'N/A',
                name: `${pdl?.person?.first_name ?? ''} ${pdl?.person?.middle_name ? pdl?.person?.middle_name[0] + '.' : ''} ${pdl?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
                gender: pdl?.person?.gender?.gender_option ?? '',
                cell_name: pdl?.cell?.cell_name ?? 'N/A',
                floor: pdl?.cell?.floor ?? 'N/A',
                visitation_status: pdl?.visitation_status ?? 'N/A',
                status: pdl?.status ?? 'N/A',
                date_of_admission: pdl?.date_of_admission ?? 'N/A',
                organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
                updated: `${UserData?.first_name ?? ""} ${UserData?.last_name ?? ""}`,
            }));

        lastPrintIndexRef.current += MAX_ROWS_PER_PRINT;
        if (lastPrintIndexRef.current >= allResults.length) {
            lastPrintIndexRef.current = 0;
        }
    }

    const organizationName = printSource[0]?.organization || "Bureau of Jail Management and Penology";
    const PreparedBy = printSource[0]?.updated || "";
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const reportReferenceNo = `TAL-${formattedDate}-XXX`;

    const maxRowsPerPage = 26;
    let startY = headerHeight;

    const addHeader = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const imageWidth = 30;
        const imageHeight = 30;
        const margin = 10;
        const imageX = pageWidth - imageWidth - margin;
        const imageY = 12;

        doc.addImage(bjmp, "PNG", imageX, imageY, imageWidth, imageHeight);

        doc.setTextColor(0, 102, 204);
        doc.setFontSize(16);
        doc.text("PDL Report", 10, 15);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Organization Name: ${organizationName}`, 10, 25);
        doc.text("Report Date: " + formattedDate, 10, 30);
        doc.text("Prepared By: " + PreparedBy, 10, 35);
        doc.text("Department/ Unit: IT", 10, 40);
        doc.text("Report Reference No.: " + reportReferenceNo, 10, 45);
    };

    addHeader();

    // Prepare tableData based on printSource
    const tableData = printSource.map((item, index) => [
        index + 1,
        item.name,
        item.gender,
        item.cell_name,
        item.floor,
        item.visitation_status,
        item.status,
    ]);

    // Draw table, paginate with maxRowsPerPage rows per page
    for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
        const pageData = tableData.slice(i, i + maxRowsPerPage);

        autoTable(doc, {
            head: [["No.", "PDL", "Gender", "Dorm", "Annex", "Visitation", "Status"]],
            body: pageData,
            startY: startY,
            margin: { top: 0, left: 10, right: 10 },
            didDrawPage: function () {
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
            `Timestamp of Last Update: ${formattedDate}`,
        ].join("\n");
        const footerX = 10;
        const footerY = doc.internal.pageSize.height - footerHeight + 15;
        const pageX = doc.internal.pageSize.width - doc.getTextWidth(`${page} / ${pageCount}`) - 10;
        doc.setFontSize(8);
        doc.text(footerText, footerX, footerY);
        doc.text(`${page} / ${pageCount}`, pageX, footerY);
    }

    const pdfOutput = doc.output("datauristring");
    setPdfDataUrl(pdfOutput);
    setIsPdfModalOpen(true);
    setIsLoading(false);
};


    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null);
    };

    const handleExportExcel = async () => {

        const fullDataSource = await fetchAllPDLs(); 
        const exportData = fullDataSource?.results.map(pdl => {
            const name = `${pdl?.person?.first_name ?? ''} ${pdl?.person?.middle_name ? pdl?.person?.middle_name[0] + '.' : ''} ${pdl?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim();
            return {
                "Name": name,
                "Gender": pdl?.person?.gender?.gender_option,
                "Dorm": pdl?.cell?.cell_name,
                "Annex": pdl?.cell?.floor,
                "Visitation Status": pdl?.visitation_status,
                "Status": pdl?.status,

            };
        }) || [];
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PDL");
        XLSX.writeFile(wb, "PDL.xlsx");
    };

    const handleExportCSV = async () => {
        try {
            const fullDataSource = await fetchAllPDLs();
            const exportData = fullDataSource?.results.map(pdl => {
                const name = `${pdl?.person?.first_name ?? ''} ${pdl?.person?.middle_name ? pdl?.person?.middle_name[0] + '.' : ''} ${pdl?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim();
            return {
                "Name": name,
                "Gender": pdl?.person?.gender?.gender_option,
                "Dorm": pdl?.cell?.cell_name,
                "Annex": pdl?.cell?.floor,
                "Visitation Status": pdl?.visitation_status,
                "Status": pdl?.status,
            };
            }) || [];

            const csvContent = [
            Object.keys(exportData[0]).join(","), // Header row
            ...exportData.map(item => Object.values(item).join(",")) // Data rows
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "PDL.csv");
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
                <a onClick={handleExportExcel}>Export Excel</a>
            </Menu.Item>
            <Menu.Item>
                <a onClick={handleExportCSV}>Export CSV</a>
            </Menu.Item>
        </Menu>
    );

        const totalRecords = debouncedSearch 
    ? pdlData?.count || 0
    : gender !== "all" 
    ? pdlsGenderData?.count || 0 
    : status !== "all"
    ? pdlStatusData?.count || 0
    : pdlData?.count || 0; 
    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">PDL</h1>
            <div className="flex items-center justify-between my-4">
                <div className="flex gap-2">
                    <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                        <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                            <GoDownload /> Export
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
                    <Input placeholder="Search PDL..." value={searchText} className="py-2 md:w-64 w-full" onChange={(e) => setSearchText(e.target.value)} />
                </div>
            </div>
            <Table
                columns={columns}
                loading={isFetching || searchLoading || pdlsByGenderLoading || pdlByStatusLoading}
                scroll={{ x: 800 }}
                dataSource={
                    debouncedSearch
                        ? (searchData?.results || []).map((pdl, index) => ({
                            key: index + 1,
                            id: pdl?.id ?? 'N/A',
                            pdl_reg_no: pdl?.pdl_reg_no ?? 'N/A',
                            first_name: pdl?.person?.first_name ?? 'N/A',
                            middle_name: pdl?.person?.middle_name ?? '',
                            last_name: pdl?.person?.last_name ?? '',
                            name: `${pdl?.person?.first_name ?? 'N/A'} ${pdl?.person?.middle_name ?? ''} ${pdl?.person?.last_name ?? 'N/A'}`,
                            cell_no: pdl?.cell?.cell_no ?? 'N/A',
                            cell_name: pdl?.cell?.cell_name ?? 'N/A',
                            gang_affiliation: pdl?.gang_affiliation ?? 'N/A',
                            look: pdl?.look ?? 'N/A',
                            status: pdl?.status ?? 'N/A',
                            gender: pdl?.person?.gender?.gender_option,
                            visitation_status: pdl?.visitation_status ?? 'N/A',
                            floor: pdl?.cell?.floor ?? 'N/A',
                            date_of_admission: pdl?.date_of_admission ?? 'N/A',
                            organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
                            updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
                        }))
                        : gender !== "all"
                            ? (pdlsGenderData?.results || []).map((pdl, index) => ({
                                ...pdl,
                                key: index + 1,
                                id: pdl?.id ?? 'N/A',
                                pdl_reg_no: pdl?.pdl_reg_no ?? 'N/A',
                                first_name: pdl?.person?.first_name ?? 'N/A',
                                middle_name: pdl?.person?.middle_name ?? '',
                                last_name: pdl?.person?.last_name ?? '',
                                name: `${pdl?.person?.first_name ?? 'N/A'} ${pdl?.person?.middle_name ?? ''} ${pdl?.person?.last_name ?? 'N/A'}`,
                                cell_no: pdl?.cell?.cell_no ?? 'N/A',
                                cell_name: pdl?.cell?.cell_name ?? 'N/A',
                                gang_affiliation: pdl?.gang_affiliation ?? 'N/A',
                                look: pdl?.look ?? 'N/A',
                                status: pdl?.status ?? 'N/A',
                                gender: pdl?.person?.gender?.gender_option,
                                visitation_status: pdl?.visitation_status ?? 'N/A',
                                floor: pdl?.cell?.floor ?? 'N/A',
                                date_of_admission: pdl?.date_of_admission ?? 'N/A',
                                organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
                                updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
                                }))
                        : status !== "all"
                            ? (pdlStatusData?.results || []).map((pdl, index) => ({
                                ...pdl,
                                key: index + 1,
                                id: pdl?.id ?? 'N/A',
                                pdl_reg_no: pdl?.pdl_reg_no ?? 'N/A',
                                first_name: pdl?.person?.first_name ?? 'N/A',
                                middle_name: pdl?.person?.middle_name ?? '',
                                last_name: pdl?.person?.last_name ?? '',
                                name: `${pdl?.person?.first_name ?? 'N/A'} ${pdl?.person?.middle_name ?? ''} ${pdl?.person?.last_name ?? 'N/A'}`,
                                cell_no: pdl?.cell?.cell_no ?? 'N/A',
                                cell_name: pdl?.cell?.cell_name ?? 'N/A',
                                gang_affiliation: pdl?.gang_affiliation ?? 'N/A',
                                look: pdl?.look ?? 'N/A',
                                status: pdl?.status ?? 'N/A',
                                gender: pdl?.person?.gender?.gender_option,
                                visitation_status: pdl?.visitation_status ?? 'N/A',
                                floor: pdl?.cell?.floor ?? 'N/A',
                                date_of_admission: pdl?.date_of_admission ?? 'N/A',
                                organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
                                updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
                                }))
                        : filteredData
                }
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
                onChange={(pagination, filters, sorter) => {
                        setGenderColumnFilter(filters.gender as string[] || []);
                        setstatusColumnFilter(filters.status as string[] || []);
                        setvisitationColumnFilter(filters.status as string[] || []);
                    }}
                rowKey="id"
            />
            <Modal open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} onOk={() => form.submit()} width="40%" confirmLoading={isUpdating} style={{ overflowY: "auto" }} >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <h1 className="text-xl font-bold">PDL Information</h1>
                    <div className=" grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Form.Item className="text-[#374151] font-semibold text-lg" name="pdl_reg_no" label="Registration No.">
                            <Input disabled className="h-12 w-full border border-gray-300 rounded-lg px-2" />
                        </Form.Item>
                        <Form.Item name="date_of_admission" className="text-[#374151] font-semibold text-lg" label="Date Arrested">
                            <Input type="date" className="h-12 w-full border border-gray-300 rounded-lg px-2" />
                        </Form.Item>
                        <Form.Item name="first_name" className="text-[#374151] font-semibold text-lg" label="First Name">
                            <Input className="h-12 w-full border border-gray-300 rounded-lg px-2" />
                        </Form.Item>
                        <Form.Item name="middle_name" className="text-[#374151] font-semibold text-lg" label="Middle Name">
                            <Input className="h-12 w-full border border-gray-300 rounded-lg px-2" />
                        </Form.Item>
                        <Form.Item name="last_name" className="text-[#374151] font-semibold text-lg" label="Last Name">
                            <Input className="h-12 w-full border border-gray-300 rounded-lg px-2" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
            <Modal
                title="pdl Report"
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
        </div>
    )
}

export default PDLtable
function fetchPdls(debouncedSearch: string): any {
    throw new Error("Function not implemented.");
}

