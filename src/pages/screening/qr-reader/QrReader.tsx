/* eslint-disable @typescript-eslint/no-explicit-any */
import QCJMD_logo from "@/assets/Logo/QCJMD.png"
import { useEffect, useMemo, useState } from "react";
import QrScanner from "./QrScanner";
import noImg from "@/assets/no-img.webp"
import check from "@/assets/Icons/check-mark.png"
import ex from "@/assets/Icons/close.png"
import { Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getDevice } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { getPDLVisitStatuses } from "@/lib/additionalQueries";


const QrReader = ({ selectedArea }: { selectedArea: string }) => {
  const [lastScanned, setLastScanned] = useState<any | null>(null);
  const [dateTime, setDateTime] = useState<string>("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | number>("");
  const token = useTokenStore()?.token

  const { data, isLoading } = useQuery({
    queryKey: ['get-devices', 'qr-reader'],
    queryFn: () => getDevice(token ?? "")
  })

  const { data: visitation_status } = useQuery({
    queryKey: ['get-visitation-status', 'qr-reader'],
    queryFn: () => getPDLVisitStatuses(token ?? ""),
  })

  const webcamDevices = useMemo(
    () =>
      data?.results?.filter(device =>
        device?.device_name?.toLowerCase().includes("webcam")
      ) || [],
    [data]
  );

  // Set default device to the first webcam device when devices change
  useEffect(() => {
    if (webcamDevices.length > 0) {
      setSelectedDeviceId(webcamDevices[0].id);
    }
  }, [webcamDevices]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setDateTime(now.toLocaleString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);


  let imageSrc = "";

  if (lastScanned?.person?.media) {
    const frontPicture = lastScanned?.person?.media?.find(
      (media: { picture_view: string; }) => media?.picture_view === "Front"
    )?.media_binary;

    if (frontPicture) {
      imageSrc = `data:image/jpeg;base64,${frontPicture}`;
    }
  }

  const handleDeviceChange = (value: string | number) => {
    setSelectedDeviceId(value);
  };

  const handleClear = () => {
    setLastScanned({});
  };

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="w-full flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full flex flex-col items-center gap-4">
            <div className="w-[30%] flex items-center justify-center">
              <img src={QCJMD_logo} alt="QCJMD Logo" className="w-full h-full object-cover" />
            </div>
            <div className="w-full flex flex-col items-center gap-4">
              <h1 className="text-3xl font-semibold">VISITOR CHECK-IN / CHECK-OUT</h1>
              <p>{dateTime}</p>
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
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full flex items-center justify-center flex-col gap-10">
              <div className="w-[60%] rounded-md overflow-hidden object-cover">
                <img src={imageSrc || noImg} alt="Image of a person" className="w-full" />
              </div>
              <h1 className="text-4xl font-semibold">{`${lastScanned?.person?.first_name ?? ""} ${lastScanned?.person?.last_name ?? ""}`}</h1>
            </div>
            <div className="w-full flex items-center justify-center">
              {
                lastScanned ? (
                  <div className="w-[50%] text-3xl flex">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-[2] flex gap-12">

                        <>
                          <span>Status:</span>
                          <span className={`font-semibold ${lastScanned?.pdls?.[0]?.pdl?.visitation_status === "Available" ? "text-green-700" : "text-red-600"}`}>
                            {lastScanned?.pdls?.[0]?.pdl?.visitation_status}
                          </span>
                        </>

                      </div>
                      <div className="flex justify-end flex-1 gap-4">
                        {
                          lastScanned?.pdls?.[0]?.pdl?.visitation_status === "Available" ? (
                            <img src={check} alt="Check Mark" className="w-10 h-10" />
                          ) : (
                            <img src={ex} alt="X Mark" className="w-10 h-10" />
                          )
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-semibold">Please Scan Your QR Code.</p>
                  </div>
                )
              }
            </div>
            <div>
              <p className="text-lg">
                {visitation_status?.results?.find(status => status?.name === lastScanned?.pdls?.[0]?.pdl?.visitation_status)?.description}
              </p>
            </div>
          </div>
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
        {/* <div className="mr-24">
          <button
            className="bg-blue-200 py-1 px-10 font-semibold rounded hover:bg-blue-500 hover:text-white"
            onClick={handleClear}
          >
            Clear
          </button>
        </div> */}
      </div>
    </div>
  )
}

export default QrReader