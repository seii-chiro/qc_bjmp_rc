import { getSummary_Card } from "@/lib/queries";
import { getVisitor } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";

const { Option } = Select;

const SummaryCount = () => {
    const token = useTokenStore().token;

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    const { data: visitorData } = useQuery({
        queryKey: ['visitor'],
        queryFn: () => getVisitor(token ?? "")
    });

    return (
        <div>
            <div className="mt-5 md:max-w-xl">
                <div>
                    <div className="flex flex-col gap-5">
                        <div>
                            <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Group By: Visitor Type</h1>
                            <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Visitor Type</th>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Senior Citizen</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Regular</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">PWD</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Pregnant Woman</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Minor</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ+</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + TRANSGENDER</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + LESBIAN / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + GAY / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr className="w-full border-t-2 border-gray-[#1E365D] h-1">
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">Total</td>
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Grouped By: Gender</h1>
                            <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Male</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Female</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + TRANSGENDER</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + LESBIAN / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + GAY / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">0</td>
                                        </tr>
                                        <tr className="w-full border-t-2 border-gray-[#1E365D] h-1">
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">Total</td>
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SummaryCount
