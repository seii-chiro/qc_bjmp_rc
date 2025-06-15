import { BASE_URL} from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type AddNonPDLVisitorTypePayload = {
    non_pdl_visitor_type: string,
    description: string
}

const AddNPVisitorType: React.FC<AddNonPDLVisitorTypePayload> = ({ onClose }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectNPVisitorType, setSelectNPVisitorType] = useState<AddNonPDLVisitorTypePayload>({
        non_pdl_visitor_type: '',
        description: ''
    });

    async function AddNonPDLVisitorType(pdl_status: AddNonPDLVisitorTypePayload) {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/non-pdl-visitor-types/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(pdl_status),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Non PDL Visitor Type";
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

    const NPVisitorTypeMutation = useMutation({
        mutationKey: ['visitor-type'],
        mutationFn: AddNonPDLVisitorType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitor-type'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleNPVisitorTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        NPVisitorTypeMutation.mutate(selectNPVisitorType);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
        const { name, value } = e.target;
        setSelectNPVisitorType(prevForm => ({
        ...prevForm,
        [name]: value,
        }));
    };

    return (
        <div>
            {contextHolder}
            <form onSubmit={handleNPVisitorTypeSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">Non-PDL Visitor Type:</p>
                        <input type="text" name="non_pdl_visitor_type" id="non_pdl_visitor_type" onChange={handleInputChange} placeholder="Non-PDL Visitor Type" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
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

export default AddNPVisitorType
