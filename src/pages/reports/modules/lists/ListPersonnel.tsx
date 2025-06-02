import Spinner from "@/components/loaders/Spinner";
import { PersonnelType } from "@/lib/definitions";
import { getUser, PaginatedResponse } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
import { PersonnelForm } from "@/lib/visitorFormDefinition";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Dropdown, Menu, Table } from "antd";
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
    const [personnel, setPersonnel] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [personnelLoading, setPersonnelLoading] = useState(true);
    
    // const [pdfDataUrl, setPdfDataUrl] = useState('');
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    // const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data, isFetching, error } = useQuery({
        queryKey: ['personnel', 'personnel-table', page, limit],
        queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/codes/personnel/?page=${page}&limit=${limit}&offset=${offset}`,
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

    const columns: ColumnType<PersonnelForm>[] = [
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
            
            const dataToUse = await fetchAllPersonnel();
const personnelResults = dataToUse?.results || [];

if (personnelResults.length > 0) {
    body = personnelResults.map((person: any, index: number) => {
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
        const response = await fetchAllPersonnel(); 
        const personnelList = response?.results || [];

        if (personnelList.length === 0) {
            console.error('No personnel data available for export.');
            return;
        }

        const excelData = personnelList.map((person, index) => {
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
        const response = await fetchAllPersonnel();
        const personnelList = response?.results || [];

        if (personnelList.length === 0) {
            console.error('No personnel data available for export.');
            return;
        }

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

        const csvData = personnelList.map((person, index) => {
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

const menu = (
    <Menu>
        <Menu.Item key="pdf" onClick={generatePDF}>
            <div className="flex items-center gap-2 font-semibold">
                <GoDownload />
                Download PDF
            </div>
        </Menu.Item>
        <Menu.Item key="excel" onClick={downloadExcel}>
            <div className="flex items-center gap-2 font-semibold">
                <GoDownload />
                Download Excel
            </div>
        </Menu.Item>
        <Menu.Item key="csv" onClick={downloadCSV}>
            <div className="flex items-center gap-2 font-semibold">
                <GoDownload />
                Download CSV
            </div>
        </Menu.Item>
    </Menu>
);

if (isFetching) return <Spinner />;
    if (error) return <p>Error: {error.message}</p>;
    return (
        <div className="md:px-10">
            <div className="my-5 flex justify-between">
                <h1 className="text-2xl font-bold text-[#1E365D]">List of Personnel</h1>
                <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                    <a className="ant-dropdown-link gap-2 flex items-center" onClick={e => e.preventDefault()}>
                        <GoDownload /> Download
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
                                setLimit(pageSize);
                            },
                        }} 
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
