import { getDevice } from "@/lib/queries";
import { patchDeviceSetting } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Select } from "antd";
import { useEffect, useState } from "react";

type DeviceSettingEdit = {
    device_id: number | null;
    key: string;
    value: string;
    description: string;
}

const EditDeviceSetting = ({ devicesSetting, onClose }: { devicesSetting: any; onClose: () => void }) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false); 

    const updateMutation = useMutation({
        mutationFn: (updatedData: any) =>
            patchDeviceSetting(token ?? "", devicesSetting.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['device-setting'] });
            setIsLoading(false); 
            messageApi.success("Devices Setting updated successfully");
            onClose();
        },
        onError: (error: any) => {
            setIsLoading(false); 
            messageApi.error(error.message || "Failed to update Devices Setting");
        },
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['device'],
                queryFn: () => getDevice(token ?? "")
            },
        ]
    });

    const deviceData = results[0].data;

    useEffect(() => {
        if (devicesSetting) {
            const initialValues = {
                device_id: devicesSetting.device_id,
                key: devicesSetting.key,
                value: devicesSetting.value,
                description: devicesSetting.description,
            };
            
            form.setFieldsValue(initialValues);
        }
    }, [devicesSetting, form]);


    const handledevicesSubmit = (values: DeviceSettingEdit) => {
        setIsLoading(true);
        updateMutation.mutate(values);
    };

    const onDeviceChange = (value: number) => {
        form.setFieldsValue({ device_id: value });
    };

    return (
        <div>
        {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handledevicesSubmit}
                initialValues={{
                    device_id: devicesSetting?.device_id ?? null,
                    key: devicesSetting?.key ?? null,
                    value: devicesSetting?.value ?? null,
                    description: devicesSetting?.description ?? null,
                }}
            >
                <Form.Item
                    label="Device"
                    name="device_id"
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Device"
                        optionFilterProp="label"
                        onChange={onDeviceChange}
                        options={deviceData?.results?.map(device => ({
                            value: device.id,
                            label: device.device_name
                        }))}/>
                </Form.Item>
                <Form.Item
                    label="Key"
                    name="key"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Value"
                    name="value"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                    >
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditDeviceSetting
