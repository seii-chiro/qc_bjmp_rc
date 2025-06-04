import { GodotLink, Header } from "../assets/components/link"

const Personnels = () => {
    return (
        <div className="space-y-5 text-gray-700">
            <div className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-5">
                    
                    <div className="h-fit w-full border shadow-sm hover:shadow-md border-gray-200 p-5 rounded-md">
                        <div className="py-1">
                            <Header title="Personnel Information" />
                        </div>
                        <GodotLink link="personnel" title="Personnel" />
                        <GodotLink link="" title="Personnel Profile" />
                        <GodotLink link="/jvms/registration/personnel-registration" title="Personnel Registration" />
                        <GodotLink link="" title="In / Out" />
                    </div>
                    <div className="border border-gray-200 p-5 w-full shadow-sm hover:shadow-md rounded-md">
                        <Header title="Maintenance" />
                        <GodotLink link="personnel-designation" title="Personnel Designation" />
                        <GodotLink link="personnel-application-status" title="Personnel App Status" />
                        {/* <GodotLink link="" title="Personnel Person Relationship" /> */}
                        <GodotLink link="personnel-status" title="Personnel Status" />
                        <GodotLink link="personnel-type" title="Personnel Type" />
                        <GodotLink link="ranks" title="Ranks" />
                        <GodotLink link="positions" title="Positions" />
                        <GodotLink link="employment-type" title="Employment Type" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Personnels
