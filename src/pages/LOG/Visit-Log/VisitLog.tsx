import { MainGateLog } from '@/lib/issues-difinitions';
import { PaginatedResponse } from '@/lib/queries';
import { getMainGate, getPDLStation, getVisitorStation } from '@/lib/query';
import { useTokenStore } from '@/store/useTokenStore';
import { useQuery } from '@tanstack/react-query';
import { Input, Button, Table } from 'antd';
import { useEffect, useState } from 'react';

const VisitLog = () => {
  const [searchText, setSearchText] = useState('');
  const [view, setView] = useState<'Main Gate' | 'Visitor' | 'PDL'>('Main Gate');
  const token = useTokenStore().token;
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [page, setPage] = useState(1);
  const limit = 10;
  const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
        return () => clearTimeout(timeout);
    }, [searchText]);

    const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ["", debouncedSearch],
        queryFn: () => fetchPersonnels(debouncedSearch),
        behavior: keepPreviousData(),
        enabled: debouncedSearch.length > 0,
    });
  const { data, isFetching } = useQuery({
        queryKey: ['main-gate', 'maingate-table', page],
        queryFn: async (): Promise<PaginatedResponse<MainGateLog>> => {
            // Add offset parameter for Django REST Framework's pagination
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/codes/personnel/?page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch Personnel data.');
            }

            return res.json();
        },
        behavior: keepPreviousData(),
    });

  const { data: mainGateData, isLoading: mainGateLogsLoading } = useQuery({
    queryKey: ['main-gate'],
    queryFn: () => getMainGate(token ?? ''),
    refetchInterval: 10000,
    enabled: view === 'Main Gate',
  });

  const { data: receptionData, isLoading: visitorStationLogsLoading } = useQuery({
    queryKey: ['reception-log'],
    queryFn: () => getVisitorStation(token ?? ''),
    refetchInterval: 10000,
    enabled: view === 'Visitor',
  });

  const { data: pdlData, isLoading: pdlStationLogsLoading } = useQuery({
    queryKey: ['pdl-log'],
    queryFn: () => getPDLStation(token ?? ''),
    refetchInterval: 10000,
    enabled: view === 'PDL',
  });

  let tableIsLoading = true;

  if (view === 'Main Gate') {
    tableIsLoading = mainGateLogsLoading;
  } else if (view === 'Visitor') {
    tableIsLoading = visitorStationLogsLoading;
  } else if (view === 'PDL') {
    tableIsLoading = pdlStationLogsLoading;
  }

  const activeData =
    view === 'Main Gate'
      ? mainGateData
      : view === 'Visitor'
        ? receptionData
        : pdlData;

  const dataSource =
    activeData?.results?.map((entry, index) => ({
      key: index + 1,
      id: entry?.id ?? 'N/A',
      timestamp: entry?.tracking_logs?.[0]?.created_at ?? '',
      visitor: entry?.person || '',
      visitor_type: entry?.visitor?.results?.visitor_type || '',
      pdl_name: `${entry?.visitor?.results?.pdls?.[0]?.pdl?.person?.first_name || ''} ${entry?.visitor?.results?.pdls?.[0]?.pdl?.person?.last_name || ''}`,
      pdl_type: entry?.visitor?.results?.pdls?.[0]?.pdl?.pdl_type || '',
    })) || [];

  const filteredData = dataSource.filter((log) => {
    const visitorMatch = log.visitor.toLowerCase().includes(searchText.toLowerCase());
    const otherMatch = Object.values(log).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    );
    return visitorMatch || otherMatch; // Include visitor name in the filtering
  });

  const columns = [
    { title: 'No.',
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
     },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend', 
    },
    {
      title: 'Visitor Name',
      dataIndex: 'visitor',
      key: 'visitor',
      sorter: (a, b) => {
        const nameA = a.visitor.toLowerCase();
        const nameB = b.visitor.toLowerCase();
        return nameA.localeCompare(nameB); 
      },
      filters: [
        ...Array.from(
            new Set(filteredData.map(item => item.visitor))
        ).map(visitor => ({
            text: visitor,
            value: visitor,
        }))
      ],
      onFilter: (value, record) => record.visitor === value,
    },
    {
      title: 'Visitor Type',
      dataIndex: 'visitor_type',
      key: 'visitor_type',
      sorter: (a, b) => a.visitor_type.localeCompare(b.visitor_type), 
      
      filters: [
        { text: 'Regular', value: 'Regular' },
        { text: 'Senior Citizen', value: 'Senior Citizen' },
        { text: 'Person with Disabilities', value: 'Person with Disabilities' },
        { text: 'Pregnant Woman', value: 'Pregnant Woman' },
        { text: 'Minor', value: 'Minor' },
        { text: 'LGBTQ + TRANSGENDER', value: 'LGBTQ + TRANSGENDER' },
        { text: 'LGBTQ + GAY / BISEXUAL', value: 'LGBTQ + GAY / BISEXUAL' },
        { text: 'LGBTQ + LESBIAN / BISEXUAL', value: 'LGBTQ + LESBIAN / BISEXUAL' },
      ],
      onFilter: (value, record) => record.visitor_type.includes(value), // Filtering
    },
    { title: 'PDL Name', dataIndex: 'pdl_name', key: 'pdl_name' },
    { title: 'PDL Type', dataIndex: 'pdl_type', key: 'pdl_type' },
  ];

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header & Buttons */}
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

        {/* Search Input */}
        <Input
          placeholder="Search logs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="py-2 w-full md:w-64"
        />
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-y-auto" style={{ maxHeight: '90vh' }}>
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
      </div>
    </div>
  );
};

export default VisitLog;