import { UserAccounts } from "@/lib/definitions";
import { Avatar, Badge, Dropdown, List, Button, Typography, Empty, Spin, Divider, message } from "antd"
import { BellOutlined, LogoutOutlined } from '@ant-design/icons';
import profile_fallback from "@/assets/profile_placeholder.jpg"
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getOASISAlertNotification, updateOASISAlertNotifStatus } from "@/lib/oasis-query";
import { useState } from "react";

const { Text } = Typography;

type Props = {
    user: UserAccounts | null;
    onLogout: () => void;
}

const UserProfileNotifs = ({ user, onLogout }: Props) => {
    const token = useTokenStore((state) => state.token);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { data: OASISAlertNotfication, isLoading: OASISAlertNotficationLoading, refetch } = useQuery({
        queryKey: ['user', 'oasis-alert-notifs'],
        queryFn: () => getOASISAlertNotification(token ?? ""),
        refetchInterval: 12_000
    })

    const updateNotifStatus = useMutation({
        mutationKey: ["notif-status-status"],
        mutationFn: (
            input: { notif_id: number; payload: { status: "read" | "unread" } }
        ) => updateOASISAlertNotifStatus(token ?? "", input.notif_id, input.payload),
        onSuccess: () => refetch(),
        onError: (err) => message.error(err.message)
    });

    const notifications = OASISAlertNotfication?.results || [];
    const unreadCount = notifications.filter(notif => notif?.status === "unread").length;

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
        return date.toLocaleDateString();
    };

    const dropdownContent = (
        <div className="w-80 max-h-96 overflow-hidden flex flex-col bg-white border border-gray-500/35 rounded-md">
            <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <Text strong className="text-base">Notifications</Text>
                    <Badge
                        count={unreadCount}
                        overflowCount={99}
                        size="small"
                    >
                        <BellOutlined className="text-gray-500" />
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {OASISAlertNotficationLoading ? (
                    <div className="p-4 text-center">
                        <Spin size="small" />
                        <Text className="ml-2 text-gray-500">Loading notifications...</Text>
                    </div>
                ) : notifications.length > 0 ? (
                    <List
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                className={`px-3 py-2 hover:bg-gray-50 cursor-pointer border-none ${item.status === 'unread' ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="w-full flex flex-col pl-4 pr-2">
                                    <div className="w-full flex justify-between items-center">
                                        <div className="flex justify-between items-start mb-1">
                                            <Text strong className="text-sm">
                                                {item.alert?.identifier || 'OASIS Alert'}
                                            </Text>
                                            {item.status === 'unread' && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-1"></div>
                                            )}
                                        </div>
                                        <Text className="text-xs text-gray-400">
                                            {formatTimeAgo(item.created_at || item.notified_at || new Date().toISOString())}
                                        </Text>
                                    </div>
                                    <div className="w-full flex justify-between items-center">
                                        <Text className="text-xs text-gray-600 block mb-1">
                                            {item.user || item.updated_at || 'New alert notification'}
                                        </Text>
                                        <button
                                            onClick={() =>
                                                updateNotifStatus.mutate({
                                                    notif_id: item?.id,
                                                    payload: {
                                                        status: item?.status === "read" ? "unread" : "read",
                                                    },
                                                })
                                            }
                                            className="text-xs hover:text-green-700 font-semibold"
                                        >
                                            Mark as {item?.status === "read" ? "unread" : "read"}
                                        </button>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="p-4">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No notifications"
                            className="text-gray-500"
                        />
                    </div>
                )}
            </div>

            <Divider className="my-0" />

            <div className="p-2">
                <Button
                    type="text"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={onLogout}
                    className="w-full text-left justify-start font-semibold"
                >
                    Logout
                </Button>
            </div>
        </div>
    );

    // This stops other components hover when dropdown is open but
    // the vibe its giving is off soooo...
    // useEffect(() => {
    //     if (dropdownOpen) {
    //         document.body.style.overflow = "hidden";
    //     } else {
    //         document.body.style.overflow = "";
    //     }
    //     return () => {
    //         document.body.style.overflow = "";
    //     };
    // }, [dropdownOpen]);

    return (
        <Dropdown
            dropdownRender={() => dropdownContent}
            placement="bottomRight"
            arrow
            trigger={['click']}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
        >
            {dropdownOpen ? (
                <Avatar
                    src={user?.first_name || user?.last_name ? undefined : profile_fallback}
                    alt="Profile"
                    className="absolute right-[2%] cursor-pointer"
                >
                    {(user?.first_name || user?.last_name) &&
                        `${user?.first_name?.charAt(0)?.toUpperCase() ?? ""}${user?.last_name?.charAt(0)?.toUpperCase() ?? ""}`}
                </Avatar>
            ) : (
                <Badge
                    className="absolute right-[2%] cursor-pointer"
                    count={unreadCount}
                    overflowCount={99}
                    size="small"
                >
                    <Avatar
                        src={user?.first_name || user?.last_name ? undefined : profile_fallback}
                        alt="Profile"
                        className="cursor-pointer"
                    >
                        {(user?.first_name || user?.last_name) &&
                            `${user?.first_name?.charAt(0)?.toUpperCase() ?? ""}${user?.last_name?.charAt(0)?.toUpperCase() ?? ""}`}
                    </Avatar>
                </Badge>
            )}
        </Dropdown>
    )
}

export default UserProfileNotifs