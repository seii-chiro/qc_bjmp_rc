import { GroupAffiliationResponse } from "@/lib/issues-difinitions";
import { getOrganization, getUser } from "@/lib/queries";
import {
  deleteGroupAffiliation,
  getGroupAffiliation,
  patchGroupAffiliation,
} from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Form, Input, Menu, message, Modal } from "antd";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import bjmp from "../../../assets/Logo/QCJMD.png";
import AddGroupAffiliation from "./AddGroupAffiliation";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const GroupAffiliation = () => {
  const [searchText, setSearchText] = useState("");
  const token = useTokenStore().token;
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [groupAffiliation, setGroupAffiliation] =
    useState<GroupAffiliationResponse | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const { data } = useQuery({
    queryKey: ["group-affiliation"],
    queryFn: () => getGroupAffiliation(token ?? ""),
  });

  const { data: UserData } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(token ?? ""),
  });

  const { data: OrganizationData } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganization(token ?? ""),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGroupAffiliation(token ?? "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-affiliation"] });
      messageApi.success("Group Affiliation deleted successfully");
    },
    onError: (error: any) => {
      messageApi.error(error.message || "Failed to delete Group Affiliation");
    },
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showDeleteConfirm = (id: number) => {
    Modal.confirm({
      centered: true,
      title: "Are you sure you want to delete this Group Affiliation?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteMutation.mutate(id);
      },
    });
  };

  const { mutate: editGangAffiliation, isLoading: isUpdating } = useMutation({
    mutationFn: (updated: GroupAffiliationResponse) =>
      patchGroupAffiliation(token ?? "", updated.id, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-affiliation"] });
      messageApi.success("Group Affiliation updated successfully");
      setIsEditModalOpen(false);
    },
    onError: () => {
      messageApi.error("Failed to update Group Affiliation");
    },
  });

  const handleEdit = (record: GroupAffiliationResponse) => {
    setGroupAffiliation(record);
    form.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (values: any) => {
    if (groupAffiliation && groupAffiliation.id) {
      const updatedGangAffiliation: GroupAffiliationResponse = {
        ...groupAffiliation,
        ...values,
      };
      editGangAffiliation(updatedGangAffiliation);
    } else {
      messageApi.error("Selected Group Affiliation is invalid");
    }
  };

  const dataSource =
    data?.results?.map(
      (
        group_affiliation: {
          id: any;
          name: any;
          description: any;
          organization: any;
        },
        index: number
      ) => ({
        key: index + 1,
        id: group_affiliation?.id,
        name: group_affiliation?.name ?? "N/A",
        description: group_affiliation?.description ?? "N/A",
        organization:
          group_affiliation?.organization ??
          "Bureau of Jail Management and Penology",
      })
    ) || [];

  const filteredData = dataSource?.filter(
    (group_affiliation: { [s: string]: unknown } | ArrayLike<unknown>) =>
      Object.values(group_affiliation).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
  );

  const columns: ColumnsType<GroupAffiliationResponse> = [
    {
      title: "No.",
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Group Affiliation",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_: any, record: GroupAffiliationResponse) => (
        <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
          <Button type="link" onClick={() => handleEdit(record)}>
            <AiOutlineEdit />
          </Button>
          <Button
            type="link"
            danger
            onClick={() => showDeleteConfirm(record.id)}
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
    XLSX.utils.book_append_sheet(wb, ws, "GroupAffiliation");
    XLSX.writeFile(wb, "GroupAffiliation.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headerHeight = 48;
    const footerHeight = 32;
    const organizationName = OrganizationData?.results?.[0]?.org_name || "";
    const PreparedBy = `${UserData?.first_name ?? ""} ${
      UserData?.last_name ?? ""
    }`;

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
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

      doc.addImage(bjmp, "PNG", imageX, imageY, imageWidth, imageHeight);

      doc.setTextColor(0, 102, 204);
      doc.setFontSize(16);
      doc.text("Group Affiliation Report", 10, 15);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Organization Name: ${organizationName}`, 10, 25);
      doc.text("Report Date: " + formattedDate, 10, 30);
      doc.text("Prepared By: " + PreparedBy, 10, 35);
      doc.text("Department/ Unit: IT", 10, 40);
      doc.text("Report Reference No.: " + reportReferenceNo, 10, 45);
    };

    addHeader();

    const tableData = dataSource.map((item) => [
      item.key,
      item.platform_name,
      item.description,
    ]);

    for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
      const pageData = tableData.slice(i, i + maxRowsPerPage);

      autoTable(doc, {
        head: [["No.", "Group Affiliation", "Description"]],
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
        `Timestamp of Last Update: ${formattedDate}`,
      ].join("\n");
      const footerX = 10;
      const footerY = doc.internal.pageSize.height - footerHeight + 15;
      const pageX =
        doc.internal.pageSize.width -
        doc.getTextWidth(`${page} / ${pageCount}`) -
        10;
      doc.setFontSize(8);
      doc.text(footerText, footerX, footerY);
      doc.text(`${page} / ${pageCount}`, pageX, footerY);
    }

    const pdfOutput = doc.output("datauristring");
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
        <CSVLink data={dataSource} filename="GroupAffiliation.csv">
          Export CSV
        </CSVLink>
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      {contextHolder}
      <h1 className="text-3xl font-bold text-[#1E365D]">Group Affiliation</h1>
      <div className="w-full bg-white">
        <div className="my-4 flex justify-between gap-2">
          <div className="flex gap-2">
            <Dropdown
              className="bg-[#1E365D] py-2 px-5 rounded-md text-white"
              overlay={menu}
            >
              <a
                className="ant-dropdown-link gap-2 flex items-center "
                onClick={(e) => e.preventDefault()}
              >
                <GoDownload /> Export
              </a>
            </Dropdown>
            <button
              className="bg-[#1E365D] py-2 px-5 rounded-md text-white"
              onClick={handleExportPDF}
            >
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
              Add Group Affiliation
            </button>
          </div>
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
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      </div>
      <Modal
        title="Group Affiliation Report"
        open={isPdfModalOpen}
        onCancel={handleClosePdfModal}
        footer={null}
        width="80%"
      >
        {pdfDataUrl && (
          <iframe
            src={pdfDataUrl}
            title="PDF Preview"
            style={{ width: "100%", height: "80vh", border: "none" }}
          />
        )}
      </Modal>
      <Modal
        title="Edit Group Affiliation"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isUpdating}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="name"
            label="Group Affiliation Name"
            rules={[
              {
                required: true,
                message: "Please input the Group Affiliation name",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input a description" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        className="overflow-y-auto rounded-lg scrollbar-hide"
        title="Add Group Affiliation"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="20%"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <AddGroupAffiliation onClose={handleCancel} />
      </Modal>
    </div>
  );
};

export default GroupAffiliation;
