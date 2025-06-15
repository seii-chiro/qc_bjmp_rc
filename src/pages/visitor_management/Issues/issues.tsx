import { deleteIssues, getImpactLevels, getImpacts, getIssueCategories, getIssueStatuses, getIssueTypes, getReportingCategory, getRiskLevels, getSeverityLevel, getUser, PaginatedResponse, patchIssues } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select, Table } from "antd"
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import bjmp from '../../../assets/Logo/QCJMD.png'
import moment from "moment";
import { BASE_URL } from "@/lib/urls";
import { useSearchParams } from "react-router-dom";
import { IssueCategory, IssueType, Status } from "@/lib/spdefinitions";

type IssuesMainPayload = {
    id: number;
    created_by: string;
    updated_by: string;
    issue_type: IssueType;
    issue_category: IssueCategory;
    status: Status;
    record_status: string;
    created_at: string;
    updated_at: string;
    remarks: string;
    issue_type_id: number,
    issue_category_id: number,
    status_id: number,
    record_status_id: number,
}

const Issues = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [issues, setIssues] = useState<IssuesMainPayload[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [issueTypeFilter, setIssueTypeFilter] = useState<string[]>([]);
    const [issueCategoryFilter, setIssueCategoryFilter] = useState<string[]>([]);
    const [issueStatusFilter, setIssueStatusFilter] = useState<string[]>([]);

    const fetchIssues = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/issues_v2/issues/?search=${search}`, {
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
        queryKey: ["issues", debouncedSearch],
        queryFn: () => fetchIssues(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "issues",
            "issues-table",
            page,
            limit,
            issueTypeFilter,
            issueCategoryFilter,
            issueStatusFilter
        ],
        queryFn: async (): Promise<PaginatedResponse<IssuesMainPayload>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            if (issueTypeFilter.length > 0) {
                params.append("issue_type", issueTypeFilter.join(","));
            }

            if (issueCategoryFilter.length > 0) {
                params.append("issue_category", issueCategoryFilter.join(","));
            }

            if (issueStatusFilter.length > 0) {
                params.append("status", issueStatusFilter.join(","));
            }

            const res = await fetch(`${BASE_URL}/api/issues_v2/issues/?${params.toString()}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch Issues data.");
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
        mutationFn: (updated: IssuesMainPayload) =>
            patchIssues(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "issues",
                    "issues-table",
                    page,
                    limit,
                    issueTypeFilter,
                    issueCategoryFilter,
                    issueStatusFilter
                ],
            });
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
                queryKey: ["issue-category"],
                queryFn: () => getIssueCategories(token ?? ""),
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
            {
                queryKey: ["issue-type"],
                queryFn: () => getIssueTypes(token ?? ""),
            },
        ],
    });

    const IssueCategoryData = results[0].data;
    const RiskLevelData = results[1].data;
    const ImpactLevelData = results[2].data;
    const ImpactData = results[3].data;
    const IssueStatusData = results[4].data;
    const IssueTypesData = results[5].data;

    const handleEdit = (record: IssuesMainPayload) => {
        setIssues(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (issues && issues.id) {
            const updatedIssues: IssuesMainPayload = {
                ...issues,
                ...values,
            };
            editIssues(updatedIssues);
        } else {
            messageApi.error("Selected Issues is invalid");
        }
    };

    const onIssueTypesChange = (value: number) => {
        setIssues(prevForm => ({
            ...prevForm,
            issue_type_id: value,
        }));
    };

    const onIssueCateogryChange = (value: number) => {
        setIssues(prevForm => ({
            ...prevForm,
            issue_category_id: value,
        }));
    };

    const onRiskLevelChange = (value: number) => {
        setIssues(prevForm => ({
            ...prevForm,
            risk_level_id: value,
        }));
    };

    const onImpactLevelChange = (value: number) => {
        setIssues(prevForm => ({
            ...prevForm,
            impact_level_id: value,
        }));
    };

    const onImpactChange = (values: number[]) => {
        setIssues(prevForm => ({
            ...prevForm,
            impact_id: values,
        }));
    };

    const onIssueStatusChange = (value: string) => {
        setIssues(prevForm => ({
            ...prevForm,
            status_id: value,
        }));
    };

    const [searchParams] = useSearchParams();
    const issueType = searchParams.get("issue_type") || "all";
    const issueTypeList = issueType !== "all" ? issueType.split(",").map(decodeURIComponent) : [];

    const issueCategory = searchParams.get("issue_category") || "all";
    const issueCategoryList = issueCategory !== "all" ? issueCategory.split(",").map(decodeURIComponent) : [];

    const issueStatus = searchParams.get("status") || "all";
    const issueStatusList = issueStatus !== "all" ? issueStatus.split(",").map(decodeURIComponent) : [];

    useEffect(() => {
        if (issueTypeList.length > 0 && JSON.stringify(issueTypeFilter) !== JSON.stringify(issueTypeList)) {
            setIssueTypeFilter(issueTypeList);
        }
    }, [issueTypeList, issueTypeFilter]);

    useEffect(() => {
        if (issueCategoryList.length > 0 && JSON.stringify(issueCategoryFilter) !== JSON.stringify(issueCategoryList)) {
            setIssueCategoryFilter(issueCategoryList);
        }
    }, [issueCategoryList, issueCategoryFilter]);

    useEffect(() => {
        if (issueStatusList.length > 0 && JSON.stringify(issueStatusFilter) !== JSON.stringify(issueStatusList)) {
            setIssueStatusFilter(issueStatusList);
        }
    }, [issueStatusList, issueStatusFilter]);


    const { data: TypeData, isLoading: issueByTypeLoading } = useQuery({
        queryKey: ['issue-type-option'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/issues_v2/issue-types/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch Issue Type Option');
            return res.json();
        },
        enabled: !!token,
    });

    const { data: CategoryData, isLoading: issueByCategoryLoading } = useQuery({
        queryKey: ['issue-category-option'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/issues_v2/issue-categories/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch Issue Category Option');
            return res.json();
        },
        enabled: !!token,
    });

    const { data: statusData, isLoading: issueByStatusLoading } = useQuery({
        queryKey: ['issue-status-option'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/issues_v2/issue-statuses/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch Issue Status Option');
            return res.json();
        },
        enabled: !!token,
    });
    const confirmDelete = (recordId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this record?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                deleteMutation.mutate(recordId);
            },
            onCancel() {
            },
            centered: true,
        });
    };
    const dataSource = data?.results?.map((issues) => ({
        id: issues?.id ?? '',
        created_at: issues?.created_at ?? '',
        issue_type: issues?.issue_type?.name ?? '',
        issue_category: issues?.issue_category?.name ?? '',
        categorization_rule: issues?.issue_category?.categorization_rule ?? '',
        status: issues?.status?.name ?? '',
        description: issues?.status?.description ?? '',
        impacts: issues?.issue_type?.risk?.impacts.map(impact => impact.name).join(", "),
        risk_level: issues?.issue_type?.risk?.risk_level,
        impact_level: issues?.issue_type?.risk?.impacts[0]?.impact_level,
        organization: issues?.organization ?? 'Bureau of Jail Management and Penology',
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));;

    const issueTypeFilters = TypeData?.results?.map(type => ({
        text: type.name,
        value: type.name,
    })) ?? [];

    const issueCategoryFilters = CategoryData?.results?.map(category => ({
        text: category.name,
        value: category.name,
    })) ?? [];

    const issueStatusFilters = statusData?.results?.map(status => ({
        text: status.name,
        value: status.name,
    })) ?? [];

    const columns: ColumnsType<IssuesMainPayload> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Timestamp',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: (a, b) => a.created_at.localeCompare(b.created_at),
            defaultSortOrder: 'descend',
            render: (value) => value ? moment(value).format("YYYY-MM-DD hh:mm:ss A") : "",
        },
        {
            title: 'Issue Type',
            dataIndex: 'issue_type',
            key: 'issue_type',
            sorter: (a, b) => a.issue_type.localeCompare(b.issue_type),
            filters: issueTypeFilters,
            filteredValue: issueTypeFilter,
            onFilter: (value, record) => record.issue_type === value,
        },
        {
            title: 'Issue Category',
            dataIndex: 'issue_category',
            key: 'issue_category',
            sorter: (a, b) => a.issue_category.localeCompare(b.issue_category),
            filters: issueCategoryFilters,
            filteredValue: issueCategoryFilter,
            onFilter: (value, record) => record.issue_category === value,
        },
        {
            title: 'Categorization Rule',
            dataIndex: 'categorization_rule',
            key: 'categorization_rule',
            sorter: (a, b) => a.categorization_rule.localeCompare(b.categorization_rule),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: issueStatusFilters,
            filteredValue: issueStatusFilter,
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Status Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: 'right',
            render: (_, record) => (
                <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        <AiOutlineEdit />
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(record.id);
                        }}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        },
    ]

    const fetchAllIssues = async () => {
        const res = await fetch(`${BASE_URL}/api/issues_v2/issues/?limit=10000`, {
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

        const doc = new jsPDF('landscape');
        const headerHeight = 48;
        const footerHeight = 32;
        const organizationName = dataSource[0]?.organization || "";
        const PreparedBy = `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}` || '';

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;
        const maxRowsPerPage = 15;
        let startY = headerHeight;

        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllIssues();
            } else {
                allData = await fetchIssues(searchText.trim());
            }
            const allResults = allData?.results || [];

            const filteredResults = allResults.filter(issues => {
                const issueTypeValue = issues?.issue_type?.name ?? '';
                const issueCategoryValue = issues?.issue_category?.name ?? '';
                const statusValue = issues?.status?.name ?? '';

                const matchesGlobalIssueType = issueType === "all" || issueTypeValue === issueType;
                const matchesGlobalIssueCategory = issueCategory === "all" || issueCategoryValue === issueCategory;
                const matchesGlobalStatus = issueStatus === "all" || statusValue === issueStatus;
                const matchesColumnIssueType = issueTypeFilter.length === 0 || issueTypeFilter.includes(issueTypeValue);
                const matchesColumnIssueCategory = issueCategoryFilter.length === 0 || issueCategoryFilter.includes(issueCategoryValue);
                const matchesColumnStatus = issueStatusFilter.length === 0 || issueStatusFilter.includes(statusValue);

                return (
                    matchesColumnIssueType &&
                    matchesGlobalIssueType &&
                    matchesColumnIssueCategory &&
                    matchesGlobalIssueCategory &&
                    matchesGlobalStatus &&
                    matchesColumnStatus
                );
            });

            const printSource = filteredResults.map((issues, index) => ({
                key: index + 1,
                id: issues?.id ?? '',
                created_at: issues?.created_at ?? '',
                issue_type: issues?.issue_type?.name ?? '',
                issue_category: issues?.issue_category?.name ?? '',
                categorization_rule: issues?.issue_category?.categorization_rule ?? '',
                status: issues?.status?.name ?? '',
                description: issues?.status?.description ?? '',
                impacts: issues?.issue_type?.risk?.impacts.map(impact => impact.name).join(", "),
                risk_level: issues?.issue_type?.risk?.risk_level,
                impact_level: issues?.issue_type?.risk?.impacts[0]?.impact_level,
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
            const tableData = printSource.map((item, idx) => [
                idx + 1,
                item.issue_type || '',
                item.issue_category || '',
                item.status || '',
                item.description || ''
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);

                autoTable(doc, {
                    head: [['No.', 'Issue Type', 'Issue Category', 'Status', 'Status Description']],
                    body: pageData,
                    startY: startY,
                    margin: { top: 0, left: 10, right: 10 },
                    styles: {
                        fontSize: 10,
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
            setIsLoading(false); // Ensure loading state is reset
        }
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null);
    };

    const handleExportExcel = async () => {
        let allData;
        if (searchText.trim() === '') {
            allData = await fetchAllIssues();
        } else {
            allData = await fetchIssues(searchText.trim());
        }
        const allResults = allData?.results || [];

        const printSource = allResults.map((issues, index) => ({
            key: index + 1,
            id: issues?.id ?? '',
            created_at: issues?.created_at ? moment(issues.created_at).format('YYYY-MM-DD HH:mm:ss') : '',
            issue_type: issues?.issue_type?.name ?? '',
            issue_category: issues?.issue_category?.name ?? '',
            categorization_rule: issues?.issue_category?.categorization_rule ?? '',
            status: issues?.status?.name ?? '',
            description: issues?.status?.description ?? '',
            impacts: issues?.issue_type?.risk?.impacts.map(impact => impact.name).join(", "),
            risk_level: issues?.issue_type?.risk?.risk_level,
            impact_level: issues?.issue_type?.risk?.impacts[0]?.impact_level,
        }));

        const filteredResults = printSource.filter(issues => {
            const issueTypeValue = issues?.issue_type?.name ?? '';
            const issueCategoryValue = issues?.issue_category?.name ?? '';
            const statusValue = issues?.status?.name ?? '';

            const matchesGlobalIssueType = issueType === "all" || issueTypeValue === issueType;
            const matchesGlobalIssueCategory = issueCategory === "all" || issueCategoryValue === issueCategory;
            const matchesGlobalStatus = issueStatus === "all" || statusValue === issueCategory;
            const matchesColumnIssueType = issueTypeFilter.length === 0 || issueTypeFilter.includes(issueTypeValue);
            const matchesColumnIssueCategory = issueCategoryFilter.length === 0 || issueCategoryFilter.includes(issueCategoryValue);
            const matchesColumnStatus = issueStatusFilter.length === 0 || issueStatusFilter.includes(statusValue);

            return (
                matchesColumnIssueType &&
                matchesGlobalIssueType &&
                matchesColumnIssueCategory &&
                matchesGlobalIssueCategory &&
                matchesGlobalStatus &&
                matchesColumnStatus
            );
        });

        const exportData = printSource.map((issues, index) => {
            return {
                "No.": index + 1,
                "Timestamps": issues?.created_at,
                "Issue Type": issues?.issue_type,
                "Issue Category": issues?.issue_category,
                "Categorization Rule": issues?.categorization_rule,
                "Status": issues?.status,
                "Description": issues?.description,
                "Impacts": issues?.impacts,
                "Risk Level": issues?.risk_level,
                "Impact Level": issues?.impact_level
            };
        });


        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Issues");
        XLSX.writeFile(wb, "Issues.xlsx");
    };

    const handleExportCSV = async () => {
        try {
            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllIssues();
            } else {
                allData = await fetchIssues(searchText.trim());
            }
            const allResults = allData?.results || [];

            const filteredResults = allResults.filter(issues => {
                const issueTypeValue = issues?.issue_type?.name ?? '';
                const issueCategoryValue = issues?.issue_category?.name ?? '';
                const statusValue = issues?.status?.name ?? '';

                const matchesGlobalIssueType = issueType === "all" || issueTypeValue === issueType;
                const matchesGlobalIssueCategory = issueCategory === "all" || issueCategoryValue === issueCategory;
                const matchesGlobalStatus = issueStatus === "all" || statusValue === issueCategory;
                const matchesColumnIssueType = issueTypeFilter.length === 0 || issueTypeFilter.includes(issueTypeValue);
                const matchesColumnIssueCategory = issueCategoryFilter.length === 0 || issueCategoryFilter.includes(issueCategoryValue);
                const matchesColumnStatus = issueStatusFilter.length === 0 || issueStatusFilter.includes(statusValue);

                return (
                    matchesColumnIssueType &&
                    matchesGlobalIssueType &&
                    matchesColumnIssueCategory &&
                    matchesGlobalIssueCategory &&
                    matchesGlobalStatus &&
                    matchesColumnStatus
                );
            });

            const printSource = filteredResults.map((issues, index) => ({
                key: index + 1,
                id: issues?.id ?? '',
                created_at: issues?.created_at ? moment(issues.created_at).format('YYYY-MM-DD HH:mm:ss') : '',
                issue_type: issues?.issue_type?.name ?? '',
                issue_category: issues?.issue_category?.name ?? '',
                categorization_rule: issues?.issue_category?.categorization_rule ?? '',
                status: issues?.status?.name ?? '',
                description: issues?.status?.description ?? '',
                impacts: issues?.issue_type?.risk?.impacts.map(impact => impact.name).join(", "),
                risk_level: issues?.issue_type?.risk?.risk_level,
                impact_level: issues?.issue_type?.risk?.impacts[0]?.impact_level,
            }));

            const exportData = printSource.map((issues, index) => {
                return {
                    "No.": index + 1,
                    "Timestamps": issues?.created_at,
                    "Issue Type": issues?.issue_type,
                    "Issue Category": issues?.issue_category,
                    "Categorization Rule": issues?.categorization_rule,
                    "Status": issues?.status,
                    "Description": issues?.description,
                    "Impacts": issues?.impacts,
                    "Risk Level": issues?.risk_level,
                    "Impact Level": issues?.impact_level
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
            link.setAttribute("download", "Issues.csv");
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
                <a onClick={handleExportExcel} disabled={isLoading}> {/* Disable if loading */}
                    {isLoading ? <span className="loader"></span> : 'Export Excel'}
                </a>
            </Menu.Item>
            <Menu.Item>
                <a onClick={handleExportCSV} disabled={isLoading}> {/* Disable if loading */}
                    {isLoading ? <span className="loader"></span> : 'Export CSV'}
                </a>
            </Menu.Item>
        </Menu>
    );

    const totalRecords = debouncedSearch
        ? data?.count || 0
        : data?.count || 0;

    const mapIssues = (issues, index) => ({
        key: index + 1,
        id: issues?.id ?? '',
        created_at: issues?.created_at ?? '',
        issue_type: issues?.issue_type?.name ?? '',
        issue_category: issues?.issue_category?.name ?? '',
        categorization_rule: issues?.issue_category?.categorization_rule ?? '',
        status: issues?.status?.name ?? '',
        description: issues?.status?.description ?? '',
        impacts: issues?.issue_type?.risk?.impacts.map(impact => impact.name).join(", "),
        risk_level: issues?.issue_type?.risk?.risk_level,
        impact_level: issues?.issue_type?.risk?.impacts[0]?.impact_level,
    });

    return (
        <div>
            {contextHolder}<h1 className="text-2xl font-bold text-[#1E365D]">Issues</h1>
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
                        className="py-2 md:w-72 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>
            <Table
                className="overflow-x-auto"
                loading={isFetching || searchLoading || issueByTypeLoading || issueByCategoryLoading || issueByStatusLoading}
                columns={columns}
                dataSource={debouncedSearch
                    ? (searchData?.results || []).map(mapIssues)
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
                onChange={(pagination, filters, sorter) => {
                    setIssueTypeFilter(filters.issue_type as string[] ?? []);
                    setIssueCategoryFilter(filters.issue_category as string[] ?? []);
                    setIssueStatusFilter(filters.status as string[] ?? []);
                }}
                rowKey="id"
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
                width="50%"
            >
                <Form form={form} layout="vertical" className="grid grid-cols-1 md:grid-cols-2 md:space-x-2" onFinish={handleUpdate}>

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
                        name="issue_type"
                        label="Issue Type"
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Issue Type"
                            optionFilterProp="label"
                            onChange={onIssueTypesChange}
                            options={IssueTypesData?.results?.map(issue_type => ({
                                value: issue_type.id,
                                label: issue_type?.name,
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
                                label: risk?.risk_severity,
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
                                label: impact?.impact_level,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="impacts"
                        label="Impacts"
                    >
                        <Select
                            className="p-1 w-full"
                            mode="multiple"
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
                        name="status"
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
                        name="categorization_rule"
                        label="Categorization Rule"
                    >
                        <Input className="h-[3rem] w-full" />
                    </Form.Item>
                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <Input className="h-[3rem] w-full" />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    )
}

export default Issues
