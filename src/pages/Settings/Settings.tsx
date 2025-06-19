import { GodotLink, Header } from "../assets/components/link"


const Settings = () => {
    return (
        <div className="border text-gray-700 border-gray-200 p-5 w-96 shadow-sm hover:shadow-md rounded-md">
            <Header title="Maintenance" />
            <div className="mt-2 ml-8">
                <GodotLink link="general-settings" title="General Settings" />
                <GodotLink link="system-settings" title="System Settings" />
                <GodotLink link="encryption_parameters" title="Encryption Parameters" />
            </div>
        </div>
    )
}

export default Settings
