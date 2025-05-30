import Spinner from "@/components/loaders/Spinner";
import { Visitor as NewVisitorType } from "@/lib/pdl-definitions";
import { PaginatedResponse } from "@/lib/queries";
import { getMainGate } from "@/lib/query";
import { BASE_URL } from "@/lib/urls";
import { PersonnelForm } from "@/lib/visitorFormDefinition";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Dropdown, Menu, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { useState } from "react";
import { GoDownload } from "react-icons/go";

const ListPersonnel = () => {
    const token = useTokenStore().token; 
    const [page, setPage] = useState(1);
    const [limit, setlimit] = useState(10);

    const { data, isFetching, error } = useQuery({
        queryKey: ['visitor','visitor-table', page, limit],
        queryFn: async (): Promise<PaginatedResponse<NewVisitorType>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/visitors/visitor/?page=${page}&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch PDL data.');
            }

            return res.json();
        },
        keepPreviousData: true,
    });

    const { data: mainGateLogs } = useQuery({
        queryKey: ['main-gate'],
        queryFn: () => getMainGate(token ?? "")
    });

    const dataSource = (data?.results || []).map((visitor, index) => {
    const inmate_visited = visitor?.pdls?.map(pdl => {
        const person = pdl?.pdl?.person;
        return person
            ? `${person.first_name} ${person.middle_name ?? ''} ${person.last_name}`.trim()
            : null;
    }).filter(Boolean).join(', ') || 'No Inmates Available';

    const trackingLog = mainGateLogs?.tracking_logs?.find(log => log.person === visitor.name); 
    const timestampIn = trackingLog ? new Date(trackingLog.timestamp_in).toLocaleString() : 'No Timestamp Available';

    return {
        key: index + 1 + (page - 1) * limit,
        id: visitor?.id,
        visitor_reg_no: visitor?.visitor_reg_no,
        name: `${visitor?.person?.first_name} ${visitor?.person?.middle_name ?? ''} ${visitor?.person?.last_name}`.trim(),
        visitor_type: visitor?.visitor_type,
        gender: visitor?.person?.gender?.gender_option,
        id_number: visitor?.id_number,
        inmate_visited,
        last_visit: timestampIn,
    };
}) || [];
    const columns: ColumnType<PersonnelForm>[] = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Visitor Number',
            dataIndex: 'visitor_reg_no',
            key: 'visitor_reg_no',
        },
        {
            title: 'Visitor Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Visitor Type',
            dataIndex: 'visitor_type',
            key: 'visitor_type',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'ID Type / Number',
            dataIndex: 'id_number',
            key: 'id_number',
        },
        {
            title: 'Inmate Visited',
            dataIndex: 'inmate_visited',
            key: 'inmate_visited',
        },
        {
            title: 'Last Visit Date & Time',
            dataIndex: '',
            key: '',
        },
    ];

    if (isFetching) return <Spinner></Spinner>;
    if (error) return <p>Error: {error.message}</p>;
    const menu = (
        <Menu>
            <Menu.Item>
                <a>Download PDF</a>
            </Menu.Item>
            <Menu.Item>
                <a>Download Excel</a>
            </Menu.Item>
            <Menu.Item>
                <a>Download CSV</a>
            </Menu.Item>
        </Menu>
    );
    return (
        <div className="md:px-10">
            <div className="my-5 flex justify-between">
                <h1 className="text-2xl font-bold text-[#1E365D]">List of PDL Visitors</h1>
                <Dropdown className="bg-[#1E365D] py-2 px-5 rounded-md text-white" overlay={menu}>
                    <a className="ant-dropdown-link gap-2 flex items-center " onClick={e => e.preventDefault()}>
                        <GoDownload /> Download
                    </a>
                </Dropdown>
            </div>
            <div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2 shadow-sm">
                    <Table 
                        dataSource={dataSource} 
                        columns={columns} 
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: data?.count,
                            showSizeChanger: true, 
                            pageSizeOptions: ['10', '20', '50', '100'], 
                            onChange: (page, pageSize) => {
                                setPage(page);
                                setlimit(pageSize);
                            },
                        }} 
                    />
                </div>
            </div>
        </div>
    );
}

export default ListPersonnel;