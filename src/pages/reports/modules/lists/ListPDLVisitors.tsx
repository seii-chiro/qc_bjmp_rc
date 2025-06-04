import Spinner from "@/components/loaders/Spinner";
import { Visitor as NewVisitorType } from "@/lib/pdl-definitions";
import { getUser, PaginatedResponse } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
import { PersonnelForm } from "@/lib/visitorFormDefinition";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Dropdown, Menu, Spin, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";
import { GoDownload } from "react-icons/go";
import * as XLSX from 'xlsx';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import logoBase64 from "../../assets/logoBase64";
pdfMake.vfs = pdfFonts.vfs;

const ListPersonnel = () => {
    const token = useTokenStore().token; 
    const [pdlVisitor, setPDLVisitor] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setlimit] = useState(10);
    const [downloadLoading, setDownloadLoading] = useState<'pdf' | 'excel' | 'csv' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [pdlVisitorLoading, setPDLVisitorLoading] = useState(true);

    const { data, isFetching, error } = useQuery({
        queryKey: ['visitor','visitor-table', page, limit],
        queryFn: async (): Promise<PaginatedResponse<NewVisitorType>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/visitors/visitor/?page=${page}&limit=${limit}&offset=${offset}`,
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

const fetchMainGateVisits = async () => {
    const res = await fetch(`${BASE_URL}/api/visit-logs/main-gate-visits/`, {
        headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
        },
    });
    if (!res.ok) throw new Error("Failed to fetch main gate visits.");
    return res.json();
    };

    const { data: mainGateVisitData } = useQuery({
    queryKey: ['main-gate-visits'],
    queryFn: fetchMainGateVisits,
});


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
        const fetchPDLVisitor = async () => {
            try {
                setPDLVisitorLoading(true);
                const data = await fetchAllVisitor();
                setPDLVisitor(data.results || []);
            } finally {
                setPDLVisitorLoading(false);
            }
        };
        fetchPDLVisitor();
    }, []);

    const fetchAllVisitor = async () => {
        const res = await fetch(`${BASE_URL}/api/visitors/visitor/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) throw new Error('Network error');
        return res.json();
    };

    const dataSource = (data?.results || []).map((visitor, index) => {
        const fullName = `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.trim();

        // Match using visitor id from the nested visitor object
        const matchingVisit = mainGateVisitData?.results?.find(
            (visit: any) => visit.visitor?.id === visitor.id
        );

        // Get the timestamp in if available
        const timestampIn = matchingVisit?.tracking_logs?.[0]?.timestamp_in
            ? new Date(matchingVisit.tracking_logs[0].timestamp_in).toLocaleString()
            : 'No Timestamp Available';

        // Extract inmate visited from the matched visit
        let inmate_visited = '';
        if (matchingVisit?.visitor?.pdls?.length > 0) {
            inmate_visited = matchingVisit.visitor.pdls
                .map((pdlObj: any) => {
                    const person = pdlObj?.pdl?.person;
                    return person
                        ? `${person.first_name ?? ''} ${person.middle_name ?? ''} ${person.last_name ?? ''}`.trim()
                        : null;
                })
                .filter(Boolean)
                .join(', ');
        }

        return {
            key: index + 1 + (page - 1) * limit,
            id: visitor?.id,
            visitor_reg_no: visitor?.visitor_reg_no,
            name: fullName,
            visitor_type: visitor?.visitor_type,
            gender: visitor?.person?.gender?.gender_option,
            id_number: visitor?.id_number,
            inmate_visited,
            last_visit: timestampIn,
        };
    });


    const columns: ColumnType<PersonnelForm>[] = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Visitor Number',
            dataIndex: 'visitor_reg_no',
            key: 'visitor_reg_no',
        },
        {
            title: 'Visitor Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Visitor Type',
            dataIndex: 'visitor_type',
            key: 'visitor_type',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'ID Type / Number',
            dataIndex: 'id_number',
            key: 'id_number',
        },
        {
            title: 'Inmate Visited',
            dataIndex: 'inmate_visited',
            key: 'inmate_visited',
        },
        {
            title: 'Last Visit Date & Time',
            dataIndex: 'last_visit',
            key: 'last_visit',
        }
    ];
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
                'Visitor Number',
                'Visitor Name',
                'Visitor Type',
                'Gender',
                'ID Type / Number',
                'Inmate Visited',
                'Last Visited',
            ];

            let body: any[][] = [];
            
            const dataToUse = await fetchAllVisitor();
const pdlVisitorResults = dataToUse?.results || [];

if (pdlVisitorResults.length > 0) {
    body = pdlVisitorResults.map((visitor: any, index: number) => {
        const inmate_visited = visitor?.pdls?.map(visitor => {
        const person = visitor?.pdl?.person;
        return person
            ? `${person.first_name} ${person.middle_name ?? ''} ${person.last_name}`.trim()
            : null;
    }).filter(Boolean).join(', ') || 'No Inmates Available';
     const matchingVisit = mainGateVisitData?.results?.find(
            (visit: any) => visit.visitor === visitor.id
        );

        const timestampIn = matchingVisit?.timestamp_in
            ? new Date(matchingVisit.timestamp_in).toLocaleString()
            : 'No Timestamp Available';

            return [
            (index + 1).toString(),
            visitor?.visitor_reg_no ?? '',
            `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            visitor?.visitor_type ?? '',
            visitor?.person?.gender?.gender_option ?? '',
            visitor?.id_number,
            inmate_visited,
            timestampIn,
            ];
        });
        } else {
        body = [['No PDL Visitor data available', '', '', '', '', '', '', '', '']];
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
                    text: 'PDL Visitor Report',
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

        const fileName = `PDL_Visitor_Report_${formattedDate}.pdf`;
        pdfMake.createPdf(docDefinition).download(fileName);
        setIsLoading(false);
    } catch (error) {
        console.error('Error generating PDF:', error);
        setIsLoading(false);
    }
};

