import Spinner from "@/components/loaders/Spinner";
import { PDLs } from "@/lib/pdl-definitions";
import { PaginatedResponse } from "@/lib/queries";
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
        queryKey: ['pdl','pdl-table', page, limit],
        queryFn: async (): Promise<PaginatedResponse<PDLs>> => {
            const offset = (page - 1) * limit;
            const res = await fetch(
                `${BASE_URL}/api/pdls/pdl/?page=${page}&limit=${limit}&offset=${offset}`,
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

    const dataSource = (data?.results || []).map((pdl, index) => {

        return {
            key: index + 1 + (page - 1) * limit,
            id: pdl?.id,
            name: `${pdl?.person?.first_name} ${pdl?.person?.middle_name ?? ''} ${pdl?.person?.last_name}`.trim(),
            date_of_birth: pdl?.person?.date_of_birth,
            offense: pdl?.cases?.[0]?.offense,
            status: pdl?.status,
            date_of_admission: pdl?.date_of_admission,
            visitation_status: pdl?.visitation_status,
            notes: pdl?.notes,
        };
    }) || [];
    const columns: ColumnType<PersonnelForm>[] = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'PDL No.',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Full Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Date of Birth',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
        },
        {
            title: 'Case Type',
            dataIndex: 'offense',
            key: 'offense',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Date of Commitment',
            dataIndex: 'date_of_admission',
            key: 'date_of_admission',
        },
        {
            title: 'Visiting Eligibility',
            dataIndex: 'visitation_status',
            key: 'visitation_status',
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
        }
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
                    <h1 className="text-2xl font-bold text-[#1E365D]">List of PDL</h1>
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