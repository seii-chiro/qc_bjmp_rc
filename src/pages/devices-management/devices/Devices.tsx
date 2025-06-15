import { getDevice, deleteDevice, getUser, updateDevice, getDevice_Types, getJail } from "@/lib/queries"
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Button, Dropdown, Form, Input, Menu, message, Modal, Select, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import AddDevices from "./AddDevices";
import EditDevices from "./EditDevices";
import { LuSearch } from "react-icons/lu";
import bjmp from '../../../assets/Logo/QCJMD.png'

type Device = {
    key: number;
    id: number;
    device_type: string;
    jail: string;
    area: string;
    device_name: string;
    description: string;
    serial_no: string;
    manufacturer: string;
    supplier: string;
};

const Device = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [devices, setDevices] = useState<Device | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data } = useQuery({
        queryKey: ["devices"],
        queryFn: () => getDevice(token ?? ""),
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteDevice(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["devices"] });
            messageApi.success("Devices deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Devices");
        },
    });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const { mutate: editDevice, isLoading: isUpdating } = useMutation({
        mutationFn: (updated: Device) =>
            updateDevice(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["devices"] });
            messageApi.success("Devices updated successfully");
            setIsEditModalOpen(false);
        },
        onError: () => {
            messageApi.error("Failed to update Devices");
        },
    });

    const handleEdit = (record: Device) => {
        setDevices(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (values: any) => {
        if (devices && devices.id) {
            const updatedDevice: Device = {
                ...devices,
                ...values,
            };
            editDevice(updatedDevice);
        } else {
            messageApi.error("Selected Devices is invalid");
        }
    };

    const dataSource = data?.results?.map((devices, index) => ({
        key: devices?.id,
        id: devices?.id,
        device_type: devices?.device_type ?? "N/A",
        jail: devices?.jail ?? "N/A",
        area: devices?.area ?? "N/A",
        device_name: devices?.device_name ?? "N/A",
        description: devices?.description ?? "N/A",
        serial_no: devices?.serial_no ?? "N/A",
        manufacturer: devices?.manufacturer ?? "N/A",
        supplier: devices?.supplier ?? "N/A",
        date_acquired: devices?.date_acquired ?? "N/A",
        organization: devices?.organization ?? 'Bureau of Jail Management and Penology',
        updated: `${UserData?.first_name ?? ''} ${UserData?.last_name ?? ''}`,
    })) || [];

    const filteredData = dataSource?.filter((devices) =>
        Object.values(devices).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<Device> = [
        {
            title: 'No.',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Device Type',
            dataIndex: 'device_type',
            key: 'device_type',
            sorter: (a, b) => a.device_type.localeCompare(b.device_type),
        },

        {
            title: 'Device Name',
            dataIndex: 'device_name',
            key: 'device_name',
            sorter: (a, b) => a.device_name.localeCompare(b.device_name),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
        },
        {
            title: 'Jail',
            dataIndex: 'jail',
            key: 'jail',
            sorter: (a, b) => a.jail.localeCompare(b.jail),
        },
        // {
        //     title: 'Jail Area',
        //     dataIndex: 'area',
        //     key: 'area',
        //     sorter: (a, b) => a.area.localeCompare(b.area),
        // },
        {
            title: 'Serial No.',
            dataIndex: 'serial_no',
            key: 'serial_no',
            sorter: (a, b) => a.serial_no.localeCompare(b.serial_no),
        },
        {
            title: 'Manufacturer',
            dataIndex: 'manufacturer',
            key: 'manufacturer',
            sorter: (a, b) => a.manufacturer.localeCompare(b.manufacturer),
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            key: 'supplier',
            sorter: (a, b) => a.supplier.localeCompare(b.supplier),
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            fixed: 'right',
            render: (_: any, record: Device) => (
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
        XLSX.utils.book_append_sheet(wb, ws, "Devices");
        XLSX.writeFile(wb, "Devices.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const headerHeight = 48;
        const footerHeight = 32;
        const organizationName = dataSource[0]?.organization || "";
        const PreparedBy = dataSource[0]?.updated || '';

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;

        const maxRowsPerPage = 18;

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
            doc.text("Devices Report", 10, 15);
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
            item.serial_no,
            item.device_name,
            item.device_type,
            item.manufacturer,
            item.supplier
        ]);

        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);

            autoTable(doc, {
                head: [['No.', 'Serial No.', 'Devices', 'Device Type', 'Manufacturer', 'Supplier']],
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
                <CSVLink data={dataSource} filename="Devices.csv">
                    Export CSV
                </CSVLink>
            </Menu.Item>
        </Menu>
    );

    const results = useQueries({
        queries: [
            {
                queryKey: ['device-type'],
                queryFn: () => getDevice_Types(token ?? "")
            },
            {
                queryKey: ['jail'],
                queryFn: () => getJail(token ?? "")
            },
        ]
    });

    const deviceTypeData = results[0].data;
    const jailData = results[1].data;


    const onDeviceTypeChange = (value: number) => {
        form.setFieldsValue({ device_type_id: value });
    };

    const onJailChange = (value: number) => {
        form.setFieldsValue({ jail_id: value });
    };

    return (
        <div>
            {contextHolder}
            <h1 className="text-3xl font-bold text-[#1E365D]">Devices</h1>
            <div className="my-4 flex justify-between gap-2">
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
                        Add Devices
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
                title="Devices Report"
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
                width="40%"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
                <AddDevices onClose={handleCancel} />
            </Modal>
            <Modal
                title="Devices"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                    label="Device Type"
                    name="device_type"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Device Type"
                        optionFilterProp="label"
                        onChange={onDeviceTypeChange}
                        options={deviceTypeData?.results?.map(devicetype => ({
                            value: devicetype.id,
                            label: devicetype.device_type
                        }))}/>
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
                        options={jailData?.results?.map(jail => ({
                            value: jail.id,
                            label: jail.jail_name
                        }))}/>
                </Form.Item>
                <Form.Item
                    label="Device Name"
                    name="device_name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Serial Number"
                    name="serial_no"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Date Acquired"
                    name="date_acquired"
                >
                    <Input type="date" />
                </Form.Item>
                <Form.Item
                    label="Manufacturer"
                    name="manufacturer"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Supplier"
                    name="supplier"
                >
                    <Input />
                </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Device
