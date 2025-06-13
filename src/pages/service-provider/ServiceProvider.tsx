import { getProvidedServices, getServiceProviderTypes } from "@/lib/additionalQueries";
import { getOrganization, getPerson, getUser, PaginatedResponse } from "@/lib/queries";
import { deleteServiceProvider } from "@/lib/query";
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

export interface ServiceProviderPayload {
    key: number;
    id: number;
    sp_reg_no: string;
    serv_prov_type: number;
    provided_service: number;
    visitor_type: string;
    group_affiliation: string;
    person: number;
}
const ServiceProvider = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    
    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
    };

    const fetchServiceProvider = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/service-providers/service-providers/?search=${search}`, {
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
        queryKey: ["service-provider", debouncedSearch],
        queryFn: () => fetchServiceProvider(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "service-provider",
            "service-provider-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<ServiceProviderPayload>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/service-providers/service-providers/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Service Provider data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const { data: PersonsData } = useQuery({
        queryKey: ['person'],
        queryFn: () => getPerson(token ?? ""),
    });
    const personsArray = PersonsData?.results || [];

    const { data: SPTypeData } = useQuery({
        queryKey: ['sptype-data'],
        queryFn: () => getServiceProviderTypes(token ?? ""),
    });
    const sptypeArray = SPTypeData?.results || [];

    const { data: ServiceProvidedData } = useQuery({
        queryKey: ['service-provided'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/service-providers/provided-services/`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },
            });
            if (!res.ok) throw new Error('Failed to fetch Service Provided');
            return res.json();
        },
        enabled: !!token,
        });

    const serviceArray = ServiceProvidedData?.results || [];

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const { data: OrganizationData } = useQuery({
        queryKey: ['organization'],
        queryFn: () => getOrganization(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteServiceProvider(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["service-provider"] });
            messageApi.success("Service Provider deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Service Provider");
        },
    });

    const dataSource = data?.results?.map((provider, index) => {
        const matchedPerson = personsArray.find(person => person.id === provider.person);
        const matchedSPtype = sptypeArray.find(type => type.id === provider.serv_prov_type);
        const matchedService = serviceArray.find(service => service.id === provider.provided_service);
        
        return {
            key: index + 1,
            id: provider?.id,
            sp_reg_no: provider?.sp_reg_no,
            serv_prov_type: matchedSPtype?.serv_prov_type,
            service_provided: matchedService?.service_provided,
            visitor_type: provider?.visitor_type,
            group_affiliation: provider?.group_affiliation,
            person: `${matchedPerson?.first_name || ''} ${matchedPerson?.middle_name ? matchedPerson?.middle_name[0] + '.' : ''} ${matchedPerson?.last_name || ''}`.replace(/\s+/g, ' ').trim(), 
        };
    }) || [];

    const columns: ColumnsType<ServiceProviderPayload> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Provided Service',
            dataIndex: 'service_provided',
            key: 'service_provided',
            sorter: (a, b) => a.service_provided.localeCompare(b.service_provided),
        },
        {
            title: 'SP No.',
            dataIndex: 'sp_reg_no',
            key: 'sp_reg_no',
            sorter: (a, b) => a.sp_reg_no.localeCompare(b.sp_reg_no),
        },
        {
            title: 'SP Type',
            dataIndex: 'serv_prov_type',
            key: 'serv_prov_type',
            sorter: (a, b) => a.serv_prov_type.localeCompare(b.serv_prov_type),
        },
        {
            title: 'Person',
            dataIndex: 'person',
            key: 'person',
            sorter: (a, b) => a.person.localeCompare(b.person),
        },
        {
            title: 'Visitor Type',
            dataIndex: 'visitor_type',
            key: 'visitor_type',
            sorter: (a, b) => a.visitor_type.localeCompare(b.visitor_type),
        },
        {
            title: 'Group Affiliation',
            dataIndex: 'group_affiliation',
            key: 'group_affiliation',
            sorter: (a, b) => a.group_affiliation.localeCompare(b.group_affiliation),
        },
        {
            title: "Action",
            key: "action",
            fixed: 'right',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button type="link" >{/*onClick={() => handleEdit(record)} */}
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

    const fetchAllServiceProvider = async () => {
        const res = await fetch(`${BASE_URL}/api/service-providers/service-providers/?limit=1000`, {
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
            const PreparedBy = `${UserData?.results?.[0]?.first_name || ''} ${UserData?.results?.[0]?.last_name || ''}`; 

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 16; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllServiceProvider();
            } else {
                allData = await fetchServiceProvider(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((provider, index) => {
                const matchedPerson = personsArray.find(person => person.id === provider.person);
                const matchedSPtype = sptypeArray.find(type => type.id === provider.serv_prov_type);
                const matchedService = serviceArray.find(service => service.id === provider.provided_service);
                
                return {
                    key: index + 1,
                    id: provider?.id,
                    sp_reg_no: provider?.sp_reg_no,
                    serv_prov_type: matchedSPtype?.serv_prov_type,
                    service_provided: matchedService?.service_provided,
                    visitor_type: provider?.visitor_type,
                    group_affiliation: provider?.group_affiliation,
                    person: `${matchedPerson?.first_name || ''} ${matchedPerson?.middle_name ? matchedPerson?.middle_name[0] + '.' : ''} ${matchedPerson?.last_name || ''}`.replace(/\s+/g, ' ').trim(), 
                };
            });

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
                doc.text("Service Provider Report", 10, 15); 
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
                item.sp_reg_no || '',
                item.person || '',
                item.serv_prov_type || '',
                item.service_provided || '',
                item.visitor_type || '',
                item.group_affiliation || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'SP Reg. No', 'Service Provider Type', 'Name', 'Visitor Type', 'Group Affiliation']],
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
                allData = await fetchAllServiceProvider();
            } else {
                allData = await fetchServiceProvider(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((provider, index) => {
                const matchedPerson = personsArray.find(person => person.id === provider.person);
                const matchedSPtype = sptypeArray.find(type => type.id === provider.serv_prov_type);
                const matchedService = serviceArray.find(service => service.id === provider.provided_service);
                
                return {
                    key: index + 1,
                    id: provider?.id,
                    sp_reg_no: provider?.sp_reg_no,
                    serv_prov_type: matchedSPtype?.serv_prov_type,
                    service_provided: matchedService?.service_provided,
                    visitor_type: provider?.visitor_type,
                    group_affiliation: provider?.group_affiliation,
                    person: `${matchedPerson?.first_name || ''} ${matchedPerson?.middle_name ? matchedPerson?.middle_name[0] + '.' : ''} ${matchedPerson?.last_name || ''}`.replace(/\s+/g, ' ').trim(), 
                };
            });

        const exportData = printSource.map((sp, index) => {
            return {
                "No.": index + 1,
                "SP Registration No.": sp?.sp_reg_no,
                "Name": sp?.person,
                "Service Provided": sp?.service_provided,
                "Service Provider Type": sp?.serv_prov_type,
                "Visitor Type": sp?.visitor_type,
                "Group Affiliation": sp?.group_affiliation,
                
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ServiceProvider");
        XLSX.writeFile(wb, "ServiceProvider.xlsx");
    };

        const handleExportCSV = async () => {
        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllServiceProvider();
            } else {
                allData = await fetchServiceProvider(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((provider, index) => {
                const matchedPerson = personsArray.find(person => person.id === provider.person);
                const matchedSPtype = sptypeArray.find(type => type.id === provider.serv_prov_type);
                const matchedService = serviceArray.find(service => service.id === provider.provided_service);
                
                return {
                    key: index + 1,
                    id: provider?.id,
                    sp_reg_no: provider?.sp_reg_no,
                    serv_prov_type: matchedSPtype?.serv_prov_type,
                    service_provided: matchedService?.service_provided,
                    visitor_type: provider?.visitor_type,
                    group_affiliation: provider?.group_affiliation,
                    person: `${matchedPerson?.first_name || ''} ${matchedPerson?.middle_name ? matchedPerson?.middle_name[0] + '.' : ''} ${matchedPerson?.last_name || ''}`.replace(/\s+/g, ' ').trim(), 
                };
            });

        const exportData = printSource.map((sp, index) => {
            return {
                "No.": index + 1,
                "SP Registration No.": sp?.sp_reg_no,
                "Name": sp?.person,
                "Service Provided": sp?.service_provided,
                "Service Provider Type": sp?.serv_prov_type,
                "Visitor Type": sp?.visitor_type,
                "Group Affiliation": sp?.group_affiliation,
                
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
            link.setAttribute("download", "ServiceProvider.csv");
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

    const mapServiceProvider = ((provider, index) => {
        const matchedPerson = personsArray.find(person => person.id === provider.person);
        const matchedSPtype = sptypeArray.find(type => type.id === provider.serv_prov_type);
        const matchedService = serviceArray.find(service => service.id === provider.provided_service);
        
        return {
            key: index + 1,
            id: provider?.id,
            sp_reg_no: provider?.sp_reg_no,
            serv_prov_type: matchedSPtype?.serv_prov_type,
            service_provided: matchedService?.service_provided,
            visitor_type: provider?.visitor_type,
            group_affiliation: provider?.group_affiliation,
            person: `${matchedPerson?.first_name || ''} ${matchedPerson?.middle_name ? matchedPerson?.middle_name[0] + '.' : ''} ${matchedPerson?.last_name || ''}`.replace(/\s+/g, ' ').trim(), 
        };
    });

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">Service Provider</h1>
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
                loading={isFetching || searchLoading}
                columns={columns}
                    dataSource={debouncedSearch
                            ? (searchData?.results || []).map(mapServiceProvider)
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
                title="Service Provider Report"
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

export default ServiceProvider
