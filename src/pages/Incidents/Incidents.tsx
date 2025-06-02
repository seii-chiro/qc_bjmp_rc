import { GodotLink, Header } from "../assets/components/link"

const Incidents = () => {
    return (
        <div className="flex gap-4">
            <div className="border border-gray-200 py-5 px-10 w-full md:w-fit shadow-sm hover:shadow-md rounded-md text-gray-700">
                <Header title="INCIDENTS" />
                <div className="ml-8 mt-2">
                    <GodotLink link="report" title="Report" />
                    <GodotLink link="incidents_list" title="Incident" />
                    <GodotLink link="incident-category" title="Incident Category" />
                    <GodotLink link="incident-type" title="Incident Type" />
                    {/* <GodotLink link="" title="Incident Commanders" /> */}
                    {/* <GodotLink link="" title="Reporters" />
                    <GodotLink link="" title="Resolvers" />
                    <GodotLink link="" title="Responders" /> */}
                </div>
            </div>
            <div className="border border-gray-200 py-5 px-10 w-full md:w-fit shadow-sm hover:shadow-md rounded-md text-gray-700">
                <Header title="Alerts and Notifications" />
                <div className="ml-8 mt-2">
                    <GodotLink link="oasis" title="Send an Alert" />
                </div>
            </div>
        </div>
    )
}

export default Incidents
