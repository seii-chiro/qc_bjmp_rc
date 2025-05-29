import { GodotLink, Header } from "../assets/components/link"

const MainReport = () => {
    return (
        <div className="border border-gray-200 p-5 w-full md:w-96 shadow-sm hover:shadow-md rounded-md">
            <Header title="Reports"/>
            <div className="mt-2">
                <div className="ml-8">
                    <GodotLink link="dashboard-summary" title="Dashboard Summary" />
                    <GodotLink link="summary-count-of-PDL-visitors" title="Summary Count of PDL Visitors" />
                    <GodotLink link="summary-count-of-PDLs" title="Summary Count of PDLs" />
                    <GodotLink link="summary-count-of-personnel" title="Summary Count of Personnel" />
                </div>
            </div>
        </div>
    )
}

export default MainReport
