import { getDetention_Floor } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message, Select } from "antd";
import { DETENTION_CELL } from "@/lib/urls";

type AddDormResponse = {
    floor_id: number | null,
    cell_no: string,
    cell_name: string,
    cell_description: string,
}
const AddDorm = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectDorm, setselectDorm] = useState<AddDormResponse>({
        floor_id: null,
        cell_name: '',
        cell_no: '',
        cell_description: '',
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['floor'],
                queryFn: () => getDetention_Floor(token ?? "")
            },
        ]
    });

    const detentionFloorData = results[0].data;
    const detentionFloorLoading = results[0].isLoading;


    async function AddDorm(dorm: AddDormResponse) {
        const res = await fetch(DETENTION_CELL.getDETENTION_CELL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(dorm),
        });
    
        if (!res.ok) {
            let errorMessage = "Error Adding Dorm";
    
            try {
                const errorData = await res.json();
                errorMessage =
                    errorData?.message ||
                    errorData?.error ||
                    JSON.stringify(errorData);
            } catch {
                errorMessage = "Unexpected error occurred";
            }
    
            throw new Error(errorMessage);
        }
    
        return res.json();
    }

    const dormMutation = useMutation({
        mutationKey: ['dorm'],
        mutationFn: AddDorm,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['dorm'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleDormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dormMutation.mutate(selectDorm);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setselectDorm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const onFloorChange = (value: number) => {
        setselectDorm(prevForm => ({
            ...prevForm,
            floor_id: value
        }));
    };

    return (
        <div>
            {contextHolder}
            <form onSubmit={handleDormSubmit}>
                <div className="grid grid-cols-1 mt-5 gap-5">
                    <div>
                        <p>Annex:</p>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Annex"
                            optionFilterProp="label"
                            onChange={onFloorChange}
                            loading={detentionFloorLoading}
                            options={detentionFloorData?.results?.map(floor => (
                                {
                                    value: floor.id,
                                    label: floor?.floor_name,
                                }
                            ))}
                        />
                    </div>
                    <div>
                        <p>Dorm Number:</p> 
                        <input type="text" name="cell_no" id="cell_no" onChange={handleInputChange} placeholder="Dorm No." className="w-full h-12 border border-gray-300 rounded-lg px-2" />
                    </div>
                    <div>
                        <p>Dorm Name:</p>
                        <input type="text" name="cell_name" id="cell_name" onChange={handleInputChange} placeholder="Dorm Name" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
                    </div>
                    <div>
                        <p>Dorm Description:</p>
                        <input type="text" name="cell_description" id="cell_description" onChange={handleInputChange} placeholder="Dorm Description" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
                    </div>
                </div>
                <div className="w-full flex justify-end mt-10">
                    <button type="submit" className="w-40 bg-blue-500 text-white px-3 py-2 rounded font-semibold text-base">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddDorm
