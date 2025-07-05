import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { RiskClassificationDataSourceRecord } from "./RiskClassification";
import { RiskClassification } from "@/lib/pdl-definitions";
import { BASE_URL } from "@/lib/urls";

async function postRiskClassification(
  token: string,
  payload: RiskClassificationFormType
): Promise<RiskClassification> {
  const res = await fetch(`${BASE_URL}/api/pdls/risk-classification/`, {
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

async function patchRiskClassification(
  token: string,
  id: number,
  payload: Partial<RiskClassificationFormType>
): Promise<RiskClassification> {
  const res = await fetch(`${BASE_URL}/api/pdls/risk-classification/${id}/`, {
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

export type RiskClassificationFormType = {
  risk_classification: string;
  description: string;
};

type Props = {
  recordToEdit: RiskClassificationDataSourceRecord | null;
  handleClose: () => void;
};

const RiskClassificationForm = ({ recordToEdit, handleClose }: Props) => {
  const token = useTokenStore((state) => state.token);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RiskClassificationFormType>({
    risk_classification: "",
    description: "",
  });

  useEffect(() => {
    if (recordToEdit) {
      setForm({
        risk_classification: recordToEdit.risk_classification,
        description: recordToEdit.description,
      });
    } else {
      setForm({
        risk_classification: "",
        description: "",
      });
    }
  }, [recordToEdit]);

  const mutation = useMutation({
    mutationKey: [recordToEdit ? "edit" : "add", "classification"],
    mutationFn: () => {
      if (recordToEdit) {
        return patchRiskClassification(token ?? "", recordToEdit.id, form);
      } else {
        return postRiskClassification(token ?? "", form);
      }
    },
    onSuccess: () => {
      message.success(
        `Successfully ${recordToEdit ? "updated" : "added"} risk classification`
      );
      queryClient.invalidateQueries({ queryKey: ["risk", "classification"] });
      handleClose();
      setForm({ risk_classification: "", description: "" });
    },
    onError: (err) => message.error(err.message.replace(/[{}[\]]/g, "")),
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        {recordToEdit ? "Edit" : "Add"} Risk Classification
      </h1>

      <form
        className="w-full flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <span className="text-lg font-semibold">Risk Classification</span>
          <Input
            className="h-10"
            value={form.risk_classification}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                risk_classification: e.target.value,
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

export default RiskClassificationForm;
