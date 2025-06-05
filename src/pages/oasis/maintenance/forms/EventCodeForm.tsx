import { patchOASISEventCode, postOASISEventCode } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { EventCodeDataSourceRecord } from "../EventCodes";

export type EventCodeFormType = {
    value: string;
    value_name: string;
    description: string;
};

type Props = {
    recordToEdit: EventCodeDataSourceRecord | null;
    handleClose: () => void;
};

const EventCodeForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<EventCodeFormType>({
        value: "",
        value_name: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                value: recordToEdit.value,
                value_name: recordToEdit.value_name,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                value: "",
                value_name: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'event-code'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISEventCode(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISEventCode(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} event code`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'eventCodes'] });
            handleClose();
            setForm({ value: "", value_name: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Event Code</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Value</span>
                    <Input
                        className="h-10"
                        value={form.value}
                        onChange={e => setForm(prev => ({ ...prev, value: e.target.value }))}
                    />
                </div>
                <div>
                    <span className="text-lg font-semibold">Value Name</span>
                    <Input
                        className="h-10"
                        value={form.value_name}
                        onChange={e => setForm(prev => ({ ...prev, value_name: e.target.value }))}
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

export default EventCodeForm;
