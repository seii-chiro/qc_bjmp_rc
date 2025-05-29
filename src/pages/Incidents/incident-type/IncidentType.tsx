import { deleteIncidentType, getIncidentCategory, getIncidentType } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Input, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import IncidentForm from "./IncidentForm";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { IncidentTypeResponse } from "@/lib/issues-difinitions";
import { GoDownload } from "react-icons/go";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import bjmp from '@/assets/Logo/QCJMD.png'


const IncidentType = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<Partial<IncidentTypeResponse> | undefined>(undefined);
    const queryClient = useQueryClient();
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const { data: incidentType, refetch: refetchIncidentTypes } = useQuery({
        queryKey: ["incident-type"],
        queryFn: () => getIncidentType(token ?? ""),
    });

    const { data: incidentCategories } = useQuery({
        queryKey: ["incident-category"],
        queryFn: () => getIncidentCategory(token ?? ""),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteIncidentType(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incident-type"] });
            message.success("Incident Type deleted successfully");
        },
        onError: (error) => {
            message.error(error.message || "Failed to delete Incident Type");
        },
    });

    const showEditModal = (record: Partial<IncidentTypeResponse>) => {
        setEditRecord(record);
        setIsModalOpen(true);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const dataSource = incidentType?.results?.map((incident_type, index) => ({
        key: index + 1,
        id: incident_type?.id,
        name: incident_type?.name ?? "N/A",
        description: incident_type?.description ?? "N/A",
        updated_by: incident_type?.updated_by ?? "N/A",
        category: incident_type?.category ?? null,
    })) || [];

    const filteredData = dataSource?.filter((incident_type) =>
        Object.values(incident_type).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<{ key: number; name: string; description: string; updated_by: string; }> = [
        {
            title: 'No.',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Incident Type',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.name))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.name === value,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.description))
                ).map(description => ({
                    text: description,
                    value: description,
                }))
            ],
            onFilter: (value, record) => record.description === value,
        },
        {
            title: 'Updated By',
            dataIndex: 'updated_by',
            key: 'updated_by',
            sorter: (a, b) => a.description.localeCompare(b.updated_by),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.updated_by))
                ).map(description => ({
                    text: description,
                    value: description,
                }))
            ],
            onFilter: (value, record) => record.updated_by === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <div className="flex gap-2 w-full items-center justify-center">
                    <Button
                        className="text-blue-600 border-blue-600"
                        onClick={() => showEditModal(record)}
                    >
                        <AiOutlineEdit />
                    </Button>
                    <Button
                        danger
                        onClick={() => {
                            Modal.confirm({
                                centered: true,
                                title: 'Are you sure?',
                                content: `Delete "${record.name}" incident type?`,
                                okText: 'Yes, delete it',
                                cancelText: 'Cancel',
                                onOk: () => {
                                    const incident = incidentType?.results.find(i => i.name === record.name);
                                    if (incident?.id) {
                                        deleteMutation.mutate(incident.id);
                                    } else {
                                        message.error("Incident ID not found.");
                                    }
                                },
                            });
                        }}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        }
    ]

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(dataSource);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "IncidentCategory");
        XLSX.writeFile(wb, "IncidentCategory.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const headerHeight = 48;
        const footerHeight = 32;
        const organizationName = dataSource[0]?.organization || "";
        const PreparedBy = dataSource[0]?.updated_by || '';

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
            doc.text("Incident Category Report", 10, 15);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Organization Name: ${organizationName}`, 10, 25);
            doc.text("Report Date: " + formattedDate, 10, 30);
            doc.text("Prepared By: " + PreparedBy, 10, 35);
            doc.text("Department/ Unit: IT", 10, 40);
            doc.text("Report Reference No.: " + reportReferenceNo, 10, 45);
        };


        addHeader();

        const tableData = dataSource.map((item, index) => [
            index + 1,
            item.name,
            item.description,
        ]);

        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);

            autoTable(doc, {
                head: [['No.', 'Incident Category', 'Description']],
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

    const menu = (
        <Menu>
            <Menu.Item>
                <a onClick={handleExportExcel}>Export Excel</a>
            </Menu.Item>
            <Menu.Item>
                <CSVLink data={dataSource} filename="IncidentCategory.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <Modal
                open={isModalOpen}
                onCancel={handleCancel}
                onClose={handleCancel}
                footer={[]}
                centered
            >
                <IncidentForm
                    editRecord={editRecord}
                    onClose={handleCancel}
                    refetchIncidentTypes={refetchIncidentTypes}
                    incidentCategory={incidentCategories || { count: 0, next: null, previous: null, results: [] }}
                />
            </Modal>

            {isPdfModalOpen && (
                <Modal
                    open={isPdfModalOpen}
                    onCancel={() => setIsPdfModalOpen(false)}
                    footer={null}
                    width={900}
                    centered
                >
                    <div style={{ height: "80vh" }}>
                        {pdfDataUrl && (
                            <iframe
                                src={pdfDataUrl}
                                title="Incident Type PDF"
                                style={{ width: "100%", height: "100%", border: "none" }}
                            />
                        )}
                    </div>
                </Modal>
            )}

            <div className="w-full h-full flex flex-col gap-4 mt-1">
                <h1 className="font-bold text-3xl text-[#1E365D]">Incident Types</h1>
                <div className="w-full flex justify-between items-center">
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
                        <Input
                            placeholder="🔍 Search incident types..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                            className="w-60 h-10"
                        />
                        <button
                            className="h-10 bg-[#1E365D] rounded px-2"
                            onClick={showModal}
                        >
                            <span className="flex gap-1 items-center text-white">
                                <Plus />
                                <span className="font-semibold">
                                    Add Incident Type
                                </span>
                            </span>
                        </button>
                    </div>
                </div>
                <Table
                    dataSource={filteredData}
                    columns={columns}
                />
            </div>
        </>
    )
}

export default IncidentType
