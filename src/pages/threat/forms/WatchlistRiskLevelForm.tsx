import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { patchWatchlistRiskLevel, postWatchlistRiskLevel } from "@/lib/watchlistQueries";
import { tableDataSourceRecord } from "../WatchlistRiskLevel";

export type WatchlistRiskLevelFormType = {
    risk_severity: string;
    description: string;
};

type Props = {
    recordToEdit: tableDataSourceRecord | null;
    handleClose: () => void;
};

const WatchlistRiskLevelForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<WatchlistRiskLevelFormType>({
        risk_severity: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                risk_severity: recordToEdit.risk_severity,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                risk_severity: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'risk-levels'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchWatchlistRiskLevel(token ?? "", recordToEdit.id, form);
            } else {
                return postWatchlistRiskLevel(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} risk level.`);
            queryClient.invalidateQueries({ queryKey: ['watchlist', 'risk-levels'] });
            handleClose();
            setForm({ risk_severity: "", description: "" })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Watchlist Risk Level</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Risk Level</span>
                    <Input
                        className="h-10"
                        value={form.risk_severity}
                        onChange={e => setForm(prev => ({ ...prev, risk_severity: e.target.value }))}
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

export default WatchlistRiskLevelForm;
