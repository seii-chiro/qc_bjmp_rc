import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type AddGroupAffiliationProps = {
    name: string;
    description: string;
}

const AddGroupAffiliation = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectGroupAffiliation, setSelectGroupAffiliation] = useState<AddGroupAffiliationProps>({
        name: '',
        description: '',
    });

    async function AddGroupAffiliation(group_affiliation: AddGroupAffiliationProps) {
        const res = await fetch(`${BASE_URL}/api/service-providers/service-provider-group-affiliations/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(group_affiliation),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Group Affiliation";
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

    const GroupAffiliationMutation = useMutation({
        mutationKey: ['group-affiliation'],
        mutationFn: AddGroupAffiliation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group-affiliation"] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleGroupAffiliationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        GroupAffiliationMutation.mutate(selectGroupAffiliation);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setSelectGroupAffiliation(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };
    return (
        <div>
        {contextHolder}
            <form onSubmit={handleGroupAffiliationSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">Group Affiliation:</p>
                        <input type="text" name="name" id="name" onChange={handleInputChange} placeholder="Group Affiliation" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Description:</p>
                        <input type="text" name="description" id="description" onChange={handleInputChange} placeholder="Description" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
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

export default AddGroupAffiliation
