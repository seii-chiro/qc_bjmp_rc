import { getOrganization, getUser, PaginatedResponse } from "@/lib/queries";
import { deleteNonPDLVisitor } from "@/lib/SPQuery";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bjmp from '../../assets/Logo/QCJMD.png'
import * as XLSX from "xlsx";
import { Button, Dropdown, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import { useNavigate, useSearchParams } from "react-router-dom";

export interface NonPDLVisitorPayload {
    key: number;
    id: number;
    reg_no: string;
    person: string;
    personnel: string;
    non_pdl_visitor_type: string;
    non_pdl_visitor_reason: string;
    visitor_rel_personnel: string;
    visitor_status: string;
    id_number: string;
    reason_notes: string;
}
const NonPDL = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [nonPDLVisitor, setnonPDLVisitor] = useState<NonPDLVisitorPayload | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [NonPDLVisitorTypeFilter, setNonPDLVisitorTypeFilter] = useState<string[]>([]);
    const [relationshipFilter, setRelationshipFilter] = useState<string[]>([]);
    const [visitorStatusFilter, setvisitorStatusFilter] = useState<string[]>([]);
    const navigate = useNavigate()

    const handleEditNonPDLVisitor = (id: string | number | null) => {
        navigate("update", { state: id })
    }

    const fetchNonPDLVisitor = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/?search=${search}`, {
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
        queryKey: ["non-pdl-visitor", debouncedSearch],
        queryFn: () => fetchNonPDLVisitor(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "non-pdl-visitor",
            "non-pdl-visitor-table",
            page,
            limit,
            NonPDLVisitorTypeFilter,
            relationshipFilter,
            visitorStatusFilter
        ],
        queryFn: async (): Promise<PaginatedResponse<NonPDLVisitorPayload>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            if (NonPDLVisitorTypeFilter.length > 0) {
                params.append("visitor-type", NonPDLVisitorTypeFilter.join(","));
            }

            if (relationshipFilter.length > 0) {
                params.append("relationship", relationshipFilter.join(","));
            }

            if (visitorStatusFilter.length > 0) {
                params.append("status", visitorStatusFilter.join(","));
            }

            const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/?${params.toString()}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch Non PDL Visitor data.");
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
        mutationFn: (id: number) => deleteNonPDLVisitor(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["non-pdl-visitor"] });
            messageApi.success("Non-PDL Visitor deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Non-PDL Visitor");
        },
    });

    // CATEGORY API
    const { data: nonpdlVisitorTypeData } = useQuery({
        queryKey: ['visitor-type'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch Non PDL Visitor Type');
            return res.json();
        },
        enabled: !!token,
    });

    const { data: visitorRelPersonnelData } = useQuery({
        queryKey: ['relationship'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch Non PDL Visitor Relationship to Personnel');
            return res.json();
        },
        enabled: !!token,
    });

    const { data: visitorAppStatusData } = useQuery({
        queryKey: ['status'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/visitors/visitor-application-status/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch Non PDL Visitor Status');
            return res.json();
        },
        enabled: !!token,
    });

    // SEARCH PARAM
    const [searchParams] = useSearchParams();
    const visitorType = searchParams.get("visitor-type") || "all";
    const visitorTypeList = visitorType !== "all" ? visitorType.split(",").map(decodeURIComponent) : [];

    const relationship = searchParams.get("relationship") || "all";
    const relationshipList = relationship !== "all" ? relationship.split(",").map(decodeURIComponent) : [];

    const status = searchParams.get("status") || "all";
    const statusList = status !== "all" ? status.split(",").map(decodeURIComponent) : [];

    //FILTERING API
    const { data: visitorTypeData, isLoading: NonPDLVisitorByTypeLoading } = useQuery({
        queryKey: ['non-pdl-visitor', 'non-pdl-visitor-table', page, visitorTypeList],
        queryFn: async (): Promise<PaginatedResponse<NonPDLVisitorPayload>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/?non_pdl_visitor_type=${encodeURIComponent(visitorTypeList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Non PDL Visitor Type data.');
            }

            return res.json();
        },
        enabled: !!token,
    });

    const { data: relationshipData, isLoading: NonPDLVisitorByRelationshipLoading } = useQuery({
        queryKey: ['non-pdl-visitor', 'non-pdl-visitor-table', page, relationshipList],
        queryFn: async (): Promise<PaginatedResponse<NonPDLVisitorPayload>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/?visitor_rel_personnel=${encodeURIComponent(visitorTypeList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Non PDL Visitor Relationship to Personnel data.');
            }

            return res.json();
        },
        enabled: !!token,
    });

    const { data: statusData, isLoading: NonPDLVisitorByStatusLoading } = useQuery({
        queryKey: ['non-pdl-visitor', 'non-pdl-visitor-table', page, relationshipList],
        queryFn: async (): Promise<PaginatedResponse<NonPDLVisitorPayload>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/?visitor_status=${encodeURIComponent(visitorTypeList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Non PDL Visitor Status data.');
            }

            return res.json();
        },
        enabled: !!token,
    });

    useEffect(() => {
        if (visitorTypeList.length > 0 && JSON.stringify(NonPDLVisitorTypeFilter) !== JSON.stringify(visitorTypeList)) {
            setNonPDLVisitorTypeFilter(visitorTypeList);
        }
    }, [visitorTypeList, NonPDLVisitorTypeFilter]);

    useEffect(() => {
        if (relationshipList.length > 0 && JSON.stringify(relationshipFilter) !== JSON.stringify(relationshipList)) {
            setRelationshipFilter(relationshipList);
        }
    }, [relationshipList, relationshipFilter]);

    useEffect(() => {
        if (statusList.length > 0 && JSON.stringify(visitorStatusFilter) !== JSON.stringify(statusList)) {
            setvisitorStatusFilter(statusList);
        }
    }, [statusList, visitorStatusFilter]);

    const visitorTypeFilters = nonpdlVisitorTypeData?.results?.map(type => ({
        text: type.non_pdl_visitor_type,
        value: type.non_pdl_visitor_type,
    })) ?? [];

    const relationshipFilters = visitorRelPersonnelData?.results?.map(relationship => ({
        text: relationship.relationship_personnel,
        value: relationship.relationship_personnel,
    })) ?? [];

    const statusFilters = visitorAppStatusData?.results?.map(status => ({
        text: status.status,
        value: status.status,
    })) ?? [];

    const dataSource = data?.results?.map((non_pdl_visitor, index) => ({
            key: index + 1,
            id: non_pdl_visitor?.id,
            reg_no: non_pdl_visitor?.reg_no,
            person: non_pdl_visitor?.person,
            personnel: `${non_pdl_visitor?.personnel.person?.first_name ?? ''} ${non_pdl_visitor?.personnel.person?.middle_name ? non_pdl_visitor?.personnel.person?.middle_name[0] + '.' : ''} ${non_pdl_visitor?.personnel.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            non_pdl_visitor_type: non_pdl_visitor?.non_pdl_visitor_type,
            non_pdl_visitor_reason: non_pdl_visitor?.non_pdl_visitor_reason,
            visitor_rel_personnel: non_pdl_visitor?.visitor_rel_personnel,
            visitor_status: non_pdl_visitor?.visitor_status,
            created_at: non_pdl_visitor?.created_at,
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));;    

    const columns: ColumnsType<NonPDLVisitorPayload> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Registration No.',
            dataIndex: 'reg_no',
            key: 'reg_no'
        },
        {
            title: 'Name',
            dataIndex: 'person',
            key: 'person',
            sorter: (a, b) => a.person.localeCompare(b.person),
            defaultSortOrder: 'descend',
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Personnel',
            dataIndex: 'personnel',
            key: 'personnel',
            sorter: (a, b) => a.personnel.localeCompare(b.personnel),
        },
        {
            title: 'Non-PDL Visitor Type',
            dataIndex: 'non_pdl_visitor_type',
            key: 'non_pdl_visitor_type',
            sorter: (a, b) => a.non_pdl_visitor_type.localeCompare(b.non_pdl_visitor_type),
            filters: visitorTypeFilters,
            filteredValue: NonPDLVisitorTypeFilter,
            onFilter: (value, record) => record.non_pdl_visitor_type === value
        },
        {
            title: 'Non-PDL Visitor Reason',
            dataIndex: 'non_pdl_visitor_reason',
            key: 'non_pdl_visitor_reason'
        },
        {
            title: 'Relationship to Personnel',
            dataIndex: 'visitor_rel_personnel',
            key: 'visitor_rel_personnel',
            sorter: (a, b) => a.visitor_rel_personnel.localeCompare(b.visitor_rel_personnel),
            filters: relationshipFilters,
            filteredValue: relationshipFilter,
            onFilter: (value, record) => record.visitor_rel_personnel === value
        },
        {
            title: 'Status',
            dataIndex: 'visitor_status',
            key: 'visitor_status',
            sorter: (a, b) => a.visitor_status.localeCompare(b.visitor_status),
            filters: statusFilters,
            filteredValue: visitorStatusFilter,
            onFilter: (value, record) => record.visitor_status === value
        },
        {
            title: "Action",
            key: "action",
            fixed: 'right',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="link"
                        onClick={() => handleEditNonPDLVisitor(record?.id)}
                    >
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

    const fetchAllNonPDLVisitors = async () => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitors/?limit=2000`, {
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

        try {
            const doc = new jsPDF('landscape');
            const headerHeight = 48;
            const footerHeight = 32;
            const organizationName = OrganizationData?.results?.[0]?.org_name || "";
            const PreparedBy = `${UserData?.first_name || ''} ${UserData?.last_name || ''}`;

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 16;
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllNonPDLVisitors();
            } else {
                allData = await fetchNonPDLVisitor(searchText.trim());
            }

            const allResults = allData?.results || [];

            const filteredResults = allResults.filter(non_pdl => {
                const visitorTypeValue = non_pdl?.non_pdl_visitor_type ?? '';
                const visitorRelPersonnelValue = non_pdl?.visitor_rel_personnel ?? '';
                const visitorStatusValue = non_pdl?.visitor_status ?? '';

                const matchesColumnVisitorType = NonPDLVisitorTypeFilter.length === 0 || NonPDLVisitorTypeFilter.includes(visitorTypeValue);
                const matchesColumnRelationship = relationshipFilter.length === 0 || relationshipFilter.includes(visitorRelPersonnelValue);
                const matchesColumnStatus = visitorStatusFilter.length === 0 || visitorStatusFilter.includes(visitorStatusValue);

                return matchesColumnVisitorType && matchesColumnRelationship && matchesColumnStatus;
            });

            const printSource = filteredResults.map((non_pdl_visitor, index) => ({
            key: index + 1,
            id: non_pdl_visitor?.id,
            reg_no: non_pdl_visitor?.reg_no,
            person: non_pdl_visitor?.person,
            personnel: `${non_pdl_visitor?.personnel.person?.first_name ?? ''} ${non_pdl_visitor?.personnel.person?.middle_name ? non_pdl_visitor?.personnel.person?.middle_name[0] + '.' : ''} ${non_pdl_visitor?.personnel.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            non_pdl_visitor_type: non_pdl_visitor?.non_pdl_visitor_type,
            non_pdl_visitor_reason: non_pdl_visitor?.non_pdl_visitor_reason,
            visitor_rel_personnel: non_pdl_visitor?.visitor_rel_personnel,
            visitor_status: non_pdl_visitor?.visitor_status,
            created_at: non_pdl_visitor?.created_at,
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
                doc.text("Non-PDL Visitor Report", 10, 15);
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
                item.reg_no || '',
                item.person || '',
                item.personnel || '',
                item.non_pdl_visitor_type || '',
                item.non_pdl_visitor_reason || '',
                item.visitor_rel_personnel || '',
                item.visitor_status || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);

                autoTable(doc, {
                    head: [['No.', 'Registration No.', 'Name', 'Personnel', 'Visitor Type', 'Reason', 'Relationship', 'Status']],
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
            allData = await fetchAllNonPDLVisitors();
        } else {
            allData = await fetchNonPDLVisitor(searchText.trim());
        }

        const allResults = allData?.results || [];

        const filteredResults = allResults.filter(non_pdl => {
            const visitorTypeValue = non_pdl?.non_pdl_visitor_type ?? '';
            const visitorRelPersonnelValue = non_pdl?.visitor_rel_personnel ?? '';
            const visitorStatusValue = non_pdl?.visitor_status ?? '';

            const matchesColumnVisitorType = NonPDLVisitorTypeFilter.length === 0 || NonPDLVisitorTypeFilter.includes(visitorTypeValue);
            const matchesColumnRelationship = relationshipFilter.length === 0 || relationshipFilter.includes(visitorRelPersonnelValue);
            const matchesColumnStatus = visitorStatusFilter.length === 0 || visitorStatusFilter.includes(visitorStatusValue);

            return matchesColumnVisitorType && matchesColumnRelationship && matchesColumnStatus;
        });

        const printSource = filteredResults.map((non_pdl_visitor, index) => ({
            key: index + 1,
            id: non_pdl_visitor?.id,
            reg_no: non_pdl_visitor?.reg_no,
            person: non_pdl_visitor?.person,
            personnel: `${non_pdl_visitor?.personnel.person?.first_name ?? ''} ${non_pdl_visitor?.personnel.person?.middle_name ? non_pdl_visitor?.personnel.person?.middle_name[0] + '.' : ''} ${non_pdl_visitor?.personnel.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            non_pdl_visitor_type: non_pdl_visitor?.non_pdl_visitor_type,
            non_pdl_visitor_reason: non_pdl_visitor?.non_pdl_visitor_reason,
            visitor_rel_personnel: non_pdl_visitor?.visitor_rel_personnel,
            visitor_status: non_pdl_visitor?.visitor_status,
            created_at: non_pdl_visitor?.created_at,
            id_number: non_pdl_visitor?.id_number,
            reason_notes: non_pdl_visitor?.reason_notes,
    }));

        const exportData = printSource.map((sp, index) => {
            return {
                "No.": index + 1,
                "Registration No.": sp?.reg_no,
                "Name": sp?.person,
                "Personnel": sp?.personnel,
                "Non PDL Visitor Type": sp?.non_pdl_visitor_type,
                "Non PDL Visitor Reason": sp?.non_pdl_visitor_reason,
                "Visitor Relationship to Personnel": sp?.visitor_rel_personnel,
                "Visitor Status": sp?.visitor_status,
                "ID Number": sp?.id_number,
                "Reason Notes": sp?.reason_notes,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NonPDLVisitor");
        XLSX.writeFile(wb, "NonPDLVisitor.xlsx");
    };

    const handleExportCSV = async () => {
        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllNonPDLVisitors();
            } else {
                allData = await fetchNonPDLVisitor(searchText.trim());
            }

            const allResults = allData?.results || [];

            const filteredResults = allResults.filter(non_pdl => {
                const visitorTypeValue = non_pdl?.non_pdl_visitor_type ?? '';
                const visitorRelPersonnelValue = non_pdl?.visitor_rel_personnel ?? '';
                const visitorStatusValue = non_pdl?.visitor_status ?? '';

                const matchesColumnVisitorType = NonPDLVisitorTypeFilter.length === 0 || NonPDLVisitorTypeFilter.includes(visitorTypeValue);
                const matchesColumnRelationship = relationshipFilter.length === 0 || relationshipFilter.includes(visitorRelPersonnelValue);
                const matchesColumnStatus = visitorStatusFilter.length === 0 || visitorStatusFilter.includes(visitorStatusValue);

                return matchesColumnVisitorType && matchesColumnRelationship && matchesColumnStatus;
            });

            const printSource = filteredResults.map((non_pdl_visitor, index) => ({
            key: index + 1,
            id: non_pdl_visitor?.id,
            reg_no: non_pdl_visitor?.reg_no,
            person: non_pdl_visitor?.person,
            personnel: `${non_pdl_visitor?.personnel.person?.first_name ?? ''} ${non_pdl_visitor?.personnel.person?.middle_name ? non_pdl_visitor?.personnel.person?.middle_name[0] + '.' : ''} ${non_pdl_visitor?.personnel.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            non_pdl_visitor_type: non_pdl_visitor?.non_pdl_visitor_type,
            non_pdl_visitor_reason: non_pdl_visitor?.non_pdl_visitor_reason,
            visitor_rel_personnel: non_pdl_visitor?.visitor_rel_personnel,
            visitor_status: non_pdl_visitor?.visitor_status,
            created_at: non_pdl_visitor?.created_at,
            id_number: non_pdl_visitor?.id_number,
            reason_notes: non_pdl_visitor?.reason_notes,
    }));

            const exportData = printSource.map((sp, index) => {
                return {
                    "No.": index + 1,
                    "Registration No.": sp?.reg_no,
                    "Name": sp?.person,
                    "Personnel": sp?.personnel,
                    "Non PDL Visitor Type": sp?.non_pdl_visitor_type,
                    "Non PDL Visitor Reason": sp?.non_pdl_visitor_reason,
                    "Visitor Relationship to Personnel": sp?.visitor_rel_personnel,
                    "Visitor Status": sp?.visitor_status,
                    "ID Number": sp?.id_number,
                    "Reason Notes": sp?.reason_notes,
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
            link.setAttribute("download", "NonPDLVisitor.csv");
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
        : visitorType !== "all"
            ? visitorTypeData?.count || 0
            : relationship !== "all"
                ? relationshipData?.count || 0
                : status !== "all"
                    ? statusData?.count || 0
                    : data?.count || 0;

    const mapNonPDLVisitor = (non_pdl_visitor, index) => ({
            key: index + 1,
            id: non_pdl_visitor?.id,
            reg_no: non_pdl_visitor?.reg_no,
            person: non_pdl_visitor?.person,
            personnel: `${non_pdl_visitor?.personnel.person?.first_name ?? ''} ${non_pdl_visitor?.personnel.person?.middle_name ? non_pdl_visitor?.personnel.person?.middle_name[0] + '.' : ''} ${non_pdl_visitor?.personnel.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            non_pdl_visitor_type: non_pdl_visitor?.non_pdl_visitor_type,
            non_pdl_visitor_reason: non_pdl_visitor?.non_pdl_visitor_reason,
            visitor_rel_personnel: non_pdl_visitor?.visitor_rel_personnel,
            visitor_status: non_pdl_visitor?.visitor_status,
            created_at: non_pdl_visitor?.created_at,
            id_number: non_pdl_visitor?.id_number,
            reason_notes: non_pdl_visitor?.reason_notes,
    });

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">NON-PDL Visitor</h1>
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
                <div className="flex gap-2">
                    <Input
                        placeholder="Search..."
                        value={searchText}
                        className="py-2 md:w-64 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>
            <Table
                className="overflow-x-auto"
                loading={isFetching || searchLoading || NonPDLVisitorByTypeLoading || NonPDLVisitorByRelationshipLoading || NonPDLVisitorByStatusLoading}
                columns={columns}
                dataSource={debouncedSearch
                    ? (searchData?.results || []).map(mapNonPDLVisitor)
                    : visitorType !== "all"
                        ? (visitorTypeData?.results || []).map(mapNonPDLVisitor)
                        : relationship !== "all"
                            ? (relationshipData?.results || []).map(mapNonPDLVisitor)
                            : status !== "all"
                                ? (statusData?.results || []).map(mapNonPDLVisitor)
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
                onChange={(pagination, filters, sorter) => {
                    setNonPDLVisitorTypeFilter(filters.non_pdl_visitor_type as string[] || []);
                    setRelationshipFilter(filters.visitor_rel_personnel as string[] || []);
                    setvisitorStatusFilter(filters.visitor_status as string[] || []);
                }}
                rowKey="id"
            />
            <Modal
                title="Non-PDL Visitor Report"
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

export default NonPDL
