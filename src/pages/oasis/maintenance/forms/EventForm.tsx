import { getOASISCategories, patchOASISEventType, postOASISEventType } from "@/lib/oasis-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message, Select } from "antd";
import { useEffect, useState } from "react";
import { EventDataSourceRecord } from "../Events";

export type EventFormType = {
    name: string;
    category: string;
    description: string;
};

type Props = {
    recordToEdit: EventDataSourceRecord | null;
    handleClose: () => void;
};

const EventForm = ({ recordToEdit, handleClose }: Props) => {
    const token = useTokenStore(state => state.token);
    const queryClient = useQueryClient();
    const [form, setForm] = useState<EventFormType>({
        name: "",
        category: "",
        description: "",
    });

    const { data: eventCategories, isLoading: eventCategoriesLoading } = useQuery({
        queryKey: ['OASIS', 'categories'],
        queryFn: () => getOASISCategories(token ?? "")
    })

    useEffect(() => {
        if (recordToEdit) {
            setForm({
                name: recordToEdit.name,
                category: recordToEdit.category,
                description: recordToEdit.description,
            });
        } else {
            setForm({
                name: "",
                category: "",
                description: "",
            });
        }
    }, [recordToEdit]);

    const mutation = useMutation({
        mutationKey: [recordToEdit ? 'edit' : 'add', 'event'],
        mutationFn: () => {
            if (recordToEdit) {
                return patchOASISEventType(token ?? "", recordToEdit.id, form);
            } else {
                return postOASISEventType(token ?? "", form);
            }
        },
        onSuccess: () => {
            message.success(`Successfully ${recordToEdit ? "updated" : "added"} event.`);
            queryClient.invalidateQueries({ queryKey: ['OASIS', 'events'] });
            handleClose();
            setForm({
                name: "",
                category: "",
                description: "",
            });
        },
        onError: (err) => message.error(err.message.replace(/[{}[\]]/g, ''))
    });

    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{recordToEdit ? "Edit" : "Add"} Event</h1>

            <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <span className="text-lg font-semibold">Event</span>
                    <Input
                        className="h-10"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-semibold">Category</span>
                    <Select
                        loading={eventCategoriesLoading}
                        className="h-10"
                        value={form.category}
                        showSearch
                        optionFilterProp="label"
                        options={eventCategories?.results?.map(category => ({
                            value: category?.code,
                            label: category?.code
                        }))}
                        onChange={value => setForm(prev => ({ ...prev, category: value }))}
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

export default EventForm;
