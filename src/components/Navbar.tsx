import { NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { HiHome, HiOutlineUsers, HiWrenchScrewdriver } from "react-icons/hi2";
import LinkContainer from "./LinkContainer";
import { FaRegFileAlt } from "react-icons/fa";
import { LiaToolsSolid } from "react-icons/lia";
import { VscSettings } from "react-icons/vsc";
import { FaWrench } from "react-icons/fa6";
import { IoMapOutline } from "react-icons/io5";
import { GoGitMerge } from "react-icons/go";
import { GrGroup } from "react-icons/gr";
import { CiFileOn } from "react-icons/ci";
import { LuFolderCog } from "react-icons/lu";
import { MdOutlinePersonSearch } from "react-icons/md";
import { PiWarningOctagon, PiWarningLight, PiUserCircleLight } from "react-icons/pi";

interface NavbarProps {
    isSidebarCollapsed: boolean;
}

const Navbar = ({ isSidebarCollapsed }: NavbarProps) => {
    const modules = [
        { path: "home", icon: HiHome, label: "Home" },
        { path: "dashboard", icon: RxDashboard, label: "Dashboard" },
        { path: "map", icon: IoMapOutline, label: "Map" },
        { path: "personnels", icon: HiOutlineUsers, label: "Personnels" },
        { path: "visitors", icon: GrGroup, label: "Visitors" },
        { path: "pdls", icon: CiFileOn, label: "PDLs" },
        { path: "assets", icon: LuFolderCog, label: "Assets" },
        { path: "screening", icon: MdOutlinePersonSearch, label: "Screening" },
        { path: "threats", icon: PiWarningLight, label: "Threats" },//threats
        { path: "incidents", icon: PiWarningOctagon, label: "Incidents" },
        { path: "reports", icon: FaRegFileAlt, label: "Reports" },
        { path: "", icon: FaWrench, label: "Supports" },//supports
        { path: "settings", icon: VscSettings, label: "Settings" },//
    ];

    const administrationLinks = [
        { path: "maintenance", icon: HiWrenchScrewdriver, label: "Maintenance" },
        { path: "", icon: GoGitMerge, label: "Integrations" },//integrations
        { path: "", icon: LiaToolsSolid, label: "Tools" },//tools
        { path: "users", icon: PiUserCircleLight, label: "Users" },
    ];

    return (
        <>
            <ul className="flex flex-col">
                {!isSidebarCollapsed && <p className="text-black ml-5 text-base font-bold">MODULES</p>}
                {modules.map(({ path, icon: Icon, label }, i) => (
                    <li key={`${path}-${i}`}>
                        {path ? (
                            <NavLink to={path}>
                                <LinkContainer icon={Icon} isSidebarCollapsed={isSidebarCollapsed} linkName={label} />
                            </NavLink>
                        ) : (
                            <span className="text-gray-400">
                                <LinkContainer icon={Icon} isSidebarCollapsed={isSidebarCollapsed} linkName={label} />
                            </span>
                        )}
                    </li>
                ))}
                <hr className="w-[85%] border-gray-400 mx-auto my-5" />
                <p className="text-black ml-5 text-base font-bold">ADMINISTRATION</p>
                {administrationLinks.map(({ path, icon: Icon, label }) => (
                    <li key={path}>
                        {path ? (
                            <NavLink to={path}>
                                <LinkContainer icon={Icon} isSidebarCollapsed={isSidebarCollapsed} linkName={label} />
                            </NavLink>
                        ) : (
                            <span className="text-gray-400">
                                <LinkContainer icon={Icon} isSidebarCollapsed={isSidebarCollapsed} linkName={label} />
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
};

export default Navbar;