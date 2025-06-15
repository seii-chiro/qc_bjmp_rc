import { OTPAccount } from "@/lib/issues-difinitions";
import { getUser, getUsers } from "@/lib/queries";
import { deleteOTP, getOTP } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";

type OTPForm = OTPAccount;

const OTP = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();

    const { data: otpData } = useQuery({
        queryKey: ['OTP'],
        queryFn: () => getOTP(token ?? ""),
    });

    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(token ?? ""),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOTP(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["OTP"] });
            messageApi.success("OTP deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete OTP");
        },
    });

    // Create a map from user ID to full name
    const usersMap = new Map(
        usersData?.results.map(user => [user.id, `${user.first_name} ${user.last_name}`]) || []
    );

    const dataSource = otpData?.results.map((otp) => ({
        id: otp.id ?? '',
        failed_attempts: otp.failed_attempts ?? '',
        last_failed_at: otp.last_failed_at ?? '',
        locked_until: otp.locked_until ?? '',
        user: usersMap.get(otp.user) || 'Unknown User', // Fallback for unknown users
    })) || [];

    const filteredData = dataSource.filter((otp) =>
        Object.values(otp).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<OTPForm> = [
        {
            title: 'No.',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Failed Attempt',
            dataIndex: 'failed_attempts',
            key: 'failed_attempts',
            sorter: (a, b) => a.failed_attempts - b.failed_attempts,
        },
        {
            title: 'Last Failed At',
            dataIndex: 'last_failed_at',
            key: 'last_failed_at',
            sorter: (a, b) => new Date(b.last_failed_at).getTime() - new Date(a.last_failed_at).getTime(),
        },
        {
            title: 'Locked Until',
            dataIndex: 'locked_until',
            key: 'locked_until',
            sorter: (a, b) => new Date(b.locked_until).getTime() - new Date(a.locked_until).getTime(),
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="link"
                        danger
                        onClick={() => deleteMutation.mutate(record.id)}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            {contextHolder}
            <div className="flex justify-between items-center my-4">
                <h1 className="text-2xl font-bold text-[#1E365D]">User OTP Account Lockout</h1>
                <Input
                    placeholder="Search OTP..."
                    value={searchText}
                    className="py-2 md:w-64 w-full"
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            
            <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
}

export default OTP;