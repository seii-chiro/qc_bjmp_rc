import { Button, message, Modal, Table } from "antd";
import { useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import AddEthnicityProvince from "./AddEthnicityProvince";
import { GoPlus } from "react-icons/go";
import { AiOutlineDelete } from "react-icons/ai";
import { getJailRegion, getJail_Province } from "@/lib/queries";

type AddEthnicity = {
  name: string;
  description: string;
};

type EthnicGroupProvincePayload = {
  ethnicity_id?: number;
  region_id: number;
  province_id: number;
  record_status_id: number;
  description: string;
  region?: string;
  province?: string;
  ethnicity?:string;
};

const AddEthnicity = ({ onClose }: { onClose: () => void }) => {
  const token = useTokenStore().token;
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [ethnicityProvince, setEthnicityProvince] = useState<EthnicGroupProvincePayload[]>([]);
  const [selectEthnicity, setSelectEthnicity] = useState<AddEthnicity>({ name: "", description: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const addEthnicity = async (ethnicity: AddEthnicity) => {
    const res = await fetch(`${BASE_URL}/api/codes/ethnicities/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(ethnicity),
    });

    if (!res.ok) throw new Error("Error Adding Ethnicity");
    return res.json();
  };

  const addProvince = async (data: EthnicGroupProvincePayload) => {
    const res = await fetch(`${BASE_URL}/api/codes/ethnicity-provinces/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error Adding Ethnicity Province");
    return res.json();
  };

  const ethnicityMutation = useMutation({
    mutationKey: ["ethnicity"],
    mutationFn: addEthnicity,
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["ethnicity"] });
      const ethnicity_id = data?.id;
      ethnicityProvince.forEach((item) => {
        provinceMutation.mutate({
          ...item,
          ethnicity_id,
        });
      });
      messageApi.success("Ethnicity and Provinces added successfully!");
      onClose();
    },
    onError: (err: any) => {
      messageApi.error(err.message);
    },
  });

  const provinceMutation = useMutation({
    mutationKey: ["ethnicity-province"],
    mutationFn: addProvince,
    onError: (err: any) => {
      messageApi.error(err.message);
    },
  });

  const handleRemoveProvince = (index: number) => {
    setEthnicityProvince((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectEthnicity.name || !selectEthnicity.description || ethnicityProvince.length === 0) {
      messageApi.error("Please fill all fields and add at least one province.");
      return;
    }
    ethnicityMutation.mutate(selectEthnicity);
  };

  const columns = [
    { title: "Ethnicity", dataIndex: "ethnicity", key: "ethnicity" },
    { title: "Region", dataIndex: "region", key: "region" },
    { title: "Province", dataIndex: "province", key: "province" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, __: any, index: number) => (
        <Button danger onClick={() => handleRemoveProvince(index)}>
          <AiOutlineDelete />
        </Button>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <h1 className="text-[#1E365D] font-bold text-lg mb-4">Add a Filipino Ethnic Group</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="w-full">
            <p className="text-[#1E365D] font-bold text-base">Ethnicity Name:</p>
            <input
              name="name"
              value={selectEthnicity.name}
              onChange={(e) => setSelectEthnicity({ ...selectEthnicity, name: e.target.value })}
              className="w-full h-12 px-3 border rounded"
            />
          </div>
          <div className="w-full">
            <p className="text-[#1E365D] font-bold text-base">Description:</p>
            <input
              name="description"
              value={selectEthnicity.description}
              onChange={(e) => setSelectEthnicity({ ...selectEthnicity, description: e.target.value })}
              className="w-full h-12 px-3 border rounded"
            />
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-between items-center pb-2">
            <h1 className="text-[#1E365D] font-bold md:text-lg">Ethnicity Province</h1>
            <Button className="bg-[#1E365D] text-white px-3 py-4 text-lg rounded-md" onClick={() => setIsModalOpen(true)} icon={<GoPlus />} type="primary">
              Add Province
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={ethnicityProvince}
            rowKey={(_, index) => index?.toString()}
            pagination={false}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button className="bg-[#1E365D] text-white px-5 text-lg py-4 rounded-md" onClick={onClose}>Cancel</Button>
            <Button className="bg-[#1E365D] text-white px-5 text-lg py-4 rounded-md" htmlType="submit" type="primary">
              Save
            </Button>
          </div>
        </div>
      </form>

      <Modal
        title="Add Ethnicity Province"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="40%"
      >
        <AddEthnicityProvince
          ethnicityId={0}
          ethnicityName={selectEthnicity.name}
          onAdd={(newProvince) => {
            const region = RegionData?.find(r => r.id === newProvince.region_id)?.desc || '';
            const province = ProvinceData?.find(p => p.id === newProvince.province_id)?.desc || '';
            setEthnicityProvince((prev) => [
              ...prev,
              {
                ...newProvince,
                region,
                province,
                ethnicity: selectEthnicity.name, // <-- add this line
                record_status_id: 1,
              },
            ]);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AddEthnicity;
