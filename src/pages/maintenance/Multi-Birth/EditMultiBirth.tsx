import { updateMultiBirth } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { useEffect, useState } from "react";

const EditMultiBirth = ({ multibirth, onClose }: { multibirth: any; onClose: () => void }) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false);

    const updateMutation = useMutation({
        mutationFn: (updatedData: any) =>
            updateMultiBirth(token ?? "", multibirth.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sibling-group"] });
            setIsLoading(false);
            messageApi.success("Multi Birth Classification updated successfully");
            setTimeout(() => {
                onClose();
            }, 1000); // Wait 1 second before closing so the message is visible
        },        
        onError: (error: any) => {
            setIsLoading(false); 
            messageApi.error(error.message || "Failed to update Multi Birth Classification");
        },
    });

    useEffect(() => {
        if (multibirth) {
            form.setFieldsValue({
                classification: multibirth.classification ,
                group_size: multibirth.group_size ,
                term_for_sibling_group: multibirth.term_for_sibling_group ,
                description: multibirth.description
            });
        }
    }, [multibirth, form]);

    const handleMultiBirthSubmit = (values: any) => {
        const payload = {
            classification: values.classification ,
            group_size: values.group_size ,
            term_for_sibling_group: values.term_for_sibling_group ,
            description: values.description
        };
            const cleanedPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== null)
            );
        
            setIsLoading(true);
            updateMutation.mutate(cleanedPayload);
        };

    return (
        <div>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleMultiBirthSubmit}
                initialValues={{
                    classification: multibirth?.classification ?? 'N/A',
                    group_size: multibirth?.group_size ?? 'N/A',
                    term_for_sibling_group: multibirth?.term_for_sibling_group ?? 'N/A',
                    description: multibirth?.description ?? 'N/A',
                }}
            >
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-2">
                <Form.Item label="Classification" name="classification">
                    <Input className="h-12 border border-gray-300 rounded-lg px-2"/>
                </Form.Item>
                <Form.Item label="Group Size" name="group_size">
                    <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2"/>
                </Form.Item>
                <Form.Item label="Term for Sibling Group" name="term_for_sibling_group">
                    <Input className="h-12 border border-gray-300 rounded-lg px-2"/>
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <Input className="h-12 border border-gray-300 rounded-lg px-2"/>
                </Form.Item>
            </div>
            <Form.Item>
                    <Button type="primary" className="flex ml-auto" htmlType="submit">
                        Update Multi Birth Classification
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditMultiBirth
