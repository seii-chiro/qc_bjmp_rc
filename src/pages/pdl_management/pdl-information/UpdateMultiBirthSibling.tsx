/* eslint-disable @typescript-eslint/no-explicit-any */
import { MultiBirthSiblingForm as MultiBirthSiblingFormType, PersonForm } from "@/lib/visitorFormDefinition"
import { Modal, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { Plus } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import UpdateMultiBirthSiblingForm from "./UpdateMultiBirthSiblingForm"
import { Gender, Person } from "@/lib/pdl-definitions"
import { MultipleBirthClassType, Prefix, Suffix } from "@/lib/definitions"
import { BASE_URL } from "@/lib/urls"
import { useTokenStore } from "@/store/useTokenStore"

type Props = {
    handleDeleteMultipleBirthSibling: (index: number) => void;
    persons: Person[];
    genders: Gender[]
    personsLoading: boolean;
    setPersonForm: Dispatch<SetStateAction<PersonForm>>;
    personForm: PersonForm;
    birthClassTypes: MultipleBirthClassType[];
    birthClassTypesLoading: boolean;
    prefixes: Prefix[];
    suffixes: Suffix[];
    currentPersonId: number | null;
    setPersonSearch?: (value: string) => void;
    personPage: number;
    setPersonPage: (page: number) => void;
    personsCount: number;
}

const UpdateMultipleBirthSiblings = ({
    handleDeleteMultipleBirthSibling,
    setPersonForm,
    persons,
    birthClassTypes,
    birthClassTypesLoading,
    genders,
    personsLoading,
    prefixes,
    suffixes,
    personForm,
    currentPersonId,
    personPage,
    personsCount,
    setPersonPage,
    setPersonSearch
}: Props) => {
    const token = useTokenStore()?.token
    const [idsModalOpen, setIdsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [identifierDataSource, setIdentifierDataSource] = useState<any[]>([]);

    const fetchPersonById = async (id: number) => {
        const res = await fetch(`${BASE_URL}/api/standards/persons/${id}/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) return null;
        return res.json();
    };

    const handleModalOpen = (index?: number) => {
        if (index !== undefined) {
            setIsEditing(true)
            setEditIndex(index)
        } else {
            setIsEditing(false)
            setEditIndex(null)
        }
        setIdsModalOpen(true)
    }

    const handleModalClose = () => {
        setIdsModalOpen(false)
        setIsEditing(false)
        setEditIndex(null)
    }

    const handleEditMultipleBirthSibling = (index: number, updatedData: MultiBirthSiblingFormType) => {
        // Update the personForm
        setPersonForm(prev => {
            const updatedSiblings = [...(prev.multiple_birth_sibling_data || [])];
            updatedSiblings[index] = updatedData;
            return {
                ...prev,
                multiple_birth_sibling_data: updatedSiblings
            };
        });
    };

    useEffect(() => {
        const loadData = async () => {
            if (!personForm?.multiple_birth_sibling_data) {
                setIdentifierDataSource([]);
                return;
            }
            const data = await Promise.all(
                personForm?.multiple_birth_sibling_data?.map(async (siblingData, index) => {
                    let chosenSibling = persons?.find(
                        person => person?.id === (siblingData?.sibling_person_id_display || siblingData?.sibling_person_id)
                    );
                    if (
                        !chosenSibling &&
                        (siblingData?.sibling_person_id_display || siblingData?.sibling_person_id)
                    ) {
                        try {
                            chosenSibling = await fetchPersonById(
                                siblingData?.sibling_person_id_display || siblingData?.sibling_person_id
                            );
                        } catch {
                            chosenSibling = null;
                        }
                    }
                    // console.log("Chosen Sibling", chosenSibling)
                    const siblingGroup = birthClassTypes?.find(type => type?.id === siblingData?.multiple_birth_class_id)?.term_for_sibling_group;
                    return {
                        key: index,
                        siblingGroup: siblingGroup || "",
                        shortName: chosenSibling?.shortname || siblingData?.sibling_person || siblingData?.full_name || `${chosenSibling?.first_name} ${chosenSibling?.last_name}` || "N/A",
                        gender: chosenSibling?.gender?.gender_option || "N/A",
                        identical: siblingData?.is_identical ? "Yes" : "No",
                        verified: siblingData?.is_verified ? "Yes" : "No",
                        actions: (
                            <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center items-center">
                                <button
                                    type="button"
                                    className="border border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white py-1 rounded w-10 h-10 flex items-center justify-center"
                                    onClick={() => handleModalOpen(index)}
                                >
                                    <AiOutlineEdit />
                                </button>
                                <button
                                    onClick={() => handleDeleteMultipleBirthSibling(index)}
                                    type="button"
                                    className="border border-red-500 text-red-500 hover:bg-red-600 hover:text-white py-1 rounded w-10 h-10 flex items-center justify-center"
                                >
                                    <AiOutlineDelete />
                                </button>
                            </div>
                        )
                    };
                })
            );
            setIdentifierDataSource(data);
        };
        loadData();
    }, [personForm.multiple_birth_sibling_data, persons, birthClassTypes, token]);

    const identifierColumn: ColumnsType<{
        siblingGroup: string;
        shortName: string;
        gender: string;
        identical: string;
        verified: string;
        actions: JSX.Element;
    }> = [
            {
                title: 'Sibling Group',
                dataIndex: 'siblingGroup',
                key: 'siblingGroup',
            },
            {
                title: 'Short Name',
                dataIndex: 'shortName',
                key: 'shortName',
            },
            {
                title: 'Gender',
                dataIndex: 'gender',
                key: 'gender',
            },
            {
                title: 'Identical (Y/N)',
                dataIndex: 'identical',
                key: 'identical',
            },
            {
                title: 'Verified (Y/N)',
                dataIndex: 'verified',
                key: 'verified',
            },
            {
                title: "Actions",
                key: "actions",
                dataIndex: "actions",
                align: 'center',
            },
        ];

    return (
        <div className="flex flex-col gap-5 mt-10">
            <Modal
                centered
                className="overflow-y-auto rounded-lg scrollbar-hide"
                title={isEditing ? "Edit Sibling" : "Add Sibling"}
                open={idsModalOpen}
                onCancel={handleModalClose}
                footer={null}
                width="50%"
            >
                <UpdateMultiBirthSiblingForm
                    currentPersonId={currentPersonId}
                    personForm={personForm}
                    personLoading={personsLoading}
                    prefixes={prefixes}
                    suffixes={suffixes}
                    genders={genders}
                    birthClassTypesLoading={birthClassTypesLoading}
                    birthClassTypes={birthClassTypes}
                    persons={persons}
                    setPersonForm={setPersonForm}
                    handleIdsModalCancel={handleModalClose}
                    isEditing={isEditing}
                    editIndex={editIndex}
                    handleEditMultipleBirthSibling={handleEditMultipleBirthSibling}
                    personPage={personPage}
                    setPersonPage={setPersonPage}
                    personsCount={personsCount}
                    setPersonSearch={setPersonSearch}
                />
            </Modal>

            <div className="flex justify-between items-center">
                <h1 className='font-bold text-xl'>Multiple Birth Sibling(s)</h1>
                <button
                    className="flex gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-400"
                    type="button"
                    onClick={() => handleModalOpen()}
                >
                    <Plus />
                    Add Sibling
                </button>
            </div>
            <Table
                loading={personsLoading}
                className="border text-gray-200 rounded-md"
                dataSource={identifierDataSource}
                columns={
                    editIndex
                        ? identifierColumn
                        : identifierColumn.filter(col => !["gender", "siblingGroup"].includes(col.key as string))
                }
                scroll={{ x: 800 }}
            />
        </div>
    )
}

export default UpdateMultipleBirthSiblings