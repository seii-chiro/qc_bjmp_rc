import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BASE_URL } from '@/lib/urls';
import { useTokenStore } from '@/store/useTokenStore';
import bjmp from '../../assets/Logo/QCJMD.png';
import { Input, Select } from 'antd';
import { useQuery } from '@tanstack/react-query';

const { Option } = Select;

const Report = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [pdfDataUrl, setPdfDataUrl] = useState('');
    const token = useTokenStore().token;
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [organizationName, setOrganizationName] = useState('Sample Organization');
    const [preparedBy, setPreparedBy] = useState('Prepared By Name');
    const [visitors, setVisitors] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [selectedType, setSelectedType] = useState('visitor');
    const [selectedGender, setSelectedGender] = useState('');
    // const [onlyMaleVisitors, setOnlyMaleVisitors] = useState(false);
    const [visitorsLoading, setVisitorsLoading] = useState(true);
  const [personnelLoading, setPersonnelLoading] = useState(true);


    const [visitorFields, setVisitorFields] = useState({
        idNumber: true,
        name: true,
        gender: true,
        visitorType: true,
        address: true,
    });

    const [personnelFields, setPersonnelFields] = useState({
        name: true,
        gender: true,
        role: true,
        status: true,
        address: true,
    });

    const [pdlFields, setPDLFields] = useState({
        name: true,
        gender: true,
        role: true,
        status: true,
        address: true,
    });

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                setVisitorsLoading(true);
                const data = await fetchAllVisitors();
                setVisitors(data.results || []);
            } finally {
                setVisitorsLoading(false);
            }
        };

        const fetchPersonnel = async () => {
            try {
                setPersonnelLoading(true);
                const data = await fetchAllPersonnel();
                setPersonnel(data.results || []);
            } finally {
                setPersonnelLoading(false);
            }
        };

        fetchVisitors();
        fetchPersonnel();
    }, []);

    const fetchAllVisitors = async () => {
        const res = await fetch(`${BASE_URL}/api/visitors/visitor/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) throw new Error('Network error');
        return res.json();
    };

    const fetchAllPersonnel = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) throw new Error('Network error');
        return res.json();
    };

      const fetchAllPDL = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) throw new Error('Network error');
        return res.json();
    };

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

    const generatePDF = async () => {
      if (selectedType === 'visitor' && visitors.length === 0) {
          alert("Visitor data is still loading or empty.");
          setIsLoading(false);
          return;
      }
      if (selectedType === 'personnel' && personnel.length === 0) {
          alert("Personnel data is still loading or empty.");
          setIsLoading(false);
          return;
      }
        setIsLoading(true);
        setLoadingMessage('Generating PDF... Please wait.');

        const doc = new jsPDF();
        const headerHeight = 48;
        const footerHeight = 32;

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;

        const maxRowsPerPage = 26;
        let startY = headerHeight;

        const addHeader = () => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const imageWidth = 30;
            const imageHeight = 30;
            const margin = 10;
            const imageX = pageWidth - imageWidth - margin;
            const imageY = 12;

            doc.addImage(bjmp, "PNG", imageX, imageY, imageWidth, imageHeight);

            doc.setTextColor(0, 102, 204);
            doc.setFontSize(16);
            doc.text('Report', 10, 15);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Organization Name: ${organizationName}`, 10, 25);
            doc.text('Report Date: ' + formattedDate, 10, 30);
            doc.text('Prepared By: ' + preparedBy, 10, 35);
            doc.text('Department/ Unit: IT', 10, 40);
            doc.text('Report Reference No.: ' + reportReferenceNo, 10, 45);
        };

        addHeader();

        const headers = ['No.'];
        const tableData: (string | number)[][] = [];

        const isOthers = (gender: string) => {
          const normalized = gender?.toUpperCase();
          return (
            normalized === "LGBTQ + TRANSGENDER" ||
            normalized === "LGBTQ + GAY / BISEXUAL" ||
            normalized === "LGBTQ + LESBIAN / BISEXUAL" ||
            normalized === "OTHERS"
          );
        };

        if (selectedType === 'visitor') {
            const fields = visitorFields;
            if (fields.idNumber) headers.push('ID Number');
            if (fields.name) headers.push('Name');
            if (fields.gender) headers.push('Gender');
            if (fields.visitorType) headers.push('Visitor Type');
            if (fields.address) headers.push('Address');

            const filteredVisitors = selectedGender
              ? visitors.filter((item) => {
                  const genderOption = item?.person?.gender?.gender_option ?? "";
                  if (selectedGender.toLowerCase() === "others") {
                    return isOthers(genderOption);
                  }
                  return genderOption.toLowerCase() === selectedGender.toLowerCase();
                })
              : visitors;

            filteredVisitors.forEach((item, index) => {
                const row: (string | number)[] = [index + 1];
                if (fields.idNumber) row.push(item?.id_number ?? '');
                if (fields.name) row.push(`${item?.person?.first_name ?? ''} ${item?.person?.last_name ?? ''}`.trim());
                if (fields.gender) row.push(item?.person?.gender?.gender_option ?? '');
                if (fields.visitorType) row.push(item?.visitor_type ?? '');
                if (fields.address) {
                    const address = item?.person?.addresses?.[0];
                    const parts = [
                        address?.barangay,
                        address?.city_municipality,
                        address?.province,
                    ].filter(Boolean);
                    row.push(parts.join(', '));
                }
                tableData.push(row);
            });
        } else {
            const fields = personnelFields;
            if (fields.name) headers.push('Name');
            if (fields.gender) headers.push('Gender');
            if (fields.role) headers.push('Role');
            if (fields.status) headers.push('Status');
            if (fields.address) headers.push('Address');

            const filteredPersonnel = selectedGender
              ? personnel.filter((item) => {
                  const genderOption = item?.person?.gender?.gender_option ?? "";
                  if (selectedGender.toLowerCase() === "others") {
                    return isOthers(genderOption);
                  }
                  return genderOption.toLowerCase() === selectedGender.toLowerCase();
                })
              : personnel;

              filteredPersonnel.forEach((item, index) => {
                const row: (string | number)[] = [index + 1];
                if (fields.name) row.push(`${item?.person?.first_name ?? ''} ${item?.person?.last_name ?? ''}`.trim());
                if (fields.gender) row.push(item?.person?.gender?.gender_option ?? '');
                if (fields.role) row.push(item?.position ?? '');
                if (fields.status) row.push(item?.status ?? '');
                if (fields.address) {
                    const address = item?.person?.addresses?.[0];
                    const parts = [
                        address?.barangay,
                        address?.city_municipality,
                        address?.province,
                    ].filter(Boolean);
                    row.push(parts.join(', '));
                }
                tableData.push(row);
            });
        }

        for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
            const pageData = tableData.slice(i, i + maxRowsPerPage);
            autoTable(doc, {
                head: [headers],
                body: pageData,
                startY: startY,
                margin: { top: 0, left: 10, right: 10 },
                didDrawPage: function () {
                    if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                        addHeader();
                    }
                },
            });

            if (i + maxRowsPerPage < tableData.length) {
                doc.addPage();
                startY = headerHeight;
            }
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let page = 1; page <= pageCount; page++) {
            doc.setPage(page);
            const footerText = [
                'Document Version: Version 1.0',
                'Confidentiality Level: Internal use only',
                'Contact Info: ' + preparedBy,
                `Timestamp of Last Update: ${formattedDate}`,
            ].join('\n');
            const footerX = 10;
            const footerY = doc.internal.pageSize.height - footerHeight + 15;
            const pageX = doc.internal.pageSize.width - doc.getTextWidth(`${page} / ${pageCount}`) - 10;
            doc.setFontSize(8);
            doc.text(footerText, footerX, footerY);
            doc.text(`${page} / ${pageCount}`, pageX, footerY);
        }

        const pdfOutput = doc.output('datauristring');
        setPdfDataUrl(pdfOutput);
        setIsPdfModalOpen(true);
        setIsLoading(false);
    };

    const handlePrintClick = () => {
        generatePDF();
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfDataUrl('');
    };

    const handleFieldChange = (field) => {
        if (selectedType === 'visitor') {
            setVisitorFields((prev) => ({
                ...prev,
                [field]: !prev[field],
            }));
        } else {
            setPersonnelFields((prev) => ({
                ...prev,
                [field]: !prev[field],
            }));
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
  <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Report Generator</h2>

  {/* Loading State */}
  {(visitorsLoading && selectedType === 'visitor') ||
  (personnelLoading && selectedType === 'personnel') ? (
    <p className="mb-6 text-center text-yellow-600 font-semibold">
      Loading data, please wait...
    </p>
  ) : null}

  {/* Controls Section */}
  <div className="mb-8 space-y-6">
    <div className="flex flex-wrap gap-6 items-end">
      {/* Select Type */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label htmlFor="selectType" className="mb-2 font-medium text-gray-700">
          Select Type:
        </label>
        <Select
          id="selectType"
          value={selectedType}
          onChange={(value) => setSelectedType(value)}
          placeholder="Select type"
          style={{ width: '100%', fontSize: 16 }}   // fontSize here affects the selected value box
          dropdownStyle={{ fontSize: 16 }}           // fontSize here affects dropdown options
          className="bg-gray-50 text-gray-800 h-10"
        >
          <Option value="visitor">Visitor</Option>
          <Option value="personnel">Personnel</Option>
        </Select>
      </div>

      {/* Organization Name */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label htmlFor="organizationName" className="mb-2 font-medium text-gray-700">
          Organization Name:
        </label>
        <div
          id="organizationName"
          className="p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
        >
          {organizationName || '—'}
        </div>
      </div>

      {/* Prepared By */}
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label htmlFor="preparedBy" className="mb-2 font-medium text-gray-700">
          Prepared By:
        </label>
        <input
          id="preparedBy"
          type="text"
          className="p-2 border border-gray-300 rounded-md text-gray-800 text-lg outline-none"
          value={preparedBy}
          onChange={(e) => setPreparedBy(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
    </div>

    {/* Fields Selection */}
    <fieldset className="border border-gray-300 rounded-md p-4">
      <legend className="text-lg font-semibold mb-4">
        Select Fields to Display:
      </legend>
      <div className="flex flex-wrap gap-4">
        {(selectedType === 'visitor'
          ? Object.keys(visitorFields)
          : Object.keys(personnelFields)
        ).map((field) => (
          <label key={field} className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={
                selectedType === 'visitor'
                  ? visitorFields[field]
                  : personnelFields[field]
              }
              onChange={() => handleFieldChange(field)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>
              {field === 'visitorType'
                ? 'Visitor Type'
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </span>
          </label>
        ))}
      </div>
        {(selectedType === 'visitor' && visitorFields.gender) ||
        (selectedType === 'personnel' && personnelFields.gender) ? (
          <div className="mt-2">
            <label className="text-gray-700 font-semibold mr-2">
              Filter {selectedType === 'visitor' ? 'Visitor' : 'Personnel'} by Gender:
            </label>
            <select
              className="border rounded px-2 py-1"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">LGBTQ+</option>
            </select>
          </div>
        ) : null}
    </fieldset>
  </div>

  <div className="text-center">
    <button
      onClick={handlePrintClick}
      disabled={
        isLoading ||
        (selectedType === 'visitor' && visitorsLoading) ||
        (selectedType === 'personnel' && personnelLoading)
      }
      className={`px-6 py-3 rounded-md font-semibold transition-colors duration-300
        ${
          isLoading ||
          (selectedType === 'visitor' && visitorsLoading) ||
          (selectedType === 'personnel' && personnelLoading)
            ? 'bg-gray-300 cursor-not-allowed text-gray-600'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
    >
      {isLoading ? 'Generating...' : 'Print Report'}
    </button>
  </div>

  {/* PDF Modal */}
  {isPdfModalOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4"
      style={{ zIndex: 1000 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdfModalTitle"
    >
      <button
        onClick={handleClosePdfModal}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      >
        Close PDF
      </button>
      <iframe
        src={pdfDataUrl}
        title="PDF Report"
        className="w-full max-w-7xl h-[80vh] border border-gray-300 rounded-md shadow-lg"
      />
    </div>
  )}
</div>

    );
};

export default Report;
