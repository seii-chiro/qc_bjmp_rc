import { WatchlistPerson } from "@/lib/issues-difinitions";
import { getUser } from "@/lib/queries";
import { deleteWatchlistPerson, getWatchlistPerson } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import moment from "moment";
import { useEffect, useState } from "react";
import { GoDownload, GoPlus } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import bjmp from '../../assets/Logo/QCJMD.png'
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { BASE_URL } from "@/lib/urls";
// import { useNavigate } from "react-router-dom";

const Watchlist = () => {
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    // const navigate = useNavigate()

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
        if (csvReady) setCsvReady(false);
        return () => clearTimeout(timeout);
    }, [searchText]);

    const { data: WatchlistData, isFetching } = useQuery({
        queryKey: ['watchlist', page, debouncedSearch],
        queryFn: async () => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                offset: String(offset),
            });
            if (debouncedSearch) params.append("search", debouncedSearch);

            const res = await fetch(
                `${BASE_URL}/api/whitelists/whitelisted-persons/?${params.toString()}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Watchlist data.');
            }

            return res.json();
        },
        keepPreviousData: true,
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    });

    // Function to fetch all watchlist data for export
    const fetchAllWatchlistData = async () => {
        try {
            setExportLoading(true);
            const params = new URLSearchParams({
                limit: '1000', // Set a high limit to get all data at once
            });

            // Add search parameter if there's any search text
            if (debouncedSearch) {
                params.append("search", debouncedSearch);
            }

            const res = await fetch(
                `${BASE_URL}/api/whitelists/whitelisted-persons/?${params.toString()}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch all Watchlist data for export.');
            }

            const data = await res.json();

            // Transform the data for export
            const formattedData = data.results.map((watchlist, index) => ({
                key: index + 1,
                id: watchlist?.id,
                person: watchlist?.person ?? '',
                white_listed_type: watchlist?.white_listed_type ?? '',
                risk_level: watchlist?.risk_level ?? '',
                threat_level: watchlist?.threat_level ?? '',
                updated_by: watchlist?.updated_by ?? '',
                updated_at: watchlist?.updated_at ? moment(watchlist.updated_at).format('YYYY-MM-DD HH:mm:ss A') : '',
                organization: watchlist?.organization ?? 'Bureau of Jail Management and Penology',
                updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
            }));

            setExportLoading(false);
            return formattedData;
        } catch (error) {
            setExportLoading(false);
            message.error("Failed to fetch data for export");
            console.error(error);
            return [];
        }
    };

    const deletePersonAndBiometric = async (token: string, id: number) => {
        await deleteWatchlistPerson(token, id);
    };

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePersonAndBiometric(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            message.success("Watchlist Person and Biometric deleted successfully");
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to delete Watchlist Person and Biometric");
        },
    });

    const dataSource = WatchlistData?.results?.map((watchlist, index) => ({
        key: (page - 1) * limit + index + 1,
        id: watchlist?.id,
        person: watchlist?.person ?? '',
        white_listed_type: watchlist?.white_listed_type ?? '',
        risk_level: watchlist?.risk_level ?? '',
        threat_level: watchlist?.threat_level ?? '',
        updated_by: watchlist?.updated_by ?? '',
        updated_at: watchlist?.updated_at ? moment(watchlist.updated_at).format('YYYY-MM-DD HH:mm:ss A') : '',
        organization: watchlist?.organization ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const filteredData = dataSource?.filter((watchlist) =>
        Object.values(watchlist).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<WatchlistPerson> = [
        {
            title: 'No.',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Person Name',
            dataIndex: 'person',
            key: 'person',
        },
        {
            title: 'White Listed Type',
            dataIndex: 'white_listed_type',
            key: 'white_listed_type',
        },
        {
            title: 'Risk Level',
            dataIndex: 'risk_level',
            key: 'risk_level',
        },
        {
            title: 'Threat Level',
            dataIndex: 'threat_level',
            key: 'threat_level',
        },
        {
            title: 'Updated By',
            dataIndex: 'updated_by',
            key: 'updated_by',
        },
        {
            title: 'Updated At',
            dataIndex: 'updated_at',
            key: 'updated_at',
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_: any, record: WatchlistPerson) => (
                <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
                    {/* <Button
                        type="link"
                        danger
                        onClick={() => {
                            navigate("/jvms/threats/watchlist_registration", { state: record })
                        }}
                    >
                        <AiOutlineEdit color="blue" />
                    </Button> */}
                    <Button
                        type="link"
                        danger
                        onClick={() => deleteMutation.mutate(record.id)}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        }
    ];

    const handleExportExcel = async () => {
        const allData = await fetchAllWatchlistData();
        const ws = XLSX.utils.json_to_sheet(allData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Watchlist");
        XLSX.writeFile(wb, "Watchlist.xlsx");
    };

    // Store CSV data for export
    const [csvData, setCsvData] = useState([]);
    const [csvReady, setCsvReady] = useState(false);

    const handleExportCSV = async () => {
        setCsvReady(false);
        const allData = await fetchAllWatchlistData();
        setCsvData(allData);
        setCsvReady(true);
    };

    const handleExportPDF = async () => {
        const allData = await fetchAllWatchlistData();
        if (allData.length === 0) {
            message.warn("No data available to export");
            return;
        }

        const doc = new jsPDF();
        const headerHeight = 48;
        const footerHeight = 32;
        const organizationName = allData[0]?.organization || "Bureau of Jail Management and Penology";
        const PreparedBy = allData[0]?.updated || `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`;

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;

        const maxRowsPerPage = 29;

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
            doc.text("Watchlist Report", 10, 15);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Organization Name: ${organizationName}`, 10, 25);
            doc.text("Report Date: " + formattedDate, 10, 30);
            doc.text("Prepared By: " + PreparedBy, 10, 35);
            doc.text("Department/ Unit: IT", 10, 40);
            doc.text("Report Reference No.: " + reportReferenceNo, 10, 45);
        };

        addHeader();

        const tableData = allData.map(item => [
            item.key,
            item.person,
            item.white_listed_type,
            item.risk_level,
            item.threat_level,
        ]);

        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);

            autoTable(doc, {
                head: [['No.', 'Name', 'White Listed Type', 'Risk Level', 'Threat Level']],
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
                {csvReady ? (
                    <CSVLink
                        data={csvData}
                        filename="Watchlist.csv"
                        onClick={() => setCsvReady(false)}
                    >
                        Download CSV
                    </CSVLink>
                ) : (
                    <a onClick={handleExportCSV}>
                        {exportLoading ? "Preparing CSV..." : "Export CSV"}
                    </a>
                )}
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold text-[#1E365D]">Watchlist</h1>
            <div className="w-full bg-white">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 gap-5">
                    <div className="flex gap-2">
                        <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                            <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                                <GoDownload /> Export
                            </a>
                        </Dropdown>
                        <Button
                            className="bg-[#1E365D] text-white h-10 text-base"
                            onClick={handleExportPDF}
                            loading={exportLoading}
                        >
                            Print Report
                        </Button>
                    </div>
                    <div className="flex md:items-center gap-2">
                        <div className="flex-1 relative flex items-center">
                            <input
                                placeholder="Search"
                                type="text"
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setPage(1);
                                }}
                                className="border border-gray-400 h-10 w-full md:w-96 rounded-md px-2 active:outline-none focus:outline-none"
                            />
                            <LuSearch className="absolute right-[1%] text-gray-400" />
                        </div>
                    </div>
                </div>
                <div>
                    <Table
                        loading={isFetching}
                        dataSource={dataSource}
                        columns={columns}
                        scroll={{ x: 800 }}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: WatchlistData?.count || 0,
                            onChange: (newPage) => setPage(newPage),
                            showSizeChanger: false,
                        }}
                    />
                </div>
            </div>
            <Modal
                title="Watchlist Report"
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

export default Watchlist