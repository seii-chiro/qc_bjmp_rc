import { ISSUE_CATEGORIES } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation } from "@tanstack/react-query";
import { message} from "antd";
import { useState } from "react";

type AddIssueCategory = {
    name: string;
    description: string;
}

const AddIssueCategory = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const [selectIssueCategory, setSelectIssueCategory] = useState<AddIssueCategory>({
        name: '',
        description: '',
    });

    async function AddIssueCategory(issue_category: AddIssueCategory) {
        const res = await fetch(ISSUE_CATEGORIES.getISSUE_CATEGORIES, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(issue_category),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Issue Category";
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

    const issueCategoryMutation = useMutation({
        mutationKey: ['issue-category'],
        mutationFn: AddIssueCategory,
        onSuccess: (data) => {
            console.log(data);
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleIssueCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        issueCategoryMutation.mutate(selectIssueCategory);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setSelectIssueCategory(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };

    return (
        <div>
        {contextHolder}
            <form onSubmit={handleIssueCategorySubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">Issue Category:</p>
                        <input type="text" name="name" id="name" onChange={handleInputChange} placeholder="Issue Category" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
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

export default AddIssueCategory
