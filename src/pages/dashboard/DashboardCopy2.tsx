import {  getSummary_Card, getSummaryDaily } from "@/lib/queries";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useNavigate } from "react-router-dom";
import { HiFilter } from "react-icons/hi";
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
import { Title } from "./components/SummaryCards";
import { BASE_URL } from "@/lib/urls";
import { Input, Modal, Select, Skeleton } from "antd";

const { Option } = Select;

const Dashboard = () => {
    const queryClient = useQueryClient();
    const handle = useFullScreenHandle();
    const token = useTokenStore().token;
    const currentYear = new Date().getFullYear();
    const [isFormChanged, setIsFormChanged] = useState(false);
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
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

    const fetchSettings = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/global-system-settings/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: systemsettingdata } = useQuery({
        queryKey: ['global-settings'],
        queryFn: fetchSettings,
    });

    const selectedJail = systemsettingdata?.results[0]?.jail_facility?.jail_name || 'BJMP Quezon City Jail - Male Dormitory';

    // Function to determine the title based on selected jail
    const getJailTitle = (jail) => {
        return jail.includes('QUEZON CITY JAIL-FEMALE DORM') ? 
            'BJMP Quezon City Jail - Female Dormitory Dashboard' : 
            'BJMP Quezon City Jail - Male Dormitory Dashboard';
    };

    const [frequency, setFrequency] = useState('quarterly'); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateField, setDateField] = useState('date_convicted');
    const [startYear, setStartYear] = useState(currentYear.toString());
    const [endYear, setEndYear] = useState(currentYear.toString());

    const fetchPDLSummary = async () => {
        let url = `${BASE_URL}/api/dashboard/summary-dashboard/`;

        const params = new URLSearchParams();
        params.append('date_field', dateField);

        if (frequency === 'quarterly') {
            url += 'get-quarterly-pdl-summary';
            params.append('start_year', startYear);
            params.append('end_year', endYear);
        } else if (frequency === 'monthly') {
            url += 'get-monthly-pdl-summary';
            params.append('start_date', startDate); 
            params.append('end_date', endDate);
        } else if (frequency === 'weekly' || frequency === 'daily') {
            url += 'get-weekly-pdl-summary';
            params.append('start_date', startDate); 
            params.append('end_date', endDate);
        }

        const res = await fetch(`${url}?${params.toString()}`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: quarterlyData } = useQuery({
        queryKey: ['pdl-summary', frequency, dateField, startYear, endYear, startDate, endDate],
        queryFn: fetchPDLSummary,
        enabled: !!token,
    });


    const quarterlyCounts = quarterlyData?.success?.quarterly_pdl_summary || {};
    
    const totalReleasedCount = isFormChanged && dateField === 'date_released'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : summarydata?.success?.total_pdl_by_status?.Released?.Active ?? 0;

    const totalAdmissionCount = isFormChanged && dateField === 'date_of_admission'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : summarydata?.success?.total_pdl_by_status?.Committed?.Active ?? 0;

    const totalHospitalizedCount = isFormChanged && dateField === 'date_hospitalized'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active ?? 0;

    {/* const totalConvictedCount = dateField === 'date_convicted'
        ? Object.values(quarterlyCounts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : 0; */}
    
     const handleDateFieldChange = (value) => {
        setDateField(value);
        setIsFormChanged(true);
    };

    const handleYearChange = (setter) => (e) => {
        setter(e.target.value);
        setIsFormChanged(true);
    };

    const latestDate = Object.keys(dailysummarydata?.success.daily_visit_summary || {})[0];
    const summary = dailysummarydata?.success.daily_visit_summary[latestDate];
    const visitorOtherCount = Object.entries(summarydata?.success?.visitor_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

    // Calculate "Other" for personnel
    const personnelOtherCount = Object.entries(summarydata?.success?.personnel_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

    // Construct arrays
    const visitorGenderData = [
    { name: 'Male', value: summarydata?.success?.visitor_based_on_gender?.Active?.Male ?? 0 },
    { name: 'Female', value: summarydata?.success?.visitor_based_on_gender?.Active?.Female ?? 0 },
    { name: 'Other', value: visitorOtherCount },
    ];

    const personnelGenderData = [
    { name: 'Male', value: summarydata?.success?.personnel_based_on_gender?.Active?.Male ?? 0 },
    { name: 'Female', value: summarydata?.success?.personnel_based_on_gender?.Active?.Female ?? 0 },
    { name: 'Other', value: personnelOtherCount },
    ];

    const genderData = [
        { name: 'Male', value: summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0 },
        { name: 'Gay', value: summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0 },
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
                <div className='bg-[#D3DFF0] rounded-full'>
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
        onClick?: () => void; 
    }) => {
        const navigate = useNavigate();
        const { title, image, count, linkto, state, onClick } = props;

        const handleClick = () => {
            if (onClick) {
                onClick(); 
            }
            if (linkto) {
                navigate(linkto, { state });
            }
        };

        return (
            <div
                className='rounded-lg flex flex-grow items-center gap-2 p-2 w-full bg-[#F6F7FB] hover:cursor-pointer'
                onClick={handleClick}
            >
                <div className='bg-[#D3DFF0] rounded-full'>
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

    const showModal = () => setVisible(true);
    const handleOk = () => setVisible(false);
    const handleCancel = () => setVisible(false);

    const isLoading = !summarydata;
    const isSummaryLoading = !summarydata?.success;
    const isSettingLoading = !systemsettingdata?.results?.[0]?.jail_facility;
    const isPDLEnteredExitLoading = !PDLEnteredExitData?.length || summary?.pdl_station_visits === undefined;
    const isVisitorDataLoading = isSummaryLoading || !VisitorEnteredExitData || VisitorEnteredExitData.length === 0;
    const isPersonnelLoading = isSummaryLoading || !PersonnelEnteredExitData || PersonnelEnteredExitData.length === 0;
    const isNonServiceLoading = isSummaryLoading || !NonRegisterEnteredExitData || NonRegisterEnteredExitData.length === 0;
    const isServiceLoading = isSummaryLoading || !ServiceEnteredExitData || ServiceEnteredExitData.length === 0;
    const isVisitorGenderLoading = isSummaryLoading || !visitorGenderData || visitorGenderData.length === 0;
    const isPersonnelGenderLoading = isSummaryLoading || !personnelGenderData || personnelGenderData.length === 0;
    const isEmergencyLoading = isSummaryLoading || !EmergencyMalfunctionData || EmergencyMalfunctionData.length === 0;
    const isActionTakenLoading = isSummaryLoading || !ActionTakenData || ActionTakenData.length === 0;

    const pdlHandleClick = (gender: string) => {
        navigate(`/jvms/pdls/pdl?gender=${encodeURIComponent(gender)}`);
    };

const visitorHandleClick = (gender: string) => {
    if (gender === "Other") {
        const allGenders = Object.keys(summarydata?.success?.visitor_based_on_gender?.Active || {});
        const otherGenders = allGenders.filter(g => g !== "Male" && g !== "Female");
        const encodedGenders = otherGenders.map(g => encodeURIComponent(g)).join(",");
        navigate(`/jvms/visitors/visitor?gender=${encodedGenders}`);
    } else {
        navigate(`/jvms/visitors/visitor?gender=${encodeURIComponent(gender)}`);
    }
};
    const personnelHandleClick = (gender: string) => {
        if (gender === "Other") {
        const allGenders = Object.keys(summarydata?.success?.personnel_based_on_gender?.Active || {});
        const otherGenders = allGenders.filter(g => g !== "Male" && g !== "Female");
            const encodedGenders = otherGenders.map(g => encodeURIComponent(g)).join(",");
            navigate(`/jvms/personnels/personnel?gender=${encodedGenders}`);
        } else {
            navigate(`/jvms/personnels/personnel?gender=${encodeURIComponent(gender)}`);
        }
    };

    const pdlstatusHandleClick = (status: string) => {
        navigate(`/jvms/pdls/pdl?status=${encodeURIComponent(status)}`);
    };

    const personnelstatusHandleClick = (status: string) => {
        navigate(`/jvms/personnels/personnel?status=${encodeURIComponent(status)}`);
    };

    return (
        <div>
            <div id="dashboard">
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
                                    {getJailTitle(selectedJail)}
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
                                {(isSummaryLoading || isSettingLoading) ? (
                                    <>
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                    </>
                                ) : (
                                    <>
                                        <Card3
                                            image={population}
                                            title='Jail Population'
                                            count={summarydata?.success?.current_pdl_population?.Active ?? 0}
                                            linkto='/jvms/pdls/pdl'
                                        />
                                        <Card3
                                            image={rate}
                                            title='Jail Capacity'
                                            count={systemsettingdata?.results[0]?.jail_facility?.jail_capacity ?? 0}
                                            linkto="/jvms/assets/jail-facility"
                                        />
                                        <Card3
                                            image={release}
                                            title='Congestion Rate'
                                            count={
                                                summarydata?.success.jail_congestion_rates.total_congestion_rate === "Total capacity not set or zero"
                                                    ? '0'
                                                    : `${(parseFloat(summarydata?.success.jail_congestion_rates.total_congestion_rate) || 0).toFixed(2)}%`
                                            }
                                        />
                                    </>
                                )}
                            </div>
                            {isFullscreen && (
                                <div className="bg-white border shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col gap-2
                                    max-w-full md:max-w-sm lg:max-w-[16rem] w-full flex-[1.2]">
                                    
                                    {isSummaryLoading ? (
                                        <>
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        </>
                                    ) : (
                                        <>
                                            <Card3 
                                                image={release_pdl} 
                                                title="Released PDL" 
                                                count={totalReleasedCount} 
                                                onClick={() => pdlstatusHandleClick("Released")}
                                            />
                                            <Card3 
                                                image={prison} 
                                                title='Committed PDL' 
                                                count={totalAdmissionCount} 
                                                onClick={() => pdlstatusHandleClick("Committed")}
                                            />
                                            <Card3 
                                                image={hospital} 
                                                title='Hospitalized PDL' 
                                                count={totalHospitalizedCount} 
                                                onClick={() => pdlstatusHandleClick("Hospitalized")}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="w-full flex flex-col md:flex-row flex-1 gap-2">
                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="PDL Based on their Gender" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                            {isLoading ? (
                                                <>
                                                    <Skeleton.Input active className="w-full h-full rounded-lg" />
                                                </>
                                            ) : (
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
                                            )}
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            {isLoading ? (
                                                <>
                                                    <Skeleton.Input active size="large" className="w-full h-[80px] rounded-lg" />
                                                    <Skeleton.Input active size="large" className="w-full h-[80px] rounded-lg" />
                                                    <Skeleton.Input active size="large" className="w-full h-[80px] rounded-lg" />
                                                </>
                                            ) : (
                                                <>
                                                    <Card3
                                                        image={male}
                                                        title="Male"
                                                        count={summarydata?.success?.pdls_based_on_gender?.Active?.Male || 0}
                                                        onClick={() => pdlHandleClick("Male")}
                                                    />
                                                    <Card3
                                                        image={gay}
                                                        title="Gay"
                                                        count={summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + GAY / BISEXUAL"] || 0}
                                                        onClick={() => pdlHandleClick("LGBTQ + GAY / BISEXUAL")}
                                                    />
                                                    <Card3
                                                        image={trans}
                                                        title="Transgender"
                                                        count={summarydata?.success?.pdls_based_on_gender?.Active?.["LGBTQ + TRANSGENDER"] || 0}
                                                        onClick={() => pdlHandleClick("LGBTQ + TRANSGENDER")}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="Visitor Based on their Gender" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                        {isVisitorGenderLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                        ) : (
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
                                                    <Cell key={`cell-visitor-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                            </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        {isVisitorGenderLoading ? (
                                            <>
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                        ) : (
                                            <>
                                            <Card3
                                                image={visitor_male}
                                                title="Male"
                                                count={summarydata?.success?.visitor_based_on_gender?.Active?.Male || 0}
                                                onClick={() => visitorHandleClick("Male")}
                                            />
                                            <Card3
                                                image={visitor_female}
                                                title="Female"
                                                count={summarydata?.success?.visitor_based_on_gender?.Active?.Female || 0}
                                                onClick={() => visitorHandleClick("Female")}
                                            />
                                            <Card3
                                                image={trans}
                                                title="Other"
                                                count={visitorOtherCount || 0}
                                                onClick={() => visitorHandleClick("Other")}
                                                />
                                            </>
                                        )}
                                        </div>
                                    </div>
                                    </div>


                                <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="Personnel Based on their Gender" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-60 min-h-[100px]" : "h-64 min-h-[180px]"}`}>
                                        {isPersonnelGenderLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                        ) : (
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
                                                    <Cell key={`cell-personnel-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                            </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        {isPersonnelGenderLoading ? (
                                            <>
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                        ) : (
                                            <>
                                            <Card3
                                                image={personnel_male}
                                                title="Male"
                                                count={summarydata?.success?.personnel_based_on_gender?.Active?.Male || 0}
                                                onClick={() => personnelHandleClick("Male")}
                                            />
                                            <Card3
                                                image={personnel_woman}
                                                title="Female"
                                                count={summarydata?.success?.personnel_based_on_gender?.Active?.Female || 0}
                                                onClick={() => personnelHandleClick("Female")}
                                            />
                                            <Card3
                                                image={trans}
                                                title="Other"
                                                count={personnelOtherCount || 0}
                                                onClick={() => personnelHandleClick("Lgbtq+")}
                                            />
                                            </>
                                        )}
                                        </div>
                                    </div>
                                    </div>

                            </div>
                        </div>
                        <div className="w-full flex flex-col lg:flex-row gap-2 mt-2">
                            {!isFullscreen && (
                                <div className="bg-white border shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col gap-2
                                    max-w-full md:max-w-sm lg:max-w-[16rem] w-full flex-[1.2]">
                                    {isSummaryLoading ? (
                                    <>
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                    </>
                                    ) : (
                                    <>
                                        <Card3 
                                                image={release_pdl} 
                                                title="Released PDL" 
                                                count={totalReleasedCount} 
                                                onClick={() => pdlstatusHandleClick("Released")}
                                            />
                                            <Card3 
                                                image={prison} 
                                                title='Committed PDL' 
                                                count={totalAdmissionCount} 
                                                onClick={() => pdlstatusHandleClick("Committed")}
                                            />
                                            <Card3 
                                                image={hospital} 
                                                title='Hospitalized PDL' 
                                                count={totalHospitalizedCount} 
                                                onClick={() => pdlstatusHandleClick("Hospitalized")}
                                            />
                                    </>
                                    )}
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
                                            {isPDLEnteredExitLoading ? (
                                            <Skeleton.Input active size="large" className="w-full h-full rounded-lg" />
                                            ) : (
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
                                            )}
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            {isPDLEnteredExitLoading ? (
                                            <>
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                            ) : (
                                            <>
                                                <Card3
                                                image={pdl_enter}
                                                title="Entered"
                                                count={summary?.pdl_station_visits || 0}
                                                />
                                                <Card3
                                                image={exited}
                                                title="Exited"
                                                count={0}
                                                />
                                            </>
                                            )}
                                        </div>
                                        </div>
                                </div>
                                {/* Visitors */}
                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1">
                                        <Title title="Entry/Exits to Jail Premises of Visitors" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div
                                            className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${
                                            isFullscreen ? "h-[12.5rem] min-h-[100px]" : "h-64 min-h-[180px]"
                                            }`}
                                        >
                                            {isVisitorDataLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                            ) : (
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
                                                    <Cell
                                                        key={`cell-visitor-${index}`}
                                                        fill={VisitorEnteredExitCOLORS[index % VisitorEnteredExitCOLORS.length]}
                                                    />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend
                                                    content={renderLegendCircle}
                                                    layout="horizontal"
                                                    align="center"
                                                    verticalAlign="bottom"
                                                />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            )}
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            {isVisitorDataLoading ? (
                                            <>
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                            ) : (
                                            <>
                                                <Card3
                                                image={pdl_enter}
                                                title="Entered"
                                                count={(summary?.main_gate_tracking ?? 0) + (summary?.visitor_station_visits ?? 0)}
                                                />
                                                <Card3
                                                image={exited}
                                                title="Exited"
                                                count={0}
                                                />
                                            </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* BJMP Personnel */}
                                <div className="bg-white border flex-1 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1.5">
                                        <Title title="Entry/Exits to Jail Premises of BJMP Personnel" />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        {/* PIE CHART */}
                                        <div
                                        className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${
                                            isFullscreen ? "h-[11rem] min-h-[100px]" : "h-64 min-h-[180px]"
                                        }`}
                                        >
                                        {isPersonnelLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                        ) : (
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
                                                    <Cell
                                                    key={`cell-personnel-${index}`}
                                                    fill={PersonnelEnteredExitCOLORS[index % PersonnelEnteredExitCOLORS.length]}
                                                    />
                                                ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend
                                                content={renderLegendCircle}
                                                layout="horizontal"
                                                align="center"
                                                verticalAlign="bottom"
                                                />
                                            </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                        </div>

                                        {/* ENTRY/EXIT CARDS */}
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        {isPersonnelLoading ? (
                                            <>
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                        ) : (
                                            <>
                                            <Card2
                                                image={pdl_enter}
                                                title="Entered"
                                                count={summarydata?.success.premises_logs.personnel_logs_today.Enter || 0}
                                            />
                                            <Card2
                                                image={exited}
                                                title="Exited"
                                                count={summarydata?.success.premises_logs.personnel_logs_today.Exit ?? 0}
                                            />
                                            </>
                                        )}
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
                                            {isSettingLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                            ) : (
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
                                                    <Cell
                                                        key={`cell-sp-${index}`}
                                                        fill={ServiceProviderEnteredExitCOLORS[index % ServiceProviderEnteredExitCOLORS.length]}
                                                    />
                                                    ))}
                                                </Pie>
                                                <Legend
                                                    content={renderLegendCircle}
                                                    layout="horizontal"
                                                    align="center"
                                                    verticalAlign="bottom"
                                                />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            )}
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            {isSettingLoading ? (
                                            <>
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                            ) : (
                                            <>
                                                <Card2 image={pdl_enter} title="Entered" count={0} />
                                                <Card2 image={exited} title="Exited" count={0} />
                                            </>
                                            )}
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
                                            {isNonServiceLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                            ) : (
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
                                                    <Cell
                                                        key={`cell-nsp-${index}`}
                                                        fill={NonRegisterEnteredExitCOLORS[index % NonRegisterEnteredExitCOLORS.length]}
                                                    />
                                                    ))}
                                                </Pie>
                                                <Legend
                                                    content={renderLegendCircle}
                                                    layout="horizontal"
                                                    align="center"
                                                    verticalAlign="bottom"
                                                />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            )}
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                            {isNonServiceLoading ? (
                                            <>
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                                <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                            ) : (
                                            <>
                                                <Card2 image={pdl_enter} title="Entered" count={0} />
                                                <Card2 image={exited} title="Exited" count={0} />
                                            </>
                                            )}
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
                                    <div className="my-1.5">
                                        <Title title="Entry/Exits to Jail Premises of Service Provider" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-60 min-h-[100px]" : "h-56 min-h-[160px]"}`}>
                                        {isServiceLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                        ) : (
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
                                        )}
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        {isServiceLoading ? (
                                            <>
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                        ) : (
                                            <>
                                            <Card2 image={pdl_enter} title="Entered" count={0} />
                                            <Card2 image={exited} title="Exited" count={0} />
                                            </>
                                        )}
                                        </div>
                                    </div>
                                    </div>

                                    <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                    <div className="my-1.5">
                                        <Title title="Entry/Exits to Jail Premises of Non Register Visitor" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                        <div className={`flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 ${isFullscreen ? "h-60 min-h-[100px]" : "h-56 min-h-[160px]"}`}>
                                        {isNonServiceLoading ? (
                                            <Skeleton.Input active className="w-full h-full rounded-lg" />
                                        ) : (
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
                                        )}
                                        </div>
                                        <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                        {isNonServiceLoading ? (
                                            <>
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                            </>
                                        ) : (
                                            <>
                                            <Card2 image={pdl_enter} title="Entered" count={0} />
                                            <Card2 image={exited} title="Exited" count={0} />
                                            </>
                                        )}
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
                                    {isPersonnelLoading ? (
                                        <Skeleton.Input active className="w-full h-full rounded-lg" />
                                    ) : (
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
                                                <Cell key={`cell-personnel-${index}`} fill={onOffDutyPersonnelEnteredExitCOLORS[index % onOffDutyPersonnelEnteredExitCOLORS.length]} />
                                            ))}
                                            </Pie>
                                            <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                        </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                    {isPersonnelLoading ? (
                                        <>
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        </>
                                    ) : (
                                        <>
                                        <Card3
                                            image={on_duty}
                                            title="On Duty"
                                            count={summarydata?.success.personnel_count_by_status.Active["On Duty"] || 0}
                                            onClick={() => personnelstatusHandleClick("On Duty")}
                                        />
                                        <Card3
                                            image={off_duty}
                                            title="Off Duty"
                                            count={summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0}
                                            onClick={() => personnelstatusHandleClick("Off Duty")}
                                        />
                                        </>
                                    )}
                                    </div>
                                </div>
                                </div>
                            {isFullscreen && (
                            <>
                                {/* First Section: Emergency / Malfunction / Illegal Entry */}
                                <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Emergency/Malfunction of System/Illegal Entry/Exit Without Registration" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    {/* Pie Chart with Skeleton */}
                                    <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-[13.6rem] min-h-[100px]">
                                    {isEmergencyLoading ? (
                                        <Skeleton.Avatar active size={120} shape="circle" />
                                    ) : (
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
                                                <Cell
                                                key={`cell-emergency-${index}`}
                                                fill={EmergencyMalfunctionEnteredExitCOLORS[index % EmergencyMalfunctionEnteredExitCOLORS.length]}
                                                />
                                            ))}
                                            </Pie>
                                            <Legend
                                            content={renderLegendCircle}
                                            layout="horizontal"
                                            align="center"
                                            verticalAlign="bottom"
                                            />
                                        </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                    </div>

                                    {/* Cards with Skeleton */}
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                    {isEmergencyLoading ? (
                                        <>
                                        <Skeleton.Avatar active size={48} shape="square" />
                                        <Skeleton.Input style={{ width: '80%', height: 32 }} active />
                                        <Skeleton.Input style={{ width: '60%', height: 32, marginTop: 12 }} active />
                                        <Skeleton.Input style={{ width: '70%', height: 32, marginTop: 12 }} active />
                                        </>
                                    ) : (
                                        <>
                                        <Card2 image={emergency} title="Emergency" count={0} />
                                        <Card2 image={malfunction} title="Malfunction of System" count={0} />
                                        <Card2 image={illegal} title="Illegal Entry/Exit" count={0} />
                                        </>
                                    )}
                                    </div>
                                </div>
                                </div>

                                {/* Second Section: Action Taken */}
                                <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Action Taken Emergency/Malfunction of System/Illegal Entry/Exit Without Registration" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    {/* Pie Chart with Skeleton */}
                                    <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-[13.6rem] min-h-[100px]">
                                    {isActionTakenLoading ? (
                                        <Skeleton.Avatar active size={120} shape="circle" />
                                    ) : (
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
                                                <Cell
                                                key={`cell-actiontaken-${index}`}
                                                fill={ActionTakenEnteredExitCOLORS[index % ActionTakenEnteredExitCOLORS.length]}
                                                />
                                            ))}
                                            </Pie>
                                            <Legend
                                            content={renderLegendCircle}
                                            layout="horizontal"
                                            align="center"
                                            verticalAlign="bottom"
                                            />
                                        </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                    </div>

                                    {/* Cards with Skeleton */}
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                    {isActionTakenLoading ? (
                                        <>
                                        <Skeleton.Avatar active size={48} shape="square" />
                                        <Skeleton.Input style={{ width: '80%', height: 32 }} active />
                                        <Skeleton.Input style={{ width: '60%', height: 32, marginTop: 12 }} active />
                                        <Skeleton.Input style={{ width: '70%', height: 32, marginTop: 12 }} active />
                                        </>
                                    ) : (
                                        <>
                                        <Card2 image={emergency} title="Action Taken Emergency" count={0} />
                                        <Card2 image={malfunction} title="Malfunction of System" count={0} />
                                        <Card2 image={illegal} title="Illegal Entry/Exit" count={0} />
                                        </>
                                    )}
                                    </div>
                                </div>
                                </div>
                            </>
                            )}
                        </div>
                        {!isFullscreen && (
                            <div className="flex gap-2 flex-wrap">
                                {/* Emergency/Malfunction Pie + Cards */}
                                <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Emergency/Malfunction of System/Illegal Entry/Exit Without Registration" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                    {isEmergencyLoading ? (
                                        <Skeleton.Avatar active size={120} shape="circle" />
                                    ) : (
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
                                            <Cell
                                                key={`cell-emergency-${index}`}
                                                fill={EmergencyMalfunctionEnteredExitCOLORS[index % EmergencyMalfunctionEnteredExitCOLORS.length]}
                                            />
                                            ))}
                                        </Pie>
                                        <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    )}
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                    {isEmergencyLoading ? (
                                        <>
                                        <Skeleton.Avatar active size={48} shape="square" />
                                        <Skeleton.Input style={{ width: '80%', height: 32 }} active />
                                        <Skeleton.Input style={{ width: '60%', height: 32, marginTop: 12 }} active />
                                        <Skeleton.Input style={{ width: '70%', height: 32, marginTop: 12 }} active />
                                        </>
                                    ) : (
                                        <>
                                        <Card3 image={emergency} title="Emergency" count={0} />
                                        <Card3 image={malfunction} title="Malfunction of System" count={0} />
                                        <Card3 image={illegal} title="Illegal Entry/Exit" count={0} />
                                        </>
                                        )}
                                    </div>
                                </div>
                                </div>

                                {/* Personnel Entry/Exit Pie + Cards */}
                                <div className="bg-white border flex-1 min-w-0 shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg p-4 flex flex-col">
                                <div className="my-1">
                                    <Title title="Entry/Exits to Jail Premises of BJMP Personnel" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 items-stretch h-full min-h-[180px]">
                                    <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
                                    {isActionTakenLoading ? (
                                        <Skeleton.Avatar active size={120} shape="circle" />
                                    ) : (
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
                                            <Cell
                                                key={`cell-personnel-${index}`}
                                                fill={PersonnelEnteredExitCOLORS[index % PersonnelEnteredExitCOLORS.length]}
                                            />
                                            ))}
                                        </Pie>
                                        <Legend content={renderLegendCircle} layout="horizontal" align="center" verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    )}
                                    </div>
                                    <div className="flex-1 w-full flex flex-col justify-center gap-2 h-full">
                                    {isActionTakenLoading ? (
                                        <>
                                        <Skeleton.Avatar active size={48} shape="square" />
                                        <Skeleton.Input style={{ width: '80%', height: 32 }} active />
                                        <Skeleton.Input style={{ width: '60%', height: 32, marginTop: 12 }} active />
                                        <Skeleton.Input style={{ width: '70%', height: 32, marginTop: 12 }} active />
                                        </>
                                    ) : (
                                        <>
                                        <Card3 image={emergency} title="Action Taken Emergency" count={0} />
                                        <Card3 image={malfunction} title="Malfunction of System" count={0} />
                                        <Card3 image={illegal} title="Illegal Entry/Exit" count={0} />
                                        </>
                                    )}
                                    </div>
                                </div>
                                </div>
                            </div>
                        )}
                    </div>
                </FullScreen>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-end my-2 items-center">
                <button className="gap-2 flex text-white items-center px-6 py-1.5 bg-[#1E365D] rounded-full hover:bg-[#163050] transition" onClick={showModal}>
                <HiFilter className="text-xs"/> Filter
            </button>
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
            </div>
            <div>
                <Modal
                    title="Filter Options"
                    visible={visible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={null}
                    width="30%"
                    >
                    <label className="w-full text-[16px] font-semibold">
                        Periodical:
                        <Select value={frequency} onChange={value => { setFrequency(value); setIsFormChanged(true); }} className="w-full h-10">
                        <Option value="daily">Daily</Option>
                        <Option value="weekly">Weekly</Option>
                        <Option value="monthly">Monthly</Option>
                        <Option value="quarterly">Quarterly</Option>
                        </Select>
                    </label>

                    <label className="w-full text-[16px] font-semibold">
                        Date Field:
                        <Select value={dateField} onChange={handleDateFieldChange} className="w-full h-10">
                        <Option value="date_convicted">Date Convicted</Option>
                        <Option value="date_hospitalized">Date Hospitalized</Option>
                        <Option value="date_of_admission">Date of Admission</Option>
                        <Option value="date_released">Date Released</Option>
                        </Select>
                    </label>

                    {frequency === 'quarterly' ? (
                        <>
                        <label>Start Year:
                            <Input type="number" min="2000" max="2100" value={startYear} onChange={handleYearChange(setStartYear)} className="w-full h-10" />
                        </label>
                        <label>End Year:
                            <Input type="number" min="2000" max="2100" value={endYear} onChange={handleYearChange(setEndYear)} className="w-full h-10" />
                        </label>
                        </>
                    ) : (
                        <>
                        <label className="w-full text-[16px] font-semibold">Start Date:
                            <Input
                            type="text"
                            placeholder={frequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setIsFormChanged(true); }}
                            className="w-full h-10"
                            />
                        </label>
                        <label className="w-full text-[16px] font-semibold">End Date:
                            <Input
                            type="text"
                            placeholder={frequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setIsFormChanged(true); }}
                            className="w-full h-10"
                            />
                        </label>
                        </>
                    )}
                    </Modal>
            </div>
            </div>
    )
}

export default Dashboard
