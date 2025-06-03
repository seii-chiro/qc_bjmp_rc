import { deleteOASISStatus, getOASISStatus } from "@/lib/oasis-query"
import { useTokenStore } from "@/store/useTokenStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Input, message, Modal, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { useState } from "react"
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import StatusForm from "./forms/StatusForm"

export type StatusDataSourceRecord = {
  id: number;
  no: number;
  code: string;
  description: string;
  createdBy: number | null;
  updatedBy: number | null;
}

const Statuses = () => {
  const token = useTokenStore(state => state.token)
  const queryClient = useQueryClient()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<StatusDataSourceRecord | null>(null)

  const { data: statuses, isLoading: statusesLoading } = useQuery({
    queryKey: ['OASIS', 'status'],
    queryFn: () => getOASISStatus(token ?? "")
  })

  const deleteStatusMutation = useMutation({
    mutationFn: (id: number) => deleteOASISStatus(token ?? "", id),
    onSuccess: () => {
      message.success("Status deleted")
      queryClient.invalidateQueries({ queryKey: ['OASIS', 'status'] })
    },
    onError: () => {
      message.error("Failed to delete status")
    }
  })

  const dataSource = statuses?.results.map((item, index) => {
    return ({
      id: item?.id,
      no: index + 1,
      code: item?.code,
      description: item?.description,
      createdBy: item?.created_by,
      updatedBy: item?.updated_by
    })
  })

  const handleOpenModal = () => {
    setIsFormModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsFormModalOpen(false)
  }

  const handleEditOpenModal = (record: StatusDataSourceRecord) => {
    setIsFormModalOpen(true)
    setRecordToEdit(record)
  }

  const handleDelete = (record: StatusDataSourceRecord) => {
    Modal.confirm({
      centered: true,
      title: `Delete status "${record?.code}"?`,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        deleteStatusMutation.mutate(record?.id)
      }
    })
  }

  const columns: ColumnsType<StatusDataSourceRecord> = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Created by',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Updated by',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
    },
    {
      align: 'center',
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: StatusDataSourceRecord) => (
        <div className="w-full justify-center items-center gap-12">
          <Button
            onClick={() => handleEditOpenModal(record)}
            className="border-none cursor-pointer text-blue-500"
          >
            <AiOutlineEdit />
          </Button>
          <Button
            danger
            onClick={() => handleDelete(record)}
            className="border-none cursor-pointer text-red-500"
          >
            <AiOutlineDelete />
          </Button>
        </div>
      )
    },
  ]

  return (
    <>
      <Modal
        footer={null}
        width={"40%"}
        centered
        open={isFormModalOpen}
        onCancel={handleCloseModal}
        onClose={handleCloseModal}
      >
        <StatusForm
          recordToEdit={recordToEdit}
          handleClose={handleCloseModal}
        />
      </Modal>

      <div className="text-3xl font-bold mb-6 text-[#1E365D]">Status</div>
      <div className="w-full flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="h-10 w-32 bg-[#1E365D] text-white font"
          >
            Export
          </Button>
          <Button
            className="h-10 w-32 bg-[#1E365D] text-white font"
          >
            Print Report
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="🔍Search"
            className="h-10 w-52"
          />
          <Button
            onClick={handleOpenModal}
            className="h-10 bg-[#1E365D] text-white"
          >
            <FaPlus /> Add Status
          </Button>
        </div>
      </div>
      <Table
        className="mt-2"
        dataSource={dataSource}
        columns={columns}
        loading={statusesLoading}
      />
    </>
  )
}

export default Statuses