import { getJail_Province, getJailRegion } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useQueries } from "@tanstack/react-query";
import { Input, message, Select } from "antd";
import { useState } from "react";

type Props = {
  ethnicityId: number;
  ethnicityName: string; // <-- add this prop
  onAdd: (province: {
    region_id: number;
    province_id: number;
    description: string;
  }) => void;
  onCancel: () => void;
};

const AddEthnicityProvince = ({ethnicityId, ethnicityName, onAdd, onCancel }: Props) => {
  const token = useTokenStore().token;
  const [messageApi, contextHolder] = message.useMessage();

  const [form, setForm] = useState<{
    region_id: number | null;
    province_id: number | null;
    description: string;
  }>({
    region_id: null,
    province_id: null,
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

  const RegionData = results[0].data?.results || [];
  const ProvinceData = results[1].data?.results || [];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

const handleSubmit = () => {
  const { region_id, province_id, description } = form;
  if (!region_id || !province_id || !description) {
    messageApi.error("Please fill in all required fields.");
    return;
  }

  onAdd({
    ethnicity_id: ethnicityId, // <-- include ethnicity_id
    region_id,
    province_id,
    description,
  });

  messageApi.success("Province added successfully.");
  setForm({
    region_id: null,
    province_id: null,
    description: "",
  });
};

  const filteredProvinces = ProvinceData.filter(
    (province) => province.region === form.region_id
  );

  return (
    <div>
      {contextHolder}
      <form>
        <div className="flex w-full gap-2 mt-5">
          <div className="w-full mb-4">
            <p className="text-[#1E365D] font-bold text-lg">Ethnicity</p>
            <Input className="h-12 w-full" value={ethnicityName} disabled />
          </div>
          <div className="w-full">
            <p className="text-[#1E365D] font-bold text-lg">Region</p>
            <Select
              className="h-[3rem] w-full"
              showSearch
              placeholder="Select Region"
              optionFilterProp="label"
              onChange={onRegionChange}
              value={form.region_id ?? undefined}
              options={RegionData.map((region: any) => ({
                value: region.id,
                label: region.desc,
              }))}
            />
          </div>
          <div className="w-full">
            <p className="text-[#1E365D] font-bold text-lg">Province</p>
            <Select
              className="h-[3rem] w-full"
              showSearch
              placeholder="Select Province"
              optionFilterProp="label"
              onChange={onProvinceChange}
              value={form.province_id ?? undefined}
              options={filteredProvinces.map((province: any) => ({
                value: province.id,
                label: province.desc,
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
            Add Province
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEthnicityProvince;
