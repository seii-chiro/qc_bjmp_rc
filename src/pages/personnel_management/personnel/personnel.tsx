import { useLocation } from 'react-router';
import { PersonnelForm } from "@/lib/issues-difinitions";
import { getPersonnel, getUser } from "@/lib/queries";
import { deletePersonnel } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Input, Menu, message, Modal, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import bjmp from '../../../assets/Logo/QCJMD.png';
import { NavLink } from "react-router-dom";

const Personnel = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const location = useLocation();
    const filterOption = location.state?.filterOption; // Get filter option from state

    const { data, isLoading: personnelLoading } = useQuery({
        queryKey: ['personnel'],
        queryFn: () => getPersonnel(token ?? ""),
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

    const dataSource = data?.map((personnel, index) => ({
        key: index + 1,
        organization: personnel?.organization ?? '',
        personnel_reg_no: personnel?.personnel_reg_no ?? '',
        person: `${personnel?.person?.first_name ?? ''} ${personnel?.person?.middle_name ?? ''} ${personnel?.person?.last_name ?? ''}`,
        shortname: personnel?.person?.shortname ?? '',
        rank: personnel?.rank ?? '',
        status: personnel?.status ?? '', // Capture the status
        gender: personnel?.person?.gender?.gender_option ?? '',
        date_joined: personnel?.date_joined ?? '',
        record_status: personnel?.record_status ?? '',
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    // Filter data based on search input and filter option
    const filteredData = dataSource.filter(personnel => {
        const matchesSearch = Object.values(personnel).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );
        const matchesStatus = filterOption ? personnel.status === filterOption : true; // Check for status filtering
        return matchesSearch && matchesStatus;
    });

    const columns: ColumnType<PersonnelForm> = [
        {
            title: 'No.',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Personnel No.',
            dataIndex: 'personnel_reg_no',
            key: 'personnel_reg_no',
        },
        {
            title: 'Organization',
            dataIndex: 'organization',
            key: 'organization',
        },
        {
            title: 'Personnel',
            dataIndex: 'person',
            key: 'person',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Date Joined',
            dataIndex: 'date_joined',
            key: 'date_joined',
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: any, index: string | number) => (
                <div className="flex gap-2">
                    <NavLink to={"update"} state={{ personnel: record }} className="text-blue-500 hover:text-blue-700 flex items-center">
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
    ];

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(dataSource);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Personnel");
        XLSX.writeFile(wb, "Personnel.xlsx");
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

        const availableHeight = doc.internal.pageSize.height - headerHeight - footerHeight;
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

        const tableData = dataSource.map(item => [
            item.key,
            item.personnel_reg_no,
            item.person,
            item.rank,
            item.date_joined,
        ]);

        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);

            autoTable(doc, {
                head: [['No.', 'Personnel Reg. No.', 'Personnel', 'Rank', 'Date Joined']],
                body: pageData,
                startY: startY,
                margin: { top: 0, left: 10, right: 10 },
                didDrawPage: function () {
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
                    <button className="bg-[#1E365D] py-2 px-5 rounded-md text-white" onClick={handleExportPDF}>
                        Print Report
                    </button>
                </div>
                <div className="flex gap-2 items-center">
                    <Input 
                        placeholder="Search Personnel..." 
                        value={searchText} 
                        className="py-2 md:w-64 w-full" 
                        onChange={(e) => setSearchText(e.target.value)} 
                    />
                </div>
            </div>
            <Table dataSource={filteredData} columns={columns} loading={personnelLoading} />
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