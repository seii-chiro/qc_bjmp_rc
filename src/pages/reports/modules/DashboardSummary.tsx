import { getSummary_Card } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
// import { useState } from "react";
import * as XLSX from 'xlsx';

const DashboardSummary = () => {
    const token = useTokenStore().token;
    // const [isFormChanged, setIsFormChanged] = useState(false);

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    const fetchVisitorLogs = async () => {
        const res = await fetch(`${BASE_URL}/api/dashboard/summary-dashboard/get-quarterly-visitor-logs-summary/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: visitorLogsData } = useQuery({
        queryKey: ['visitor-log'],
        queryFn: fetchVisitorLogs,
    });

    const visitorOtherCount = Object.entries(summarydata?.success?.visitor_based_on_gender?.Active || {})
        .filter(([key]) => key !== "Male" && key !== "Female")
        .reduce((total, [, value]) => total + (value ?? 0), 0);
    
    const personnelOtherCount = Object.entries(summarydata?.success?.personnel_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

    const exportToExcel = (summarydata, visitorOtherCount, personnelOtherCount) => {
        const pdlData = [
            { "Summary of PDLs": "", "Total": "" },
            { "Summary of PDLs": "Released PDL", "Total": summarydata?.success?.total_pdl_by_status?.Released?.Active || 0 },
            { "Summary of PDLs": "Hospitalized PDL", "Total": summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0 },
            { "Summary of PDLs": "Convicted PDL", "Total": summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0 },
            { "Summary of PDLs": "Committed PDL", "Total": summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0 },
            { "Summary of PDLs": "Jail Population", "Total": (
                (summarydata?.success?.total_pdl_by_status?.Released?.Active || 0) +
                (summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0) +
                (summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0) +
                (summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0)
            ) }
        ];

        const genderData = [
            { "PDL Count Based on Gender": "", "Total": "" },
            { "PDL Count Based on Gender": "Male", "Total": summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0 },
            { "PDL Count Based on Gender": "Gay", "Total": summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0 },
            { "PDL Count Based on Gender": "Transgender", "Total": summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0 },
            { "PDL Count Based on Gender": "Total", "Total": (
                (summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0) +
                (summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0) +
                (summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0)
            ) }
        ];

        const workbook = XLSX.utils.book_new();
        const pdlWorksheet = XLSX.utils.json_to_sheet(pdlData);
        const genderWorksheet = XLSX.utils.json_to_sheet(genderData);

        XLSX.utils.book_append_sheet(workbook, pdlWorksheet, 'Summary of PDLs');
        XLSX.utils.book_append_sheet(workbook, genderWorksheet, 'PDL Count Based on Gender');

        XLSX.writeFile(workbook, 'PDL_Summary.xlsx');
    };

    return (
        <div className="mx-auto border border-gray-200 rounded-md w-full md:max-w-7xl p-5 md:px-10 md:py-5">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-[#1E365D]">BJMP Quezon City Jail - Male Dormitory</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-10">
                <div className="flex flex-col gap-5">
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of PDLs</legend>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <div className="flex flex-col divide-y divide-gray-200">
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Released PDL</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Released?.Active || 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Hospitalized PDL</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Convicted PDL</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Committed PDL</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0}</p>
                                </div>
                                {/* Divider for total */}
                                <div className="w-full bg-[#1E365D] h-1"></div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Jail Population</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>
                                        {summarydata?.success?.total_pdl_by_status?.Released?.Active +
                                        summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active +
                                        summarydata?.success?.total_pdl_by_status?.Convicted?.Active +
                                        summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>PDL Count Based on their Gender</legend>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <div className="flex flex-col divide-y divide-gray-200">
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Male</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Gay</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Transgender</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}</p>
                                </div>
                                <div className="w-full bg-[#1E365D] h-1"></div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>
                                        {summarydata?.success?.pdls_based_on_gender?.Active?.Male +
                                        summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] +
                                        summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}
                                    </p>
                                </div>
                            </div>
                            
                        </div>
                    </fieldset>
                </div>
                <div className="flex flex-col gap-5">
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Visitors</legend>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <div className="flex flex-col divide-y divide-gray-200">
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Male</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.visitor_based_on_gender?.Active?.Male ?? 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Female</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.visitor_based_on_gender?.Active?.Female ?? 0 }</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Others</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{visitorOtherCount}</p>
                                </div>
                                <div className="w-full bg-[#1E365D] h-1"></div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>
                                        {summarydata?.success?.visitor_based_on_gender?.Active?.Male +
                                        summarydata?.success?.visitor_based_on_gender?.Active?.Female +
                                        visitorOtherCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                    </fieldset>
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Personnels</legend>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <div className="flex flex-col divide-y divide-gray-200">
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Male</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.personnel_based_on_gender?.Active?.Male ?? 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Female</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success?.personnel_based_on_gender?.Active?.Female ?? 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>Others</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{personnelOtherCount}</p>
                                </div>
                                <div className="w-full bg-[#1E365D] h-1"></div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>
                                        {summarydata?.success?.personnel_based_on_gender?.Active?.Male +
                                        summarydata?.success?.personnel_based_on_gender?.Active?.Female +
                                        personnelOtherCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                    </fieldset>
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>BJMP Personnel On and Off-Duty</legend>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <div className="flex flex-col divide-y divide-gray-200">
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>On-Duty</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Off-Duty</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0}</p>
                                </div>
                                <div className="flex items-center justify-between py-2 px-8 bg-gray-100">
                                    <p className='px-2 font-bold text-[#1E365D]'>On-Leave</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>{summarydata?.success.personnel_count_by_status.Active["Sick Leave"] + summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] + summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0}</p>
                                </div>
                                <div className="w-full bg-[#1E365D] h-1"></div>
                                <div className="flex items-center justify-between py-2 px-8">
                                    <p className='px-2 font-bold text-[#1E365D]'>Total</p>
                                    <p className='px-2 font-bold text-[#1E365D]'>
                                        {(
                                            (summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0) +
                                            (summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0) +
                                            (summarydata?.success.personnel_count_by_status.Active["Sick Leave"] || 0) +
                                            (summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] || 0) +
                                            (summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] || 0) +
                                            (summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] || 0) +
                                            (summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0)
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div className="mt-5 md:max-w-3xl">
                <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Summary of Entry / Exit in Jail Premises</h1>
                <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-2 whitespace-nowrap">PDLs</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 whitespace-nowrap">Visitors</td>
                                <td className="px-6 py-2 whitespace-nowrap">{visitorLogsData?.success?.quarterly_visitor_logs_summary?.logins || 0}</td>
                                <td className="px-6 py-2 whitespace-nowrap">{visitorLogsData?.success?.quarterly_visitor_logs_summary?.logouts || 0}</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 whitespace-nowrap">BJMP Personnel</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 whitespace-nowrap">Service Providers</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 whitespace-nowrap">Non-Registered Visitors</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                                <td className="px-6 py-2 whitespace-nowrap">0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex justify-end gap-5">
                <button className="bg-[#1E365D] p-2 rounded-md text-white" onClick={() => exportToExcel(summarydata, visitorOtherCount, personnelOtherCount)}>
                    Download Excel
                </button>
                <button className="bg-[#1E365D] p-2 rounded-md text-white">
                    Download PDF
                </button>
            </div>
        </div>
    )
}

export default DashboardSummary