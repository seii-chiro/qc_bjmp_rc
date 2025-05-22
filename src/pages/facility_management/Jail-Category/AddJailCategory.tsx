import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";
import { JAIL_CATEGORY } from "@/lib/urls";

type AddJailCategory = {
    description: string;
    category_name: string;
};

const AddJailCategory = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [jailCategoryForm, setJailCategoryForm] = useState<AddJailCategory>({
        description: '',
        category_name: '',
    });

    async function registerjailCategory(jail_category: AddJailCategory) {
        const res = await fetch(JAIL_CATEGORY.getJAIL_CATEGORY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(jail_category),
        });
    
        if (!res.ok) {
            let errorMessage = "Error registering Jail Category";
    
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

    const jailTypeMutation = useMutation({
        mutationKey: ['jail-category'],
        mutationFn: registerjailCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jail-category'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handlejailTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        jailTypeMutation.mutate(jailCategoryForm);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setJailCategoryForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    return (
        <div>
            {contextHolder}
            <form onSubmit={handlejailTypeSubmit}>
                <h1 className="text-xl font-semibold">Jail Category</h1>
                <div className="flex mt-3 gap-5 w-full">
                    <div className="flex flex-col gap-2 flex-1">
                        <div>
                            <p>Category:</p>
                            <input type="text" name="category_name" id="category_name" onChange={handleInputChange} placeholder="Jail Category" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
                        </div>
                        <div>
                            <p>Description:</p>
                            <input type="text" name="description" id="description" onChange={handleInputChange} placeholder="Description" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-end ml-auto mt-10">
                    <button type="submit" className="bg-blue-500 text-white w-36 px-3 py-2 rounded font-semibold text-base">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddJailCategory;