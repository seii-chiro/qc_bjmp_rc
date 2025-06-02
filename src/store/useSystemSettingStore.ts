/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BASE_URL } from "@/lib/urls";

type SystemSettingsState = {
  fingerScannerTimeout: string;
  irisScannerTimeout: string;
  logRefetchInterval: string;
  nfiqQuality: string;
  allowForce: boolean;
  fetchSystemSettings: (token: string) => Promise<void>;
  updateSystemSettingsStore: (token: string) => Promise<void>;
};

export const useSystemSettingsStore = create<SystemSettingsState>()(
  persist(
    (set) => ({
      fingerScannerTimeout: "",
      irisScannerTimeout: "",
      logRefetchInterval: "",
      nfiqQuality: "",
      allowForce: false,
      fetchSystemSettings: async (token: string) => {
        try {
          const res = await fetch(`${BASE_URL}/api/codes/system-settings/`, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error("Failed to fetch system settings");
          const data = await res.json();

          set({
            fingerScannerTimeout:
              data?.results?.find(
                (s: any) => s.key === "finger_capture_timeout"
              )?.value ?? "",
            irisScannerTimeout:
              data?.results?.find((s: any) => s.key === "iris_capture_timeout")
                ?.value ?? "",
            logRefetchInterval:
              data?.results?.find((s: any) => s.key === "log_refetch_interval")
                ?.value ?? "",
            nfiqQuality:
              data?.results?.find((s: any) => s.key === "nfiq_quality")
                ?.value ?? "",
            allowForce:
              data?.results?.find((s: any) => s.key === "allow_force")?.value ??
              "",
          });
        } catch {
          set({
            fingerScannerTimeout: "",
            irisScannerTimeout: "",
            logRefetchInterval: "",
            nfiqQuality: "",
            allowForce: false,
          });
        }
      },
      updateSystemSettingsStore: async (token: string) => {
        try {
          const res = await fetch(`${BASE_URL}/api/codes/system-settings/`, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error("Failed to fetch system settings");
          const data = await res.json();

          set({
            fingerScannerTimeout:
              data?.results?.find(
                (s: any) => s.key === "finger_capture_timeout"
              )?.value ?? "",
            irisScannerTimeout:
              data?.results?.find((s: any) => s.key === "iris_capture_timeout")
                ?.value ?? "",
            logRefetchInterval:
              data?.results?.find((s: any) => s.key === "log_refetch_interval")
                ?.value ?? "",
            nfiqQuality:
              data?.results?.find((s: any) => s.key === "nfiq_quality")
                ?.value ?? "",
            allowForce:
              data?.results?.find((s: any) => s.key === "allow_force")?.value ??
              "",
          });
        } catch {
          set({
            fingerScannerTimeout: "",
            irisScannerTimeout: "",
            logRefetchInterval: "",
            nfiqQuality: "",
            allowForce: false,
          });
        }
      },
    }),
    {
      name: "system-settings-store",
      partialize: (state) => ({
        fingerScannerTimeout: state.fingerScannerTimeout,
        irisScannerTimeout: state.irisScannerTimeout,
        logRefetchInterval: state.logRefetchInterval,
        nfiqQuality: state.nfiqQuality,
        allowForce: state.allowForce,
      }),
    }
  )
);
