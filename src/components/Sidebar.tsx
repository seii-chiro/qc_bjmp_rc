import { ReactNode } from "react";
import clsx from 'clsx';
import logo from '@/assets/Logo/QCJMD.png'
import merlin_logo from '@/assets/merlin_logo.png';
import tambuli_logo from '@/assets/tambuli_logo.png';

interface SidebarProps {
    children?: ReactNode;
    isSidebarCollapsed: boolean;
}

const Sidebar = ({ isSidebarCollapsed, children }: SidebarProps) => {
    return (
        <div className={clsx(`bg-grayWhtie py-4 flex-shrink-0`, isSidebarCollapsed ? 'w-[80px]' : 'w-[250px]', 'transition-all sticky top-0 h-screen overflow-auto', 'scrollbar-hide ')} >
            <img
                src={logo}
                className={clsx('bg-gray-100 rounded-full mb-2 transition-all', isSidebarCollapsed ? 'w-12 h-12 mx-auto' : 'w-36 h-36 mx-auto')}
            />
            {
                !isSidebarCollapsed && (
                    <div className="w-full flex gap-2 items-center justify-center">
                        <div className="h-14 flex items-center justify-center z-[1000]">
                            <div>
                                <img src={merlin_logo} alt={merlin_logo} className="w-10" />
                            </div>
                            <div className="text-[0.60rem]">
                                <h3 className="text-[#1E365D] mb-0 leading-[1]">Secured by</h3>
                                <h2 className="text-[#1E365D] font-bold mt-0 leading-tight">MerlinCryption</h2>
                            </div>
                        </div>
                        <div className="h-8 w-[2px] bg-gray-400" />
                        <div className="h-14 flex gap-1 items-center justify-center pr-2">
                            <div>
                                <img src={tambuli_logo} alt={"tambuli logo"} className="w-8" />
                            </div>
                            <div className="text-[0.60rem]">
                                <h3 className="text-[#1E365D] mb-0 leading-[1]">Powered by</h3>
                                <h2 className="text-[#1E365D] font-bold mt-0 leading-tight">Tambuli Labs</h2>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="w-full flex items-center justify-center mb-4">
                <div className="h-[1.5px] w-[85%] bg-gray-400" />
            </div>
            <div className="nav-container">
                {children}
            </div>
        </div>
    );
};

export default Sidebar;