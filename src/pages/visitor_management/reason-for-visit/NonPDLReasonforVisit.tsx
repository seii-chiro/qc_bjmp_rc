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
import { ReasonforVisitRecord } from "@/lib/issues-difinitions";
import { getImpactLevels, getImpacts, getNPImpactLevel, getNPThreatLevel, getOrganization, getRiskLevel, getRisks, getUser, PaginatedResponse } from "@/lib/queries";
import { deleteReasonforVisit, getThreatLevel, updateReasonforVisit } from "@/lib/query";
import AddReasonforVisit from "./AddReasonforVisit";

const NonPDLReasonforVisit = () => {
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
    const [reasonforVisit, setreasonforVisit] = useState<ReasonforVisitRecord | null>(null);
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
    const fetchReasonforVisit = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-reason-visits/?search=${search}`, {
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
        queryKey: ["reason", debouncedSearch],
        queryFn: () => fetchReasonforVisit(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "reason",
            "reason-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<ReasonforVisitRecord>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-reason-visits/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Reason for Visit data.");
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
        mutationFn: (id: number) => deleteReasonforVisit(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reason"] });
            messageApi.success("Reason for Visit deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Reason for Visit");
        },
    });

    const { mutate: editReasonforVisit, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: ReasonforVisitRecord) =>
            updateReasonforVisit(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reason"] });
            messageApi.success("Reason for Visit updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Reason for Visit");
        },
    });

    const handleEdit = (record: ReasonforVisitRecord) => {
        setreasonforVisit(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (reasonforVisit && reasonforVisit.id) {
            const updatedReasonforVisit: ReasonforVisitRecord = {
                ...reasonforVisit,
                ...values,
            };
            editReasonforVisit(updatedReasonforVisit);
        } else {
            messageApi.error("Selected Reason for Visit is invalid");
        }
    };

    const dataSource = data?.results?.map((reason, index) => ({
            key: index + 1,
            id: reason?.id,
            reason_visit: reason?.reason_visit,
            description: reason?.description,
            risks: reason?.risks,
            impacts: reason?.impacts,
            threats: reason?.threats,
            mitigation: reason?.mitigation,
            risk_level: reason?.risk_level,
            impact_level: reason?.impact_level,
            threat_level: reason?.threat_level,
            updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    }));

    const columns: ColumnsType<ReasonforVisitRecord> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Reason for Visit',
            dataIndex: 'reason_visit',
            key: 'reason_visit',
            sorter: (a, b) => a.reason_visit.localeCompare(b.reason_visit),
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

    const fetchAllReasonforVisit = async () => {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-reason-visits/?limit=1000`, {
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
            const maxRowsPerPage = 13; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllReasonforVisit();
            } else {
                allData = await fetchReasonforVisit(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((reason, index) => ({
                key: index + 1,
                id: reason?.id,
                reason_visit: reason?.reason_visit,
                description: reason?.description,
                risks: reason?.risks,
                impacts: reason?.impacts,
                threats: reason?.threats,
                mitigation: reason?.mitigation,
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
                doc.text("Reason for Visit Report", 10, 15); 
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
                item.reason_visit || '',
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
                allData = await fetchAllReasonforVisit();
            } else {
                allData = await fetchReasonforVisit(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((reason, index) => ({
                key: index + 1,
                id: reason?.id,
                reason_visit: reason?.reason_visit,
                description: reason?.description,
                risks: reason?.risks,
                impacts: reason?.impacts,
                threats: reason?.threats,
                mitigation: reason?.mitigation,
                risk_level: reason?.risk_level,
                impact_level: reason?.impact_level,
                threat_level: reason?.threat_level,
            }));

        const exportData = printSource.map((reason, index) => {
            return {
                "No.": index + 1,
                "Reason of Visit": reason?.reason_visit,
                "Description": reason?.description,
                "Risks": reason?.risks,
                "Impacts": reason?.impacts,
                "Threats": reason?.threats,
                "Mitigation": reason?.mitigation,
                "Risk Level": reason?.risk_level,
                "Impact Level": reason?.impact_level,
                "Threat Level": reason?.threat_level,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ReasonforVisit");
        XLSX.writeFile(wb, "ReasonforVisit.xlsx");
    };

        const handleExportCSV = async () => {
        try {
           let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllReasonforVisit();
            } else {
                allData = await fetchReasonforVisit(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((reason, index) => ({
                key: index + 1,
                id: reason?.id,
                reason_visit: reason?.reason_visit,
                description: reason?.description,
                risks: reason?.risks,
                impacts: reason?.impacts,
                threats: reason?.threats,
                mitigation: reason?.mitigation,
                risk_level: reason?.risk_level,
                impact_level: reason?.impact_level,
                threat_level: reason?.threat_level,
            }));

        const exportData = printSource.map((reason, index) => {
            return {
                "No.": index + 1,
                "Reason of Visit": reason?.reason_visit,
                "Description": reason?.description,
                "Risks": reason?.risks,
                "Impacts": reason?.impacts,
                "Threats": reason?.threats,
                "Mitigation": reason?.mitigation,
                "Risk Level": reason?.risk_level,
                "Impact Level": reason?.impact_level,
                "Threat Level": reason?.threat_level,
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
            link.setAttribute("download", "ReasonforVisit.csv");
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

    const mapReasonforVisit = (reason, index) => ({
            key: index + 1,
            id: reason?.id,
            reason_visit: reason?.reason_visit,
            description: reason?.description,
            risks: reason?.risks,
            impacts: reason?.impacts,
            threats: reason?.threats,
            mitigation: reason?.mitigation,
            risk_level: reason?.risk_level,
            impact_level: reason?.impact_level,
            threat_level: reason?.threat_level,
    });

const results = useQueries({
        queries: [
            {
                queryKey: ["impact-level"],
                queryFn: () => getNPImpactLevel(token ?? ""),
            },
            {
                queryKey: ["risk-level"],
                queryFn: () => getRiskLevel(token ?? ""),
            },
            {
                queryKey: ["threat-level"],
                queryFn: () => getNPThreatLevel(token ?? ""),
            },
        ],
    });

    const impactLevelData = results[0]?.data;
    const riskLevelData = results[1]?.data;
    const threatLevelData = results[2]?.data;

    const onImpactLevelChange = (value: number) => {
        setreasonforVisit(prevForm => ({
            ...prevForm,
            impact_level_id: value,
        }));
    };

    const onriskLevelChange = (value: number) => {
        setreasonforVisit(prevForm => ({
            ...prevForm,
            risk_level_id: value,
        }));
    };

    const onthreatLevelChange = (value: number) => {
        setreasonforVisit(prevForm => ({
            ...prevForm,
            threat_level_id: value,
        }));
    };
    return (
        <div>
        {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">Reason for Visit</h1>
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
                            Add Reason for Visit
                    </button>
                </div>
            </div>
            <Table
            className="overflow-x-auto"
            loading={isFetching || searchLoading}
            columns={columns}
                dataSource={debouncedSearch
                        ? (searchData?.results || []).map(mapReasonforVisit)
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
                    title="Reason for Visit Report"
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
                    title="Add Reason for Visit"
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null}
                    width="60%"
                    style={{ maxHeight: "80vh", overflowY: "auto" }} 
                    >
                    <AddReasonforVisit
                        onClose={handleCancel}
                        />
                </Modal>
                <Modal
                    title="Edit Reason for Visit"
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
                                    name="reason_visit"
                                    label="Reason for Visit"
                                    rules={[{ required: true, message: "Please input the Reason for Visit" }]}
                                >
                                    <Input className="h-12 border w-full border-gray-300 rounded-lg px-2"/>
                                </Form.Item>
                                <Form.Item
                                    name="risks"
                                    label="Risks"
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
                                    name="impact_level"
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
                                    name="risk_level"
                                >
                                    <Select
                                        className="h-[3rem] w-full"
                                        showSearch
                                        placeholder="Risk Level"
                                        optionFilterProp="label"
                                        onChange={onriskLevelChange}
                                        options={riskLevelData?.results?.map(risk => ({
                                            value: risk.id,
                                            label: risk?.risk_severity
                                        }))} />
                                </Form.Item>
                                <Form.Item
                                    label="Threat Level"
                                    name="threat_level"
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

export default NonPDLReasonforVisit
