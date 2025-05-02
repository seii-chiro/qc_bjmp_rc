import { Modal, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import { SetStateAction, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import PDLVisitorForm from "./UpdatePdlVisitorForm";
import { PDLForm } from "@/lib/visitorFormDefinition";
import { useQuery } from "@tanstack/react-query";
import { getVisitor_to_PDL_Relationship, getVisitors } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";

type Props = {
    setPdlForm: React.Dispatch<SetStateAction<PDLForm>>;
    pdlForm: PDLForm;
};

const UpdatePdlVisitor = ({ pdlForm, setPdlForm }: Props) => {
    const token = useTokenStore()?.token;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const { data: pdlVisitors, isLoading: pdlVisitorsLoading } = useQuery({
        queryKey: ['pdl-visitors'],
        queryFn: () => getVisitors(token ?? "")
    });

    const { data: visitorToPdlRelationship, isLoading: visitorToPdlRelationshipLoading } = useQuery({
        queryKey: ['visitors-pdl-relationship'],
        queryFn: () => getVisitor_to_PDL_Relationship(token ?? "")
    });

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditIndex(null);
    };

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setIsModalOpen(true);
    };

    const handleDelete = (index: number) => {
        const updatedVisitors = [...(pdlForm.visitor || [])];
        updatedVisitors.splice(index, 1);

        setPdlForm(prev => ({
            ...prev,
            visitor: updatedVisitors,
            visitor_ids: updatedVisitors.map(item => item.visitor),
        }));
    };

    console.log(pdlForm?.visitor)

    // Create table data source directly from pdlForm.visitor
    const pdlToVisitDataSource = pdlForm?.visitor?.map((visitorEntry, index) => {
        // Find the visitor from the visitors data
        const visitor = pdlVisitors?.find(v => v?.visitor_reg_no
            === visitorEntry?.visitor_reg_no);

        // Find the relationship name
        const relationship = visitorToPdlRelationship?.find(
            r => r.id === visitorEntry.relationship_to_visitor
        );

        return {
            key: index,
            lastname: visitor?.person?.last_name ?? "N/A",
            firstName: visitor?.person?.first_name ?? "N/A",
            middleName: visitor?.person?.middle_name ?? "N/A",
            relationship: relationship?.relationship_name ?? "N/A",
            visitationStatus: "N/A", // This was not in pdlForm, consider adding if needed
            birthClassClassification: visitor?.person?.multiple_birth_siblings?.[0]?.multiple_birth_class ?? "Single",
            action: (
                <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center items-center">
                    <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-1 rounded w-10 h-10 flex items-center justify-center"
                    >
                        <AiOutlineEdit />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1 rounded flex w-10 h-10 items-center justify-center"
                    >
                        <AiOutlineDelete />
                    </button>
                </div>
            )
        };
    }) || [];

    const visitorToPdlRelationshipColumns: ColumnsType<{
        key: number;
        lastname: string;
        firstName: string;
        middleName: string;
        relationship: string;
        visitationStatus: string;
        birthClassClassification: string;
        action: JSX.Element;
    }> = [
            {
                title: 'Last Name',
                dataIndex: 'lastname',
                key: 'lastname',
            },
            {
                title: 'First Name',
                dataIndex: 'firstName',
                key: 'firstName',
            },
            {
                title: 'Middle Name',
                dataIndex: 'middleName',
                key: 'middleName',
            },
            {
                title: 'Relationship to PDL',
                dataIndex: 'relationship',
                key: 'relationship',
            },
            {
                title: 'Visitor Visitation Status',
                dataIndex: 'visitationStatus',
                key: 'visitationStatus',
            },
            {
                title: 'Multiple Birth Classification',
                dataIndex: 'birthClassClassification',
                key: 'birthClassClassification',
            },
            {
                title: "Actions",
                key: "actions",
                align: 'center',
                dataIndex: 'action'
            },
        ];

    return (
        <div className="flex flex-col gap-5 mt-10">
            <div className="flex justify-between">
                <h1 className='font-bold text-xl'>Update Visitors</h1>
                <button
                    type="button"
                    onClick={handleModalOpen}
                    className="flex gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-400"
                >
                    <Plus />
                    Add Visitor
                </button>
            </div>
            <div>
                <Table
                    loading={pdlVisitorsLoading || visitorToPdlRelationshipLoading}
                    className="border text-gray-200 rounded-md"
                    dataSource={pdlToVisitDataSource}
                    columns={visitorToPdlRelationshipColumns}
                    scroll={{ x: 800 }}
                />
            </div>

            <Modal
                centered
                className="overflow-y-auto rounded-lg scrollbar-hide"
                title={editIndex !== null ? "Edit Visitor" : "Add Visitor"}
                open={isModalOpen}
                onCancel={handleModalClose}
                footer={null}
                width="40%"
            >
                <PDLVisitorForm
                    pdlVisitors={pdlVisitors || []}
                    pdlVisitorsLoading={pdlVisitorsLoading}
                    editPdlToVisitIndex={editIndex}
                    setEditPdlToVisitIndex={setEditIndex}
                    handlePdlToVisitModalCancel={handleModalClose}
                    pdlForm={pdlForm}
                    setPdlForm={setPdlForm}
                    visitorToPdlRelationship={visitorToPdlRelationship || []}
                    visitorToPdlRelationshipLoading={visitorToPdlRelationshipLoading}
                />
            </Modal>
        </div>
    );
};

export default UpdatePdlVisitor;