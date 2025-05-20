import { BASE_URL } from '@/lib/urls';
import { useTokenStore } from '@/store/useTokenStore';
import { useQuery } from '@tanstack/react-query';
import { Input, Button, Table } from 'antd';
import { useEffect, useState } from 'react';

const VisitLog = () => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<'Main Gate' | 'Visitor' | 'PDL'>('Main Gate');
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
    queryKey: ['main-gate', mainGatePage, limit, debouncedSearch],
    queryFn: async () => {
      const offset = (mainGatePage - 1) * limit;
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/main-gate-visits/?search=${debouncedSearch}&page=${mainGatePage}&limit=${limit}&offset=${offset}`
        : `${BASE_URL}/api/visit-logs/main-gate-visits/?page=${mainGatePage}&limit=${limit}&offset=${offset}`;
      return fetchVisitLogs(url);
    },
    keepPreviousData: true,
    enabled: view === 'Main Gate',
  });

  const { data: visitorData, isLoading: visitorLogsLoading } = useQuery({
    queryKey: ['visitor', visitorPage, limit, debouncedSearch],
    queryFn: async () => {
      const offset = (visitorPage - 1) * limit;
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/visitor-station-visits/?search=${debouncedSearch}&page=${visitorPage}&limit=${limit}&offset=${offset}`
        : `${BASE_URL}/api/visit-logs/visitor-station-visits/?page=${visitorPage}&limit=${limit}&offset=${offset}`;
      return fetchVisitLogs(url);
    },
    keepPreviousData: true,
    enabled: view === 'Visitor',
  });

  const { data: pdlData, isLoading: pdlLogsLoading } = useQuery({
    queryKey: ['pdl', pdlPage, limit, debouncedSearch],
    queryFn: async () => {
      const offset = (pdlPage - 1) * limit;
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/pdl-station-visits/?search=${debouncedSearch}&page=${pdlPage}&limit=${limit}&offset=${offset}`
        : `${BASE_URL}/api/visit-logs/pdl-station-visits/?page=${pdlPage}&limit=${limit}&offset=${offset}`;
      return fetchVisitLogs(url);
    },
    keepPreviousData: true,
    enabled: view === 'PDL',
  });

  let activeData, tableIsLoading, page, setPage;
  if (view === 'Main Gate') {
    activeData = mainGateData;
    tableIsLoading = mainGateLogsLoading;
    page = mainGatePage;
    setPage = setMainGatePage;
  } else if (view === 'Visitor') {
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

  const columns = [
    {
      title: 'No.',
      key: 'no',
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => {
        const date = new Date(text);
        return date.toLocaleString();
      },
    },
    {
      title: 'Visitor Name',
      dataIndex: 'visitor',
      key: 'visitor',
      sorter: (a, b) => {
        const nameA = a.visitor?.toLowerCase() || '';
        const nameB = b.visitor?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Visitor Type',
      dataIndex: 'visitor_type',
      key: 'visitor_type',
      sorter: (a, b) => (a.visitor_type || '').localeCompare(b.visitor_type || ''),
    },
    { title: 'PDL Name', dataIndex: 'pdl_name', key: 'pdl_name' },
    { title: 'PDL Type', dataIndex: 'pdl_type', key: 'pdl_type' },
  ];

  const dataSource = (activeData?.results || []).map((entry) => ({
    key: entry.id,
    timestamp: entry?.tracking_logs?.[0]?.created_at ?? '',
    visitor: entry?.person || '',
    visitor_type: entry?.visitor_type || '',
    pdl_name: entry?.pdl_name || '',
    pdl_type: entry?.pdl_type || '',
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by timestamp descending

  const filteredData = dataSource.filter((log) => {
    const visitorMatch = (log.visitor || '').toLowerCase().includes(searchText.toLowerCase());
    const otherMatch = Object.values(log).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    );
    return visitorMatch || otherMatch;
  });

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E365D]">
            {view === 'Main Gate'
              ? 'Main Gate Visitor Logs'
              : view === 'Visitor'
                ? 'Visitor Logs'
                : 'PDL Logs'}
          </h1>
          <div className="flex gap-2 mt-2">
            <Button
              type={view === 'Main Gate' ? 'primary' : 'default'}
              onClick={() => setView('Main Gate')}
            >
              Main Gate Logs
            </Button>
            <Button
              type={view === 'Visitor' ? 'primary' : 'default'}
              onClick={() => setView('Visitor')}
            >
              Visitor Logs
            </Button>
            <Button
              type={view === 'PDL' ? 'primary' : 'default'}
              onClick={() => setView('PDL')}
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
            if (view === 'Main Gate') setMainGatePage(1);
            if (view === 'Visitor') setVisitorPage(1);
            if (view === 'PDL') setPDLPage(1);
          }}
          className="py-2 w-full md:w-64"
        />
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <Table
          loading={tableIsLoading}
          columns={columns}
          dataSource={debouncedSearch ? filteredData : dataSource}
          scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
          pagination={
            debouncedSearch
              ? false
              : {
                current: page,
                pageSize: limit,
                total: activeData?.count || 0,
                onChange: (newPage) => setPage(newPage),
                showSizeChanger: false,
              }
          }
          rowKey="key"
        />
      </div>
    </div>
  );
};

export default VisitLog;