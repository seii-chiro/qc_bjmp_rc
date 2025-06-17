import { getJail_Province, getJailRegion } from "@/lib/queries";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Input, message, Select } from "antd";
import { useState } from "react";

type EthnicityProvincePayload = {
    ethnicity_id: number;
    region_id: number;
    province_id: number;
    description: string;
}

type AddEthnicityProvinceProps = {
    ethnicityId: number;
    ethnicityName: string; 
    onAdd: (province: EthnicityProvincePayload) => void;
    onCancel: () => void;
};
const AddEditEthnicityProvince = ({ethnicityId, ethnicityName, onCancel, onAdd}: AddEthnicityProvinceProps) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<{
        ethnicity_id: number | null;
        region_id: number | null;
        province_id: number | null;
        description: string;
    }>({
        region_id: null,
        province_id: null,
        ethnicity_id: null,
        description: "",
    });

    const results = useQueries({
        queries: [
        {
            queryKey: ["region"],
            queryFn: () => getJailRegion(token ?? ""),
        },
        {
            queryKey: ["province"],
            queryFn: () => getJail_Province(token ?? ""),
        },
        ],
    });

    const RegionData = results[0].data || [];
    const ProvinceData = results[1].data || [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
        ...prev,
        description: e.target.value,
        }));
    };

    const onRegionChange = (value: number) => {
        setForm((prev) => ({
        ...prev,
        region_id: value,
        province_id: null,
        }));
    };

    const onProvinceChange = (value: number) => {
        setForm((prev) => ({
        ...prev,
        province_id: value,
        }));
    };

    const filteredProvinces = ProvinceData?.results?.filter(
        (province) => province.region === form.region_id
    );

    const handleSubmit = () => {
        const { region_id, province_id, description} = form;

        if (!region_id || !province_id || !description) {
            messageApi.error("Please fill in all required fields.");
            return;
        }

        const newEthnicityProvince: EthnicityProvincePayload = {
            ethnicity_id: ethnicityId,
            region_id,
            province_id,
            description,
        };

        ethnicityProvinceMutation.mutate(newEthnicityProvince, {
            onSuccess: () => {
                setForm({
                    ethnicity_id: null,
                    region_id: null,
                    province_id: null,
                    description: "",
                });
                if (onAdd) onAdd(newEthnicityProvince);
            }
        });
    };

    async function addEthnicityProvince(province: EthnicityProvincePayload) {
        const res = await fetch(`${BASE_URL}/api/codes/ethnicity-provinces/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(province),
        });

        if (!res.ok) {
            let errorMessage = "Error Adding Ethincity Province";
            try {
                const errorData = await res.json();
                errorMessage = errorData?.message || errorData?.error || JSON.stringify(errorData);
            } catch {
                errorMessage = "Unexpected error occurred";
            }
            throw new Error(errorMessage);
        }
        return res.json();
    }

    const ethnicityProvinceMutation = useMutation({
        mutationKey: ["ethnicity-province"],
        mutationFn: addEthnicityProvince,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ethnicity-province'] });
            messageApi.success("Added successfully");
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });
    return (
        <div>
        {contextHolder}
        <form>
            <div className="space-y-5">
                <div className="flex w-full gap-2 mt-5">
                    <div className="w-full">
                        <p className="text-[#1E365D] font-bold text-lg">Ethnicity Name</p>
                        <Input className="h-12 w-full" value={ethnicityName} disabled />
                    </div>
                    <div className="w-full">
                        <p className="flex gap-[1px] text-[#1E365D] text-lg font-bold">
                        Region <span className="text-red-600">*</span>
                        </p>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Region"
                            optionFilterProp="label"
                            onChange={onRegionChange}
                            options={RegionData?.results?.map(region => ({
                                value: region.id,
                                label: region?.desc,
                            }))}
                        />
                    </div>
                    <div className="w-full">
                        <p className="flex gap-[1px] text-[#1E365D] font-bold text-lg">
                        Province <span className="text-red-600">*</span>
                        </p>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Province"
                            optionFilterProp="label"
                            value={form.province_id ?? undefined}
                            onChange={onProvinceChange}
                            options={filteredProvinces?.map(province => ({
                                value: province.id,
                                label: province?.desc,
                            }))}
                            disabled={!form.region_id}
                        />
                    </div>
                </div>
                <div className="w-full mt-5">
                    <p className="text-[#1E365D] font-bold text-lg">Description</p>
                    <Input
                        className="h-12 w-full"
                        placeholder="Enter Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex justify-end mt-4 gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white border border-[#1e365d] text-[#1e365d] px-3 py-2 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-[#1E365D] text-white px-3 py-2 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </div>
        </form>
        </div>
    )
}

export default AddEditEthnicityProvince
