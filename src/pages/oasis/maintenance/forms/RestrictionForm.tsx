import { patchOASISRestriction, postOASISRestriction } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { RestrictionDataSourceRecord } from "../Restrictions";

export type RestrictionFormType = {
    restriction_text: string;
    description: string;
};

type Props = {
    recordToEdit: RestrictionDataSourceRecord | null;
    handleClose: () => void;
};

const RestrictionForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<RestrictionFormType>({
        restriction_text: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                restriction_text: recordToEdit.restriction_text,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                restriction_text: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'restrictions'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISRestriction(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISRestriction(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} restriction`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'restrictions'] });
            handleClose();
            setForm({ restriction_text: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Restriction</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Restriction</span>
                    <Input
                        className="h-10"
                        value={form.restriction_text}
                        onChange={e => setForm(prev => ({ ...prev, restriction_text: e.target.value }))}
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

export default RestrictionForm;
