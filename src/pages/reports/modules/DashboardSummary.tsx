import { getSummary_Card, getUser } from "@/lib/queries";
import { getMainGate } from "@/lib/query";
// import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
// import { useState } from "react";
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logoBase64 from "../assets/logoBase64";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/urls";
pdfMake.vfs = pdfFonts.vfs;

const DashboardSummary = () => {
    const token = useTokenStore().token;
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    const [totalLoginsPDL, setTotalLoginsPDL] = useState(0);
    const [totalLogoutsPDL, setTotalLogoutsPDL] = useState(0);
    const [totalVisitsPDL, setTotalVisitsPDL] = useState(0);
    
    const [totalLoginsMainGate, setTotalLoginsMainGate] = useState(0);
    const [totalLogoutsMainGate, setTotalLogoutsMainGate] = useState(0);
    const [totalVisitsMainGate, setTotalVisitsMainGate] = useState(0);

    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState(currentYear.toString());
    const [endYear, setEndYear] = useState(currentYear.toString());

    const fetchSummary = async (visitType: string) => {
        const url = `${BASE_URL}/api/dashboard/summary-dashboard/get-quarterly-visitor-logs-summary`;
        const params = new URLSearchParams({
            visit_type: visitType,
            start_year: startYear,
            end_year: endYear,
        });

        const res = await fetch(`${url}?${params.toString()}`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    useEffect(() => {
        const getSummaries = async () => {
            try {
                const pdlData = await fetchSummary('PDLStationVisit');
                const mainGateData = await fetchSummary('MainGateVisit');

                // Process PDL Station Visit Data
                const pdlSummary = pdlData.success.quarterly_visitor_logs_summary;
                setTotalLoginsPDL(Object.values(pdlSummary).reduce((total, item) => total + (item.logins || 0), 0));
                setTotalLogoutsPDL(Object.values(pdlSummary).reduce((total, item) => total + (item.logouts || 0), 0));
                setTotalVisitsPDL(Object.values(pdlSummary).reduce((total, item) => total + (item.total_visits || 0), 0));

                // Process Main Gate Visit Data
                const mainGateSummary = mainGateData.success.quarterly_visitor_logs_summary;
                setTotalLoginsMainGate(Object.values(mainGateSummary).reduce((total, item) => total + (item.logins || 0), 0));
                setTotalLogoutsMainGate(Object.values(mainGateSummary).reduce((total, item) => total + (item.logouts || 0), 0));
                setTotalVisitsMainGate(Object.values(mainGateSummary).reduce((total, item) => total + (item.total_visits || 0), 0));

            } catch (error) {
                console.error("Error fetching summaries:", error);
            }
        };

        getSummaries();
    }, [startYear, endYear, token]);

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const fetchOrganization = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/organizations/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: organizationData } = useQuery({
        queryKey: ['org'],
        queryFn: fetchOrganization,
    });

    useEffect(() => {
        if (organizationData?.results?.length > 0) {
            setOrganizationName(organizationData.results[0]?.org_name ?? '');
        }
    }, [organizationData]);

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
            { "BJMP Personnel On and Off-Duty": "On-Leave", "Total": summarydata?.success.personnel_count_by_status.Active["Sick Leave"] + summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] + summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] + summarydata?.success.personnel_count_by_status.Active["Absent Without Leave"] || 0 },
            { "BJMP Personnel On and Off-Duty": "Total", "Total": (
                (summarydata?.success.personnel_count_by_status.Active["Sick Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Vacation Leave"]  || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0) + (summarydata?.success.personnel_count_by_status.Active["Absent Without Leave"] || 0)
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
            Entry: totalLoginsPDL,
            Exit: totalLogoutsPDL,
            Balance: totalVisitsPDL,
        },
        {
            "Summary of Entry / Exit in Jail Premises": "Visitors",
            Entry: totalLoginsMainGate,
            Exit: totalLogoutsMainGate,
            Balance: totalVisitsMainGate,
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
        XLSX.utils.book_append_sheet(workbook, summaryEntryExitWorksheet, 'Entry or Exit in Jail Premises');

        XLSX.writeFile(workbook, 'DashboardSummary.xlsx');
    };

    const generatePDF = async (summarydata, visitorOtherCount, personnelOtherCount, totalLoginsPDL, totalLogoutsPDL, totalVisitsPDL, totalLoginsMainGate, totalLogoutsMainGate, totalVisitsMainGate) => {
        const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : '';
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;

        const pdlBody = [
            [ "PDL Type", "Total"],
            [ "Released PDL", summarydata?.success?.total_pdl_by_status?.Released?.Active || 0],
            [ "Hospitalized PDL", summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0],
            [ "Convicted PDL", summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0],
            ["Committed PDL", summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0],
            [ "Jail Population", (
                (summarydata?.success?.total_pdl_by_status?.Released?.Active || 0) +
                (summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0) +
                (summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0) +
                (summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0)
            )]
        ];

        const genderBody = [
            ["PDL Count Based on Gender", "Total"],
            ["Male", summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0],
            ["Gay", summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0],
            ["Transgender", summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0],
            ["Total", (
                (summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0) +
                (summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0) +
                (summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0)
            )]
        ];

        const visitorBody = [
            ["Summary of Visitors", "Total"],
            ["Male", summarydata?.success?.visitor_based_on_gender?.Active?.Male || 0],
            ["Female", summarydata?.success?.visitor_based_on_gender?.Active?.Female || 0],
            ["Others", visitorOtherCount || 0],
            ["Total", (
                (summarydata?.success?.visitor_based_on_gender?.Active?.Male || 0) +
                (summarydata?.success?.visitor_based_on_gender?.Active?.Female || 0) +
                (visitorOtherCount || 0)
            )]
        ];

        const personnelBody = [
            ["Summary of Personnels", "Total"],
            ["Male", summarydata?.success?.personnel_based_on_gender?.Active?.Male || 0],
            ["Female", summarydata?.success?.personnel_based_on_gender?.Active?.Female || 0],
            ["Others", personnelOtherCount || 0],
            ["Total", (
                (summarydata?.success?.personnel_based_on_gender?.Active?.Male || 0) +
                (summarydata?.success?.personnel_based_on_gender?.Active?.Female || 0) +
                (personnelOtherCount || 0)
            )]
        ];

        const dutyBody = [
            ["BJMP Personnel On and Off-Duty", "Total"],
            ["On-Duty", summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0],
            ["Off-Duty", summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0],
            ["On-Leave", (
                summarydata?.success.personnel_count_by_status.Active["Sick Leave"] +
                summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] +
                summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] +
                summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] +
                summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0
            )],
            ["Total", (
                (summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Sick Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] || 0) +
                (summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0)
            )]
        ];

        const entryExitBody = [
            ["Particulars", "Entry", "Exit", "Balance"],
            ["PDLs", totalLoginsPDL, totalLogoutsPDL, totalVisitsPDL],
            ["Visitors", totalLoginsMainGate, totalLogoutsMainGate, totalVisitsMainGate],
            ["BJMP Personnel", 0, 0, 0],
            ["Service Providers", 0, 0, 0],
            ["Non-Registered Visitors", 0, 0, 0],
        ];

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: [
                {
                    text: 'Dashboard Summary Report',
                    style: 'header',
                    alignment: 'left',
                    margin: [0, 0, 0, 10],
                },
                {
                    columns: [
                        {
                            stack: [
                                {
                                    text: organizationName,
                                    style: 'subheader',
                                    margin: [0, 5, 0, 10],
                                },
                                {
                                    text: [
                                        { text: `Report Date: `, bold: true },
                                        formattedDate + '\n',
                                        { text: `Prepared By: `, bold: true },
                                        preparedByText + '\n',
                                        { text: `Department/Unit: `, bold: true },
                                        'IT\n',
                                        { text: `Report Reference No.: `, bold: true },
                                        reportReferenceNo,
                                    ],
                                    fontSize: 10,
                                },
                            ],
                            alignment: 'left',
                            width: '70%',
                        },
                        {
                            stack: [
                                {
                                    image: logoBase64,
                                    width: 90,
                                },
                            ],
                            alignment: 'right',
                            width: '30%',
                        },
                    ],
                    margin: [0, 0, 0, 10],
                },
                createStyledTable('PDL Summary', pdlBody),
                createStyledTable('PDL Count Based on Gender', genderBody),
                createStyledTable('Summary of Visitors', visitorBody),
                createStyledTable('Summary of Personnels', personnelBody),
                createStyledTable('BJMP Personnel On and Off-Duty', dutyBody),
                createStyledTable('Summary of Entry / Exit in Jail Premises', entryExitBody),
            ],
            
            footer: (currentPage: number, pageCount: number) => ({
                    columns: [
                        {
                            text: `Document Version: 1.0\nConfidentiality Level: Internal use only\nContact Info: ${preparedByText}\nTimestamp of Last Update: ${formattedDate}`,
                            fontSize: 8,
                            alignment: 'left',
                            margin: [40, 10],
                        },
                        {
                            text: `${currentPage} / ${pageCount}`,
                            fontSize: 8,
                            alignment: 'right',
                            margin: [0, 10, 40, 0],
                        },
                    ],
                }),
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    color: '#1E365D',
                },
                subheader: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 10, 0, 5],
                },
                tableExample: {
                    margin: [0, 5, 0, 15],
                    fontSize: 8,
                },
            },
        };

        pdfMake.createPdf(docDefinition).download(`DashboardSummary_${formattedDate}.pdf`);
    };

