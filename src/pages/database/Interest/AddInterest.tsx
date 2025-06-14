import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";
import { INTEREST } from "@/lib/urls";

type AddInterestProps = {
    name: string;
    description: string;
};

const AddInterest = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [interestForm, setInterestForm] = useState<AddInterestProps>({
        name: '',
        description: '',
    });

    async function addInterest(interest: AddInterestProps) {
        const res = await fetch(INTEREST.postINTEREST, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(interest),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Interest";
            try {
                const errorData = await res.json();
                errorMessage = errorData?.message || errorData?.error || JSON.stringify(errorData);
            } catch {
                errorMessage = "Unexpected error occurred";
            }
            throw new Error(errorMessage);
        }
        return res.json();
    }

    const interestMutation = useMutation({
        mutationKey: ['interest'],
        mutationFn: addInterest,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["interest"] });
            messageApi.success("Added successfully");
            onClose(); 
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleInterestSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!interestForm.name || !interestForm.description) {
            messageApi.error("Please fill out all fields.");
            return;
        }
        interestMutation.mutate(interestForm);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInterestForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    return (
        <div>
            {contextHolder}
            <form onSubmit={handleInterestSubmit}>
                <div className="space-y-2 flex flex-col">
                    <div>
                        <p>Interest:</p>
                        <input
                        type="text"
                        name="name"
                        id="name"
                        onChange={handleInputChange}
                        placeholder="Interest"
                        className="w-full h-12 border border-gray-300 rounded-lg px-2"
                    />
                    </div>
                    <div>
                        <p>Description:</p>
                        <input
                        type="text"
                        name="description"
                        id="description"
                        onChange={handleInputChange}
                        placeholder="Description"
                        className="w-full h-12 border border-gray-300 rounded-lg px-2"
                    />
                    </div>
                </div>
                <div className="w-full flex justify-end mt-10">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white w-36 px-3 py-2 rounded font-semibold text-base"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddInterest
