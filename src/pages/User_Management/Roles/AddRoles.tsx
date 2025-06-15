import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message, Select } from "antd";
import { BASE_URL, GROUP_ROLE } from "@/lib/urls";
import { getPermission } from "@/lib/query";

type AddRoles = {
    name: string;
    permissions: number[]; 
};

const AddRoles = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [roles, setRoles] = useState<AddRoles>({
        name: '',
        permissions: [],
    });

    async function AddRoles(platform: AddRoles) {
        const res = await fetch(`${BASE_URL}/api/standards/groups/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(platform),
        });
    
        if (!res.ok) {
            let errorMessage = "Error Adding Group Roles";
    
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

    const platformMutation = useMutation({
        mutationKey: ['roles'],
        mutationFn: AddRoles,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleplatformSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        platformMutation.mutate(roles);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRoles(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const results = useQueries({
        queries: [
            {
                queryKey: ["permissions"],
                queryFn: () => getPermission(token ?? ""),
            },
        ],
    });

    const PermissionData = results[0].data;

    const onPermissionChange = (value: number) => {
        console.log(value)
        setRoles(prevForm => ({
            ...prevForm,
            permissions: value,
        }));
    }; 

    return (
        <div>
            {contextHolder}
            <form onSubmit={handleplatformSubmit}>
                <div className="flex gap-5 w-full">
                    <div className="flex flex-col gap-2 flex-1">
                        <p className="py-1 text-base font-semibold text-gray-500">Group Role:</p>
                        <input type="text" name="name" id="name" onChange={handleInputChange} placeholder="Role Name" className="h-12 border border-gray-300 rounded-lg px-2" />
                    </div>
                </div>
                <div>
                    <p className="py-1 text-base font-semibold text-gray-500">Permissions:</p>
                    <Select
                    className="py-4 w-full"
                    showSearch
                    mode="multiple"
                    placeholder="Permissions"
                    optionFilterProp="label"
                    onChange={onPermissionChange}
                    options={PermissionData?.results?.map(permission => ({
                        value: permission.id, 
                        label: permission.name
                    }))} />
                </div>
                <div className="w-full flex justify-end mt-10">
                    <button type="submit" className="bg-blue-500 text-white w-36 px-3 py-2 rounded font-semibold text-base">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddRoles;