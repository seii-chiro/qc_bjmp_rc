
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";
import { BASE_URL } from "@/lib/urls";

type PrefixProps = {
    prefix: string,
    full_title: string,
    description: string
}

const AddPrefixes = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [prefixForm, setPrefixForm] = useState<PrefixProps>({
        prefix: "",
        description: "",
        full_title: "",
    });

    async function addPrefix(prefix: PrefixProps) {
        const res = await fetch(`${BASE_URL}/api/standards/prefix/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(prefix),
        });
    
        if (!res.ok) {
            let errorMessage = "Error Adding Prefix";
    
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

    const prefixMutation = useMutation({
        mutationKey: ['prefix'],
        mutationFn: addPrefix,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["prefixes"] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handlePrefixSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        prefixMutation.mutate(prefixForm);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPrefixForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    return (
        <div>
            {contextHolder}
            <form onSubmit={handlePrefixSubmit}>
                <div className="flex flex-col gap-5">
                    <div>
                        <p className="font-medium">Prefix:</p>
                        <input type="text" name="prefix" id="prefix" onChange={handleInputChange} placeholder="Prefix" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
                    </div>
                    <div>
                        <p className="font-medium">Full Title:</p>
                        <input type="text" name="full_title" id="full_title" onChange={handleInputChange} placeholder="Full Title" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
                    </div>
                    <div>
                        <p className="font-medium">Description:</p>
                        <input type="text" name="description" id="description" onChange={handleInputChange} placeholder="Description" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
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

export default AddPrefixes
