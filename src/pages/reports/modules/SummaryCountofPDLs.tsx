import { getSummary_Card } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";

const SummaryCountofPDLs = () => {
    const token = useTokenStore().token;
    
    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    return (
        <div className='flex gap-5 flex-col'>
            <div className="mt-5 md:max-w-lg">
                <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>Summary Count of PDLs</h1>
                <div>
                <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                        <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r">Summary Count of PDLs</th>
                        <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Released PDL</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.total_pdl_by_status?.Released?.Active || 0}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Hospitalized PDL</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Convicted PDL</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Committed PDL</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{summarydata?.success?.total_pdl_by_status?.Released?.Active +
                                        summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active +
                                        summarydata?.success?.total_pdl_by_status?.Convicted?.Active +
                                        summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            <div className="mt-5 md:max-w-lg">
                <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>PDL Count Based on their Gender</h1>
                <div>
                <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                        <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r">PDL Count Based on their Gender</th>
                        <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Male</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Gay</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Transgender</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                            <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{summarydata?.success?.pdls_based_on_gender?.Active?.Male +
                                        summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] +
                                        summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
    )
}

export default SummaryCountofPDLs
