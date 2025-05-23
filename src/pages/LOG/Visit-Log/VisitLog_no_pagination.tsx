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

  const [mainGatePage] = useState(1);
  const [visitorPage] = useState(1);
  const [pdlPage] = useState(1);
  const limit = 1000; // Increase limit to load more logs without pagination

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
    queryKey: ['main-gate', limit, debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/main-gate-visits/`
        : `${BASE_URL}/api/visit-logs/main-gate-visits/`;
      return fetchVisitLogs(url);
    },
    keepPreviousData: true,
    enabled: view === 'Main Gate',
  });

  const { data: visitorData, isLoading: visitorLogsLoading } = useQuery({
    queryKey: ['visitor', limit, debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/visitor-station-visits/`
        : `${BASE_URL}/api/visit-logs/visitor-station-visits/`;
      return fetchVisitLogs(url);
    },
    keepPreviousData: true,
    enabled: view === 'Visitor',
  });

  const { data: pdlData, isLoading: pdlLogsLoading } = useQuery({
    queryKey: ['pdl', limit, debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch
        ? `${BASE_URL}/api/visit-logs/pdl-station-visits/`
        : `${BASE_URL}/api/visit-logs/pdl-station-visits/`;
      return fetchVisitLogs(url);
    },
    keepPreviousData: true,
    enabled: view === 'PDL',
  });

  let activeData, tableIsLoading;
  if (view === 'Main Gate') {
    activeData = mainGateData;
    tableIsLoading = mainGateLogsLoading;
  } else if (view === 'Visitor') {
    activeData = visitorData;
    tableIsLoading = visitorLogsLoading;
  } else {
    activeData = pdlData;
    tableIsLoading = pdlLogsLoading;
  }

  const columns = [
    {
      title: 'No.',
      key: 'no',
      render: (_: any, __: any, index: number) => index + 1,
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
    id: entry?.id,
    timestamp: entry?.tracking_logs?.[0]?.created_at ?? '',
    visitor: entry?.person || '',
    visitor_type: entry?.visitor_type || '',
    pdl_name: entry?.pdl_name || '',
    pdl_type: entry?.pdl_type || '',
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
          onChange={(e) => setSearchText(e.target.value)}
          className="py-2 w-full md:w-64"
        />
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <Table
          loading={tableIsLoading}
          columns={columns}
          dataSource={debouncedSearch ? filteredData : dataSource}
          scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
          rowKey="key"
          pagination={false} 
        />
      </div>
    </div>
  );
};

export default VisitLog;

