import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Button, message, Select } from "antd";
import { updateDetention_Floor, getDetention_Building, getJail_Security_Level} from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useEffect, useState } from "react";

const EditAnnex = ({ annex, onClose }: { annex: any; onClose: () => void }) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false); 

    const updateAnnexMutation = useMutation({
        mutationFn: (updatedData: any) =>
            updateDetention_Floor(token ?? "", annex.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['annex'] });
            setIsLoading(true); 
            messageApi.success("Annex updated successfully");
            onClose();
        },
        onError: (error: any) => {
            setIsLoading(false); 
            messageApi.error(error.message || "Failed to update Annex");
        },
    });
    
    const results = useQueries({
        queries: [
            {
                queryKey: ['detention-building'],
                queryFn: () => getDetention_Building(token ?? "")
            },
            {
                queryKey: ['security-level'],
                queryFn: () => getJail_Security_Level(token ?? "")
            },
        ]
    });

    const detentionBuildingData = results[0].data;
    const detentionBuildingLoading = results[0].isLoading;

    const SecurityLevelData = results[1].data;
    const SecurityLevelLoading = results[1].isLoading;

        useEffect(() => {
            if (annex) {
                form.setFieldsValue({
                    building_id: annex?.building_id,
                    floor_number: annex?.floor_number,
                    floor_name: annex?.floor_name,
                    floor_description: annex?.floor_description,
                    security_level_id: annex?.security_level_id,
                });
            }
        }, [annex, form]);

    const handleSubmit = (values: { 
        building_id: number | null;
        floor_number: string;
        floor_name: string;
        floor_description: string;
        security_level_id: number | null;
    }) => {
        setIsLoading(true);
        updateAnnexMutation.mutate(values);
    };
    return (
        <div>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item label="Level" name="building_id">
                    <Select 
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Level"
                        optionFilterProp="label"
                        loading={detentionBuildingLoading}
                        options={detentionBuildingData?.results?.map(building => ({
                            value: building.id,
                            label: building.bldg_name
                        }))} />
                </Form.Item>
                <Form.Item label="Annex Name" name="floor_name" required>
                    <Input />
                </Form.Item>
                <Form.Item label="Annex Number" name="floor_number" required>
                    <Input />
                </Form.Item>
                <Form.Item label="Security Level" name="security_level_id">
                    <Select 
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Security Level"
                        optionFilterProp="label"
                        loading={SecurityLevelLoading}
                        options={SecurityLevelData?.results?.map((security_level: { id: any; category_name: any; }) => ({
                            value: security_level.id,
                            label: security_level.category_name
                        }))} />
                </Form.Item>
                <Form.Item label="Annex Description" name="floor_description" rules={[{ required: true, message: "Please input the Annex Description!" }]}>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" className="flex ml-auto" htmlType="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Annex"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditAnnex
