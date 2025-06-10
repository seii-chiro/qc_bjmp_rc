import Spinner from "@/components/loaders/Spinner";
import { PersonnelType } from "@/lib/definitions";
import { getUser, PaginatedResponse } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
import { PersonnelForm } from "@/lib/visitorFormDefinition";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Dropdown, Menu, Spin, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";
import { GoDownload } from "react-icons/go";
import * as XLSX from 'xlsx';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logoBase64 from "../../assets/logoBase64";
import { useSearchParams } from "react-router-dom";
import { Personnel } from "@/lib/pdl-definitions";
pdfMake.vfs = pdfFonts.vfs;

const ListPersonnel = () => {
    const token = useTokenStore().token; 
    const [searchText, setSearchText] = useState("");
    const [personnel, setPersonnel] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [personnelLoading, setPersonnelLoading] = useState(true);
    const [downloadLoading, setDownloadLoading] = useState<'pdf' | 'excel' | 'csv' | null>(null);
    const [rankFilter, setRankFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

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

    const { data, isFetching, error } = useQuery({
        queryKey: ['personnel', 'personnel-table', page, limit,        statusFilter, rankFilter,],
        queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));
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

            const res = await fetch(`${BASE_URL}/api/codes/personnel/?${params.toString()}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Personnel data.');
            }

            return res.json();
        },
        keepPreviousData: true,
    });

    const [searchParams] = useSearchParams();
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

    const rankFilters = rankData?.results?.map(rank => ({
    text: `${rank.rank_name} (${rank.rank_code})`,
    value: `${rank.rank_name} (${rank.rank_code})`,
    })) ?? [];

    const statusFilters = statusData?.results?.map(status => ({
    text: status.name,
    value: status.name ,
    })) ?? [];

    const fetchOrganization = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/organizations/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const { data: organizationData } = useQuery({
        queryKey: ['org'],
        queryFn: fetchOrganization,
    });

    useEffect(() => {
      if (organizationData?.results?.length > 0) {
        setOrganizationName(organizationData.results[0]?.org_name ?? '');
      }
    }, [organizationData]);

    useEffect(() => {
        const fetchPersonnel = async () => {
            try {
                setPersonnelLoading(true);
                const data = await fetchAllPersonnel();
                setPersonnel(data.results || []);
            } finally {
                setPersonnelLoading(false);
            }
        };
        fetchPersonnel();
    }, []);

    const fetchAllPersonnel = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) throw new Error('Network error');
        return res.json();
    };

    const dataSource = (data?.results || []).map((personnel, index) => {
        const phoneContact = personnel?.person?.contacts?.find(contact => contact.type === 'Phone');
        const emailContact = personnel?.person?.contacts?.find(contact => contact.type === 'Email');

        return {
            key: index + 1 + (page - 1) * limit,
            id: personnel?.id,
            personnel_reg_no: personnel?.personnel_reg_no ?? '',
            person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ?? ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            position: personnel?.person?.position ?? '',
            rank: personnel?.rank ?? '',
            department: personnel?.designations?.[0]?.name ?? '',
            status: personnel?.status ?? '',
            contact_no: phoneContact ? phoneContact.value : '',
            email: emailContact ? emailContact.value : '',
        };
    }) || [];

    const columns: ColumnType<Personnel>[] = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Employee ID',
            dataIndex: 'personnel_reg_no',
            key: 'personnel_reg_no',
        },
        {
            title: 'Full Name',
            dataIndex: 'person',
            key: 'person',
            sorter: (a, b) => a.person.localeCompare(b.person),
        },
        {
            title: 'Position',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Rank/Grade',
            dataIndex: 'rank',
            key: 'rank',
            sorter: (a, b) => a.rank.localeCompare(b.rank),
            filters: rankFilters,
            filteredValue: rankFilter,
            onFilter: (value, record) => record.rank === value,
        },
        {
            title: 'Department/Unit',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: statusFilters,
            filteredValue: statusFilter,
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Contact No.',
            dataIndex: 'contact_no',
            key: 'contact_no',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        }
    ];

    const generatePDF = async () => {
        const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : '';
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;
        // const reportReferenceNo = `TAL-${formattedDate}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        setIsLoading(true);
        setLoadingMessage('Generating PDF... Please wait.');

        try {
            let headers: string[] = [
                'No.',
                'Employee ID',
                'Full Name',
                'Position',
                'Rank/Grade',
                'Department/Unit',
                'Status',
                'Contact No.',
                'Email'
            ];

            let body: any[][] = [];
            
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPersonnel();
            } else {
                allData = await fetchPersonnels(searchText.trim());
            }
            const allResults = allData?.results || [];

            const filteredResults = allResults.filter(personnel => {
                const statusValue = personnel?.status ?? '';
                const rankValue = personnel?.rank ?? '';

                const matchesGlobalStatus = status === "all" || statusValue === status;
                const matchesGlobalRank = rank === "all" || rankValue === rank;

                const matchesColumnStatus = statusFilter.length === 0 || statusFilter.includes(statusValue);
                const matchesColumnRank = rankFilter.length === 0 || rankFilter.includes(rankValue);

                return (
                    matchesGlobalStatus &&
                    matchesColumnStatus &&
                    matchesColumnRank &&
                    matchesGlobalRank
                );
            });

if (filteredResults.length > 0) {
    body = filteredResults.map((person: any, index: number) => {
            const phoneContact = person?.person?.contacts?.find((contact: any) => contact.type === 'Phone');
            const emailContact = person?.person?.contacts?.find((contact: any) => contact.type === 'Email');

            return [
            (index + 1).toString(),
            person?.personnel_reg_no ?? '',
            `${person?.person?.first_name ?? ''} ${person?.person?.middle_name ?? ''} ${person?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            person?.person?.position ?? '',
            person?.rank ?? '',
            person?.designations?.[0]?.name ?? '',
            person?.status ?? '',
            phoneContact ? phoneContact.value : '',
            emailContact ? emailContact.value : ''
            ];
        });
        } else {
        body = [['No personnel data available', '', '', '', '', '', '', '', '']];
        }

        const displayedHeaders = headers;
        const displayedBody = body;

        const columnThreshold = 7; 
        const pageOrientation = displayedHeaders.length > columnThreshold ? 'landscape' : 'portrait';
        const columnWidths = ['auto', ...Array(displayedHeaders.length - 1).fill('*')];

        const docDefinition = {
            pageSize: 'A4',
            pageOrientation,
            pageMargins: [40, 60, 40, 60],
            content: [
                {
                    text: 'Personnel Report',
                    style: 'header',
                    alignment: 'left',
                    margin: [0, 0, 0, 0],
                },
                {
                    columns: [
                        {
                            stack: [
                                {
                                    text: organizationName,
                                    style: 'subheader',
                                    margin: [0, 5, 0, 10],
                                },
                                {
                                    text: [
                                        { text: `Report Date: `, bold: true },
                                        formattedDate + '\n',
                                        { text: `Prepared By: `, bold: true },
                                        preparedByText + '\n',
                                        { text: `Department/Unit: `, bold: true },
                                        'IT\n',
                                        { text: `Report Reference No.: `, bold: true },
                                        reportReferenceNo,
                                    ],
                                    fontSize: 10,
                                },
                            ],
                            alignment: 'left',
                            width: '70%',
                        },
                        {
                            stack: [
                                {
                                    image: logoBase64,
                                    width: 90,
                                },
                            ],
                            alignment: 'right',
                            width: '30%',
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: columnWidths,
                        body: [
                            displayedHeaders.map(header => ({ text: header, style: 'tableHeader', noWrap: false })),
                            ...displayedBody.map(row =>
                                row.map(cell => ({
                                    text: cell || '',
                                    noWrap: false, 
                                    alignment: 'left', 
                                    fontSize: 8
                                }))
                            ),
                        ],
                    },
                    layout: {
                        fillColor: function (rowIndex: number) {
                            return rowIndex === 0 ? '#DCE6F1' : null;
                        },
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#aaa',
                        vLineColor: () => '#aaa',
                        paddingLeft: () => 4,
                        paddingRight: () => 4,
                    },
                    pageBreak: 'auto',
                    width: '100%',
                },
            ],
            footer: (currentPage: number, pageCount: number) => ({
                columns: [
                    {
                        text: `Document Version: 1.0\nConfidentiality Level: Internal use only\nContact Info: ${preparedByText}\nTimestamp of Last Update: ${formattedDate}`,
                        fontSize: 8,
                        alignment: 'left',
                        margin: [40, 10],
                    },
                    {
                        text: `${currentPage} / ${pageCount}`,
                        fontSize: 8,
                        alignment: 'right',
                        margin: [0, 10, 40, 0],
                    },
                ],
            }),
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    color: '#0066CC',
                },
                tableHeader: {
                    bold: true,
                    fontSize: 11,
                    color: 'black',
                },
                tableExample: {
                    margin: [0, 5, 0, 15],
                    fontSize: 9,
                },
                subheader: {
                    fontSize: 12,
                    bold: false,
                },
            },
        };

        const fileName = `Personnel_Report_${formattedDate}.pdf`;
        pdfMake.createPdf(docDefinition).download(fileName);
        setIsLoading(false);
    } catch (error) {
        console.error('Error generating PDF:', error);
        setIsLoading(false);
    }
};

const downloadExcel = async () => {
    try {
        let allData;
                if (searchText.trim() === '') {
                    allData = await fetchAllPersonnel();
                } else {
                    allData = await fetchPersonnels(searchText.trim());
                }
                const allResults = allData?.results || [];

                const filteredResults = allResults.filter(personnel => {
                    const statusValue = personnel?.status ?? '';
                    const rankValue = personnel?.rank ?? '';

                    const matchesGlobalStatus = status === "all" || statusValue === status;
                    const matchesGlobalRank = rank === "all" || rankValue === rank;

                    const matchesColumnStatus = statusFilter.length === 0 || statusFilter.includes(statusValue);
                    const matchesColumnRank = rankFilter.length === 0 || rankFilter.includes(rankValue);

                    return (
                        matchesGlobalStatus &&
                        matchesColumnStatus &&
                        matchesColumnRank &&
                        matchesGlobalRank
                    );
                });

        const excelData = filteredResults.map((person, index) => {
            const phoneContact = person?.person?.contacts?.find(contact => contact.type === 'Phone');
            const emailContact = person?.person?.contacts?.find(contact => contact.type === 'Email');

            return {
                'No.': index + 1,
                'Employee ID': person?.personnel_reg_no ?? '',
                'Full Name': `${person?.person?.first_name ?? ''} ${person?.person?.middle_name ?? ''} ${person?.person?.last_name ?? ''}`.trim(),
                'Position': person?.person?.position ?? '',
                'Rank/Grade': person?.rank ?? '',
                'Department/Unit': person?.designations?.[0]?.name ?? '',
                'Status': person?.status ?? '',
                'Contact No.': phoneContact?.value ?? '',
                'Email': emailContact?.value ?? ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Personnel");

        const fileName = `Personnel_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.error('Failed to fetch personnel data:', error);
    }
};

const downloadCSV = async () => {
    try {

        let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPersonnel();
            } else {
                allData = await fetchPersonnels(searchText.trim());
            }
            const allResults = allData?.results || [];

            const filteredResults = allResults.filter(personnel => {
                const statusValue = personnel?.status ?? '';
                const rankValue = personnel?.rank ?? '';

                const matchesGlobalStatus = status === "all" || statusValue === status;
                const matchesGlobalRank = rank === "all" || rankValue === rank;

                const matchesColumnStatus = statusFilter.length === 0 || statusFilter.includes(statusValue);
                const matchesColumnRank = rankFilter.length === 0 || rankFilter.includes(rankValue);

                return (
                    matchesGlobalStatus &&
                    matchesColumnStatus &&
                    matchesColumnRank &&
                    matchesGlobalRank
                );
            });

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const headers = [
            'No.',
            'Employee ID',
            'Full Name',
            'Position',
            'Rank/Grade',
            'Department/Unit',
            'Status',
            'Contact No.',
            'Email'
        ];

        const csvData = filteredResults.map((person, index) => {
            const phoneContact = person?.person?.contacts?.find(contact => contact.type === 'Phone');
            const emailContact = person?.person?.contacts?.find(contact => contact.type === 'Email');

            return [
                index + 1,
                person?.personnel_reg_no ?? '',
                `${person?.person?.first_name ?? ''} ${person?.person?.middle_name ?? ''} ${person?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
                person?.person?.position ?? '',
                person?.rank ?? '',
                person?.designations?.[0]?.name ?? '',
                person?.status ?? '',
                phoneContact?.value ?? '',
                emailContact?.value ?? ''
            ];
        });

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Personnel_Report_${formattedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
    }
};

const handleDownloadWrapper = async (type: 'pdf' | 'excel' | 'csv') => {
    setDownloadLoading(type);
    try {
        if (type === 'pdf') {
            await generatePDF();
        } else if (type === 'excel') {
            await downloadExcel();
        } else if (type === 'csv') {
            await downloadCSV();
        }
    } catch (error) {
        console.error(`Error generating ${type.toUpperCase()}:`, error);
    } finally {
        setDownloadLoading(null);
    }
};

const menu = (
    <Menu>
        <Menu.Item key="pdf" disabled={downloadLoading !== null} onClick={() => handleDownloadWrapper('pdf')}>
            <div className="flex items-center gap-2 font-semibold">
                {downloadLoading === 'pdf' ? <Spin size="small" /> : <GoDownload />}
                {downloadLoading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
            </div>
        </Menu.Item>
        <Menu.Item key="excel" disabled={downloadLoading !== null} onClick={() => handleDownloadWrapper('excel')}>
            <div className="flex items-center gap-2 font-semibold">
                {downloadLoading === 'excel' ? <Spin size="small" /> : <GoDownload />}
                {downloadLoading === 'excel' ? 'Generating Excel...' : 'Download Excel'}
            </div>
        </Menu.Item>
        <Menu.Item key="csv" disabled={downloadLoading !== null} onClick={() => handleDownloadWrapper('csv')}>
            <div className="flex items-center gap-2 font-semibold">
                {downloadLoading === 'csv' ? <Spin size="small" /> : <GoDownload />}
                {downloadLoading === 'csv' ? 'Generating CSV...' : 'Download CSV'}
            </div>
        </Menu.Item>
    </Menu>
);

    const totalRecords = debouncedSearch 
    ? data?.count || 0
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

        if (isFetching) return <Spinner />;
            if (error) return <p>Error: {error.message}</p>;
            return (
                <div className="md:px-10">
                    <div className="my-5 flex justify-between">
                        <h1 className="text-2xl font-bold text-[#1E365D]">List of Personnel</h1>
                        <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
            <a className="ant-dropdown-link gap-2 flex items-center" onClick={e => e.preventDefault()}>
                <GoDownload /> {downloadLoading ? 'Processing...' : 'Download'}
            </a>
        </Dropdown>
            </div>
            <div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2 shadow-sm">
            <Table
                loading={isFetching || searchLoading || personnelByStatusLoading || personnelByRankLoading}
                columns={columns}
                dataSource={
                    debouncedSearch
                        ? (searchData?.results || []).map(mapPersonnel)
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
                        setStatusFilter(filters.status as string[] ?? []);
                        setRankFilter(filters.rank as string[] ?? []);
                    }}
                rowKey="id"
                
            />
                </div>
            </div>
        </div>
    );
}

export default ListPersonnel;

function setLoadingMessage(arg0: string) {
    throw new Error("Function not implemented.");
}
