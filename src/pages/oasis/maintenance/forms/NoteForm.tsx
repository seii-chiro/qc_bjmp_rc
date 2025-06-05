import { patchOASISNote, postOASISNote } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { NoteDataSourceRecord } from "../Notes";

export type NoteFormType = {
    note_text: string;
    description: string;
};

type Props = {
    recordToEdit: NoteDataSourceRecord | null;
    handleClose: () => void;
};

const NoteForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<NoteFormType>({
        note_text: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                note_text: recordToEdit.note_text,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                note_text: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'notes'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISNote(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISNote(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} note`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'notes'] });
            handleClose();
            setForm({ note_text: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Note</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Note</span>
                    <Input
                        className="h-10"
                        value={form.note_text}
                        onChange={e => setForm(prev => ({ ...prev, note_text: e.target.value }))}
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

export default NoteForm;
