import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IncidentCategoryResponse } from "@/lib/issues-difinitions";
import { useMutation } from "@tanstack/react-query";
import { useTokenStore } from "@/store/useTokenStore";
import { patchIncidentCategory, postIncidentCategory } from "@/lib/query";

export type IncidentFormCategory = {
    category_name: string | null;
    description: string | null;
}

type Props = {
    refetchIncidentCategories: () => void;
    editRecord?: Partial<IncidentCategoryResponse>;
    onClose?: () => void;
}

const AddIncidentCategory = ({ refetchIncidentCategories, editRecord, onClose }: Props) => {
    const token = useTokenStore()?.token
    const [incidentForm, setIncidentForm] = useState<IncidentFormCategory>({
        description: null,
        category_name: null
    })

    useEffect(() => {
        if (editRecord) {
            setIncidentForm({
                category_name: editRecord.category_name ?? null,
                description: editRecord.description ?? null,
            });
        } else {
            setIncidentForm({
                description: null,
                category_name: null
            });
        }
    }, [editRecord]);

    const [errors, setErrors] = useState<Partial<IncidentFormCategory>>({})
    const [customSelectOpen, setCustomSelectOpen] = useState(false)

    const addIncidentCategoryMutation = useMutation({
        mutationKey: ['add-incident-type'],
        mutationFn: (payload: IncidentFormCategory) => postIncidentCategory(token ?? "", payload),
        onSuccess: () => {
            refetchIncidentCategories();
            if (onClose) onClose();
        }
    });

    const updateIncidentCategoryMutation = useMutation({
        mutationKey: ['update-incident-type'],
        mutationFn: (payload: IncidentFormCategory) => {
            if (editRecord?.id === undefined) {
                throw new Error("editRecord.id is undefined");
            }
            const sanitizedPayload = {
                ...payload,
                category_name: payload.category_name === null ? undefined : payload.category_name,
                description: payload.description === null ? undefined : payload.description,
            };
            return patchIncidentCategory(token ?? "", editRecord.id, sanitizedPayload);
        },
        onSuccess: () => {
            refetchIncidentCategories();
            if (onClose) onClose();
        }
    });

    const handleInputChange = (field: keyof IncidentFormCategory, value: string | number | null) => {
        setIncidentForm(prev => ({
            ...prev,
            [field]: value
        }))

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<IncidentFormCategory> = {}

        if (!incidentForm.category_name || incidentForm.category_name.trim() === '') {
            newErrors.category_name = null
        }

        if (!incidentForm.description || incidentForm.description.trim() === '') {
            newErrors.description = null
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            if (editRecord?.id != null) {
                updateIncidentCategoryMutation.mutate(incidentForm);
            } else {
                addIncidentCategoryMutation.mutate(incidentForm);
            }
            setIncidentForm({
                description: null,
                category_name: null
            });
        }
    };

    return (
        <motion.div
            className="max-w-2xl mx-auto p-6 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="space-y-6">
                {/* Incident Category */}
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <label className="block text-sm font-medium text-gray-700">
                        Incident Category <span className="text-red-500">*</span>
                    </label>
                    <motion.input
                        type="text"
                        value={incidentForm.category_name || ''}
                        onChange={(e) => handleInputChange('category_name', e.target.value)}
                        placeholder="Brief title for the incident category"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.category_name !== undefined ? 'border-red-500' : 'border-gray-300'
                            }`}
                        whileFocus={{
                            scale: 1.01,
                            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                    <AnimatePresence>
                        {errors.category_name !== undefined && (
                            <motion.p
                                className="text-sm text-red-500"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                Please enter an incident category
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Description */}
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <label className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <motion.textarea
                        value={incidentForm.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Detailed description of the incident category..."
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors ${errors.description !== undefined ? 'border-red-500' : 'border-gray-300'
                            }`}
                        whileFocus={{
                            scale: 1.01,
                            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                    <AnimatePresence>
                        {errors.description !== undefined && (
                            <motion.p
                                className="text-sm text-red-500"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                Please enter a description
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Form Actions */}
                <motion.div
                    className="flex w-full justify-end pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <motion.button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        {editRecord ? "Update" : "Add"} Incident Category
                    </motion.button>
                </motion.div>
            </div>

            {/* Click outside to close dropdown */}
            {customSelectOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setCustomSelectOpen(false)}
                />
            )}
        </motion.div>
    )
}

export default AddIncidentCategory