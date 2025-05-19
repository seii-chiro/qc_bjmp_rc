import { FiFileText } from "react-icons/fi"
import { IconType } from "react-icons"
import { GoDotFill } from "react-icons/go"
import { NavLink } from "react-router-dom"

interface IconProps {
    icon: IconType;
    title: string;
}

export const Header = ({ title }: { title: string, }) => {
    return (
        <div>
            <div className="flex items-center">
                <FiFileText className="text-gray-600" />
                <h1 className="font-bold text-lg ml-4">{title}</h1>
            </div>
        </div>
    )
}

export const Title = ({ title, icon: Icon }: IconProps) => {
    return (
        <div>
            <div className="flex items-center">
                <Icon className="text-gray-600" />
                <h1 className="font-bold text-lg ml-4">{title}</h1>
            </div>
        </div>
    )
}

export const GodotLink = ({ link, title, openModalClick }: { link?: string, title: string, openModalClick?: () => void }) => {
    const isLinkDisabled = !link;

    return (
        <div onClick={openModalClick}>
            <div className="flex gap-2 hover:bg-gray-50 p-1.5">
                <div className="text-[#52688D] bg-[#BFC8D7] text-xs rounded-sm p-1.5 h-fit">
                    <GoDotFill />
                </div>
                {isLinkDisabled ? (
                    <span className="text-base font-medium text-gray-400">{title}</span>
                ) : (
                    <NavLink to={link}>
                        <p className="text-base font-medium">{title}</p>
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export const GodotModal = ({ title, openModalClick }: { title: string, openModalClick?: () => void }) => {
    return (
        <div onClick={openModalClick}>
            <div className="flex gap-2 hover:bg-gray-50 p-1.5">
                <div className="text-[#52688D] bg-[#BFC8D7] text-xs rounded-sm p-1.5 h-fit"><GoDotFill /></div>
                <p className="text-base font-medium">{title}</p>
            </div>
        </div>
    )
}

export const GoLink = ({ link, title }: { link?: string; title: string }) => {
    const isLinkDisabled = !link;

    return (
        <div>
            <div className="md:w-80 w-full border shadow-sm hover:shadow-lg border-gray-200 p-5 rounded-md transition duration-300 ease-in-out">
                {isLinkDisabled ? (
                    <div className="flex gap-2 items-center">
                        <FiFileText className="text-gray-600" />
                        <span className="text-base font-medium text-gray-400">{title}</span>
                    </div>
                    
                ) : (
                    <NavLink to={link} className="block">
                        <div className="flex items-center">
                            <FiFileText className="text-gray-600 hover:text-blue-600" />
                            <p className="ml-5 text-lg font-medium hover:text-gray-700 transition duration-200">{title}</p>
                        </div>
                    </NavLink>
                )}
            </div>
        </div>
    );
};