import { deleteOASISAlert, getOASISAlerts } from "@/lib/oasis-query"
import { useTokenStore } from "@/store/useTokenStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Dropdown, Input, MenuProps, message, Modal, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { useState } from "react"
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { generatePDFReport, PDFColumn } from "../generatePDF"
import { useUserStore } from "@/store/useUserStore"
import { GoDownload } from "react-icons/go"
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom"
import { OASISAlert } from "@/lib/oasis-response-definition"
import { PaginatedResponse } from "@/lib/queries"

export type AlertDataSourceRecord = {
    id: number;
    no: number;
    alert: string;
    event: string;
    status: string | null;
    sender: string | null;
    addresses: string | null;
    severity: string | null;
    response_type: string | null;
}

const Alerts = () => {
    const token = useTokenStore(state => state.token)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const user = useUserStore(state => state.user)
    const [isPDFModalOpen, setIsPDFModalOpen] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data: alerts, isLoading: alertsLoading } = useQuery({
        queryKey: ['OASIS', 'alerts', currentPage, pageSize],
        queryFn: () => getOASISAlerts(token ?? "", currentPage, pageSize),
        placeholderData: prev => prev,
        enabled: !!token
    })

    const { refetch: refetchAllAlerts } = useQuery({
        queryKey: ['OASIS', 'alerts', 'export'],
        queryFn: () => getOASISAlerts(token ?? "", 1, 10000),
        enabled: false,
        staleTime: 5 * 60 * 1000,
    })

    const deleteAlertMutation = useMutation({
        mutationFn: (id: number) => deleteOASISAlert(token ?? "", id),
        onSuccess: () => {
            message.success("Alert deleted")
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'alerts'] })
        },
        onError: (err) => {
            message.error(err.message)
        }
    })

    const dataSource = [...(alerts?.results || [])]
        .map((item, index) => ({
            id: item?.id,
            no: (currentPage - 1) * pageSize + index + 1,
            alert: item?.infos?.[0]?.alert,
            event: item?.infos?.[0]?.event,
            status: item?.status,
            sender: item?.sender,
            addresses: item?.addresses,
            severity: item?.infos?.[0]?.severity,
            response_type: item?.infos?.[0]?.response_type
        }));

    const filteredDataSource = dataSource?.filter(item => {
        const searchLower = searchText.toLowerCase()
        return (
            item?.alert?.toLowerCase().includes(searchLower) ||
            item?.event?.toLowerCase().includes(searchLower) ||
            item?.status?.toLowerCase().includes(searchLower) ||
            item?.sender?.toLowerCase().includes(searchLower) ||
            item?.severity?.toLowerCase().includes(searchLower) ||
            item?.addresses?.toLowerCase().includes(searchLower) ||
            item?.response_type?.toLowerCase().includes(searchLower)
        )
    })

    const getExportData = async (): Promise<PaginatedResponse<OASISAlert> | undefined> => {
        const cachedData = queryClient.getQueryData<PaginatedResponse<OASISAlert>>(['OASIS', 'alerts', 'export']);
        const queryState = queryClient.getQueryState(['OASIS', 'alerts', 'export']);

        if (cachedData && queryState && Date.now() - queryState.dataUpdatedAt < 5 * 60 * 1000) {
            return cachedData;
        } else {
            const result = await refetchAllAlerts();
            return result.data;
        }
    };

    const prepareExportDataSource = (exportData?: PaginatedResponse<OASISAlert>) => {
        return [...(exportData?.results || [])].map((item: OASISAlert, index: number) => ({
            id: item.id,
            no: index + 1,
            alert: item.infos?.[0]?.alert ?? "",
            event: item.infos?.[0]?.event ?? "",
            status: item.status ?? "",
            sender: item.sender ?? "",
            severity: item.infos?.[0]?.severity ?? "",
            addresses: item?.addresses ?? "",
            response_type: item.infos?.[0]?.response_type ?? ""
        }));
    };

    const handleDelete = (record: AlertDataSourceRecord) => {
        Modal.confirm({
            centered: true,
            title: `Delete alert "${record?.alert}"?`,
            content: 'This action cannot be undone.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                deleteAlertMutation.mutate(record?.id)
            }
        })
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const clearSearch = () => {
        setSearchText("")
    }

    const generateFilters = <T, K extends keyof T>(data: T[], key: K): { text: string; value: string }[] => {
        const uniqueValues = Array.from(
            new Set(
                data
                    .map(item => item[key])
                    .filter(v => typeof v === "string" && v.trim() !== "")
            )
        );

        return uniqueValues.map(value => ({
            text: value as string,
            value: value as string,
        }));
    };

    const columns: ColumnsType<AlertDataSourceRecord> = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Alert ID',
            dataIndex: 'alert',
            key: 'alert',
            sorter: (a, b) => (a.alert || '').toLowerCase().localeCompare((b.alert || '').toLowerCase()),
        },
        {
            title: 'Event',
            dataIndex: 'event',
            key: 'event',
            sorter: (a, b) => (a.event || '').toLowerCase().localeCompare((b.event || '').toLowerCase()),
            filters: generateFilters(dataSource || [], 'event'),
            onFilter: (value, record) => record.event === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => (a.status || '').toLowerCase().localeCompare((b.status || '').toLowerCase()),
            filters: generateFilters(dataSource || [], 'status'),
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            sorter: (a, b) => (a.severity || '').toLowerCase().localeCompare((b.severity || '').toLowerCase()),
            filters: generateFilters(dataSource || [], 'severity'),
            onFilter: (value, record) => record.severity === value,
        },
        {
            title: 'Response Type',
            dataIndex: 'response_type',
            key: 'response_type',
            sorter: (a, b) => (a.response_type || '').toLowerCase().localeCompare((b.response_type || '').toLowerCase()),
            filters: generateFilters(dataSource || [], 'response_type'),
            onFilter: (value, record) => record.response_type === value,
        },
        {
            title: 'Sender',
            dataIndex: 'sender',
            key: 'sender',
            sorter: (a, b) => (a.sender || '').toLowerCase().localeCompare((b.sender || '').toLowerCase()),
            filters: generateFilters(dataSource || [], 'sender'),
            onFilter: (value, record) => record.sender === value,
        },
        {
            title: 'Recipient(s)',
            dataIndex: 'addresses',
            key: 'addresses',
            sorter: (a, b) => (a.addresses || '').toLowerCase().localeCompare((b.addresses || '').toLowerCase()),
        },
        {
            align: 'center',
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: AlertDataSourceRecord) => (
                <div className="w-full justify-center items-center gap-12">
                    <Button
                        onClick={() => navigate("add_alert", { state: record.id })}
                        className="border-none cursor-pointer text-blue-500"
                    >
                        <AiOutlineEdit />
                    </Button>
                    <Button
                        danger
                        onClick={() => handleDelete(record)}
                        className="border-none cursor-pointer text-red-500"
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            )
        },
    ]

    const handleGeneratePDF = async () => {
        try {
            const exportData = await getExportData();
            if (!exportData) throw new Error("No data");

            const exportDataSource = prepareExportDataSource(exportData);

            const headers: PDFColumn[] = columns
                ?.filter(col => col.title !== "Actions")
                .map(col => ({
                    header: typeof col.title === "string" ? col.title : "",
                    dataKey: typeof col.key === "string" ? col.key : ""
                }));

            const title = "OASIS Alerts";
            const filename = title;

            const preparedBy = user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.email ?? "";

            const result: { success: boolean, pdfDataUrl?: string } = generatePDFReport({
                title,
                headers,
                data: exportDataSource,
                filename,
                orientation: "landscape",
                showDate: true,
                showPageNumbers: true,
                modalPreview: true,
                preview: true,
                preparedBy,
            });

            if (result.success && result.pdfDataUrl) {
                setPdfDataUrl(result.pdfDataUrl);
            }

            return result;
        } catch (error) {
            message.error("Failed to generate PDF");
            console.error("PDF generation error:", error);
        }
    };

    const handleOpenPDFModal = async () => {
        await handleGeneratePDF();
        setIsPDFModalOpen(true);
    };

    const handleClosePDFModal = () => {
        setIsPDFModalOpen(false);
        setPdfDataUrl('');
    };

    const handleExportExcel = async () => {
        try {
            const exportData = await getExportData();
            const exportDataSource = prepareExportDataSource(exportData);

            const ws = XLSX.utils.json_to_sheet(exportDataSource || []);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "OASIS_Alert");
            XLSX.writeFile(wb, "OASIS_Alert.xlsx");
        } catch (error) {
            message.error("Failed to export Excel");
            console.error("Excel export error:", error);
        }
    };

    const handleExportCSV = async () => {
        try {
            const exportData = await getExportData();
            const exportDataSource = prepareExportDataSource(exportData);

            if (exportDataSource.length === 0) {
                message.warning("No data to export");
                return;
            }

            const headers = Object.keys(exportDataSource[0]).join(',');
            const csvContent = exportDataSource.map(row =>
                Object.values(row).map(val =>
                    typeof val === 'string' && val.includes(',') ? `"${val}"` : val
                ).join(',')
            ).join('\n');

            const fullCsv = headers + '\n' + csvContent;

            const blob = new Blob([fullCsv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'OASIS_Alert.csv';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error("Failed to export CSV");
            console.error("CSV export error:", error);
        }
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <a onClick={handleExportExcel}>Export Excel</a>
            ),
        },
        {
            key: '2',
            label: (
                <a onClick={handleExportCSV}>Export CSV</a>
            ),
        },
    ];

    return (
        <>
            <Modal
                title="PDF Preview"
                width="90%"
                style={{ top: 20 }}
                footer={null}
                open={isPDFModalOpen}
                onClose={handleClosePDFModal}
                onCancel={handleClosePDFModal}
            >
                {pdfDataUrl ? (
                    <iframe
                        src={pdfDataUrl}
                        width="100%"
                        height="800px"
                        style={{ border: 'none' }}
                        title="PDF Preview"
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        Loading PDF preview...
                    </div>
                )}
            </Modal>

            <div className="text-3xl font-bold mb-6 text-[#1E365D]">Alerts</div>
            <div className="w-full flex justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                        <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" menu={{ items }}>
                            <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                                <GoDownload /> Export
                            </a>
                        </Dropdown>
                    </div>
                    <Button
                        onClick={handleOpenPDFModal}
                        className="h-10 w-32 bg-[#1E365D] text-white font"
                    >
                        Print Report
                    </Button>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Input
                            placeholder="🔍Search"
                            className="h-10 w-52"
                            value={searchText}
                            onChange={handleSearchChange}
                            allowClear
                            onClear={clearSearch}
                        />
                    </div>
                    <Button
                        onClick={() => navigate("add_alert")}
                        className="h-10 bg-[#1E365D] text-white"
                    >
                        <FaPlus /> Add Alert
                    </Button>
                </div>
            </div>

            {searchText && (
                <div className="w-full mt-2 text-sm text-gray-600 flex justify-end">
                    <span>{filteredDataSource?.length || 0} result(s) found for "{searchText}"</span>
                </div>
            )}

            <Table
                className="mt-2"
                dataSource={filteredDataSource}
                columns={columns}
                loading={alertsLoading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: alerts?.count || 0,
                    showSizeChanger: true,
                    showQuickJumper: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: (page, size) => {
                        setCurrentPage(page)
                        if (size !== pageSize) {
                            setPageSize(size)
                        }
                    },
                    onShowSizeChange: (_, size) => {
                        setCurrentPage(1)
                        setPageSize(size)
                    }
                }}
            />
        </>
    )
}

export default Alerts