/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'
import qjmmd from '../../../../assets/Logo/QCJMD.png';
import rfid from '../../../../assets/rfid.png'
import close from '../../../../assets/Icons/close.png'
import check from '../../../../assets/Icons/check-mark.png'
import { Input, InputRef, message, Select } from 'antd';
import { useTokenStore } from '@/store/useTokenStore';
import { Device } from '@/lib/definitions';
import { BASE_URL } from '@/lib/urls';
import Clock from '../../Clock';
import VisitorProfilePortrait from '../../VisitorProfilePortrait';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { PaginatedResponse } from '@/lib/queries';
import { sanitizeRFID } from '@/functions/sanitizeRFIDInput';

type Props = {
    devices: PaginatedResponse<Device>;
    deviceLoading: boolean;
    selectedArea: string;
}

const Rfid = ({
    selectedArea,
    deviceLoading,
    devices
}: Props) => {
    const inputRef = useRef<InputRef>(null);
    const token = useTokenStore()?.token
    const [scannedIdNumber, setScannedIdNumber] = useState("")
    const [scannedVisitor, setScannedVisitor] = useState({ visitor_app_status: "" })
    const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null)
    const prevIdRef = useRef<string | null>(null);
    const fullScreenHandle = useFullScreenHandle();

    const handleRFIDScan = (input: string) => {
        const clean = sanitizeRFID(input);
        setScannedIdNumber(clean);
    };

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

    useEffect(() => {
        if (scannedIdNumber === "") {
            inputRef.current?.focus();
        }
    }, [scannedIdNumber]);

    const rfidDevices = useMemo(
        () =>
            devices?.results?.filter((device: { device_name: string; }) =>
                device?.device_name?.toLowerCase().includes("rfid")
            ) || [],
        [devices]
    );

    // Set default device to the first RFID device when devices change
    useEffect(() => {
        if (!deviceLoading && rfidDevices.length > 0) {
            setSelectedDeviceId(rfidDevices[0].id);
        }
    }, [deviceLoading, rfidDevices]);

    const fetchVisitorLog = async () => {
        if (!scannedIdNumber) return;

        message.open({
            key: "processing",
            type: 'loading',
            content: 'Loading...',
            duration: 0,
        });

        try {
            const res = await fetch(`${BASE_URL}/api/visit-logs/visitor-specific/?id_number=${scannedIdNumber}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch visitor log.`);
            }

            const data = await res.json();
            setScannedVisitor(data);

            let visitsUrl = "";
            let trackingUrl = "";

            switch (selectedArea?.toLowerCase()) {
                case "main gate":
                    visitsUrl = `${BASE_URL}/api/visit-logs/main-gate-visits/`;
                    trackingUrl = `${BASE_URL}/api/visit-logs/main-gate-tracking/`;
                    break;
                case "visitor station":
                    visitsUrl = `${BASE_URL}/api/visit-logs/visitor-station-visits/`;
                    trackingUrl = `${BASE_URL}/api/visit-logs/visitor-station-tracking/`;
                    break;
                default:
                    message.error({
                        key: "processing",
                        content: "Unknown area. Cannot post visit.",
                    });
                    return;
            }

            if (!data || !selectedDeviceId) {
                message.warning({
                    key: "processing",
                    content: "Missing visitor data or device selection.",
                });
                return;
            }

            const postRes = await fetch(visitsUrl, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    device_id: selectedDeviceId,
                    id_number: data.id_number,
                    binary_data: data.encrypted_id_number_qr,
                    person_id: data?.person?.id
                })
            });

            if (!postRes.ok) {
                throw new Error(`Failed to log visit.`);
            }

            const visitLogResponse = await postRes.json();

            if (!visitLogResponse?.id) {
                message.warning({
                    key: "processing",
                    content: "Visit logged but missing visit ID for tracking.",
                });
                return;
            }

            const trackingRes = await fetch(trackingUrl, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    visit_id: visitLogResponse.id
                })
            });

            if (!trackingRes.ok) {
                throw new Error(`Failed to log visit tracking.`);
            }

            // Final success message (closes loading)
            message.success({
                key: "processing",
                content: "Process Complete! Visit and tracking logged.",
            });

        } catch (err: any) {
            message.error({
                key: "processing",
                content: `Error: ${err.message}`,
            });
        }
    };

    useEffect(() => {
        if (!scannedIdNumber) return;

        if (scannedIdNumber === prevIdRef.current) return; // same card, skip

        const delay = setTimeout(() => {
            fetchVisitorLog();
            prevIdRef.current = scannedIdNumber;
            setScannedIdNumber("");
        }, 700);

        return () => clearTimeout(delay);
    }, [scannedIdNumber]);

    return (
        <FullScreen handle={fullScreenHandle}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-5 p-2 md:p-10 bg-white">
                {/* Info section */}
                <div className="flex justify-center items-center flex-col gap-5 text-center px-5 w-full md:w-1/2">
                    <img src={qjmmd} className="w-32 md:w-44" alt="QUEZON CITY JAIL LOGO" />
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="uppercase font-bold text-xl md:text-3xl">
                            Visitor Check In / Check Out
                        </h1>
                        <div className="text-sm md:text-base text-gray-600">
                            <Clock />
                        </div>
                        <div className="mt-5">
                            <h1 className=" font-bold text-xl text-orange-500 md:text-2xl">
                                Hold your RFID Card near the Reader
                            </h1>
                        </div>
                        <img src={rfid} className="w-52" alt="RFID" />
                    </div>
                    <div className="w-full justify-normal flex items-center gap-4 px-20">
                        <span className='min-w-fit'>Device ID:</span>
                        <Select
                            loading={deviceLoading}
                            value={selectedDeviceId}
                            className='h-10 w-full'
                            options={rfidDevices.map((device: { device_name: any; id: any; }) => ({
                                label: device?.device_name,
                                value: device?.id
                            }))}
                            onChange={value => {
                                setSelectedDeviceId(value)
                            }}
                        />
                    </div>
                    <div>
                        <Input
                            ref={inputRef}
                            autoFocus
                            value={scannedIdNumber}
                            onChange={e => handleRFIDScan(e.target.value)}
                        />
                    </div>
                </div>

                {/* Image section */}
                <div className="flex justify-center flex-col items-center gap-1 w-full md:w-1/2">
                    <div className='w-full flex items-center justify-center'>
                        {
                            scannedVisitor?.visitor_app_status && (
                                <div className="flex items-center justify-center gap-5">
                                    <h1 className="font-bold text-2xl text-green-700">{scannedVisitor?.visitor_app_status}</h1>
                                    {scannedVisitor?.visitor_app_status === "Verified" ? (
                                        <img src={check} className="w-10" alt="Check" />
                                    ) : (
                                        <img src={close} className="w-10" alt="Close" />
                                    )}
                                </div>
                            )
                        }
                    </div>
                    <VisitorProfilePortrait visitorData={scannedVisitor} />
                </div>
            </div>
        </FullScreen>
    )
}

export default Rfid