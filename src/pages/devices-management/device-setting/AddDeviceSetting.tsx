import { getDevice, getRecord_Status } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Input, message, Select } from "antd";
import { useState } from "react";

type DeviceSettingAdd = {
    device_id: number | null;
    key: string;
    value: string;
    description: string;
    record_status_id: number | null;
}

const AddDeviceSetting = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const [deviceSettingForm, setDeviceSettingForm] = useState<DeviceSettingAdd>({
        device_id: null,
        key: '',
        value: '',
        description: "",
        record_status_id: null,
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ["device"],
                queryFn: () => getDevice(token ?? ""),
            },
            {
                queryKey: ['record-status'],
                queryFn: () => getRecord_Status(token ?? "")
            },
        ],
    });

    const deviceData = results[0].data;
    const recordStatusData = results[1].data;

    async function addDevice(device_setting: DeviceSettingAdd) {
        const res = await fetch(`${BASE_URL}/api/codes/device-settings/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(device_setting),
        });

        if (!res.ok) {
            let errorMessage = "Error Adding Court Device Setting";
            try {
                const errorData = await res.json();
                errorMessage = errorData?.message || errorData?.error || JSON.stringify(errorData);
            } catch {
                errorMessage = "Unexpected error occurred";
            }
            throw new Error(errorMessage);
        }
        return res.json();
    }

    const deviceSettingMutation = useMutation({
        mutationKey: ["device-setting"],
        mutationFn: addDevice,
        onSuccess: (data) => {
            console.log(data);
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handledeviceSettingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        deviceSettingMutation.mutate(deviceSettingForm);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeviceSettingForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };
    const onDeviceChange = (value: number) => {
        setDeviceSettingForm(prevForm => ({
            ...prevForm,
            device_id: value,
        }));
    };

    const onRecordStatusChange = (value: number) => {
        setDeviceSettingForm(prevForm => ({
            ...prevForm,
            record_status_id: value,
        }));
    };

    return (
        <div>
        {contextHolder}
        <form onSubmit={handledeviceSettingSubmit}>
            <div className="space-y-5">
                <div className="flex w-full gap-2 mt-5">
                    <div className="w-full">
                        <p>Device:</p>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Device"
                            optionFilterProp="label"
                            onChange={onDeviceChange}
                            options={deviceData?.map(device => ({
                                value: device.id,
                                label: `${device.device_name} (${device.serial_no})`,
                            }))}
                        />
                    </div>
                    <div className="w-full">
                        <p>Setting Key:</p>
                        <Input
                            className="h-12 w-full"
                            id="key"
                            name="key"
                            placeholder="Setting Key"
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="flex w-full gap-2 mt-5">
                    <div className="w-full">
                        <p>Setting Value:</p>
                        <Input
                            className="h-12 w-full"
                            id="value"
                            name="value"
                            placeholder="Setting Value"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="w-full">
                        <p>Description:</p>
                        <Input
                            className="h-12 w-full"
                            id="description"
                            name="description"
                            placeholder="Description"
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="flex w-full gap-2 mt-5">
                    <div className="w-full">
                        <p>Record Status:</p>
                            <Select
                                className="h-[3rem] w-full"
                                showSearch
                                placeholder="Record Status"
                                optionFilterProp="label"
                                onChange={onRecordStatusChange}
                                options={recordStatusData?.map(status => ({
                                    value: status.id,
                                    label: status?.status,
                                }))}
                            />
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-end mt-10">
                <button
                    type="submit"
                    className="bg-blue-500 text-white w-36 px-3 py-2 rounded font-semibold text-base"
                    >
                        Submit
                </button>
            </div>
        </form>
        </div>
    )
}

export default AddDeviceSetting
