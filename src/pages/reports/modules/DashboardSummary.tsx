import { getSummary_Card } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";

const DashboardSummary = () => {
    const token = useTokenStore().token;

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    const visitorOtherCount = Object.entries(summarydata?.success?.visitor_based_on_gender?.Active || {})
        .filter(([key]) => key !== "Male" && key !== "Female")
        .reduce((total, [, value]) => total + (value ?? 0), 0);
    
    const personnelOtherCount = Object.entries(summarydata?.success?.personnel_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

    return (
        <div className="md:px-20">
            <h1 className="text-3xl font-bold text-[#1E365D]">BJMP Quezon City Jail - Male Dormitory</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-10">
                <div className="flex flex-col gap-5">
                    <fieldset className="border col-span-1 mt-2 border-gray-300 rounded-md p-4 h-fit">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of PDLs</legend>
                        <div className="px-20 flex flex-col gap-2">
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Released PDL</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Released?.Active || 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Hospitalized PDL</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Convicted PDL</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Committed PDL</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0}</p>
                            </div>
                            <div className="w-full bg-[#1E365D] h-1"></div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Jail Population</p>
                                <p className='px-2 font-bold text-[#1E365D]'>
                                    {summarydata?.success?.total_pdl_by_status?.Released?.Active +
                                    summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active +
                                    summarydata?.success?.total_pdl_by_status?.Convicted?.Active +
                                    summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0}
                                </p>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border col-span-1 mt-2 border-gray-300 rounded-md p-4 h-fit">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>PDL Count Based on their Gender</legend>
                        <div className="px-20 flex flex-col gap-2">
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Male</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Gay</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Transgender</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}</p>
                            </div>
                            <div className="w-full bg-[#1E365D] h-1"></div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                <p className='px-2 font-bold text-[#1E365D]'>
                                    {summarydata?.success?.pdls_based_on_gender?.Active?.Male +
                                    summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] +
                                    summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}
                                </p>
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="flex flex-col gap-5">
                    <fieldset className="border col-span-1 mt-2 border-gray-300 rounded-md p-4 h-fit">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Visitors</legend>
                        <div className="px-20 flex flex-col gap-2">
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Male</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.visitor_based_on_gender?.Active?.Male ?? 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Female</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.visitor_based_on_gender?.Active?.Female ?? 0 }</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Others</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{visitorOtherCount}</p>
                            </div>
                            <div className="w-full bg-[#1E365D] h-1"></div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                <p className='px-2 font-bold text-[#1E365D]'>
                                    {summarydata?.success?.visitor_based_on_gender?.Active?.Male +
                                    summarydata?.success?.visitor_based_on_gender?.Active?.Female +
                                    visitorOtherCount || 0}
                                </p>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border col-span-1 mt-2 border-gray-300 rounded-md p-4 h-fit">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Personnels</legend>
                        <div className="px-20 flex flex-col gap-2">
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Male</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.personnel_based_on_gender?.Active?.Male ?? 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Female</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.personnel_based_on_gender?.Active?.Female ?? 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Others</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{personnelOtherCount}</p>
                            </div>
                            <div className="w-full bg-[#1E365D] h-1"></div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                <p className='px-2 font-bold text-[#1E365D]'>
                                    {summarydata?.success?.visitor_based_on_gender?.Active?.Male +
                                    summarydata?.success?.visitor_based_on_gender?.Active?.Female +
                                    visitorOtherCount || 0}
                                </p>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border col-span-1 mt-2 border-gray-300 rounded-md p-4 h-fit">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>BJMP Personnel On and Off-Duty</legend>
                        <div className="px-20 flex flex-col gap-2">
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>On-Duty</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0}</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Off-Duty</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.visitor_based_on_gender?.Active?.Female ?? 0 }</p>
                            </div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>On-leave</p>
                                <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.visitor_based_on_gender?.Active?.Female ?? 0 }</p>
                            </div>
                            <div className="w-full bg-[#1E365D] h-1"></div>
                            <div className="flex items-center justify-between ">
                                <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                <p className='px-2 font-bold text-[#1E365D]'>
                                    {summarydata?.success?.visitor_based_on_gender?.Active?.Male +
                                    summarydata?.success?.visitor_based_on_gender?.Active?.Female +
                                    visitorOtherCount || 0}
                                </p>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div className="mt-5">
                <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Summary of Entry / Exit in Jail Premises</h1>
            </div>
        </div>
    )
}

export default DashboardSummary
