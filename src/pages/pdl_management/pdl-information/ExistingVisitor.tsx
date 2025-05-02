import { Table } from "antd";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
    visitors: any[];
}

const ExistingVisitor = ({ visitors }: Props) => {

    const dataSource = visitors?.map((visitor, index) => ({
        key: index,
        idNumber: visitor.id_number,
        name: visitor.person,
        type: visitor.visitor_type,
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
            <h1 className="text-xl font-semibold">Existing Visitors</h1>
            <Table dataSource={dataSource} columns={columns} className="border text-gray-200 rounded-md" pagination={false} />
        </div>
    )
}

export default ExistingVisitor