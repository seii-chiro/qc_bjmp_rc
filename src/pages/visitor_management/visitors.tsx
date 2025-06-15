import { GodotLink, Header } from "../assets/components/link"

const Visitors = () => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 text-gray-700">
                <div className="border border-gray-200 p-5 w-full shadow-sm hover:shadow-md rounded-md">
                    <Header title="Visitor Information" />
                    <div className="mt-2 ml-8">
                        <GodotLink link="visitor" title="Visitors" />
                        <GodotLink link="visitor-id" title="Visitor Identification" />
                        <GodotLink link="visitor-registration" title="Visitor Registration" />
                    </div>
                    <div className="mt-2">
                        <div className="mt-2 ml-8">
                            <GodotLink link="/jvms/service-provider" title="Service Provider" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="mt-2 ml-8">
                            <GodotLink link="/jvms/non-pdl-visitors" title="Non-PDL Visitors" />
                        </div>
                    </div>
                </div>
                <div className="border border-gray-200 p-5 w-full shadow-sm hover:shadow-md rounded-md">
                    <Header title="VISITOR REGISTRATION" />
                    <div className="mt-2 ml-8">
                        <GodotLink link="visitor-registration" title="PDL Visitor" />
                        <GodotLink link="/jvms/service-provider/service-provider-registration" title="3rd Party Provider" />
                        <GodotLink link="non-pdl-visitor" title="Other Non-PDL Visitors" />
                    </div>
                </div>
                <div className="border border-gray-200 p-5 w-full shadow-sm hover:shadow-md rounded-md">
                    <Header title="ISSUES" />
                    <div className="mt-2 ml-8">
                        <GodotLink link="/jvms/issues/issue-type" title="Issue Type" />
                        <GodotLink link="/jvms/issues/issue-category" title="Issue Category" />
                        <GodotLink link="/jvms/issues/risk" title="Risks" />
                        <GodotLink link="/jvms/issues/risk-level" title="Risk Levels" />
                        <GodotLink link="/jvms/issues/impacts" title="Impacts" />
                        <GodotLink link="/jvms/issues/impact-level" title="Impact Levels" />
                        <GodotLink link="/jvms/issues/recommended-action" title="Recommended Actions" />
                    </div>
                </div>
                <div className="border col-span-3 border-gray-200 p-5 md:p-8 w-full shadow-sm hover:shadow-md rounded-md">
                    <Header title="MAINTENANCE" />
                    <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-5">
                        <div className="ml-8">
                            <GodotLink link="visitor-type" title="Types of Visitors" />
                            <GodotLink link="visitor-req-docs" title="Visitor Requirement Documents" />
                            <GodotLink link="visitor-relationship-to-pdl" title="Visitor Relationship to PDL" />
                            <GodotLink link="/jvms/issues" title="Issues and Findings" />
                        </div>
                        <div className="ml-8">
                            <h1 className="font-bold text-gray-700">3RD PARTY PROVIDER</h1>
                            <GodotLink link="/jvms/service-provider/service-provided" title="Service Provided" />
                            <GodotLink link="/jvms/maintenance/group-affiliation" title="Service Provider Group Affiliation" />
                            
                        </div>
                        <div className="ml-8">
                                <h1 className="font-bold text-gray-700">NON-PDL VISITOR</h1>
                            <GodotLink link="/jvms/non-pdl-visitors/visitor-relationship-personnel" title="Relationship (Visitor - Personnel)" />
                            <GodotLink link="/jvms/non-pdl-visitors/reason-for-visit" title="Reason for Visit" />
                            <GodotLink link="/jvms/non-pdl-visitors/non-pdl-visitor-type" title="Non-PDL Visitor Type" />
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Visitors
