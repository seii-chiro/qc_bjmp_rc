import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, DatePicker, Select, Skeleton, TimePicker } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { patchSettings } from "@/lib/query";
import { message } from "antd";
import { fetchSettings } from "@/lib/additionalQueries";

const GeneralSettings = () => {
    const queryClient = useQueryClient();
    const token = useTokenStore().token;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const { data: jailData, isLoading: jailLoading } = useQuery({
        queryKey: ['jail'],
        queryFn: () =>
            fetch(`${BASE_URL}/api/jail/jails/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            }).then(res => res.json()),
    });

    const { data: settingsData, isLoading, isError } = useQuery({
        queryKey: ['global-settings'],
        queryFn: () => fetchSettings(token ?? ""),
    });

    const [formData, setFormData] = useState({
        id: 1,
        datestamp_format: '',
        date_format: '',
        jail_facility_id: 1,
        dashboard_period: 'Daily',
        schedule_day: "",
        schedule_time_start: "",
        schedule_time_end: "",
    });

    useEffect(() => {
        if (settingsData && settingsData.results.length > 0) {
            const settings = settingsData.results[0];
            setFormData({
                id: settings.id,
                datestamp_format: settings.datestamp_format,
                date_format: settings.date_format,
                jail_facility_id: settings.jail_facility_id,
                dashboard_period: settings.dashboard_period,
                schedule_day: settings.schedule_day,
                schedule_time_start: settings.schedule_time_start,
                schedule_time_end: settings.schedule_time_end
            });
        }
    }, [settingsData]);

    const currentJail = jailData?.results?.find(
        jail => String(jail.id) === String(formData.jail_facility_id)
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, dateString, field) => {
        setFormData((prev) => ({ ...prev, [field]: dateString }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await patchSettings(token ?? "", formData.id, formData);
            queryClient.invalidateQueries({ queryKey: ['global-settings'] });
            message.success("Settings updated successfully!");
        } catch (error) {
            console.error("Error updating settings:", error);
            message.error("Failed to update settings.");
        }
    };

    return (
        <div>
            <h1 className="text-xl font-bold text-[#1E365D]">General Settings</h1>

            <div className="flex gap-4">
                <form onSubmit={handleSubmit} className="border border-gray-200 w-full md:w-96 mt-5 rounded-sm p-5 shadow-sm">
                    <Skeleton loading={isLoading || jailLoading} active paragraph={{ rows: 8 }}>
                        {isError && (
                            <div className="mb-4">
                                <Alert
                                    message="Failed to Load Settings"
                                    description="There was a problem retrieving system settings. Please try again later or contact the administrator."
                                    type="error"
                                    showIcon
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block mb-1">Timestamp:</label>
                            <DatePicker
                                showTime
                                value={formData.datestamp_format ? dayjs(formData.datestamp_format) : null}
                                onChange={(date, dateString) => handleDateChange(date, dateString, 'datestamp_format')}
                                className="w-full"
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Date:</label>
                            <DatePicker
                                value={formData.date_format ? dayjs(formData.date_format) : null}
                                onChange={(date, dateString) => handleDateChange(date, dateString, 'date_format')}
                                className="w-full"
                                format="YYYY-MM-DD"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Jail Facility:</label>
                            <select
                                name="jail_facility_id"
                                value={formData.jail_facility_id}
                                onChange={handleChange}
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            >
                                <option value="">Select Jail Facility</option>
                                {jailData?.results?.map(jail => (
                                    <option key={jail.id} value={jail.id}>
                                        {jail.jail_name}
                                    </option>
                                ))}
                            </select>
                            {currentJail && (
                                <div className="text-sm text-gray-500 mt-1">
                                    Current: <span className="font-semibold">{currentJail.jail_name}</span>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Dashboard Period:</label>
                            <select
                                name="dashboard_period"
                                value={formData.dashboard_period}
                                onChange={handleChange}
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-[#1E365D] flex ml-auto text-white py-2 px-4 rounded hover:bg-[#1A2A4D]"
                        >
                            Save Changes
                        </button>
                    </Skeleton>
                </form>

                <form
                    onSubmit={handleSubmit}
                    className="border border-gray-200 w-full md:w-96 mt-5 rounded-sm p-5 shadow-sm relative"
                >
                    <Skeleton loading={isLoading || jailLoading} active paragraph={{ rows: 8 }}>
                        {isError && (
                            <div className="mb-4">
                                <Alert
                                    message="Failed to Load Settings"
                                    description="There was a problem retrieving system settings. Please try again later or contact the administrator."
                                    type="error"
                                    showIcon
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block mb-1">Visitation Schedule</label>
                            <Select
                                value={formData?.schedule_day}
                                className="w-full"
                                placeholder="Please select a day"
                                showSearch
                                allowClear
                                optionFilterProp="lavel"
                                options={daysOfWeek?.map(day => ({
                                    value: day,
                                    label: day
                                }))}
                                onChange={value => {
                                    setFormData(prev => ({ ...prev, schedule_day: value }))
                                }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Schedule Start Time:</label>
                            <TimePicker
                                value={formData.schedule_time_start ? dayjs(formData.schedule_time_start, "HH:mm:ss") : null}
                                onChange={(time, timeString) => handleDateChange(time, timeString, 'schedule_time_start')}
                                className="w-full"
                                format="HH:mm:ss"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Schedule End Time:</label>
                            <TimePicker
                                value={formData.schedule_time_end ? dayjs(formData.schedule_time_end, "HH:mm:ss") : null}
                                onChange={(time, timeString) => handleDateChange(time, timeString, 'schedule_time_end')}
                                className="w-full"
                                format="HH:mm:ss"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#1E365D] flex ml-auto text-white py-2 px-4 rounded hover:bg-[#1A2A4D] absolute bottom-4 right-5"
                        >
                            Save Changes
                        </button>
                    </Skeleton>
                </form>
            </div>
        </div>
    );
};

export default GeneralSettings;
