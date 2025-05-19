import { PaginatedResponse } from "./queries";
import { BASE_URL } from "./urls";

export type PersonnelStatus = {
  id: number;
  created_by: number | null;
  updated_by: number | null;
  record_status: string;
  created_at: string | null;
  updated_at: string | null;
  name: string;
  description: string;
};

export async function getPersonnelStatus(
  token: string
): Promise<PaginatedResponse<PersonnelStatus>> {
  const res = await fetch(`${BASE_URL}/api/codes/personnel-status/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Personnel Status data.");
  }

  return res.json();
}
