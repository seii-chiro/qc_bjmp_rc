import { deleteOccupation, getOccupations, getUser } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Menu, message, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import moment from "moment";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import AddOccupation from "./AddOccupation";
import EditOccupation from "./EditOccupation";
import bjmp from '../../../assets/Logo/QCJMD.png'

type OccupationProps = {
    id: number;
    updated_at: string;
    name: string;
    description: string;
    remarks: string;
    updated_by: number;
}
const Occupation = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [occupation, setOccupation] = useState<OccupationProps | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data } = useQuery({
        queryKey: ['occupation'],
        queryFn: () => getOccupations(token ?? ""),
    })

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOccupation(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["occupation"] });
            messageApi.success("Occupation deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Occupation");
        },
    });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const dataSource = data?.results?.map((occupation, index) => (
        {
            key: index + 1,
            id: occupation?.id ?? 'N/A',
            name: occupation?.name ?? 'N/A',
            description: occupation?.description ?? 'N/A',
            remarks: occupation?.remarks ?? 'N/A',
            updated_at: occupation?.updated_at
        ? moment(occupation.updated_at).format("YYYY-MM-DD hh:mm A")
        : 'N/A',
        updated: occupation?.updated_by,
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
            organization: occupation?.organization ?? 'Bureau of Jail Management and Penology',
        }
        
    )) || [];

    const filteredData = dataSource?.filter((occupation) =>
        Object.values(occupation).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<OccupationProps> = [
        {
            title: 'No.',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Occupation',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.name))
            //     ).map(name => ({
            //         text: name,
            //         value: name,
            //     }))
            // ],
            // onFilter: (value, record) => record.name === value,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.description))
            //     ).map(description => ({
            //         text: description,
            //         value: description,
            //     }))
            // ],
            // onFilter: (value, record) => record.description === value,
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            sorter: (a, b) => a.remarks.localeCompare(b.remarks),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.remarks))
            //     ).map(remarks => ({
            //         text: remarks,
            //         value: remarks,
            //     }))
            // ],
            // onFilter: (value, record) => record.remarks === value,
        },
        {
            title: "Updated At",
            dataIndex: "updated_at",
            key: "updated_at",
            render: (value) =>
                value !== 'N/A' ? moment(value).format("MMMM D, YYYY h:mm A") : "N/A",
            sorter: (a, b) => moment(a.updated_at).diff(moment(b.updated_at)),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => moment(item.updated_at).format("MMMM D, YYYY h:mm A")))
            //     ).map(dateTime => ({
            //         text: dateTime,
            //         value: dateTime,
            //     }))
            // ],
            // onFilter: (value, record) =>
            //     moment(record.updated_at).format("MMMM D, YYYY h:mm A") === value,
        },
        {
            title: 'Updated By',
            dataIndex: 'updated_by',
            key: 'updated_by',
            sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.updated_by))
            //     ).map(name => ({
            //         text: name,
            //         value: name,
            //     }))
            // ],
            // onFilter: (value, record) => record.updated_by === value,
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            fixed: "right",
            render: (_: any, record: OccupationProps) => (
                <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
                    <Button
                        type="link"
                        onClick={() => {
                            setOccupation(record);
                            setIsEditModalOpen(true);
                        }}
                    >
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
    ];
    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(dataSource);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Occupation");
        XLSX.writeFile(wb, "Occupation.xlsx");
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
    
        const maxRowsPerPage = 26; 
    
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
            doc.text("Occupation Report", 10, 15); 
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
            item.name,
            item.description,
        ]);
    
        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);
    
            autoTable(doc, { 
                head: [['No.', 'Occupation', 'Description']],
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
                <CSVLink data={dataSource} filename="Occupation.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );
return (
    <div className="h-screen">
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Occupation</h1>
            <div className="w-full bg-white">
                <div className="my-4 flex justify-between items-center gap-2">
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
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative flex items-center">
                                <input
                                    placeholder="Search"
                                    type="text"
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="border border-gray-400 h-10 w-96 rounded-md px-2 active:outline-none focus:outline-none"
                                />
                                <LuSearch className="absolute right-[1%] text-gray-400" />
                            </div>
                            <button
                                className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center justify-center"
                                onClick={showModal}
                                >
                                <GoPlus />
                                Add Occupation
                            </button>
                        </div>
                    </div>
                    <Table
                        className="overflow-x-auto"
                        columns={columns}
                        dataSource={filteredData}
                        scroll={{ x: 'max-content' }} 
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                        }}
                    />
                </div>
                <Modal
                title="Occupation Report"
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
                <Modal
                className="overflow-y-auto rounded-lg scrollbar-hide"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="30%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
                <AddOccupation onClose={handleCancel} />
            </Modal>
            <Modal
                title="Edit Occupation"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
            >
                <EditOccupation
                    occupation={occupation}
                    onClose={() => setIsEditModalOpen(false)}
                />
            </Modal>
        </div>
    )
}

export default Occupation
