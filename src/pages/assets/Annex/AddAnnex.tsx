import { getDetention_Building, getJail_Security_Level } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { message, Select } from "antd";
import { useState } from "react";

type AddAnnexValue = {
    building_id: number | null,
    floor_number: "",
    floor_name: "",
    floor_description: "",
    security_level_id: number | null,
}

const AddAnnex = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectAnnex, setSelectAnnex] = useState<AddAnnexValue>({
        building_id: null,
        floor_number: "",
        floor_name: "",
        floor_description: "",
        security_level_id: null,
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['level'],
                queryFn: () => getDetention_Building(token ?? "")
            },
            {
                queryKey: ['security-level'],
                queryFn: () => getJail_Security_Level(token ?? "")
            },
        ]
    });

    const buildingData = results[0].data;
    const securityLevelData = results[1].data;

    async function AddAnnex(annex: AddAnnexValue) {
        const res = await fetch(`${BASE_URL}/api/jail/detention-floors/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(annex),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Annex";
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

    const Annexmutation = useMutation({
        mutationKey: ['annex'],
        mutationFn: AddAnnex,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['annex'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleAnnexSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        Annexmutation.mutate(selectAnnex);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setSelectAnnex(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };


    const onBuildingChange = (value: number) => {
        setSelectAnnex(prevForm => ({
            ...prevForm,
            building_id: value
        }));
    };

    const onSecurityLevelChange = (value: number) => {
        setSelectAnnex(prevForm => ({
            ...prevForm,
            security_level_id: value
        }));
    };

    return (
    <div>
    {contextHolder}
        <form onSubmit={handleAnnexSubmit}>
          <h1 className="font-semibold">Add Annex</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3">
                <div>
                    <p className="text-gray-500 font-bold">Level:</p>
                    <Select
                    className="h-[3rem] w-full"
                    showSearch
                    placeholder="Level"
                    optionFilterProp="label"
                    onChange={onBuildingChange}
                    options={buildingData?.results?.map(building => (
                        {
                            value: building.id,
                            label: building?.bldg_name,
                        }
                    ))}
                    />
                </div>
                <div>
                    <p className="text-gray-500 font-bold">Annex Number:</p>
                    <input type="number" name="floor_number" id="floor_number" onChange={handleInputChange} placeholder="Annex Number" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                </div>
                <div>
                    <p className="text-gray-500 font-bold">Annex Name:</p>
                    <input type="text" name="floor_name" id="floor_name" onChange={handleInputChange} placeholder="Annex Name" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                </div>
                <div>
                    <p className="text-gray-500 font-bold">Annex Description:</p>
                    <textarea name="floor_description" id="floor_description" onChange={handleInputChange} placeholder="Annex Description" className="h-12 border outline-none border-gray-300 rounded-lg px-2 w-full" />
                </div>
                <div>
                    <p className="text-gray-500 font-bold">Security Level:</p>
                    <Select
                    className="h-[3rem] w-full"
                    showSearch
                    placeholder="Security Level"
                    optionFilterProp="label"
                    onChange={onSecurityLevelChange}
                    options={securityLevelData?.results?.map((level: { id: any; category_name: any; }) => (
                        {
                            value: level.id,
                            label: level?.category_name,
                        }
                    ))}
                    />
                </div>
            </div>
            <div className="w-full flex justify-end mt-10">
                <button type="submit" className="bg-blue-500 text-white w-36 px-3 py-2 rounded font-semibold text-base">
                Submit
                </button>
            </div>
        </form>
    </div>
    )
}

export default AddAnnex
