import { GodotLink } from "../assets/components/link"

const Personnels = () => {
    return (
        <div className="space-y-5 text-gray-700">
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-5">
                    <div className="h-fit w-full border shadow-sm hover:shadow-md border-gray-200 p-5 rounded-md">
                        <GodotLink link="personnel" title="Personnel" />
                        <GodotLink link="" title="Personnel Profile" />
                        <GodotLink link="" title="In / Out" />
                    </div>
                    <div className="border border-gray-200 p-5 w-full shadow-sm hover:shadow-md rounded-md">
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
