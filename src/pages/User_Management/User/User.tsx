import { getOrganization, getUser, PaginatedResponse } from "@/lib/queries";
import { deleteUsers, getGroup_Role, patchUsers } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select } from "antd";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import bjmp from '../../../assets/Logo/QCJMD.png'
import AddUser from "./AddUser";
import { BASE_URL } from "@/lib/urls";

type UsersProps = {
    id: number,
    password: string,
    email: string,
    first_name: string,
    last_name: string,
    groups: string[];
}

const Users = () => {
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
    const [selectedUser, setSelectedUser] = useState<UsersProps | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    const fetchUsers = async (search: string) => {
        const res = await fetch(`${BASE_URL}/api/user/users/?search=${search}`, {
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
        queryKey: ["users", debouncedSearch],
        queryFn: () => fetchUsers(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });

    const { data, isFetching } = useQuery({
        queryKey: [
            "users",
            "users-table",
            page,
            limit,
        ],
        queryFn: async (): Promise<PaginatedResponse<UsersProps>> => {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();

            params.append("page", String(page));
            params.append("limit", String(limit));
            params.append("offset", String(offset));

            const res = await fetch(`${BASE_URL}/api/user/users/?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Failed to fetch Users data.");
            }

            return res.json();
        },
        enabled: !!token,
        keepPreviousData: true,
    });

    const { data: OrganizationData } = useQuery({
        queryKey: ['organization'],
        queryFn: () => getOrganization(token ?? "")
    })

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteUsers(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            messageApi.success("User deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete User");
        },
    });

  const { mutate: editUser, isLoading: isUpdating } = useMutation({
      mutationFn: (updated: UsersProps) =>
        patchUsers(token ?? "", updated.id, updated),
      
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          messageApi.success("User updated successfully");
          setIsEditModalOpen(false);
      },
      onError: () => {
          messageApi.error("Failed to update User");
      },
  });

    const handleEdit = (record: UsersProps) => {
        setSelectedUser(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (selectedUser && selectedUser.id) {
            const updatedUser: UsersProps = {
                ...selectedUser,
                ...values,
                groups: selectedUser.groups,
            };
            editUser(updatedUser);
        } else {
            messageApi.error("Selected User is invalid");
        }
    };

    const dataSource = data?.results?.map((user, index) => ({
        key: index + 1,
        id: user?.id,
        email: user?.email ?? "",
        first_name: user?.first_name ?? "",
        last_name: user?.last_name ?? "",
        groups: user?.groups,
    }))

    const columns: ColumnsType<UsersProps> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
            width: 100,
            },
            {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            defaultSortOrder: 'descend',
            sortDirections: ['descend', 'ascend'],
            },
            {
            title: 'First Name',
            dataIndex: 'first_name',
            key: 'first_name',
            sorter: (a, b) => a.first_name.localeCompare(b.first_name),
            defaultSortOrder: 'descend', // 👈 Descending by default
            sortDirections: ['descend', 'ascend'],
            width: 200,
            },
        {
        title: 'Last Name',
        dataIndex: 'last_name',
        key: 'last_name',
        sorter: (a, b) => a.last_name.localeCompare(b.last_name),
        width: 200
        },
        {
        title: "Groups",
        dataIndex: "groups",
        key: "groups",
        render: (groups: string[]) => groups?.join(", "),
        width: 800,
        sorter: (a, b) => {
            const aText = a.groups?.join(', ') || '';
            const bText = b.groups?.join(', ') || '';
            return aText.localeCompare(bText);
        },
        defaultSortOrder: 'descend', // 👈 optional: newest group values at top
        sortDirections: ['descend', 'ascend'],
        },
        {
        title: "Action",
        key: "action",
        fixed: 'right',
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
    ];

    const fetchAllUsers = async () => {
        const res = await fetch(`${BASE_URL}/api/user/users/?limit=10000`, {
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
            const PreparedBy = `${UserData?.first_name || ''} ${UserData?.last_name || ''}`;
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const reportReferenceNo = `TAL-${formattedDate}-XXX`;
            const maxRowsPerPage = 16; 
            let startY = headerHeight;

            let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllUsers();
            } else {
                allData = await fetchUsers(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((user, index) => ({
                key: index + 1,
                id: user?.id,
                email: user?.email ?? "N/A",
                first_name: user?.first_name ?? "N/A",
                last_name: user?.last_name ?? "N/A",
                groups: user?.groups,
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
                doc.text("Users Report", 10, 15); 
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
                item.email || '',
                item.first_name || '',
                item.last_name || '',
            ]);

            for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
                const pageData = tableData.slice(i, i + maxRowsPerPage);
        
                autoTable(doc, { 
                    head: [['No.', 'Email', 'First Name', 'Last Name']],
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
                allData = await fetchAllUsers();
            } else {
                allData = await fetchUsers(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((user, index) => ({
                key: index + 1,
                id: user?.id,
                email: user?.email ?? "N/A",
                first_name: user?.first_name ?? "N/A",
                last_name: user?.last_name ?? "N/A",
                groups: user?.groups,
            }));

        const exportData = printSource.map((user, index) => {
            return {
                "No.": index + 1,
                "Email": user?.email,
                "First Name": user?.first_name,
                "Last Name": user?.last_name,
                "Groups": user?.groups,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "Users.xlsx");
    };

        const handleExportCSV = async () => {
        try {
                let allData;
            if (searchText.trim() === '') {
                allData = await fetchAllUsers();
            } else {
                allData = await fetchUsers(searchText.trim());
            }
            
            const allResults = allData?.results || [];
            const printSource = allResults.map((user, index) => ({
                key: index + 1,
                id: user?.id,
                email: user?.email ?? "N/A",
                first_name: user?.first_name ?? "N/A",
                last_name: user?.last_name ?? "N/A",
                groups: user?.groups,
            }));

        const exportData = printSource.map((user, index) => {
            return {
                "No.": index + 1,
                "Email": user?.email,
                "First Name": user?.first_name,
                "Last Name": user?.last_name,
                "Groups": user?.groups,
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
            link.setAttribute("download", "Users.csv");
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
    const results = useQueries({
        queries: [
            {
                queryKey: ["roles"],
                queryFn: () => getGroup_Role(token ?? ""),
            },
        ],
    });

    const groupRoleData = results[0].data;

// const onGroupRoleChange = (values: string[]) => {
//     const allGroupNames = groupRoleData?.results?.map(group => group.name) || [];
    
//     if (values.includes('all')) {
//         form.setFieldValue('groups', allGroupNames);
//         setSelectedUser(prevUser => ({
//             ...prevUser,
//             groups: allGroupNames,
//         }));
//     } else {
//         const individualSelections = values.filter(val => val !== 'all');
//         form.setFieldValue('groups', individualSelections);
//         setSelectedUser(prevUser => ({
//             ...prevUser,
//             groups: individualSelections,
//         }));
//     }
// };

    const onGroupRoleChange = (values: string[]) => {
    const allGroupNames = groupRoleData?.results?.map(group => group.name) || [];

    if (values.includes('all')) {
        form.setFieldValue('groups', allGroupNames);
        setSelectedUser(prevUser => ({
        ...prevUser,
        groups: allGroupNames,
        }));
    } else if (values.includes('none')) {
        form.setFieldValue('groups', []);
        setSelectedUser(prevUser => ({
        ...prevUser,
        groups: [],
        }));
    } else {
        form.setFieldValue('groups', values);
        setSelectedUser(prevUser => ({
        ...prevUser,
        groups: values,
        }));
    }
    };


    const totalRecords = debouncedSearch 
    ? data?.count || 0
    : data?.count || 0;

    const mapUsers = (user, index) => ({
        key: index + 1,
        id: user?.id,
        email: user?.email ?? "N/A",
        first_name: user?.first_name ?? "N/A",
        last_name: user?.last_name ?? "N/A",
        groups: user?.groups,
    });

    return (
        <div>
        {contextHolder}
        <h1 className="text-2xl font-bold text-[#1E365D]">User</h1>
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
                onClick={showModal}
            >
                <GoPlus />
                Add User
            </button>
            </div>
        </div>
            <Table
            className="overflow-x-auto"
                loading={isFetching || searchLoading}
                columns={columns}
                    dataSource={debouncedSearch
                    ? (searchData?.results || []).map(mapUsers)
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
                    title="User Report"
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
                title="Edit User"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                        name="email"
                        label="Email"
                        id="email"
                        rules={[{ required: true, message: "Please input the User's Email" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        id="password"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="first_name"
                        label="First Name"
                        id="first_name"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="last_name"
                        label="Last Name"
                        id="last_name"
                    >
                        <Input />
                    </Form.Item>
                        <Form.Item
                        name="groups"
                        label="Groups"
                        >
                        <Select
                            className="py-4 w-full"
                            showSearch
                            mode="multiple"
                            placeholder="Groups"
                            optionFilterProp="label"
                            onChange={onGroupRoleChange}
                            value={(() => {
                            const formValue = form.getFieldValue('groups') || [];
                            const allGroupNames = groupRoleData?.results?.map(group => group.name) || [];

                            if (
                                allGroupNames.length > 0 &&
                                formValue.length === allGroupNames.length &&
                                allGroupNames.every(group => formValue.includes(group))
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
                            {groupRoleData?.results?.map(group => (
                            <Select.Option key={group.name} value={group.name}>
                                {group.name}
                            </Select.Option>
                            ))}
                        </Select>
                        </Form.Item>
                </Form>
                </Modal>
                    <Modal
                    className="overflow-y-auto rounded-lg scrollbar-hide"
                    title="Add User"
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null}
                    width="40%"
                    style={{ maxHeight: "80vh", overflowY: "auto" }} 
                    >
                    <AddUser onClose={handleCancel} />
                </Modal>
        </div>
    )
}

export default Users;