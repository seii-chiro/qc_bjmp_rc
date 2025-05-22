import { VisitortoPDLRelationship } from '@/lib/definitions';
import { Visitor } from '@/lib/pdl-definitions';
import { PDLForm } from '@/lib/visitorFormDefinition';
import { Input, Select, message } from 'antd';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type Props = {
    pdlForm: PDLForm;
    editPdlToVisitIndex: number | null;
    setEditPdlToVisitIndex: Dispatch<SetStateAction<number | null>>;
    setPdlForm: Dispatch<SetStateAction<PDLForm>>;
    visitorToPdlRelationship: VisitortoPDLRelationship[] | null;
    visitorToPdlRelationshipLoading: boolean;
    handlePdlToVisitModalCancel: () => void;
    pdlVisitors: Visitor[];
    pdlVisitorsLoading: boolean;
    visitorSearch: string;
    setVisitorSearch: (val: string) => void;
    visitorPage: number;
    setVisitorPage: (page: number) => void;
    pdlVisitorsCount: number;
};

const PDLVisitorForm = ({
    visitorToPdlRelationshipLoading,
    setEditPdlToVisitIndex,
    pdlForm,
    setPdlForm,
    visitorToPdlRelationship,
    handlePdlToVisitModalCancel,
    editPdlToVisitIndex,
    pdlVisitors,
    pdlVisitorsLoading,
    setVisitorPage,
    setVisitorSearch,
}: Props) => {
    const [pdlToVisitID, setPdlToVisitID] = useState<number | null>(null);
    const [relationshipId, setRelationshipId] = useState<number | null>(null);
    const [selectedPdl, setSelectedPdl] = useState<Visitor | null>(null);

    // Set initial values when editing
    useEffect(() => {
        if (editPdlToVisitIndex !== null && pdlForm?.visitor?.[editPdlToVisitIndex]) {
            const visitorEntry = pdlForm.visitor[editPdlToVisitIndex];
            setPdlToVisitID(visitorEntry.visitor);
            setRelationshipId(visitorEntry.relationship_to_visitor);
        } else {
            // Reset for new entries
            setPdlToVisitID(null);
            setRelationshipId(null);
            setSelectedPdl(null);
        }
    }, [editPdlToVisitIndex, pdlForm]);

    // Update selected PDL when pdlToVisitID changes
    useEffect(() => {
        if (pdlToVisitID !== null) {
            const pdl = pdlVisitors?.find(pdl => pdl?.id === pdlToVisitID) ?? null;
            setSelectedPdl(pdl);
        } else {
            setSelectedPdl(null);
        }
    }, [pdlToVisitID, pdlVisitors]);

    const handleAddPdlToVisit = () => {
        if (selectedPdl === null) {
            message.error("Please select a visitor");
            return;
        }

        if (!relationshipId) {
            message.error("Please select a relationship");
            return;
        }

        const newPdlId = pdlToVisitID as number;
        const isEdit = editPdlToVisitIndex !== null;

        const newEntry = {
            visitor: newPdlId,
            relationship_to_visitor: relationshipId,
        };

        // Prevent duplicates (skip checking the current entry when editing)
        const isAlreadyInVisitorForm = pdlForm?.visitor?.some((item, idx) => {
            if (isEdit && idx === editPdlToVisitIndex) return false;
            return item.visitor === newPdlId;
        });

        if (isAlreadyInVisitorForm) {
            message.warning("This visitor has already been added.");
            return;
        }

        // Update the pdlForm state
        setPdlForm(prev => {
            const updated = [...(prev.visitor || [])];

            if (isEdit) {
                updated[editPdlToVisitIndex!] = newEntry;
            } else {
                updated.push(newEntry);
            }

            return {
                ...prev,
                visitor: updated,
                visitor_ids: updated.map(item => item.visitor),
            };
        });

        message.success(isEdit ? "Visitor updated successfully!" : "Visitor added successfully!");

        resetForm();
    };

    const resetForm = () => {
        setPdlToVisitID(null);
        setRelationshipId(null);
        setSelectedPdl(null);
        setEditPdlToVisitIndex(null);
        handlePdlToVisitModalCancel();
    };

    return (
        <div className='w-full'>
            <form className='w-full flex flex-col gap-4 p-4'>
                <div className='flex gap-8'>
                    <div className='flex-1'>
                        <div className='flex w-full justify-between gap-4'>
                            <label htmlFor="last-name" className='flex-1 flex flex-col gap-1'>
                                <span className='font-semibold'>Last Name <span className='text-red-500'>*</span></span>
                                <Select
                                    loading={pdlVisitorsLoading}
                                    showSearch
                                    value={pdlToVisitID}
                                    optionFilterProp="label"
                                    className="h-12 rounded-md outline-gray-300 !bg-gray-100"
                                    options={
                                        pdlVisitorsLoading
                                            ? []
                                            : pdlVisitors?.length
                                                ? pdlVisitors
                                                    .filter(pdl => typeof pdl?.id === 'number' && typeof pdl?.person?.last_name === 'string')
                                                    .map(pdl => ({
                                                        value: pdl.id as number,
                                                        label: pdl.person!.last_name as string
                                                    }))
                                                : []
                                    }
                                    notFoundContent={pdlVisitorsLoading ? "Loading..." : "No data found"}
                                    onSearch={value => {
                                        setVisitorSearch(value);
                                        setVisitorPage(1);
                                    }}
                                    onChange={value => setPdlToVisitID(value)}
                                />
                            </label>
                            <label htmlFor="first-name" className='flex-1 flex flex-col gap-1'>
                                <span className='font-semibold'>First Name <span className='text-red-500'>*</span></span>
                                <Select
                                    loading={pdlVisitorsLoading}
                                    showSearch
                                    value={pdlToVisitID}
                                    optionFilterProp="label"
                                    className="h-12 rounded-md outline-gray-300 !bg-gray-100"
                                    options={
                                        pdlVisitorsLoading
                                            ? []
                                            : pdlVisitors?.length
                                                ? pdlVisitors
                                                    .filter(pdl => typeof pdl?.id === 'number' && typeof pdl?.person?.first_name === 'string')
                                                    .map(pdl => ({
                                                        value: pdl.id as number,
                                                        label: pdl.person!.first_name as string
                                                    }))
                                                : []
                                    }
                                    notFoundContent={pdlVisitorsLoading ? "Loading..." : "No data found"}
                                    onSearch={value => {
                                        setVisitorSearch(value);
                                        setVisitorPage(1);
                                    }}
                                    onChange={value => setPdlToVisitID(value)}
                                />
                            </label>
                        </div>
                        <div className='flex w-full justify-between gap-4'>
                            <label htmlFor="middle-name" className='flex-1 flex flex-col gap-1'>
                                <span className='font-semibold'>Middle Name </span>
                                <Select
                                    loading={pdlVisitorsLoading}
                                    showSearch
                                    value={pdlToVisitID}
                                    optionFilterProp="label"
                                    className="h-12 rounded-md outline-gray-300 !bg-gray-100"
                                    options={pdlVisitors?.map(pdl => ({
                                        value: pdl?.id,
                                        label: pdl?.person?.middle_name
                                    }))}
                                    onChange={(value) => setPdlToVisitID(value)}
                                />
                            </label>
                            <label htmlFor="mbc" className='flex-1 flex flex-col gap-1'>
                                <span className='font-semibold'>Multiple Birth Classification </span>
                                <Input
                                    value={selectedPdl?.person?.multiple_birth_siblings?.[0]?.multiple_birth_class ?? ""}
                                    className='h-12 rounded-md outline-gray-300'
                                    readOnly
                                />
                            </label>
                        </div>
                        <div className='flex w-full justify-between gap-4'>
                            <label htmlFor="relationship" className='flex-1 flex flex-col gap-1'>
                                <span className='font-semibold'>Relationship <span className='text-red-500'>*</span></span>
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    value={relationshipId}
                                    loading={visitorToPdlRelationshipLoading}
                                    className='h-12 rounded-md outline-gray-300 !bg-gray-100'
                                    options={visitorToPdlRelationship?.map(relationship => ({
                                        value: relationship?.id,
                                        label: relationship?.relationship_name
                                    }))}
                                    onChange={value => setRelationshipId(value)}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className='w-[30%] flex gap-4 ml-[70%] '>
                    <button
                        type="button"
                        className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1"
                        onClick={resetForm}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1"
                        onClick={handleAddPdlToVisit}
                    >
                        {editPdlToVisitIndex !== null ? 'Update' : 'Add'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PDLVisitorForm;