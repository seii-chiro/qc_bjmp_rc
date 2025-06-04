import { BASE_URL} from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type AddPDLVisitationStatusProps = {
    name: string;
    description: string;
    onClose: () => void;
    onAdded?: () => void;
}

const AddPDLVisitationStatus: React.FC<AddPDLVisitationStatusProps> = ({ onClose, onAdded }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectPDLStatus, setselectPDLStatus] = useState<AddPDLVisitationStatusProps>({
        name: '',
        description: '',
    });

    async function AddPDLVisitationStatus(pdl_status: AddPDLVisitationStatusProps) {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl-visitation-statuses/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(pdl_status),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding PDL Visitation Status";
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

    const PDLStatusMutation = useMutation({
        mutationKey: ['pdl-status'],
        mutationFn: AddPDLVisitationStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pdl-status'] });
            messageApi.success("Added successfully");
            onClose();
            onAdded?.();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handlePDLStatusSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        PDLStatusMutation.mutate(selectPDLStatus);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setselectPDLStatus(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };

    return (
        <div>
        {contextHolder}
            <form onSubmit={handlePDLStatusSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">PDL Visitation Status:</p>
                        <input type="text" name="name" id="name" onChange={handleInputChange} placeholder="PDL Visitation Status" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
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

export default AddPDLVisitationStatus
