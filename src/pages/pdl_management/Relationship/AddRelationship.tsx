import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message} from "antd";
import { useState } from "react";

type AddRelationship = {
    relationship_name: string;
    description: string;
}

const AddRelationship = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectRelationship, setSelectRelationship] = useState<AddRelationship>({
        relationship_name: '',
        description: '',
    });

    async function AddRelationship(relationship: AddRelationship) {
        const res = await fetch(`${BASE_URL}/api/pdls/relationship/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(relationship),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Relationship";
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

    const relationshipMutation = useMutation({
        mutationKey: ['relationship'],
        mutationFn: AddRelationship,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['relationship'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleRelationshipSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        relationshipMutation.mutate(selectRelationship);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setSelectRelationship(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };

    return (
        <div>
        {contextHolder}
            <form onSubmit={handleRelationshipSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">Relationship:</p>
                        <input type="text" name="relationship_name" id="relationship_name" onChange={handleInputChange} placeholder="Relationship" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
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

export default AddRelationship

