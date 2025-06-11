import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { tableDataSourceRecord } from "../WatchlistType";
import { patchWatchlistType, postWatchlistType } from "@/lib/watchlistQueries";

export type WatchlistTypeFormType = {
    name: string;
    description: string;
};

type Props = {
    recordToEdit: tableDataSourceRecord | null;
    handleClose: () => void;
};

const WatchlistTypeForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<WatchlistTypeFormType>({
        name: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                name: recordToEdit.name,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                name: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'types'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchWatchlistType(token ?? "", recordToEdit.id, form);
            } else {
                return postWatchlistType(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} type`);
            queryClient.invalidateQueries({ queryKey: ['watchlist', 'types'] });
            handleClose();
            setForm({ name: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Watchlist Type</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Watchlist Type</span>
                    <Input
                        className="h-10"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
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

export default WatchlistTypeForm;
