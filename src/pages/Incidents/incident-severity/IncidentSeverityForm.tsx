import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { CodeDataSourceRecord } from "./IncidentSeverity";
import { addSeverityLevels, patchIncidentSeverityLevel } from "@/lib/incidentQueries";

export type IncidentSeverityLevelFormType = {
  name: string;
  description: string;
};

type Props = {
  recordToEdit: CodeDataSourceRecord | null;
  handleClose: () => void;
};

const IncidentSeverityForm = ({ recordToEdit, handleClose }: Props) => {
  const token = useTokenStore((state) => state.token);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<IncidentSeverityLevelFormType>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (recordToEdit) {
      setForm({
        name: recordToEdit.name,
        description: recordToEdit.description,
      });
    } else {
      setForm({
        name: "",
        description: "",
      });
    }
  }, [recordToEdit]);

  const mutation = useMutation({
    mutationKey: [recordToEdit ? "edit" : "add", "severity level"],
    mutationFn: () => {
      if (recordToEdit) {
        return patchIncidentSeverityLevel(token ?? "", recordToEdit.id, form);
      } else {
        return addSeverityLevels(token ?? "", form);
      }
    },
    onSuccess: () => {
      message.success(
        `Successfully ${recordToEdit ? "updated" : "added"} severity level`
      );
      queryClient.invalidateQueries({ queryKey: ["Incident", "severity"] });
      handleClose();
      setForm({ name: "", description: "" });
    },
    onError: (err) => message.error(err.message.replace(/[{}[\]]/g, "")),
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        {recordToEdit ? "Edit" : "Add"} Severity Level
      </h1>

      <form
        className="w-full flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <span className="text-lg font-semibold">Severity Level</span>
          <Input
            className="h-10"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
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

export default IncidentSeverityForm;
