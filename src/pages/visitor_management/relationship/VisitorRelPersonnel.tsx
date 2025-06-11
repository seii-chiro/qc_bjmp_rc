import { VisitorRelPersonnelRecord } from "@/lib/issues-difinitions";
import { getImpactLevels, getOrganization, getRiskLevel, getUser, PaginatedResponse } from "@/lib/queries";
import { deleteVisitorRelPersonnel, getThreatLevel, updateVisitorRelPersonnel } from "@/lib/query";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import bjmp from '../../../assets/Logo/QCJMD.png'
import AddVisitorRelPersonnel from "./AddVisitorRelPersonnel";

const VisitorRelPersonnel = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [visitorRelPersonnel, setVisitorRelPersonnel] = useState<VisitorRelPersonnelRecord | null>(null);
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
    const fetchVisitorRelPersonnel = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/?search=${search}`, {
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
        queryKey: ["visitor-per-personnel", debouncedSearch],
        queryFn: () => fetchVisitorRelPersonnel(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "visitor-per-personnel",
            "visitor-per-personnel-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<VisitorRelPersonnelRecord>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Visitor Relationship Personnel data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const { data: OrganizationData } = useQuery({
        queryKey: ['organization'],
        queryFn: () => getOrganization(token ?? "")
    })
    
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteVisitorRelPersonnel(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visitor-per-personnel"] });
            messageApi.success("Visitor Relationship Personnel deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Visitor Relationship Personnel");
        },
    });

    const { mutate: editVisitorRelPersonnel, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: VisitorRelPersonnelRecord) =>
            updateVisitorRelPersonnel(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visitor-per-personnel"] });
            messageApi.success("Visitor Relationship Personnel updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Visitor Relationship Personnel");
        },
    });
    const handleEdit = (record: VisitorRelPersonnelRecord) => {
        setVisitorRelPersonnel(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (visitorRelPersonnel && visitorRelPersonnel.id) {
            const updatedVisitorRelPersonnel: VisitorRelPersonnelRecord = {
                ...visitorRelPersonnel,
                ...values,
            };
            editVisitorRelPersonnel(updatedVisitorRelPersonnel);
        } else {
            messageApi.error("Selected Visitor Relationship Personnel is invalid");
        }
    };

    const dataSource = data?.results?.map((visitor, index) => ({
            key: index + 1,
            id: visitor?.id,
            relationship_personnel: visitor?.relationship_personnel,
            description: visitor?.description,
            risks: visitor?.risks,
            impacts: visitor?.impacts,
            threats: visitor?.threats,
            mitigation: visitor?.mitigation,
            risk_level: visitor?.risk_level,
            impact_level: visitor?.impact_level,
            threat_level: visitor?.threat_level,
            updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    }));

    const columns: ColumnsType<VisitorRelPersonnelRecord> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Relationship (Visitor - Personnel)',
            dataIndex: 'relationship_personnel',
            key: 'relationship_personnel',
            sorter: (a, b) => a.relationship_personnel.localeCompare(b.relationship_personnel),
            defaultSortOrder: 'descend',
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
        },
        {
            title: 'Risks',
            dataIndex: 'risks',
            key: 'risks',
            sorter: (a, b) => a.risks.localeCompare(b.risks),
        },
        {
            title: 'Impacts',
            dataIndex: 'impacts',
            key: 'impacts',
            sorter: (a, b) => a.impacts.localeCompare(b.impacts),
        },
        {
            title: 'Threats',
            dataIndex: 'threats',
            key: 'threats',
            sorter: (a, b) => a.threats.localeCompare(b.threats),
        },
        {
            title: 'Mitigation',
            dataIndex: 'mitigation',
            key: 'mitigation',
            sorter: (a, b) => a.mitigation.localeCompare(b.mitigation),
        },
         {
            title: 'Risk Level',
            dataIndex: 'risk_level',
            key: 'risk_level',
            sorter: (a, b) => a.risk_level.localeCompare(b.risk_level),
        },
        {
            title: 'Impact Level',
            dataIndex: 'impact_level',
            key: 'impact_level',
            sorter: (a, b) => a.impact_level.localeCompare(b.impact_level),
        },
        {
            title: 'Threat Level',
            dataIndex: 'threat_level',
            key: 'threat_level',
            sorter: (a, b) => a.threat_level.localeCompare(b.threat_level),
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <div className="flex gap-2">
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
    ]

    const fetchAllVisitorRelPersonnel = async () => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/?limit=1000`, {
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
            const PreparedBy = dataSource[0]?.updated || "";

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 14; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllVisitorRelPersonnel();
            } else {
                allData = await fetchVisitorRelPersonnel(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((visitor, index) => ({
                key: index + 1,
                id: visitor?.id,
                relationship_personnel: visitor?.relationship_personnel,
                description: visitor?.description,
                risks: visitor?.risks,
                impacts: visitor?.impacts,
                threats: visitor?.threats,
                mitigation: visitor?.mitigation,
            }));

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
                doc.text("Visitor Relationship to Personnel Report", 10, 15); 
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
                item.relationship_personnel || '',
                item.risks || '',
                item.impacts || '',
                item.threats || '',
                item.mitigation || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Relationship', 'Risks', 'Impacts', 'Threats','Mitigation']],
                    body: pageData,
                    startY: startY,
                    margin: { top: 0, left: 10, right: 10 },
                    styles: {
                        fontSize: 8,
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
                allData = await fetchAllVisitorRelPersonnel();
            } else {
                allData = await fetchVisitorRelPersonnel(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((visitor, index) => ({
                key: index + 1,
                id: visitor?.id,
                relationship_personnel: visitor?.relationship_personnel,
                description: visitor?.description,
                risks: visitor?.risks,
                impacts: visitor?.impacts,
                threats: visitor?.threats,
                mitigation: visitor?.mitigation,
                risk_level: visitor?.risk_level,
                impact_level: visitor?.impact_level,
                threat_level: visitor?.threat_level,
            }));

        const exportData = printSource.map((visitor, index) => {
            return {
                "No.": index + 1,
                "Relationship": visitor?.relationship_personnel,
                "Description": visitor?.description,
                "Risks": visitor?.risks,
                "Impacts": visitor?.impacts,
                "Threats": visitor?.threats,
                "Mitigation": visitor?.mitigation,
                "Risk Level": visitor?.risk_level,
                "Impact Level": visitor?.impact_level,
                "Threat Level": visitor?.threat_level,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "VisitorRelationshipPersonnel");
        XLSX.writeFile(wb, "VisitorRelationshipPersonnel.xlsx");
    };

        const handleExportCSV = async () => {
        try {
           let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllVisitorRelPersonnel();
            } else {
                allData = await fetchVisitorRelPersonnel(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((visitor, index) => ({
                key: index + 1,
                id: visitor?.id,
                relationship_personnel: visitor?.relationship_personnel,
                description: visitor?.description,
                risks: visitor?.risks,
                impacts: visitor?.impacts,
                threats: visitor?.threats,
                mitigation: visitor?.mitigation,
            }));

        const exportData = printSource.map((visitor, index) => {
            return {
                "No.": index + 1,
                "Relationship": visitor?.relationship_personnel,
                "Description": visitor?.description,
                "Risks": visitor?.risks,
                "Impacts": visitor?.impacts,
                "Threats": visitor?.threats,
                "Mitigation": visitor?.mitigation,
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
            link.setAttribute("download", "VisitorRelationshipPersonnel.csv");
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

    const mapVisitorRelPersonnel = (visitor, index) => ({
            key: index + 1,
            id: visitor?.id,
            relationship_personnel: visitor?.relationship_personnel,
            description: visitor?.description,
            risks: visitor?.risks,
            impacts: visitor?.impacts,
            threats: visitor?.threats,
            mitigation: visitor?.mitigation,
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ["impact-level"],
                queryFn: () => getImpactLevels(token ?? ""),
            },
            {
                queryKey: ["risk-level"],
                queryFn: () => getRiskLevel(token ?? ""),
            },
            {
                queryKey: ["threat-level"],
                queryFn: () => getThreatLevel(token ?? ""),
            },
        ],
    });

    const impactLevelData = results[0]?.data;
    const riskLevelData = results[1]?.data;
    const threatLevelData = results[2]?.data;

    const onImpactLevelChange = (value: number) => {
        setVisitorRelPersonnel(prevForm => ({
            ...prevForm,
            impact_level_id: value,
        }));
    };

    const onriskLevelChange = (value: number) => {
        setVisitorRelPersonnel(prevForm => ({
            ...prevForm,
            risk_level_id: value,
        }));
    };

    const onthreatLevelChange = (value: number) => {
        setVisitorRelPersonnel(prevForm => ({
            ...prevForm,
            threat_level_id: value,
        }));
    };

    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">Relationship</h1>
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
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder="Search..."
                        value={searchText}
                        className="py-2 md:w-64 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button
                        className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center justify-center"
                        onClick={showModal}>
                        <GoPlus />
                            Add Relationship
                    </button>
                </div>
            </div>
        <Table
            className="overflow-x-auto"
            loading={isFetching || searchLoading}
            columns={columns}
                dataSource={debouncedSearch
                        ? (searchData?.results || []).map(mapVisitorRelPersonnel)
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
                title="Visitor Relationship Personnel Report"
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
                title="Add Visitor Relationship to Personnel"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="60%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
                <AddVisitorRelPersonnel
                    onClose={handleCancel}
                    />
            </Modal>
            <Modal
                title="Edit Visitor Relationship Personnel"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width="60%"
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <div className="flex flex-wrap">
                        <div className="w-full md:w-1/2 p-2">
                            <Form.Item
                                name="relationship_personnel"
                                label="Visitor Relationship Personnel"
                                rules={[{ required: true, message: "Please input the Visitor Relationship Personnel" }]}
                            >
                                <Input className="h-12 border w-full border-gray-300 rounded-lg px-2"/>
                            </Form.Item>
                            <Form.Item
                                name="risks"
                                label="Risks"
                                rules={[{ required: true, message: "Please input the Risks" }]}
                            >
                                <Input className="h-12 border w-full border-gray-300 rounded-lg px-2"/>
                            </Form.Item>
                            <Form.Item
                                name="impacts"
                                label="Impacts"
                                rules={[{ required: true, message: "Please input the Impacts" }]}
                            >
                                <Input className="h-12 border w-full border-gray-300 rounded-lg px-2"/>
                            </Form.Item>
                            <Form.Item
                                name="threats"
                                label="Threats"
                                rules={[{ required: true, message: "Please input the Threats" }]}
                            >
                                <Input className="h-12 border w-full border-gray-300 rounded-lg px-2"/>
                            </Form.Item>
                            <Form.Item
                                name="mitigation"
                                label="Mitigation"
                                rules={[{ required: true, message: "Please input the Mitigation" }]}
                            >
                                <Input className="h-12 border w-full border-gray-300 rounded-lg px-2"/>
                            </Form.Item>
                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: "Please input a description" }]}
                            >
                                <Input className="h-12 border w-full border-gray-300 rounded-lg px-2" />
                            </Form.Item>
                        </div>
                        <div className="w-full md:w-1/2 p-2">
                            <Form.Item
                                label="Impact Level"
                                name="impact_level_id"
                            >
                                <Select
                                    className="h-[3rem] w-full"
                                    showSearch
                                    placeholder="Impact Level"
                                    optionFilterProp="label"
                                    onChange={onImpactLevelChange}
                                    options={impactLevelData?.results?.map(impact => ({
                                        value: impact.id,
                                        label: impact?.impact_level
                                    }))} />
                            </Form.Item>
                            <Form.Item
                                label="Risk Level"
                                name="risk_level_id"
                            >
                                <Select
                                    className="h-[3rem] w-full"
                                    showSearch
                                    placeholder="Risk Level"
                                    optionFilterProp="label"
                                    onChange={onriskLevelChange}
                                    options={riskLevelData?.results?.map(risk => ({
                                        value: risk.id,
                                        label: risk?.name
                                    }))} />
                            </Form.Item>
                            <Form.Item
                                label="Threat Level"
                                name="threat_level_id"
                            >
                                <Select
                                    className="h-[3rem] w-full"
                                    showSearch
                                    placeholder="Threat Level"
                                    optionFilterProp="label"
                                    onChange={onthreatLevelChange}
                                    options={threatLevelData?.results?.map(threat => ({
                                        value: threat.id,
                                        label: threat?.threat_level
                                    }))} />
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default VisitorRelPersonnel
