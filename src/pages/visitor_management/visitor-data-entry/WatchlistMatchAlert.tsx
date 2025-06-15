/* eslint-disable @typescript-eslint/no-explicit-any */

import { AlertTriangle, Globe, User, Users } from "lucide-react"
import { GiLinkedRings } from "react-icons/gi";

type Props = {
    watchlistData: any,
    icao: string
}

const WatchlistMatchAlert = ({ watchlistData, icao }: Props) => {
    return (
        <div className="mt-8 max-w-6xl mx-auto">
            {/* Alert Header */}
            <div className="bg-red-600 text-white p-4 rounded-t-lg border-l-4 border-red-800">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-red-200" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            SECURITY ALERT: Biometric Match Found
                        </h1>
                        <p className="text-red-100 mt-1">
                            Facial recognition match detected in watchlist database
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg shadow-lg">
                <div className="p-6">
                    <div className="flex gap-8">

                        {/* Visitor Image Section */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                <User className="w-5 h-5" />
                                <h2 className="text-lg">Current Scanned Person</h2>
                            </div>
                            <div className="border border-gray-300 rounded-lg p-4">
                                <div className="w-full h-[31.3rem] bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                    <img
                                        src={`data:image/bmp;base64,${icao}`}
                                        alt={`Visitor Image`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Watchlist Match Section */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <h2 className="text-lg">Watchlist Match</h2>
                            </div>

                            <div className="border border-gray-300 rounded-lg p-4">
                                {/* Watchlist Image */}
                                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 mb-4">
                                    <img
                                        src={`data:image/bmp;base64,${watchlistData?.[0]?.biometric?.data}`}
                                        alt="Watchlist Match"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Person Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                            <User className="w-4 h-4" />
                                            Full Name
                                        </label>
                                        <input
                                            readOnly
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-semibold text-lg"
                                            value={`${watchlistData?.[0]?.biometric?.person_data?.first_name ?? ""} ${watchlistData?.[0]?.biometric?.person_data?.middle_name ?? ""} ${watchlistData?.[0]?.biometric?.person_data?.last_name ?? ""}`.trim()}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                            <Globe className="w-4 h-4" />
                                            Nationality
                                        </label>
                                        <input
                                            readOnly
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-medium"
                                            value={watchlistData?.[0]?.biometric?.person_data?.nationality ?? ""}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                <Users className="w-4 h-4" />
                                                Gender
                                            </label>
                                            <input
                                                readOnly
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-medium"
                                                value={watchlistData?.[0]?.biometric?.person_data?.gender?.gender_option ?? ""}
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                <GiLinkedRings className="w-4 h-4" />
                                                Civil Status
                                            </label>
                                            <input
                                                readOnly
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-medium"
                                                value={watchlistData?.[0]?.biometric?.person_data?.civil_status ?? ""}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className="mt-8 flex justify-center gap-4">
                        <button className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                            File an issue
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default WatchlistMatchAlert