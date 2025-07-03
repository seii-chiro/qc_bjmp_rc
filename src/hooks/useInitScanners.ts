/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  getIrisScannerInfo,
  getScannerInfo,
  uninitIrisScanner,
  uninitScanner,
} from "@/lib/scanner-queries";

export function useInitScanners() {
  const [fingerScannerReady, setFingerScannerReady] = useState(false);
  const [irisScannerReady, setIrisScannerReady] = useState(false);

  const [fingerprintErrorInit, setFingerprintErrorInit] = useState(false);
  const [irisErrorInit, setIrisErrorInit] = useState(false);

  const irisScannerInitMutation = useMutation({
    mutationKey: ["iris-scanner-init"],
    mutationFn: getIrisScannerInfo,
    onSuccess: (data) => {
      if (data?.ErrorDescription === "Success") {
        setIrisScannerReady(true);
      }

      if (data?.ErrorDescription === "Device not connected.") {
        setIrisErrorInit(true);
      }
    },
    onError: (error: any) => {
      console.error(error.message);
    },
  });

  const irisScannerUninitThenInitMutation = useMutation({
    mutationKey: ["iris-scanner-uninit"],
    mutationFn: uninitIrisScanner,
    onSuccess: () => {
      irisScannerInitMutation.mutate();
    },
    onError: (error: any) => {
      console.error(error.message);
    },
  });

  const fingerScannerInitMutation = useMutation({
    mutationKey: ["finger-scanner-init"],
    mutationFn: getScannerInfo,
    onSuccess: (data) => {
      if (data?.ErrorDescription === "Success") {
        setFingerScannerReady(true);
      }

      if (data?.ErrorDescription === "Device not connected") {
        setFingerprintErrorInit(true);
      }
    },
    onError: (error: any) => {
      console.error(error.message);
    },
  });

  const fingerScannerUninitThenInitMutation = useMutation({
    mutationKey: ["finger-scanner-uninit"],
    mutationFn: uninitScanner,
    onSuccess: () => {
      fingerScannerInitMutation.mutate();
    },
    onError: (error: any) => {
      console.error(error.message);
    },
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      irisScannerUninitThenInitMutation.mutate();
      fingerScannerUninitThenInitMutation.mutate();
      hasInitialized.current = true;
    }
  }, []);

  return {
    irisErrorInit,
    fingerprintErrorInit,
    irisScannerReady,
    fingerScannerReady,
    irisScannerInitMutation,
    fingerScannerInitMutation,
    fingerScannerUninitThenInitMutation,
    irisScannerUninitThenInitMutation,
  };
}
