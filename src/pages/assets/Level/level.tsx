import { deleteDetention_Building, getDetention_Building, getJail, getJail_Security_Level, getUser, updateDetention_Building } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select } from "antd";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { GoDownload, GoPlus } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import AddLevel from "./AddLevel";
import EditLevel from "./EditLevel";

type LevelReport = {
    key: number;
    id: number;
    jail: number;
    bldg_name: string;
    bldg_status: string;
};

const Level = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<LevelReport | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data } = useQuery({
        queryKey: ["level"],
        queryFn: () => getDetention_Building(token ?? ""),
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteDetention_Building(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["level"] });
            messageApi.success("Level deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Level");
        },
    });
    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

 const { mutate: editLevel, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: LevelReport) =>
            updateDetention_Building(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["level"] });
            messageApi.success("Level updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Level");
        },
    });

    const handleEdit = (record: LevelReport) => {
        setSelectedLevel(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (selectedLevel && selectedLevel.id) {
            const updatedALevel: LevelReport = {
                ...selectedLevel,
                ...values,
            };
            editLevel(updatedALevel);
        } else {
            messageApi.error("Selected Level is invalid");
        }
    };
        const dataSource = data?.results?.map((level, index) => ({
            key: index + 1,
            id: level?.id,
            jail: level?.jail ?? "N/A",
            bldg_name: level?.bldg_name ?? "N/A",
            bldg_status: level?.bldg_status ?? "N/A",
            bldg_description: level?.bldg_description ?? "N/A",
            security_level: level?.security_level ?? "N/A",
            organization: level?.organization ?? 'Bureau of Jail Management and Penology',
            updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
        })) || [];
    
        const filteredData = dataSource?.filter((level) =>
            Object.values(level).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );

        const columns: ColumnsType<LevelReport> = [
            {
                title: "No.",
                render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
            },
            {
                title: "Jail",
                dataIndex: "jail",
                key: "jail",
                sorter: (a, b) => a.jail.localeCompare(b.jail),
            },
            {
                title: "Level Name",
                dataIndex: "bldg_name", 
                key: "bldg_name",
                sorter: (a, b) => a.bldg_name.localeCompare(b.bldg_name),
            },
            {
                title: "Level Status",
                dataIndex: "bldg_status", 
                key: "bldg_status",
                sorter: (a, b) => a.bldg_status.localeCompare(b.bldg_status),
            },
            {
                title: "Actions",
                key: "actions",
                render: (_: any, record: LevelReport) => (
                    <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
                    <Button type="link" onClick={() => handleEdit(record)}>
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
            XLSX.utils.book_append_sheet(wb, ws, "Level");
            XLSX.writeFile(wb, "Level.xlsx");
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
                doc.text("Level Report", 10, 15); 
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.text(`Organization Name: ${organizationName}`, 10, 25);
                doc.text("Report Date: " + formattedDate, 10, 30);
                doc.text("Prepared By: " + PreparedBy, 10, 35);
                doc.text("Department/ Unit: IT", 10, 40);
                doc.text("Report Reference No.: " + reportReferenceNo, 10, 45);
            };
            
        
            addHeader(); 
        
const isSearching = searchText.trim().length > 0;
    const tableData = (isSearching ? (filteredData || []) : (dataSource || [])).map((item, idx) => [
                idx + 1,
                item.bldg_name,
                item.jail,
                item.bldg_status,
            ]);
        
            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Annex', 'Jail', 'Status']],
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
                    <CSVLink data={dataSource} filename="Level.csv">
                        Export CSV
                    </CSVLink>
                </Menu.Item>
            </Menu>
        );

    const results = useQueries({
        queries: [
            {
                queryKey: ['jail'],
                queryFn: () => getJail(token ?? "")
            },
            {
                queryKey: ['security-level'],
                queryFn: () => getJail_Security_Level(token ?? "")
            },
        ]
    });

    const jailData = results[0].data;
    const securityLevelData = results[1].data;

    const onJailChange = (value: number) => {
        setSelectedLevel(prevForm => ({
            ...prevForm,
            jail_id: value
        }));
    };

    const onSecurityLevelChange = (value: number) => {
        setSelectedLevel(prevForm => ({
            ...prevForm,
            security_level_id: value
        }));
    };
    return (
        <div>
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Level</h1>
            <div className="my-5 flex justify-between">
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
                        Add Level
                    </button>
                </div>
                </div>
            <div className="w-full">
                
                <div id="printable-table">
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        scroll={{ x: 700 }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                        }}
                    />
                </div>
                <Modal
                title="Level Report"
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
                title="Add Level"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="50%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
                <AddLevel onClose={handleCancel} />
            </Modal>
            <Modal
                title="Edit Level"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width="60%"
                >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                    label="Level Name"
                    name="bldg_name"
                >
                    <Input />
                </Form.Item>
                    <Form.Item
                    label="Level Status"
                    name="bldg_status"
                >
                    <Input />
                </Form.Item>
                    <Form.Item
                    label="Level Description"
                    name="bldg_description"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Jail"
                    name="jail"
                >
                    <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail"
                            optionFilterProp="label"
                            onChange={onJailChange}
                            options={jailData?.results?.map(jail => (
                                {
                                    value: jail.id,
                                    label: jail?.jail_name,
                                }
                            ))}
                        />
                </Form.Item>
                <Form.Item
                    label="Jail Security Level"
                    name="security_level"
                >
                    <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Security Level"
                            optionFilterProp="label"
                            onChange={onSecurityLevelChange}
                            options={securityLevelData?.results?.map(securitylevel => (
                                {
                                    value: securitylevel.id,
                                    label: securitylevel?.category_name,
                                }
                            ))}
                        />
                </Form.Item>
                </Form>
            </Modal>
            </div>
        </div>
    )
}

export default Level
