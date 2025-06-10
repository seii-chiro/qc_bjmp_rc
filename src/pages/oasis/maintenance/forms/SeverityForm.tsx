import { patchOASISSeverity, postOASISSeverity } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { SeverityDataSourceRecord } from "../Severity";

export type SeverityFormType = {
    code: string;
    description: string;
};

type Props = {
    recordToEdit: SeverityDataSourceRecord | null;
    handleClose: () => void;
};

const SeverityForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<SeverityFormType>({
        code: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                code: recordToEdit.code,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                code: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'severity'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISSeverity(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISSeverity(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} severity`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'severities'] });
            handleClose();
            setForm({ code: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Severity</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Code</span>
                    <Input
                        className="h-10"
                        value={form.code}
                        onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))}
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

export default SeverityForm;
