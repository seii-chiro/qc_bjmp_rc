import Spinner from "@/components/loaders/Spinner";
import { PDLs } from "@/lib/pdl-definitions";
import { getUser, PaginatedResponse } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
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
pdfMake.vfs = pdfFonts.vfs;

const ListPDLs = () => {
    const token = useTokenStore().token;
    const [searchText, setSearchText] = useState(""); 
    const [pdl, setpdl] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [downloadLoading, setDownloadLoading] = useState<'pdf' | 'excel' | 'csv' | null>(null);
    const [visitationColumnFilter, setvisitationColumnFilter] = useState<string[]>([]);
    const [statusColumnFilter, setstatusColumnFilter] = useState<string[]>([]);
    const [pdlLoading, setPDLLoading] = useState(true);
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setlimit] = useState(10);

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

    const { data: searchData } = useQuery({
        queryKey: ["pdls", debouncedSearch],
        queryFn: () => fetchPDLs(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching, error } = useQuery({
        queryKey: ['pdl','pdl-table', page, limit, statusColumnFilter, visitationColumnFilter],
        queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();
            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            if (statusColumnFilter.length > 0) {
                params.append("status", statusColumnFilter.join(","));
            }
            if (visitationColumnFilter.length > 0) {
                params.append("visitation_status", visitationColumnFilter.join(","));
            }
            const res = await fetch(`${BASE_URL}/api/pdls/pdl/?${params.toString()}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch PDL data.');
            }

            return res.json();
        },
        keepPreviousData: true,
    });
    
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status") || "all";
    const statusList = status !== "all" ? status.split(",").map(decodeURIComponent) : [];

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
    
    useEffect(() => {
    if (statusList.length > 0 && JSON.stringify(statusColumnFilter) !== JSON.stringify(statusList)) {
        setstatusColumnFilter(statusList);
    }
    }, [statusList, statusColumnFilter]);

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
        const fetchPDLs = async () => {
            try {
                setPDLLoading(true);
                const data = await fetchAllPDLs();
                setpdl(data.results || []);
            } finally {
                setPDLLoading(false);
            }
        };
        fetchPDLs();
    }, []);

    const fetchAllPDLs = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) throw new Error('Network error');
        return res.json();
    };

    const dataSource = (data?.results || []).map((pdl, index) => {

        return {
            key: index + 1 + (page - 1) * limit,
            id: pdl?.id,
            name: `${pdl?.person?.first_name} ${pdl?.person?.middle_name ?? ''} ${pdl?.person?.last_name}`.trim(),
            date_of_birth: pdl?.person?.date_of_birth,
            crime_category: pdl?.cases?.[0]?.crime_category,
            status: pdl?.status,
            date_of_admission: pdl?.date_of_admission,
            visitation_status: pdl?.visitation_status,
            remarks: pdl?.remarks,
        };
    }) || [];

    const columns: ColumnType<PDLs>[] = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'PDL No.',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Full Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Date of Birth',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
        },
        {
            title: 'Case Type',
            dataIndex: 'crime_category',
            key: 'crime_category',
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
            title: 'Date of Commitment',
            dataIndex: 'date_of_admission',
            key: 'date_of_admission',
        },
        {
            title: 'Visiting Eligibility',
            dataIndex: 'visitation_status',
            key: 'visitation_status',
            sorter: (a, b) => a.visitation_status.localeCompare(b.visitation_status),
            filters: visitationFilters,
            filteredValue: visitationColumnFilter,
            onFilter: (value, record) => record.visitation_status === value,
        },
        {
            title: 'Notes',
            dataIndex: 'remarks',
            key: 'remarks',
        }
    ];

    if (isFetching) return <Spinner></Spinner>;
    if (error) return <p>Error: {error.message}</p>;

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
                'PDL No',
                'Full Name',
                'Date of Birth',
                'Case Type',
                'Status',
                'Date of Commitment',
                'Visiting Eligibility',
                'Notes',
            ];

            let body: any[][] = [];

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPDLs();
            } else {
                allData = await fetchPDLs(searchText.trim());
            }
        const allResults = allData?.results || [];
        const pdlResults = allResults?.filter(pdl => {
            const statusValue = pdl?.status ?? '';
            const visitationStatusValue = pdl?.visitation_status ?? '';

            const matchesGlobalStatus = status === "all" || statusValue === status;
            const matchesGlobalVisitationStatus = visitation_status === "all" || visitationStatusValue === visitation_status;

            const matchesColumnStatus = statusColumnFilter.length === 0 || statusColumnFilter.includes(statusValue);
            const matchesColumnVisitation = visitationColumnFilter.length === 0 || visitationColumnFilter.includes(visitationStatusValue);

            return (
                matchesGlobalStatus &&
                matchesColumnStatus &&
                matchesColumnVisitation &&
                matchesGlobalVisitationStatus
            );
        });

    if (pdlResults.length > 0) {
        body = pdlResults.map((pdls: any, index: number) => {
                return [
                (index + 1).toString(),
                pdls?.id ?? '',
                `${pdls?.person?.first_name ?? ''} ${pdls?.person?.middle_name ?? ''} ${pdls?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
                pdls?.person?.date_of_birth,
                pdls?.cases?.[0]?.offense,
                pdls?.status ?? '',
                pdls?.date_of_admission,
                pdls?.visitation_status,
                pdls?.notes,
                ];
            });
        } else {
        body = [['No pdl data available', '', '', '', '', '', '', '', '']];
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
                    text: 'PDL Report',
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

        const fileName = `PDL_Report_${formattedDate}.pdf`;
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
                allData = await fetchAllPDLs();
            } else {
                allData = await fetchPDLs(searchText.trim());
            }
        const allResults = allData?.results || [];
        const pdlResults = allResults?.filter(pdl => {
            const statusValue = pdl?.status ?? '';
            const visitationStatusValue = pdl?.visitation_status ?? '';

            const matchesGlobalStatus = status === "all" || statusValue === status;
            const matchesGlobalVisitationStatus = visitation_status === "all" || visitationStatusValue === visitation_status;

            const matchesColumnStatus = statusColumnFilter.length === 0 || statusColumnFilter.includes(statusValue);
            const matchesColumnVisitation = visitationColumnFilter.length === 0 || visitationColumnFilter.includes(visitationStatusValue);
            
            return (
                matchesGlobalStatus &&
                matchesColumnStatus &&
                matchesColumnVisitation &&
                matchesGlobalVisitationStatus
            );
        });
        const excelData = pdlResults.map((pdl, index) => {

            return {
                'No.': index + 1,
                'PDL No.': pdl?.id ?? '',
                'Full Name': `${pdl?.person?.first_name ?? ''} ${pdl?.person?.middle_name ?? ''} ${pdl?.person?.last_name ?? ''}`.trim(),
                'Date of Birth': pdl?.person?.date_of_birth ?? '',
                'Case Type': pdl?.cases?.[0]?.crime_category ?? '',
                'Status': pdl?.status ?? '',
                'Date of Commitment': pdl?.date_of_admission ?? '',
                'Visiting Eligibility': pdl?.visitation_status ?? '',
                'Notes': pdl?.notes ?? '',
            };
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PDL");

        const fileName = `PDL_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.error('Failed to fetch PDL data:', error);
    }
};

const downloadCSV = async () => {
    try {
        let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllPDLs();
            } else {
                allData = await fetchPDLs(searchText.trim());
            }
        const allResults = allData?.results || [];
        const pdlResults = allResults?.filter(pdl => {
            const statusValue = pdl?.status ?? '';
            const visitationStatusValue = pdl?.visitation_status ?? '';

            const matchesGlobalStatus = status === "all" || statusValue === status;
            const matchesGlobalVisitationStatus = visitation_status === "all" || visitationStatusValue === visitation_status;

            const matchesColumnStatus = statusColumnFilter.length === 0 || statusColumnFilter.includes(statusValue);
            const matchesColumnVisitation = visitationColumnFilter.length === 0 || visitationColumnFilter.includes(visitationStatusValue);
            
            return (
                matchesGlobalStatus &&
                matchesColumnStatus &&
                matchesColumnVisitation &&
                matchesGlobalVisitationStatus
            );
        });

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const headers = [
            'No.',
                'PDL No',
                'Full Name',
                'Date of Birth',
                'Case Type',
                'Status',
                'Date of Commitment',
                'Visiting Eligibility',
                'Notes',
        ];

        const csvData = pdlResults.map((pdls, index) => {
            return [
                (index + 1).toString(),
            pdls?.id ?? '',
            `${pdls?.person?.first_name ?? ''} ${pdls?.person?.middle_name ?? ''} ${pdls?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            pdls?.person?.date_of_birth,
            pdls?.cases?.[0]?.crime_category,
            pdls?.status ?? '',
            pdls?.date_of_admission,
            pdls?.visitation_status,
            pdls?.notes ?? '',
            ];
        });

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `PDL_Report_${formattedDate}.csv`);
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
    });

    return (
        <div className="md:px-10">
                <div className="my-5 flex justify-between">
                    <h1 className="text-2xl font-bold text-[#1E365D]">List of PDL</h1>
                    <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                        <a className="ant-dropdown-link gap-2 flex items-center" onClick={e => e.preventDefault()}>
                            <GoDownload /> {downloadLoading ? 'Processing...' : 'Download'}
                        </a>
                    </Dropdown>
                </div>            
            <div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2 shadow-sm">
                    <Table 
                        loading={isFetching || pdlByStatusLoading || pdlByVisitationStatusLoading}
                        dataSource={
                        debouncedSearch
                            ? (searchData?.results || []).map(mapPDL)
                            : status !== "all"
                                ? (pdlStatusData?.results || []).map(mapPDL)
                                : visitation_status !== "all"
                                ? (pdlVisitationStatusData?.results || []).map(mapPDL)
                                : dataSource
                        } 
                        columns={columns} 
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: totalRecords,
                            showSizeChanger: true, 
                            pageSizeOptions: ['10', '20', '50', '100'], 
                            onChange: (page, pageSize) => {
                                setPage(page);
                                setlimit(pageSize);
                            },
                        }} 
                        onChange={(pagination, filters, sorter) => {
                    setPage(pagination.current || 1);
                        setstatusColumnFilter(filters.status as string[] || []);
                        setvisitationColumnFilter(filters.visitation_status as string[] || []);
                    }}
                    rowKey="id"
                    />
                </div>
            </div>
            
        </div>
    );
}

export default ListPDLs;