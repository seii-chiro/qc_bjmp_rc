import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Button, message, Select } from "antd";
import { updateDetentionCell, getDetention_Floor } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useEffect, useState } from "react";

type EditDormProps = {
    dorm: any;
    onClose: () => void;
};

const EditDorm = ({ dorm, onClose }: EditDormProps) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false);

    const updateMutation = useMutation({
        mutationFn: (updatedData: any) =>
            updateDetentionCell(token ?? "", dorm.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dorm'] });
            setIsLoading(false);
            messageApi.success("Dorm updated successfully");
            onClose();
        },
        onError: (error: any) => {
            setIsLoading(false);
            messageApi.error(error.message || "Failed to update Dorm");
        },
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['annex'],
                queryFn: () => getDetention_Floor(token ?? "")
            },
        ]
    });

    const detentionFloorData = results[0].data;
    const detentionFloorLoading = results[0].isLoading;

    useEffect(() => {
        if (dorm) {
            form.setFieldsValue({
                floor_id: dorm.floor_id,
                cell_no: dorm.cell_no,
                cell_name: dorm.cell_name,
                cell_description: dorm.cell_description,
            });
        }
    }, [dorm, form]);

    const handleDormSubmit = (values: any) => {
        const formattedValues = {
            ...values,
            floor_id: Number(values.floor_id),
        };

        setIsLoading(true);
        updateMutation.mutate(formattedValues);
    };

    return (
        <div>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleDormSubmit}
            >
                <Form.Item
                    label="Annex"
                    name="floor_id"
                    rules={[{ required: true, message: "Please select a Annex" }]}
                >
                    <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Select a Annex"
                        optionFilterProp="label"
                        loading={detentionFloorLoading}
                        options={detentionFloorData?.results?.map(floor => ({
                            value: floor.id,
                            label: floor.floor_name
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Dorm No"
                    name="cell_no"
                    rules={[{ required: true, message: "Please enter the Dorm number" }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    label="Dorm Name"
                    name="cell_name"
                    rules={[{ required: true, message: "Please enter the Dorm name" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Dorm Description"
                    name="cell_description"
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" className="flex ml-auto" htmlType="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Dorm"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditDorm
