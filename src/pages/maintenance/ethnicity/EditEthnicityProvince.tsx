import { useEffect, useState } from "react";
import { Input, message, Select, Button } from "antd";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useTokenStore } from "@/store/useTokenStore";
import { patchCourtBranch } from "@/lib/query";
import { getJail_Province, getJailRegion } from "@/lib/queries";
import { patchEthnicityProvince } from "@/lib/SPQuery";

type EthnicityProvinceProps = {
    id: number;
    ethnicity_id: number;
    region_id: number;
    province_id: number;
    description: string;
    ethnicity?:string;
    region?: string;
    province?: string;
};

type EditEthnicityProvinceProps = {
    province: EthnicityProvinceProps;
    onCancel: () => void;
    onEthnicityProvinceUpdated?: () => void;
    ethnicityName?: string;
};

const EditEthnicityProvince = ({ province, onCancel, onEthnicityProvinceUpdated, ethnicityName }: EditEthnicityProvinceProps) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        region_id: province.region_id,
        province_id: province.province_id,
        ethnicity_id: province.ethnicity_id,
        description: province.description,
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

    const RegionData = Array.isArray(results[0].data)
        ? results[0].data
        : results[0].data?.results || [];
    const ProvinceData = Array.isArray(results[1].data)
        ? results[1].data
        : results[1].data?.results || [];

useEffect(() => {
    if (!province) return;
    // Only run if data is loaded
    if (!RegionData.length || !ProvinceData.length) return;

    const regionObj = RegionData.find(r => r.desc === province.region);
    const region_id = regionObj ? regionObj.id : null;

    const provinceObj = ProvinceData.find(p => p.desc === province.province);
    const province_id = provinceObj ? provinceObj.id : null;

    setForm({
        region_id,
        province_id,
        ethnicity_id: province.ethnicity_id,
        description: province.description,
    });
}, [province, RegionData, ProvinceData]);

    const handleChange = (field: "description", value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    };

    const onRegionChange = (value: number) => {
        setForm(prev => ({
            ...prev,
            region_id: value,
            province_id: null,
        }));
    };

    const onProvinceChange = (value: number) => {
        setForm(prev => ({
            ...prev,
            province_id: value,
        }));
    };

    const filteredProvinces = ProvinceData?.filter(
        (province) => province.region === form.region_id
    );

    const mutation = useMutation({
        mutationFn: (updated: EthnicityProvinceProps) =>
            patchEthnicityProvince(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ethnicity-province"] });
            messageApi.success("Ethnicity Province updated successfully");
            if (onEthnicityProvinceUpdated) onEthnicityProvinceUpdated();
        },
        onError: () => {
            messageApi.error("Failed to update Ethnicity Province");
        },
    });

    const handleSubmit = () => {
        const { region_id, province_id, description } = form;
        if (!region_id || !province_id || !description) {
            messageApi.error("Please fill in all required fields.");
            return;
        }
        mutation.mutate({
            ...province,
            ...form,
        });
    };

    return (
        <div>
            {contextHolder}
            <form>
                <div className="space-y-5">
                    
                    <div className="flex w-full gap-2 mt-5">
                        <div className="w-full mb-4">
                            <p className="text-[#1E365D] font-bold text-lg">Ethnicity</p>
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
                                value={form.region_id ?? undefined}
                                onChange={onRegionChange}
                                options={RegionData?.map(region => ({
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
                            onChange={e => handleChange("description", e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                        <Button
                            type="default"
                            onClick={onCancel}
                            className="bg-white border border-[#1e365d] text-[#1e365d] px-3 py-2 rounded-md"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={mutation.isPending}
                            className="bg-[#1E365D] text-white px-3 py-2 rounded-md"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditEthnicityProvince;