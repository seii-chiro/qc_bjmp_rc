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
import convicted from '../../assets/Icons/convicted.png'
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
import { Title } from "./components/SummaryCards";
import { BASE_URL } from "@/lib/urls";
import { Button, Input, Modal, Select, Skeleton, Tabs } from "antd";

const { Option } = Select;
const { TabPane } = Tabs;

const Dashboard = () => {
    const queryClient = useQueryClient();
    const handle = useFullScreenHandle();
    const token = useTokenStore().token;
    const currentYear = new Date().getFullYear();
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [isFormVisitChanged, setIsFormVisitChanged] = useState(false);
    const [isFormPDLVisitChanged, setIsFormPDLVisitChanged] = useState(false);
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const currentDate = new Date().toLocaleDateString('en-us', { year: "numeric", month: "long", day: "numeric" });
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const isFullscreen = handle.active;
    const [activeTab, setActiveTab] = useState('visitLogs');
    const [frequency, setFrequency] = useState('daily'); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateField, setDateField] = useState('date_convicted');
    const [visitType, setvisitType] = useState('MainGateVisit');
    const [pdlvisitType, setpdlvisitType] = useState('PDLStationVisit');
    const [startYear, setStartYear] = useState(currentYear.toString());
    const [endYear, setEndYear] = useState(currentYear.toString());

    const [formFrequency, setFormFrequency] = useState(frequency);
    const [formVisitType, setFormVisitType] = useState('MainGateVisit');
    const [formDateField, setFormDateField] = useState(dateField);
    const [formStartDate, setFormStartDate] = useState(startDate);
    const [formEndDate, setFormEndDate] = useState(endDate);
    const [formStartYear, setFormStartYear] = useState(startYear);
    const [formEndYear, setFormEndYear] = useState(endYear);

    //VisitLog
    const [visitFrequency, setVisitFrequency] = useState('daily');
    const [visitStartDate, setvisitStartDate] = useState('');
    const [visitendDate, setVisitEndDate] = useState(''); 
    const [visitStartYear, setVisitStartYear] = useState(currentYear.toString());
    const [visitendYear, setVisitEndYear] = useState(currentYear.toString());

    const [formVisitFrequency, setFormVisitFrequency] = useState(visitFrequency);
    const [formVisitStartDate, setFormVisitStartDate] = useState(visitStartDate);
    const [formVisitEndDate, setFormVisitEndDate] = useState(visitendDate);
    const [formVisitStartYear, setFormVisitStartYear] = useState(visitStartYear);
    const [formVisitEndYear, setFormVisitEndYear] = useState(visitendYear);

    const [formPDLFrequency, setFormPDLFrequency] = useState('daily');
    const [formPDLStartDate, setFormPDLStartDate] = useState('');
    const [formPDLEndDate, setFormPDLEndDate] = useState('');
    const [formPDLStartYear, setFormPDLStartYear] = useState(currentYear.toString());
    const [formPDLEndYear, setFormPDLEndYear] = useState(currentYear.toString());
    const [formPDLVisitType, setFormPDLVisitType] = useState('PDLStationVisit');
    const [pdlFrequency, setPDLFrequency] = useState('daily');
    const [pdlStartDate, setPDLStartDate] = useState('');
    const [pdlEndDate, setPDLEndDate] = useState('');
    const [pdlStartYear, setPDLStartYear] = useState(currentYear.toString());
    const [pdlEndYear, setPDLEndYear] = useState(currentYear.toString());

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

    const getJailTitle = (jail) => {
        return jail.includes('QUEZON CITY JAIL-FEMALE DORM') ? 
            'BJMP Quezon City Jail - Female Dormitory Dashboard' : 
            'BJMP Quezon City Jail - Male Dormitory Dashboard';
    };

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
        } else if (frequency === 'weekly') {
            url += 'get-weekly-pdl-summary';
            params.append('start_date', startDate);
            params.append('end_date', endDate);
        } else if (frequency === 'daily') {
            url += 'get-daily-pdl-summary';
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

    const { data: pdlData } = useQuery({
        queryKey: ['pdl-summary', frequency, dateField, startYear, endYear, startDate, endDate],
        queryFn: fetchPDLSummary,
        enabled: !!token,
    });


    let counts = {};
    if (frequency === 'quarterly') {
        counts = pdlData?.success?.quarterly_pdl_summary || {};
    } else if (frequency === 'monthly') {
        counts = pdlData?.success?.monthly_pdl_summary || {};
    } else if (frequency === 'weekly') {
        counts = pdlData?.success?.weekly_pdl_summary || {};
    } else if (frequency === 'daily') {
        counts = pdlData?.success?.daily_pdl_summary || {};
    }

    const totalConvictedCount = isFormChanged && dateField === 'date_convicted'
        ? Object.values(counts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : summarydata?.success?.total_pdl_by_status?.Convicted?.Active ?? 0;

    const totalReleasedCount = isFormChanged && dateField === 'date_released'
        ? Object.values(counts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : summarydata?.success?.total_pdl_by_status?.Released?.Active ?? 0;

    const totalAdmissionCount = isFormChanged && dateField === 'date_of_admission'
        ? Object.values(counts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : summarydata?.success?.total_pdl_by_status?.Committed?.Active ?? 0;

    const totalHospitalizedCount = isFormChanged && dateField === 'date_hospitalized'
        ? Object.values(counts).reduce((total, data) => total + (data.pdl_count || 0), 0)
        : summarydata?.success?.total_pdl_by_status?.Hospitalized?.Active ?? 0;

    function formatDateToMMDDYYYY(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return ""; 
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
    }

const fetchSummaryVisitorLog = async () => {
    let url = `${BASE_URL}/api/dashboard/summary-dashboard/`;
    const params = new URLSearchParams();
    if (visitType === 'PDLStationVisit') return null;

    params.append('visit_type', visitType);

    if (visitFrequency === 'daily') {
        url += 'get-daily-visitor-logs-summary';
        params.append('start_date', formatDateToMMDDYYYY(visitStartDate));
        params.append('end_date', formatDateToMMDDYYYY(visitendDate));
    
    } else if (visitFrequency === 'monthly') {
        url += 'get-monthly-visitor-logs-summary';
        params.append('start_date', visitStartDate); 
        params.append('end_date', visitendDate);     
    } else if (visitFrequency === 'weekly') {
        url += 'get-weekly-visitor-logs-summary';
        params.append('start_date', formatDateToMMDDYYYY(visitStartDate));
        params.append('end_date', formatDateToMMDDYYYY(visitendDate));
    } else if (visitFrequency === 'quarterly') {
        url += 'get-quarterly-visitor-logs-summary';
        params.append('start_year', visitStartYear);
        params.append('end_year', visitendYear);
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

const fetchSummaryPDLVisitorLog = async () => {
    let url = `${BASE_URL}/api/dashboard/summary-dashboard/`;
    const params = new URLSearchParams();

    params.append('visit_type', 'PDLStationVisit');

    if (pdlFrequency === 'daily') {
        url += 'get-daily-visitor-logs-summary';
        params.append('start_date', formatDateToMMDDYYYY(pdlStartDate));
        params.append('end_date', formatDateToMMDDYYYY(pdlEndDate));
    
    } else if (pdlFrequency === 'monthly') {
        url += 'get-monthly-visitor-logs-summary';
        params.append('start_date', pdlStartDate); 
        params.append('end_date', pdlEndDate);     
    } else if (pdlFrequency === 'weekly') {
        url += 'get-weekly-visitor-logs-summary';
        params.append('start_date', formatDateToMMDDYYYY(pdlStartDate));
        params.append('end_date', formatDateToMMDDYYYY(pdlEndDate));
    } else if (pdlFrequency === 'quarterly') {
        url += 'get-quarterly-visitor-logs-summary';
        params.append('start_year', pdlStartYear);
        params.append('end_year', pdlEndYear);
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

    const { data: visitorLogData } = useQuery({
    queryKey: ['visit-log', visitType.trim(), visitFrequency, visitStartYear, visitendYear, visitStartDate, visitendDate],
    queryFn: fetchSummaryVisitorLog,
    enabled: !!token,
    });

    const { data: pdlVisitorLogData } = useQuery({
    queryKey: ['pdl-log', pdlFrequency, pdlStartYear, pdlEndYear, pdlStartDate, pdlEndDate],
    queryFn: fetchSummaryPDLVisitorLog,
    enabled: !!token,
    });

    let visitCounts = {};
    if (visitFrequency === 'daily') {
        visitCounts = visitorLogData?.success?.daily_visitor_logs_summary || {};
        } else if (visitFrequency === 'monthly') {
        visitCounts = visitorLogData?.success?.monthly_visitor_logs_summary || {};
        } else if (visitFrequency === 'weekly') {
        visitCounts = visitorLogData?.success?.weekly_visitor_logs_summary || {};
        } else if (visitFrequency === 'quarterly') {
        visitCounts = visitorLogData?.success?.quarterly_visitor_logs_summary || {};
        }

    let pdlvisitCounts = {};
    if (pdlFrequency === 'daily') {
        pdlvisitCounts = pdlVisitorLogData?.success?.daily_visitor_logs_summary || {};
        } else if (pdlFrequency === 'monthly') {
        pdlvisitCounts = pdlVisitorLogData?.success?.monthly_visitor_logs_summary || {};
        } else if (pdlFrequency === 'weekly') {
        pdlvisitCounts = pdlVisitorLogData?.success?.weekly_visitor_logs_summary || {};
        } else if (pdlFrequency === 'quarterly') {
        pdlvisitCounts = pdlVisitorLogData?.success?.quarterly_visitor_logs_summary || {};
        }

const totalVisit = isFormVisitChanged
    ? Object.values(visitCounts).reduce((total, data) => total + (data?.logins || 0), 0)
    : visitType.trim() === 'MainGateVisit'
    ? Object.values(visitorLogData?.success?.daily_visitor_logs_summary || {}).reduce((total, data) => total + (data?.logins || 0), 0)
    : visitType.trim() === 'VisitorStationVisit'
    ? Object.values(visitorLogData?.success?.daily_visitor_logs_summary || {}).reduce((total, data) => total + (data?.logins || 0), 0)
    : 0

    const totalVisitOut = isFormVisitChanged
    ? Object.values(visitCounts).reduce((total, data) => total + (data?.logouts || 0), 0)
    : visitType === 'MainGateVisit'
        ?  Object.values(visitorLogData?.success?.daily_visitor_logs_summary || {}).reduce((total, data) => total + (data?.logouts || 0), 0)
        : visitType === 'VisitorStationVisit'
        ? Object.values(visitorLogData?.success?.daily_visitor_logs_summary || {}).reduce((total, data) => total + (data?.logouts || 0), 0)
        : 0;

    const totalVisitPDLStation = isFormPDLVisitChanged && pdlvisitType === 'PDLStationVisit'
        ? Object.values(pdlvisitCounts).reduce((total, data) => total + (data?.logins || 0), 0)
        : Object.values(pdlVisitorLogData?.success?.daily_visitor_logs_summary || {}).reduce((total, data) => total + (data?.logins || 0), 0)

    const totalVisitPDLStationOut = isFormPDLVisitChanged && pdlvisitType === 'PDLStationVisit'
        ? Object.values(pdlvisitCounts).reduce((total, data) => total + (data?.logouts || 0), 0)
        : Object.values(pdlVisitorLogData?.success?.daily_visitor_logs_summary || {}).reduce((total, data) => total + (data?.logouts || 0), 0)

    const latestDate = Object.keys(dailysummarydata?.success.daily_visit_summary || {})[0];
    const summary = dailysummarydata?.success.daily_visit_summary[latestDate];
    const visitorOtherCount = Object.entries(summarydata?.success?.visitor_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

    const personnelOtherCount = Object.entries(summarydata?.success?.personnel_based_on_gender?.Active || {})
    .filter(([key]) => key !== "Male" && key !== "Female")
    .reduce((total, [, value]) => total + (value ?? 0), 0);

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
        { name: 'Entered', value: totalVisitPDLStation },
        { name: 'Exited', value: totalVisitPDLStationOut },
    ];

    const VisitorEnteredExitData = [
    { name: 'Entered', value: totalVisit },
    { name: 'Exited', value: totalVisitOut },
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
        { name: 'Exited', value: summarydata?.success.personnel_count_by_status.Active["Off Duty"] || 0},
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

        const Card4 = (props: {
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
                className='rounded-lg flex flex-grow items-center gap-2 px-2 py-[4.5px] w-full bg-[#F6F7FB] hover:cursor-pointer'
                onClick={handleClick}
            >
                <div className='bg-[#D3DFF0] rounded-full'>
                    <img src={image} className='w-10' alt={title} />
                </div>
                <div className='flex flex-col'>
                    <div className='text-[#1E365D] font-extrabold text-3xl'>{count}</div>
                    <p className='text-[#121D26] text-base font-semibold'>{title}</p>
                </div>
            </div>
        );
    };

    const exportDashboardAsImage = async () => {
        if (!handle.active) {
        await handle.enter();
        await new Promise(r => setTimeout(r, 500));
        }

        const element = document.getElementById("dashboard");
        if (!element) return;

        const oldStyle = {
        width: element.style.width,
        height: element.style.height,
        overflow: element.style.overflow,
        position: element.style.position,
        top: element.style.top,
        left: element.style.left,
        boxShadow: element.style.boxShadow,
        border: element.style.border,
        outline: element.style.outline,
        };

        element.style.width = "100vw";
        element.style.height = "100vh";
        element.style.overflow = "visible";
        element.style.position = "fixed";
        element.style.top = "0";
        element.style.left = "0";
        element.style.boxShadow = "none";
        element.style.border = "none";
        element.style.outline = "none";

        // Wait for style changes to apply
        await new Promise(r => setTimeout(r, 200));

        const canvas = await html2canvas(element, {
            scale: window.devicePixelRatio || 2,
            useCORS: true,
            scrollX: -window.scrollX,
            scrollY: -window.scrollY,
        });

        // Restore original styles
        element.style.width = oldStyle.width;
        element.style.height = oldStyle.height;
        element.style.overflow = oldStyle.overflow;
        element.style.position = oldStyle.position;
        element.style.top = oldStyle.top;
        element.style.left = oldStyle.left;
        element.style.boxShadow = oldStyle.boxShadow;
        element.style.border = oldStyle.border;
        element.style.outline = oldStyle.outline;

        const image = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = image;
        link.download = "dashboard-fullscreen.png";
        link.click();
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
        const jailName = systemsettingdata?.results?.[0]?.jail_facility?.jail_name || '';

        if (!jailName) {
            console.warn("No jail name found in system settings.");
            return;
        }

        const encodedJail = encodeURIComponent(jailName);

        if (gender === "Other") {
            const allGenders = Object.keys(summarydata?.success?.visitor_based_on_gender?.Active || {});
            const otherGenders = allGenders.filter(g => g !== "Male" && g !== "Female");
            const encodedGenders = otherGenders.map(g => encodeURIComponent(g)).join(",");
            navigate(`/jvms/visitors/visitor?gender=${encodedGenders}&jail=${encodedJail}`);
        } else {
            navigate(`/jvms/visitors/visitor?gender=${encodeURIComponent(gender)}&jail=${encodedJail}`);
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
    const handleCancel = () => {
        setFormVisitType(visitType);
        setFormVisitFrequency(visitFrequency);
        setFormVisitStartDate(visitStartDate);
        setFormVisitEndDate(visitendDate);
        setFormVisitStartYear(visitStartYear);
        setFormVisitEndYear(visitendYear);

        setFormPDLVisitType(pdlvisitType);
        setFormPDLFrequency(pdlFrequency);
        setFormPDLStartDate(pdlStartDate);
        setFormPDLEndDate(pdlEndDate);
        setFormPDLStartYear(pdlStartYear);
        setFormPDLEndYear(pdlEndYear);

        setFormDateField(dateField)
        setFormFrequency(frequency);
        setFormStartDate(startDate);
        setFormEndDate(endDate);
        setFormStartYear(startYear);
        setFormEndYear(endYear);
        setVisible(false);
    };

    const handleApplyFilters = () => {
        if (activeTab === 'visitLogs') {
        setvisitType(formVisitType);
        setVisitFrequency(formVisitFrequency);
        setvisitStartDate(formVisitStartDate);
        setVisitEndDate(formVisitEndDate);
        setVisitStartYear(formVisitStartYear);
        setVisitEndYear(formVisitEndYear);
        }else if (activeTab === 'pdlvisitorlogs') {
        setpdlvisitType(formPDLVisitType);
        setPDLFrequency(formPDLFrequency);
        setPDLStartDate(formPDLStartDate);
        setPDLEndDate(formPDLEndDate);
        setPDLStartYear(formPDLStartYear);
        setPDLEndYear(formPDLEndYear);
        } else if (activeTab === 'summaryData') {
        setDateField(formDateField);
        setFrequency(formFrequency);
        setStartDate(formStartDate);
        setEndDate(formEndDate);
        setStartYear(formStartYear);
        setEndYear(formEndYear);
        }
        setIsFormPDLVisitChanged(true);
        setIsFormVisitChanged(true);
        setIsFormChanged(true);
        setVisible(false);
    };

    const activeDormName = systemsettingdata?.results?.[0]?.jail_facility?.jail_name || 'Default Dorm';
    const congestionRateRaw = summarydata?.success?.jail_congestion_rates?.[activeDormName];

    const formattedRate = typeof congestionRateRaw === 'number'
    ? `${congestionRateRaw.toFixed(2)}%`
    : '0%';
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
                        <div className="w-full flex flex-col lg:flex-row gap-2 mt-2">
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
                                            title="Jail Capacity"
                                            count={systemsettingdata?.results[0]?.jail_facility?.jail_capacity ?? 0}
                                            linkto={`/jvms/assets/jail-facility?jail_name=${encodeURIComponent(systemsettingdata?.results[0]?.jail_facility?.jail_name)}`}
                                            />
                                        <Card3
                                            image={release}
                                            title='Congestion Rate'
                                            count={formattedRate}
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
                                            <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                        </>
                                    ) : (
                                        <>
                                            <Card4
                                                image={convicted} 
                                                title="Convicted PDL" 
                                                count={totalReleasedCount} 
                                                onClick={() => pdlstatusHandleClick("Released")}
                                            />
                                            <Card4
                                                image={release_pdl} 
                                                title="Released PDL" 
                                                count={totalReleasedCount} 
                                                onClick={() => pdlstatusHandleClick("Released")}
                                            />
                                            <Card4
                                                image={prison} 
                                                title='Committed PDL' 
                                                count={totalAdmissionCount} 
                                                onClick={() => pdlstatusHandleClick("Committed")}
                                            />
                                            <Card4
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
                                        <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-64 min-h-[180px]">
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
                                                onClick={() => personnelHandleClick("Other")}
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
                                        <Skeleton.Input active size="large" className="h-[80px] rounded-lg" />
                                    </>
                                    ) : (
                                    <div className="flex flex-wrap gap-2">
                                        <Card4 
                                            image={convicted} 
                                            title="Convicted PDL" 
                                            count={totalConvictedCount} 
                                            onClick={() => pdlstatusHandleClick("Convicted")}
                                        />
                                        <Card4 
                                            image={release_pdl} 
                                            title="Released PDL" 
                                            count={totalReleasedCount} 
                                            onClick={() => pdlstatusHandleClick("Released")}
                                        />
                                        <Card4
                                            image={prison} 
                                            title='Committed PDL' 
                                            count={totalAdmissionCount} 
                                            onClick={() => pdlstatusHandleClick("Committed")}
                                        />
                                        <Card4
                                            image={hospital} 
                                            title='Hospitalized PDL' 
                                            count={totalHospitalizedCount} 
                                            onClick={() => pdlstatusHandleClick("Hospitalized")}
                                        />
                                    </div>
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
                                                count={totalVisitPDLStation}
                                                />
                                                <Card3
                                                image={exited}
                                                title="Exited"
                                                count={totalVisitPDLStationOut}
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
                                                count={totalVisit}
                                                />
                                                <Card3
                                                image={exited}
                                                title="Exited"
                                                count={totalVisitOut}
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
                                                count={summarydata?.success.premises_logs.personnel_logs_today["Time In"] || 0}
                                            />
                                            <Card2
                                                image={exited}
                                                title="Exited"
                                                count={summarydata?.success.premises_logs.personnel_logs_today["Time Out"] || 0}
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
                                        <div className="flex-1 flex items-center justify-center bg-[#F6F7FB] rounded-lg p-2 h-[11rem] min-h-[100px]">
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
                onClick={exportDashboardAsImage}
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
                    title={
                        <h2 className="text-xl font-bold text-gray-800">
                        Filter {activeTab === 'visitLogs' ? 'Visit Logs' : 'Summary Data'}
                        </h2>
                    }
                    open={visible}
                    onCancel={handleCancel}
                    footer={null}
                    width={'50%'}
                    style={{ padding: '24px' }}
                    >
                    <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
                        <TabPane tab="Visitor Logs" key="visitLogs" />
                        <TabPane tab="PDL Logs" key="pdlvisitorlogs" />
                        <TabPane tab="Summary Data" key="summaryData" />
                    </Tabs>

                    {activeTab === 'visitLogs' && (
                        <>
                        <p className="mb-6 text-gray-600">
                            Use the filters below to fetch specific <strong>visitor log</strong> data.
                            Click <strong>Apply Filters</strong> when you’re ready.
                        </p>

                        {/* Visit Type */}
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold text-gray-700">Visit Type</label>
                            <Select
                            value={formVisitType}
                            onChange={setFormVisitType}
                            className="w-full"
                            size="large"
                            bordered
                            >
                            <Option value="MainGateVisit">Main Gate</Option>
                            <Option value="VisitorStationVisit">Visitor Station</Option>
                            {/* <Option value="PDLStationVisit">PDL Station</Option> */}
                            </Select>
                        </div>

                        {/* Frequency */}
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold text-gray-700">Frequency</label>
                            <Select
                            value={formVisitFrequency}
                            onChange={setFormVisitFrequency}
                            className="w-full"
                            size="large"
                            bordered
                            >
                            <Option value="daily">Daily</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                            <Option value="quarterly">Quarterly</Option>
                            </Select>
                        </div>

                        {/* Date Inputs */}
                        {formVisitFrequency === 'quarterly' ? (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Start Year</label>
                                <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={formVisitStartYear}
                                onChange={e => setFormVisitStartYear(e.target.value)}
                                size="large"
                                placeholder="e.g. 2023"
                                bordered
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">End Year</label>
                                <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={formVisitEndYear}
                                onChange={e => setFormVisitEndYear(e.target.value)}
                                size="large"
                                placeholder="e.g. 2024"
                                bordered
                                />
                            </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Start Date</label>
                                <Input
                                type="text"
                                placeholder={formVisitFrequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                                value={formVisitStartDate}
                                onChange={e => setFormVisitStartDate(e.target.value)} 
                                size="large"
                                bordered
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">End Date</label>
                                <Input
                                type="text"
                                placeholder={formVisitFrequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                                value={formVisitEndDate}
                                onChange={e => setFormVisitEndDate(e.target.value)}
                                size="large"
                                bordered
                                />
                            </div>
                            </div>
                        )}
                        </>
                    )}

                    {activeTab === 'pdlvisitorlogs' && (
                        <>
                        {/* Visit Type */}
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold text-gray-700">Visit Type</label>
                            <Select
                            value={formPDLVisitType}
                            onChange={setFormPDLVisitType}
                            className="w-full"
                            size="large"
                            bordered
                            >
                            {/* <Option value="MainGateVisit">Main Gate</Option>
                            <Option value="VisitorStationVisit">Visitor Station</Option> */}
                            <Option value="PDLStationVisit">PDL Station</Option>
                            </Select>
                        </div>

                        {/* Frequency */}
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold text-gray-700">Frequency</label>
                            <Select
                            value={formPDLFrequency}
                            onChange={setFormPDLFrequency}
                            className="w-full"
                            size="large"
                            bordered
                            >
                            <Option value="daily">Daily</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                            <Option value="quarterly">Quarterly</Option>
                            </Select>
                        </div>

                        {/* Date Inputs */}
                        {formPDLFrequency === 'quarterly' ? (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Start Year</label>
                                <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={formPDLStartYear}
                                onChange={e => setFormPDLStartYear(e.target.value)}
                                size="large"
                                placeholder="e.g. 2023"
                                bordered
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">End Year</label>
                                <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={formPDLEndYear}
                                onChange={e => setFormPDLEndYear(e.target.value)}
                                size="large"
                                placeholder="e.g. 2024"
                                bordered
                                />
                            </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Start Date</label>
                                <Input
                                type="text"
                                placeholder={formPDLFrequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                                value={formPDLStartDate}
                                onChange={e => setFormPDLStartDate(e.target.value)} 
                                size="large"
                                bordered
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">End Date</label>
                                <Input
                                type="text"
                                placeholder={formPDLFrequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                                value={formPDLEndDate}
                                onChange={e => setFormPDLEndDate(e.target.value)}
                                size="large"
                                bordered
                                />
                            </div>
                            </div>
                        )}
                        </>
                    )}

                    {activeTab === 'summaryData' && (
                        <>
                        <p className="mb-6 text-gray-600">
                            Use the filters below to customize the summary data display.
                            Click <strong>Apply Filters</strong> when you’re ready.
                        </p>

                        {/* Frequency */}
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold text-gray-700">Periodical</label>
                            <Select
                            value={formFrequency}
                            onChange={setFormFrequency}
                            className="w-full"
                            size="large"
                            bordered
                            >
                            <Option value="daily">Daily</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                            <Option value="quarterly">Quarterly</Option>
                            </Select>
                        </div>

                        {/* Date Field */}
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold text-gray-700">Date Field</label>
                            <Select
                            value={formDateField}
                            onChange={setFormDateField}
                            className="w-full"
                            size="large"
                            bordered
                            >
                            <Option value="date_convicted">Date Convicted</Option>
                            <Option value="date_hospitalized">Date Hospitalized</Option>
                            <Option value="date_of_admission">Date of Admission</Option>
                            <Option value="date_released">Date Released</Option>
                            </Select>
                        </div>

                        {/* Date Inputs */}
                        {formFrequency === 'quarterly' ? (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Start Year</label>
                                <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={formStartYear}
                                onChange={e => setFormStartYear(e.target.value)}
                                size="large"
                                placeholder="e.g. 2023"
                                bordered
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">End Year</label>
                                <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={formEndYear}
                                onChange={e => setFormEndYear(e.target.value)}
                                size="large"
                                placeholder="e.g. 2024"
                                bordered
                                />
                            </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">Start Date</label>
                                <Input
                                type="text"
                                placeholder={formFrequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                                value={formStartDate}
                                onChange={e => setFormStartDate(e.target.value)}
                                size="large"
                                bordered
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">End Date</label>
                                <Input
                                type="text"
                                placeholder={formFrequency === 'monthly' ? 'MM-YYYY' : 'MM-DD-YYYY'}
                                value={formEndDate}
                                onChange={e => setFormEndDate(e.target.value)}
                                size="large"
                                bordered
                                />
                            </div>
                            </div>
                        )}
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button size="large" onClick={handleCancel}>
                        Cancel
                        </Button>
                        <Button
                        className="bg-[#1E365D]"
                        type="primary"
                        size="large"
                        onClick={handleApplyFilters}
                        >
                        Apply Filters
                        </Button>
                    </div>
                    </Modal>
                </div>
            </div>
    )
}

export default Dashboard
