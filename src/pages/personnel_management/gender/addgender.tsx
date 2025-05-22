import { useTokenStore } from "@/store/useTokenStore"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from 'antd';
import { GENDER_CODE } from "@/lib/urls";

type GenderForm = {
    gender_option: string;
    description: string;
};

const AddGender = ({ onClose }: { onClose: () => void }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [GenderForm, setGenderForm] = useState<GenderForm>({
        gender_option: '',
        description: '',
    });

    const token = useTokenStore().token;
    const queryClient = useQueryClient();

    async function registerGender(gender: GenderForm) {
        const res = await fetch(GENDER_CODE.postGENDER_CODE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(gender)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
                errorData.gender_option?.[0] ||
                errorData.description?.[0] ||
                'Error registering Gender'
            );
        }

        return res.json();
    }

    const genderMutation = useMutation({
        mutationKey: ['gender'],
        mutationFn: registerGender,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gender'] }); // <-- auto refresh
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Error registering Gender");
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGenderForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleGenderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        genderMutation.mutate(GenderForm);
    };

    return (
        <div>
            {contextHolder}
            <form onSubmit={handleGenderSubmit}>
                <h1 className="text-xl font-semibold">Add Gender</h1>
                <div className="flex gap-5 w-full">
                    <div className="flex flex-col gap-2 flex-1 mt-10">
                        <div>
                            <p>Gender:</p>
                            <input
                                type="text"
                                name="gender_option"
                                id="gender_option"
                                value={GenderForm.gender_option}
                                onChange={handleInputChange}
                                placeholder="Gender Option"
                                className="w-full h-12 border border-gray-300 rounded-lg px-2"
                                required
                            />
                        </div>
                        <div>
                            <p>Description:</p>
                            <input
                                type="text"
                                name="description"
                                id="description"
                                value={GenderForm.description}
                                onChange={handleInputChange}
                                placeholder="Description"
                                className="w-full h-12 border border-gray-300 rounded-lg px-2"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-end mt-10">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white w-36 px-3 py-2 rounded font-semibold text-base"
                        disabled={genderMutation.isLoading}
                    >
                        {genderMutation.isLoading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddGender;