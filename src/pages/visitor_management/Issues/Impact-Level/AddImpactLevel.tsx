import { BASE_URL} from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient} from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type AddImpactLevelProps = {
    name: string;
    description: string;
}

const AddImpactLevel = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectImpactLevel, setSelectImpactLevel] = useState<AddImpactLevelProps>({
        name: '',
        description: '',
    });

    async function AddImpactLevel(impact: AddImpactLevelProps) {
        const res = await fetch(`${BASE_URL}/api/issues_v2/impact/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(impact),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Impact";
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

    const ImpactMutation = useMutation({
        mutationKey: ['impact-level'],
        mutationFn: AddImpactLevel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['impact-level'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleImpactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        ImpactMutation.mutate(selectImpactLevel);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setSelectImpactLevel(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };

    return (
        <div>
        {contextHolder}
            <form onSubmit={handleImpactSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">Impact:</p>
                        <input type="text" name="name" id="name" onChange={handleInputChange} placeholder="Impact" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
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

export default AddImpactLevel
