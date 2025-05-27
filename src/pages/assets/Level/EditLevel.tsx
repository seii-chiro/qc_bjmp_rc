import { getJail, getJail_Security_Level, updateDetention_Building } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Select } from "antd";
import { useState } from "react";

type EditLevelResponse = {
    bldg_name: string,
    jail_id: number | null,
    security_level_id: number | null,
}

const EditLevel = ({ level, onClose }: { level: any; onClose: () => void }) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false); 
    const queryClient = useQueryClient();
    const [selectLevel, setSelectedLevel] = useState<EditLevelResponse>({
        bldg_name: '',
        jail_id: null,
        security_level_id: null,
    });

    const updateMutation = useMutation({
        mutationFn: (updatedData: any) =>
            updateDetention_Building(token ?? "", level.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['level'] });
            setIsLoading(true); 
            messageApi.success("Level updated successfully");
            onClose();
        },
        onError: (error: any) => {
            setIsLoading(false); 
            messageApi.error(error.message || "Failed to update Level");
        },
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['jail'],
                queryFn: () => getJail(token ?? "")
            },
            {
                queryKey: ['security-level'],
                queryFn: () => getJail_Security_Level(token ?? "")
            },
        ]
    });

    const jailData = results[0].data;
    const jailLoading = results[0].isLoading;

    const securityLevelData = results[1].data;
    const securityLevelLoading = results[1].isLoading;

        const handleDetentionBuildingSubmit = (values: { 
        bldg_name: string;
        jail_id: number;
        security_level_id: number;
    }) => {
        setIsLoading(true);
        updateMutation.mutate(values);
    };

    const onJailChange = (value: number) => {
        setSelectedLevel(prevForm => ({
            ...prevForm,
            jail_id: value
        }));
    };

    const onSecurityLevelChange = (value: number) => {
        setSelectedLevel(prevForm => ({
            ...prevForm,
            security_level_id: value
        }));
    };
    return (
        <div>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleDetentionBuildingSubmit}
                initialValues={{
                    bldg_name: level?.bldg_name,
                    jail_id: level?.jail_id,
                    security_level_id: level?.security_level_id,
                }}
            >
                <Form.Item
                    label="Level Name"
                    name="bldg_name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Jail"
                    name="jail_id"
                >
                    <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail"
                            optionFilterProp="label"
                            onChange={onJailChange}
                            loading={jailLoading}
                            options={jailData?.results?.map(jail => (
                                {
                                    value: jail.id,
                                    label: jail?.jail_name,
                                }
                            ))}
                        />
                </Form.Item>
                <Form.Item
                    label="Jail Security Level"
                    name="security_level_id"
                >
                    <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Security Level"
                            optionFilterProp="label"
                            onChange={onSecurityLevelChange}
                            loading={securityLevelLoading}
                            options={securityLevelData?.results?.map(securitylevel => (
                                {
                                    value: securitylevel.id,
                                    label: securitylevel?.category_name,
                                }
                            ))}
                        />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" className="flex ml-auto" htmlType="submit">
                   Update Level
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditLevel
