/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAccounts } from "@/lib/definitions";
import { RemarksForm as RemarksFormType } from "@/lib/visitorFormDefinition";
import { Input } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

function getCurrentTimestamp(): string {
    return new Date().toISOString();
}

type Props = {
    setRemarksTableInfo: Dispatch<SetStateAction<RemarksFormType[]>>;
    handleModalCancel: () => void;
    setVisitorForm: Dispatch<SetStateAction<any>>;
    currentUser: UserAccounts;
    editingRemark: { index: number, data: RemarksFormType } | null;
    setEditingRemark: Dispatch<SetStateAction<{ index: number, data: RemarksFormType } | null>>;
}

const RemarksForm = ({
    currentUser,
    setVisitorForm,
    setRemarksTableInfo,
    handleModalCancel,
    editingRemark,
    setEditingRemark
}: Props) => {
    const [remarksForm, setRemarksForm] = useState<RemarksFormType>({
        timestamp: "",
        created_by: "",
        remarks: ""
    });

    // Initialize form with editing data if available
    useEffect(() => {
        if (editingRemark) {
            setRemarksForm(editingRemark?.data);
        } else {
            setRemarksForm({
                timestamp: getCurrentTimestamp(),
                created_by: currentUser ? `${currentUser?.first_name} ${currentUser?.last_name}` : "",
                remarks: ""
            });
        }
    }, [currentUser, editingRemark]);

    const handleSubmit = () => {
        if (remarksForm?.remarks) {
            const currentTimestamp = getCurrentTimestamp();
            
            if (editingRemark !== null) {
                // Handle edit mode
                const updatedRemark: RemarksFormType = {
                    remarks: remarksForm.remarks,
                    timestamp: currentTimestamp, 
                    created_by: remarksForm.created_by
                };

                // Update the remarks table info with full object
                setRemarksTableInfo(prev => {
                    const updated = [...prev];
                    updated[editingRemark.index] = updatedRemark;
                    return updated;
                });

                // Update the visitorForm remarks_data with just remarks field
                setVisitorForm((prev: any) => {
                    const updatedRemarks = [...(prev.remarks_data || [])];
                    updatedRemarks[editingRemark.index] = { remarks: remarksForm.remarks };
                    return {
                        ...prev,
                        remarks_data: updatedRemarks
                    };
                });
            } else {
                // Handle create mode
                const newRemark: RemarksFormType = {
                    remarks: remarksForm.remarks,
                    timestamp: currentTimestamp,
                    created_by: `${currentUser.first_name} ${currentUser.last_name}`
                };

                // Update remarksTableInfo with full object
                setRemarksTableInfo(prev => ([...prev, newRemark]));

                // Update visitorForm.remarks_data with just remarks field
                setVisitorForm((prev: any) => ({
                    ...prev,
                    remarks_data: [
                        ...(prev.remarks_data || []),
                        { remarks: remarksForm.remarks }
                    ]
                }));
            }

            // Reset form and editing state
            setRemarksForm({
                timestamp: "",
                created_by: "",
                remarks: ""
            });
            setEditingRemark(null);
            handleModalCancel();
        }
    }

    const handleCancel = () => {
        setRemarksForm({
            timestamp: "",
            created_by: "",
            remarks: ""
        });
        setEditingRemark(null);
        handleModalCancel();
    }

    return (
        <div className="w-full p-5">
            <form className="w-full">
                <div className="w-full flex flex-col gap-4">
                    <div>
                        <label htmlFor="visitor-remarks" className="flex flex-col gap-2">
                            <span className="font-semibold">Remarks</span>
                            <Input.TextArea
                                value={remarksForm?.remarks}
                                id="visitor-remarks"
                                className="!h-72"
                                onChange={e => setRemarksForm(prev => ({ ...prev, remarks: e.target.value }))}
                            />
                        </label>
                    </div>
                    <div className="w-full flex justify-end">
                        <div className="flex gap-4 w-[30%] h-full items-end">
                            <button
                                onClick={handleCancel}
                                type="button"
                                className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1"
                                onClick={handleSubmit}
                            >
                                {editingRemark ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default RemarksForm;