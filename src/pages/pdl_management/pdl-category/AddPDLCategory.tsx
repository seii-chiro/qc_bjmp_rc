import { BASE_URL} from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type AddPDLCategoryProps = {
    name: string;
    description: string;
    onClose: () => void;
    onAdded?: () => void;
}

const AddPDLCategory: React.FC<AddPDLCategoryProps> = ({ onClose, onAdded }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectPDLCategory, setselectPDLCategory] = useState<AddPDLCategoryProps>({
        name: '',
        description: '',
    });

    async function AddPDLCategory(personnel_status: AddPDLCategoryProps) {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl-category/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(personnel_status),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding PDL Category";
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

    const PDLCategoryMutation = useMutation({
        mutationKey: ['pdl-category'],
        mutationFn: AddPDLCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pdl-category'] });
            messageApi.success("Added successfully");
            onClose();
            onAdded?.();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handlePDLCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        PDLCategoryMutation.mutate(selectPDLCategory);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setselectPDLCategory(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };

    return (
        <div>
        {contextHolder}
            <form onSubmit={handlePDLCategorySubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">PDL Category:</p>
                        <input type="text" name="name" id="name" onChange={handleInputChange} placeholder="PDL Category" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
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

export default AddPDLCategory
