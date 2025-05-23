import { getJail, getPersonnel, getSummary_Card, getSummaryDaily } from "@/lib/queries";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useNavigate } from "react-router-dom";
import bjmp from '../../assets/Logo/bjmp.png';
import bjmpro from '../../assets/Logo/BJMPRO.png';
import bp from '../../assets/Logo/BP.png';
import lqp from '../../assets/Logo/LQP.png';
import qcjmd from '../../assets/Logo/QCJMD.png';
import population from '../../assets/Icons/population.png';
import rate from '../../assets/Icons/rate.png';
import male from '../../assets/Icons/male.png';
import gay from '../../assets/Icons/gay.png';
import release from '../../assets/Icons/release.png';
import hospital from '../../assets/Icons/hospital.png';
import prison from '../../assets/Icons/prison.png';
import release_pdl from '../../assets/Icons/release_pdl.png'
import trans from '../../assets/Icons/trans.png'
import pdl_enter from '../../assets/Icons/pdl_entered.png'
import exited from '../../assets/Icons/exited.png'
import emergency from '../../assets/Icons/emergency.png'
import malfunction from '../../assets/Icons/malfunction.png'
import illegal from '../../assets/Icons/illegal.png'
import on_duty from '../../assets/Icons/on-duty.png'
import off_duty from '../../assets/Icons/off-duty.png'
import personnel_male from '../../assets/Icons/personnel_male.png'
import personnel_woman from '../../assets/Icons/personnel_woman.png'
import visitor_male from '../../assets/Icons/visitor_male.png'
import visitor_female from '../../assets/Icons/visitor_female.png'
import { RiShareBoxLine } from "react-icons/ri";
import { IoMdRefresh } from "react-icons/io";
import { RxEnterFullScreen } from "react-icons/rx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getVisitor } from "@/lib/query";
import { Title } from "./components/SummaryCards";
import { BASE_URL } from "@/lib/urls";

