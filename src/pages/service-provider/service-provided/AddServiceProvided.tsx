import { BASE_URL} from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type AddServiceProvidedProps = {
    service_provided: string;
    description: string;
    priority_level:  'Low' | 'Medium' | 'High';
    service_frequency: 'Daily' | 'Weekly' | 'Monthly';
    onClose: () => void;
}

const AddServiceProvided: React.FC<AddServiceProvidedProps> = ({ onClose }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectServiceProvided, setSelectServiceProvided] = useState<AddServiceProvidedProps>({
        service_provided: '',
        description: '',
        priority_level: 'Low',
        service_frequency: 'Daily',
    });

    async function AddServiceProvided(pdl_status: AddServiceProvidedProps) {
        const res = await fetch(`${BASE_URL}/api/service-providers/provided-services/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(pdl_status),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Service Provided";
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

    const ServiceProvidedMutation = useMutation({
        mutationKey: ['service-provided'],
        mutationFn: AddServiceProvided,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-provided'] });
            messageApi.success("Added successfully");
            onClose();
            onAdded?.();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleServiceProvidedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        ServiceProvidedMutation.mutate(selectServiceProvided);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setSelectServiceProvided(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };

    return (
        <div>
        {contextHolder}
            <form onSubmit={handleServiceProvidedSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="text-gray-500 font-bold">Service Provided:</p>
                        <input type="text" name="service_provided" id="service_provided" onChange={handleInputChange} placeholder="Service Provided" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Description:</p>
                        <input type="text" name="description" id="description" onChange={handleInputChange} placeholder="Description" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Priority Level:</p>
                        <select className="h-12 border border-gray-300 rounded-lg px-2 w-full" name="priority_level" id="priority_level">
                            <option value=""></option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold">Service Frequency:</p>
                        <select className="h-12 border border-gray-300 rounded-lg px-2 w-full" name="service_frequency" id="service_frequency">
                            <option value=""></option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Annually">Annually</option>
                            <option value="As Needed">As Needed</option>
                        </select>
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

export default AddServiceProvided
