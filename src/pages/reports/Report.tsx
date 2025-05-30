import { useState, useEffect } from 'react';
import { buildVisitorReport, buildAffiliationReport, buildPDLReport, buildPersonnelReport } from './helpers/buildVisitorReport';
import { BASE_URL } from '@/lib/urls';
import { useTokenStore } from '@/store/useTokenStore';
import * as XLSX from 'xlsx';
// import bjmp from '../../assets/Logo/QCJMD.png';
import { Select } from 'antd';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
import { useQuery } from '@tanstack/react-query';
import { defaultAffiliationFields, defaultPDLFields, defaultPersonnelFields, defaultVisitorFields } from './config/reportFieldDefaults';
import logoBase64 from '@/pages/reports/assets/logoBase64';
import FieldSelector from './components/FieldSelector';
import { getUser } from '@/lib/queries';

const { Option } = Select;

const Report = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [pdfDataUrl, setPdfDataUrl] = useState('');
    const token = useTokenStore().token;
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [showEmploymentFields, setShowEmploymentFields] = useState(false);
    const [showIdentifierFields, setShowIdentifierFields] = useState(false);
    // const [showContactFields, setShowContactFields] = useState(false);
    const [showTalentsFields, setShowTalentsFields] = useState(false);
    const [showSocialMediaFields, setShowSocialMediaFields ] = useState(false);
    const [showAffiliationFields, setShowAffiliationFields ] = useState(false);
    const [showDiagnosesFields, setShowDiagnosesFields ] = useState(false);
    const [showMediaRequirementsFields, setShowMediaRequirementsFields ] = useState(false);
    const [showMediaIdentifiersFields, setShowMediaIdentifiersFields ] = useState(false);
    const [showOtherPersonnelFields, setShowOtherPersonnelFields] = useState(false);
    const [showOtherVisitorFields, setShowOtherVisitorFields] = useState(false);
    const [showOtherPDLFields, setShowOtherPDLFields] = useState(false);
    const [showOtherCaseFields, setShowOtherCaseFields] = useState(false);
    const [ showJailFields, setShowJailFields ] = useState(false);
    // const [showAddressFields, setShowAddressFields] = useState(false);
    const [showEducationalFields, setShowEducationalFields] = useState(false);
    const [showCaseFields, setShowCaseFields] = useState(false);
    const [showOffenseFields, setShowOffenseFields] = useState(false);
    const [showCourtBranchFields, setShowCourtBranchFields] = useState(false);
    const [showVisitorFields, setShowVisitorFields] = useState(false);
    const [showCellFields, setShowCellFields] = useState(false);
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    const [preparedBy, setPreparedBy] = useState('');
    const [visitors, setVisitors] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [pdl, setPDL] = useState([]);
    const [affiliation, setAffiliation] = useState([]);
    const [selectedType, setSelectedType] = useState('visitor');
    const [reportName, setReportName] = useState('Visitor Report');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    // const [onlyMaleVisitors, setOnlyMaleVisitors] = useState(false);
    const [visitorsLoading, setVisitorsLoading] = useState(true);
    const [personnelLoading, setPersonnelLoading] = useState(true);
    const [pdlLoading, setPDLLoading] = useState(true);
    const [affiliationLoading, setAffiliationLoading] = useState(true);
    const [selectAllFields, setSelectAllFields] = useState(false);
    const [visitorFields, setVisitorFields] = useState(defaultVisitorFields);
    const [personnelFields, setPersonnelFields] = useState(defaultPersonnelFields);
    const [pdlFields, setPDLFields] = useState(defaultPDLFields);
    const [affiliationFields, setAffiliationFields] = useState(defaultAffiliationFields);

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

        const fetchPdl = async () => {
            try {
                setPDLLoading(true);
                const data = await fetchAllPDL();
                setPDL(data.results || []);
            } finally {
                setPDLLoading(false);
            }
        };

        const fetchAffiliation = async () => {
            try {
                setAffiliationLoading(true);
                const data = await fetchAllAffiliation();
                setAffiliation(data.results || []);
            } finally {
                setAffiliationLoading(false);
            }
        };

        fetchVisitors();
        fetchPersonnel();
        fetchPdl();
        fetchAffiliation();
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
        const res = await fetch(`${BASE_URL}/api/pdls/pdl/?limit=10000`, {
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

    const fetchAllAffiliation = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/affiliation-types/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

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
    const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : preparedBy;
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const reportReferenceNo = `TAL-${formattedDate}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Guard Clauses
    const dataMap = {
      visitor: visitors,
      personnel: personnel,
      pdl: pdl,
      affiliation: affiliation,
    };

    const data = dataMap[selectedType as keyof typeof dataMap];

    if (!data || data.length === 0) {
      alert(`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} data is still loading or empty.`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Generating PDF... Please wait.');

    let headers: string[] = ['No.'];
    let body: any[][] = [];

    if (selectedType === 'visitor') {
      const { headers: h, body: b } = buildVisitorReport(visitors, visitorFields, selectedGender);
      headers.push(...h);
      body = b;
    } else if (selectedType === 'personnel') {
      const { headers: h, body: b } = buildPersonnelReport(personnel, personnelFields, selectedGender, selectedStatus);
      headers.push(...h);
      body = b;
    } else if (selectedType === 'pdl') {
      const { headers: h, body: b } = buildPDLReport(pdl, pdlFields, selectedGender, selectedStatus);
      headers.push(...h);
      body = b;
    } else if (selectedType === 'affiliation') {
      const { headers: h, body: b } = buildAffiliationReport(affiliation, affiliationFields);
      headers.push(...h);
      body = b;
    }

  const displayedHeaders = headers;
  const displayedBody = body;

    const columnThreshold = 7; 
    const pageOrientation = displayedHeaders.length > columnThreshold ? 'landscape' : 'portrait';
    const columnWidths = ['auto', ...Array(displayedHeaders.length - 1).fill('*')];

    
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation,
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          columns: [
            {
              stack: [
                {
                  text:
                    selectedType === 'visitor'
                      ? 'Visitor Report'
                      : selectedType === 'personnel'
                      ? 'Personnel Report'
                      : selectedType === 'pdl'
                      ? 'PDL Report'
                      : 'Affiliation Report',
                  style: 'header',
                },
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
          margin: [0, 0, 0, 20],
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: columnWidths,
            body: [
              displayedHeaders.map(header => ({ text: header, style: 'tableHeader', noWrap: false })),
              ...displayedBody.map(row =>
                 row.map(cell => ({
              text: cell,
              noWrap: false, 
              alignment: 'left', 
              fontSize: 8
            }))
              ),
            ],
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#DCE6F1' : null;
            },
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 4,
            paddingRight: () => 4,
          },
          pageBreak: 'auto',
          width: '100%',
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          {
            text: `Document Version: 1.0\nConfidentiality Level: Internal use only\nContact Info: ${UserData ? `${UserData.first_name} ${UserData.last_name}` : preparedBy}\nTimestamp of Last Update: ${formattedDate}`,
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
          color: '#0066CC',
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black',
        },
        tableExample: {
          margin: [0, 5, 0, 15],
          fontSize: 9,
        },
        subheader: {
          fontSize: 12,
          bold: false,
        },
      },
    };

    pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
      setPdfDataUrl(dataUrl);
      setIsPdfModalOpen(true);
      setIsLoading(false);
    });
  };

  const getCurrentHeadersAndBody = () => {
    let headers: string[] = ['No.'];
    let body: any[][] = [];
    if (selectedType === 'visitor') {
      const { headers: h, body: b } = buildVisitorReport(visitors, visitorFields, selectedGender);
      headers.push(...h);
      body = b;
    } else if (selectedType === 'personnel') {
      const { headers: h, body: b } = buildPersonnelReport(personnel, personnelFields, selectedGender, selectedStatus);
      headers.push(...h);
      body = b;
    } else if (selectedType === 'pdl') {
      const { headers: h, body: b } = buildPDLReport(pdl, pdlFields, selectedGender, selectedStatus);
      headers.push(...h);
      body = b;
    } else if (selectedType === 'affiliation') {
      const { headers: h, body: b } = buildAffiliationReport(affiliation, affiliationFields);
      headers.push(...h);
      body = b;
    }
    return { headers, body };
  };

  const handleDownloadExcel = () => {
    const { headers, body } = getCurrentHeadersAndBody();
    const wsData = [headers, ...body];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${selectedType}_report.xlsx`);
  };

  const handleDownloadCSV = () => {
    const { headers, body } = getCurrentHeadersAndBody();
    const rows = [headers, ...body];
    const csvContent = rows.map(row =>
      row.map(cell => {
        const val = cell === null || cell === undefined ? '' : cell;
        // Escape quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        } else if (selectedType === 'personnel') {
            setPersonnelFields((prev) => ({
                ...prev,
                [field]: !prev[field],
            }));
        } else if (selectedType === 'pdl') {
            setPDLFields((prev) => ({
                ...prev,
                [field]: !prev[field],
            }));
        } else if (selectedType === 'affiliation') {
            setAffiliationFields((prev) => ({
                ...prev,
                [field]: !prev[field],
            }));
        }
    };

    // const handleSelectAllCheckbox = (checked: boolean) => {
    //   setSelectAllFields(checked);
    //   if (selectedType === 'visitor') {
    //     setVisitorFields(prev =>
    //       Object.fromEntries(Object.keys(prev).map(k => [k, checked]))
    //     );
    //   } else if (selectedType === 'personnel') {
    //     setPersonnelFields(prev =>
    //       Object.fromEntries(Object.keys(prev).map(k => [k, checked]))
    //     );
    //   } else if (selectedType === 'pdl') {
    //     setPDLFields(prev =>
    //       Object.fromEntries(Object.keys(prev).map(k => [k, checked]))
    //     );
    //   } else if (selectedType === 'affiliation') {
    //     setAffiliationFields(prev =>
    //       Object.fromEntries(Object.keys(prev).map(k => [k, checked]))
    //     );
    //   }
    // };

    useEffect(() => {
    switch (selectedType) {
      case 'visitor':
        setReportName('Visitor Report');
        break;
      case 'personnel':
        setReportName('Personnel Report');
        break;
      case 'pdl':
        setReportName('PDL Report');
        break;
      case 'affiliation':
        setReportName('Affiliation Report');
        break;
      default:
        setReportName('Visitor Report');
        break;
    }
  }, [selectedType]);

    useEffect(() => {
      let allChecked = false;
      if (selectedType === 'visitor') {
        allChecked = Object.values(visitorFields).every(Boolean);
      } else if (selectedType === 'personnel') {
        allChecked = Object.values(personnelFields).every(Boolean);
      } else if (selectedType === 'pdl') {
        allChecked = Object.values(pdlFields).every(Boolean);
      } else if (selectedType === 'affiliation') {
        allChecked = Object.values(affiliationFields).every(Boolean);
      }
      setSelectAllFields(allChecked);
    }, [visitorFields, personnelFields, pdlFields, affiliationFields, selectedType]);

    const handlePrintClick = () => {
      generatePDF();
    };

    return (
      <div className="p-8 max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">{reportName}</h2>
          {/* Loading State */}
          {(visitorsLoading && selectedType === 'visitor') ||
          (personnelLoading && selectedType === 'personnel') ? (
            <p className="mb-6 text-center text-[#C69F08] font-bold">
              Loading data, please wait...
            </p>
          ) : null}
        {/* Controls Section */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Select Type */}
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="selectType" className="mb-2 font-medium text-gray-700">
                Select Type:
              </label>
              <Select
                showSearch
                id="selectType"
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                placeholder="Select type"
                style={{ width: '100%', fontSize: 16 }} 
                dropdownStyle={{ fontSize: 16 }}       
                className="bg-gray-50 text-gray-800 h-10"
              >
                <Option value="visitor">Visitor</Option>
                <Option value="personnel">Personnel</Option>
                <Option value="pdl">PDL</Option>
                <Option value="affiliation">Affiliation</Option>
              </Select>
            </div>

            {/* Organization Name */}
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="organizationName" className="mb-2 font-medium text-gray-700">
                Organization Name:
              </label>
              <div
                id="organizationName"
                className="p-1.5 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
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
                className="p-1 border border-gray-300 rounded-md text-gray-800 text-lg outline-none"
                value={UserData ? `${UserData.first_name} ${UserData.last_name}` : preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Enter your name"
                readOnly
              />
            </div>
          </div>

          {/* Fields Selection */}
          <FieldSelector
            selectedType={selectedType}
            selectAllFields={selectAllFields}
            // handleSelectAllCheckbox={handleSelectAllCheckbox}
            handleFieldChange={handleFieldChange}
            visitorFields={visitorFields}
            personnelFields={personnelFields}
            pdlFields={pdlFields}
            affiliationFields={affiliationFields}
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            showEmploymentFields={showEmploymentFields}
            setShowEmploymentFields={setShowEmploymentFields}
            showIdentifierFields={showIdentifierFields}
            setShowIdentifierFields={setShowIdentifierFields}
            // showContactFields={showContactFields}
            // setShowContactFields={setShowContactFields}
            showTalentsFields={showTalentsFields}
            setShowTalentsFields={setShowTalentsFields}
            showOtherPersonnelFields={showOtherPersonnelFields}
            setShowOtherPersonnelFields={setShowOtherPersonnelFields}
            showOtherVisitorFields={showOtherVisitorFields}
            setShowOtherVisitorFields={setShowOtherVisitorFields}
            // showAddressFields={showAddressFields}
            // setShowAddressFields={setShowAddressFields}
            showEducationalFields={showEducationalFields}
            setShowEducationalFields={setShowEducationalFields}
            showOtherPDLFields={showOtherPDLFields}
            setShowOtherPDLFields={setShowOtherPDLFields}
            showMediaRequirementsFields={showMediaRequirementsFields}
            setShowMediaRequirementsFields={setShowMediaRequirementsFields}
            showMediaIdentifiersFields={showMediaIdentifiersFields}
            setShowMediaIdentifiersFields={setShowMediaIdentifiersFields}
            showAffiliationFields={showAffiliationFields}
            setShowAffiliationFields={setShowAffiliationFields}
            showDiagnosesFields={showDiagnosesFields}
            setShowDiagnosesFields={setShowDiagnosesFields}
            showSocialMediaFields={showSocialMediaFields}
            setShowSocialMediaFields={setShowSocialMediaFields}
            showCaseFields={showCaseFields}
            setShowCaseFields={setShowCaseFields}
            showOffenseFields={showOffenseFields}
            setShowOffenseFields={setShowOffenseFields}
            showCourtBranchFields={showCourtBranchFields}
            setShowCourtBranchFields={setShowCourtBranchFields}
            showOtherCaseFields={showOtherCaseFields}
            setShowOtherCaseFields={setShowOtherCaseFields}
            showJailFields={showJailFields}
            setShowJailFields={setShowJailFields}
            showVisitorFields={showVisitorFields}
            setShowVisitorFields={setShowVisitorFields}
            showCellFields={showCellFields}
            setShowCellFields={setShowCellFields}
          />
        </div>
        <div className="text-center flex justify-end gap-4">
          <button
            onClick={handlePrintClick}
            disabled={
              isLoading ||
              (selectedType === 'visitor' && visitorsLoading) ||
              (selectedType === 'personnel' && personnelLoading) ||
              (selectedType === 'pdl' && pdlLoading) || 
              (selectedType === 'affiliation' && affiliationLoading) 
            }
            className={`px-6 py-3 rounded-md font-semibold transition-colors duration-300
              ${
                isLoading ||
                (selectedType === 'visitor' && visitorsLoading) ||
                (selectedType === 'personnel' && personnelLoading) ||
                (selectedType === 'pdl' && pdlLoading) ||
                (selectedType === 'affiliation' && affiliationLoading)
                  ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                  : 'bg-[#1E365D] hover:bg-[#2a4a7e] text-white'
              }`}
          >
            {isLoading ? 'Generating...' : 'PDF Report'}
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-6 py-3 rounded-md font-semibold bg-[#1E365D] hover:bg-[#2a4a7e] text-white transition-colors duration-300"
            disabled={
              isLoading ||
              (selectedType === 'visitor' && visitorsLoading) ||
              (selectedType === 'personnel' && personnelLoading) ||
              (selectedType === 'pdl' && pdlLoading) ||
              (selectedType === 'affiliation' && affiliationLoading)
            }
          >
            Download Excel
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-6 py-3 rounded-md font-semibold bg-[#1E365D] hover:bg-[#2a4a7e] text-white transition-colors duration-300"
            disabled={
              isLoading ||
              (selectedType === 'visitor' && visitorsLoading) ||
              (selectedType === 'personnel' && personnelLoading) ||
              (selectedType === 'pdl' && pdlLoading) ||
              (selectedType === 'affiliation' && affiliationLoading)
            }
          >
            Download CSV
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
              allow="fullscreen"
              title="PDF Report"
              className="w-full max-w-7xl h-[80vh] border border-gray-300 rounded-md shadow-lg"
            />
          </div>
        )}
      </div>
    );
};

export default Report;
