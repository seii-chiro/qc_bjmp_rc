import { patchOASISInstruction, postOASISInstruction } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { InstructionDataSourceRecord } from "../Instructions";

export type InstructionFormType = {
    instruction_text: string;
    category: string;
    description: string;
};

type Props = {
    recordToEdit: InstructionDataSourceRecord | null;
    handleClose: () => void;
};

const InstructionForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<InstructionFormType>({
        instruction_text: "",
        category: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                instruction_text: recordToEdit.instruction_text,
                category: recordToEdit.category,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                instruction_text: "",
                category: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'instructions'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISInstruction(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISInstruction(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} instruction.`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'instructions'] });
            handleClose();
            setForm({ category: "", instruction_text: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Instruction</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Instruction</span>
                    <Input
                        className="h-10"
                        value={form.instruction_text}
                        onChange={e => setForm(prev => ({ ...prev, instruction_text: e.target.value }))}
                    />
                </div>
                <div>
                    <span className="text-lg font-semibold">Category</span>
                    <Input
                        className="h-10"
                        value={form.category}
                        onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
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

export default InstructionForm;
