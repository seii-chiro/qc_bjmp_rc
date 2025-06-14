import { useSearchParams } from 'react-router';
import { PersonnelForm } from "@/lib/issues-difinitions";
import { getUser } from "@/lib/queries";
import { deletePersonnel } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Input, Menu, message, Modal, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import bjmp from '../../../assets/Logo/QCJMD.png';
import { NavLink } from "react-router-dom";
import { Personnel as PersonnelType } from '@/lib/pdl-definitions';
import { BASE_URL } from '@/lib/urls';

export type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

const Personnel = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [genderFilter, setGenderFilter] = useState<string[]>([]);
    const [rankFilter, setRankFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const fetchPersonnels = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel/?search=${search}`, {
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
        queryKey: ["personnel", debouncedSearch],
        queryFn: () => fetchPersonnels(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "personnel",
            "personnel-table",
            page,
            limit,
            genderFilter,
            statusFilter,
            rankFilter,
        ],
        queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            if (genderFilter.length > 0) {
            params.append("gender", genderFilter.join(","));
            }

            if (statusFilter.length > 0) {
            params.append("status", statusFilter.join(","));
            }

            if (rankFilter.length > 0) {
                const rankNames: string[] = [];
                const rankCodes: string[] = [];

                rankFilter.forEach((item) => {
                    const match = item.match(/^(.*)\(([^()]+)\)$/);
                    if (match) {
                    rankNames.push(match[1].trim());
                    rankCodes.push(match[2].trim());
                    }
                });

                if (rankNames.length > 0) {
                    params.append("rank_name", rankNames.join(","));
                }

                if (rankCodes.length > 0) {
                    params.append("rank_code", rankCodes.join(","));
                }
                }

            const res = await fetch(`${BASE_URL}/api/codes/personnel/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Personnel data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePersonnel(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personnel"] });
            messageApi.success("Personnel deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Personnel");
        },
    });

    const [searchParams] = useSearchParams();
    const gender = searchParams.get("gender") || "all";
    const genderList = gender !== "all" ? gender.split(",").map(decodeURIComponent) : [];

    const { data: personnelGenderData, isLoading: personnelByGenderLoading } = useQuery({
        queryKey: ['personnel', 'personnel-table', page, genderList],
        queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
            const offset = (page - 1) * limit;

            const genderParam = genderList.length > 0 ? `gender=${encodeURIComponent(genderList.join(","))}` : '';
            const url = `${BASE_URL}/api/codes/personnel/?${genderParam}${genderParam ? '&' : ''}page=${page}&limit=${limit}&offset=${offset}`;

            const res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch Personnel Gender data.');
            }

            return res.json();
        },
        enabled: !!token,
    });

    const status = searchParams.get("status") || "all";
    const statusList = status !== "all" ? status.split(",").map(decodeURIComponent) : [];
    
    const { data: personnelStatusData, isLoading: personnelByStatusLoading } = useQuery({
        queryKey: ['personnel', 'personnel-table', page, statusList],
        queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/codes/personnel/?status=${encodeURIComponent(statusList.join(","))}&page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );
    
            if (!res.ok) {
                throw new Error('Failed to fetch Personnel Status data.');
            }
    
            return res.json();
        },
        enabled: !!token,
    });

    const rank = searchParams.get("rank") || "all";
    const rankList = rank !== "all" ? rank.split(",").map(decodeURIComponent) : [];

    const { data: personnelRankData, isLoading: personnelByRankLoading } = useQuery({
        queryKey: ['personnel', 'personnel-table', page, rankList],
        queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const rankNames: string[] = [];
            const rankCodes: string[] = [];

            rankList.forEach((item) => {
                const match = item.match(/^(.*)\(([^()]+)\)\s*\(([^()]+)\)$/);
                if (match) {
                    const name = `${match[1].trim()}(${match[2].trim()})`;
                    const code = match[3].trim();                       
                    rankNames.push(name);
                    rankCodes.push(code);
                }
            });

            if (rankNames.length > 0) {
                params.append("rank_name", rankNames.join(","));
            }

            if (rankCodes.length > 0) {
                params.append("rank_code", rankCodes.join(","));
            }

            const res = await fetch(
                `${BASE_URL}/api/codes/personnel/?${params.toString()}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Personnel Rank data.');
            }

            return res.json();
        },
        enabled: !!token,
    });

    useEffect(() => {
    if (genderList.length > 0 && JSON.stringify(genderFilter) !== JSON.stringify(genderList)) {
        setGenderFilter(genderList);
    }
    }, [genderList, genderFilter]);

    useEffect(() => {
    if (statusList.length > 0 && JSON.stringify(statusFilter) !== JSON.stringify(statusList)) {
        setStatusFilter(statusList);
    }
    }, [statusList, statusFilter]);

    useEffect(() => {
        if (rankList.length > 0 && JSON.stringify(rankFilter) !== JSON.stringify(rankList)) {
            setRankFilter(rankList);
        }
    }, [rankList, rankFilter]);

    const { data: rankData } = useQuery({
    queryKey: ['rank-options'],
    queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/codes/ranks/`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
        },
        });
        if (!res.ok) throw new Error('Failed to fetch ranks');
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

    const { data: statusData } = useQuery({
    queryKey: ['status-option'],
    queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel-status/`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
        },
        });
        if (!res.ok) throw new Error('Failed to fetch Status');
        return res.json();
    },
    enabled: !!token,
    });

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

    const dataSource = data?.results.map((personnel, index) => ({
        key: index + 1,
        id: personnel?.id,
        organization: personnel?.organization ?? '',
        personnel_reg_no: personnel?.personnel_reg_no ?? '',
        person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ?? ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
        shortname: personnel?.person?.shortname ?? '',
        rank: personnel?.rank ?? '',
        status: personnel?.status ?? '',
        gender: personnel?.person?.gender?.gender_option ?? '',
        date_joined: personnel?.date_joined ?? '',
        record_status: personnel?.record_status ?? '',
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
        created_at: personnel?.created_at,
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));;

    const genderFilters = genderData?.results?.map(gender => ({
    text: gender.gender_option,
    value: gender.gender_option,
    })) ?? [];
    
    const rankFilters = rankData?.results?.map(rank => ({
    text: `${rank.rank_name} (${rank.rank_code})`,
    value: `${rank.rank_name} (${rank.rank_code})`,
    })) ?? [];

    const statusFilters = statusData?.results?.map(status => ({
    text: status.name,
    value: status.name ,
    })) ?? [];

    const columns: ColumnType<PersonnelForm> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Personnel No.',
            dataIndex: 'personnel_reg_no',
            key: 'personnel_reg_no',
            sorter: (a, b) => a.personnel_reg_no.localeCompare(b.personnel_reg_no),
        },
        {
            title: 'Personnel',
            dataIndex: 'person',
            key: 'person',
            sorter: (a, b) => a.person.localeCompare(b.person),
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            sorter: (a, b) => a.gender.localeCompare(b.gender),
            filters:  genderFilters,
            filteredValue: genderFilter,
            onFilter: (value, record) => record.gender === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: statusFilters
            ,
            filteredValue: statusFilter,
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'rank',
            dataIndex: 'rank',
            key: 'rank',
            sorter: (a, b) => a.rank.localeCompare(b.rank),
            filters: rankFilters,
            filteredValue: rankFilter,
            onFilter: (value, record) => record.rank === value,
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <NavLink to={"/jvms/personnels/personnel/update"} state={{ personnel: record }} className="text-blue-500 hover:text-blue-700 flex items-center">
                        <AiOutlineEdit />
                    </NavLink>
                    {/* <Button
                        type="link"
                        danger
                        onClick={() => deleteMutation.mutate(record.id)}
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
                </div>
            ),
        },
    ];


    const fetchAllPersonnels = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel/?limit=10000`, {
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

    const doc = new jsPDF('landscape');
    const headerHeight = 48;
    const footerHeight = 32;
    const maxRowsPerPage = 17;

    let allData;
    if (searchText.trim() === '') {
        allData = await fetchAllPersonnels();
    } else {
        allData = await fetchPersonnels(searchText.trim());
    }
    const allResults = allData?.results || [];

    const filteredResults = allResults.filter(personnel => {
        const genderValue = personnel?.person?.gender?.gender_option ?? '';
        const statusValue = personnel?.status ?? '';
        const rankValue = personnel?.rank ?? '';

        const matchesGlobalGender =
        genderList.length === 0 ||
        genderList.map(g => g.toLowerCase()).includes((genderValue ?? '').toLowerCase());
        // const matchesGlobalGender = gender === "all" || genderValue === gender;
        const matchesGlobalStatus = status === "all" || statusValue === status;
        const matchesGlobalRank = rank === "all" || rankValue === rank;

        const matchesColumnGender = genderFilter.length === 0 || genderFilter.includes(genderValue);
        const matchesColumnStatus = statusFilter.length === 0 || statusFilter.includes(statusValue);
        const matchesColumnRank = rankFilter.length === 0 || rankFilter.includes(rankValue);

        return (
            matchesGlobalGender &&
            matchesGlobalStatus &&
            matchesColumnGender &&
            matchesColumnStatus &&
            matchesColumnRank &&
            matchesGlobalRank
        );
        });

    const printSource = filteredResults.map((personnel, index) => ({
        key: index + 1,
        id: personnel?.id,
        organization: personnel?.organization ?? '',
        personnel_reg_no: personnel?.personnel_reg_no ?? '',
        person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ? personnel?.person?.middle_name[0] + '.' : ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
        shortname: personnel?.shortname ?? '',
        rank: personnel?.rank ?? '',
        status: personnel?.status ?? '',
        gender: personnel?.person?.gender?.gender_option ?? '',
        date_joined: personnel?.date_joined ?? '',
        record_status: personnel?.record_status ?? '',
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    }))

    const organizationName = printSource[0]?.organization || "Bureau of Jail Management and Penology";
    const PreparedBy = printSource[0]?.updated_by || "";
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const reportReferenceNo = `TAL-${formattedDate}-XXX`;

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
        doc.text("Personnel Report", 10, 15);
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
        item.personnel_reg_no,
        item.person,
        item.gender,
        item.rank,
        item.status,
    ]);

    for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
        const pageData = tableData.slice(i, i + maxRowsPerPage);

        autoTable(doc, {
            head: [['No.', 'Personnel No.', 'Name', 'Gender', 'Rank', 'Status']],
            body: pageData,
            startY: headerHeight,
            margin: { top: 0, left: 10, right: 10 },
            didDrawPage: function (data) {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    addHeader();
                }
            },
        });

        if (i + maxRowsPerPage < tableData.length) {
            doc.addPage();
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
        allData = await fetchAllPersonnels();
    } else {
        allData = await fetchPersonnels(searchText.trim());
    }
    const allResults = allData?.results || [];

    const filteredResults = allResults.filter(personnel => {
        const genderValue = personnel?.person?.gender?.gender_option ?? '';
        const statusValue = personnel?.status ?? '';
        const rankValue = personnel?.rank ?? '';

        const matchesGlobalGender =
        genderList.length === 0 ||
        genderList.map(g => g.toLowerCase()).includes((genderValue ?? '').toLowerCase());
        // const matchesGlobalGender = gender === "all" || genderValue === gender;
        const matchesGlobalStatus = status === "all" || statusValue === status;
        const matchesGlobalRank = rank === "all" || rankValue === rank;

        const matchesColumnGender = genderFilter.length === 0 || genderFilter.includes(genderValue);
        const matchesColumnStatus = statusFilter.length === 0 || statusFilter.includes(statusValue);
        const matchesColumnRank = rankFilter.length === 0 || rankFilter.includes(rankValue);

        return (
            matchesGlobalGender &&
            matchesGlobalStatus &&
            matchesColumnGender &&
            matchesColumnStatus &&
            matchesColumnRank &&
            matchesGlobalRank
        );
        });

        const exportData = filteredResults.map((personnel, index) => {
            const name = `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ? personnel?.person?.middle_name[0] + '.' : ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim();
            return {
                "No.": index + 1,
                "Registration No.": personnel?.personnel_reg_no,
                "Name": name,
                "Gender": personnel?.person?.gender?.gender_option,
                "Rank": personnel?.rank,
                "Status": personnel?.status,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Personnel");
        XLSX.writeFile(wb, "Personnel.xlsx");
    };

    const handleExportCSV = async () => {
        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPersonnels();
            } else {
                allData = await fetchPersonnels(searchText.trim());
            }
            const allResults = allData?.results || [];

            const filteredResults = allResults.filter(personnel => {
                const genderValue = personnel?.person?.gender?.gender_option ?? '';
                const statusValue = personnel?.status ?? '';
                const rankValue = personnel?.rank ?? '';

                const matchesGlobalGender =
                genderList.length === 0 ||
                genderList.map(g => g.toLowerCase()).includes((genderValue ?? '').toLowerCase());
                // const matchesGlobalGender = gender === "all" || genderValue === gender;
                const matchesGlobalStatus = status === "all" || statusValue === status;
                const matchesGlobalRank = rank === "all" || rankValue === rank;

                const matchesColumnGender = genderFilter.length === 0 || genderFilter.includes(genderValue);
                const matchesColumnStatus = statusFilter.length === 0 || statusFilter.includes(statusValue);
                const matchesColumnRank = rankFilter.length === 0 || rankFilter.includes(rankValue);

                return (
                    matchesGlobalGender &&
                    matchesGlobalStatus &&
                    matchesColumnGender &&
                    matchesColumnStatus &&
                    matchesColumnRank &&
                    matchesGlobalRank
                );
                });
            const exportData = filteredResults.map((personnel, index) => {
                const name = `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ? personnel?.person?.middle_name[0] + '.' : ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim();
                return {
                    "No.": index + 1,
                    "Registration No.": personnel?.personnel_reg_no,
                    "Name": name,
                    "Gender": personnel?.person?.gender?.gender_option,
                    "Rank": personnel?.rank,
                    "Status": personnel?.status,
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
            link.setAttribute("download", "Personnel.csv");
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
                <a onClick={handleExportExcel} disabled={isLoading}> {/* Disable if loading */}
                    {isLoading ? <span className="loader"></span> : 'Export Excel'}
                </a>
            </Menu.Item>
            <Menu.Item>
                <a onClick={handleExportCSV} disabled={isLoading}> {/* Disable if loading */}
                    {isLoading ? <span className="loader"></span> : 'Export CSV'}
                </a>
            </Menu.Item>
        </Menu>
    );

    const totalRecords = debouncedSearch 
    ? data?.count || 0
    : gender !== "all" 
    ? personnelGenderData?.count || 0 
    : status !== "all"
    ? personnelStatusData?.count || 0
    : rank !== "all"
    ? personnelRankData?.count || 0
    : data?.count || 0; 
    
    const mapPersonnel = (personnel, index) => ({
        id: personnel?.id,
        key: index + 1,
        organization: personnel?.organization ?? '',
        personnel_reg_no: personnel?.personnel_reg_no ?? '',
        person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ?? ''} ${personnel?.person?.last_name ?? ''}`,
        shortname: personnel?.person?.shortname ?? '',
        rank: personnel?.rank ?? '',
        status: personnel?.status ?? '',
        gender: personnel?.person?.gender?.gender_option ?? '',
        date_joined: personnel?.date_joined ?? '',
        record_status: personnel?.record_status ?? '',
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    });

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">Personnel</h1>
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
            <Table
                loading={isFetching || searchLoading || personnelByGenderLoading || personnelByStatusLoading || personnelByRankLoading}
                columns={columns}
                dataSource={
                    debouncedSearch
                        ? (searchData?.results || []).map(mapPersonnel)
                        : gender !== "all"
                            ? (personnelGenderData?.results || []).map(mapPersonnel)
                        : status !== "all"
                            ? (personnelStatusData?.results || []).map(mapPersonnel)
                        : rank !== "all"
                            ? (personnelRankData?.results || []).map(mapPersonnel)
                            : dataSource
                }
                scroll={{ x: 800}}
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
                        setGenderFilter(filters.gender as string[] ?? []);
                        setStatusFilter(filters.status as string[] ?? []);
                        setRankFilter(filters.rank as string[] ?? []);
                    }}
                rowKey="id"
                
            />
            <Modal
                title="Personnel Report"
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
    );
};

export default Personnel;