const Dashboard = () => {
    const queryClient = useQueryClient();
    const handle = useFullScreenHandle();
    const token = useTokenStore().token;
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toLocaleDateString('en-us', { year: "numeric", month: "long", day: "numeric" });
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const isFullscreen = handle.active;

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    const { data: dailysummarydata } = useQuery({
        queryKey: ['daily-summary'],
        queryFn: () => getSummaryDaily(token ?? "")
    });

    const { data: jail } = useQuery({
        queryKey: ['jail'],
        queryFn: () => getJail(token ?? "")
    });

    const { data: personnelData } = useQuery({
        queryKey: ['personnel'],
        queryFn: () => getPersonnel(token ?? "")
    });

    const { data: visitorData } = useQuery({
        queryKey: ['visitor'],
        queryFn: () => getVisitor(token ?? "")
    });
const [dateField, setDateField] = useState('date_convicted');
    const [startYear, setStartYear] = useState(currentYear.toString());
    const [endYear, setEndYear] = useState(currentYear.toString());

    const fetchQuarterly = async () => {
        const res = await fetch(`${BASE_URL}/api/dashboard/summary-dashboard/get-quarterly-pdl-summary?date_field=${dateField}&start_year=${startYear}&end_year=${endYear}`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: quarterlyData } = useQuery({
        queryKey: ['quarterly-summary', dateField, startYear, endYear],
        queryFn: fetchQuarterly,
        enabled: !!token 
    });

    const quarterlyCounts = quarterlyData?.success?.quarterly_pdl_summary || {};

    const totalAdmissionCount = dateField === 'date_of_admission'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : 0;

    const totalReleasedCount = dateField === 'date_released'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : 0;

    const totalHospitalizedCount = dateField === 'date_hospitalized'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : 0;

    {/* const totalConvictedCount = dateField === 'date_convicted'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : 0; */}
    
    

    const totalJailCapacity = Array.isArray(jail?.results)
        ? jail.results.reduce((sum: any, item: { jail_capacity: any; }) => sum + (item.jail_capacity || 0), 0)
        : 0;

    const latestDate = Object.keys(dailysummarydata?.success.daily_visit_summary || {})[0];
    const summary = dailysummarydata?.success.daily_visit_summary[latestDate];


    const personnelResults = personnelData?.results || [];
    const personnelMaleCount = personnelResults.filter(
        p => p?.person?.gender?.gender_option === "Male"
    ).length;
    const personnelFemaleCount = personnelResults.filter(
        p => p?.person?.gender?.gender_option === "Female"
    ).length;
    const personnelOtherCount = personnelResults.filter(
        p => p?.person?.gender?.gender_option !== "Male" &&
            p?.person?.gender?.gender_option !== "Female"
    ).length;

    const visitorResults = visitorData?.results || [];
    const visitorMaleCount = visitorResults.filter(
        p => p?.person?.gender?.gender_option === "Male"
    ).length;
    const visitorFemaleCount = visitorResults.filter(
        p => p?.person?.gender?.gender_option === "Female"
    ).length;
    const visitorOtherCount = visitorResults.filter(
        p => p?.person?.gender?.gender_option !== "Male" &&
            p?.person?.gender?.gender_option !== "Female"
    ).length;

    const visitorGenderData = [
        { name: 'Male', value: visitorMaleCount ?? 0 },
        { name: 'Female', value: visitorFemaleCount ?? 0 },
        { name: 'Other', value: visitorOtherCount ?? 0 },
    ];
    const personnelGenderData = [
        { name: 'Male', value: personnelMaleCount ?? 0 },
        { name: 'Female', value: personnelFemaleCount ?? 0 },
        { name: 'Other', value: personnelOtherCount ?? 0 },
    ];
    const genderData = [
        { name: 'Male', value: summarydata?.success.pdls_based_on_gender?.Active?.Male || 0 },
        { name: 'Gay', value: summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0 },
        { name: 'Transgender', value: summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0 },
    ];
    const PDL_COLORS = ['#3471EC', '#7ED26C', '#FE319D'];
    const COLORS = ['#3471EC', '#FE319D', '#AF4BCE'];


    const PDLEnteredExitData = [
        { name: 'Entered', value: summary?.pdl_station_visits || 0 },
        { name: 'Exited', value: 0 },
    ];

    const VisitorEnteredExitData = [
        { name: 'Entered', value: (summary?.main_gate_tracking ?? 0) + (summary?.visitor_station_visits ?? 0)},
        { name: 'Exited', value: 0 },
    ];

    const PersonnelEnteredExitData = [
        { name: 'Entered', value: summarydata?.success.premises_logs.personnel_logs_today["Time In"] || 0},
        { name: 'Exited', value: summarydata?.success.premises_logs.personnel_logs_today["Time Out"] || 0 },
    ];

    const ServiceEnteredExitData = [
        { name: 'Entered', value: 0},
        { name: 'Exited', value: 0 },
    ];

    const NonRegisterEnteredExitData = [
        { name: 'Entered', value: 0},
        { name: 'Exited', value: 0 },
    ];

    const onOffDutyPersonnelData = [
        { name: 'Entered', value: summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0},
        { name: 'Exited', value: summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0,},
    ];

    const EmergencyMalfunctionData = [
        { name: 'Emergency', value: 0},
        { name: 'Malfunction of System', value: 0,},
        { name: 'Illegal Entry/Exit', value: 0,},
    ];

    const ActionTakenData = [
        { name: 'Action Taken Emergency', value: 0},
        { name: 'Malfunction of System', value: 0,},
        { name: 'Illegal Entry/Exit', value: 0,},
    ];

    const PDLEnteredExitCOLORS = ['#00B21B', '#97A5BB'];
    const VisitorEnteredExitCOLORS = ['#FE8F04', '#97A5BB'];
    const PersonnelEnteredExitCOLORS = ['#E73D34', '#97A5BB'];
    const ServiceProviderEnteredExitCOLORS = ['#1CBEDB', '#97A5BB'];
    const NonRegisterEnteredExitCOLORS = ['#E847D8', '#97A5BB'];
    const onOffDutyPersonnelEnteredExitCOLORS = ['#0D5ACF', '#739EDF'];
    const EmergencyMalfunctionEnteredExitCOLORS = ['#F63554', '#F7EA39', '#1EE9E4'];
    const ActionTakenEnteredExitCOLORS = ['#843EEE', '#F7C439', '#20B1EF'];
    
    const Card2 = (props: {
        title: string;
        image: string;
        count: number | string;
        linkto?: string;
        state?: any;
    }) => {
        const navigate = useNavigate();
        const { title, image, count, linkto, state } = props;

        const handleClick = () => {
            if (linkto) {
                navigate(linkto, { state });
            }
        };

        return (
            <div
                className='rounded-lg flex flex-grow items-center gap-2 p-2 w-full bg-[#F6F7FB] hover:cursor-pointer'
                onClick={handleClick}
            >
                <div className='bg-[#D3DFF0] p-1 rounded-full'>
                    <img src={image} className='w-10' alt={title} />
                </div>
                <div className='flex gap-2 items-center'>
                    <div className='text-[#1E365D] font-extrabold text-3xl'>{count}</div>
                    <p className='text-[#121D26] text-lg font-semibold'>{title}</p>
                </div>
            </div>
        );
    };

        const Card3 = (props: {
        title: string;
        image: string;
        count: number | string;
        linkto?: string;
        state?: any;
    }) => {
        const navigate = useNavigate();
        const { title, image, count, linkto, state } = props;

        const handleClick = () => {
            if (linkto) {
                navigate(linkto, { state });
            }
        };

        return (
            <div
                className='rounded-lg flex flex-grow items-center gap-2 p-2 w-full bg-[#F6F7FB] hover:cursor-pointer'
                onClick={handleClick}
            >
                <div className='bg-[#D3DFF0] p-1 rounded-full'>
                    <img src={image} className='w-10' alt={title} />
                </div>
                <div className='flex flex-col'>
                    <div className='text-[#1E365D] font-extrabold text-3xl'>{count}</div>
                    <p className='text-[#121D26] text-lg font-semibold'>{title}</p>
                </div>
            </div>
        );
    };

    const exportDashboard = async () => {
        const input = document.getElementById("dashboard");
        if (!input) return;

        const canvas = await html2canvas(input, {
            scale: 2, 
            useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("dashboard.pdf");
        };

        const exportInFullscreen = async () => {
        if (!handle.active) {
            await handle.enter(); 
            setTimeout(() => exportDashboard(), 500);
        } else {
            exportDashboard();
        }
    };

    const renderLegendCircle = (props: any) => {
        const { payload } = props;
        return (
            <ul className="flex flex-wrap gap-2 items-center justify-center">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-2">
                        <span
                            style={{
                                display: 'inline-block',
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: entry.color,
                            }}
                        />
                        <span className="text-sm">{entry.value}</span>
                    </li>
                ))}
            </ul>
        );
    };
    const handleReset = () => {
        setTime(new Date().toLocaleTimeString());
        queryClient.clear();
        queryClient.invalidateQueries({ queryKey: ['summary-card'] });
        queryClient.invalidateQueries({ queryKey: ['jail'] });
        queryClient.invalidateQueries({ queryKey: ['personnel'] });
        console.log("Dashboard reset triggered.");
    };
    return (
        <div>
            <div id="dashboard">
                {/* <div className="bg-white border shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col gap-2 max-w-full md:max-w-sm lg:max-w-[16rem] w-full flex-[1.2]">
                    <label>
                        Date Field:
                        <select onChange={(e) => setDateField(e.target.value)} value={dateField}>
                            <option value="date_convicted">Date Convicted</option>
                            <option value="date_hospitalized">Date Hospitalized</option>
                            <option value="date_of_admission">Date of Admission</option>
                            <option value="date_released">Date Released</option>
                        </select>
                    </label>
                    <label>
                        Start Year:
                        <input 
                            type="number" 
                            onChange={(e) => setStartYear(e.target.value)} 
                            value={startYear} 
                            min="2000" 
                            max="2100"
                        />
                    </label>
                    <label>
                        End Year:
                        <input 
                            type="number" 
                            onChange={(e) => setEndYear(e.target.value)} 
                            value={endYear} 
                            min="2000" 
                            max="2100"
                        />
                    </label>
                </div> */}
                <FullScreen handle={handle}>
                    <div  className={`w-full ${isFullscreen ? "h-screen bg-[#F6F7FB]" : ""} space-y-2  text-sm`}
                        style={{
                            minHeight: isFullscreen ? "100vh" : undefined,
                            height: isFullscreen ? "100vh" : undefined,
                            overflowY: isFullscreen ? "auto" : undefined,
                            padding: isFullscreen ? "0.5rem" : undefined,
                        }}>
                        <div className="bg-white border flex flex-wrap items-center justify-center md:justify-between border-[#1E7CBF]/25 shadow-sm rounded-lg p-5">
                            <div className='flex flex-wrap gap-2'>
                                <img src={bjmp} className='w-16' />
                                <img src={bjmpro} className='w-16' />
                                <img src={qcjmd} className='w-16' />
                                <img src={lqp} className='w-16' />
                                <img src={bp} className='w-16' />
                            </div>
                            <div className='mb-6 md:mb-0 text-center md:text-right'>
                                <h1 className="text-4xl font-extrabold text-[#32507D]">
                                    BJMP Quezon City Jail - Male Dormitory Dashboard
                                </h1>
                                <p className="text-sm">{currentDate} at {time}</p>
                            </div>
                        </div>

                        {/* 1ST ROW */}
                        <div className="w-full flex flex-col lg:flex-row gap-2 mt-2">
                            {/* Cards Column */}
                            <div className="bg-white border shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col gap-2
                                max-w-full md:max-w-sm lg:max-w-[16rem] w-full
                                flex-[1.2]">
                                <Card3
                                    image={population}
                                    title='Jail Population'
                                    count={summarydata?.success?.current_pdl_population?.Active}
                                    linkto='/jvms/pdls/pdl'
                                />
                                <Card3
                                    image={rate}
                                    title='Jail Capacity'
                                    count={totalJailCapacity}
                                    linkto="/jvms/assets/jail-facility"
                                />
                                <Card3
                                    image={release}
                                    title='Congestion Rate'
                                    count={summarydata?.success.jail_congestion_rates.total_congestion_rate === "Total capacity not set or zero" ? '0' : `${(parseFloat(summarydata?.success.jail_congestion_rates.total_congestion_rate) || 0).toFixed(2)}%`}
                                />
                            </div>
                            {isFullscreen && (
                                <div className="bg-white border shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col gap-2
                                max-w-full md:max-w-sm lg:max-w-[16rem] w-full
                                flex-[1.2]">
                                    <Card3 
                                        image={release_pdl} 
                                        title="Released PDL" 
                                        count={totalReleasedCount} 
                                        linkto="/jvms/pdls/pdl"
                                        state={{ filterOption: "Released" }}
                                    />
                                    <Card3 
                                        image={prison} 
                                        title='Committed PDL' 
                                        count={totalAdmissionCount} 
                                        linkto="/jvms/pdls/pdl"
                                        state={{ filterOption: "Commited" }}
                                    />
                                    <Card3 
                                        image={hospital} 
                                        title='Hospitalized PDL' 
                                        count={totalHospitalizedCount} 
                                        linkto="/jvms/pdls/pdl"
                                        state={{ filterOption: "Hospitalized" }}
                                    />
                                    {/* <Card3 
                                    image={release_pdl} 
                                    title='Released PDL' 
                                    count={summarydata?.success.total_released_pdls.Active ?? 0} 
                                    linkto="/jvms/pdls/pdl"
                                    state={{ filterOption: "Release" }}/> */}
                                    {/* <Card3 image={prison} title='Committed PDL' count={summarydata?.success.total_pdl_by_status.Commited.Active ?? 0} />
                                    <Card3 image={hospital} title='Hospitalized PDL' count={summarydata?.success.total_hospitalized_pdls.Active || 0} /> */}
                                </div>
                            )}
                            <div className="w-full flex flex-col md:flex-row flex-1 gap-2">
                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="PDL Based on their Gender" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={genderData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="50%"
                                                        outerRadius="90%"
                                                    >
                                                        {genderData.map((entry, index) => (
                                                            <Cell key={`cell-pdl-${index}`} fill={PDL_COLORS[index % PDL_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            <Card3
                                                image={male}
                                                title='Male'
                                                count={summarydata?.success.pdls_based_on_gender?.Active?.Male || 0}
                                                linkto='/jvms/pdls/pdl'
                                                state={{ filterOption: "Male" }}
                                            />
                                            <Card3
                                                image={gay}
                                                title='Gay'
                                                count={summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0}
                                                linkto='/jvms/pdls/pdl'
                                                state={{ filterOption: "LGBTQ + GAY / BISEXUAL" }}
                                            />
                                            <Card3
                                                image={trans}
                                                title='Transgender'
                                                count={summarydata?.success.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}
                                                linkto='/jvms/pdls/pdl'
                                                state={{ filterOption: "LGBTQ + TRANSGENDER" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="Visitor Based on their Gender" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={visitorGenderData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="50%"
                                                        outerRadius="90%"
                                                    >
                                                        {visitorGenderData.map((entry, index) => (
                                                            <Cell key={`cell-pdl-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            <Card3
                                                image={visitor_male}
                                                title='Male'
                                                count={visitorMaleCount}
                                                linkto='/jvms/visitors/visitor'
                                                state={{ genderFilter: "Male" }}
                                            />
                                            <Card3
                                                image={visitor_female}
                                                title='Female'
                                                count={visitorFemaleCount}
                                                linkto='/jvms/visitors/visitor'
                                                state={{ genderFilter: "Female" }}
                                            />
                                            <Card3
                                                image={trans}
                                                title='Others'
                                                count={visitorOtherCount}
                                                linkto='/jvms/visitors/visitor'
                                                state={{ genderFilter: "Other" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="Personnel Based on their Gender" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={personnelGenderData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="50%"
                                                        outerRadius="90%"
                                                    >
                                                        {personnelGenderData.map((entry, index) => (
                                                            <Cell key={`cell-pdl-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            <Card3
                                                image={personnel_male}
                                                title='Male'
                                                count={personnelMaleCount}
                                                linkto='/jvms/personnels/personnel'
                                                state={{ genderFilter: "Male" }}
                                            />
                                            <Card3
                                                image={personnel_woman}
                                                title='Female'
                                                count={personnelFemaleCount}
                                                linkto='/jvms/personnels/personnel'
                                                state={{ genderFilter: "Female" }}
                                            />
                                            <Card3
                                                image={trans}
                                                title='Other'
                                                count={personnelOtherCount}
                                                linkto='/jvms/personnels/personnel'
                                                state={{ genderFilter: "Other" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-col lg:flex-row gap-2 mt-2">
                            {!isFullscreen && (
                                <div className="bg-white border shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col gap-2
                                    max-w-full md:max-w-sm lg:max-w-[16rem] w-full flex-[1.2]">
                                    <Card3 
                                        image={release_pdl} 
                                        title="Released PDL" 
                                        count={totalReleasedCount} 
                                        linkto="/jvms/pdls/pdl"
                                        state={{ filterOption: "Released" }}
                                    />
                                    <Card3 
                                        image={prison} 
                                        title='Committed PDL' 
                                        count={totalAdmissionCount}  // Display total admission count here
                                        linkto="/jvms/pdls/pdl"
                                        state={{ filterOption: "Committed" }}
                                    />
                                    <Card3 
                                        image={hospital} 
                                        title='Hospitalized PDL' 
                                        count={totalHospitalizedCount} 
                                        linkto="/jvms/pdls/pdl"
                                        state={{ filterOption: "Hospitalized" }}
                                    />
                                </div>
                            )}
                            <div className="w-full flex flex-col md:flex-row flex-1 gap-2">
                                {/* PDLs */}
                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="Entry/Exits to Jail Premises of PDLs" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-[12.5rem] min-h-[100px]" : "h-64 min-h-[180px]"}`}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={PDLEnteredExitData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="50%"
                                                        outerRadius="90%"
                                                    >
                                                        {PDLEnteredExitData.map((entry, index) => (
                                                            <Cell key={`cell-pdl-${index}`} fill={PDLEnteredExitCOLORS[index % PDLEnteredExitCOLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            <Card3
                                                image={pdl_enter}
                                                title='Entered'
                                                count={summary?.pdl_station_visits || 0 }
                                            />
                                            <Card3
                                                image={exited}
                                                title='Exited'
                                                count={0}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Visitors */}
                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="Entry/Exits to Jail Premises of Visitors" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-[12.5rem] min-h-[100px]" : "h-64 min-h-[180px]"}`}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={VisitorEnteredExitData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="50%"
                                                        outerRadius="90%"
                                                    >
                                                        {VisitorEnteredExitData.map((entry, index) => (
                                                            <Cell key={`cell-pdl-${index}`} fill={VisitorEnteredExitCOLORS[index % VisitorEnteredExitCOLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            <Card3
                                                image={pdl_enter}
                                                title='Entered'
                                                count={(summary?.main_gate_tracking ?? 0) + (summary?.visitor_station_visits ?? 0)}
                                            />
                                            <Card3
                                                image={exited}
                                                title='Exited'
                                                count={0}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* BJMP Personnel */}
                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1.5">
                                        <Title title="Entry/Exits to Jail Premises of BJMP Personnel" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-[11rem] min-h-[100px]" : "h-64 min-h-[180px]"}`}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={PersonnelEnteredExitData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="50%"
                                                        outerRadius="90%"
                                                    >
                                                        {PersonnelEnteredExitData.map((entry, index) => (
                                                            <Cell key={`cell-pdl-${index}`} fill={PersonnelEnteredExitCOLORS[index % PersonnelEnteredExitCOLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            <Card2
                                                image={pdl_enter}
                                                title='Entered'
                                                count={summarydata?.success.premises_logs.personnel_logs_today.Enter || 0}
                                            />
                                            <Card2
                                                image={exited}
                                                title='Exited'
                                                count={summarydata?.success.premises_logs.personnel_logs_today.Exit ?? 0}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Service Provider (fullscreen only) */}
                                {isFullscreen && (
                                    <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                        <div className="my-1.5">
                                            <Title title="Entry/Exits to Jail Premises of Service Providers" />
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                            <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-[11rem] min-h-[100px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={ServiceEnteredExitData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="50%"
                                                            outerRadius="90%"
                                                        >
                                                            {ServiceEnteredExitData.map((entry, index) => (
                                                                <Cell key={`cell-sp-${index}`} fill={ServiceProviderEnteredExitCOLORS[index % ServiceProviderEnteredExitCOLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                                <Card2
                                                    image={pdl_enter}
                                                    title='Entered'
                                                    count={0}
                                                />
                                                <Card2
                                                    image={exited}
                                                    title='Exited'
                                                    count={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Non Service Provider (fullscreen only) */}
                                {isFullscreen && (
                                    <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                        <div className="my-1.5">
                                            <Title title="Entry/Exits to Jail Premises of Non Service Providers" />
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                            <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-[11rem] min-h-[100px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={NonRegisterEnteredExitData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="50%"
                                                            outerRadius="90%"
                                                        >
                                                            {NonRegisterEnteredExitData.map((entry, index) => (
                                                                <Cell key={`cell-nsp-${index}`} fill={NonRegisterEnteredExitCOLORS[index % NonRegisterEnteredExitCOLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                                <Card2
                                                    image={pdl_enter}
                                                    title='Entered'
                                                    count={0}
                                                />
                                                <Card2
                                                    image={exited}
                                                    title='Exited'
                                                    count={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* 3RD ROW */}
                        <div className="w-full flex flex-col md:flex-row gap-2 mt-2">
                            {/* Only show these two when NOT fullscreen */}
                            {!isFullscreen && (
                                <>
                                    <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                        <div className="my-1">
                                            <Title title="Entry/Exits to Jail Premises of Service Provider" />
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                            <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-60 min-h-[100px]" : "h-56 min-h-[160px]"}`}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={ServiceEnteredExitData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="50%"
                                                            outerRadius="90%"
                                                        >
                                                            {ServiceEnteredExitData.map((entry, index) => (
                                                                <Cell key={`cell-pdl-${index}`} fill={ServiceProviderEnteredExitCOLORS[index % ServiceProviderEnteredExitCOLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                                <Card3
                                                    image={pdl_enter}
                                                    title='Entered'
                                                    count={0}
                                                />
                                                <Card3
                                                    image={exited}
                                                    title='Exited'
                                                    count={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                        <div className="my-1">
                                            <Title title="Entry/Exits to Jail Premises of Non Register Visitor" />
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                            <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-60 min-h-[100px]" : "h-56 min-h-[160px]"}`}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={NonRegisterEnteredExitData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="50%"
                                                            outerRadius="90%"
                                                        >
                                                            {NonRegisterEnteredExitData.map((entry, index) => (
                                                                <Cell key={`cell-pdl-${index}`} fill={NonRegisterEnteredExitCOLORS[index % NonRegisterEnteredExitCOLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                                <Card3
                                                    image={pdl_enter}
                                                    title='Entered'
                                                    count={0}
                                                />
                                                <Card3
                                                    image={exited}
                                                    title='Exited'
                                                    count={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {/* Personnel section always visible */}
                            <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="BJMP Personnel On and Off Duty" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-60 min-h-[100px]" : "h-56 min-h-[160px]"}`}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={onOffDutyPersonnelData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="50%"
                                                    outerRadius="90%"
                                                >
                                                    {onOffDutyPersonnelData.map((entry, index) => (
                                                        <Cell key={`cell-pdl-${index}`} fill={onOffDutyPersonnelEnteredExitCOLORS[index % onOffDutyPersonnelEnteredExitCOLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        <Card3
                                            image={on_duty}
                                            title='On Duty'
                                            count={summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0}
                                            linkto='/jvms/personnels/personnel'
                                            state={{ filterOption: "On Duty" }}
                                        />
                                        <Card3
                                            image={off_duty}
                                            title='Off Duty'
                                            count={summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0}
                                            linkto='/jvms/personnels/personnel'
                                            state={{ filterOption: "Off Duty" }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {isFullscreen && (
                                <>
                                <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Emergency/Malfunction of System/Illegal Entry/Exit Without Registration" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-[13.6rem] min-h-[100px]" : "h-56 min-h-[160px]"}`}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={EmergencyMalfunctionData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="50%"
                                                    outerRadius="90%"
                                                >
                                                    {EmergencyMalfunctionData.map((entry, index) => (
                                                        <Cell key={`cell-pdl-${index}`} fill={EmergencyMalfunctionEnteredExitCOLORS[index % EmergencyMalfunctionEnteredExitCOLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-1 h-full">
                                        <Card2
                                            image={emergency}
                                            title='Emergency'
                                            count={0}
                                        />
                                        <Card2
                                            image={malfunction}
                                            title='Malfunction of System'
                                            count={0}
                                        />
                                        <Card2
                                            image={illegal}
                                            title='Illegal Entry/Exit'
                                            count={0}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Action Taken Emergency/Malfunction of System/Illegal Entry/Exit Without Registration" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-[13.6rem] min-h-[100px]" : "h-56 min-h-[160px]"}`}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={ActionTakenData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="50%"
                                                    outerRadius="90%"
                                                >
                                                    {ActionTakenData.map((entry, index) => (
                                                        <Cell key={`cell-pdl-${index}`} fill={ActionTakenEnteredExitCOLORS[index % ActionTakenEnteredExitCOLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-1 h-full">
                                        <Card2 image={emergency} title='Action Taken Emergency' count={0} />
                                        <Card2 image={malfunction} title='Malfunction of System' count={0} />
                                        <Card2 image={illegal} title='Illegal Entry/Exit' count={0} />
                                    </div>
                                </div>
                            </div>
                                </>
                            )}
                        </div>
                        {!isFullscreen && (
                        <div className="flex gap-2">
                            <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Emergency/Malfunction of System/Illegal Entry/Exit Without Registration" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={EmergencyMalfunctionData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="50%"
                                                    outerRadius="90%"
                                                >
                                                    {EmergencyMalfunctionData.map((entry, index) => (
                                                        <Cell key={`cell-pdl-${index}`} fill={EmergencyMalfunctionEnteredExitCOLORS[index % EmergencyMalfunctionEnteredExitCOLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        <Card3
                                            image={emergency}
                                            title='Emergency'
                                            count={0}
                                        />
                                        <Card3
                                            image={malfunction}
                                            title='Malfunction of System'
                                            count={0}
                                        />
                                        <Card3
                                            image={illegal}
                                            title='Illegal Entry/Exit'
                                            count={0}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Entry/Exits to Jail Premises of BJMP Personnel" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={PersonnelEnteredExitData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="50%"
                                                    outerRadius="90%"
                                                >
                                                    {PersonnelEnteredExitData.map((entry, index) => (
                                                        <Cell key={`cell-pdl-${index}`} fill={PersonnelEnteredExitCOLORS[index % PersonnelEnteredExitCOLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        <Card3 image={emergency} title='Action Taken Emergency' count={0} />
                                        <Card3 image={malfunction} title='Malfunction of System' count={0} />
                                        <Card3 image={illegal} title='Illegal Entry/Exit' count={0} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </FullScreen>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-end my-2 items-center">
            {/* <select
                value={summaryView}
                onChange={(e) => setSummaryView(e.target.value as any)}
                className="px-4 py-2 rounded border"
            >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
            </select>

            <input
                type="text"
                placeholder={
                summaryView === "quarterly"
                    ? "YYYY"
                    : summaryView === "monthly"
                    ? "MM-YYYY"
                    : "MM-DD-YYYY"
                }
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded border"
            />
            <input
                type="text"
                placeholder={
                summaryView === "quarterly"
                    ? "YYYY"
                    : summaryView === "monthly"
                    ? "MM-YYYY"
                    : "MM-DD-YYYY"
                }
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded border"
            />

            <button
                className="gap-2 flex text-white items-center px-6 py-1.5 bg-[#1E365D] rounded-full hover:bg-[#163050] transition"
                onClick={handleFilter}
            >
                Filter
            </button> */}

            <button
                className="gap-2 flex text-white items-center px-6 py-1.5 bg-[#1E365D] rounded-full hover:bg-[#163050] transition"
                onClick={exportInFullscreen}
            >
                <RiShareBoxLine /> Export
            </button>
            <button
                className="gap-2 flex text-white items-center px-6 py-1.5 bg-[#1E365D] rounded-full hover:bg-[#163050] transition"
                onClick={handleReset}
            >
                <IoMdRefresh /> Reset
            </button>
            <button
                className="gap-2 flex text-white items-center px-4 py-2 bg-[#1E365D] rounded-lg hover:bg-[#163050] transition"
                onClick={handle.enter}
            >
                <RxEnterFullScreen className="text-xl" />
            </button>

            {/* Message Box below buttons, full width
            {filterMessage && (
                <div
                className={`mt-4 w-full max-w-xl mx-auto text-center py-2 rounded ${
                    filterMessage.includes("Failed")
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
                role="alert"
                >
                {filterMessage}
                </div>
            )} */}
            </div>
        </div>
    )
}

export default Dashboard
