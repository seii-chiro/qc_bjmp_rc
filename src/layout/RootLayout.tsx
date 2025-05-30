import Sidebar from "../components/Sidebar.tsx";
import Navbar from "../components/Navbar.tsx";
import Content from "../components/Content.tsx";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { useLocation } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb.tsx";
import { Button, Modal } from 'antd';
import { useTokenStore } from "@/store/useTokenStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore.ts";
import UserProfileNotifs from "@/components/UserProfileNotifs.tsx";

const RootLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const setToken = useTokenStore().setToken
    const setIsAuthenticated = useAuthStore().setIsAuthenticated;
    const { clearUser, user } = useUserStore();

    const location = useLocation();

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

    const handleLogout = () => {
        showModal();
    };

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
                <div className="flex flex-col items-start">
                    <h2 className="font-bold text-lg">Are you sure that you want to logout?</h2>
                    <p>All unsaved changes will be lost.</p>
                </div>
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
                            <UserProfileNotifs
                                user={user}
                                onLogout={handleLogout}
                            />
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