import { GodotLink, Header } from "../assets/components/link"

const Maintenance = () => {
    return (
        <div>
            <div>
                <div className="border text-gray-700 border-gray-200 p-5 w-full md:max-w-3xl shadow-sm hover:shadow-md rounded-md">
                    <Header title="Maintenance"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
                        <div>
                            <GodotLink link="social-media-platforms" title="Social Media Platform" />
                            <GodotLink link="ethnicities" title="Ethnicities" />
                            <GodotLink link="id-types" title="ID Types" />
                            {/* <GodotLink link="group-affiliation" title="Group Affiliation" /> */}
                            <GodotLink link="" title="Backup" />
                            <GodotLink link="prefixes" title="Prefixes" />
                            <GodotLink link="suffixes" title="Suffixes" />
                            {/* <GodotLink link="contact-types" title="Contact Types" />
                            <GodotLink link="address-types" title="Address Types" /> */}
                            <GodotLink link="nationalities" title="Nationalities" />
                            <GodotLink link="multi-birth-classification" title="Multi Birth Classication" />
                        </div>
                        <div>
                            <GodotLink link="affiliation-type" title="Affiliation Types" />
                            <GodotLink link="gender" title="Gender" />
                            <GodotLink link="civil-status" title="Civil Status" />
                            <GodotLink link="record-status" title="Record Status" />
                            <GodotLink link="religion" title="Religion" />
                            <GodotLink link="occupation" title="Occupation" />
                            <GodotLink link="educational-attainments" title="Educational Attainments" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Maintenance
