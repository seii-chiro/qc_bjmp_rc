import Sidebar from "../components/Sidebar.tsx";
import Navbar from "../components/Navbar.tsx";
import Content from "../components/Content.tsx";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { useLocation } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb.tsx";
import { Avatar, Dropdown, Button, Modal, MenuProps } from 'antd';
import { useTokenStore } from "@/store/useTokenStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore.ts";
import profile_fallback from "@/assets/people.png"


const RootLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const setToken = useTokenStore().setToken
    const setIsAuthenticated = useAuthStore().setIsAuthenticated;
    const { clearUser, user } = useUserStore();

    const location = useLocation();
    // const routeTitle = location.pathname === "/" ? "DASHBOARD" : location.pathname.slice(1).toUpperCase()

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
        setIsAuthenticated(false)
        setToken(null)
        clearUser()
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const items: MenuProps['items'] = [
        // {
        //     key: '1',
        //     label: (
        //         <a href="#">
        //             Profile
        //         </a>
        //     ),
        // },
        // {
        //     key: '2',
        //     label: (
        //         <a href="#">
        //             Account Settings
        //         </a>
        //     ),
        // },
        {
            key: '3',
            label: (
                <button
                    className="w-full text-left font-semibold"
                    onClick={showModal}
                >
                    Logout
                </button>
            ),
        },
    ];

    //setting outlet container to h-full cuts the sidebar when scrolling down.

    return (
        <>
            <Modal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                centered
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Return
                    </Button>,
                    <Button key="submit" type="primary" danger onClick={handleOk}>
                        Logout
                    </Button>
                ]}
            >
                <h2 className="font-bold text-lg">Are you sure that you want to logout?</h2>
                <p>All unsaved changes will be lost.</p>
            </Modal>

            <div className="flex">
                <Sidebar isSidebarCollapsed={isSidebarCollapsed}>
                    <Navbar isSidebarCollapsed={isSidebarCollapsed} />
                </Sidebar>

                <Content>
                    <div className="w-full h-full relative">
                        <header className="flex gap-1.5 items-center h-16 sticky top-0 px-5 bg-white z-[1000]">
                            <button
                                onClick={() => setIsSidebarCollapsed(prev => !prev)}
                                className="w-5 h-5"
                            >
                                <RxHamburgerMenu />
                            </button>
                            <h2 className="font-bold">
                                <Breadcrumb url={location.pathname} />
                            </h2>
                            <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                <Avatar
                                    className="absolute right-[2%]"
                                    src={user?.first_name || user?.last_name ? undefined : profile_fallback}
                                    alt="Profile"
                                >
                                    {(user?.first_name || user?.last_name) &&
                                        `${user?.first_name?.charAt(0)?.toUpperCase() ?? ""}${user?.last_name?.charAt(0)?.toUpperCase() ?? ""}`}
                                </Avatar>
                            </Dropdown>
                        </header>
                        <div className="outlet-container w-full relative px-5">
                            <Outlet />
                        </div>
                    </div>
                </Content>
            </div>
        </>
    );
};

export default RootLayout;