const downloadExcel = async () => {
    try {
        const response = await fetchAllVisitor(); 
        const visitorList = response?.results || [];

        if (visitorList.length === 0) {
            console.error('No visitor data available for export.');
            return;
        }

        const excelData = visitorList.map((visitor, index) => {
            const inmate_visited = visitor?.pdls?.map(visitor => {
        const person = visitor?.pdl?.person;
        return person
            ? `${person.first_name} ${person.middle_name ?? ''} ${person.last_name}`.trim()
            : null;
        }).filter(Boolean).join(', ') || 'No Inmates Available';
         const matchingVisit = mainGateVisitData?.results?.find(
            (visit: any) => visit.visitor === visitor.id
        );

        const timestampIn = matchingVisit?.timestamp_in
            ? new Date(matchingVisit.timestamp_in).toLocaleString()
            : 'No Timestamp Available';
            return {
                'No.': index + 1,
                'Visitor Number': visitor?.visitor_reg_no ?? '',
                'Visitor Name': `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
                'Visitor Type': visitor?.visitor_type ?? '',
                'Gender': visitor?.person?.gender?.gender_option ?? '',
                'ID Type / Number': visitor?.id_number,
                'Inmate Visited': inmate_visited,
                'Last Visited': timestampIn,
            };
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Visitor");

        const fileName = `Visitor_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.error('Failed to fetch visitor data:', error);
    }
};

const downloadCSV = async () => {
    try {
        const response = await fetchAllVisitor();
        const visitorList = response?.results || [];

        if (visitorList.length === 0) {
            console.error('No visitor data available for export.');
            return;
        }

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const headers = [
            'No.',
            'Visitor Number',
            'Visitor Name',
            'Visitor Type',
            'Gender',
            'ID Type / Number',
            'Inmate Visited',
            'Last Visited',
        ];

        const csvData = visitorList.map((visitor, index) => {
            const inmate_visited = visitor?.pdls?.map(visitor => {
        const person = visitor?.pdl?.person;
        return person
            ? `${person.first_name} ${person.middle_name ?? ''} ${person.last_name}`.trim()
            : null;
    }).filter(Boolean).join(', ') || 'No Inmates Available';
     const matchingVisit = mainGateVisitData?.results?.find(
            (visit: any) => visit.visitor === visitor.id
        );

        const timestampIn = matchingVisit?.timestamp_in
            ? new Date(matchingVisit.timestamp_in).toLocaleString()
            : 'No Timestamp Available';
            return [
                (index + 1).toString(),
            visitor?.visitor_reg_no ?? '',
            `${visitor?.person?.first_name ?? ''} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
            visitor?.visitor_type ?? '',
            visitor?.person?.gender?.gender_option ?? '',
            visitor?.id_number,
            inmate_visited,
            timestampIn,
            ];
        });

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Visitor_Report_${formattedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
    }
};


    if (isFetching) return <Spinner></Spinner>;
    if (error) return <p>Error: {error.message}</p>;
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

    return (
        <div className="md:px-10">
            <div className="my-5 flex justify-between">
                <h1 className="text-2xl font-bold text-[#1E365D]">List of PDL Visitors</h1>
                <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                    <a className="ant-dropdown-link gap-2 flex items-center" onClick={e => e.preventDefault()}>
                        <GoDownload /> {downloadLoading ? 'Processing...' : 'Download'}
                    </a>
                </Dropdown>
            </div>
            <div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2 shadow-sm">
                    <Table 
                        dataSource={dataSource} 
                        columns={columns} 
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: data?.count,
                            showSizeChanger: true, 
                            pageSizeOptions: ['10', '20', '50', '100'], 
                            onChange: (page, pageSize) => {
                                setPage(page);
                                setlimit(pageSize);
                            },
                        }} 
                    />
                </div>
            </div>
        </div>
    );
}

export default ListPersonnel;