import { GodotLink } from "../assets/components/link"
import { GiWantedReward } from "react-icons/gi";

const Threat = () => {
    return (
        <div className="flex flex-col gap-5 text-gray-700">
            <div className="w-96 border shadow-sm hover:shadow-md border-gray-200 p-5 rounded-md">
                <div className="flex gap-2 mb-2 items-center">
                    <GiWantedReward size={20} />
                    <p className="font-bold text text-lg">THREATS</p>
                </div>
                <GodotLink title="Watchlist" link="watch-list" />
                <GodotLink title="Watchlist Registration" link="watchlist_registration" />
                <GodotLink title="Watchlist Type" link="watchlist_types" />
                <GodotLink title="Watchlist Risk Level" link="watchlist_risk_level" />
                <GodotLink title="Watchlist Threat Level" link="watchlist_threat_level" />
            </div>
            {/* <div className="w-96 border shadow-sm hover:shadow-md border-gray-200 p-5 rounded-md">
                <NavLink to={"watchlist_registration"}>
                    <p className="ml-5 text-basee font-medium">Watchlist Registration</p>
                </NavLink>
            </div> */}
            {/* <div className="w-96 border shadow-sm hover:shadow-md border-gray-200 p-5 rounded-md">
                <NavLink to={""}>
                    <p className="ml-5 text-basee font-medium">Threat Profile</p>
                </NavLink>
            </div> */}
            <h1></h1>
        </div>
    )
}

export default Threat
