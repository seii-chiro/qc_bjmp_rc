import { MultipleBirthClassType, Prefix, Suffix } from "@/lib/definitions"
import { Gender, Person } from "@/lib/pdl-definitions"
import { MultiBirthSiblingForm as MultiBirthSiblingFormType, PersonForm } from "@/lib/visitorFormDefinition"
import { Input, Select } from "antd"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

type Props = {
    persons: Person[]
    genders: Gender[]
    setPersonForm: Dispatch<SetStateAction<PersonForm>>;
    birthClassTypes: MultipleBirthClassType[];
    birthClassTypesLoading: boolean;
    handleIdsModalCancel: () => void;
    prefixes: Prefix[];
    suffixes: Suffix[];
    personLoading: boolean
    personForm: PersonForm
    isEditing: boolean;
    editIndex: number | null;
    handleEditMultipleBirthSibling: (index: number, updatedData: MultiBirthSiblingFormType) => void
    currentPersonId: number | null;
    setPersonSearch?: (value: string) => void;
    setPersonPage?: (page: number) => void;
    personPage?: number;
    personsCount?: number;
}

const UpdateMultiBirthSiblingForm = ({
    birthClassTypes,
    persons,
    setPersonForm,
    handleIdsModalCancel,
    prefixes,
    personLoading,
    suffixes,
    personForm,
    isEditing = false,
    editIndex = null,
    currentPersonId,
    handleEditMultipleBirthSibling,
    setPersonPage,
    setPersonSearch
}: Props) => {
    const [chosenSibling, setChosenSibling] = useState<Person | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [multiBirthSiblingForm, setMultiBirthSiblingForm] = useState<MultiBirthSiblingFormType>({
        is_identical: true,
        is_verified: false,
        multiple_birth_class_id: null,
        remarks: "",
        person_id_display: null,
        sibling_person_id: null,
    })

    // Load data when editing
    useEffect(() => {
        if (isEditing && editIndex !== null && personForm?.multiple_birth_sibling_data) {
            const siblingToEdit = personForm.multiple_birth_sibling_data[editIndex];
            if (siblingToEdit) {
                setMultiBirthSiblingForm(siblingToEdit);

                // Find the chosen sibling, using person_id_display if available, otherwise use person_id
                const sibling = persons?.find(person => person?.id === (siblingToEdit.sibling_person_id_display || siblingToEdit.sibling_person_id));
                if (sibling) {
                    setChosenSibling(sibling);
                }
            }
        }
    }, [isEditing, editIndex, personForm?.multiple_birth_sibling_data, persons]);

    const checkForDuplicate = (personId: number | null) => {
        if (!personId) return false;

        // Skip the current entry when editing
        const existingSiblings = personForm?.multiple_birth_sibling_data || [];
        return existingSiblings.some((sibling, index) => {
            // When editing, don't count the current entry as a duplicate
            if (isEditing && index === editIndex) {
                return false;
            }
            return sibling.sibling_person_id === personId;
        });
    };

    const handleSubmit = () => {
        // Validation to check if person_id exists
        if (!multiBirthSiblingForm.sibling_person_id) {
            setError("Please select a person");
            return;
        }

        // Check if this sibling already exists in the form data
        const isDuplicate = checkForDuplicate(multiBirthSiblingForm.sibling_person_id);
        if (isDuplicate) {
            setError("This person has already been added as a sibling");
            return;
        }

        if (isEditing && editIndex !== null) {
            // Update existing entry
            handleEditMultipleBirthSibling(editIndex, multiBirthSiblingForm);
        } else {
            // Add new entry
            setPersonForm(prev => ({
                ...prev,
                multiple_birth_sibling_data: [
                    ...(prev?.multiple_birth_sibling_data || []),
                    multiBirthSiblingForm
                ]
            }));
        }

        // Reset form
        setMultiBirthSiblingForm({
            is_identical: true,
            is_verified: false,
            multiple_birth_class_id: 1,
            remarks: "",
            sibling_person_id: null,
        });
        setChosenSibling(null);
        setError(null);
        handleIdsModalCancel();
    };

    const handleCancel = () => {
        setMultiBirthSiblingForm({
            is_identical: true,
            is_verified: false,
            multiple_birth_class_id: 1,
            remarks: "",
            sibling_person_id: null,
        })
        setChosenSibling(null)
        setError(null)
        handleIdsModalCancel();
    }

    useEffect(() => {
        if (multiBirthSiblingForm?.sibling_person_id) {
            setMultiBirthSiblingForm(prev => ({
                ...prev,
                person_id: currentPersonId,
                multiple_birth_class_id: birthClassTypes?.find(type => type?.term_for_sibling_group === chosenSibling?.multiple_birth_siblings?.[0]?.multiple_birth_class)?.id ?? 1
            }))

            // Use person_id_display if available, otherwise fall back to person_id
            const personIdToUse = multiBirthSiblingForm.sibling_person_id_display || multiBirthSiblingForm.sibling_person_id;
            setChosenSibling(persons?.find(person => person?.id === personIdToUse) ?? null)

            // Clear any previous error when a person is selected
            setError(null)
        }

    }, [multiBirthSiblingForm?.sibling_person_id, multiBirthSiblingForm?.sibling_person_id_display, persons, chosenSibling?.multiple_birth_siblings, birthClassTypes, currentPersonId])

    return (
        <div className="p-5">
            <form className="flex flex-col gap-4">
                <div>
                    <label className="flex flex-col gap-1 w-[40%]">
                        <span className="font-semibold">Person</span>
                        <Select
                            value={multiBirthSiblingForm.sibling_person_id ?? undefined}
                            loading={personLoading}
                            showSearch
                            optionFilterProp="label"
                            className='mt-2 h-10 rounded w-full'
                            options={
                                persons?.length
                                    ? persons.map(person => ({
                                        value: person?.id,
                                        label: `${person?.first_name ?? ""} ${person?.middle_name ?? ""} ${person?.last_name ?? ""}`
                                    }))
                                    : []
                            }
                            notFoundContent={personLoading ? "Loading..." : "No data found"}
                            onSearch={value => {
                                setPersonSearch?.(value);
                                setPersonPage?.(1); // Reset to first page on new search
                            }}
                            onChange={(value) => {
                                // Check for duplicates when changing the selection
                                const isDuplicate = checkForDuplicate(value);
                                if (isDuplicate) {
                                    setError("This person has already been added as a sibling");
                                } else {
                                    setError(null);
                                    setMultiBirthSiblingForm(prev => ({
                                        ...prev,
                                        sibling_person_id: value
                                    }));
                                }
                            }}
                            status={error ? "error" : ""}
                        />
                        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                    </label>
                </div>
                <div className="flex gap-2">
                    <label htmlFor="" className="flex-1">
                        <span className="font-semibold">Prefix</span>
                        <Input
                            value={prefixes?.find(prefix => prefix?.id === chosenSibling?.prefix)?.prefix}
                            className="h-12"
                        />
                    </label>
                    <label htmlFor="" className="flex-[2]">
                        <span className="font-semibold">Last Name</span>
                        <Input
                            className="h-12"
                            value={chosenSibling?.last_name}
                        />
                    </label>
                    <label htmlFor="" className="flex-[2]">
                        <span className="font-semibold">First Name</span>
                        <Input
                            className="h-12"
                            value={chosenSibling?.first_name}
                        />

                    </label>
                    <label htmlFor="" className="flex-[2]">
                        <span className="font-semibold">Middle Name</span>
                        <Input
                            className="h-12"
                            value={chosenSibling?.middle_name}
                        />
                    </label>
                    <label htmlFor="" className="flex-1">
                        <span className="font-semibold">Suffix</span>
                        <Input
                            className="h-12"
                            value={suffixes?.find(suffix => suffix?.id === chosenSibling?.prefix)?.suffix}
                        />
                    </label>
                </div>

                <div className="flex gap-2 items-center">
                    <label htmlFor="" className="flex-[3]">
                        <span className="font-semibold">Short Name</span>
                        <Input
                            className="h-12"
                            value={chosenSibling?.shortname}
                        />
                    </label>
                    <label htmlFor="" className="flex-[2]">
                        <span className="font-semibold">Gender</span>
                        <Input
                            className="h-12"
                            value={chosenSibling?.gender?.gender_option}
                        />
                    </label>
                    <label htmlFor="" className="flex-[2]">
                        <span className="font-semibold">Sibling Group</span>
                        <Input
                            className="h-12"
                            value={chosenSibling?.multiple_birth_siblings?.[0]?.multiple_birth_class ?? ""}
                        />
                    </label>
                    <label htmlFor="" className="flex-1 flex items-center gap-2 mt-2">
                        <span className="font-semibold">Identical</span>
                        <input
                            checked={multiBirthSiblingForm?.is_identical}
                            type="checkbox"
                            className="w-4 h-4"
                            onChange={e =>
                                setMultiBirthSiblingForm(prev => ({
                                    ...prev,
                                    is_identical: e.target.checked,
                                }))
                            }
                        />
                    </label>
                    <label htmlFor="" className="flex-1 flex items-center gap-2 mt-2">
                        <span className="font-semibold">Verified</span>
                        <input
                            checked={multiBirthSiblingForm?.is_verified}
                            type="checkbox"
                            className="w-4 h-4"
                            onChange={e =>
                                setMultiBirthSiblingForm(prev => ({
                                    ...prev,
                                    is_verified: e.target.checked,
                                }))
                            }
                        />
                    </label>
                </div>

                <div>
                    <label htmlFor="">
                        <span className="font-semibold">Remarks</span>
                        <Input.TextArea
                            className="!h-40"
                            value={multiBirthSiblingForm.remarks}
                            onChange={e => setMultiBirthSiblingForm(prev => ({ ...prev, remarks: e.target.value }))}
                        />
                    </label>
                </div>
                <div className="w-full flex items-end justify-end">
                    <div className="flex gap-4 w-[30%]">
                        <button
                            type="button"
                            className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1 font-semibold"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1 font-semibold"
                            onClick={handleSubmit}
                            disabled={!!error}
                        >
                            {isEditing ? "Update" : "Add"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default UpdateMultiBirthSiblingForm