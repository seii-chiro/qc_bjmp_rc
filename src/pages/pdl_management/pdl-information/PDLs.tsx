import { PDLs } from "@/lib/pdl-definitions";
import { getUser } from "@/lib/queries";
import { deletePDL, patchPDL } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Space } from "antd";
import Table from "antd/es/table";
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
    // const [allPDLs, setAllPDLs] = useState<PDLs[]>([]);
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

    const { data, isFetching } = useQuery({
        queryKey: ["pdls", "pdl-table", page, limit, genderColumnFilter, statusColumnFilter, visitationColumnFilter],
        queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();
            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            if (genderColumnFilter.length > 0) {
                params.append("gender", genderColumnFilter.join(","));
            }
            if (statusColumnFilter.length > 0) {
                params.append("status", statusColumnFilter.join(","));
            }
            if (visitationColumnFilter.length > 0) {
                params.append("visitation_status", visitationColumnFilter.join(","));
            }

            const res = await fetch(`${BASE_URL}/api/pdls/pdl/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) throw new Error("Failed to fetch PDLs.");
            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
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

    const visitation_status = searchParams.get("visitation_status") || "all";
    const visitationList = visitation_status !== "all" ? visitation_status.split(",").map(decodeURIComponent) : [];

    useEffect(() => {
    if (visitationList.length > 0 && JSON.stringify(visitationColumnFilter) !== JSON.stringify(visitationList)) {
        setvisitationColumnFilter(visitationList);
    }
    }, [visitationList, visitationColumnFilter]);

    const { data: pdlVisitationStatusData, isLoading: pdlByVisitationStatusLoading } = useQuery({
            queryKey: ['pdls', 'pdls-table', page, visitationList],
                queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
                    const offset = (page - 1) * limit;
                    const res = await fetch(
                        `${BASE_URL}/api/pdls/pdl/?visitation_status=${encodeURIComponent(visitationList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Token ${token}`,
                            },
                        }
                    );
            
                    if (!res.ok) {
                        throw new Error('Failed to fetch PDL Visitation Status data.');
                    }
            
                    return res.json();
                },
            enabled: !!token,
        });

    const { data: visitationStatusData } = useQuery({
    queryKey: ['visitation-status'],
    queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl-visitation-statuses/`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
        },
        });
        if (!res.ok) throw new Error('Failed to fetch Visitation Status');
        return res.json();
    },
    enabled: !!token,
    });

    const visitationFilters = visitationStatusData?.results?.map(visitation => ({
    text: visitation.name,
    value: visitation.name,
    })) ?? [];
        
    // const dataSource = (data?.results || []).map((pdl, index) => {
    //     const address = [
    //         pdl?.person?.addresses?.[0]?.barangay,
    //         pdl?.person?.addresses?.[0]?.city_municipality,
    //         pdl?.person?.addresses?.[0]?.province,
    //     ]
    //         .filter(Boolean)
    //         .join(", ");

    //     return {
    //         ...pdl,
    //         key: index + 1,
    //         id: pdl?.id,
    //         name: `${pdl?.person?.first_name ?? ""} ${pdl?.person?.middle_name ?? ""} ${pdl?.person?.last_name ?? ""}`.trim(),
    //         gender: pdl?.person?.gender?.gender_option?.trim() ?? "",
    //         status: pdl?.status ?? "",
    //         cell_name: pdl?.cell?.cell_name,
    //         floor: pdl?.cell?.floor,
    //         visitation_status: pdl?.visitation_status,
    //         address,
    //     };
    //     });
    const dataSource = (data?.results || []).map((pdl, index) => {
    const address = [
        pdl?.person?.addresses?.[0]?.barangay,
        pdl?.person?.addresses?.[0]?.city_municipality,
        pdl?.person?.addresses?.[0]?.province,
    ]
    .filter(Boolean)
    .join(", ");

    return {
        ...pdl,
        key: index + 1,
        id: pdl?.id,
        name: `${pdl?.person?.first_name ?? ""} ${pdl?.person?.middle_name ?? ""} ${pdl?.person?.last_name ?? ""}`.trim(),
        gender: pdl?.person?.gender?.gender_option?.trim() ?? "",
        status: pdl?.status ?? "",
        cell_name: pdl?.cell?.cell_name,
        floor: pdl?.cell?.floor,
        visitation_status: pdl?.visitation_status,
        address,
        created_at: pdl?.created_at,
    };
}).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const columns = [
    {
        title: "No.",
        key: "no",
        render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    {
        title: "PDL Name",
        key: "name",
        render: (_, pdl) => pdl.name,
        sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
        title: 'Gender',
        dataIndex: 'gender',
        key: 'gender',
        sorter: (a, b) => a.gender.localeCompare(b.gender),
        filters: [
            { text: 'Male', value: 'Male' },
            { text: 'LGBTQ + GAY / BISEXUAL', value: 'LGBTQ + GAY / BISEXUAL' },
            { text: 'LGBTQ + TRANSGENDER', value: 'LGBTQ + TRANSGENDER' },
        ],
        filteredValue: genderColumnFilter,
        onFilter: (value, record) => record.gender === value,
    },
    {
        title: "Dorm",
        key: "cell_name",
        render: (_, pdl) => pdl.cell_name,
        sorter: (a, b) => a.cell_name.localeCompare(b.cell_name),
    },
        {
        title: "Annex",
        key: "floor",
        render: (_, pdl) => pdl.floor,
        sorter: (a, b) => a.floor.localeCompare(b.floor),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        sorter: (a, b) => a.status.localeCompare(b.status),
        filters: [
            { text: 'Committed', value: 'Committed' },
            { text: 'Convicted', value: 'Convicted' },
            { text: 'Released', value: 'Released' },
            { text: 'Hospitalized', value: 'Hospitalized' },
        ],
        filteredValue: statusColumnFilter,
        onFilter: (value, record) => record.status === value,
    },
    {
        title: 'Visitation Status',
        dataIndex: 'visitation_status',
        key: 'visitation_status',
        sorter: (a, b) => a.visitation_status.localeCompare(b.visitation_status),
        filters: visitationFilters,
        filteredValue: visitationColumnFilter,
        onFilter: (value, record) => record.visitation_status === value,
    },
    {
        title: "Action",
        key: "action",
        render: (_, record) => (
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

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPDLs();
            } else {
                allData = await fetchPDLs(searchText.trim());
            }
        const allResults = allData?.results || [];

        const filteredResults = allResults.filter(pdl => {
            const genderValue = pdl?.person?.gender?.gender_option ?? '';
            const statusValue = pdl?.status ?? '';
            const visitationStatusValue = pdl?.visitation_status ?? '';

            const matchesGlobalGender = gender === "all" || genderValue === gender;
            const matchesGlobalStatus = status === "all" || statusValue === status;
            const matchesGlobalVisitationStatus = visitation_status === "all" || visitationStatusValue === visitation_status;

            const matchesColumnGender = genderColumnFilter.length === 0 || genderColumnFilter.includes(genderValue);
            const matchesColumnStatus = statusColumnFilter.length === 0 || statusColumnFilter.includes(statusValue);
            const matchesColumnVisitation = visitationColumnFilter.length === 0 || visitationColumnFilter.includes(visitationStatusValue);

            return (
                matchesGlobalGender &&
                matchesGlobalStatus &&
                matchesColumnGender &&
                matchesColumnStatus &&
                matchesColumnVisitation &&
                matchesGlobalVisitationStatus
            );
            });

        const printSource = filteredResults.map((pdl, index) => ({
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

        const tableData = printSource.map((item, index) => [
            index + 1,
            item.name,
            item.gender,
            item.cell_name,
            item.floor,
            item.visitation_status,
            item.status,
        ]);

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
        setIsLoading(true);
        try {
                let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPDLs();
            } else {
                allData = await fetchPDLs(searchText.trim());
            }
        const allResults = allData?.results || [];

        const filteredResults = allResults.filter(pdl => {
            const genderValue = pdl?.person?.gender?.gender_option ?? '';
            const statusValue = pdl?.status ?? '';
            const visitationStatusValue = pdl?.visitation_status ?? '';

            const matchesGlobalGender = gender === "all" || genderValue === gender;
            const matchesGlobalStatus = status === "all" || statusValue === status;
            const matchesGlobalVisitationStatus = visitation_status === "all" || visitationStatusValue === visitation_status;

            const matchesColumnGender = genderColumnFilter.length === 0 || genderColumnFilter.includes(genderValue);
            const matchesColumnStatus = statusColumnFilter.length === 0 || statusColumnFilter.includes(statusValue);
            const matchesColumnVisitation = visitationColumnFilter.length === 0 || visitationColumnFilter.includes(visitationStatusValue);

            return (
                matchesGlobalGender &&
                matchesGlobalStatus &&
                matchesColumnGender &&
                matchesColumnStatus &&
                matchesColumnVisitation &&
                matchesGlobalVisitationStatus
            );
            });

            const exportData = filteredResults.map(pdl => {
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
        } catch (error) {
            console.error("Error exporting Excel:", error);
            messageApi.error("Failed to export Excel."); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = async () => {
        setIsLoading(true);
        try {
                let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPDLs();
            } else {
                allData = await fetchPDLs(searchText.trim());
            }
        const allResults = allData?.results || [];

        const filteredResults = allResults.filter(pdl => {
            const genderValue = pdl?.person?.gender?.gender_option ?? '';
            const statusValue = pdl?.status ?? '';
            const visitationStatusValue = pdl?.visitation_status ?? '';

            const matchesGlobalGender = gender === "all" || genderValue === gender;
            const matchesGlobalStatus = status === "all" || statusValue === status;
            const matchesGlobalVisitationStatus = visitation_status === "all" || visitationStatusValue === visitation_status;

            const matchesColumnGender = genderColumnFilter.length === 0 || genderColumnFilter.includes(genderValue);
            const matchesColumnStatus = statusColumnFilter.length === 0 || statusColumnFilter.includes(statusValue);
            const matchesColumnVisitation = visitationColumnFilter.length === 0 || visitationColumnFilter.includes(visitationStatusValue);

            return (
                matchesGlobalGender &&
                matchesGlobalStatus &&
                matchesColumnGender &&
                matchesColumnStatus &&
                matchesColumnVisitation &&
                matchesGlobalVisitationStatus
            );
            });

            const exportData = filteredResults.map(pdl => {
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
                Object.keys(exportData[0]).join(","), 
                ...exportData.map(item => Object.values(item).join(","))
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
        } finally {
            setIsLoading(false);
        }
    };
    const menu = (
        <Menu>
            <Menu.Item>
                <a onClick={handleExportExcel} disabled={isLoading}>
                    {isLoading ? <span className="loader"></span> : 'Export Excel'}
                </a>
            </Menu.Item>
            <Menu.Item>
                <a onClick={handleExportCSV} disabled={isLoading}>
                    {isLoading ? <span className="loader"></span> : 'Export CSV'}
                </a>
            </Menu.Item>
        </Menu>
    );

    const totalRecords = debouncedSearch 
    ? data?.count || 0
    : gender !== "all" 
    ? pdlsGenderData?.count || 0 
    : status !== "all"
    ? pdlStatusData?.count || 0
    : visitation_status !== "all"
    ? pdlVisitationStatusData?.count || 0
    : data?.count || 0;
    
    const mapPDL = (pdl, index) => ({
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
    });

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">PDL</h1>
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
                    <Input placeholder="Search PDL..." value={searchText} className="py-2 md:w-64 w-full" onChange={(e) => setSearchText(e.target.value)} />
                </div>
            </div>
            <Table
                columns={columns}
                loading={isFetching || searchLoading || pdlsByGenderLoading || pdlByStatusLoading || pdlByVisitationStatusLoading}
                scroll={{ x: 800 }}
                dataSource={
                    debouncedSearch
                        ? (searchData?.results || []).map(mapPDL)
                        : gender !== "all"
                        ? (pdlsGenderData?.results || []).map(mapPDL)
                        : status !== "all"
                            ? (pdlStatusData?.results || []).map(mapPDL)
                            : visitation_status !== "all"
                            ? (pdlVisitationStatusData?.results || []).map(mapPDL)
                            : dataSource
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
                    setPage(pagination.current || 1);
                        setGenderColumnFilter(filters.gender as string[] || []);
                        setstatusColumnFilter(filters.status as string[] || []);
                        setvisitationColumnFilter(filters.visitation_status as string[] || []);
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