const createStyledTable = (title, body) => {
    if (!Array.isArray(body) || body.length === 0) {
        return {
            stack: [
                { text: title, style: 'subheader', margin: [0, 20, 0, 5] },
                { text: "No data available", fontSize: 9, italics: true }
            ]
        };
    }

    return {
        stack: [
            {
                text: title,
                style: 'subheader',
                margin: [0, 20, 0, 5],
            },
            {
                table: {
                    headerRows: 1,
                    widths: Array(body[0].length).fill('*'),
                    body: body,
                },
                layout: {
                    fillColor: (rowIndex) => (rowIndex === 0 ? '#DCE6F1' : null),
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#aaa',
                    vLineColor: () => '#aaa',
                    paddingLeft: () => 4,
                    paddingRight: () => 4,
                },
                fontSize: 9
            }
        ]
    };
};


    return (
        <div className="rounded-md w-full px-5 md:px-10 lg:px-32 md:py-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#1E365D]">BJMP Quezon City Jail - Male Dormitory</h1>
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
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success.personnel_count_by_status.Active["Sick Leave"] + summarydata?.success.personnel_count_by_status.Active["Vacation Leave"] + summarydata?.success.personnel_count_by_status.Active["Maternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Paternity Leave"] + summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] + summarydata?.success.personnel_count_by_status.Active["Absent Without Leave"] || 0}</td>
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
                                        (summarydata?.success.personnel_count_by_status.Active["Compensatory Leave"] || 0) + (summarydata?.success.personnel_count_by_status.Active["Absent Without Leave"] || 0)
                                    )}</td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div className="mt-5 w-full mb-5">
                <fieldset className="border border-gray-300 rounded-md p-4 mt-2 shadow-md">
                    <legend className='px-2 font-bold text-lg text-[#1E365D]'>Summary of Entry / Exit in Jail Premises</legend>
                    <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                                    <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                                    <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                                    <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">PDLs</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">{totalLoginsPDL}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">{totalLogoutsPDL}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">{totalVisitsPDL}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">Visitors</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">{totalLoginsMainGate}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">{totalLogoutsMainGate}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">{totalVisitsMainGate}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">BJMP Personnel</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">Service Providers</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">Non-Registered Visitors</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-lg">0</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </fieldset>
            </div>
            <div className="flex justify-end gap-5">
                <button className="bg-[#1E365D] p-2 rounded-md text-white" onClick={() => exportToExcel(summarydata, visitorOtherCount, personnelOtherCount, totalLoginsPDL, totalLogoutsPDL, totalVisitsPDL, totalLoginsMainGate, totalLogoutsMainGate, totalVisitsMainGate)}>
                    Download Excel
                </button>
                <button className="bg-[#1E365D] p-2 rounded-md text-white" onClick={() => generatePDF(summarydata, visitorOtherCount, personnelOtherCount, totalLoginsPDL, totalLogoutsPDL, totalVisitsPDL, totalLoginsMainGate, totalLogoutsMainGate, totalVisitsMainGate)}>
    Download PDF
</button>
            </div>
        </div>
    )
}

export default DashboardSummary