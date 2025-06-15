import { deleteDetention_Floor, getDetention_Building, getDetention_Floor, getJail_Security_Level, getUser, updateDetention_Floor } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { GoDownload, GoPlus } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import AddAnnex from "./AddAnnex";
import EditAnnex from "./EditAnnex";

type AnnexResponse = {
    id: number;
    building: string;
    floor_number: string;
    floor_name: string;
    security_level: string;
    floor_description: string;
    floor_status: string | null;
};

const Annex = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnnex, setSelectedAnnex] = useState<AnnexResponse | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data } = useQuery({
        queryKey: ['annex'],
        queryFn: () => getDetention_Floor(token ?? ""),
    })

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteDetention_Floor(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["annex"] });
            messageApi.success("Annex deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Annex");
        },
    });

    const showModal = () => {
        setIsModalOpen(true);
      };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const { mutate: editAnnex, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: AnnexResponse) =>
            updateDetention_Floor(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["annex"] });
            messageApi.success("Annex updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Annex");
        },
    });

    const handleEdit = (record: AnnexResponse) => {
        setSelectedAnnex(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (selectedAnnex && selectedAnnex.id) {
            const updatedAnnex: AnnexResponse = {
                ...selectedAnnex,
                ...values,
            };
            editAnnex(updatedAnnex);
        } else {
            messageApi.error("Selected Annex is invalid");
        }
    };

    const dataSource = data?.results?.map((annex, index) => ({
        key: index + 1,
        id: annex?.id,
        building: annex?.building,
        floor_number: annex?.floor_number,
        floor_name: annex?.floor_name,
        security_level: annex?.security_level,
        organization: annex?.organization ?? 'Bureau of Jail Management and Penology',
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const filteredData = dataSource?.filter((annex) =>
        Object.values(annex).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<AnnexResponse> = [
        {
            title: "No.",
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Level",
            dataIndex: "building",
            key: "building",
            sorter: (a, b) => a.building.localeCompare(b.building),
        },
        {
            title: "Annex Number",
            dataIndex: "floor_number",
            key: "floor_number",
            sorter: (a, b) => a.floor_number.localeCompare(b.floor_number),
        },
        {
            title: "Annex Name",
            dataIndex: "floor_name",
            key: "floor_name",
        },
        {
            title: "Security Level",
            dataIndex: "security_level",
            key: "security_level",
            sorter: (a, b) => a.security_level.localeCompare(b.security_level),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: AnnexResponse) => (
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
        XLSX.utils.book_append_sheet(wb, ws, "Annex");
        XLSX.writeFile(wb, "Annex.xlsx");
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
            doc.text("Annex Report", 10, 15); 
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
            item.floor_number,
            item.floor_name,
            item.building,
        ]);
    
        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);
    
            autoTable(doc, { 
                head: [['No.', 'Annex No.', 'Annex', 'Level']],
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
                <CSVLink data={dataSource} filename="Annex.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );

    const results = useQueries({
        queries: [
            {
                queryKey: ['detention-building'],
                queryFn: () => getDetention_Building(token ?? "")
            },
            {
                queryKey: ['security-level'],
                queryFn: () => getJail_Security_Level(token ?? "")
            },
        ]
    });

    const detentionBuildingData = results[0].data;

    const SecurityLevelData = results[1].data;
    
    const onDetentionBuildingChange = (value: number) => {
        setSelectedAnnex(prevForm => ({
            ...prevForm,
            building_id: value,
        }));
    }; 

    const onSecurityLevelChange = (value: number) => {
        setSelectedAnnex(prevForm => ({
            ...prevForm,
            security_level_id: value,
        }));
    };  
    return (
        <div>
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Annex</h1>
            <div className="flex justify-between my-5">
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
                        Add Annex
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
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
                title="Annex Report"
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
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                >
                <AddAnnex
                    onClose={() => {
                    setIsModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["annex"] });
                    }}
                />
                </Modal>
            <Modal
                    title="Edit Annex"
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    onOk={() => form.submit()}
                    confirmLoading={isUpdating}
                    width="60%"
                >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item label="Level" name="building">
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Building"
                            onChange={onDetentionBuildingChange}
                            options={detentionBuildingData?.results.map(level => ({
                                    value: level.id,
                                    label: level?.bldg_name,
                                }))
                            }
                        />
                </Form.Item>
                <Form.Item label="Annex Name" name="floor_name" required>
                    <Input />
                </Form.Item>
                <Form.Item label="Annex Number" name="floor_number" required>
                    <Input />
                </Form.Item>
                <Form.Item label="Security Level" name="security_level">
                    <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Security Level"
                            optionFilterProp="label"
                            onChange={onSecurityLevelChange}
                            options={SecurityLevelData?.results?.map(security_level => (
                                {
                                    value: security_level.id,
                                    label: security_level?.category_name,
                                }
                            ))}
                        />
                </Form.Item>
                <Form.Item label="Annex Description" name="floor_description" rules={[{ required: true, message: "Please input the Annex Description!" }]}>
                    <Input />
                </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Annex
