import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as XLSX from "xlsx";
import logoBase64 from '../assets/logoBase64';
import { getSummary_Card, getUser } from "@/lib/queries";
pdfMake.vfs = pdfFonts.vfs;

const SummaryCountofPersonnel = () => {
  const token = useTokenStore().token;
  const [civilStatusFilter, setCivilStatusFilter] = useState('');
  const [genderFilter, setgenderFilter] = useState('');
  const [personnelTypeFilter, setPersonnelTypeFilter] = useState('');
  const [religionFilter, setReligionFilter] = useState('');
  const [occupationFilter, setOccupationFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');


  const [civilStatuses, setCivilStatuses] = useState([]);
  const [gender, setgender] = useState([]);
  const [personnelType, setPersonnelType] = useState([]);
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    });

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

  // const { data: allPersonnelData, isFetching } = useQuery({
  //     queryKey: [
  //         "personnel",
  //         "personnel-table",
  //         page,
  //         limit,
  //     ],

  //     queryFn: async (): Promise<PaginatedResponse<PersonnelType>> => {
  //         const offset = (page - 1) * limit;
  //         const params = new URLSearchParams();
  
  //         params.append("page", String(page));
  //         params.append("limit", String(limit));
  //         params.append("offset", String(offset));

  //         const res = await fetch(`${BASE_URL}/api/codes/personnel/?${params.toString()}`, {
  //         headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Token ${token}`,
  //         },
  //         });
  
  //         if (!res.ok) {
  //         throw new Error("Failed to fetch Personnel data.");
  //         }
  
  //         return res.json();
  //     },
  //     enabled: !!token,
  //     keepPreviousData: true,
  // });

  const { data: allPersonnelData } = useQuery({
      queryKey: ["allPersonnel"],
      queryFn: async () => {
          const res = await fetch(`${BASE_URL}/api/codes/personnel/?limit=10000`, {
              headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
              },
          });

          if (!res.ok) throw new Error("Network error");
          return res.json();
      },
      enabled: !!token, 
  });

    const fetchCivilStatuses = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/civil-statuses/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchGender = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/genders/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchPersonnelType = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/personnel-type/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: civilStatusData } = useQuery({
        queryKey: ['civil-statuses'],
        queryFn: fetchCivilStatuses,
    });

    const { data: genderData } = useQuery({
        queryKey: ['gender'],
        queryFn: fetchGender,
    });

    const { data: personnelTypeData } = useQuery({
        queryKey: ['personnel-type'],
        queryFn: fetchPersonnelType,
    });

  useEffect(() => {
    if (civilStatusData) {
        setCivilStatuses(civilStatusData.results);
    }
  }, [civilStatusData]);

  useEffect(() => {
    if (genderData) {
        setgender(genderData.results);
    }
  }, [genderData]);

  useEffect(() => {
    if (personnelTypeData) {
        setPersonnelType(personnelTypeData.results);
    }
  }, [personnelTypeData]);

  const fetchReligion = async () => { 
    const res = await fetch(`${BASE_URL}/api/standards/religions/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
  };

  const fetchOccupation = async () => {
    const res = await fetch(`${BASE_URL}/api/pdls/occupations/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
  };

  const fetchEducation = async () => { 
    const res = await fetch(`${BASE_URL}/api/standards/educational-attainment/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
  };

  const fetchRanks = async () => {
    const res = await fetch(`${BASE_URL}/api/codes/ranks/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
  };

  const fetchPositions = async () => {
    const res = await fetch(`${BASE_URL}/api/codes/positions/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      });
      if (!res.ok) throw new Error("Network error");
      return res.json(); 
  };

  const fetchEmploymentType = async () => {
    const res = await fetch(`${BASE_URL}/api/codes/employment-types/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
  };

  const { data: religionData } = useQuery({ queryKey: ['religion'], queryFn: fetchReligion });
  const { data: occupationData } = useQuery({ queryKey: ['occupation'], queryFn: fetchOccupation });
  const { data: educationData } = useQuery({ queryKey: ['education'], queryFn: fetchEducation });
  const { data: rankData } = useQuery({ queryKey: ['rank'], queryFn: fetchRanks });
  const { data: positionData } = useQuery({ queryKey: ['position'], queryFn: fetchPositions });
  const { data: employmentTypeData } = useQuery({ queryKey: ['employment-type'], queryFn: fetchEmploymentType });


  const filteredPersonnel = allPersonnelData?.results?.filter(personnel => {
    const civilMatch = !civilStatusFilter || personnel?.person?.civil_status === civilStatusFilter;
    const genderMatch = !genderFilter || personnel?.person?.gender?.gender_option === genderFilter;
    const personnelTypeMatch = !personnelTypeFilter || personnel?.personnel_type === personnelTypeFilter;
    const religionMatch = !religionFilter || personnel?.person?.religion?.name === religionFilter;

    const occupationMatch = !occupationFilter || personnel?.person?.occupation?.name === occupationFilter;
    const educationMatch = !educationFilter || personnel?.person?.education_backgrounds[0]?.educational_attainment === educationFilter;
    const rankMatch = !rankFilter || personnel?.rank === rankFilter;
    const positionMatch = !positionFilter || personnel?.position === positionFilter;
    const employmentTypeMatch = !employmentTypeFilter || personnel?.person?.employment_histories[0]?.employment_type === employmentTypeFilter;

    return civilMatch && genderMatch && personnelTypeMatch && religionMatch &&
          occupationMatch && educationMatch && rankMatch &&
          positionMatch && employmentTypeMatch;
  }) || [];


  const maleCount = filteredPersonnel.filter(
    personnel => personnel?.person?.gender?.gender_option === "Male"
  ).length;

  const femaleCount = filteredPersonnel.filter(
    personnel => personnel?.person?.gender?.gender_option === "Female"
  ).length;

  const personnelOtherCount = filteredPersonnel.filter(
    personnel =>
      personnel?.person?.gender?.gender_option !== "Male" &&
      personnel?.person?.gender?.gender_option !== "Female"
  ).length;

  const totalPersonnelCount = maleCount + femaleCount + personnelOtherCount;

  const statusCounts = filteredPersonnel.reduce((acc, p) => {
    const status = p.status || "Unknown";

    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const onDutyCount = statusCounts["On Duty"] || 0;
  const offDutyCount = statusCounts["Off Duty"] || 0;

  const onLeaveCount = (
    (statusCounts["Sick Leave"] || 0) +
    (statusCounts["Vacation Leave"] || 0) +
    (statusCounts["Maternity Leave"] || 0) +
    (statusCounts["Paternity Leave"] || 0) +
    (statusCounts["Compensatory Leave"] || 0) +
    (statusCounts["Absent Without Leave"] || 0)
  );

  const totalStatusCount = onDutyCount + offDutyCount + onLeaveCount;

  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSelect = (type, value) => {
    const resetAll = () => {
      setCivilStatusFilter('');
      setgenderFilter('');
      setPersonnelTypeFilter('');
      setReligionFilter('');
      setOccupationFilter('');
      setEducationFilter('');
      setRankFilter('');
      setPositionFilter('');
      setEmploymentTypeFilter('');
    };

    resetAll();

    switch (type) {
      case "civil": setCivilStatusFilter(value); break;
      case "gender": setgenderFilter(value); break;
      case "personnel-type": setPersonnelTypeFilter(value); break;
      case "religion": setReligionFilter(value); break;
      case "occupation": setOccupationFilter(value); break;
      case "education": setEducationFilter(value); break;
      case "rank": setRankFilter(value); break;
      case "position": setPositionFilter(value); break;
      case "employment-type": setEmploymentTypeFilter(value); break;
    }
  };

  let buttonText = "By Categories";
  if (civilStatusFilter) buttonText = `Civil Status - ${civilStatusFilter}`;
  else if (genderFilter) buttonText = `Gender - ${genderFilter}`;
  else if (personnelTypeFilter) buttonText = `Personnel Type - ${personnelTypeFilter}`;
  else if (religionFilter) buttonText = `Religion - ${religionFilter}`;
  else if (occupationFilter) buttonText = `Occupation - ${occupationFilter}`;
  else if (educationFilter) buttonText = `Education - ${educationFilter}`;
  else if (rankFilter) buttonText = `Rank - ${rankFilter}`;
  else if (positionFilter) buttonText = `Position - ${positionFilter}`;
  else if (employmentTypeFilter) buttonText = `Employment Type - ${employmentTypeFilter}`;

  const exportPersonnelSummaryWithPdfMake = () => {
    const preparedByText = UserData ? `${UserData?.first_name || ''} ${UserData?.last_name || ''}` : '';
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const reportReferenceNo = `TAL-${formattedDate}-XXX`;

    const organizationName = organizationData?.results?.[0]?.organization_name || "Bureau of Jail Management and Penology";

    const filteredPersonnel = allPersonnelData?.results?.filter(personnel => {
      const civilMatch = !civilStatusFilter || personnel?.person?.civil_status === civilStatusFilter;
      const genderMatch = !genderFilter || personnel?.person?.gender?.gender_option === genderFilter;
      const personnelTypeMatch = !personnelTypeFilter || personnel?.personnel_type === personnelTypeFilter;
      const religionMatch = !religionFilter || personnel?.person?.religion?.name === religionFilter;

      const occupationMatch = !occupationFilter || personnel?.person?.occupation?.name === occupationFilter;
      const educationMatch = !educationFilter || personnel?.person?.education_backgrounds[0]?.educational_attainment === educationFilter;
      const rankMatch = !rankFilter || personnel?.rank === rankFilter;
      const positionMatch = !positionFilter || personnel?.position === positionFilter;
      const employmentTypeMatch = !employmentTypeFilter || personnel?.person?.employment_histories[0]?.employment_type === employmentTypeFilter;

      return civilMatch && genderMatch && personnelTypeMatch && religionMatch &&
            occupationMatch && educationMatch && rankMatch &&
            positionMatch && employmentTypeMatch;
    }) || [];

    const genderMale = filteredPersonnel.filter(p => p?.person?.gender?.gender_option === 'Male').length;
    const genderFemale = filteredPersonnel.filter(p => p?.person?.gender?.gender_option === 'Female').length;
    const genderOther = filteredPersonnel.filter(p => {
      const g = p?.person?.gender?.gender_option;
      return g !== 'Male' && g !== 'Female';
    }).length;

    const totalGender = genderMale + genderFemale + genderOther;

    const statusCounts = filteredPersonnel.reduce((acc, p) => {
      const status = p.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const onDuty = statusCounts["On Duty"] || 0;
    const offDuty = statusCounts["Off Duty"] || 0;
    const onLeave =
      (statusCounts["Sick Leave"] || 0) +
      (statusCounts["Vacation Leave"] || 0) +
      (statusCounts["Maternity Leave"] || 0) +
      (statusCounts["Paternity Leave"] || 0) +
      (statusCounts["Compensatory Leave"] || 0) +
      (statusCounts["Absent Without Leave"] || 0);
    const totalDuty = onDuty + offDuty + onLeave;

    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'Personnel Summary Report', style: 'header', alignment: 'left', margin: [0, 0, 0, 10] },
        {
          columns: [
            {
              stack: [
                { text: organizationName, style: 'subheader', margin: [0, 5, 0, 10] },
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
              [{ text: "Gender", bold: true }, { text: "Total", bold: true }],
              ["Male", genderMale],
              ["Female", genderFemale],
              ["Others", genderOther],
              [{ text: "Total", bold: true }, { text: totalGender, bold: true }],
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
              [{ text: "Status", bold: true }, { text: "Total", bold: true }],
              ["On-Duty", onDuty],
              ["Off-Duty", offDuty],
              ["On-Leave", onLeave],
              [{ text: "Total", bold: true }, { text: totalDuty, bold: true }],
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
      footer: (currentPage, pageCount) => ({
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

  const exportPersonnelSummaryToExcel = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const reportReferenceNo = `TAL-${formattedDate}-XXX`;
    const organizationName = organizationData?.results?.[0]?.organization_name || "Bureau of Jail Management and Penology";
    const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : '';

  const filteredPersonnel = allPersonnelData?.results?.filter(personnel => {
    const civilMatch = !civilStatusFilter || personnel?.person?.civil_status === civilStatusFilter;
    const genderMatch = !genderFilter || personnel?.person?.gender?.gender_option === genderFilter;
    const personnelTypeMatch = !personnelTypeFilter || personnel?.personnel_type === personnelTypeFilter;
    const religionMatch = !religionFilter || personnel?.person?.religion?.name === religionFilter;

    const occupationMatch = !occupationFilter || personnel?.person?.occupation?.name === occupationFilter;
    const educationMatch = !educationFilter || personnel?.person?.education_backgrounds[0]?.educational_attainment === educationFilter;
    const rankMatch = !rankFilter || personnel?.rank === rankFilter;
    const positionMatch = !positionFilter || personnel?.position === positionFilter;
    const employmentTypeMatch = !employmentTypeFilter || personnel?.person?.employment_histories[0]?.employment_type === employmentTypeFilter;

    return civilMatch && genderMatch && personnelTypeMatch && religionMatch &&
          occupationMatch && educationMatch && rankMatch &&
          positionMatch && employmentTypeMatch;
  }) || [];

    const genderMale = filteredPersonnel.filter(p => p?.person?.gender?.gender_option === 'Male').length;
    const genderFemale = filteredPersonnel.filter(p => p?.person?.gender?.gender_option === 'Female').length;
    const genderOther = filteredPersonnel.filter(p => {
      const g = p?.person?.gender?.gender_option;
      return g !== 'Male' && g !== 'Female';
    }).length;

    const totalGender = genderMale + genderFemale + genderOther;

    const statusCounts = filteredPersonnel.reduce((acc, p) => {
      const status = p.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const onDuty = statusCounts["On Duty"] || 0;
    const offDuty = statusCounts["Off Duty"] || 0;
    const onLeave =
      (statusCounts["Sick Leave"] || 0) +
      (statusCounts["Vacation Leave"] || 0) +
      (statusCounts["Maternity Leave"] || 0) +
      (statusCounts["Paternity Leave"] || 0) +
      (statusCounts["Compensatory Leave"] || 0) +
          (statusCounts["Absent Without Leave"] || 0);
    const totalDuty = onDuty + offDuty + onLeave;

    // Construct Excel data
    const sheetData = [
      ["Personnel Summary Report"],
      [],
      ["Organization:", organizationName],
      ["Report Date:", formattedDate],
      ["Prepared By:", preparedByText],
      ["Department/Unit:", "IT"],
      ["Report Reference No.:", reportReferenceNo],
      [],
      ["Summary Count of Personnel (by Gender)"],
      ["Gender", "Total"],
      ["Male", genderMale],
      ["Female", genderFemale],
      ["Others", genderOther],
      ["Total", totalGender],
      [],
      ["BJMP Personnel On and Off-Duty"],
      ["Status", "Total"],
      ["On-Duty", onDuty],
      ["Off-Duty", offDuty],
      ["On-Leave", onLeave],
      ["Total", totalDuty],
      [],
      ["Document Version:", "1.0"],
      ["Confidentiality Level:", "Internal use only"],
      ["Contact Info:", preparedByText],
      ["Timestamp of Last Update:", formattedDate],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personnel Summary");

    XLSX.writeFile(workbook, "Personnel_Summary_Report.xlsx");
  };

  return (
    <div className='flex gap-5 flex-col md:max-w-7xl mx-auto'>
      <div className="flex justify-between">
      <div className='border border-gray-100 rounded-md p-5 flex flex-col w-80'>
        <h1 className="font-semibold">Total Count of Personnel</h1>
          <div className="font-extrabold text-2xl flex ml-auto text-[#1E365D]">
            {summarydata?.success?.person_count_by_status?.Personnel?.Active ?? 0}
          </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative inline-block text-left w-80" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-full border border-gray-300 rounded p-2 text-left text-gray-500 bg-white">
            {buttonText}
            <span className="float-right">&#9662;</span>
          </button>
          {open && (
            <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-96 overflow-auto z-10">
            {/* Civil Status Group */}
              <div>
                  <button
                  onClick={() => setOpenGroup(openGroup === "civil" ? null : "civil")}
                  className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                  >
                  Civil Status
                  <span>{openGroup === "civil" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                  </button>
                  {openGroup === "civil" && (
                  <ul className="border-t border-gray-200">
                      <li
                      key="civil-all"
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          !civilStatusFilter ? "font-bold bg-gray-100" : ""
                      }`}
                      onClick={() => onSelect("civil", "")}
                      >
                      </li>
                      {civilStatuses.map((status) => (
                      <li
                          key={status.id}
                          className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                          civilStatusFilter === status.status ? "font-bold bg-gray-100" : ""
                          }`}
                          onClick={() => onSelect("civil", status.status)}
                      >
                          {status.status}
                      </li>
                      ))}
                  </ul>
                  )}
              </div>
            {/* Gender Group */}
              <div>
                  <button
                  onClick={() => setOpenGroup(openGroup === "gender" ? null : "gender")}
                  className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                  >
                  Gender
                  <span>{openGroup === "gender" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                  </button>
                  {openGroup === "gender" && (
                  <ul className="border-t border-gray-200">
                      <li
                      key="gender-all"
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          !genderFilter ? "font-bold bg-gray-100" : ""
                      }`}
                      onClick={() => onSelect("gender", "")}
                      >
                      </li>
                      {gender.map((gender) => (
                      <li
                          key={gender.id}
                          className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                          genderFilter === gender.gender_option ? "font-bold bg-gray-100" : ""
                          }`}
                          onClick={() => onSelect("gender", gender.gender_option)}
                      >
                          {gender.gender_option}
                      </li>
                      ))}
                  </ul>
                  )}
              </div>
            {/* Personnel Type Group */}
              <div>
                  <button
                  onClick={() => setOpenGroup(openGroup === "personnel-type" ? null : "personnel-type")}
                  className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                  >
                  Personnel Type
                  <span>{openGroup === "personnel-type" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                  </button>
                  {openGroup === "personnel-type" && (
                  <ul className="border-t border-gray-200">
                      <li
                      key="personnel-type-all"
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          !personnelTypeFilter ? "font-bold bg-gray-100" : ""
                      }`}
                      onClick={() => onSelect("personnel-type", "")}
                      >
                      </li>
                      {personnelType.map((personnelType) => (
                      <li
                          key={personnelType.id}
                          className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                          personnelTypeFilter === personnelType.name ? "font-bold bg-gray-100" : ""
                          }`}
                          onClick={() => onSelect("personnel-type", personnelType.name)}
                      >
                          {personnelType.name}
                      </li>
                      ))}
                  </ul>
                  )}
              </div>
            {/* Religion Group */}
            <div>
              <button
                onClick={() => setOpenGroup(openGroup === "religion" ? null : "religion")}
                className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
              >
                Religion
                <span>{openGroup === "religion" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
              </button>
              {openGroup === "religion" && (
                <ul className="border-t border-gray-200">
                  <li
                    key="religion-all"
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${!religionFilter ? "font-bold bg-gray-100" : ""}`}
                    onClick={() => onSelect("religion", "")}
                  >
                  </li>
                  {religionData?.results?.map((item) => (
                    <li
                      key={item.id}
                      className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${religionFilter === item.name ? "font-bold bg-gray-100" : ""}`}
                      onClick={() => onSelect("religion", item.name)}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Occupation Group */}
            <div>
              <button
                onClick={() => setOpenGroup(openGroup === "occupation" ? null : "occupation")}
                className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
              >
                Occupation
                <span>{openGroup === "occupation" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
              </button>
              {openGroup === "occupation" && (
                <ul className="border-t border-gray-200">
                  <li
                    key="occupation-all"
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${!occupationFilter ? "font-bold bg-gray-100" : ""}`}
                    onClick={() => onSelect("occupation", "")}
                  >
                  </li>
                  {occupationData?.results?.map((item) => (
                    <li
                      key={item.id}
                      className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${occupationFilter === item.name ? "font-bold bg-gray-100" : ""}`}
                      onClick={() => onSelect("occupation", item.name)}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Educational Attainment Group */}
            <div>
              <button
                onClick={() => setOpenGroup(openGroup === "education" ? null : "education")}
                className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
              >
                Educational Attainment
                <span>{openGroup === "education" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
              </button>
              {openGroup === "education" && (
                <ul className="border-t border-gray-200">
                  <li
                    key="education-all"
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${!educationFilter ? "font-bold bg-gray-100" : ""}`}
                    onClick={() => onSelect("education", "")}
                  >
                  </li>
                  {educationData?.results?.map((item) => (
                    <li
                      key={item.id}
                      className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${educationFilter === item.name ? "font-bold bg-gray-100" : ""}`}
                      onClick={() => onSelect("education", item.name)}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Rank Group */}
            <div>
              <button
                onClick={() => setOpenGroup(openGroup === "rank" ? null : "rank")}
                className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
              >
                Rank
                <span>{openGroup === "rank" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
              </button>
              {openGroup === "rank" && (
                <ul className="border-t border-gray-200">
                  <li
                    key="rank-all"
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${!rankFilter ? "font-bold bg-gray-100" : ""}`}
                    onClick={() => onSelect("rank", "")}
                  >
                  </li>
                  {rankData?.results?.map((rank) => (
                    <li
                      key={rank.id}
                      className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${rankFilter === `${rank?.rank_name} (${rank?.rank_code})` ? "font-bold bg-gray-100" : ""}`}
                      onClick={() => onSelect("rank", `${rank?.rank_name} (${rank?.rank_code})`)}
                    >
                      {`${rank?.rank_name} (${rank?.rank_code})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Position Group */}
            <div>
              <button
                onClick={() => setOpenGroup(openGroup === "position" ? null : "position")}
                className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
              >
                Position
                <span>{openGroup === "position" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
              </button>
              {openGroup === "position" && (
                <ul className="border-t border-gray-200">
                  <li
                    key="position-all"
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${!positionFilter ? "font-bold bg-gray-100" : ""}`}
                    onClick={() => onSelect("position", "")}
                  >
                  </li>
                  {positionData?.results?.map((item) => (
                    <li
                      key={item.id}
                      className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${positionFilter === item.position_title ? "font-bold bg-gray-100" : ""}`}
                      onClick={() => onSelect("position", item.position_title)}
                    >
                      {item.position_title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
              {/* Employment Type Group */}
              <div>
                <button
                  onClick={() => setOpenGroup(openGroup === "employment-type" ? null : "employment-type")}
                  className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                >
                  Employment Type
                  <span>{openGroup === "employment-type" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                </button>
                {openGroup === "employment-type" && (
                  <ul className="border-t border-gray-200">
                    <li
                      key="employment-type-all"
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${!employmentTypeFilter ? "font-bold bg-gray-100" : ""}`}
                      onClick={() => onSelect("employment-type", "")}
                    >
                    </li>
                    {employmentTypeData?.results?.map((item) => (
                      <li
                        key={item.id}
                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${employmentTypeFilter === item.employment_type ? "font-bold bg-gray-100" : ""}`}
                        onClick={() => onSelect("employment-type", item.employment_type)}
                      >
                        {item.employment_type}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
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
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <div>
          <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Summary Count of Personnel Based on their Gender</h1>
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
                  <td className="px-6 py-2 text-lg whitespace-nowrap">{maleCount}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Female</td>
                  <td className="px-6 py-2 text-lg whitespace-nowrap">{femaleCount}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Others</td>
                  <td className="px-6 py-2 text-lg whitespace-nowrap">{personnelOtherCount}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                  <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{totalPersonnelCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>BJMP Personnel On and Off-Duty</h1>
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
                  <td className="px-6 py-2 text-lg whitespace-nowrap">{onDutyCount}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Off-Duty</td>
                  <td className="px-6 py-2 text-lg whitespace-nowrap">{offDutyCount}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-lg whitespace-nowrap border-r">On-Leave</td>
                  <td className="px-6 py-2 text-lg whitespace-nowrap">{onLeaveCount}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                  <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">{totalStatusCount}</td>
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
