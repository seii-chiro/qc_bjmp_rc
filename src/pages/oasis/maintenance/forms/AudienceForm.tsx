import { useTokenStore } from "@/store/useTokenStore";
import { AudienceDataSourceRecord } from "../Audience";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { patchOASISAudience, postOASISAudience } from "@/lib/oasis-query";

export type AudienceFormType = {
    audience_text: string;
    description: string;
};

type Props = {
    recordToEdit: AudienceDataSourceRecord | null;
    handleClose: () => void;
};

const AudienceForm = ({ handleClose, recordToEdit }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AudienceFormType>({
        audience_text: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                audience_text: recordToEdit.audience_text,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                audience_text: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'audience'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISAudience(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISAudience(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} audience`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'audience'] });
            handleClose();
            setForm({ audience_text: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Audience</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Audience</span>
                    <Input
                        className="h-10"
                        value={form.audience_text}
                        onChange={e => setForm(prev => ({ ...prev, audience_text: e.target.value }))}
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
}

export default AudienceForm