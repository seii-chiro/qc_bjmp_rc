import { patchOASISParameterReference, postOASISParameterReference } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { ParameterReferenceDataSourceRecord } from "../Parameter";

export type ParameterReferenceFormType = {
    param_name: string;
    param_value: string;
    description: string;
};

type Props = {
    recordToEdit: ParameterReferenceDataSourceRecord | null;
    handleClose: () => void;
};

const ParameterForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ParameterReferenceFormType>({
        param_name: "",
        param_value: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                param_name: recordToEdit.param_name,
                param_value: recordToEdit.param_value,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                param_name: "",
                param_value: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'parameter'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISParameterReference(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISParameterReference(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} parameter.`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'parameters'] });
            handleClose();
            setForm({ param_name: "", param_value: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Parameter</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Parameter Name</span>
                    <Input
                        className="h-10"
                        value={form.param_name}
                        onChange={e => setForm(prev => ({ ...prev, param_name: e.target.value }))}
                    />
                </div>
                <div>
                    <span className="text-lg font-semibold">Parameter Value</span>
                    <Input
                        className="h-10"
                        value={form.param_value}
                        onChange={e => setForm(prev => ({ ...prev, param_value: e.target.value }))}
                    />
                </div>
                <div>
                    <span className="text-lg font-semibold">Description</span>
                    <Input.TextArea
                        className="!h-52"
                        value={form.description}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                </div>

                <div className="w-full flex justify-end">
                    <Button
                        onClick={() => mutation.mutate()}
                        className="w-24 bg-[#1E365D] text-white"
                    >
                        {recordToEdit ? "Update" : "Add"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ParameterForm;
