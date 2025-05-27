/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useSearchParams } from 'react-router';
import { PersonnelForm } from "@/lib/issues-difinitions";
import { getUser } from "@/lib/queries";
import { deletePersonnel } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Input, Menu, message, Modal, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { useEffect, useMemo, useRef, useState } from "react";
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
    const limit = 10;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    // const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [allPersonnel, setAllPersonnel] = useState<PersonnelType[]>([]);

    // useEffect(() => {
    //     const fetchAll = async () => {
    //         const res = await fetch(`${BASE_URL}/api/codes/personnel/?limit=10000`, {
    //             headers: {
    //                 Authorization: `Token ${token}`,
    //                 "Content-Type": "application/json",
    //             },
    //         });
    //         if (res.ok) {
    //             const data = await res.json();
    //             setAllPersonnel(data.results || []);
    //         }
    //     };
    //     fetchAll();
    // }, [token]);

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
        queryKey: ["visitors", debouncedSearch],
        queryFn: () => fetchPersonnels(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: ['personnel', 'personnel-table', page],
        queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
            // Add offset parameter for Django REST Framework's pagination
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
        behavior: keepPreviousData(),
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
    const genderParam = searchParams.get("gender") || "all";
    const genderList = genderParam !== "all" ? genderParam.split(",").map(decodeURIComponent) : [];

    const fetchPersonnelGender = async (genders: string[]) => {
        const url = `${BASE_URL}/api/codes/personnel/?gender=${genders}&limit=${limit}`;
        const res = await fetch(url, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
    
        const result = await res.json();
    
        if (genders.length === 0 || genders[0] === "all") {
            return result; // No filtering
        }
    
        result.results = result.results.filter(visitor => {
            const genderOption = visitor?.person?.gender?.gender_option;
            return genders.includes(genderOption);
        });
        return result;
    };

    const { data: personnelGenderData, isLoading: personnelsByGenderLoading } = useQuery({
        queryKey: ["personnel", genderList],
        queryFn: () => fetchPersonnelGender(genderList),
        enabled: !!token,
    });

    const genderFilteredPersonnelIds = new Set(
        (personnelGenderData?.results || []).map(personnel => personnel.id)
    );

    const status = searchParams.get("status") || "all";
    const statusParam = searchParams.get("status") || "all";
    const statusList = statusParam !== "all" ? statusParam.split(",").map(decodeURIComponent) : [];

    const fetchPersonnelStatus= async (status: string[]) => {
        const hasFilters = status.length > 0 && status[0] !== "all";
        const statusQuery = hasFilters
            ? status.map(g => `status=${encodeURIComponent(g)}`).join("&")
            : "";

        const url = `${BASE_URL}/api/codes/personnel/?status=${statusQuery}`;

        const res = await fetch(url, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: personnelStatusData, isLoading: personnelByStatusLoading } = useQuery({
        queryKey: ["personnel", statusList],
        queryFn: () => fetchPersonnelStatus(statusList),
        enabled: !!token,
    });

    const statusFilteredPersonnelIds = new Set(
        (personnelStatusData?.results || []).map(personnel => personnel.id)
    );

    const dataSource = (data?.results || []).filter(personnel =>
    gender === "all" ? true : genderFilteredPersonnelIds.has(personnel.id) && 
    status === "all" ? true : statusFilteredPersonnelIds.has(personnel.id) 
    ).map((personnel, index) => ({
        key: index + 1,
                id: personnel?.id,
                personnel_reg_no: personnel?.personnel_reg_no ?? '',
                person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ?? ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
                shortname: personnel?.person?.shortname ?? '',
                rank: personnel?.rank ?? '',
                status: personnel?.status ?? '',
                gender: personnel?.person?.gender?.gender_option ?? '',
                date_joined: personnel?.date_joined ?? '',
                record_status: personnel?.record_status ?? '',
                updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const filteredData = dataSource?.filter(personnel => {
        const matchesSearch = Object.values(personnel).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );
        return matchesSearch;
    });

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
            filters: [
                ...Array.from(
                    new Set(
                        allPersonnel.map(item => item.personnel_reg_no ?? '')
                    )
                )
                    .filter(personnel_reg_no => personnel_reg_no)
                    .map(personnel_reg_no => ({
                        text: personnel_reg_no,
                        value: personnel_reg_no,
                    }))
            ],
            onFilter: (value, record) => record.personnel_reg_no === value,
        },
        {
            title: 'Personnel',
            dataIndex: 'person',
            key: 'person',
            sorter: (a, b) => a.person.localeCompare(b.person),
            filters: [
                ...Array.from(
                    new Set(
                        allPersonnel.map(
                            item => `${item.person?.first_name ?? ''} ${item.person?.middle_name ?? ''} ${item.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim()
                        )
                    )
                )
                    .filter(person => person)
                    .map(person => ({
                        text: person,
                        value: person,
                    }))
            ],
            onFilter: (value, record) => record.person === value,
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            sorter: (a, b) => a.gender.localeCompare(b.gender),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.gender))
                ).map(gender => ({
                    text: gender,
                    value: gender,
                }))
            ],
            onFilter: (value, record) => record.gender === value,
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            sorter: (a, b) => a.rank.localeCompare(b.rank),
            filters: [
                ...Array.from(
                    new Set(allPersonnel.map(item => item.rank))
                ).map(rank => ({
                    text: rank,
                    value: rank,
                }))
            ],
            onFilter: (value, record) => record.rank === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: [
                ...Array.from(
                    new Set(allPersonnel.map(item => item.status))
                ).map(status => ({
                    text: status,
                    value: status,
                }))
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <NavLink to={"/jvms/personnels/personnel/update"} state={{ personnel: record }} className="text-blue-500 hover:text-blue-700 flex items-center">
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

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(dataSource);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Personnel");
        XLSX.writeFile(wb, "Personnel.xlsx");
    };

    const fetchAllPersonnels = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
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

        if (debouncedSearch && debouncedSearch.trim().length > 0) {
        printSource = (searchData?.results || []).map((personnel, index) => {
            return {
                id: personnel?.id,
                    key: index + 1,
                    organization: personnel?.organization ?? '',
                    personnel_reg_no: personnel?.personnel_reg_no ?? '',
                    person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ?? ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
                    shortname: personnel?.person?.shortname ?? '',
                    rank: personnel?.rank ?? '',
                    status: personnel?.status ?? '',
                    gender:
                    (personnel?.person?.gender?.gender_option === "Male" || personnel?.person?.gender?.gender_option === "Female")
                        ? personnel?.person?.gender?.gender_option
                        : "Others",
                    date_joined: personnel?.date_joined ?? '',
                    record_status: personnel?.record_status ?? '',
                    updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
            };
        });
        
        lastPrintIndexRef.current = 0; 
    } else {
        const allData = await fetchAllPersonnels();
        const allResults = allData?.results || [];
        printSource = allResults
            .slice(lastPrintIndexRef.current, lastPrintIndexRef.current + MAX_ROWS_PER_PRINT)
            .map((personnel, index) => {
                return {
                    id: personnel?.id,
                    key: index + 1,
                    organization: personnel?.organization ?? '',
                    personnel_reg_no: personnel?.personnel_reg_no ?? '',
                    person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ? personnel.person.middle_name[0] + '.' : ''} ${personnel?.person?.last_name ?? ''}`.replace(/\s+/g, ' ').trim(),
                    shortname: personnel?.person?.shortname ?? '',
                    rank: personnel?.rank ?? '',
                    status: personnel?.status ?? '',
                    gender:
                    (personnel?.person?.gender?.gender_option === "Male" || personnel?.person?.gender?.gender_option === "Female")
                        ? personnel?.person?.gender?.gender_option
                        : "Others",
                    date_joined: personnel?.date_joined ?? '',
                    record_status: personnel?.record_status ?? '',
                    updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
                };
            });
        lastPrintIndexRef.current += MAX_ROWS_PER_PRINT;
        if (lastPrintIndexRef.current >= allResults.length) {
            lastPrintIndexRef.current = 0;
        }
    }
            const organizationName = printSource[0]?.organization || "";
            const PreparedBy = printSource[0]?.updated_by || '';
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const MAX_ROWS_PER_PAGE = 26; 
            let startY = headerHeight;

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

            for (let i = 0; i < tableData.length; i += MAX_ROWS_PER_PAGE) {
                const pageData = tableData.slice(i, i + MAX_ROWS_PER_PAGE);

                autoTable(doc, {
                    head: [['No.', 'Personnel No.', 'Name', 'Gender', 'Rank', 'Status']],
                    body: pageData,
                    startY: startY,
                    margin: { top: 0, left: 10, right: 10 },
                    didDrawPage: function () {
                        if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                            addHeader();
                        }
                    },
                });

                if (i + MAX_ROWS_PER_PAGE < tableData.length) {
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
            setIsLoading(false);
        }

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null);
    };

    const menu = (
        <Menu>
            <Menu.Item>
                <a onClick={handleExportExcel}>Export Excel</a>
            </Menu.Item>
            <Menu.Item>
                <CSVLink data={dataSource} filename="Personnel.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">Personnel</h1>
            <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                    <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                        <a className="ant-dropdown-link gap-2 flex items-center" onClick={e => e.preventDefault()}>
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
                    <Input
                        placeholder="Search..."
                        value={searchText}
                        className="py-2 md:w-64 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>
            <Table
                className='overflow-x-auto'
                loading={isFetching || searchLoading || personnelsByGenderLoading || personnelByStatusLoading || personnelByStatusLoading}
                columns={columns}
                dataSource={
                    debouncedSearch
                        ? (searchData?.results || []).map((personnel, index) => ({
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
                        }))
                        : gender !== "all"
                            ? (personnelGenderData?.results || []).map((personnel, index) => ({
                                ...personnel,
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
                                }))
                            : status !== "all"
                            ? (personnelStatusData?.results || []).map((personnel, index) => ({
                                ...personnel,
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
                                }))
                            : filteredData
                }
                scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
                pagination={
                    debouncedSearch || gender !== "all" || status !== "all"
                        ? false // Hide pagination when searching
                        : {
                            current: page,
                            pageSize: limit,
                            total: data?.count || 0,
                            onChange: (newPage) => setPage(newPage),
                            showSizeChanger: false,
                        }
                }
                rowKey="id"
            />
            <Modal
                title="Position Report"
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