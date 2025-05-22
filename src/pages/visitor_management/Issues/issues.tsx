import { deleteIssues, getImpactLevels, getImpacts, getIssueCategory, getIssues, getIssueStatuses, getReportingCategory, getRiskLevels, getSeverityLevel, getUser, patchIssues } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select, Table } from "antd"
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import bjmp from '../../../assets/Logo/QCJMD.png'
import moment from "moment";

export type IssuesProps = {
    created_at: any;
    id: number | null;
    module: string;
    sub_module: string;
    reporting_category: string;
    issue_category: string;
    issue_severity_level: string;
    risk_level: string;
    impact_level: string;
    impact: string;
    issue_status: string;
    record_status: string;
    updated_at: string;
    module_affected: string;
    description: string;
    root_cause: string;
    date_reported: string; 
    reported_by: string;
    resolution: string;
    resolution_date: string; 
    notes: string;
    updated_by: number | null;
};

const Issues = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [issues, setIssues] = useState<IssuesProps>(
        {id: null,
        module: '',
        sub_module: '',
        reporting_category: '',
        issue_category: '',
        issue_severity_level: '',
        risk_level: '',
        impact_level: '',
        impact: '',
        issue_status: '',
        record_status: '',
        updated_at: '',
        module_affected: '',
        description: '',
        root_cause: '',
        date_reported: '', 
        reported_by: '',
        resolution: '',
        resolution_date: '', 
        notes: '',
        updated_by: null,
        created_at: null,
    }
    );
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const { data } = useQuery({
        queryKey: ['issues'],
        queryFn: () => getIssues(token ?? ""),
    })

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteIssues(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            messageApi.success("Issues deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Issues");
        },
    });

    const { mutate: editIssues, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: IssuesProps) =>
        patchIssues(token ?? "", updated.id, updated),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["issues"] });
        messageApi.success("Issues updated successfully");
        setIsEditModalOpen(false);
        },
        onError: () => {
        messageApi.error("Failed to update Issues");
        },
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ["reporting-category"],
                queryFn: () => getReportingCategory(token ?? ""),
            },
            {
                queryKey: ["issue-category"],
                queryFn: () => getIssueCategory(token ?? ""),
            },
            {
                queryKey: ["issue-severity-level"],
                queryFn: () => getSeverityLevel(token ?? ""),
            },
            {
                queryKey: ["risk-level"],
                queryFn: () => getRiskLevels(token ?? ""),
            },
            {
                queryKey: ["impact-level"],
                queryFn: () => getImpactLevels(token ?? ""),
            },
            {
                queryKey: ["impact"],
                queryFn: () => getImpacts(token ?? ""),
            },
            {
                queryKey: ["issue-status"],
                queryFn: () => getIssueStatuses(token ?? ""),
            },
        ],
    });
        
    const ReportingCategoryData = results[0].data;
    const IssueCategoryData = results[1].data;
    const SeverityLevelData = results[2].data;
    const RiskLevelData = results[3].data;
    const ImpactLevelData = results[4].data;
    const ImpactData = results[5].data;
    const IssueStatusData = results[6].data;

    const handleEdit = (record: IssuesProps) => {
        setIssues(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (issues && issues.id) {
        const updatedIssues: IssuesProps = {
            ...issues,
            ...values,
        };
        editIssues(updatedIssues);
        } else {
        messageApi.error("Selected Issues is invalid");
        }
    };

    const onReportingCategoryChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            reporting_category: value,
        }));
    }; 

    const onIssueCateogryChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            issue_category: value,
        }));
    }; 

    const onSeverityLevelChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            issue_severity_level: value,
        }));
    }; 

    const onRiskLevelChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            risk_level: value,
        }));
    }; 

    const onImpactLevelChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            impact_level: value,
        }));
    }; 

    const onImpactChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            impact: value,
        }));
    }; 

    const onIssueStatusChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            issue_status: value,
        }));
    }; 

    const dataSource = data?.results?.map((issues) => ({
        key: issues?.id,
        id: issues?.id ?? '',
        created_at: issues?.created_at ?? '', // <-- fix here
        issue_type: issues?.issue_type?.name ?? '',
        issue_category: issues?.issue_category?.name ?? '',
        categorization_rule: issues?.issue_category?.categorization_rule ?? '',
        status: issues?.status?.name ?? '',
        description: issues?.status?.description ?? '',
        organization: issues?.organization ?? 'Bureau of Jail Management and Penology',
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const filteredData = dataSource?.filter((issues) =>
        Object.values(issues).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<IssuesProps> = [
        {
            title: 'No.',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Timestamp',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: (a, b) => a.created_at.localeCompare(b.created_at),
            render: (value) => value ? moment(value).format("YYYY-MM-DD hh:mm:ss A") : "",
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.created_at))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.created_at === value,
        },
        {
            title: 'Issue Type',
            dataIndex: 'issue_type',
            key: 'issue_type',
            sorter: (a, b) => a.issue_type.localeCompare(b.issue_type),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.issue_type))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.issue_type === value,
        },
        {
            title: 'Issue Category',
            dataIndex: 'issue_category',
            key: 'issue_category',
            sorter: (a, b) => a.issue_category.localeCompare(b.issue_category),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.issue_category))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.issue_category === value,
        },
        {
            title: 'Categorization Rule',
            dataIndex: 'categorization_rule',
            key: 'categorization_rule',
            sorter: (a, b) => a.categorization_rule.localeCompare(b.categorization_rule),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.categorization_rule))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.categorization_rule === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.status))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Status Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.description))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.description === value,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
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
    ]
    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(dataSource);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Issues");
        XLSX.writeFile(wb, "Issues.xlsx");
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
            doc.text("Issues Report", 10, 15); 
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
            item.issue_type || '',
            item.issue_category || '',
            item.categorization_rule || '',
            item.status || '',
        ]);
    
        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);
    
            autoTable(doc, { 
                head: [['No.', 'Issue Type', 'Issue Category', 'Categorization Rule', 'Status']],
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
                <CSVLink data={dataSource} filename="Issues.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
        {contextHolder}<h1 className="text-2xl font-bold text-[#1E365D]">Issues</h1>
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
                <Input
                    placeholder="Search..."
                    value={searchText}
                    className="py-2 md:w-72 w-full"
                    onChange={(e) => setSearchText(e.target.value)}
                />
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
        <Modal
                title="Issues Report"
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
                title="Edit Issues"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width="60%"
            >
                <Form form={form} layout="vertical" className="grid grid-cols-1 md:grid-cols-2 md:space-x-2" onFinish={handleUpdate}>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: "Please input a description" }]}
                >
                    <Input className="h-[3rem] w-full"/>
                </Form.Item>
                <Form.Item
                    name="reporting_category"
                    label="Reporting Category"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Reporting Category"
                        optionFilterProp="label"
                        onChange={onReportingCategoryChange}
                        options={ReportingCategoryData?.results?.map(reporting_cateogry => (
                            {
                                value: reporting_cateogry.id,
                                label: reporting_cateogry?.name
                            }
                        ))}
                    />
                </Form.Item>
                <Form.Item
                    name="issue_category"
                    label="Issue Category"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Issue Category"
                        optionFilterProp="label"
                        onChange={onIssueCateogryChange}
                        options={IssueCategoryData?.results?.map(issue_category => ({
                            value: issue_category.id,
                            label: issue_category?.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="issue_severity_level"
                    label="Severity Level"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Severity Level"
                        optionFilterProp="label"
                        onChange={onSeverityLevelChange}
                        options={SeverityLevelData?.results?.map(level => ({
                            value: level.id,
                            label: level?.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="risk_level"
                    label="Risk Level"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Risk Level"
                        optionFilterProp="label"
                        onChange={onRiskLevelChange}
                        options={RiskLevelData?.results?.map(risk => ({
                            value: risk.id,
                            label: risk?.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="impact_level"
                    label="Impact Level"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Impact Level"
                        optionFilterProp="label"
                        onChange={onImpactLevelChange}
                        options={ImpactLevelData?.results?.map(impact => ({
                            value: impact.id,
                            label: impact?.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="impact"
                    label="Impact"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Impact"
                        optionFilterProp="label"
                        onChange={onImpactChange}
                        options={ImpactData?.results?.map(impact => ({
                            value: impact.id,
                            label: impact?.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="issue_status"
                    label="Issue Status"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Issue Status"
                        optionFilterProp="label"
                        onChange={onIssueStatusChange}
                        options={IssueStatusData?.results?.map(status => ({
                            value: status.id,
                            label: status?.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Notes"
                >
                    <Input className="h-[3rem] w-full"/>
                </Form.Item>
                <Form.Item
                    name="issue_status"
                    label="Issues Status"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Issues Status"
                        optionFilterProp="label"
                        onChange={onIssueStatusChange}
                        options={IssueStatusData?.results?.map(issue_status => (
                            {
                                value: issue_status.id,
                                label: issue_status?.name
                            }
                        ))}
                    />
                </Form.Item>
                </Form>
            </Modal>
            <Modal
                className="overflow-y-auto rounded-lg scrollbar-hide"
                title="Add Issues"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width="30%"
                style={{ maxHeight: "80vh", overflowY: "auto" }} 
                >
            </Modal>
        </div>
    )
}

export default Issues
