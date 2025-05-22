import { getJail, getJail_Security_Level } from "@/lib/queries";
import { DETENTION_BUILDING } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { message, Select } from "antd";
import { useState } from "react";


type AddLevelResponse = {
    jail: number | null;
    bldg_name: string;
    security_level: number | null;
    bldg_description: string;
    bldg_status: string;
};
const AddLevel = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<AddLevelResponse>({
        jail: null,
        bldg_name: "",
        security_level: null,
        bldg_description: "",
        bldg_status: "",
    });
    const results = useQueries({
        queries: [
            {
                queryKey: ["jail"],
                queryFn: () => getJail(token ?? ""),
            },
            {
                queryKey: ["security-level"],
                queryFn: () => getJail_Security_Level(token ?? ""),
            },
        ],
    });
    const jailData = results[0].data;
    const securityLevelData = results[1].data;

async function addLevel(level: AddLevelResponse) {
        const payload = {
            jail_id: level.jail,
            bldg_name: level.bldg_name,
            security_level_id: level.security_level,
            bldg_description: level.bldg_description,
            bldg_status: level.bldg_status,
        };

        const res = await fetch(DETENTION_BUILDING.getDETENTION_BUILDING, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let errorMessage = "Error Adding Level";
            try {
                const errorData = await res.json();
                errorMessage = errorData?.message || JSON.stringify(errorData);
            } catch {
                errorMessage = "Unexpected error occurred";
            }
            throw new Error(errorMessage);
        }

        return res.json();
    }

    const levelMutation = useMutation({
        mutationKey: ['level'],
        mutationFn: addLevel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['level'] });
            messageApi.success("Level added successfully");
            onClose();
        },
        onError: (error: any) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });
    const handleLevelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        levelMutation.mutate(formData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const onJailChange = (value: number) => {
        setFormData(prev => ({ ...prev, jail: value }));
    };

    const onSecurityLevelChange = (value: number) => {
        setFormData(prev => ({ ...prev, security_level: value }));
    };

    const onStatusChange = (value: string) => {
        setFormData(prev => ({ ...prev, bldg_status: value }));
    };
    return (
        <div className="space-y-4">
            {contextHolder}
            <form onSubmit={handleLevelSubmit}>
                <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                    <div>
                        <p>Jail Facility:</p>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Select Jail Facility"
                            optionFilterProp="label"
                            onChange={onJailChange}
                            value={formData?.results?.jail ?? undefined}
                            options={jailData?.results?.map((jail: { id: any; jail_name: any; }) => ({
                                value: jail.id,
                                label: jail.jail_name,
                            }))}
                            />
                    </div>
                    <div>
                        <p>Level Name:</p>
                        <input
                        type="text"
                        name="bldg_name"
                        value={formData.bldg_name}
                        onChange={handleInputChange}
                        placeholder="Level Name"
                        className="h-12 border border-gray-300 rounded-lg px-2 w-full"
                        required
                    />
                    </div>
                    <div>
                        <p>Security Level:</p>
                        <Select
                            className="h-[3rem] w-full"
                            placeholder="Security Level"
                            onChange={onSecurityLevelChange}
                            value={formData?.results?.security_level ?? undefined}
                            options={securityLevelData?.results?.map((level: { id: any; category_name: any; }) => ({
                                value: level.id,
                                label: level.category_name,
                            }))}
                        />
                    </div>
                    <div>
                    <p>Level Description:</p>
                        <textarea
                            name="bldg_description"
                            value={formData.bldg_description}
                            onChange={handleInputChange}
                            placeholder="Level Description"
                            className="border border-gray-300 rounded-lg px-2 py-2 w-full"
                            rows={3}
                        />
                    </div>
                    <div>
                    <p>Level Status:</p>
                        <Select
                            showSearch
                            className="h-[3rem] w-full"
                            placeholder="Level Status"
                            onChange={onStatusChange}
                            value={formData?.results?.bldg_status || undefined}
                            options={[
                                { value: "Active", label: "Active" },
                                { value: "Inactive", label: "Inactive" },
                            ]}
                        />
                    </div>
                </div>
                <div className="flex mt-5 justify-end ml-auto">
                    <button
                    type="submit"
                    className="w-full max-w-40 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Submit
                </button>
                </div>
                
            </form>
        </div>
    )
}

export default AddLevel
