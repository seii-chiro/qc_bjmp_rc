import { LuBellRing } from "react-icons/lu"
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
                <div>
                    <div className="flex items-center">
                        <LuBellRing className="text-gray-600" />
                        <h1 className="font-bold text-lg ml-4">ALERTS AND NOTIFICATION</h1>
                    </div>
                </div>
                <div className="ml-8 mt-2 flex gap-10">
                    <div>
                        <GodotLink link="oasis" title="Send an Alert" />
                        <GodotLink link="oasis/status" title="Status" />
                        <GodotLink link="oasis/message_type" title="Message Type" />
                        <GodotLink link="oasis/scope" title="Scope" />
                        <GodotLink link="oasis/restriction" title="Restriction" />
                        <GodotLink link="oasis/code" title="Code" />
                        <GodotLink link="oasis/note" title="Note" />
                        <GodotLink link="oasis/language" title="Language" />
                        <GodotLink link="oasis/category" title="Category" />
                        <GodotLink link="oasis/event" title="Event" />
                    </div>
                    <div>
                        <GodotLink link="oasis/response_type" title="Response Type" />
                        <GodotLink link="oasis/urgency" title="Urgency" />
                        <GodotLink link="oasis/severity" title="Severity" />
                        <GodotLink link="oasis/certainty" title="Certainty" />
                        <GodotLink link="oasis/audience" title="Audience" />
                        <GodotLink link="oasis/event_code" title="Event Code" />
                        <GodotLink link="oasis/instructions" title="Instructions" />
                        <GodotLink link="oasis/parameter" title="Parameter" />
                        <GodotLink link="oasis/geocode" title="Geocode" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Incidents
