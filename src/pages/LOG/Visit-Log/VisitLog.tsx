/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Input, Button, Table, Menu, Dropdown, Modal } from "antd";
import type { TableProps } from "antd";
import { useEffect, useState } from "react";
import { generateLogReport } from "../generateLogReport";
import { CSVLink } from "react-csv";
import { GoDownload } from "react-icons/go";
import * as XLSX from "xlsx";
import { useUserStore } from "@/store/useUserStore";

const VisitLog = () => {
  const user = useUserStore(state => state.user)
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [view, setView] = useState<"Main Gate" | "Visitor" | "PDL">(
    "Main Gate"
  );
  const token = useTokenStore().token;

  const [mainGatePage, setMainGatePage] = useState(1);
  const [visitorPage, setVisitorPage] = useState(1);
  const [pdlPage, setPDLPage] = useState(1);

  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [isPdfPreviewModalOpen, setIsPdfPreviewModalOpen] = useState(false)

  const limit = 10;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const handleTableChange: TableProps<any>["onChange"] = (pagination, filters, sorter) => {
    // Get the status filter value from filters
    const status = filters.status as string[] | undefined;
    setStatusFilter(status && status.length > 0 ? status[0] : null);
    // If you want to reset to page 1 on filter change, also call setPage(1) here
  };

  const fetchVisitLogs = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Network error");
    return res.json();
  };

  const { data: mainGateData, isLoading: mainGateLogsLoading } = useQuery({
    queryKey: ["main-gate", mainGatePage, limit, debouncedSearch, statusFilter], // add statusFilter
    queryFn: async () => {
      const offset = (mainGatePage - 1) * limit;
      const statusParam = statusFilter ? `&status_by_timeout=${encodeURIComponent(statusFilter)}` : "";
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/main-gate-visits/?search=${debouncedSearch}&limit=${limit}&offset=${offset}${statusParam}`
        : `${BASE_URL}/api/visit-logs/main-gate-visits/?limit=${limit}&offset=${offset}${statusParam}`;
      return fetchVisitLogs(url);
    },
    placeholderData: (prevData) => prevData,
    enabled: view === "Main Gate",
  });

  const { data: visitorData, isLoading: visitorLogsLoading } = useQuery({
    queryKey: ["visitor", visitorPage, limit, debouncedSearch, statusFilter],
    queryFn: async () => {
      const offset = (visitorPage - 1) * limit;
      const statusParam = statusFilter ? `&status_by_timeout=${encodeURIComponent(statusFilter)}` : "";
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/visitor-station-visits/?search=${debouncedSearch}&limit=${limit}&offset=${offset}${statusParam}`
        : `${BASE_URL}/api/visit-logs/visitor-station-visits/?limit=${limit}&offset=${offset}${statusParam}`;
      return fetchVisitLogs(url);
    },
    placeholderData: (prevData) => prevData,
    enabled: view === "Visitor",
  });

  const { data: pdlData, isLoading: pdlLogsLoading } = useQuery({
    queryKey: ["pdl", pdlPage, limit, debouncedSearch, statusFilter],
    queryFn: async () => {
      const offset = (pdlPage - 1) * limit;
      const statusParam = statusFilter ? `&status_by_timeout=${encodeURIComponent(statusFilter)}` : "";
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/pdl-station-visits/?search=${debouncedSearch}&limit=${limit}&offset=${offset}${statusParam}`
        : `${BASE_URL}/api/visit-logs/pdl-station-visits/?limit=${limit}&offset=${offset}${statusParam}`;
      return fetchVisitLogs(url);
    },
    placeholderData: (prevData) => prevData,
    enabled: view === "PDL",
  });


  let activeData, tableIsLoading, page, setPage;
  if (view === "Main Gate") {
    activeData = mainGateData;
    tableIsLoading = mainGateLogsLoading;
    page = mainGatePage;
    setPage = setMainGatePage;
  } else if (view === "Visitor") {
    activeData = visitorData;
    tableIsLoading = visitorLogsLoading;
    page = visitorPage;
    setPage = setVisitorPage;
  } else {
    activeData = pdlData;
    tableIsLoading = pdlLogsLoading;
    page = pdlPage;
    setPage = setPDLPage;
  }

  const isPDLView = view === "PDL";

  type VisitLogRow = {
    key: string | number;
    id: string | number;
    timestampIn: string;
    timestampOut: string;
    status: string;
    visitor: string;
    visitor_type: string;
    pdl_name: string;
    pdl_type: React.ReactNode;
  };

  const columns = [
    {
      title: "No.",
      width: 90,
      key: "no",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    !isPDLView ? {
      title: "Visitor Name",
      dataIndex: "visitor",
      key: "visitor",
      sorter: (a: VisitLogRow, b: VisitLogRow) => {
        const nameA = a.visitor?.toLowerCase() || "";
        const nameB = b.visitor?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      },
    } : null,
    !isPDLView ? {
      title: "Visitor Type",
      dataIndex: "visitor_type",
      key: "visitor_type",
      sorter: (a: VisitLogRow, b: VisitLogRow) =>
        (a.visitor_type || "").localeCompare(b.visitor_type || ""),
    } : null,
    { title: "PDL Name(s)", dataIndex: "pdl_name", key: "pdl_name" },
    !isPDLView ? {
      title: "PDL Type",
      dataIndex: "pdl_type",
      key: "pdl_type",
    } : null,
    {
      title: "Login",
      dataIndex: "timestampIn",
      key: "timestampIn",
      render: (text: string | number | Date | null | undefined) => {
        if (!text) return "...";
        const date = new Date(text);
        return isNaN(date.getTime()) ? "..." : date.toLocaleString();
      },
      sorter: (a: any, b: any) => {
        const aTime = new Date(a.timestampIn).getTime();
        const bTime = new Date(b.timestampIn).getTime();
        return aTime - bTime;
      },
      // Simple filter by date string (YYYY-MM-DD)
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="YYYY-MM-DD"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Filter
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => {
        if (!value) return true;
        if (!record.timestampIn) return false;
        return record.timestampIn.startsWith(value);
      },
    },
    {
      title: "Logout",
      dataIndex: "timestampOut",
      key: "timestampOut",
      render: (text: string | number | Date | null | undefined) => {
        if (!text) return "...";
        const date = new Date(text);
        return isNaN(date.getTime()) ? "..." : date.toLocaleString();
      },
      sorter: (a: any, b: any) => {
        const aTime = new Date(a.timestampOut).getTime();
        const bTime = new Date(b.timestampOut).getTime();
        return aTime - bTime;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="YYYY-MM-DD"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Filter
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value: any, record: { timestampOut: string; }) => {
        if (!value) return true;
        if (!record.timestampOut) return false;
        return record.timestampOut.startsWith(value);
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      key: "status",
      filters: [
        { text: "IN", value: "In" },
        { text: "OUT", value: "Out" },
      ],
      filteredValue: statusFilter ? [statusFilter] : [],
    },
    {
      title: "", // No title for the status color box
      key: "statusColor",
      width: 40,
      align: "center",
      render: (_: any, record: any) => (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background:
              String(record.status).toLowerCase() === "out"
                ? "#22c55e"
                : String(record.status).toLowerCase() === "in"
                  ? "#f59e42"
                  : "#d1d5db",
            display: "inline-block",
          }}
          title={record.status}
        />
      ),
    },
  ].filter(Boolean);;

  const dataSource = (activeData?.results || [])
    .map(
      (entry: {
        id: any;
        timestamp_in: any;
        timestamp_out: any;
        duration: any;
        status: any;
        person: any;
        visitor: { visitor_type: any; pdls: any[] };
      }, index: number) => ({
        no: index + 1,
        key: entry.id,
        id: entry?.id,
        timestampIn: entry?.timestamp_in ?? "",
        timestampOut: entry?.timestamp_out ?? "",
        duration:
          (() => {
            const sec = Number(entry?.duration ?? 0);
            if (!sec || isNaN(sec) || sec === 0) return undefined;
            if (sec < 60) return `${sec?.toFixed(0)}s`;
            const min = Math.floor(sec / 60);
            if (min < 60) return `${min}m`;
            const hr = Math.floor(min / 60);
            return `${hr}h ${min % 60}m`;
          })() ?? "...",
        status: entry?.status ?? "",
        // Switch the person data based on view
        visitor: view === "PDL" ? "" : (entry?.person || ""),
        visitor_type: view === "PDL" ? "N/A" : (entry?.visitor?.visitor_type || "N/A"),
        pdl_name: view === "PDL"
          ? (entry?.person || "N/A")
          : (Array.isArray(entry?.visitor?.pdls) && entry.visitor.pdls.length > 0
            ? entry.visitor.pdls
              .map(
                (pdl) =>
                  `${pdl?.pdl?.person?.first_name ?? ""} ${pdl?.pdl?.person?.last_name ?? ""}`.trim()
              )
              .join(", ")
            : "N/A"),
        pdl_type: view === "PDL"
          ? "N/A"
          : (Array.isArray(entry?.visitor?.pdls) && entry.visitor.pdls.length > 0
            ? entry.visitor.pdls.map(pdl => pdl?.pdl?.status || "Unknown").join(", ")
            : "N/A"),
      })
    )
    .sort(
      (
        a: { timestampIn: string | number | Date },
        b: { timestampIn: string | number | Date }
      ) => new Date(b.timestampIn).getTime() - new Date(a.timestampIn).getTime()
    );

  const headers = columns?.filter(item => item?.title !== "")?.map(item => item?.title)

  const handleGeneratePdfReport = () => {
    const rows = dataSource.map(item =>
      columns.map(column => {
        const key = column.dataIndex || column.key;
        return item[key] || '';
      })
    );

    const preparedBy = user?.first_name && user?.last_name ? `${user?.first_name} ${user?.last_name}` : user?.email
    const fileName = `${view} Station Log Report`
    const title = fileName

    const blobURL = generateLogReport({
      headers,
      rows,
      preparedBy,
      fileName,
      title
    });
    setPdfPreview(blobURL)
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataSource);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${view}LogReport`);
    XLSX.writeFile(wb, `${view} Log Report.xlsx`);
  };

  const handleOpenPdfPreviewModal = () => {
    handleGeneratePdfReport()
    setIsPdfPreviewModalOpen(true)
  }

  const handleClosePdfPreviewModal = () => {
    setPdfPreview(null)
    setIsPdfPreviewModalOpen(false)
  }


  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={handleExportExcel}>Export Excel</a>
      </Menu.Item>
      <Menu.Item>
        <CSVLink data={dataSource} filename={`${view} Log Report.csv`}>
          Export CSV
        </CSVLink>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Modal
        title={`${view} Station Logs`}
        centered
        width={"60%"}
        open={isPdfPreviewModalOpen}
        onCancel={handleClosePdfPreviewModal}
        onClose={handleClosePdfPreviewModal}
      >
        {pdfPreview && (
          <iframe
            className="mt-5"
            src={pdfPreview}
            style={{ width: "100%", height: "80vh", border: "none" }}
            title="PDF Preview"
          />
        )}
      </Modal>
      <div className="p-4 h-full flex flex-col">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E365D]">
              {view === "Main Gate"
                ? "Main Gate Visitor Logs"
                : view === "Visitor"
                  ? "Visitor Logs"
                  : "PDL Logs"}
            </h1>
            <div className="flex gap-2 mt-4">
              <Button
                type={view === "Main Gate" ? "primary" : "default"}
                onClick={() => setView("Main Gate")}
              >
                Main Gate Logs
              </Button>
              <Button
                type={view === "Visitor" ? "primary" : "default"}
                onClick={() => setView("Visitor")}
              >
                Visitor Logs
              </Button>
              <Button
                type={view === "PDL" ? "primary" : "default"}
                onClick={() => setView("PDL")}
              >
                PDL Logs
              </Button>
            </div>
          </div>
        </div>
        <div className="flex w-full justify-between">
          <div className="flex gap-2">
            <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
              <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                <GoDownload /> Export
              </a>
            </Dropdown>
            <button
              className="bg-[#1E365D] py-2 px-5 rounded-md text-white"
              onClick={handleOpenPdfPreviewModal}
            >
              Print Report
            </button>
          </div>

          <Input
            placeholder="Search logs..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              if (view === "Main Gate") setMainGatePage(1);
              if (view === "Visitor") setVisitorPage(1);
              if (view === "PDL") setPDLPage(1);
            }}
            className="py-2 w-full md:w-64"
          />
        </div>
        <div className="overflow-y-auto mt-5" style={{ maxHeight: "90vh" }}>
          <Table
            loading={tableIsLoading}
            columns={columns}
            onChange={handleTableChange}
            dataSource={dataSource}
            scroll={{ x: 800, y: "calc(100vh - 200px)" }}
            pagination={{
              current: page,
              pageSize: limit,
              total: activeData?.count || 0,
              onChange: (newPage) => setPage(newPage),
              showSizeChanger: false,
            }}
            rowKey="key"
          />
        </div>
      </div>
    </>
  );
};

export default VisitLog;
