import { getIssueCategories, getRisks } from "@/lib/queries";
import { ISSUE_TYPE } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { message, Select } from "antd";
import { useState } from "react";

type AddIssueType = {
    name: string;
    description: string;
    risk_id: number | null;
    issue_category_id: number | null;
}

const AddIssueType = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectIssueType, setSelectIssueType] = useState<AddIssueType>({
        name: '',
        description: '',
        issue_category_id: null,
        risk_id: null,
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ["issue-category"],
                queryFn: () => getIssueCategories(token ?? ""),
            },
            {
                queryKey: ["risk"],
                queryFn: () => getRisks(token ?? ""),
            },
            ],
        });
        
    const IssueCategoryData = results[0].data;
    const RiskData = results[1].data;

        const onIssueCategory = (value: number) => {
        setSelectIssueType(prevForm => ({
            ...prevForm,
            issue_category_id: value,
        }));
    }; 

    const onRiskLevelChange = (value: number) => {
        setSelectIssueType(prevForm => ({
            ...prevForm,
            risk_id: value,
        }));
    }; 

    async function AddIssueType(issue_type: AddIssueType) {
        const res = await fetch(ISSUE_TYPE.getISSUE_TYPE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(issue_type),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Issue Type";
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

    const issueTypekMutation = useMutation({
        mutationKey: ['issue-type'],
        mutationFn: AddIssueType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issue-type'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleIssueTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        issueTypekMutation.mutate(selectIssueType);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setSelectIssueType(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };

    return (
        <div>
        {contextHolder}
            <form onSubmit={handleIssueTypeSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">Issue Type:</p>
                        <input type="text" name="name" id="name" onChange={handleInputChange} placeholder="Issue Type" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Description:</p>
                        <input type="text" name="description" id="description" onChange={handleInputChange} placeholder="Description" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Categorization Rule:</p>
                        <input type="text" name="categorization_rule" id="categorization_rule" onChange={handleInputChange} placeholder="Categorization Rule" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Issue Category:</p>
                        <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Issue Category"
                        optionFilterProp="label"
                        onChange={onIssueCategory}
                        options={IssueCategoryData?.results?.map(issue_category => (
                            {
                                value: issue_category.id,
                                label: issue_category?.name
                            }
                        ))}
                    />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Risk:</p>
                        <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Risk"
                        optionFilterProp="label"
                        onChange={onRiskLevelChange}
                        options={RiskData?.results?.map(risk => (
                            {
                                value: risk.id,
                                label: risk?.name
                            }
                        ))}
                    />
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

export default AddIssueType
