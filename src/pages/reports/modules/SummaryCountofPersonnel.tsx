import { getSummary_Card } from '@/lib/queries';
import { useTokenStore } from '@/store/useTokenStore';
import { useQuery } from '@tanstack/react-query';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as XLSX from "xlsx";
// import logoBase64 from "../../assets/logoBase64";
pdfMake.vfs = pdfFonts.vfs;

const SummaryCountofPersonnel = () => {
  const token = useTokenStore().token;

  const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

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

  const docDefinition = {
    content: [
      { text: "Personnel Summary Report", style: "header" },

      { text: "\nSummary Count of Personnel (by Gender)", style: "subheader" },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            ["Gender", "Total"],
            ["Male", male],
            ["Female", female],
            ["Others", otherCount],
            ["Total", totalGender],
          ],
        },
      },

      { text: "\nBJMP Personnel On and Off-Duty", style: "subheader" },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            ["Status", "Total"],
            ["On-Duty", onDuty],
            ["Off-Duty", offDuty],
            ["On-Leave", onLeave],
            ["Total", totalDuty],
          ],
        },
      },
    ],
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