import { GodotLink, Header } from "../assets/components/link"

const MainReport = () => {
    return (
        <div className="flex flex-col gap-5">
            <div className="border border-gray-200 p-5 w-full md:w-96 shadow-sm hover:shadow-md rounded-md">
                <Header title="Summary Reports"/>
                <div className="mt-2">
                    <div className="ml-8">
                        <GodotLink link="dashboard-summary" title="Dashboard Summary" />
                        <GodotLink link="summary-count-of-PDL-visitors" title="Summary Count of PDL Visitors" />
                        <GodotLink link="summary-count-of-PDLs" title="Summary Count of PDLs" />
                        <GodotLink link="summary-count-of-personnel" title="Summary Count of Personnel" />
                    </div>
                </div>
            </div>
            <div className="border border-gray-200 p-5 w-full md:w-96 shadow-sm hover:shadow-md rounded-md">
                <Header title="Lists"/>
                <div className="mt-2">
                    <div className="ml-8">
                        <GodotLink link="list-of-pdl-visitor" title="PDL Visitors" />
                        <GodotLink link="list-of-personnel" title="Personnel" />
                        <GodotLink link="list-of-pdls" title="PDLs" />
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default MainReport
