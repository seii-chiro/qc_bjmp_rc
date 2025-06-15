import { getOrganization, getUser, PaginatedResponse } from "@/lib/queries"
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import AddRoles from "./AddRoles";
import { LuSearch } from "react-icons/lu";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { deleteGroup_Roles, getPermission, updateGroup_Roles } from "@/lib/query";
import { BASE_URL } from "@/lib/urls";
import { GroupRoles } from "@/lib/spdefinitions";

const Roles = () => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const token = useTokenStore().token;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [roles, setRoles] = useState<GroupRoles | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const togglePermissions = (key) => {
        setExpandedRowKeys((prev) =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const fetchGroupRole = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/standards/groups/?search=${search}`, {
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
        queryKey: ["roles", debouncedSearch],
        queryFn: () => fetchGroupRole(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "roles",
            "roles-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<GroupRoles>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/standards/groups/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Group Role data.");
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
        mutationFn: (id: number) => deleteGroup_Roles(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            messageApi.success("Group Roles deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Group Roles");
        },
    })
    const { mutate: editUser, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: GroupRoles) =>
            updateGroup_Roles(token ?? "", updated.id, updated),
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            messageApi.success("Group Roles updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Group Roles");
        },
    });

const handleEdit = (record: GroupRoles) => {
    // Ensure record doesn't contain unexpected properties
    const { key, ...rest } = record; // This will strip out the key if it exists
    setRoles(rest);
    form.setFieldsValue(rest);
    setIsEditModalOpen(true);
};

const handleUpdate = (values: any) => {
    if (roles && roles.id) {
        const updatedRoles: GroupRoles = {
            ...roles,
            ...values,
            permissions: roles.permissions
        };
        console.log("Updating with:", updatedRoles);
        editUser(updatedRoles);
    } else {
        messageApi.error("Selected Group Role is invalid");
    }
};

    const showModal = () => {
        setIsModalOpen(true);
        };
        
        const handleCancel = () => {
            setIsModalOpen(false);
        };

    const dataSource = data?.results?.map((role) => ({
        id: role.id,
        name: role?.name ?? "",
        permissions: role?.permissions,
        full_permissions: role?.full_permissions.map(permission => permission.name).join(", "),
    })) || [];

    const columns: ColumnsType<GroupRoles> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Role Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name), 
        },
        {
            title: 'Permissions',
            dataIndex: 'full_permissions',
            key: 'full_permissions',
            width: 800,
            render: (permissions, record) => {
                const isExpanded = expandedRowKeys.includes(record.id);
                const permissionList = permissions.split(",");

                return (
                    <div>
                        {isExpanded ? (
                            <>
                                {permissionList.join(", ")}
                                <span
                                    style={{ color: 'blue', cursor: 'pointer' }}
                                    onClick={() => togglePermissions(record.id)}
                                >
                                    {" "}See Less
                                </span>
                            </>
                        ) : (
                            <>
                                {permissionList.slice(0, 3).join(", ")} 
                                {permissionList.length > 3 && (
                                    <span
                                        style={{ color: 'blue', cursor: 'pointer' }}
                                        onClick={() => togglePermissions(record.id)}
                                    >
                                        {" "}See More
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_: any, record: GroupRoles) => (
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

    const fetchAllGroupRole = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/groups/?limit=1000`, {
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
        const PreparedBy = `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`;

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;
        const maxRowsPerPage = 16; 
        let startY = headerHeight;

        let allData;
        if (searchText.trim() === '') {
            allData = await fetchAllGroupRole();
        } else {
            allData = await fetchGroupRole(searchText.trim());
        }
        
        const allResults = allData?.results || [];
        const printSource = allResults.map((role, index) => ({
            key: index + 1,
            id: role?.id,
            name: role?.name,
            full_permissions: role?.full_permissions.map(permission => permission.name).join(", "),
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
            doc.text("Group Roles Report", 10, 15); 
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
            item.name || '',
        ]);

        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);
    
            autoTable(doc, { 
                head: [['No.', 'Group Roles',]],
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
        setIsLoading(false);
    }
};

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl(null); 
    };

    const handleExportExcel = async () => {
        let allData;
        if (searchText.trim() === '') {
            allData = await fetchAllGroupRole();
        } else {
            allData = await fetchGroupRole(searchText.trim());
        }
        
        const allResults = allData?.results || [];
        const printSource = allResults.map((role, index) => ({
            key: index + 1,
            id: role?.id,
            name: role?.name,
            full_permissions: role?.full_permissions.map(permission => permission.name).join(", "),
        }));

        const exportData = printSource.map((role, index) => {
            return {
                "No.": index + 1,
                "Group Role": role?.name,
                "Permissions": role?.full_permissions
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "GroupRole");
        XLSX.writeFile(wb, "GroupRole.xlsx");
    };

        const handleExportCSV = async () => {
        try {
            let allData;
        if (searchText.trim() === '') {
            allData = await fetchAllGroupRole();
        } else {
            allData = await fetchGroupRole(searchText.trim());
        }
        
        const allResults = allData?.results || [];
        const printSource = allResults.map((role, index) => ({
            key: index + 1,
            id: role?.id,
            name: role?.name,
            permission: role?.permissions,
            full_permissions: role?.full_permissions.map(permission => permission.name).join(", "),
        }));

        const exportData = printSource.map((role, index) => {
            return {
                "No.": index + 1,
                "Group Role": role?.name,
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
            link.setAttribute("download", "GroupRole.csv");
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

    const mapGroupRole = (role, index) => ({
            key: index + 1,
            id: role?.id,
            name: role?.name,
            permissions: role?.permissions,
            full_permissions: role?.full_permissions.map(permission => permission.name).join(", "),
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ["permissions"],
                queryFn: () => getPermission(token ?? ""),
            },
        ],
    });

    const PermissionData = results[0].data;

    // const onPermissionChange = (value: number) => {
    //     console.log(value)
    //     setRoles(prevForm => ({
    //         ...prevForm,
    //         permissions: value,
    //     }));
    // }; 
const onPermissionChange = (values: (string | number)[]) => {
  const allPermissionIds = PermissionData?.results?.map(permission => permission.id) || [];

  if (values.includes('all')) {
    form.setFieldValue('permissions', allPermissionIds);
    setRoles(prev => ({ ...prev, permissions: allPermissionIds }));
  } else if (values.includes('none')) {
    form.setFieldValue('permissions', []);
    setRoles(prev => ({ ...prev, permissions: [] }));
  } else {
    const filtered = values.filter(val => val !== 'all' && val !== 'none');
    form.setFieldValue('permissions', filtered);
    setRoles(prev => ({ ...prev, permissions: filtered }));
  }
};


    return (
        <div>
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Roles</h1>
            <div className="my-4 flex justify-between gap-2">
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
                        Add Roles
                    </button>
                    </div>
                    
                </div>
        <Table
            className="overflow-x-auto"
            loading={isFetching || searchLoading}
            columns={columns}
                dataSource={debouncedSearch
                        ? (searchData?.results || []).map(mapGroupRole)
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
                title="Groups Roles Report"
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
                title="Add Group Roles"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                >
                <AddRoles onClose={handleCancel} />
            </Modal>
            <Modal
                title="Edit Group Role"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width="60%"
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                        label="Group Role"
                        name="name"
                    >
                        <Input />
                    </Form.Item>
                    <h1>Permissions:</h1>
                    <Form.Item
                    name="permissions"
                    className="h-96 overflow-scroll"
                    >
                    <Select
                        className="py-4 w-full"
                        showSearch
                        mode="multiple"
                        placeholder="Permissions"
                        optionFilterProp="label"
                        onChange={onPermissionChange}
                        value={(() => {
                        const formValue = form.getFieldValue('permissions') || [];
                        const allPermissionIds = PermissionData?.results?.map(p => p.id) || [];

                        if (
                            allPermissionIds.length > 0 &&
                            formValue.length === allPermissionIds.length &&
                            allPermissionIds.every(id => formValue.includes(id))
                        ) {
                            return ['all', ...formValue];
                        }

                        return formValue.filter(val => val !== 'all' && val !== 'none');
                        })()}
                    >
                        <Select.Option key="all" value="all">
                            Select All
                        </Select.Option>
                        <Select.Option key="none" value="none">
                            Unselect All
                        </Select.Option>
                        {PermissionData?.results?.map(permission => (
                        <Select.Option key={permission.id} value={permission.id}>
                            {permission.name}
                        </Select.Option>
                        ))}
                    </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Roles
