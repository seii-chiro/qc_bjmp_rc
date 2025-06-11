import { VisitorRelPersonnelRecord } from "@/lib/issues-difinitions"
import { getImpactLevels, getRiskLevel } from "@/lib/queries";
import { getThreatLevel } from "@/lib/query";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useState } from "react";

type AddVisitorRelPersonnelPayload = VisitorRelPersonnelRecord

const AddVisitorRelPersonnel: React.FC<AddVisitorRelPersonnelPayload> = ({ onClose }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectedRelationship, setselectedRelationship] = useState<AddVisitorRelPersonnelPayload>({
        relationship_personnel: '',
        description: '',
        risks: '',
        impacts: '',
        threats: '',
        mitigation: '',
    });

    async function AddVisitorRelPersonnel(pdl_status: AddVisitorRelPersonnelPayload) {
        const res = await fetch(`${BASE_URL}/api/non-pdl-visitor/visitor-rel-personnel/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(pdl_status),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding Visitor Relationship Personnel";
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

    const VisitorRelPersonnelMutation = useMutation({
        mutationKey: ['visitor-per-personnel'],
        mutationFn: AddVisitorRelPersonnel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visitor-per-personnel'] });
            messageApi.success("Added successfully");
            onClose();
        },
        onError: (error) => {
            console.error(error);
            messageApi.error(error.message);
        },
    });

    const handleVisitorRelPersonnelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        VisitorRelPersonnelMutation.mutate(selectedRelationship);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setselectedRelationship(prevForm => ({
            ...prevForm,
            [name]: value,
            }));
        };
    const results = useQueries({
        queries: [
            {
                queryKey: ["impact-level"],
                queryFn: () => getImpactLevels(token ?? ""),
            },
            {
                queryKey: ["risk-level"],
                queryFn: () => getRiskLevel(token ?? ""),
            },
            {
                queryKey: ["threat-level"],
                queryFn: () => getThreatLevel(token ?? ""),
            },
        ],
    });

    const impactLevelData = results[0]?.data;
    const riskLevelData = results[1]?.data;
    const threatLevelData = results[2]?.data;

    const onImpactLevelChange = (value: number) => {
        setselectedRelationship(prevForm => ({
            ...prevForm,
            impact_level_id: value,
        }));
    };

    const onriskLevelChange = (value: number) => {
        setselectedRelationship(prevForm => ({
            ...prevForm,
            risk_level_id: value,
        }));
    };

    const onthreatLevelChange = (value: number) => {
        setselectedRelationship(prevForm => ({
            ...prevForm,
            threat_level_id: value,
        }));
    };
    return (
        <div>
            {contextHolder}
            <form onSubmit={handleVisitorRelPersonnelSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="space-y-3">
                        <div>
                            <p className="text-gray-500 font-bold">Relationship:</p>
                            <input type="text" name="relationship_personnel" id="relationship_personnel" onChange={handleInputChange} placeholder="Relationship" className="h-12 border w-full border-gray-300 rounded-lg px-2" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold">Risks:</p>
                            <input type="text" name="risks" id="risks" onChange={handleInputChange} placeholder="Risks" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold">Impacts:</p>
                            <input type="text" name="impacts" id="impacts" onChange={handleInputChange} placeholder="Impacts" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold">Threats:</p>
                            <input type="text" name="threats" id="threats" onChange={handleInputChange} placeholder="Threats" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold">Mitigation:</p>
                            <input type="text" name="mitigation" id="mitigation" onChange={handleInputChange} placeholder="Mitigation" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold">Description:</p>
                            <input type="text" name="description" id="description" onChange={handleInputChange} placeholder="Description" className="h-12 border border-gray-300 rounded-lg px-2 w-full" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="form-group">
                            <label className="text-gray-500 font-bold" htmlFor="impact_level_id">Impact Level:</label>
                            <select
                                id="impact_level_id"
                                name="impact_level_id"
                                className="h-12 border border-gray-300 rounded-lg px-2 w-full"
                                onChange={onImpactLevelChange}
                                required
                            >
                                <option value="" disabled>Select Impact Level</option>
                                {impactLevelData?.results?.map(impact => (
                                    <option key={impact.id} value={impact.id}>
                                        {impact.impact_level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="text-gray-500 font-bold" htmlFor="risk_level_id">Risk Level:</label>
                            <select
                                id="risk_level_id"
                                name="risk_level_id"
                                className="h-12 border border-gray-300 rounded-lg px-2 w-full"
                                onChange={onriskLevelChange}
                                required
                            >
                                <option value="" disabled>Select Risk Level</option>
                                {riskLevelData?.results?.map(risk => (
                                    <option key={risk.id} value={risk.id}>
                                        {risk.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="text-gray-500 font-bold" htmlFor="threat_level_id">Threat Level:</label>
                            <select
                                id="threat_level_id"
                                name="threat_level_id"
                                className="h-12 border border-gray-300 rounded-lg px-2 w-full"
                                onChange={onthreatLevelChange}
                                required
                            >
                                <option value="" disabled>Select Threat Level</option>
                                {threatLevelData?.results?.map(threat => (
                                    <option key={threat.id} value={threat.id}>
                                        {threat.threat_level}
                                    </option>
                                ))}
                            </select>
                        </div>
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

export default AddVisitorRelPersonnel
