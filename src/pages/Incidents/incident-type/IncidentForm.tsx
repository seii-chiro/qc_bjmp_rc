import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PaginatedResponse } from "@/lib/queries";
import { IncidentCategoryResponse, IncidentTypeResponse } from "@/lib/issues-difinitions";
import { useMutation } from "@tanstack/react-query";
import { useTokenStore } from "@/store/useTokenStore";
import { patchIncidentType, postIncidentType } from "@/lib/query";

export type IncidentFormType = {
    category_id: number | null;
    name: string | null;
    description: string | null;
}

type Props = {
    refetchIncidentTypes: () => void;
    incidentCategory: PaginatedResponse<IncidentCategoryResponse>;
    editRecord?: Partial<IncidentTypeResponse>;
    onClose?: () => void;
};

const IncidentForm = ({ incidentCategory, refetchIncidentTypes, editRecord, onClose }: Props) => {
    const token = useTokenStore()?.token
    const [incidentForm, setIncidentForm] = useState<IncidentFormType>({
        category_id: null,
        description: null,
        name: null
    })

    useEffect(() => {
        if (editRecord) {
            setIncidentForm({
                category_id: incidentCategory?.results?.find(category => (
                    category?.category_name === editRecord.category
                ))?.id ?? null,
                name: editRecord.name ?? null,
                description: editRecord.description ?? null,
            });
        } else {
            setIncidentForm({
                category_id: null,
                description: null,
                name: null
            });
        }
    }, [editRecord, incidentCategory?.results]);

    const [errors, setErrors] = useState<Partial<IncidentFormType>>({})
    const [customSelectOpen, setCustomSelectOpen] = useState(false)

    const addIncidentTypeMutation = useMutation({
        mutationKey: ['add-incident-type'],
        mutationFn: (payload: IncidentFormType) => postIncidentType(token ?? "", payload),
        onSuccess: () => {
            refetchIncidentTypes();
            if (onClose) onClose();
        }
    });

    const updateIncidentTypeMutation = useMutation({
        mutationKey: ['update-incident-type'],
        mutationFn: (payload: IncidentFormType) => {
            if (editRecord?.id === undefined) {
                throw new Error("editRecord.id is undefined");
            }
            const sanitizedPayload = {
                ...payload,
                name: payload.name === null ? undefined : payload.name,
                description: payload.description === null ? undefined : payload.description,
                category_id: payload.category_id === null ? undefined : payload.category_id,
            };
            return patchIncidentType(token ?? "", editRecord.id, sanitizedPayload);
        },
        onSuccess: () => {
            refetchIncidentTypes();
            if (onClose) onClose();
        }
    });

    const handleInputChange = (field: keyof IncidentFormType, value: string | number | null) => {
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
        const newErrors: Partial<IncidentFormType> = {}

        if (!incidentForm.category_id) {
            newErrors.category_id = null
        }

        if (!incidentForm.name || incidentForm.name.trim() === '') {
            newErrors.name = null
        }

        if (!incidentForm.description || incidentForm.description.trim() === '') {
            newErrors.description = null
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            if (editRecord && editRecord.id) {
                updateIncidentTypeMutation.mutate(incidentForm);
            } else {
                addIncidentTypeMutation.mutate(incidentForm);
            }
            setIncidentForm({
                category_id: null,
                description: null,
                name: null
            });
        }
    };

    const selectedCategory = incidentCategory?.results?.find(cat => cat.id === incidentForm.category_id)

    return (
        <motion.div
            className="max-w-2xl mx-auto p-6 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <motion.h1
                className="text-2xl font-semibold mb-6 text-gray-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                Incident Report Form
            </motion.h1>

            <div className="space-y-6">
                {/* Custom Animated Category Selection */}
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <label className="block text-sm font-medium text-gray-700">
                        Incident Category <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                        <motion.div
                            className={`w-full px-3 py-2 border rounded-md shadow-sm cursor-pointer transition-colors ${errors.category_id !== undefined ? 'border-red-500' : 'border-gray-300'
                                } ${customSelectOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
                            onClick={() => setCustomSelectOpen(!customSelectOpen)}
                            whileHover={{
                                scale: 1.01,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="flex justify-between items-center">
                                <span className={selectedCategory ? 'text-gray-900' : 'text-gray-400'}>
                                    {selectedCategory ? selectedCategory.category_name : 'Please select a category'}
                                </span>
                                <motion.svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    animate={{ rotate: customSelectOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {customSelectOpen && (
                                <motion.div
                                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                    {incidentCategory?.results?.map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors"
                                            onClick={() => {
                                                handleInputChange('category_id', category.id)
                                                setCustomSelectOpen(false)
                                            }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            whileHover={{
                                                backgroundColor: "#dbeafe",
                                                x: 4
                                            }}
                                        >
                                            {category.category_name}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {errors.category_id !== undefined && (
                            <motion.p
                                className="text-sm text-red-500"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                Please select an incident category
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Incident Name */}
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <label className="block text-sm font-medium text-gray-700">
                        Incident Type <span className="text-red-500">*</span>
                    </label>
                    <motion.input
                        type="text"
                        value={incidentForm.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Brief title for the incident"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name !== undefined ? 'border-red-500' : 'border-gray-300'
                            }`}
                        whileFocus={{
                            scale: 1.01,
                            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                    <AnimatePresence>
                        {errors.name !== undefined && (
                            <motion.p
                                className="text-sm text-red-500"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                Please enter an incident type
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
                        placeholder="Detailed description of the incident..."
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
                        {editRecord ? "Update" : "Add"} Incident Type
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

export default IncidentForm