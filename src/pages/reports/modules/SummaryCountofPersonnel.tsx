import { getSummary_Card, getUser } from '@/lib/queries';
import { BASE_URL } from '@/lib/urls';
import { useTokenStore } from '@/store/useTokenStore';
import { useQuery } from '@tanstack/react-query';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import logoBase64 from '../assets/logoBase64';
// import logoBase64 from "../../assets/logoBase64";
pdfMake.vfs = pdfFonts.vfs;

const SummaryCountofPersonnel = () => {
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

  const personnelOtherCount = Object.entries(summarydata?.success?.personnel_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

  const exportPersonnelSummaryWithPdfMake = (summary: any) => {
  const personnelGender = summary?.personnel_based_on_gender?.Active || {};
  const otherCount = Object.entries(personnelGender)
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((sum, [, val]) => sum + (val ?? 0), 0);

  const male = personnelGender.Male || 0;
  const female = personnelGender.Female || 0;
  const totalGender = male + female + otherCount;

  const personnelStatus = summary?.personnel_count_by_status?.Active || {};
  const onDuty = personnelStatus["On Duty"] || 0;
  const offDuty = personnelStatus["Off Duty"] || 0;
  const onLeave =
    (personnelStatus["Sick Leave"] || 0) +
    (personnelStatus["Vacation Leave"] || 0) +
    (personnelStatus["Maternity Leave"] || 0) +
    (personnelStatus["Paternity Leave"] || 0) +
    (personnelStatus["Compensatory Leave"] || 0);

  const totalDuty =
    onDuty +
    offDuty +
    (personnelStatus["Sick Leave"] || 0) +
    (personnelStatus["Vacation Leave"] || 0) +
    (personnelStatus["Maternity Leave"] || 0) +
    (personnelStatus["Paternity Leave"] || 0) +
    (personnelStatus["Compensatory Leave"] || 0);

  const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : '';
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;
        

  const docDefinition = {
    pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [40, 60, 40, 60],
    content: [
      {
            text: 'Personnel Summary Report',
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
      { text: "\nSummary Count of Personnel (by Gender)" },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [
              {text:"Gender", bold: true},
              {text:"Total", bold: true}],
            ["Male", male],
            ["Female", female],
            ["Others", otherCount],
            [
              {text:"Total", bold: true}, 
              {text: totalGender, bold: true}
            ],
          ],
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
                fontSize: 11,
      },

      { text: "\nBJMP Personnel On and Off-Duty" },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [
              {text:"Status", bold: true},
              {text:"Total", bold: true}
            ],
            ["On-Duty", onDuty],
            ["Off-Duty", offDuty],
            ["On-Leave", onLeave],
            [ 
              {text:"Total", bold: true}, 
              {text:totalDuty, bold: true}
            ],
          ],
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
                fontSize: 11,
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
            title: {
                fontSize: 16,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 10],
            },
            header: {
                fontSize: 13,
                bold: true,
                margin: [0, 10, 0, 5],
            },
            subheader: {
                fontSize: 12,
                bold: true,
                margin: [0, 10, 0, 5],
                color: "#1E365D",
            },
        },
  };

  pdfMake.createPdf(docDefinition).download("Personnel_Summary_Report.pdf");
};

const exportPersonnelSummaryToExcel = (summary: any) => {
  const personnelGender = summary?.personnel_based_on_gender?.Active || {};
  const otherCount = Object.entries(personnelGender)
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((sum, [, val]) => sum + (val ?? 0), 0);

  const male = personnelGender.Male || 0;
  const female = personnelGender.Female || 0;
  const totalGender = male + female + otherCount;

  const personnelStatus = summary?.personnel_count_by_status?.Active || {};
  const onDuty = personnelStatus["On Duty"] || 0;
  const offDuty = personnelStatus["Off Duty"] || 0;
  const onLeave =
    (personnelStatus["Sick Leave"] || 0) +
    (personnelStatus["Vacation Leave"] || 0) +
    (personnelStatus["Maternity Leave"] || 0) +
    (personnelStatus["Paternity Leave"] || 0) +
    (personnelStatus["Compensatory Leave"] || 0);

  const totalDuty = onDuty + offDuty + onLeave;

  const genderSheet = [
    ["Personnel Summary by Gender", ""],
    ["Category", "Total"],
    ["Male", male],
    ["Female", female],
    ["Others", otherCount],
    ["Total", totalGender],
  ];

  const dutySheet = [
    [],
    ["BJMP Personnel On and Off-Duty", ""],
    ["Category", "Total"],
    ["On-Duty", onDuty],
    ["Off-Duty", offDuty],
    ["On-Leave", onLeave],
    ["Total", totalDuty],
  ];

  const worksheetData = [...genderSheet, ...dutySheet];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Personnel Summary");

  XLSX.writeFile(workbook, "Personnel_Summary_Report.xlsx");
};
  return (
    <div className='flex gap-5 flex-col md:max-w-7xl mx-auto'>
      <div className="mt-5">
        {/* <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>Summary Count of Personnel</h1> */}
        <div className='flex flex-wrap justify-between items-center'>
          <div className='border border-gray-100 rounded-md p-5 flex flex-col w-80'>
            <h1 className="font-semibold">Total Count of Personnel</h1>
              <div className="font-extrabold text-2xl flex ml-auto text-[#1E365D]">
                {summarydata?.success?.person_count_by_status?.Personnel?.Active ?? 0}
              </div>
          </div>
          <div className='flex flex-wrap justify-end mt-2 md:mt-0 gap-2'>
              <button
                onClick={() => exportPersonnelSummaryToExcel(summarydata?.success)}
                className="bg-[#1E365D] text-white px-4 py-2 rounded"
              >
                Export to Excel
              </button>
              <button
                onClick={() => exportPersonnelSummaryWithPdfMake(summarydata?.success)}
                className="bg-[#1E365D] text-white px-4 py-2 rounded"
              >
                Export to PDF
              </button>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <div>
          <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>Summary Count of Personnel</h1>
          <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r">Summary Count of Personnel</th>
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
                    <td className="px-6 py-2 text-lg whitespace-nowrap">{summarydata?.success?.personnel_based_on_gender?.Active?.Female ?? 0}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Others</td>
                    <td className="px-6 py-2 text-lg whitespace-nowrap">{personnelOtherCount}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                    <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{summarydata?.success?.personnel_based_on_gender?.Active?.Male +
                      summarydata?.success?.personnel_based_on_gender?.Active?.Female + personnelOtherCount || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>BJMP Personnel On and Off-Duty</h1>
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
      </div>
    </div>
  )
}

export default SummaryCountofPersonnel