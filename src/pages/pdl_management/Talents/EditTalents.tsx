import { updateTalents } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { useEffect, useState } from "react";

const EditTalents = ({ talents, onClose }: { talents: any; onClose: () => void }) => {
    const token = useTokenStore().token;
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const updateMutation = useMutation({
        mutationFn: (updatedData: any) =>
            updateTalents(token ?? "", talents.key, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['talents'] });
            setIsLoading(false); // Fixed: should be false, not true
            messageApi.success("Talents updated successfully");
            onClose();
        },
        onError: (error: any) => {
            setIsLoading(false);
            messageApi.error(error.message || "Failed to update Talents");
        },
    });

    useEffect(() => {
        if (talents) {
            form.setFieldsValue({
                name: talents.name || '',
                description: talents.description || '',
            });
        }
    }, [talents, form]);

    const handleTalentsSubmit = (values: {
        name: string;
        description: string;
    }) => {
        // Validation checks
        if (!token) {
            messageApi.error("Authentication token is missing");
            return;
        }

        if (!talents?.key) {
            messageApi.error("Talent ID is missing");
            return;
        }

        // Ensure values are strings, not undefined
        const sanitizedValues = {
            name: values.name?.toString() || '',
            description: values.description?.toString() || ''
        };

        setIsLoading(true);
        updateMutation.mutate(sanitizedValues);
    };

    return (
        <div>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleTalentsSubmit}
                initialValues={{
                    name: talents?.name || '',
                    description: talents?.description || '',
                }}
            >
                <Form.Item
                    label="Talents"
                    name="name"
                    rules={[
                        { required: true, message: 'Please input talent name!' },
                        { whitespace: true, message: 'Talent name cannot be empty!' }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                    rules={[
                        { required: true, message: 'Please input description!' },
                        { whitespace: true, message: 'Description cannot be empty!' }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        className="flex ml-auto"
                        htmlType="submit"
                        loading={isLoading}
                    >
                        Update Talents
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditTalents