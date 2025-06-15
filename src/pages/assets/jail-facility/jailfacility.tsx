import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJail, deleteJail, getUser, updateJail, getJail_Type, getJail_Category, getJail_Province, getJail_Municipality, getJailRegion, getJail_Barangay, getJail_Security_Level } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select, Table } from "antd";
import { useState } from "react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import AddJailFacility from "./AddJailFacility";
import EditJail from "./EditJail";
import bjmp from '../../../assets/Logo/QCJMD.png'
import { useLocation } from "react-router-dom";

type Jail = {
    key: number;
    id: number;
    jail_name: string;
    jail_type: string;
    jail_category: string;
    email_address: string;
    contact_number: string;
    jail_province: string;
    jail_city_municipality: string;
    jail_barangay: string;
    jail_region: string;
    jail_postal_code: string;
    jail_street: string;
    security_level: string;
    jail_description: string;
    jail_capacity: number;
    jail_type_id: number | null;
    jail_category_id: number | null;
    jail_province_id: number| null;
    jail_city_municipality_id: number | null;
    jail_region_id: number| null;
    jail_barangay_id: number| null;
};

const jailfacility = () => {
    const [searchText, setSearchText] = useState("");
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const [selectjail, setSelectJail] = useState<Jail | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const jailNameParam = searchParams.get("jail_name");

    const { data } = useQuery({
        queryKey: ["jail"],
        queryFn: () => getJail(token ?? ""),
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteJail(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jail"] });
            messageApi.success("Jail Facility deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Jail Facility");
        },
    });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["jail"] });
    };

    const { mutate: editJail, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: Jail) =>
            updateJail(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jail"] });
            messageApi.success("Jail Facility updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Jail Facility");
        },
    });

    const handleEdit = (record: Jail) => {
        setSelectJail(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (selectjail && selectjail.id) {
            const updatedJail: Jail = {
                ...selectjail,
                ...values,
            };
            editJail(updatedJail);
        } else {
            messageApi.error("Selected Jail Facility is invalid");
        }
    };
    const dataSource = data?.results?.map((jail: Jail) => ({
        key: jail?.id,
        id: jail?.id,
        jail_name: jail?.jail_name ?? "",
        jail_type: jail?.jail_type ?? "",
        jail_category: jail?.jail_category ?? "",
        email_address: jail?.email_address ?? "",
        contact_number: jail?.contact_number ?? "",
        jail_province: jail?.jail_province ?? "",
        jail_city_municipality: jail?.jail_city_municipality ?? "",
        jail_barangay: jail?.jail_barangay ?? "",
        jail_region: jail?.jail_region ?? "",
        jail_postal_code: jail?.jail_postal_code ?? "",
        jail_street: jail?.jail_street ?? "",
        security_level: jail?.security_level ?? "",
        jail_description: jail?.jail_description ?? "",
        jail_capacity: jail?.jail_capacity ?? "",
        organization: jail?.organization ?? 'Bureau of Jail Management and Penology',
        updated_by: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

const filteredData = dataSource?.filter((jail: any) => {
    const matchesSearch = Object.values(jail).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
    );

    const matchesJailNameParam = jailNameParam
        ? jail.jail_name.toLowerCase() === jailNameParam.toLowerCase()
        : true;

    return matchesSearch && matchesJailNameParam;
});


    const columns = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) =>
                (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Jail Name",
            dataIndex: "jail_name",
            key: "jail_name",
            sorter: (a, b) => a.jail_name.localeCompare(b.jail_name),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_name))
            //     ).map(jail_name => ({
            //         text: jail_name,
            //         value: jail_name,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_name === value,
        },
        {
            title: "Jail Type",
            dataIndex: "jail_type",
            key: "jail_type",
            sorter: (a, b) => a.jail_type.localeCompare(b.jail_type),
        },
        {
            title: "Jail Category",
            dataIndex: "jail_category",
            key: "jail_category",
            sorter: (a, b) => a.jail_category.localeCompare(b.jail_category),
        },
        {
            title: "Email Address",
            dataIndex: "email_address",
            key: "email_address",
            sorter: (a, b) => a.email_address.localeCompare(b.email_address),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.email_address))
            //     ).map(email_address => ({
            //         text: email_address,
            //         value: email_address,
            //     }))
            // ],
            // onFilter: (value, record) => record.email_address === value,
        },
        {
            title: "Contact Number",
            dataIndex: "contact_number",
            key: "contact_number",
            sorter: (a, b) => a.contact_number.localeCompare(b.contact_number),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.contact_number))
            //     ).map(contact_number => ({
            //         text: contact_number,
            //         value: contact_number,
            //     }))
            // ],
            // onFilter: (value, record) => record.contact_number === value,
        },
        {
            title: "Province",
            dataIndex: "jail_province",
            key: "jail_province",
            sorter: (a, b) => a.jail_province.localeCompare(b.jail_province),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_province))
            //     ).map(jail_province => ({
            //         text: jail_province,
            //         value: jail_province,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_province === value,
        },
        {
            title: "City/Municipality",
            dataIndex: "jail_city_municipality",
            key: "jail_city_municipality",
            sorter: (a, b) => a.jail_city_municipality.localeCompare(b.jail_city_municipality),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_city_municipality))
            //     ).map(jail_city_municipality => ({
            //         text: jail_city_municipality,
            //         value: jail_city_municipality,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_city_municipality === value,
        },
        {
            title: "Barangay",
            dataIndex: "jail_barangay",
            key: "jail_barangay",
            sorter: (a, b) => a.jail_barangay.localeCompare(b.jail_barangay),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_barangay))
            //     ).map(jail_barangay => ({
            //         text: jail_barangay,
            //         value: jail_barangay,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_barangay === value,
        },
        {
            title: "Region",
            dataIndex: "jail_region",
            key: "jail_region",
            sorter: (a, b) => a.jail_region.localeCompare(b.jail_region),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_region))
            //     ).map(jail_region => ({
            //         text: jail_region,
            //         value: jail_region,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_region === value,
        },
        {
            title: "Postal Code",
            dataIndex: "jail_postal_code",
            key: "jail_postal_code",
            sorter: (a, b) => a.jail_postal_code.localeCompare(b.jail_postal_code),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_postal_code))
            //     ).map(jail_postal_code => ({
            //         text: jail_postal_code,
            //         value: jail_postal_code,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_postal_code === value,
        },
        {
            title: "Street",
            dataIndex: "jail_street",
            key: "jail_street",
            sorter: (a, b) => a.jail_street.localeCompare(b.jail_street),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_street))
            //     ).map(jail_street => ({
            //         text: jail_street,
            //         value: jail_street,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_street === value,
        },
        {
            title: "Security Level",
            dataIndex: "security_level",
            key: "security_level",
            sorter: (a, b) => a.security_level.localeCompare(b.security_level),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.security_level))
            //     ).map(security_level => ({
            //         text: security_level,
            //         value: security_level,
            //     }))
            // ],
            // onFilter: (value, record) => record.security_level === value,
        },
        {
            title: "Jail Capacity",
            dataIndex: "jail_capacity",
            key: "jail_capacity",
            sorter: (a, b) => a.jail_capacity.localeCompare(b.jail_capacity),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_capacity))
            //     ).map(jail_capacity => ({
            //         text: jail_capacity,
            //         value: jail_capacity,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_capacity === value,
        },
        {
            title: "Description",
            dataIndex: "jail_description",
            key: "jail_description",
            sorter: (a, b) => a.jail_description.localeCompare(b.jail_description),
            // filters: [
            //     ...Array.from(
            //         new Set(filteredData.map(item => item.jail_description))
            //     ).map(jail_description => ({
            //         text: jail_description,
            //         value: jail_description,
            //     }))
            // ],
            // onFilter: (value, record) => record.jail_description === value,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: 'right',
            render: (_: any, record: Jail) => (
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
        XLSX.utils.book_append_sheet(wb, ws, "JailFacility");
        XLSX.writeFile(wb, "JailFacility.xlsx");
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
            doc.text("Employment Type Report", 10, 15); 
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
            item.jail_name,
            item.email_address,
            item.contact_number,
        ]);
    
        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);
    
            autoTable(doc, { 
                head: [['No.', 'Jail', 'Email', 'Contact No.']],
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
                <CSVLink data={dataSource} filename="JailFacility.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );

    const results = useQueries({
        queries: [
            {
                queryKey: ['jail-type'],
                queryFn: () => getJail_Type(token ?? "")
            },
            {
                queryKey: ['jail-category'],
                queryFn: () => getJail_Category(token ?? "")
            },
            {
                queryKey: ['jail-province'],
                queryFn: () => getJail_Province(token ?? "")
            },
            {
                queryKey: ['city-municipality'],
                queryFn: () => getJail_Municipality(token ?? "")
            },
            {
                queryKey: ['jail-region'],
                queryFn: () => getJailRegion(token ?? "")
            },
            {
                queryKey: ['jail-barangay'],
                queryFn: () => getJail_Barangay(token ?? "")
            },
            {
                queryKey: ['security-level'],
                queryFn: () => getJail_Security_Level(token ?? "")
            },
        ]
    });

    const jailTypeData = results[0].data;
    const jailCategoryData = results[1].data;
    const jailProvinceData = results[2].data;
    const jailMunicipalityData = results[3].data;
    const jailRegionData = results[4].data;
    const jailBarangayData = results[5].data;
    const securityLevelData = results[6].data;

const onJailTypeChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_type_id: value
        }));
    };

    const onJailCategoryChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_category_id: value
        }));
    };

    const onRegionChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_region_id: value,
            jail_province_id: null,
            jail_city_municipality_id: null,
            jail_barangay_id: null,
        }));
        form.setFieldValue("jail_region_id", value);
    };
    
    const onJailProvinceChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_province_id: value,
            jail_city_municipality_id: null,
            jail_barangay_id: null,
        }));
        form.setFieldValue("jail_province_id", value);
    };
    
    const onMunicipalityChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_city_municipality_id: value,
            jail_barangay_id: null,
        }));
        form.setFieldValue("jail_city_municipality_id", value);
    };
    
    const onJailBarangayChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_barangay_id: value,
        }));
        form.setFieldValue("jail_barangay_id", value);
    };    

    const onSecurityLevelChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            security_level_id: value,
        }));
    };  
    return (
        <div>
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Jail Facility</h1>
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
                        Add Jail Facility
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
            <Modal
                title="Jail Facility Report"
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
                onCancel={handleCloseAddModal}
                footer={null}
                width="60%"
            >
                <AddJailFacility onClose={handleCloseAddModal} />
            </Modal>
            <Modal
                    title="Edit Jail Facility"
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    onOk={() => form.submit()}
                    confirmLoading={isUpdating}
                    width="60%"
                >
            <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-3">
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Name:</span>}
                        name="jail_name"
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item name="jail_type" label={<span className="font-semibold text-[#333] text-[16px]">Jail Type:</span>} rules={[{ required: true, message: 'Please select a jail type' }]}>
                        <Select className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Type"
                            optionFilterProp="label"
                            onChange={onJailTypeChange}
                            options={jailTypeData?.results?.map(jail_type => (
                                {
                                    value: jail_type.id,
                                    label: jail_type?.type_name,
                                }
                            ))}
                        />
                    </Form.Item>
                    <Form.Item
                    name="jail_category"
                    label={<span className="font-semibold text-[#333] text-[16px]">Jail Category:</span>}
                    rules={[{ required: true, message: 'Please select a jail type' }]}
                    >
                        <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Jail Category"
                        optionFilterProp="label"
                        onChange={onJailCategoryChange}
                        options={jailCategoryData?.results?.map(jail_category => (
                            {
                                value: jail_category.id,
                                label: jail_category?.category_name,
                            }
                        ))}
                    />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Email Address:</span>}
                        name="email_address"
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Contact Number:</span>}
                        name="contact_number"
                    >
                        <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Capacity:</span>}
                        name="jail_capacity"
                    >
                        <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item 
                    name="security_level"
                    label={<span className="font-semibold text-[#333] text-[16px]">Security Level:</span>}
                    rules={[{ required: true, message: 'Please select a jail type' }]}>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Security Level"
                            optionFilterProp="label"
                            onChange={onSecurityLevelChange}
                            options={securityLevelData?.results?.map(security_level => (
                                {
                                    value: security_level.id,
                                    label: security_level?.category_name,
                                }
                            ))}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Description:</span>}
                        name="jail_description"
                    >
                        <Input type="text" className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                </div>
                <h2 className="text-xl font-bold text-[#32507D]">Address</h2>
                <div className="border-2 p-4 border-gray-200 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Form.Item name="jail_region" label={<span className="font-semibold text-[#333] text-[16px]">Region:</span>}>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Region"
                            onChange={onRegionChange}
                            options={jailRegionData?.results?.map(region => ({
                                value: region.id,
                                label: region?.desc,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="jail_province" label={<span className="font-semibold text-[#333] text-[16px]">Province:</span>}>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Province"
                            onChange={onJailProvinceChange}
                            disabled={!selectjail?.jail_region_id}
                            options={jailProvinceData?.results
                                ?.filter(province => province.region === selectjail?.jail_region_id)
                                .map(province => ({
                                    value: province.id,
                                    label: province?.desc,
                                }))
                            }
                        />
                    </Form.Item>

                    <Form.Item name="jail_city_municipality" label={<span className="font-semibold text-[#333] text-[16px]">City/Municipality:</span>}>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Municipality"
                            onChange={onMunicipalityChange}
                            disabled={!selectjail?.jail_province_id}
                            options={jailMunicipalityData?.results
                                ?.filter(municipality => municipality.province === selectjail?.jail_province_id)
                                .map(municipality => ({
                                    value: municipality.id,
                                    label: municipality?.desc,
                                }))
                            }
                        />
                    </Form.Item>

                    <Form.Item name="jail_barangay" label={<span className="font-semibold text-[#333] text-[16px]">Barangay:</span>}>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Barangay"
                            onChange={onJailBarangayChange}
                            disabled={!selectjail?.jail_city_municipality_id}
                            options={jailBarangayData?.results
                                ?.filter(barangay => barangay.municipality === selectjail?.jail_city_municipality_id)
                                .map(barangay => ({
                                    value: barangay.id,
                                    label: barangay?.desc,
                                }))
                            }
                        />
                    </Form.Item>
                        <Form.Item
                            label={<span className="font-semibold text-[#333] text-[16px]">Postal Code:</span>}
                            name="jail_postal_code"
                        >
                            <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2"/>
                        </Form.Item>
                </div>
            </Form>
                </Modal>
            {/* <Modal
                open={isEditModalOpen}
                onCancel={handleCloseEditModal}
                footer={null}
                width="60%"
            >
                <EditJail
                    jail={selectjail}
                    onClose={handleCloseEditModal}
                />
            </Modal> */}
        </div>
    )
}

export default jailfacility
