import { PaginatedResponse } from "@/pages/personnel_management/personnel/personnel";
import { BASE_URL } from "./urls";

export type SystemSettings = {
  id: number;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export async function getSystemSettings(
  token: string
): Promise<PaginatedResponse<SystemSettings>> {
  const res = await fetch(`${BASE_URL}/api/codes/system-settings/?limit=100`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch System Settings data.");
  }

  return res.json();
}

export const patchSystemSettings = async (
  token: string,
  id: number,
  settings: { key: string; value: string }
) => {
  const response = await fetch(`${BASE_URL}/api/codes/system-settings/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  return response.json();
};
