import { getSummary_Card, getUser } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/urls";
import logoBase64 from "../assets/logoBase64";
// import logoBase64 from "../../assets/logoBase64";
pdfMake.vfs = pdfFonts.vfs;

const SummaryCountofPDLs = () => {
    const token = useTokenStore().token;
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');

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

     const exportPDLSummaryToExcel = (summaryData: any) => {
        const pdlSummary = [
            ["Summary Count of PDLs", "Total"],
            ["Released PDL", summaryData?.total_pdl_by_status?.Released?.Active || 0],
            ["Hospitalized PDL", summaryData?.total_pdl_by_status?.Hospitalized?.Active || 0],
            ["Convicted PDL", summaryData?.total_pdl_by_status?.Convicted?.Active || 0],
            ["Committed PDL", summaryData?.total_pdl_by_status?.Committed?.Active || 0],
            ["Total",
            (summaryData?.total_pdl_by_status?.Released?.Active || 0) +
            (summaryData?.total_pdl_by_status?.Hospitalized?.Active || 0) +
            (summaryData?.total_pdl_by_status?.Convicted?.Active || 0) +
            (summaryData?.total_pdl_by_status?.Committed?.Active || 0)
            ]
        ];

        const genderSummary = [
            ["PDL Count Based on Gender", "Total"],
            ["Male", summaryData?.pdls_based_on_gender?.Active?.Male || 0],
            ["Gay", summaryData?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0],
            ["Transgender", summaryData?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0],
            ["Total",
            (summaryData?.pdls_based_on_gender?.Active?.Male || 0) +
            (summaryData?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0) +
            (summaryData?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0)
            ]
        ];

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.aoa_to_sheet(pdlSummary);
        const ws2 = XLSX.utils.aoa_to_sheet(genderSummary);

        XLSX.utils.book_append_sheet(wb, ws1, "PDL Summary");
        XLSX.utils.book_append_sheet(wb, ws2, "Gender Summary");

        XLSX.writeFile(wb, "PDL_Summary_Report.xlsx");
        };

    const exportPDLSummaryWithPdfMake = (summary: any) => {
        const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : '';
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;

        const released = summary?.total_pdl_by_status?.Released?.Active || 0;
        const hospitalized = summary?.total_pdl_by_status?.Hospitalized?.Active || 0;
        const convicted = summary?.total_pdl_by_status?.Convicted?.Active || 0;
        const committed = summary?.total_pdl_by_status?.Committed?.Active || 0;
        const totalPDL = released + hospitalized + convicted + committed;

        const male = summary?.pdls_based_on_gender?.Active?.Male || 0;
        const gay = summary?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0;
        const transgender = summary?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0;
        const totalGender = male + gay + transgender;

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: [
            {
                text: 'Summary Count of PDLs Report',
                style: 'header',
                alignment: 'left',
                margin: [0, 0, 0, 0],
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
            { text: "\nSummary Count of PDLs", style: "subheader" },
            {
                table: {
                    widths: ["*", "auto"],
                    body: [
                    [
                        { text: "Summary Count of PDLs", bold: true },
                        { text: "Total", bold: true }
                    ],
                    ["Released PDL", released],
                    ["Hospitalized PDL", hospitalized],
                    ["Convicted PDL", convicted],
                    ["Committed PDL", committed],
                    [
                        { text: "Total", bold: true },
                        { text: totalPDL, bold: true }
                    ]
                    ]
                }
            },
            { text: "\nPDL Count Based on Gender", style: "subheader" },
            {
                table: {
                widths: ["*", "auto"],
                body: [
                    [
                        {text: "PDL Count Based on Gender", bold: true},
                        {text: "Total", bold: true}],
                    ["Male", male],
                    ["Gay", gay],
                    ["Transgender", transgender],
                    [
                        {text: "Total", bold: true},
                        {text: totalGender, bold: true}
                    ],
                ],
                },
            },
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
                fontSize: 18,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 20],
            },
            subheader: {
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 5],
                color: "#1E365D",
            },
            },
            defaultStyle: {
            fontSize: 11,
            },
            pageMargins: [40, 60, 40, 60],
        };

        pdfMake.createPdf(docDefinition).download("PDL_Summary_Report.pdf");
    };
    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className='flex justify-between items-center my-5'>
                <div className='border border-gray-100 rounded-md p-5 flex flex-col w-80'>
                    <h1 className="font-semibold">Total Count of PDL</h1>
                    <div className="font-extrabold text-2xl flex ml-auto text-[#1E365D]">
                        {summarydata?.success?.person_count_by_status?.pdl?.Active ?? 0}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={exportPDLSummaryToExcel}
                        className="bg-[#1E365D] text-white px-4 py-2 rounded"
                    >
                        Export to Excel
                    </button>
                    <button
                        onClick={exportPDLSummaryWithPdfMake}
                        className="bg-[#1E365D] text-white px-4 py-2 rounded"
                    >
                        Export to PDF
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-10">
                {/* Summary Count of PDLs */}
                <div className="w-full ">
                    <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>Summary Count of PDLs</h1>
                    <div className="border border-gray-100 mt-2 rounded-md">
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
                                <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">
                                    {
                                        (summarydata?.success?.total_pdl_by_status?.Released?.Active || 0) +
                                        (summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active || 0) +
                                        (summarydata?.success?.total_pdl_by_status?.Convicted?.Active || 0) +
                                        (summarydata?.success?.total_pdl_by_status?.Committed?.Active || 0)
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                    
                </div>

                {/* PDL Count Based on Gender */}
                <div className="w-full">
                    <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>PDL Count Based on their Gender</h1>
                    <div className="border mt-2 border-gray-100 rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r">PDL Count Based on Gender</th>
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
                                <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                                <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">
                                    {
                                        (summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0) +
                                        (summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0) +
                                        (summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0)
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default SummaryCountofPDLs;
