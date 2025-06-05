import { patchOASISGeocodeRef, postOASISGeocodeRef } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { GeocodeDataSourceRecord } from "../Geocodes";

export type GeocodeFormType = {
    value: string;
    value_name: string;
    location_name: string;
    group: string;
    description: string;
};

type Props = {
    recordToEdit: GeocodeDataSourceRecord | null;
    handleClose: () => void;
};

const GeocodeForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<GeocodeFormType>({
        value: "",
        value_name: "",
        location_name: "",
        group: "",
        description: "",
    });

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                value: recordToEdit.value,
                value_name: recordToEdit.value_name,
                location_name: recordToEdit.location_name,
                group: recordToEdit.group,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                value: "",
                value_name: "",
                location_name: "",
                group: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'geocode'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISGeocodeRef(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISGeocodeRef(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} geocode.`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'geocodes'] });
            handleClose();
            setForm({
                value: "",
                value_name: "",
                location_name: "",
                group: "",
                description: "",
            })
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Geocode</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Geocode</span>
                    <Input
                        className="h-10"
                        value={form.value}
                        onChange={e => setForm(prev => ({ ...prev, value: e.target.value }))}
                    />
                </div>
                <div>
                    <span className="text-lg font-semibold">Geocode Name</span>
                    <Input
                        className="h-10"
                        value={form.value_name}
                        onChange={e => setForm(prev => ({ ...prev, value_name: e.target.value }))}
                    />
                </div>
                <div>
                    <span className="text-lg font-semibold">Location</span>
                    <Input
                        className="h-10"
                        value={form.location_name}
                        onChange={e => setForm(prev => ({ ...prev, location_name: e.target.value }))}
                    />
                </div>
                <div>
                    <span className="text-lg font-semibold">Group</span>
                    <Input
                        className="h-10"
                        value={form.group}
                        onChange={e => setForm(prev => ({ ...prev, group: e.target.value }))}
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

export default GeocodeForm;
