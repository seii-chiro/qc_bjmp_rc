import { getSummary_Card, getUser } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "@/lib/urls";
import logoBase64 from "../assets/logoBase64";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
pdfMake.vfs = pdfFonts.vfs;

const SummaryCountofPDLs = () => {
    const token = useTokenStore().token;
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    const [civilStatusFilter, setCivilStatusFilter] = useState('');
    const [religionFilter, setReligionFilter] = useState('');
    const [lawFilter, setLawFilter] = useState('');
    const [crimeCategoryFilter, setCrimeCategoryFilter] = useState('');
    const [offenseFilter, setOffenseFilter] = useState('');
    const [courtFilter, setCourtFilter] = useState('');
    const [policePrecinctFilter, setPolicePrecinctFilter] = useState('');
    const [gangAffiliationFilter, setGangAffiliationFilter] = useState('');
    const [ethnicityFilter, setEthnicityFilter] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [talentFilter, setTalentFilter] = useState('');
    const [interestFilter, setInterestFilter] = useState('');
    const [lookFilter, setLookFilter] = useState('');
    const [educationFilter, seteducationFilter] = useState('');
    const [occupationFilter, setOccupationFilter] = useState('');
    const [civilStatuses, setCivilStatuses] = useState([]);
    const [religions, setReligions] = useState([]);
    const [law, setLaw] = useState([]);
    const [crimeCategory, setCrimeCategory] = useState([]);
    const [offense, setOffense] = useState([]);
    const [court, setCourt] = useState([]);
    const [policePrecinct, setpolicePrecinct] = useState([]);
    const [gangAffiliation, setgangAffiliation] = useState([]);
    const [ethnicity, setethnicity] = useState([]);
    const [skill, setSkill] = useState([]);
    const [talents, setTalents] = useState([]);
    const [interest, setInterest] = useState([]);
    const [look, setLook] = useState([]);
    const [education, setEducation] = useState([]);
    const [occupation, setOccupation] = useState([]);
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

    const fetchReligions = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/religions/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchLaws = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/law/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchCrimeCategory = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/crime-category/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchOffenses = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/offense/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchCourtBranch = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/court-branch/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchPolicePrecinct = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/precinct/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchGangAffiliation = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/gang-affiliations/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchEthnicity = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/ethnicities/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchSkill = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/skills/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchTalent = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/talents/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchInterest = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/interests/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchLook = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/looks/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const fetchEducationalAttainment = async () => {
        const res = await fetch(`${BASE_URL}/api/standards/educational-attainment/`, {
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

    const { data: civilStatusData } = useQuery({
        queryKey: ['civil-statuses'],
        queryFn: fetchCivilStatuses,
    });

    const { data: religionData } = useQuery({
        queryKey: ['religion'],
        queryFn: fetchReligions,
    });

    const { data: lawData } = useQuery({
        queryKey: ['law'],
        queryFn: fetchLaws,
    });

    const { data: crimeCategoryData } = useQuery({
        queryKey: ['crime-category'],
        queryFn: fetchCrimeCategory,
    });

    const { data: offenseData } = useQuery({
        queryKey: ['offense'],
        queryFn: fetchOffenses,
    });
    
    const { data: courtData } = useQuery({
        queryKey: ['court'],
        queryFn: fetchCourtBranch,
    });

    const { data: policePrecinctData } = useQuery({
    queryKey: ['police-precinct'],
    queryFn: fetchPolicePrecinct,
    });

    const { data: gangAffiliationData } = useQuery({
    queryKey: ['gang-affiliations'],
    queryFn: fetchGangAffiliation,
    });

    const { data: ethnicityData } = useQuery({
    queryKey: ['ethnicities'],
    queryFn: fetchEthnicity,
    });

    const { data: skillData } = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkill,
    });

    const { data: talentData } = useQuery({
    queryKey: ['talents'],
    queryFn: fetchTalent,
    });

    const { data: interestData } = useQuery({
    queryKey: ['interests'],
    queryFn: fetchInterest,
    });

    const { data: lookData } = useQuery({
    queryKey: ['looks'],
    queryFn: fetchLook,
    });

    const { data: educationalAttainmentData } = useQuery({
    queryKey: ['educational-attainment'],
    queryFn: fetchEducationalAttainment,
    });

    const { data: occupationData } = useQuery({
    queryKey: ['occupations'],
    queryFn: fetchOccupation,
    });


    useEffect(() => {
        if (organizationData?.results?.length > 0) {
            setOrganizationName(organizationData.results[0]?.org_name ?? '');
        }
    }, [organizationData]);

    useEffect(() => {
        if (civilStatusData) {
            setCivilStatuses(civilStatusData.results);
        }
    }, [civilStatusData]);

    useEffect(() => {
        if (religionData) {
            setReligions(religionData.results);
        }
    }, [religionData]);

    useEffect(() => {
        if (lawData) {
            setLaw(lawData.results);
        }
    }, [lawData]);

    useEffect(() => {
        if (crimeCategoryData) {
            setCrimeCategory(crimeCategoryData.results);
        }
    }, [crimeCategoryData]);

    useEffect(() => {
        if (offenseData) {
            setOffense(offenseData.results);
        }
    }, [offenseData]);

    useEffect(() => {
        if (courtData) {
            setCourt(courtData.results);
        }
    }, [courtData]);

    useEffect(() => {
    if (policePrecinctData) setpolicePrecinct(policePrecinctData.results);
    }, [policePrecinctData]);

    useEffect(() => {
    if (gangAffiliationData) setgangAffiliation(gangAffiliationData.results);
    }, [gangAffiliationData]);

    useEffect(() => {
    if (ethnicityData) setethnicity(ethnicityData.results);
    }, [ethnicityData]);

    useEffect(() => {
    if (skillData) setSkill(skillData.results);
    }, [skillData]);

    useEffect(() => {
    if (talentData) setTalents(talentData.results);
    }, [talentData]);

    useEffect(() => {
    if (interestData) setInterest(interestData.results);
    }, [interestData]);

    useEffect(() => {
    if (lookData) setLook(lookData.results);
    }, [lookData]);

    useEffect(() => {
    if (educationalAttainmentData) setEducation(educationalAttainmentData.results);
    }, [educationalAttainmentData]);

    useEffect(() => {
    if (occupationData) setOccupation(occupationData.results);
    }, [occupationData]);

    const fetchPDLs = async () => {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl/?limit=10000`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: allPDLs } = useQuery({
        queryKey: ['pdls'],
        queryFn: fetchPDLs,
        enabled: !!token,
    });

    const calculateDefaultCounts = () => {
        const released = allPDLs?.results?.filter(pdl => pdl?.status === 'Released').length || 0;
        const hospitalized = allPDLs?.results?.filter(pdl => pdl?.status === 'Hospitalized').length || 0;
        const convicted = allPDLs?.results?.filter(pdl => pdl?.status === 'Convicted').length || 0;
        const committed = allPDLs?.results?.filter(pdl => pdl?.status === 'Committed').length || 0;

        return { released, hospitalized, convicted, committed };
    };

    const { released, hospitalized, convicted, committed } = calculateDefaultCounts();

    const calculateFilteredCounts = () => {
        if (!allPDLs?.results) return { released, hospitalized, convicted, committed };

        const filteredPDLs = allPDLs.results.filter(pdl => {
            const matchCivil = !civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter;
            const matchReligion = !religionFilter || pdl?.person?.religion === religionFilter;
            const matchLaws = !lawFilter || pdl?.cases[0]?.offense?.law === lawFilter;
            const matchCrimeCategory = !crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category === crimeCategoryFilter;
            const matchOffense = !offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter;
            const matchCourt = !courtFilter || pdl?.cases[0]?.court_branch?.court === courtFilter;

            const matchPrecinct = !policePrecinctFilter || pdl?.precinct === policePrecinctFilter;
            const matchGang = !gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter;
            const matchEthnicity = !ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter;
            const matchSkill = !skillFilter || pdl?.person?.skills[0]?.name === skillFilter;
            const matchTalent = !talentFilter || pdl?.person?.talents[0]?.name === talentFilter;
            const matchInterest = !interestFilter || pdl?.person?.interests[0]?.name === interestFilter;
            const matchLook = !lookFilter || pdl?.look === lookFilter;
            const matchEducation = !educationFilter || pdl?.person?.education_backgrounds[0]?.educational_attainment === educationFilter;
            const matchOccupation = !occupationFilter || pdl?.occupation === occupationFilter;

            return (
                matchCivil &&
                matchReligion &&
                matchLaws &&
                matchCrimeCategory &&
                matchOffense &&
                matchCourt &&
                matchPrecinct &&
                matchGang &&
                matchEthnicity &&
                matchSkill &&
                matchTalent &&
                matchInterest &&
                matchLook &&
                matchEducation &&
                matchOccupation
            );
        });

        return {
            released: filteredPDLs.filter(pdl => pdl?.status === 'Released').length,
            hospitalized: filteredPDLs.filter(pdl => pdl?.status === 'Hospitalized').length,
            convicted: filteredPDLs.filter(pdl => pdl?.status === 'Convicted').length,
            committed: filteredPDLs.filter(pdl => pdl?.status === 'Committed').length,
        };
    };

    const { released: filteredReleased, hospitalized: filteredHospitalized, convicted: filteredConvicted, committed: filteredCommitted } = calculateFilteredCounts();

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
        const resetCommonFilters = () => {
            setCivilStatusFilter("");
            setReligionFilter("");
            setLawFilter("");
            setCrimeCategoryFilter("");
            setOffenseFilter("");
            setCourtFilter("");
        };

        if (type === "civil") {
            setCivilStatusFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "religion") {
            setReligionFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "law") {
            setLawFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "crime-category") {
            setCrimeCategoryFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "offense") {
            setOffenseFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "court") {
            setCourtFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "precinct") {
            setPolicePrecinctFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "gang") {
            setGangAffiliationFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "ethnicity") {
            setEthnicityFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "skill") {
            setSkillFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "talent") {
            setTalentFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "interest") {
            setInterestFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "look") {
            setLookFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "education") {
            seteducationFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        } else if (type === "occupation") {
            setOccupationFilter(prev => prev === value ? "" : value);
            resetCommonFilters();
        }

        setOpen(false);
        setOpenGroup(null);
    };

    // Determine display text for button
    let buttonText = "By Categories";
    if (civilStatusFilter) buttonText = `Civil Status - ${civilStatusFilter}`;
    else if (religionFilter) buttonText = `Religion - ${religionFilter}`;
    else if (lawFilter) buttonText = `Law - ${lawFilter}`;
    else if (crimeCategoryFilter) buttonText = `Crime Categories - ${crimeCategoryFilter}`;
    else if (offenseFilter) buttonText = `Offense - ${offenseFilter}`;
    else if (courtFilter) buttonText = `Court / Branch - ${courtFilter}`;
    else if (policePrecinctFilter) buttonText = `Police Precinct - ${policePrecinctFilter}`;
    else if (gangAffiliationFilter) buttonText = `Gang Affiliation - ${gangAffiliationFilter}`;
    else if (ethnicityFilter) buttonText = `Ethnicity - ${ethnicityFilter}`;
    else if (skillFilter) buttonText = `Skill - ${skillFilter}`;
    else if (talentFilter) buttonText = `Talent - ${talentFilter}`;
    else if (interestFilter) buttonText = `Interest - ${interestFilter}`;
    else if (lookFilter) buttonText = `Look - ${lookFilter}`;
    else if (educationFilter) buttonText = `Education - ${educationFilter}`;
    else if (occupationFilter) buttonText = `Occupation - ${occupationFilter}`;


    const exportPDLSummaryToExcel = () => {
        const applyFilters = (pdl) => {
            const matchCivil = !civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter;
            const matchReligion = !religionFilter || pdl?.person?.religion === religionFilter;
            const matchLaw = !lawFilter || pdl?.cases[0]?.offense?.law === lawFilter;
            const matchCrimeCategory = !crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category === crimeCategoryFilter;
            const matchOffense = !offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter;
            const matchCourt = !courtFilter || pdl?.cases[0]?.court_branch?.court === courtFilter;

            const matchPrecinct = !policePrecinctFilter || pdl?.precinct === policePrecinctFilter;
            const matchGang = !gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter;
            const matchEthnicity = !ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter;
            const matchSkill = !skillFilter || pdl?.person?.skills?.some(skill => skill.name === skillFilter);
            const matchTalent = !talentFilter || pdl?.person?.talents?.some(talent => talent.name === talentFilter);
            const matchInterest = !interestFilter || pdl?.person?.interests?.some(interest => interest.name === interestFilter);
            const matchLook = !lookFilter || pdl?.look === lookFilter;
            const matchEducation = !educationFilter || pdl?.person?.education_backgrounds?.some(ed => ed.educational_attainment === educationFilter);
            const matchOccupation = !occupationFilter || pdl?.occupation === occupationFilter;

            return (
                matchCivil &&
                matchReligion &&
                matchLaw &&
                matchCrimeCategory &&
                matchOffense &&
                matchCourt &&
                matchPrecinct &&
                matchGang &&
                matchEthnicity &&
                matchSkill &&
                matchTalent &&
                matchInterest &&
                matchLook &&
                matchEducation &&
                matchOccupation
            );
        };

        const filteredPDLs = allPDLs?.results?.filter(applyFilters) || [];
        // Gender-based counts
        const male = filteredPDLs.filter(pdl => pdl?.person?.gender?.gender_option === 'Male').length;
        const gay = filteredPDLs.filter(pdl => pdl?.person?.gender?.gender_option === 'LGBTQ + GAY / BISEXUAL').length;
        const transgender = filteredPDLs.filter(pdl => pdl?.person?.gender?.gender_option === 'LGBTQ + TRANSGENDER').length;

        // Status-based counts
        const releasedCount = filteredPDLs.filter(pdl => pdl?.status === 'Released').length;
        const hospitalizedCount = filteredPDLs.filter(pdl => pdl?.status === 'Hospitalized').length;
        const convictedCount = filteredPDLs.filter(pdl => pdl?.status === 'Convicted').length;
        const committedCount = filteredPDLs.filter(pdl => pdl?.status === 'Committed').length;

        const pdlSummary = [
            ["Summary Count of PDLs", "Total"],
            ["Released PDL", releasedCount],
            ["Hospitalized PDL", hospitalizedCount],
            ["Convicted PDL", convictedCount],
            ["Committed PDL", committedCount],
            ["Total", releasedCount + hospitalizedCount + convictedCount + committedCount]
        ];

        const genderSummary = [
            ["PDL Count Based on Gender", "Total"],
            ["Male", male],
            ["Gay", gay],
            ["Transgender", transgender],
            ["Total", male + gay + transgender]
        ];

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.aoa_to_sheet(pdlSummary);
        const ws2 = XLSX.utils.aoa_to_sheet(genderSummary);

        XLSX.utils.book_append_sheet(wb, ws1, "PDL Summary");
        XLSX.utils.book_append_sheet(wb, ws2, "Gender Summary");

        XLSX.writeFile(wb, "PDL_Summary_Report.xlsx");
    };

    const exportPDLSummaryWithPdfMake = () => {
        const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : '';
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;

        const applyFilters = (pdl) => {
            const matchCivil = !civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter;
            const matchReligion = !religionFilter || pdl?.person?.religion === religionFilter;
            const matchLaw = !lawFilter || pdl?.cases[0]?.offense?.law === lawFilter;
            const matchCrimeCategory = !crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category === crimeCategoryFilter;
            const matchOffense = !offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter;
            const matchCourt = !courtFilter || pdl?.cases[0]?.court_branch?.court === courtFilter;

            const matchPrecinct = !policePrecinctFilter || pdl?.precinct === policePrecinctFilter;
            const matchGang = !gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter;
            const matchEthnicity = !ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter;
            const matchSkill = !skillFilter || pdl?.person?.skills?.some(skill => skill.name === skillFilter);
            const matchTalent = !talentFilter || pdl?.person?.talents?.some(talent => talent.name === talentFilter);
            const matchInterest = !interestFilter || pdl?.person?.interests?.some(interest => interest.name === interestFilter);
            const matchLook = !lookFilter || pdl?.look === lookFilter;
            const matchEducation = !educationFilter || pdl?.person?.education_backgrounds?.some(ed => ed.educational_attainment === educationFilter);
            const matchOccupation = !occupationFilter || pdl?.occupation === occupationFilter;

            return (
                matchCivil &&
                matchReligion &&
                matchLaw &&
                matchCrimeCategory &&
                matchOffense &&
                matchCourt &&
                matchPrecinct &&
                matchGang &&
                matchEthnicity &&
                matchSkill &&
                matchTalent &&
                matchInterest &&
                matchLook &&
                matchEducation &&
                matchOccupation
            );
        };

        const filteredPDLs = allPDLs?.results?.filter(applyFilters) || [];

        // Gender-based counts
        const male = filteredPDLs.filter(pdl => pdl?.person?.gender?.gender_option === 'Male').length;
        const gay = filteredPDLs.filter(pdl => pdl?.person?.gender?.gender_option === 'LGBTQ + GAY / BISEXUAL').length;
        const transgender = filteredPDLs.filter(pdl => pdl?.person?.gender?.gender_option === 'LGBTQ + TRANSGENDER').length;
        const totalGender = male + gay + transgender;

        // Status-based counts
        const releasedCount = filteredPDLs.filter(pdl => pdl?.status === 'Released').length;
        const hospitalizedCount = filteredPDLs.filter(pdl => pdl?.status === 'Hospitalized').length;
        const convictedCount = filteredPDLs.filter(pdl => pdl?.status === 'Convicted').length;
        const committedCount = filteredPDLs.filter(pdl => pdl?.status === 'Committed').length;
        const totalStatus = releasedCount + hospitalizedCount + convictedCount + committedCount;

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: [
                {
                    text: 'PDL Summary Report',
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
                { text: "\nSummary Count of PDLs" },
                {
                    table: {
                        widths: ["*", "auto"],
                        body: [
                            [
                                { text: "Summary Count of PDLs", bold: true },
                                { text: "Total", bold: true }
                            ],
                            ["Released PDL", releasedCount],
                            ["Hospitalized PDL", hospitalizedCount],
                            ["Convicted PDL", convictedCount],
                            ["Committed PDL", committedCount],
                            [
                                { text: "Total", bold: true },
                                { text: totalStatus, bold: true }
                            ]
                        ]
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
                { text: "\nPDL Count Based on Gender" },
                {
                    table: {
                        widths: ["*", "auto"],
                        body: [
                            [
                                { text: "Gender", bold: true },
                                { text: "Total", bold: true }
                            ],
                            ["Male", male],
                            ["Gay", gay],
                            ["Transgender", transgender],
                            [
                                { text: "Total", bold: true },
                                { text: totalGender, bold: true }
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

        pdfMake.createPdf(docDefinition).download("PDL_Summary_Report.pdf");
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className='flex justify-between items-center my-5'>
                <div className='border border-gray-100 rounded-md p-5 flex flex-col w-80'>
                    <h1 className="font-semibold">Total Count of PDL</h1>
                    <div className="font-extrabold text-2xl flex ml-auto text-[#1E365D]">
                        {summarydata?.success?.current_pdl_population?.Active ?? 0}
                    </div>
                </div>
                <div className="flex justify-end items-center gap-2">
                    <div>
                        <div className="relative inline-block text-left w-80" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="w-full border border-gray-300 rounded p-2 text-left text-gray-500 bg-white"
                            >
                                {buttonText}
                                <span className="float-right">&#9662;</span>
                            </button>
                            {open && (
                                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-96 overflow-auto z-10">
                                {/* Law Group */}
                                <div>
                                    <button
                                    onClick={() => setOpenGroup(openGroup === "law" ? null : "law")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                    >
                                    Law
                                    <span>{openGroup === "law" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                                    </button>
                                    {openGroup === "law" && (
                                    <ul className="border-t border-gray-200">
                                        <li
                                        key="law-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                            !lawFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("law", "")}
                                        >
                                        All Law
                                        </li>
                                        {law.map((law) => (
                                        <li
                                            key={law.id}
                                            className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            lawFilter === law.name ? "font-bold bg-gray-100" : ""
                                            }`}
                                            onClick={() => onSelect("law", law.name)}
                                        >
                                            {law.name}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </div>
                                {/* Crime Category Group */}
                                <div>
                                    <button
                                    onClick={() => setOpenGroup(openGroup === "crime-category" ? null : "crime-category")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                    >
                                        Crime Categories
                                    <span>{openGroup === "crime-category" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                                    </button>
                                    {openGroup === "crime-category" && (
                                    <ul className="border-t border-gray-200">
                                        <li
                                        key="crime-category-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                            !crimeCategoryFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("crime-category", "")}
                                        >
                                        All Crime Category
                                        </li>
                                        {crimeCategory.map((crime_category) => (
                                        <li
                                            key={crime_category?.id}
                                            className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            crimeCategoryFilter === crime_category?.crime_category_name ? "font-bold bg-gray-100" : ""
                                            }`}
                                            onClick={() => onSelect("crime-category", crime_category?.crime_category_name)}
                                        >
                                            {crime_category?.crime_category_name}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </div>
                                {/* Offense Group */}
                                <div>
                                    <button
                                    onClick={() => setOpenGroup(openGroup === "offense" ? null : "offense")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                    >
                                        Offense
                                    <span>{openGroup === "offense" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                                    </button>
                                    {openGroup === "offense" && (
                                    <ul className="border-t border-gray-200">
                                        <li
                                        key="offense-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                            !offenseFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("offense", "")}
                                        >
                                        All Offenses
                                        </li>
                                        {offense.map((offense) => (
                                        <li
                                            key={offense?.id}
                                            className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            offenseFilter === offense?.offense ? "font-bold bg-gray-100" : ""
                                            }`}
                                            onClick={() => onSelect("offense", offense?.offense)}
                                        >
                                            {offense?.offense}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </div>
                                {/* Court Branch Group */}
                                <div>
                                    <button
                                    onClick={() => setOpenGroup(openGroup === "court" ? null : "court")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                    >
                                        Court Branch
                                    <span>{openGroup === "court" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                                    </button>
                                    {openGroup === "court" && (
                                    <ul className="border-t border-gray-200">
                                        <li
                                        key="court-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                            !offenseFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("court", "")}
                                        >
                                        All Court Branch
                                        </li>
                                        {court.map((court) => (
                                        <li
                                            key={court?.id}
                                            className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                                courtFilter === `${court?.court} - ${court?.branch}` ? "font-bold bg-gray-100" : ""
                                            }`}
                                            onClick={() => onSelect("court", `${court?.court} - ${court?.branch}`)}
                                            >
                                            {`${court?.court} - ${court?.branch}`}
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
                                    <span>{openGroup === "religion" ? <IoIosArrowUp /> : <IoIosArrowDown/>}</span>
                                    </button>
                                    {openGroup === "religion" && (
                                    <ul className="border-t border-gray-200">
                                        <li
                                        key="religion-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                            !religionFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("religion", "")}
                                        >
                                        All Religions
                                        </li>
                                        {religions.map((religion) => (
                                        <li
                                            key={religion.id}
                                            className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            religionFilter === religion.name ? "font-bold bg-gray-100" : ""
                                            }`}
                                            onClick={() => onSelect("religion", religion.name)}
                                        >
                                            {religion.name}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </div>
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
                                        All Civil Statuses
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
                                {/* Police Precinct Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "police-precinct" ? null : "police-precinct")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Police Precinct
                                    <span>{openGroup === "police-precinct" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "police-precinct" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="police-precinct-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !policePrecinctFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("precinct", "")}
                                    >
                                        All Precincts
                                    </li>
                                    {policePrecinct.map((precinct) => (
                                        <li
                                        key={precinct?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            policePrecinctFilter === precinct?.precinct_name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("precinct", precinct?.precinct_name)}
                                        >
                                        {precinct?.precinct_name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Gang Affiliation Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "gang-affiliations" ? null : "gang-affiliations")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Gang Affiliation
                                    <span>{openGroup === "gang-affiliations" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "gang-affiliations" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="gang-affiliations-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !gangAffiliationFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("gang-affiliations", "")}
                                    >
                                        All Gang Affiliations
                                    </li>
                                    {gangAffiliation.map((gang) => (
                                        <li
                                        key={gang?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            gangAffiliationFilter === gang?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("gang", gang?.name)}
                                        >
                                        {gang?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Ethnicity Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "ethnicities" ? null : "ethnicities")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Ethnicity
                                    <span>{openGroup === "ethnicities" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "ethnicities" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="ethnicities-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !ethnicityFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("ethnicities", "")}
                                    >
                                        All Ethnicities
                                    </li>
                                    {ethnicity.map((ethnicity) => (
                                        <li
                                        key={ethnicity?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            ethnicityFilter === ethnicity?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("ethnicity", ethnicity?.name)}
                                        >
                                        {ethnicity?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Skill Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "skills" ? null : "skills")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Skill
                                    <span>{openGroup === "skills" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "skills" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="skills-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !skillFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("skills", "")}
                                    >
                                        All Skills
                                    </li>
                                    {skill.map((skill) => (
                                        <li
                                        key={skill?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            skillFilter === skill?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("skills", skill?.name)}
                                        >
                                        {skill?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Talent Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "talents" ? null : "talents")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Talent
                                    <span>{openGroup === "talents" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "talents" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="talents-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !talentFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("talents", "")}
                                    >
                                        All Talents
                                    </li>
                                    {talents.map((talent) => (
                                        <li
                                        key={talent?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            talentFilter === talent?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("talent", talent?.name)}
                                        >
                                        {talent?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Interest Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "interests" ? null : "interests")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Interest
                                    <span>{openGroup === "interests" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "interests" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="interests-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !interestFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("interests", "")}
                                    >
                                        All Interests
                                    </li>
                                    {interest.map((interest) => (
                                        <li
                                        key={interest?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            interestFilter === interest?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("interest", interest?.name)}
                                        >
                                        {interest?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Look Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "looks" ? null : "looks")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Look
                                    <span>{openGroup === "looks" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "looks" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="looks-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !lookFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("looks", "")}
                                    >
                                        All Looks
                                    </li>
                                    {look.map((look) => (
                                        <li
                                        key={look?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            lookFilter === look?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("look", look?.name)}
                                        >
                                        {look?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Education Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "educational-attainment" ? null : "educational-attainment")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Educational Attainment
                                    <span>{openGroup === "educational-attainment" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "educational-attainment" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="educational-attainment-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !educationFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("educational-attainment", "")}
                                    >
                                        All Educational Attainment
                                    </li>
                                    {education.map((education) => (
                                        <li
                                        key={education?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            educationFilter === education?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("educational-attainment", education?.name)}
                                        >
                                        {education?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                {/* Occupation Group */}
                                <div>
                                <button
                                    onClick={() => setOpenGroup(openGroup === "occupations" ? null : "occupations")}
                                    className="w-full px-4 py-2 font-semibold text-left hover:bg-gray-100 flex justify-between items-center"
                                >
                                    Occupation
                                    <span>{openGroup === "occupations" ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </button>
                                {openGroup === "occupations" && (
                                    <ul className="border-t border-gray-200">
                                    <li
                                        key="occupations-all"
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                        !occupationFilter ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("occupations", "")}
                                    >
                                        All Occupations
                                    </li>
                                    {occupation.map((occupation) => (
                                        <li
                                        key={occupation?.id}
                                        className={`px-4 py-1 cursor-pointer hover:bg-gray-100 ${
                                            occupationFilter === occupation?.name ? "font-bold bg-gray-100" : ""
                                        }`}
                                        onClick={() => onSelect("occupation", occupation?.name)}
                                        >
                                        {occupation?.name}
                                        </li>
                                    ))}
                                    </ul>
                                )}
                                </div>
                                </div>
                            )}
                            </div>
                        </div>
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
                    <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Summary Count of PDLs Based on their Status</h1>
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
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">
                                    {
                                        allPDLs?.results?.filter(pdl =>
                                        pdl.status === "Released" && // or your status field for Released
                                        (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                        (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&
                                        (!lawFilter || pdl.cases[0]?.offense?.law === lawFilter) &&
                                        (!crimeCategoryFilter || pdl.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                        (!offenseFilter || pdl.cases[0]?.offense?.offense === offenseFilter) &&
                                        (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter)  &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                        ).length || 0
                                    }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Hospitalized PDL</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">
                                    {
                                        allPDLs?.results?.filter(pdl =>
                                        pdl?.status === "Hospitalized" &&
                                        (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                        (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&
                                        (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                        (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                        (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                        (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                        ).length || 0
                                    }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Convicted PDL</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">
                                    {
                                        allPDLs?.results?.filter(pdl =>
                                        pdl.status === "Convicted" &&
                                        (!civilStatusFilter || pdl.person.civil_status === civilStatusFilter) &&
                                        (!religionFilter || pdl.person.religion?.name === religionFilter) &&
                                        (!lawFilter || pdl.cases[0]?.offense?.law === lawFilter) &&
                                        (!crimeCategoryFilter || pdl.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                        (!offenseFilter || pdl.cases[0]?.offense?.offense === offenseFilter) &&
                                        (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                        ).length || 0
                                    }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Committed PDL</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap">
                                    {
                                        allPDLs?.results?.filter(pdl =>
                                        pdl.status === "Committed" &&
                                        (!civilStatusFilter || pdl?.person.civil_status === civilStatusFilter) &&
                                        (!religionFilter || pdl?.person.religion?.name === religionFilter)   &&                                     
                                        (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                        (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                        (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                        (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                        ).length || 0
                                    }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                                    <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">
                                    {
                                        allPDLs?.results?.filter(pdl =>
                                        (!civilStatusFilter || pdl?.person.civil_status === civilStatusFilter) &&
                                        (!religionFilter || pdl?.person.religion?.name === religionFilter) &&
                                        (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                        (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                        (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                        (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter) &&
                                        ["Released", "Hospitalized", "Convicted", "Committed"].includes(pdl.status)
                                        ).length || 0
                                    }
                                    </td>
                                </tr>
                                </tbody>
                        </table>
                    </div>
                </div>

                {/* PDL Count Based on Gender */}
                <div className="w-full">
                    <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>PDL Count Based on their Gender</h1>
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
                                <td className="px-6 py-2 text-lg whitespace-nowrap">
                                {allPDLs?.results?.filter(pdl =>
                                    pdl?.person?.gender?.gender_option === 'Male' &&
                                    (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                    (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&                                   
                                    (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                    (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                    (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                        (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                ).length || 0}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 text-lg whitespace-nowrap border-r">LGBTQIA+</td>
                                <td className="px-6 py-2 text-lg whitespace-nowrap">
                                {allPDLs?.results?.filter(pdl =>
                                    pdl?.person?.gender?.gender_option === 'LGBTQ + GAY / BISEXUAL' &&
                                    (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                    (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&                                    
                                    (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                    (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                    (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                    (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                ).length || 0}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 text-lg whitespace-nowrap border-r">Transgender</td>
                                <td className="px-6 py-2 text-lg whitespace-nowrap">
                                {allPDLs?.results?.filter(pdl =>
                                    pdl?.person?.gender?.gender_option === 'LGBTQ + TRANSGENDER' &&
                                    (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                    (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&
                                    (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                    (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                    (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                    (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                ).length || 0}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-2 text-lg whitespace-nowrap border-r bg-gray-100 font-semibold">Total</td>
                                <td className="px-6 py-2 text-lg whitespace-nowrap bg-gray-100 font-semibold">
                                {
                                    (allPDLs?.results?.filter(pdl =>
                                    pdl?.person?.gender?.gender_option === 'Male' &&
                                    (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                    (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&
                                    (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                    (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                    (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                    (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                    ).length || 0) +
                                    (allPDLs?.results?.filter(pdl =>
                                    pdl?.person?.gender?.gender_option === 'LGBTQ + GAY / BISEXUAL' &&
                                    (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                    (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&
                                    (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                    (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                    (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                    (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                    ).length || 0) +
                                    (allPDLs?.results?.filter(pdl =>
                                    pdl?.person?.gender?.gender_option === 'LGBTQ + TRANSGENDER' &&
                                    (!civilStatusFilter || pdl?.person?.civil_status === civilStatusFilter) &&
                                    (!religionFilter || pdl?.person?.religion?.name === religionFilter) &&
                                    (!lawFilter || pdl?.cases[0]?.offense?.law === lawFilter) &&
                                    (!crimeCategoryFilter || pdl?.cases[0]?.offense?.crime_category_name === crimeCategoryFilter) &&
                                    (!offenseFilter || pdl?.cases[0]?.offense?.offense === offenseFilter) &&
                                    (!courtFilter || pdl.cases[0]?.court_branch?.court === courtFilter) &&
                                        (!policePrecinctFilter || pdl?.precinct === policePrecinctFilter) &&
                                        (!gangAffiliationFilter || pdl?.gang_affiliation === gangAffiliationFilter) &&
                                        (!ethnicityFilter || pdl?.person?.ethnicity_province === ethnicityFilter) &&
                                        (!skillFilter || pdl?.person?.skills?.[0]?.name === skillFilter) &&
                                        (!talentFilter || pdl?.person?.talents?.[0]?.name === talentFilter) &&
                                        (!interestFilter || pdl?.person?.interests?.[0]?.name === interestFilter) &&
                                        (!lookFilter || pdl?.look === lookFilter) &&
                                        (!educationFilter || pdl?.person?.education_backgrounds?.[0]?.educational_attainment === educationFilter) &&
                                        (!occupationFilter || pdl?.occupation === occupationFilter)
                                    ).length || 0)
                                }
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCountofPDLs;