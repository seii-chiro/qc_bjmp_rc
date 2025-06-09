import { UserAccounts } from "@/lib/definitions";
import {
    Avatar,
    Badge,
    Dropdown,
    List,
    Button,
    Typography,
    Empty,
    Spin,
    message,
    Modal,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import profile_fallback from "@/assets/profile_placeholder.jpg";
import { useTokenStore } from "@/store/useTokenStore";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
    getOASISAlertNotification,
    updateOASISAlertNotifStatus,
} from "@/lib/oasis-query";
import { useState } from "react";
import XMLPreview from "./XMLPreview";
import { FaRegBell } from "react-icons/fa";
import { OASISAlertNotification } from "@/lib/oasis-response-definition";

const { Text } = Typography;

type Props = {
    user: UserAccounts | null;
    onLogout: () => void;
};

const UserProfileNotifs = ({ user, onLogout }: Props) => {
    const token = useTokenStore((state) => state.token);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [chosenXML, setChosenXML] = useState<string | null>(null);
    const [XMLPreviewOpen, setXMLPreviewOpen] = useState(false);

    const handleOpenModal = (linkToXML: string) => {
        setChosenXML(linkToXML)
        setXMLPreviewOpen(prev => !prev)
    }

    const handleCloseModal = () => {
        setChosenXML(null)
        setXMLPreviewOpen(prev => !prev)
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["user", "oasis-alert-notifs"],
        queryFn: ({ pageParam = 0 }) =>
            getOASISAlertNotification(token ?? "", {
                limit: 10,
                offset: pageParam,
            }),
        initialPageParam: 0, // Add this required property
        getNextPageParam: (lastPage, allPages) => {
            const fetchedCount = allPages.flatMap((page) => page.results).length;
            return fetchedCount < lastPage.count ? fetchedCount : undefined;
        },
        refetchInterval: 12_000,
    });

    const updateNotifStatus = useMutation({
        mutationKey: ["notif-status-status"],
        mutationFn: (input: {
            notif_id: number;
            payload: { status: "read" | "unread" };
        }) =>
            updateOASISAlertNotifStatus(token ?? "", input.notif_id, input.payload),
        onSuccess: () => refetch(),
        onError: (err) => message.error(err.message),
    });

    const notificationsMap = new Map<number, OASISAlertNotification>();

    if (data?.pages) {
        data.pages.forEach((page) => {
            page.results.forEach((notif) => {
                notificationsMap.set(notif.id, notif);
            });
        });
    }

    const notifications = Array.from(notificationsMap.values())
        .sort((a, b) => {
            if (a.status === "unread" && b.status !== "unread") return -1;
            if (a.status !== "unread" && b.status === "unread") return 1;
            const dateA = new Date(a.created_at || a.notified_at || 0).getTime();
            const dateB = new Date(b.created_at || b.notified_at || 0).getTime();
            return dateB - dateA;
        });

    const unreadCount = notifications.filter((n) => n.status === "unread").length;

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
        return date.toLocaleDateString();
    };

    const dropdownContent = (
        <div className="w-80 max-h-96 overflow-hidden flex flex-col bg-white border border-gray-500/35 rounded-md">
            <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between pr-4">
                    <Text strong className="text-base">
                        Notifications
                    </Text>
                    <Badge count={unreadCount} overflowCount={99} size="small" color="blue">
                        <FaRegBell />
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {isLoading ? (
                    <div className="p-4 text-center">
                        <Spin size="small" />
                        <Text className="ml-2 text-gray-500">Loading notifications...</Text>
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <List
                            dataSource={notifications}
                            renderItem={(item) => (
                                <List.Item
                                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer border-none ${item.status === "unread" ? "bg-blue-50" : ""
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(item?.alert?.to_xml_link)
                                        updateNotifStatus.mutate({
                                            notif_id: item?.id,
                                            payload: { status: "read" },
                                        })
                                    }}
                                >
                                    <div className="w-full flex flex-col pl-4 pr-2">
                                        <div className="w-full flex justify-between items-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <Text strong className="text-sm">
                                                    {item.alert?.identifier || "OASIS Alert"}
                                                </Text>
                                                {item.status === "unread" && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-1"></div>
                                                )}
                                            </div>
                                            <Text className="text-xs text-gray-400">
                                                {formatTimeAgo(
                                                    item.created_at ||
                                                    item.notified_at ||
                                                    new Date().toISOString()
                                                )}
                                            </Text>
                                        </div>
                                        <div className="w-full flex justify-between items-center">
                                            <Text className="text-xs text-gray-600 block mb-1">
                                                {item.user || item.updated_at || "New alert notification"}
                                            </Text>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    updateNotifStatus.mutate({
                                                        notif_id: item?.id,
                                                        payload: {
                                                            status: item?.status === "read" ? "unread" : "read",
                                                        },
                                                    })
                                                }}
                                                className="text-xs hover:text-green-700 font-semibold"
                                            >
                                                Mark as {item?.status === "read" ? "unread" : "read"}
                                            </button>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                        {hasNextPage && (
                            <div className="text-center py-2">
                                <Button
                                    onClick={() => fetchNextPage()}
                                    loading={isFetchingNextPage}
                                    type="link"
                                    className="text-blue-500"
                                >
                                    Load More
                                </Button>
                            </div>
                        )}
                    </>
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
        </div>
    );

    const profileDropdown = (
        <div className="w-40 max-h-96 overflow-hidden flex flex-col bg-white border border-gray-500/35 rounded-md">
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

    return (
        <>
            <div className="flex gap-4 absolute right-[2%] items-center">
                <Dropdown
                    dropdownRender={() => dropdownContent}
                    placement="bottomRight"
                    arrow
                    trigger={["click"]}
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                >
                    {dropdownOpen ? (
                        <FaRegBell />
                    ) : (
                        <Badge
                            color="blue"
                            className="cursor-pointer"
                            count={unreadCount}
                            overflowCount={99}
                            size="small"
                        >
                            <FaRegBell
                                size={18}
                            />
                        </Badge>
                    )}
                </Dropdown>

                <Dropdown
                    dropdownRender={() => profileDropdown}
                    placement="bottomRight"
                    arrow
                    trigger={["click"]}
                >
                    <Avatar
                        src={
                            user?.first_name || user?.last_name ? undefined : profile_fallback
                        }
                        alt="Profile"
                        className="cursor-pointer"
                    >
                        {(user?.first_name || user?.last_name) &&
                            `${user?.first_name?.charAt(0)?.toUpperCase() ?? ""}${user?.last_name?.charAt(0)?.toUpperCase() ?? ""
                            }`}
                    </Avatar>
                </Dropdown>
            </div>

            <Modal
                className="max-h-[90vh] overflow-hidden"
                width="50%"
                footer={null}
                centered
                open={XMLPreviewOpen}
                onCancel={(e) => {
                    e?.stopPropagation?.();
                    handleCloseModal();
                }}
                onClose={(e) => {
                    e?.stopPropagation?.();
                    handleCloseModal();
                }}
            >
                <div className="relative overflow-y-auto max-h-[80vh] px-6 py-4 custom-scrollbar-h scrollbar-thin">
                    {/* Edge masks */}
                    <div className="absolute top-0 left-0 w-4 h-full bg-white z-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-4 h-full bg-white z-10 pointer-events-none" />

                    <XMLPreview token={token ?? ""} chosenXML={chosenXML ?? ""} />
                </div>
            </Modal>
        </>
    );
};

export default UserProfileNotifs;
