import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  message,
  Modal,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { GoDownload, GoPlus } from "react-icons/go";
import AddEthnicity from "./AddEthnicity";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useTokenStore } from "@/store/useTokenStore";
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteEthnicity,
  getJail_Province,
  getJailRegion,
  getOrganization,
  getUser,
  PaginatedResponse,
} from "@/lib/queries";
import { ColumnsType } from "antd/es/table";
import { LuSearch } from "react-icons/lu";
import { patchEthnicity } from "@/lib/query";
import moment from "moment";
import bjmp from "../../../assets/Logo/QCJMD.png";
import { BASE_URL } from "@/lib/urls";
import AddEditEthnicityProvince from "./AddEditEthnicityProvince";
import EditEthnicityProvince from "./EditEthnicityProvince";

type EthnicityProps = {
  id: number;
  updated_at: string;
  name: string;
  description: string;
  updated_by: string;
};

type EthinicityProvinceProps = {
  id: number;
  created_by: string;
  updated_by: string;
  ethnicity: string;
  region: string;
  province: string;
  record_status: string;
  created_at: string;
  updated_at: string;
  description: string;
};

const Ethnicity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editEthnicityProvinceModal, setEditEthnicityProvinceModal] = useState<{
    open: boolean;
    province: EthinicityProvinceProps | null;
  }>({ open: false, province: null });
  const token = useTokenStore().token;
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [editProvinces, setEditProvinces] = useState<any[]>([]);
  const [isEditProvinceModalOpen, setIsEditProvinceModalOpen] = useState(false);
  const [selectEditEthnicity, setSelectedEditEthnicity] =
    useState<EthnicityProps>({
      id: 0,
      updated_by: "",
      updated_at: "",
      name: "",
      description: "",
    });

  const fetchEthnicity = async (search: string) => {
    const res = await fetch(
      `${BASE_URL}/api/codes/ethnicities/?search=${search}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error("Network error");
    return res.json();
  };

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["ethnicity", debouncedSearch],
    queryFn: () => fetchEthnicity(debouncedSearch),
    behavior: keepPreviousData(),
    enabled: debouncedSearch.length > 0,
  });

  const { data, isFetching } = useQuery({
    queryKey: ["ethnicity", "ethnicity-table", page, limit],
    queryFn: async (): Promise<PaginatedResponse<EthnicityProps>> => {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams();

      params.append("page", String(page));
      params.append("limit", String(limit));
      params.append("offset", String(offset));

      const res = await fetch(
        `${BASE_URL}/api/codes/ethnicities/?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch Ethnicity data.");
      }

      return res.json();
    },
    enabled: !!token,
    keepPreviousData: true,
  });
  const { data: OrganizationData } = useQuery({
    queryKey: ["ethnicity"],
    queryFn: () => getOrganization(token ?? ""),
  });

  const { data: UserData } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(token ?? ""),
  });

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEthnicity(token ?? "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ethnicity"] });
      messageApi.success("Ethnicity deleted successfully");
    },
    onError: (error: any) => {
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.name) {
          form.setFields([{ name: "name", errors: errorData.name }]);
        }
        if (errorData.description) {
          form.setFields([
            { name: "description", errors: errorData.description },
          ]);
        }
        messageApi.error("Please check the form fields.");
      } else {
        messageApi.error("Failed to update Ethnicity");
      }
    },
  });

  const { data: provinceData } = useQuery({
    queryKey: ["ethnicity-province"],
    queryFn: () =>
      fetch(`${BASE_URL}/api/codes/ethnicity-provinces/?limit=1000`, {
        headers: { Authorization: `Token ${token}` },
      }).then((res) => res.json()),
  });

  const provinceList = provinceData?.results || [];
  const provincesByEthnicity = provinceList.reduce((acc, item) => {
    if (!acc[item.ethnicity]) acc[item.ethnicity] = [];
    acc[item.ethnicity].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const { mutate: editEthnicity, isLoading: isUpdating } = useMutation({
    mutationFn: (updated: EthnicityProps) =>
      patchEthnicity(token ?? "", updated.id, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ethnicity"] });
      messageApi.success("Ethnicity updated successfully");
      setIsEditModalOpen(false);
    },
    onError: () => {
      messageApi.error("Failed to update Ethnicity");
    },
  });

  const handleEdit = (record: EthnicityProps) => {
    setSelectedEditEthnicity(record);
    form.setFieldsValue(record);
    if (provinceList.length > 0) {
      const provincesForEthnicity = provinceList.filter(
        (p) =>
          p.ethnicity?.trim().toLowerCase() ===
          record.name?.trim().toLowerCase()
      );
      setEditProvinces(provincesForEthnicity);
    } else {
      setEditProvinces([]);
    }
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    if (isEditModalOpen && selectEditEthnicity && provinceList.length > 0) {
      const provincesForEthnicity = provinceList.filter((p) => {
        const a = (p.ethnicity || "").trim().toLowerCase();
        const b = (selectEditEthnicity.name || "").trim().toLowerCase();
        return a === b;
      });
      console.log(
        "Filtered provinces for",
        selectEditEthnicity.name,
        provincesForEthnicity
      );
      setEditProvinces(provincesForEthnicity);
    }
  }, [isEditModalOpen, selectEditEthnicity, provinceList]);

  const handleRemoveEditProvince = (index: number) => {
    const province = editProvinces[index];
    if (!province || !province.id) return;
    Modal.confirm({
      title: "Are you sure you want to remove this Ethnicity Province?",
      onOk: async () => {
        try {
          const res = await fetch(
            `${BASE_URL}/api/codes/ethnicity-provinces/${province.id}/`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );
          if (!res.ok) throw new Error("Failed to delete Ethnicity Province");
          queryClient.invalidateQueries({ queryKey: ["ethnicity-province"] });
          message.success("Ethnicity Province removed successfully");
        } catch (err) {
          message.error("Failed to remove Ethnicity Province");
        }
      },
    });
  };

  const results = useQueries({
    queries: [
      {
        queryKey: ["region"],
        queryFn: () => getJailRegion(token ?? ""),
      },
      {
        queryKey: ["province"],
        queryFn: () => getJail_Province(token ?? ""),
      },
    ],
  });

  const RegionData = results[0].data?.results || [];
  const ProvinceData = results[1].data?.results || [];

  const handleAddEditProvince = (newProvince: any) => {
    if (!newProvince) return;
    setEditProvinces((prev) => [
      ...prev,
      {
        ...newProvince,
        region:
          RegionData?.find((r) => r.id === newProvince.region_id)?.desc || "",
        province:
          ProvinceData?.find((p) => p.id === newProvince.province_id)?.desc ||
          "",
        ethnicity: selectEditEthnicity?.name || "",
        record_status_id: 1,
      },
    ]);
    setIsEditProvinceModalOpen(false);
  };

  const dataSource =
    data?.results?.map((ethnicity) => ({
      id: ethnicity?.id ?? "",
      name: ethnicity?.name ?? "",
      description: ethnicity?.description ?? "",
      updated_by: ethnicity?.updated_by ?? "",
      updated_at: ethnicity?.updated_at ?? "",
    })) || [];

  const columns: ColumnsType<EthnicityProps> = [
    {
      title: "No.",
      key: "no",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      title: "Ethnicity",
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
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      sorter: (a, b) => moment(a.updated_at).diff(moment(b.updated_at)),
      render: (value) =>
        value ? moment(value).format("YYYY-MM-DD hh:mm:ss A") : "",
    },
    {
      title: "Updated By",
      dataIndex: "updated_by",
      key: "updated_by",
      sorter: (a, b) => a.updated_by.localeCompare(b.updated_by),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: EthnicityProps) => (
        <div className="flex gap-1.5 justify-center">
          <Button type="link" onClick={() => handleEdit(record)}>
            <AiOutlineEdit />
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              Modal.confirm({
                centered: true,
                title: "Confirm Deletion",
                content: "Are you sure you want to delete this record?",
                onOk() {
                  deleteMutation.mutate(record.id);
                },
                onCancel() {},
              });
            }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AiOutlineDelete />
          </Button>
        </div>
      ),
    },
  ];
  const fetchAllEthnicity = async () => {
    const res = await fetch(`${BASE_URL}/api/codes/ethnicities/?limit=10000`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfDataUrl(null);
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    setLoadingMessage("Generating PDF... Please wait.");

    try {
      const doc = new jsPDF("landscape");
      const headerHeight = 48;
      const footerHeight = 32;
      const organizationName = OrganizationData?.results?.[0]?.org_name || "";
      const PreparedBy =
        `${UserData?.first_name || ""} ${UserData?.last_name || ""}` || "";

      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      const reportReferenceNo = `TAL-${formattedDate}-XXX`;
      const maxRowsPerPage = 14;
      let startY = headerHeight;

      let allData;
      if (searchText.trim() === "") {
        allData = await fetchAllEthnicity();
      } else {
        allData = await fetchEthnicity(searchText.trim());
      }

      const allResults = allData?.results || [];
      const printSource = allResults.map((ethnicity, index) => ({
        key: index + 1,
        id: ethnicity?.id ?? "",
        name: ethnicity?.name ?? "",
        description: ethnicity?.description ?? "",
        updated_by: ethnicity?.updated_by ?? "",
        updated_at: ethnicity?.updated_at ?? "",
      }));

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
        doc.text("Ethnicity Report", 10, 15);
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
        item.name || "",
        item.description || "",
      ]);

      for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
        const pageData = tableData.slice(i, i + maxRowsPerPage);

        autoTable(doc, {
          head: [["No.", "Ethnicity", "Description"]],
          body: pageData,
          startY: startY,
          margin: { top: 0, left: 10, right: 10 },
          styles: {
            fontSize: 8,
          },
          columnStyles: {
            3: { cellWidth: 100 },
            4: { cellWidth: 100 },
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
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    let allData;
    if (searchText.trim() === "") {
      allData = await fetchAllEthnicity();
    } else {
      allData = await fetchEthnicity(searchText.trim());
    }

    const allResults = allData?.results || [];
    const printSource = allResults.map((ethnicity, index) => ({
      key: index + 1,
      id: ethnicity?.id ?? "",
      name: ethnicity?.name ?? "",
      description: ethnicity?.description ?? "",
      updated_by: ethnicity?.updated_by ?? "",
      updated_at: ethnicity?.updated_at ?? "",
    }));

    const exportData = printSource.map((ethnicity, index) => {
      return {
        "No.": index + 1,
        Ethnicity: ethnicity?.name,
        Description: ethnicity?.description,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ethnicity");
    XLSX.writeFile(wb, "Ethnicity.xlsx");
  };

  const handleExportCSV = async () => {
    try {
      let allData;
      if (searchText.trim() === "") {
        allData = await fetchAllEthnicity();
      } else {
        allData = await fetchEthnicity(searchText.trim());
      }

      const allResults = allData?.results || [];
      const printSource = allResults.map((ethnicity, index) => ({
        key: index + 1,
        id: ethnicity?.id ?? "",
        name: ethnicity?.name ?? "",
        description: ethnicity?.description ?? "",
        updated_by: ethnicity?.updated_by ?? "",
        updated_at: ethnicity?.updated_at ?? "",
      }));

      const exportData = printSource.map((ethnicity, index) => {
        return {
          "No.": index + 1,
          Ethnicity: ethnicity?.name,
          Description: ethnicity?.description,
        };
      });

      const csvContent = [
        Object.keys(exportData[0]).join(","),
        ...exportData.map((item) => Object.values(item).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "Ethnicity.csv");
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
          {isLoading ? <span className="loader"></span> : "Export Excel"}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={handleExportCSV}>
          {isLoading ? <span className="loader"></span> : "Export CSV"}
        </a>
      </Menu.Item>
    </Menu>
  );

  const totalRecords = debouncedSearch ? data?.count || 0 : data?.count || 0;

  const mapEthnicity = (ethnicity, index) => ({
    key: index + 1,
    id: ethnicity?.id ?? "",
    name: ethnicity?.name ?? "",
    description: ethnicity?.description ?? "",
    updated_by: ethnicity?.updated_by ?? "",
    updated_at: ethnicity?.updated_at ?? "",
  });
  return (
    <div>
      {contextHolder}
      <div className="flex gap-2 flex-col">
        <div className="flex justify-between items-center">
          <div className="md:text-2xl font-bold text-[#1E365D]">
            Filipino Ethnic Groups
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex gap-2">
            <Dropdown
              className="bg-[#1E365D] py-2 px-5 rounded-md text-white"
              overlay={menu}
            >
              <a
                className="ant-dropdown-link gap-2 flex items-center"
                onClick={(e) => e.preventDefault()}
              >
                {isLoading ? <span className="loader"></span> : <GoDownload />}
                {isLoading ? " Loading..." : " Export"}
              </a>
            </Dropdown>
            <button
              className={`bg-[#1E365D] py-2 px-5 rounded-md text-white ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleExportPDF}
              disabled={isLoading}
            >
              {isLoading ? loadingMessage : "PDF Report"}
            </button>
          </div>
          <div className="flex gap-5">
            <div className="flex place-items-center">
              <input
                placeholder="Search"
                type="text"
                onChange={(e) => setSearchText(e.target.value)}
                className="border border-gray-400 h-10 w-96 rounded-md px-2"
              />
              <LuSearch className="text-gray-400 -ml-7" />
            </div>
            <button
              type="button"
              className="bg-[#1E365D] text-white px-3 py-2 rounded-md flex gap-1 items-center"
              onClick={showModal}
            >
              <GoPlus /> Add Ethnic Group
            </button>
          </div>
        </div>
        <Table
          className="overflow-x-auto"
          loading={isFetching || searchLoading}
          columns={columns}
          dataSource={
            debouncedSearch
              ? (searchData?.results || []).map(mapEthnicity)
              : dataSource
          }
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize: limit,
            total: totalRecords,
            pageSizeOptions: ["10", "20", "50", "100"],
            showSizeChanger: true,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setLimit(newPageSize);
            },
          }}
          rowKey="id"
        />
        <Modal
          title="Ethnicity Report"
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
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width="50%"
        >
          <AddEthnicity onClose={handleCancel} />
        </Modal>
        <Modal
          title="Edit Ethnic Group"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
          width="60%"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              editEthnicity({
                ...selectEditEthnicity,
                ...values,
                provinces: editProvinces,
              });
              setIsEditModalOpen(false);
            }}
          >
            <div className="flex gap-4">
              <div className="w-full">
                <p className="text-[#1E365D] font-bold text-base">
                  Ethnicity Name:
                </p>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please input the Ethnicity name",
                    },
                  ]}
                >
                  <Input className="w-full h-12 px-3 border rounded" />
                </Form.Item>
              </div>
              <div className="w-full">
                <p className="text-[#1E365D] font-bold text-base">
                  Description:
                </p>
                <Form.Item
                  name="description"
                  rules={[
                    { required: true, message: "Please input a description" },
                  ]}
                >
                  <Input className="w-full h-12 px-3 border rounded" />
                </Form.Item>
              </div>
            </div>
            <div className="pt-5">
              <div className="flex justify-between items-center pb-2">
                <h1 className="text-[#1E365D] font-bold md:text-lg">
                  Ethnicity Province
                </h1>
                <Button
                  className="bg-[#1E365D] text-white px-3 py-2 text-lg rounded-md"
                  onClick={() => setIsEditProvinceModalOpen(true)}
                  icon={<GoPlus />}
                  type="primary"
                >
                  Add Province
                </Button>
              </div>
              <Table
                columns={[
                  {
                    title: "Ethnicity",
                    dataIndex: "ethnicity",
                    key: "ethnicity",
                  },
                  { title: "Region", dataIndex: "region", key: "region" },
                  { title: "Province", dataIndex: "province", key: "province" },
                  {
                    title: "Description",
                    dataIndex: "description",
                    key: "description",
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_: any, row: any) => (
                      <div className="flex items-center gap-2">
                        <Button
                          type="primary"
                          ghost
                          onClick={() =>
                            setEditEthnicityProvinceModal({
                              open: true,
                              province: row,
                            })
                          }
                        >
                          <AiOutlineEdit />
                        </Button>
                        <Button
                          danger
                          onClick={() => {
                            const index = editProvinces.indexOf(row);
                            if (index > -1) {
                              Modal.confirm({
                                centered: true,
                                title: "Confirm Deletion",
                                content:
                                  "Are you sure you want to delete this province?",
                                onOk() {
                                  handleRemoveEditProvince(index);
                                },
                                onCancel() {},
                              });
                            } else {
                              console.warn("Province not found in the list.");
                            }
                          }}
                        >
                          <AiOutlineDelete />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                dataSource={editProvinces}
                rowKey={(row) =>
                  row.id ||
                  row.province + row.region + row.description ||
                  Math.random()
                }
                pagination={false}
              />
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  className="bg-white border border-[#1e365d] text-[#1e365d] px-5 text-lg py-4 rounded-md"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#1E365D] text-white px-5 text-lg py-4 rounded-md"
                  htmlType="submit"
                  type="primary"
                >
                  Save
                </Button>
              </div>
            </div>
          </Form>
          <Modal
            title="Add Ethnicity Province"
            open={isEditProvinceModalOpen}
            onCancel={() => setIsEditProvinceModalOpen(false)}
            footer={null}
            width="40%"
          >
            <AddEditEthnicityProvince
              ethnicityId={selectEditEthnicity?.id || 0}
              ethnicityName={
                form.getFieldValue("name") || selectEditEthnicity?.name || ""
              }
              onAdd={handleAddEditProvince}
              onCancel={() => setIsEditProvinceModalOpen(false)}
            />
          </Modal>
        </Modal>
        <Modal
          open={editEthnicityProvinceModal.open}
          onCancel={() =>
            setEditEthnicityProvinceModal({ open: false, province: null })
          }
          footer={null}
          title="Edit Ethnicity Province"
          width="50%"
        >
          {editEthnicityProvinceModal.province && (
            <EditEthnicityProvince
              province={editEthnicityProvinceModal.province}
              ethnicityName={
                selectEditEthnicity?.name ||
                editEthnicityProvinceModal.province.ethnicity ||
                ""
              }
              onCancel={() =>
                setEditEthnicityProvinceModal({ open: false, province: null })
              }
              onEthnicityProvinceUpdated={() => {
                setEditEthnicityProvinceModal({ open: false, province: null });
                queryClient.invalidateQueries({
                  queryKey: ["ethnicity-province"],
                });
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Ethnicity;
