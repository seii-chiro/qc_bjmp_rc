/* eslint-disable @typescript-eslint/no-explicit-any */
import QCJMD_logo from "@/assets/Logo/QCJMD.png"
import { useEffect, useMemo, useState } from "react";
import QrScanner from "./QrScanner";
import check from "@/assets/Icons/check-mark.png"
import ex from "@/assets/Icons/close.png"
import { Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getDevice } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import VisitorProfilePortrait from "../VisitorProfilePortrait";
import Clock from "../Clock";
import { useFullScreenHandle, FullScreen } from "react-full-screen";
import clsx from "clsx";

const QrReader = ({ selectedArea }: { selectedArea: string }) => {
  const [lastScanned, setLastScanned] = useState<any | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | number>("");
  const token = useTokenStore()?.token
  const fullScreenHandle = useFullScreenHandle();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+F for fullscreen toggle
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        if (fullScreenHandle.active) {
          fullScreenHandle.exit();
        } else {
          fullScreenHandle.enter();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenHandle]);

  const { data, isLoading } = useQuery({
    queryKey: ['get-devices', 'qr-reader'],
    queryFn: () => getDevice(token ?? "")
  })

  const webcamDevices = useMemo(
    () =>
      data?.results?.filter(device =>
        device?.device_name?.toLowerCase().includes("webcam")
      ) || [],
    [data]
  );

  useEffect(() => {
    if (webcamDevices.length > 0) {
      setSelectedDeviceId(webcamDevices[0].id);
    }
  }, [webcamDevices]);

  return (
    <FullScreen handle={fullScreenHandle} className="w-full h-full">
      <div className={clsx('w-full h-full flex flex-col bg-white', fullScreenHandle?.active ? 'p-20 pt-10' : 'p-0')}>
        <div className="w-full flex">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-[30%] flex items-center justify-center">
                <img src={QCJMD_logo} alt="QCJMD Logo" className="w-full h-full object-cover" />
              </div>
              <div className="w-full flex flex-col items-center gap-4">
                <h1 className="text-3xl font-semibold">VISITOR CHECK-IN / CHECK-OUT</h1>
                <Clock />
              </div>
              <div className="w-full flex flex-col items-center gap-10">
                <h2 className="text-2xl font-semibold">Align your QR code within the box to scan</h2>
                <QrScanner
                  selectedArea={selectedArea}
                  setLastScanned={setLastScanned}
                  selectedDeviceId={selectedDeviceId}
                />
              </div>
            </div>
          </div>
          <div className="flex-1 text-gray-500">
            <div className='w-full flex items-center justify-center'>
              {
                lastScanned?.visitor_app_status && (
                  <div className="flex items-center justify-center gap-5">
                    <h1 className="font-bold text-2xl text-green-700">{lastScanned?.visitor_app_status}</h1>
                    {lastScanned?.visitor_app_status === "Verified" ? (
                      <img src={check} className="w-10" alt="Check" />
                    ) : (
                      <img src={ex} className="w-10" alt="Close" />
                    )}
                  </div>
                )
              }
            </div>
            <VisitorProfilePortrait visitorData={lastScanned} />
          </div>
        </div>
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <span className="font-semibold">DEVICE ID:</span>
            <Select
              loading={isLoading}
              showSearch
              optionFilterProp="label"
              className="h-10 w-72"
              options={webcamDevices.map(device => ({
                label: device?.device_name,
                value: device?.id
              }))}
              value={selectedDeviceId || undefined}
              onChange={setSelectedDeviceId}
              placeholder="Select a device"
            />
          </div>
        </div>
      </div>
    </FullScreen>
  )
}

export default QrReader