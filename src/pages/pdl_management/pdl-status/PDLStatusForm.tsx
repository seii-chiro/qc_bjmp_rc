import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/urls";
import { PDLStatus } from "@/lib/pdl-definitions";
import { PDLStatusDataSourceRecord } from "./PDLStatus";

async function postPDLStatus(
  token: string,
  payload: PDLStatusFormType
): Promise<PDLStatus> {
  const res = await fetch(`${BASE_URL}/api/pdls/pdl-status/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

async function patchPDLStatus(
  token: string,
  id: number,
  payload: Partial<PDLStatusFormType>
): Promise<PDLStatus> {
  const res = await fetch(`${BASE_URL}/api/pdls/pdl-status/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }

  return res.json();
}

export type PDLStatusFormType = {
  status: string;
  description: string;
};

type Props = {
  recordToEdit: PDLStatusDataSourceRecord | null;
  handleClose: () => void;
};

const PDLStatusForm = ({ recordToEdit, handleClose }: Props) => {
  const token = useTokenStore((state) => state.token);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PDLStatusFormType>({
    status: "",
    description: "",
  });

  useEffect(() => {
    if (recordToEdit) {
      setForm({
        status: recordToEdit.status,
        description: recordToEdit.description,
      });
    } else {
      setForm({
        status: "",
        description: "",
      });
    }
  }, [recordToEdit]);

  const mutation = useMutation({
    mutationKey: [recordToEdit ? "edit" : "add", "status"],
    mutationFn: () => {
      if (recordToEdit) {
        return patchPDLStatus(token ?? "", recordToEdit.id, form);
      } else {
        return postPDLStatus(token ?? "", form);
      }
    },
    onSuccess: () => {
      message.success(
        `Successfully ${recordToEdit ? "updated" : "added"} status`
      );
      queryClient.invalidateQueries({ queryKey: ["PDL", "Statuses"] });
      handleClose();
      setForm({ status: "", description: "" });
    },
    onError: (err) => message.error(err.message.replace(/[{}[\]]/g, "")),
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        {recordToEdit ? "Edit" : "Add"} PDL Status
      </h1>

      <form
        className="w-full flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <span className="text-lg font-semibold">PDL Status</span>
          <Input
            className="h-10"
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <span className="text-lg font-semibold">Description</span>
          <Input.TextArea
            className="!h-52"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className="w-full flex justify-end">
          <Button
            onClick={() => mutation.mutate()}
            className="w-24 bg-[#1E365D] text-white"
          >
            {recordToEdit ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PDLStatusForm;
