import { deleteVisitors, getUser, getVisitorSpecificById } from "@/lib/queries"
import { useTokenStore } from "@/store/useTokenStore"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message, Table, Modal, Button, Image, Menu, Dropdown, Input } from "antd"
import Fuse from "fuse.js";
import { Key, useEffect, useMemo, useState } from "react"
import { ColumnsType } from "antd/es/table"
import { VisitorRecord } from "@/lib/definitions"
import { calculateAge } from "@/functions/calculateAge"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useRef } from "react";
import noimg from '../../../public/noimg.png'
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import html2canvas from 'html2canvas';
import { GoDownload } from "react-icons/go";
import bjmp from '../../assets/Logo/QCJMD.png'
import EditVisitor from "./edit-visitor/EditVisitor";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PiFolderUserDuotone } from "react-icons/pi";
import { BASE_URL } from "@/lib/urls";
import { PaginatedResponse } from "../personnel_management/personnel/personnel-backup";
import { Visitor as NewVisitorType } from "@/lib/pdl-definitions";
import dayjs from "dayjs";

type VisitorResponse = VisitorRecord;

const Visitor = () => {
    const [searchText, setSearchText] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState("");
     const [loadingMessage, setLoadingMessage] = useState("");
    const [selectedVisitor, setSelectedVisitor] = useState<VisitorResponse | null>(null);
    const queryClient = useQueryClient();
    const token = useTokenStore().token;
    const modalContentRef = useRef<HTMLDivElement>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [selectEditVisitor, setEditSelectedVisitor] = useState<VisitorResponse | null>(null);
    const [genderColumnFilter, setGenderColumnFilter] = useState<string[]>([]);
    const [visitorTypeColumnFilter, setVisitorTypeColumnFilter] = useState<string[]>([]);
    const [visitorVisits, setVisitorVisits] = useState(selectedVisitor?.main_gate_visits || []);
    // const [showAllVisits, setShowAllVisits] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);    

    const fetchVisitors = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/visitors/visitor/?search=${search}`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: visitHistoryData, isLoading: isLoadingVisitHistory, isError } = useQuery({
    queryKey: ["visit-history", selectedVisitor?.id],
    queryFn: async () => {
        const res = await fetch(
        `${BASE_URL}/api/visit-logs/main-gate-visits/`,
        {
            headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            },
        }
        );
        if (!res.ok) throw new Error("Failed to fetch visit history");
        return res.json();
    },
    enabled: !!selectedVisitor?.id,
    });
const transformedVisitHistory = useMemo(() => {
    if (!visitHistoryData?.results || !selectedVisitor) return [];

    const fullName = `${selectedVisitor.person.first_name} ${selectedVisitor.person.last_name}`;

    return visitHistoryData.results
        .filter((visit) => visit.person === fullName)
        .map((visit) => ({
            timestamp_in: visit.timestamp_in,
            timestamp_out: visit.timestamp_out || null, 
            duration: visit.duration || 0, 
        }));
}, [visitHistoryData, selectedVisitor]);

const rowsToDisplay = showAll ? transformedVisitHistory : transformedVisitHistory.slice(0, 3);

    useEffect(() => {
        if (selectedVisitor?.main_gate_visits) {
            setVisitorVisits(selectedVisitor.main_gate_visits);
        }
    }, [selectedVisitor]);

    useEffect(() => {
        setVisitorVisits([]);
        }, [selectedVisitor?.id]);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
        return () => clearTimeout(timeout);
    }, [searchText]);

    const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ["visitors", debouncedSearch],
        queryFn: () => fetchVisitors(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

const { data, isFetching } = useQuery({
    queryKey: ['visitors', 'visitor-table', page, limit, genderColumnFilter, visitorTypeColumnFilter],
    queryFn: async (): Promise<PaginatedResponse<NewVisitorType>> => {
        const offset = (page - 1) * limit;

        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        params.append('offset', String(offset));

        if (genderColumnFilter.length > 0) {
            params.append("gender", genderColumnFilter.join(","));
        }
        if (visitorTypeColumnFilter.length > 0) {
            params.append("visitor_type", visitorTypeColumnFilter.join(","));
        }

        const res = await fetch(
        `${BASE_URL}/api/visitors/visitor/?${params.toString()}`,
        {
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
            },
        }
        );

        if (!res.ok) {
        throw new Error('Failed to fetch Visitors data.');
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


    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteVisitors(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visitors"] });
            messageApi.success("Visitor deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Visitor");
        },
    });

    const leftSideImage = selectedVisitor?.person?.media?.find(
        (m: any) => m.picture_view === "Left"
    );
    const ProfileImage = selectedVisitor?.person?.media?.find(
        (m: any) => m.picture_view === "Front"
    );
    const RightImage = selectedVisitor?.person?.media?.find(
        (m: any) => m.picture_view === "Right"
    );
    const Signature = selectedVisitor?.person?.media?.find(
        (m: any) => m.picture_view === null
    );
    const RightThumb = selectedVisitor?.person?.biometrics?.find(
        (m: any) => m.position === "finger_right_thumb"
    );

    const requirements = selectedVisitor?.person?.media_requirements || [];

    const fuse = new Fuse(requirements, {
        keys: ["name"],
        threshold: 0.4,
    });

    const waiverResults = fuse.search("waiver");

    const waiverData = waiverResults?.[0]?.item || null;
    const CohabitationData = selectedVisitor?.person?.media_requirements?.find(
        (m: any) => m.name?.toLowerCase() === "cohabitation"
    );

    const [searchParams] = useSearchParams();
    const gender = searchParams.get("gender") || "all";
    const genderList = gender !== "all" ? gender.split(",").map(decodeURIComponent) : [];

    const { data: visitorGenderData, isLoading: visitorsByGenderLoading } = useQuery({
        queryKey: ["visitors", 'visitor-table', page, genderList],
        queryFn: async (): Promise<PaginatedResponse<NewVisitorType>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/visitors/visitor/?gender=${encodeURIComponent(genderList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Visitors data.');
            }

            return res.json();
        },
        enabled: !!token,
    });

    const visitorType = searchParams.get("visitor_type") || "all";
    const visitorTypeList = visitorType !== "all" ? visitorType.split(",").map(decodeURIComponent) : [];

    const { data: visitorTypeData, isLoading: visitorsByTypeLoading } = useQuery({
        queryKey: ["visitors", 'visitor-table', page, visitorTypeList],
        queryFn: async (): Promise<PaginatedResponse<NewVisitorType>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/visitors/visitor/?visitor_type=${encodeURIComponent(visitorTypeList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Visitors data.');
            }

            return res.json();
        },
        enabled: !!token,
    });

    const { data: genderData } = useQuery({
    queryKey: ['gender-option'],
    queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/codes/genders/`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
        },
        });
        if (!res.ok) throw new Error('Failed to fetch genders');
        return res.json();
    },
    enabled: !!token,
    });
    
    const genderFilters = genderData?.results?.map(gender => ({
    text: gender.gender_option,
    value: gender.gender_option,
    })) ?? [];

        const { data: typeData } = useQuery({
        queryKey: ['type-option'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/codes/visitor-types/`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },
            });
            if (!res.ok) throw new Error('Failed to fetch Visitor Type');
            return res.json();
        },
        enabled: !!token,
        });

    const visitorTypeFilters = typeData?.results?.map(type => ({
    text: type.visitor_type,
    value: type.visitor_type,
    })) ?? [];

    const confirmDelete = (recordId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this record?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                deleteMutation.mutate(recordId);
            },
            onCancel() {
            },
            centered: true,
        });
    };

    const dataSource = (data?.results || []).map((visitor, index) => {
    const barangay = visitor?.person?.addresses[0]?.barangay || '';
    const cityMunicipality = visitor?.person?.addresses[0]?.city_municipality || '';
    const province = visitor?.person?.addresses[0]?.province || '';
    const addressParts = [barangay, cityMunicipality, province].filter(Boolean);
    const address = addressParts.join(', ');

    return {
        ...visitor,
        key: index + 1,
        id: visitor?.id,
        name: `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ? visitor?.person?.middle_name[0] + '.' : ''} ${visitor?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
        visitor_reg_no: visitor?.visitor_reg_no,
        visitor_type: visitor?.visitor_type,
        nationality: visitor?.person?.nationality,
        full_address: visitor?.person?.addresses[0]?.full_address ?? '',
        address: address,
        gender: visitor?.person?.gender?.gender_option ?? '',
        organization: visitor?.org ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
        created_at: visitor?.created_at,
    };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const columns: ColumnsType<VisitorResponse> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Visitor No.',
            dataIndex: 'visitor_reg_no',
            key: 'visitor_reg_no',
            sorter: (a, b) => a.visitor_reg_no.localeCompare(b.visitor_reg_no),
        },
        {
            title: 'Visitor Name',
            key: 'name',
            render: (_, visitor) => (
                `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.trim()
            ),
            sorter: (a, b) => {
                const nameA = `${a?.person?.first_name ?? ''} ${a?.person?.middle_name ?? ''} ${a?.person?.last_name ?? ''}`.trim();
                const nameB = `${b?.person?.first_name ?? ''} ${b?.person?.middle_name ?? ''} ${b?.person?.last_name ?? ''}`.trim();
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            sorter: (a, b) => a.gender.localeCompare(b.gender),
            filters:  genderFilters,
            filteredValue: genderColumnFilter,
            onFilter: (value, record) => record.gender === value,
        },
        {
            title: 'Visitor Type',
            dataIndex: 'visitor_type',
            key: 'visitor_type',
            sorter: (a, b) => a.visitor_type.localeCompare(b.visitor_type),
            filters:  visitorTypeFilters,
            filteredValue: visitorTypeColumnFilter,
            onFilter: (value, record) => record.visitor_type === value,
        },
        {
            title: 'Address',
            dataIndex: 'full_address',
            key: 'full_address',
            sorter: (a, b) => a.full_address.localeCompare(b.full_address),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate("update-visitor", {
                                state: { visitor: record },
                            });
                        }}
                    >
                        <AiOutlineEdit />
                    </Button>
                    {/* <Button
                        type="link"
                        danger
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(record.id);
                        }}
                    >
                        <AiOutlineDelete />
                    </Button> */}
                    <Button
                        type="link"
                        danger
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(record.id);
                        }}
                    >
                        <AiOutlineDelete />
                    </Button>
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(record);
                        }}
                    >
                        <PiFolderUserDuotone />
                    </Button>
                </div>
            ),
        }

    ];

    const handleRowClick = async (record: VisitorResponse) => {
        setSelectedVisitor(null);
        try {
            const visitorDetails = await getVisitorSpecificById(record.id, token);
            setSelectedVisitor(visitorDetails);
        } catch (error) {
            console.error("Error fetching visitor details:", error);
            messageApi.error("Failed to load visitor details.");
        }
    };

    const closeModal = () => {
        setSelectedVisitor(null);
    };

    const Info = ({ title, info }: { title: string; info: string | null }) => (
        <div className="flex items-center">
            <label className="w-28 text-[10px] text-[#8E8E8E]">{title}</label>
            <p className="mt-1 w-full bg-[#F9F9F9] rounded-md px-2 py-[1px] text-[13px] break-words">{info || ""}</p>
        </div>
    );
    const fetchAllVisitors = async () => {
        const res = await fetch(`${BASE_URL}/api/visitors/visitor/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        return data;
    };
    
    const handleExportPDF = async () => {
    setIsLoading(true);
    setLoadingMessage("Generating PDF... Please wait.");

    const doc = new jsPDF('landscape');
    const headerHeight = 48;
    const footerHeight = 32;
    const maxRowsPerPage = 17;

    const organizationName = dataSource[0]?.organization || "Bureau of Jail Management and Penology";
    const PreparedBy = dataSource[0]?.updated || "";
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const reportReferenceNo = `TAL-${formattedDate}-XXX`;

    let startY = headerHeight;
    let printSource;

    let allData;
    if (searchText.trim() === '') {
        allData = await fetchAllVisitors();
    } else {
        allData = await fetchVisitors(searchText.trim());
    }

    const allResults = allData?.results || [];

    const filteredResults = allResults.filter(visitor => {
        const genderValue = visitor?.person?.gender?.gender_option ?? '';
        const visitorTypeValue = visitor?.visitor_type ?? '';

        const searchParams = new URLSearchParams(window.location.search);
        const genderParam = searchParams.get("gender");
        const genderList = genderParam?.split(",").map(decodeURIComponent) || [];

        const matchesGlobalGender =
        genderList.length === 0 ||
        genderList.map(g => g.toLowerCase()).includes((genderValue ?? '').toLowerCase());

        const matchesGlobalType = visitorType === "all" || visitorTypeValue === visitorType;

        const matchesColumnGender = genderColumnFilter.length === 0 || genderColumnFilter.includes(genderValue);
        const matchesColumnVisitorType = visitorTypeColumnFilter.length === 0 || visitorTypeColumnFilter.includes(visitorTypeValue);

        return (
        matchesGlobalGender &&
        matchesGlobalType &&
        matchesColumnGender &&
        matchesColumnVisitorType
        );
    });

    printSource = filteredResults.map((visitor, index) => ({
        key: index + 1,
        id: visitor?.id,
        visitor_reg_no: visitor?.visitor_reg_no,
        name: `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ? visitor?.person?.middle_name[0] + '.' : ''} ${visitor?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
        visitor_type: visitor?.visitor_type,
        full_address: visitor?.person?.addresses[0]?.full_address,
        address: visitor?.address,
        gender: visitor?.person?.gender?.gender_option,
    }));

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
        doc.text("Visitor Report", 10, 15);
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
        item.visitor_reg_no,
        item.name,
        item.gender,
        item.visitor_type,
        item.full_address,
    ]);

    for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
        const pageData = tableData.slice(i, i + maxRowsPerPage);

        autoTable(doc, {
        head: [["No.", "Visitor No.", "Name", "Gender", "Visitor Type", "Address"]],
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
    let allData;
    if (searchText.trim() === '') {
        allData = await fetchAllVisitors();
    } else {
        allData = await fetchVisitors(searchText.trim());
    }

    const allResults = allData?.results || [];

    const filteredResults = allResults.filter(visitor => {
        const genderValue = visitor?.person?.gender?.gender_option ?? '';
        const visitorTypeValue = visitor?.visitor_type ?? '';

        const matchesGlobalGender = gender === "all" || genderValue === gender;
        const matchesGlobalType = visitorType === "all" || visitorTypeValue === visitorType;

        const matchesColumnGender = genderColumnFilter.length === 0 || genderColumnFilter.includes(genderValue);
        const matchesColumnVisitorType = visitorTypeColumnFilter.length === 0 || visitorTypeColumnFilter.includes(visitorTypeValue);

        return (
        matchesGlobalGender &&
        matchesGlobalType &&
        matchesColumnGender &&
        matchesColumnVisitorType
        );
    });

    const exportData = filteredResults.map(visitor => {
        const name = `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.trim();
        return {
            "Registration No.": visitor?.visitor_reg_no,
            "Name": name,
            "Gender": visitor?.person?.gender?.gender_option,
            "Visitor Type": visitor?.visitor_type,
            "Address": visitor?.person?.addresses[0]?.full_address ?? '',
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitor");
    XLSX.writeFile(wb, "Visitor.xlsx");
};
const handleExportCSV = async () => {
    try {
        let allData;
    if (searchText.trim() === '') {
        allData = await fetchAllVisitors();
    } else {
        allData = await fetchVisitors(searchText.trim());
    }

    const allResults = allData?.results || [];

    const filteredResults = allResults.filter(visitor => {
        const genderValue = visitor?.person?.gender?.gender_option ?? '';
        const visitorTypeValue = visitor?.visitor_type ?? '';

        const matchesGlobalGender = gender === "all" || genderValue === gender;
        const matchesGlobalType = visitorType === "all" || visitorTypeValue === visitorType;

        const matchesColumnGender = genderColumnFilter.length === 0 || genderColumnFilter.includes(genderValue);
        const matchesColumnVisitorType = visitorTypeColumnFilter.length === 0 || visitorTypeColumnFilter.includes(visitorTypeValue);

        return (
        matchesGlobalGender &&
        matchesGlobalType &&
        matchesColumnGender &&
        matchesColumnVisitorType
        );
    });

        const exportData = filteredResults.map(visitor => {
            const name = `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.trim();
            return {
                "Registration No.": visitor?.visitor_reg_no,
                "Name": name,
                "Gender": visitor?.person?.gender?.gender_option,
                "Visitor Type": visitor?.visitor_type,
                "Address": visitor?.person?.addresses[0]?.full_address ?? '',
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
        link.setAttribute("download", "Visitor.csv");
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

    const handleDownloadPDF = async () => {
    if (!modalContentRef.current) return;

    const element = modalContentRef.current;

    const scale = 2;

    const canvas = await html2canvas(element, {
        scale: scale,       
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);

    const imgWidth = canvas.width * 0.264583;
    const imgHeight = canvas.height * 0.264583;

    let finalWidth = imgWidth;
    let finalHeight = imgHeight;

    if (imgHeight > pdfHeight) {
        const ratio = pdfHeight / imgHeight;
        finalHeight = pdfHeight;
        finalWidth = imgWidth * ratio;
    }

    const x = (pdfWidth - finalWidth) / 2;
    const y = 0;

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    pdf.save('visitor-profile.pdf');
    };

    const totalRecords = debouncedSearch 
    ? data?.count || 0
    : gender !== "all" 
    ? visitorGenderData?.count || 0 
    : visitorType === "all"
    ? visitorTypeData?.count || 0
    : data?.count || 0; 

    return (
        <div>
            <div className="h-[90vh] flex flex-col">
                {contextHolder}
                <h1 className="text-3xl font-bold text-[#1E365D]">Visitor</h1>
                <div className="flex items-center justify-between my-2">
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
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table
                    loading={isFetching || searchLoading || visitorsByGenderLoading || visitorsByTypeLoading}
                    columns={columns}
                    dataSource={
                        debouncedSearch
                        ? (searchData?.results || []).map((visitor, index) => ({
                            ...visitor,
                            key: index + 1,
                            name: `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.trim(),
                            visitor_reg_no: visitor?.visitor_reg_no,
                            visitor_type: visitor?.visitor_type,
                            gender: visitor?.person?.gender?.gender_option,
                            nationality: visitor?.person?.nationality,
                            full_address: visitor?.person?.addresses[0]?.full_address ?? '',
                            address: `${visitor?.person?.addresses[0]?.barangay ?? ''} ${visitor?.person?.addresses[0]?.city_municipality ?? ''} ${visitor?.person?.addresses[0]?.province ?? ''}`,
                            }))
                        : gender !== "all"
                        ? (visitorGenderData?.results || []).map((visitor, index) => ({
                            ...visitor,
                            key: index + 1,
                            name: `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.trim(),
                            visitor_reg_no: visitor?.visitor_reg_no,
                            visitor_type: visitor?.visitor_type,
                            gender: visitor?.person?.gender?.gender_option,
                            nationality: visitor?.person?.nationality,
                            full_address: visitor?.person?.addresses[0]?.full_address ?? '',
                            address: `${visitor?.person?.addresses[0]?.barangay ?? ''} ${visitor?.person?.addresses[0]?.city_municipality ?? ''} ${visitor?.person?.addresses[0]?.province ?? ''}`
                            }))
                        : visitorType !== "all"
                        ? (visitorGenderData?.results || []).map((visitor, index) => ({
                            ...visitor,
                            key: index + 1,
                            name: `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.trim(),
                            visitor_reg_no: visitor?.visitor_reg_no,
                            visitor_type: visitor?.visitor_type,
                            gender: visitor?.person?.gender?.gender_option,
                            nationality: visitor?.person?.nationality,
                            full_address: visitor?.person?.addresses[0]?.full_address ?? '',
                            address: `${visitor?.person?.addresses[0]?.barangay ?? ''} ${visitor?.person?.addresses[0]?.city_municipality ?? ''} ${visitor?.person?.addresses[0]?.province ?? ''}`,
                            }))
                        : dataSource
                    }
                    scroll={{ x: 800 }}
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
                        setGenderColumnFilter(filters.gender as string[] ?? []);
                        setVisitorTypeColumnFilter(filters.visitor_type as string[] ?? []);
                        }}
                    rowKey="id"
                    />
                </div>
            </div>
            <Modal
                title="Visitor Report"
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
                open={selectedVisitor !== null}
                onCancel={closeModal}
                footer={null}
                className="top-0 pt-5"
                width={'43%'}
            >
                {selectedVisitor && (
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <div ref={modalContentRef} className="w-full max-w-xl space-y-3">
                            <div className="w-full text-center py-1 bg-[#2F3237] text-[#FFEFEF]">
                                <h1 className="text-xs font-medium">QUEZON CITY JAIL MALE DORM</h1>
                                <h2 className="font-bold">VISITORS CODE IDENTIFICATION</h2>
                            </div>
                            <div className="md:px-3 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 space-y-3 md:space-y-0 md:space-x-3">
                                    <div className="space-y-3 w-full flex flex-col">
                                        <div className="border border-[#EAEAEC] rounded-xl p-2 flex place-items-center">
                                            <div className="w-full h-56 rounded-xl">
                                                {ProfileImage?.media_binary ? (
                                                    <img
                                                        src={`data:image/bmp;base64,${ProfileImage.media_binary}`}
                                                        alt="Profile Picture"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <img
                                                        src={noimg}
                                                        alt="No Image"
                                                        className="w-full h-full object-contain p-5 bg-gray-100 rounded-lg"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                            <div className="border h-fit border-[#EAEAEC] rounded-xl py-2 px-3 overflow-hidden">
                                            <p className="text-[#404958] text-sm">Visitor History</p>
                                            <div className="overflow-y-auto h-full">
                                                <table className="w-full border-collapse overflow-x-auto">
                                                        <thead>
                                                            <tr>
                                                                <th className="rounded-l-lg bg-[#2F3237] text-white text-xs py-1 px-2 font-semibold">Date</th>
                                                                <th className="bg-[#2F3237] text-white text-xs py-1 px-2 font-semibold">Duration</th>
                                                                <th className="bg-[#2F3237] text-white text-xs py-1 px-2 font-semibold">Login</th>
                                                                <th className="rounded-r-lg bg-[#2F3237] text-white text-xs py-1 px-2 font-semibold">Logout</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {isLoadingVisitHistory ? (
                                                                <tr>
                                                                    <td colSpan={4} className="text-center text-xs py-2">Loading...</td>
                                                                </tr>
                                                            ) : isError || transformedVisitHistory.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={4} className="text-center text-xs py-2">No visit history found.</td>
                                                                </tr>
                                                            ) : (
                                                                rowsToDisplay.map((visit, index) => {
                                                                    const login = new Date(visit.timestamp_in);
                                                                    const logout = visit.timestamp_out ? new Date(visit.timestamp_out) : null; // Ensure proper date conversion
                                                                    const durationSec = visit.duration || 0;

                                                                    let durationDisplay = "...";
                                                                    if (visit.timestamp_out) {
                                                                        const minutes = Math.floor(durationSec / 60);
                                                                        const hours = Math.floor(minutes / 60);
                                                                        durationDisplay =
                                                                            durationSec < 60
                                                                            ? `${durationSec.toFixed(0)}s`
                                                                            : minutes < 60
                                                                            ? `${minutes}m`
                                                                            : `${hours}h ${minutes % 60}m`;
                                                                    }

                                                                    return (
                                                                        <tr key={index}>
                                                                            <td className="border-b border-[#DCDCDC] text-[9px] font-light p-1 text-center">
                                                                                {dayjs(login).format("YYYY-MM-DD")}
                                                                            </td>
                                                                            <td className="border-b border-[#DCDCDC] text-[9px] font-light p-1 text-center">
                                                                                {!visit.timestamp_out ? "..." : durationDisplay}
                                                                            </td>
                                                                            <td className="border-b border-[#DCDCDC] text-[9px] font-light p-1 text-center">
                                                                                {login.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                                                            </td>
                                                                            <td className="border-b border-[#DCDCDC] text-[9px] font-light p-1 text-center">
                                                                                {logout ? (
                                                                                    logout.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                                                                ) : (
                                                                                    "-"
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            )}
                                                            {transformedVisitHistory.length > 3 && (
                                                                <tr>
                                                                    <td colSpan={4} className="text-center text-xs pt-1">
                                                                        <button 
                                                                            className="text-blue-600 hover:underline"
                                                                            onClick={() => setShowAll(!showAll)}
                                                                        >
                                                                            {showAll ? "Show Less" : "Show All"}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                            </div>
                                            </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="border border-[#EAEAEC] rounded-xl p-2 pb-2 w-full">
                                            <p className="text-[#404958] text-sm">Visitors/Dalaw Basic Info</p>
                                            <div className="grid grid-cols-1 gap-2 py-2">
                                                <Info title="Visitor No:" info={selectedVisitor?.visitor_reg_no ?? ""} />
                                                <Info title="Type of Visitor:" info={selectedVisitor?.visitor_type ?? ""} />
                                                <Info title="Surname:" info={selectedVisitor?.person?.last_name || ""} />
                                                <Info title="First Name:" info={selectedVisitor?.person?.first_name || ""} />
                                                <Info title="Middle Name:" info={selectedVisitor?.person?.middle_name || ""} />
                                                <Info title="Address:" info={selectedVisitor?.person?.addresses?.[0]?.full_address || ''} />
                                                <Info title="Gender:" info={selectedVisitor?.person?.gender?.gender_option || ""} />
                                                <Info title="Age:" info={selectedVisitor?.person?.date_of_birth ? String(calculateAge(selectedVisitor?.person.date_of_birth)) : null} />
                                                <Info title="Birthday:" info={selectedVisitor?.person?.date_of_birth || ""} />
                                                <div className="flex items-center">
                                                    <label className="w-48 text-[10px] text-[#8E8E8E]">Relationship to PDL:</label>
                                                    <p className="mt-1 block w-full bg-[#F9F9F9] rounded-md text-xs px-2 py-[1px]">
                                                        {selectedVisitor?.pdls?.[0]?.relationship_to_pdl || "No PDL relationship"}
                                                    </p>
                                                </div>
                                                <Info
                                                    title="Requirements:"
                                                    info={
                                                        selectedVisitor?.person?.media_requirements
                                                            ?.map((req: any) => req.name)
                                                            .join(", ") || "No Requirements"
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border border-[#EAEAEC] rounded-xl p-2 w-full">
                                    <div className="w-full flex flex-col">
                                        <div className="flex text-center mb-1">
                                            <div className="flex-grow">
                                                <h1 className="text-[#404958] text-sm">PDL Basic Info</h1>
                                            </div>
                                            <div className="flex-grow">
                                                <h1 className="text-[#404958] text-sm">Cell Assigned</h1>
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto pb-1">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-[#2F3237] text-white text-xs">
                                                        <th className="py-1 px-2">PDL NO.</th>
                                                        <th className="py-1 px-2">Surname</th>
                                                        <th className="py-1 px-2">First Name</th>
                                                        <th className="py-1 px-2">Middle Name</th>
                                                        <th className="py-1 px-2">Level</th>
                                                        <th className="py-1 px-2">Annex</th>
                                                        <th className="py-1 px-2">Dorm</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedVisitor?.pdls?.length > 0 ? (
                                                        selectedVisitor?.pdls?.map((pdlItem: { pdl: { person: { id: any; last_name: any; first_name: any; middle_name: any; }; cell: { cell_name: any; floor: string; }; }; }, index: Key | null | undefined) => (
                                                            <tr key={index}>
                                                                <td className="text-center text-[9px] font-light">
                                                                    {pdlItem?.pdl?.person?.id || ""}
                                                                </td>
                                                                <td className="text-center text-[9px] font-light">
                                                                    {pdlItem?.pdl?.person?.last_name || ""}
                                                                </td>
                                                                <td className="text-center text-[9px] font-light">
                                                                    {pdlItem?.pdl?.person?.first_name || ""}
                                                                </td>
                                                                <td className="text-center text-[9px] font-light">
                                                                    {pdlItem?.pdl?.person?.middle_name || ""}
                                                                </td>
                                                                <td className="text-center text-[9px] font-light">
                                                                    {pdlItem?.pdl?.cell?.floor?.split("(")[1]?.replace(")", "") || ""}
                                                                </td>
                                                                <td className="text-center text-[9px] font-light">
                                                                    {pdlItem?.pdl?.cell?.floor || ""}
                                                                </td>
                                                                <td className="text-center text-[9px] font-light">
                                                                    {pdlItem?.pdl?.cell?.cell_name || ""}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={7} className="text-center text-[9px] text-gray-500 py-2">
                                                                No PDL records found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:mx-3 border border-[#EAEAEC] rounded-xl p-2 flex flex-col space-y-2 place-items-center bg-white">
                                <div className="w-full flex flex-wrap gap-2 text-center">
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <div className="flex flex-col md:flex-row gap-2">
                                            {/* Waiver */}
                                            <div className="space-y-2">
                                                <div className="rounded-lg bg-[#2F3237] text-white py-[2px] px-2 font-semibold text-xs">
                                                    Waiver
                                                </div>
                                                <div className="border flex flex-col w-full rounded-xl border-[#EAEAEC] h-32">
                                                    <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Waiver 1</div>
                                                    <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                        {waiverData?.direct_image ? (
                                                            <div className="w-[7.6rem]">
                                                                <Image
                                                                    src={`data:image/png;base64,${waiverData?.direct_image}`}
                                                                    alt="Waiver"
                                                                    className="w-full md:w-[7.6rem] h-full object-cover rounded-b-lg"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <img
                                                                className="w-full md:max-w-[7.75rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg"
                                                                src={noimg}
                                                                alt="No Image"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="rounded-lg bg-[#2F3237] text-white py-[2px] px-2 font-semibold text-xs">
                                                    Requirement
                                                </div>
                                                <div className="border flex flex-col w-full rounded-xl border-[#EAEAEC] h-32">
                                                    <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Cohabitation</div>
                                                    <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                        {CohabitationData?.direct_image ? (
                                                            <div>
                                                                <Image
                                                                    src={`data:image/png;base64,${CohabitationData?.direct_image}`}
                                                                    alt="Waiver"
                                                                    className="w-full md:max-w-[7.76rem] h-full object-cover rounded-b-lg"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <img className="w-full md:max-w-[7.75rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg" src={noimg} alt="No Image" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="rounded-lg w-full bg-[#2F3237] text-white py-[2px] px-2 font-semibold text-xs">
                                                Identification Marking
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-2 w-full">
                                                <div className="border flex flex-col rounded-xl border-[#EAEAEC] h-32">
                                                    <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Right Thumbmark</div>
                                                    <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                        {RightThumb?.data ? (
                                                            <Image
                                                                src={`data:image/bmp;base64,${RightThumb?.data}`}
                                                                alt="Right Thumb"
                                                                className="w-full md:max-w-[7.76rem] h-full object-cover rounded-b-lg"
                                                            />
                                                        ) : (
                                                            <img className="w-full md:max-w-[7.75rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg" src={noimg} alt="No Image" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="border flex flex-col rounded-xl border-[#EAEAEC] h-32">
                                                    <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Signature</div>
                                                    <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                        {Signature?.media_binary ? (
                                                            <Image
                                                                src={`data:image/bmp;base64,${Signature?.media_binary}`}
                                                                alt="Signature"
                                                                className="w-full md:max-w-[7.76rem] h-full object-cover rounded-b-lg"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={noimg}
                                                                alt="No Image"
                                                                className="w-full md:max-w-[7.7rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2 text-center">
                                        <div className="rounded-lg w-full bg-[#2F3237] text-white py-[2px] px-2 font-semibold text-xs">
                                            Identification Pictures
                                        </div>
                                        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2">
                                            <div className="border flex flex-col rounded-xl border-[#EAEAEC] h-32">
                                                <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Close Up Front</div>
                                                <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                    {ProfileImage?.media_binary ? (
                                                        <Image
                                                            src={`data:image/bmp;base64,${ProfileImage?.media_binary}`}
                                                            alt="Left side"
                                                            className="w-full h-full object-cover rounded-b-lg"
                                                        />
                                                    ) : (
                                                        <img className="w-full md:max-w-[7.7rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg" src={noimg} alt="No Image" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border flex flex-col rounded-xl border-[#EAEAEC] h-32">
                                                <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Full Body Front</div>
                                                <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                    {ProfileImage?.media_binary ? (
                                                        <Image
                                                            src={`data:image/bmp;base64,${ProfileImage?.media_binary}`}
                                                            alt="Left side"
                                                            className="w-full h-full object-cover rounded-b-lg"
                                                        />
                                                    ) : (
                                                        <img className="w-full md:max-w-[7.7rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg" src={noimg} alt="No Image" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border flex flex-col rounded-xl border-[#EAEAEC] h-32">
                                                <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Left Side</div>
                                                <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                    {leftSideImage?.media_binary ? (
                                                        <Image
                                                            src={`data:image/bmp;base64,${leftSideImage?.media_binary}`}
                                                            alt="Left side"
                                                            className="w-full h-full object-cover rounded-b-lg"
                                                        />
                                                    ) : (
                                                        <img className="w-full md:max-w-[7.7rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg" src={noimg} alt="No Image" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border flex flex-col rounded-xl border-[#EAEAEC] h-32">
                                                <div className="w-full bg-white rounded-t-xl text-[#404958] text-xs py-1.5 font-semibold">Right Side</div>
                                                <div className="rounded-b-lg bg-white flex-grow flex items-center justify-center overflow-hidden">
                                                    {RightImage?.media_binary ? (
                                                        <Image
                                                            src={`data:image/bmp;base64,${RightImage?.media_binary}`}
                                                            alt="Right side"
                                                            className="w-full h-full object-cover rounded-b-lg"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={noimg}
                                                            alt="No Image"
                                                            className="w-full md:max-w-[7.7rem] h-full object-contain p-5 bg-gray-100 rounded-b-lg"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-5 print:hidden">
                            <button
                                onClick={handleDownloadPDF}
                                className="px-4 py-1 bg-[#2F3237] text-white rounded-md text-sm"
                            >
                                Print PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                title="Edit Visitor"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
                width="80%"
            >
                <EditVisitor
                    editvisitor={selectEditVisitor}
                    onClose={() => setIsEditModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Visitor;
