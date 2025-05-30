import { getSummary_Card } from '@/lib/queries';
import { useTokenStore } from '@/store/useTokenStore';
import { useQuery } from '@tanstack/react-query';

const SummaryCountofPersonnel = () => {
  const token = useTokenStore().token;

  const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

  const personnelOtherCount = Object.entries(summarydata?.success?.personnel_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);
  return (
    <div className='flex gap-5 flex-col'>
      <div className="mt-5 md:max-w-lg">
        <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>Summary Count of Personnel</h1>
        <div>
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
        
      </div>
      <div className="mt-5 md:max-w-lg">
        <h1 className='px-2 font-semibold text-xl text-[#1E365D]'>BJMP Personnel On and Off-Duty</h1>
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
        
      </div>
    </div>
  )
}

export default SummaryCountofPersonnel
