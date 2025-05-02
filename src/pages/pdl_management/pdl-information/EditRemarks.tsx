import { Table } from 'antd';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
    remarks: any[];
}

const EditRemarks = ({ remarks }: Props) => {
    const dataSource = remarks?.map((remark, index) => ({
        key: index,
        idNumber: remark?.id_number,
        name: remark?.person,
        type: remark?.visitor_type,
    })) || [];

    const columns = [
        {
            title: 'ID Number',
            dataIndex: 'idNumber',
            key: 'idNumber',
        },
        {
            title: 'Visitor Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Visitor Type',
            dataIndex: 'type',
            key: 'type',
        },

    ];

    return (
        <div className="w-full flex flex-col gap-6 mt-10">
            <h1 className="text-xl font-bold">Remarks</h1>
            <Table dataSource={dataSource} columns={columns} className="border text-gray-200 rounded-md" pagination={false} />
        </div>
    )
}

export default EditRemarks