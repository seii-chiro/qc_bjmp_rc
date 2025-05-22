import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";
import { JAIL_TYPE } from "@/lib/urls";

type AddJailType = {
    type_name: string;
    description: string;
};

const AddJailType = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [jailTypeForm, setJailTypeForm] = useState<AddJailType>({
        type_name: '',
        description: '',
    });

    async function registerjailType(jailType: AddJailType) {
        const res = await fetch(JAIL_TYPE.getJAIL_TYPE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(jailType),
        });
    
        if (!res.ok) {
            let errorMessage = "Error registering Jail Type";
    
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
        mutationKey: ['jail-type'],
        mutationFn: registerjailType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jail-type'] });
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
        jailTypeMutation.mutate(jailTypeForm);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setJailTypeForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    return (
        <div>
            {contextHolder}
            <form onSubmit={handlejailTypeSubmit}>
                <h1 className="text-xl font-semibold">Jail Type</h1>
                <div className="flex gap-5 mt-3 w-full">
                    <div className="flex flex-col gap-2 flex-1">
                        <div>
                            <p>Type Name:</p>
                            <input type="text" name="type_name" id="type_name" onChange={handleInputChange} placeholder="Jail Type Name" className="w-full h-12 border border-gray-300 rounded-lg px-2" />
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

export default AddJailType;