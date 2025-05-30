import { getSummary_Card } from "@/lib/queries";
import { getMainGate } from "@/lib/query";
// import { BASE_URL } from "@/lib/urls";
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

    const { data: maingatedata } = useQuery({
        queryKey: ['main-gate'],
        queryFn: () => getMainGate(token ?? "")
    });

    const visitorOtherCount = Object.entries(summarydata?.success?.visitor_based_on_gender?.Active || {})
        .filter(([key]) => key !== "Male" && key !== "Female")
        .reduce((total, [, value]) => total + (value ?? 0), 0);
    
    const personnelOtherCount = Object.entries(summarydata?.success?.personnel_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

    const exportToExcel = (summarydata, visitorOtherCount, personnelOtherCount, InCount, OutCount) => {
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

        const summaryVisitorData = [
            { "Summary of Visitors": "", "Total": "" },
            { "Summary of Visitors": "Male", "Total": summarydata?.success?.visitor_based_on_gender?.Active?.Male || 0 },
            { "Summary of Visitors": "Female", "Total": summarydata?.success?.visitor_based_on_gender?.Active?.Female || 0 },
            { "Summary of Visitors": "Others", "Total": visitorOtherCount || 0 },
            { "Summary of Visitors": "Total", "Total": (
                (summarydata?.success?.visitor_based_on_gender?.Active?.Male || 0) +
                (summarydata?.success?.visitor_based_on_gender?.Active?.Female  || 0) +
                (visitorOtherCount || 0)
            ) }
        ];

        const summaryPersonnelData = [
            { "Summary of Personnels": "", "Total": "" },
            { "Summary of Personnels": "Male", "Total": summarydata?.success?.personnel_based_on_gender?.Active?.Male || 0 },
            { "Summary of Personnels": "Female", "Total": summarydata?.success?.personnel_based_on_gender?.Active?.Female || 0 },
            { "Summary of Personnels": "Others", "Total": visitorOtherCount || 0 },
            { "Summary of Personnels": "Total", "Total": (
                (summarydata?.success?.personnel_based_on_gender?.Active?.Male || 0) +
                (summarydata?.success?.personnel_based_on_gender?.Active?.Female  || 0) +
                (personnelOtherCount || 0)
            ) }
        ];

        const summaryBJMPDutyData = [
            { "BJMP Personnel On and Off-Duty": "", "Total": "" },
            { "BJMP Personnel On and Off-Duty": "On-Duty", "Total": summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0 },
            { "BJMP Personnel On and Off-Duty": "Off-Duty", "Total": summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0 },
            { "BJMP Personnel On and Off-Duty": "On-Leave", "Total": summarydata?.success.personnel_count_by_status.Active["Sick Leave"] + summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] + summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0 },
            { "BJMP Personnel On and Off-Duty": "Total", "Total": (
                (summarydata?.success.personnel_count_by_status.Active["Sick Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Vacation Leave"]  || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0)
            ) }
        ];

        const SummaryofEntryExitinJailPremisesData = [
        {
            "Summary of Entry / Exit in Jail Premises": "Particulars",
            Entry: "Entry",
            Exit: "Exit",
            Balance: "Balance",
        },
        {
            "Summary of Entry / Exit in Jail Premises": "PDLs",
            Entry: 0,
            Exit: 0,
            Balance: 0,
        },
        {
            "Summary of Entry / Exit in Jail Premises": "Visitors",
            Entry: InCount || 0,
            Exit: OutCount || 0,
            Balance: (InCount || 0) - (OutCount || 0),
        },
        {
            "Summary of Entry / Exit in Jail Premises": "BJMP Personnel",
            Entry: 0,
            Exit: 0,
            Balance: 0,
        },
        {
            "Summary of Entry / Exit in Jail Premises": "Service Providers",
            Entry: 0,
            Exit: 0,
            Balance: 0,
        },
        {
            "Summary of Entry / Exit in Jail Premises": "Non-Registered Visitors",
            Entry: 0,
            Exit: 0,
            Balance: 0,
        },
        ];

        const workbook = XLSX.utils.book_new();
        const pdlWorksheet = XLSX.utils.json_to_sheet(pdlData);
        const genderWorksheet = XLSX.utils.json_to_sheet(genderData);
        const summaryVisitorWorksheet = XLSX.utils.json_to_sheet(summaryVisitorData);
        const summaryPersonnelWorksheet = XLSX.utils.json_to_sheet(summaryPersonnelData);
        const summaryBJMPDutyWorksheet = XLSX.utils.json_to_sheet(summaryBJMPDutyData);
        const summaryEntryExitWorksheet = XLSX.utils.json_to_sheet(SummaryofEntryExitinJailPremisesData);

        XLSX.utils.book_append_sheet(workbook, pdlWorksheet, 'Summary of PDLs');
        XLSX.utils.book_append_sheet(workbook, genderWorksheet, 'PDL Count Based on Gender');
        XLSX.utils.book_append_sheet(workbook, summaryVisitorWorksheet, 'Summary of Visitors');
        XLSX.utils.book_append_sheet(workbook, summaryPersonnelWorksheet, 'Summary of Personnels');
        XLSX.utils.book_append_sheet(workbook, summaryBJMPDutyWorksheet, 'BJMP Personnel On and Off-Duty');
        XLSX.utils.book_append_sheet(workbook, summaryEntryExitWorksheet, 'Summary of Entry / Exit in Jail Premises');

        XLSX.writeFile(workbook, 'DashboardSummary.xlsx');
    };

    const InCount = maingatedata?.results?.filter(log => log.status === "In").length || 0;
    const OutCount = maingatedata?.results?.filter(log => log.status === "Out").length || 0;

    return (
        <div className="rounded-md w-full p-5 md:px-10 md:py-5">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-[#1E365D]">BJMP Quezon City Jail - Male Dormitory</h1>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-10">
                    <div className="flex flex-col gap-5">
                        <div className="">
                            <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                                <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary Count of PDLs</legend>
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
                            </fieldset>
                        </div>
                    <div className="mt-5 ">
                        <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                            <legend className='px-2 font-bold text-lg text-[#1E365D]'>PDL Count Based on their Gender</legend>
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
                        </fieldset>
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Visitors</legend>
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
                                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.visitor_based_on_gender?.Active?.Male ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Female</td>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.visitor_based_on_gender?.Active?.Female ?? 0 }</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Others</td>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap">{visitorOtherCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{summarydata?.success?.visitor_based_on_gender?.Active?.Male +
                                        summarydata?.success?.visitor_based_on_gender?.Active?.Female +
                                        visitorOtherCount || 0}</td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                    </fieldset>
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Personnels</legend>
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
                                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.personnel_based_on_gender?.Active?.Male ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Female</td>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.personnel_based_on_gender?.Active?.Female ?? 0 }</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Others</td>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap">{personnelOtherCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                                            <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{summarydata?.success?.personnel_based_on_gender?.Active?.Male +
                                        summarydata?.success?.personnel_based_on_gender?.Active?.Female +
                                        personnelOtherCount || 0}</td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                    </fieldset>
                    <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                        <legend className='px-2 font-bold text-lg text-[#1E365D]'>BJMP Personnel On and Off-Duty</legend>
                        <div>
                        <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r">BJMP Personnel On and Off-Duty</th>
                                <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r">On-Duty</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Off-Duty</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r">On-Leave</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success.personnel_count_by_status.Active["Sick Leave"] + summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] + summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{(
                                        (summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0) +
                                        (summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0) +
                                        (summarydata?.success.personnel_count_by_status.Active["Sick Leave"] || 0) +
                                        (summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] || 0) +
                                        (summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] || 0) +
                                        (summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] || 0) +
                                        (summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0)
                                    )}</td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div className="mt-5 md:max-w-4xl">
                <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                    <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Entry / Exit in Jail Premises</legend>
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
                                    <td className="px-6 py-2 whitespace-nowrap">{InCount}</td>
                                    <td className="px-6 py-2 whitespace-nowrap">{OutCount}</td>
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
                </fieldset>
            </div>
            <div className="flex justify-end gap-5">
                <button className="bg-[#1E365D] p-2 rounded-md text-white" onClick={() => exportToExcel(summarydata, visitorOtherCount, personnelOtherCount, InCount, OutCount)}>
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