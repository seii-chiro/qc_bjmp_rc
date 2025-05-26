/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Input, Button, Table } from "antd";
import { useEffect, useState } from "react";

const VisitLog = () => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<"Main Gate" | "Visitor" | "PDL">(
    "Main Gate"
  );
  const token = useTokenStore().token;

  const [mainGatePage, setMainGatePage] = useState(1);
  const [visitorPage, setVisitorPage] = useState(1);
  const [pdlPage, setPDLPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

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
    queryKey: ["main-gate", mainGatePage, limit, debouncedSearch],
    queryFn: async () => {
      const offset = (mainGatePage - 1) * limit;
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/main-gate-visits/?search=${debouncedSearch}&limit=${limit}&offset=${offset}`
        : `${BASE_URL}/api/visit-logs/main-gate-visits/?&limit=${limit}&offset=${offset}`;
      return fetchVisitLogs(url);
    },
    placeholderData: (prevData) => prevData,
    enabled: view === "Main Gate",
  });

  const { data: visitorData, isLoading: visitorLogsLoading } = useQuery({
    queryKey: ["visitor", visitorPage, limit, debouncedSearch],
    queryFn: async () => {
      const offset = (visitorPage - 1) * limit;
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/visitor-station-visits/?search=${debouncedSearch}&limit=${limit}&offset=${offset}`
        : `${BASE_URL}/api/visit-logs/visitor-station-visits/?&limit=${limit}&offset=${offset}`;
      return fetchVisitLogs(url);
    },
    placeholderData: (prevData) => prevData,
    enabled: view === "Visitor",
  });

  const { data: pdlData, isLoading: pdlLogsLoading } = useQuery({
    queryKey: ["pdl", pdlPage, limit, debouncedSearch],
    queryFn: async () => {
      const offset = (pdlPage - 1) * limit;
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/pdl-station-visits/?search=${debouncedSearch}&limit=${limit}&offset=${offset}`
        : `${BASE_URL}/api/visit-logs/pdl-station-visits/?&limit=${limit}&offset=${offset}`;
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
    {
      title: "Visitor Name",
      dataIndex: "visitor",
      key: "visitor",
      sorter: (a: VisitLogRow, b: VisitLogRow) => {
        const nameA = a.visitor?.toLowerCase() || "";
        const nameB = b.visitor?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Visitor Type",
      dataIndex: "visitor_type",
      key: "visitor_type",
      sorter: (a: VisitLogRow, b: VisitLogRow) =>
        (a.visitor_type || "").localeCompare(b.visitor_type || ""),
    },
    { title: "PDL Name(s)", dataIndex: "pdl_name", key: "pdl_name" },
    { title: "PDL Type", dataIndex: "pdl_type", key: "pdl_type" },
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
        { text: "IN", value: "IN" },
        { text: "OUT", value: "OUT" },
      ],
      onFilter: (value: string | number | boolean, record: any) =>
        String(record.status).toLowerCase() === String(value).toLowerCase(),
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
                ? "#22c55e" // green-500
                : String(record.status).toLowerCase() === "in"
                  ? "#f59e42" // orange-400
                  : "#d1d5db", // gray-300 for other statuses
            display: "inline-block",
          }}
          title={record.status}
        />
      ),
    },
  ];

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
      }) => ({
        key: entry.id,
        id: entry?.id,
        timestampIn: entry?.timestamp_in ?? "",
        timestampOut: entry?.timestamp_out ?? "",
        duration:
          (() => {
            const sec = Number(entry?.duration ?? 0);
            if (!sec || isNaN(sec) || sec === 0) return undefined;
            if (sec < 60) return `${sec}s`;
            const min = Math.floor(sec / 60);
            if (min < 60) return `${min}m`;
            const hr = Math.floor(min / 60);
            return `${hr}h ${min % 60}m`;
          })() ?? "...",
        status: entry?.status ?? "",
        visitor: entry?.person || "",
        visitor_type: entry?.visitor?.visitor_type || "N/A",
        pdl_name:
          Array.isArray(entry?.visitor?.pdls) && entry.visitor.pdls.length > 0
            ? entry.visitor.pdls
              .map(
                (pdl) =>
                  `${pdl?.pdl?.person?.first_name ?? ""} ${pdl?.pdl?.person?.last_name ?? ""}`.trim()
              )
              .join(", ")
            : "N/A",
        pdl_type:
          Array.isArray(entry?.visitor?.pdls) && entry.visitor.pdls.length > 0
            ? entry.visitor.pdls.map((pdl, i, arr) => (
              <span key={i}>
                {pdl?.pdl?.status || "Unknown"}
                {i < arr.length - 1 ? ", " : ""}
              </span>
            ))
            : "N/A",
      })
    )
    .sort(
      (
        a: { timestamp: string | number | Date },
        b: { timestamp: string | number | Date }
      ) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // const filteredData = dataSource.filter(
  //   (log: { [s: string]: unknown } | ArrayLike<unknown>) => {
  //     const hasVisitor =
  //       typeof log === "object" && log !== null && "visitor" in log;
  //     const visitorMatch = hasVisitor
  //       ? String((log as { [s: string]: unknown }).visitor || "")
  //         .toLowerCase()
  //         .includes(searchText.toLowerCase())
  //       : false;
  //     const otherMatch = Object.values(log).some((value) =>
  //       String(value).toLowerCase().includes(searchText.toLowerCase())
  //     );
  //     return visitorMatch || otherMatch;
  //   }
  // );

  return (
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
          <div className="flex gap-2 mt-10">
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
      <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
        <Table
          loading={tableIsLoading || mainGateLogsLoading || visitorLogsLoading || pdlLogsLoading}
          columns={columns}
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
  );
};

export default VisitLog;
