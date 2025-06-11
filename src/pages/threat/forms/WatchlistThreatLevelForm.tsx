import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { patchWatchlistThreatLevel, postWatchlistThreatLevel } from "@/lib/watchlistQueries";
import { tableDataSourceRecord } from "../WatchlistThreatLevel";

export type WatchlistThreatLevelFormType = {
    threat_level: string;
    description: string;
};

type Props = {
    recordToEdit: tableDataSourceRecord | null;
    handleClose: () => void;
};

const WatchlistThreatLevelForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<WatchlistThreatLevelFormType>({
        threat_level: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                threat_level: recordToEdit.threat_level,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                threat_level: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'threat-levels'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchWatchlistThreatLevel(token ?? "", recordToEdit.id, form);
            } else {
                return postWatchlistThreatLevel(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} threat level.`);
            queryClient.invalidateQueries({ queryKey: ['watchlist', 'threat-levels'] });
            handleClose();
            setForm({ threat_level: "", description: "" })
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
                        value={form.threat_level}
                        onChange={e => setForm(prev => ({ ...prev, threat_level: e.target.value }))}
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

export default WatchlistThreatLevelForm;
