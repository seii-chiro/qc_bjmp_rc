import { useEffect, useState } from "react";
import { Input, message, Select, Button } from "antd";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useTokenStore } from "@/store/useTokenStore";
import { patchCourtBranch } from "@/lib/query";
import { getJail_Province, getJailRegion } from "@/lib/queries";

type BranchProps = {
    id: number;
    court_id: number;
    region_id: number;
    province_id: number;
    branch: string;
    judge: string;
    court?: string;
    region?: string;
    province?: string;
};

type EditCourtBranchProps = {
    branch: BranchProps;
    onCancel: () => void;
    onBranchUpdated?: () => void;
    courtName?: string; // Optional, for display
};

const EditCourtBranch = ({ branch, onCancel, onBranchUpdated, courtName }: EditCourtBranchProps) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        region_id: branch.region_id,
        province_id: branch.province_id,
        branch: branch.branch,
        judge: branch.judge,
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
    if (!branch) return;
    // Only run if data is loaded
    if (!RegionData.length || !ProvinceData.length) return;

    const regionObj = RegionData.find(r => r.desc === branch.region);
    const region_id = regionObj ? regionObj.id : null;

    const provinceObj = ProvinceData.find(p => p.desc === branch.province);
    const province_id = provinceObj ? provinceObj.id : null;

    setForm({
        region_id,
        province_id,
        branch: branch.branch,
        judge: branch.judge,
    });
}, [branch, RegionData, ProvinceData]);

    const handleChange = (field: "branch" | "judge", value: string) => {
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
        mutationFn: (updated: BranchProps) =>
            patchCourtBranch(token ?? "", updated.id, updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["court-branch"] });
            messageApi.success("Court Branch updated successfully");
            if (onBranchUpdated) onBranchUpdated();
        },
        onError: () => {
            messageApi.error("Failed to update Court Branch");
        },
    });

    const handleSubmit = () => {
        const { region_id, province_id, branch: branchName, judge } = form;
        if (!region_id || !province_id || !branchName || !judge) {
            messageApi.error("Please fill in all required fields.");
            return;
        }
        mutation.mutate({
            ...branch,
            ...form,
        });
    };

    return (
        <div>
            {contextHolder}
            <form>
                <div className="space-y-5">
                    
                    <div className="flex w-full gap-2 mt-5">
                        <div className="w-full">
                            <p className="text-[#1E365D] font-bold text-lg">Judicial Court</p>
                            <Input
                                className="h-12 w-full"
                                value={courtName || branch.court || ""}
                                disabled
                            />
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
                    <div className="w-full flex gap-2 mt-5">
                        <div className="flex flex-col w-full">
                            <p className="text-[#1E365D] font-bold text-lg">Branch Name</p>
                            <Input
                                className="h-12 w-full"
                                placeholder="Branch Name"
                                value={form.branch}
                                onChange={e => handleChange("branch", e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col w-full">
                            <p className="text-[#1E365D] font-bold text-lg">Judge's Name</p>
                            <Input
                                className="h-12 w-full"
                                placeholder="Judge's Name"
                                value={form.judge}
                                onChange={e => handleChange("judge", e.target.value)}
                            />
                        </div>
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
                            loading={mutation.isLoading}
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

export default EditCourtBranch;