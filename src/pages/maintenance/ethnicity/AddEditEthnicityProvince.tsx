import { getJail_Province, getJailRegion } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Input, message, Select } from "antd";
import { useState } from "react";

type Props = {
  ethnicityId: number;
  ethnicityName: string; // <-- add this prop
  onAdd: (province: {
    region_id: number;
    province_id: number;
    description: string;
  }) => void;
  onCancel: () => void;
};
const AddEditEthnicityProvince = () => {
    return (
        <div>
        
        </div>
    )
}

export default AddEditEthnicityProvince
