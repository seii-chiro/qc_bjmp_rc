import { PDLs } from "@/lib/pdl-definitions";
import { getPDLs, getUser } from "@/lib/queries";
import { deletePDL, patchPDL } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { NavLink, useLocation } from "react-router-dom";
import { BASE_URL } from "@/lib/urls";
import { PaginatedResponse } from "@/pages/personnel_management/personnel/personnel";

const PDLtable = () => {
    const location = useLocation();
    const filterOption = location?.state?.filterOption || "all";
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectPDL, setSelectedPDL] = useState<PDLs | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [allPDLs, setAllPDLs] = useState<PDLs[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            const res = await fetch(`${BASE_URL}/api/pdls/pdl/?limit=10000`, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                setAllPDLs(data.results || []);
            }
        };
        fetchAll();
    }, [token]);

    const fetchPdls = async (search: string) => {
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
        queryKey: ["visitors", debouncedSearch],
        queryFn: () => fetchPdls(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data: pdlData, isFetching } = useQuery({
        queryKey: ['visitors', 'visitor-table', page],
        queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
            // Add offset parameter for Django REST Framework's pagination
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/pdls/pdl/?page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch PDLs data.');
            }

            return res.json();
        },
        behavior: keepPreviousData(),
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePDL(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pdl"] });
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
            queryClient.invalidateQueries({ queryKey: ["pdl"] });
            messageApi.success("PDL updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update PDL");
        },
    });

    const handleEdit = (record: PDLs) => {
        setSelectedPDL(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

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

    const filteredPDLs = {
        ...pdlData,
        results:
            filterOption === "all"
                ? pdlData?.results || []
                : (pdlData?.results || []).filter(
                    (pdl) => pdl?.person?.gender?.gender_option === filterOption
                ),
    };

    const dataSource = filteredPDLs?.results?.map((pdl, index) => ({
        key: ((page - 1) * limit) + index + 1,
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
        date_of_admission: pdl?.date_of_admission ?? 'N/A',
        organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const filteredData = dataSource?.filter((pdl) =>
        Object.values(pdl).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<PDLs> = [
        {
            title: 'No.',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'PDL Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            filters: [
                ...Array.from(new Set(allPDLs.map(item =>
                    `${item?.person?.first_name ?? ''} ${item?.person?.middle_name ?? ''} ${item?.person?.last_name ?? ''}`.trim()
                )))
                .filter(name => name)
                .map(name => ({ text: name, value: name }))
            ],
            onFilter: (value, record) => record.name === value,
        },
    {
        title: 'Dorm No.',
        dataIndex: 'cell_no',
        key: 'cell_no',
        sorter: (a, b) => a.cell_no.localeCompare(b.cell_no),
        filters: [
            ...Array.from(new Set(allPDLs.map(item => item.cell_no)))
                .filter(cell_no => cell_no)
                .map(cell_no => ({ text: cell_no, value: cell_no }))
        ],
        onFilter: (value, record) => record.cell_no === value,
    },
    {
        title: 'Dorm Name',
        dataIndex: 'cell_name',
        key: 'cell_name',
        sorter: (a, b) => a.cell_name.localeCompare(b.cell_name),
        filters: [
            ...Array.from(new Set(allPDLs.map(item => item.cell_name)))
                .filter(cell_name => cell_name)
                .map(cell_name => ({ text: cell_name, value: cell_name }))
        ],
        onFilter: (value, record) => record.cell_name === value,
    },
    {
        title: 'Gang Affiliation',
        dataIndex: 'gang_affiliation',
        key: 'gang_affiliation',
        sorter: (a, b) => a.gang_affiliation.localeCompare(b.gang_affiliation),
        filters: [
            ...Array.from(new Set(allPDLs.map(item => item.gang_affiliation)))
                .filter(gang => gang)
                .map(gang => ({ text: gang, value: gang }))
        ],
        onFilter: (value, record) => record.gang_affiliation === value,
    },
    {
        title: 'Look',
        dataIndex: 'look',
        key: 'look',
        sorter: (a, b) => a.look.localeCompare(b.look),
        filters: [
            ...Array.from(new Set(allPDLs.map(item => item.look)))
                .filter(look => look)
                .map(look => ({ text: look, value: look }))
        ],
        onFilter: (value, record) => record.look === value,
    },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: any, index) => (
                <div className="flex gap-2">
                    {/* <Button
                            type="link"
                            onClick={() => {
                                const original = data?.[index];
                                if (original) handleEdit(record, original);
                            }}
                        >
                            <AiOutlineEdit />
                        </Button> */}
                    <NavLink to="update" state={{ pdl: record }} className={"flex items-center justify-center"}>
                        <AiOutlineEdit />
                    </NavLink>
                    <Button
                        type="link"
                        danger
                        onClick={() => deleteMutation.mutate(data?.[index]?.id)}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        },
    ]

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(dataSource);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PDL");
        XLSX.writeFile(wb, "PDL.xlsx");
    };

    const fetchAllPDLs = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl/?limit=100000`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };
    const handleExportPDF = async () => {
        const doc = new jsPDF();
        const headerHeight = 48;
        const footerHeight = 32;

        let printSource;
    if (debouncedSearch) {
        printSource = (searchData?.results || []).map((pdl, index) => ({
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
        date_of_admission: pdl?.date_of_admission ?? 'N/A',
        organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
        }));
    } else {
        // Fetch all personnel for printing
        const allData = await fetchAllPDLs();
        printSource = (allData?.results || []).map((pdl, index) => ({
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
            date_of_admission: pdl?.date_of_admission ?? 'N/A',
            organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
            updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
        }));
    }

        const organizationName = dataSource[0]?.organization || "";
        const PreparedBy = dataSource[0]?.updated || '';

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;

        const maxRowsPerPage = 27;

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

        const tableData = printSource.map(item => [
            item.key,
            item.name,
            item.gang_affiliation,
            item.cell_no,
            item.cell_name,
            item.date_of_admission,
        ]);

        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);

            autoTable(doc, {
                head: [['No.', 'PDL', 'Gang Affiliation', 'Cell No.', 'Cell', 'Date Admission']],
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
    };

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
                <CSVLink data={dataSource} filename="PDL.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );
    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">PDL</h1>
            <div className="flex items-center justify-between my-4">
                <div className="flex gap-2">
                    <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                        <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                            <GoDownload /> Export
                        </a>
                    </Dropdown>
                    <button className="bg-[#1E365D] py-2 px-5 rounded-md text-white" onClick={handleExportPDF}>
                        Print Report
                    </button>
                </div>
                <div className="flex gap-2 items-center">
                    <Input placeholder="Search PDL..." value={searchText} className="py-2 md:w-64 w-full" onChange={(e) => setSearchText(e.target.value)} />
                </div>
            </div>
            <Table
                columns={columns}
                loading={isFetching || searchLoading}
                scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
                dataSource={
                    debouncedSearch
                        ? (searchData?.results || []).map((pdl, index) => ({
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
                            date_of_admission: pdl?.date_of_admission ?? 'N/A',
                            organization: pdl?.organization ?? 'Bureau of Jail Management and Penology',
                            updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
                        }))
                        : filteredData
                }
                pagination={
                    debouncedSearch
                        ? false // Hide pagination when searching
                        : {
                            current: page,
                            pageSize: limit,
                            total: pdlData?.count || 0,
                            onChange: (newPage) => setPage(newPage),
                            showSizeChanger: false,
                        }
                }
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
