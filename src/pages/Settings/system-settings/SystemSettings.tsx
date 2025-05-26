import { getSystemSettings, patchSystemSettings } from "@/lib/system-settings-queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Skeleton, message } from "antd";
import { useEffect, useState } from "react";

const SystemSettings = () => {
    const token = useTokenStore((state) => state.token);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: systemSettings, isLoading: loadingSettings } = useQuery({
        queryKey: ["systemSettings"],
        queryFn: () => getSystemSettings(token ?? ""),
    });

    const [fingerprintTimeout, setFingerprintTimeout] = useState("");
    const [irisTimeout, setIrisTimeout] = useState("");
    const [logInterval, setLogInterval] = useState("");

    const [fingerprintId, setFingerprintId] = useState<number | null>(null);
    const [irisId, setIrisId] = useState<number | null>(null);
    const [logId, setLogId] = useState<number | null>(null);

    // Update local state when data is loaded
    useEffect(() => {
        if (systemSettings?.results) {
            const fingerprintSetting = systemSettings.results.find(
                (setting) => setting.key === "finger_capture_timeout"
            );
            const irisSetting = systemSettings.results.find(
                (setting) => setting.key === "iris_capture_timeout"
            );
            const logSetting = systemSettings.results.find(
                (setting) => setting.key === "log_refetch_interval"
            );

            setFingerprintTimeout(fingerprintSetting?.value ?? "");
            setIrisTimeout(irisSetting?.value ?? "");
            setLogInterval(logSetting?.value ?? "");

            // Store IDs for patching
            setFingerprintId(fingerprintSetting?.id ?? null);
            setIrisId(irisSetting?.id ?? null);
            setLogId(logSetting?.id ?? null);
        }
    }, [systemSettings]);

    const handleScannerSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (fingerprintId !== null) {
                await patchSystemSettings(token ?? "", fingerprintId,
                    { key: "finger_capture_timeout", value: fingerprintTimeout }
                );
            }
            if (irisId !== null) {
                await patchSystemSettings(token ?? "", irisId,
                    { key: "iris_capture_timeout", value: irisTimeout }
                );
            }
            message.success("Scanner settings updated successfully!");
        } catch (error) {
            message.error("Failed to update scanner settings");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (logId !== null) {
                await patchSystemSettings(token ?? "", logId,
                    { key: "log_refetch_interval", value: logInterval }
                );
            }
            message.success("Log settings updated successfully!");
        } catch (error) {
            message.error("Failed to update log settings");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingSettings) {
        return (
            <div className="mt-1 h-full w-full bg-white">
                <Skeleton.Input active size="large" style={{ width: 200, marginBottom: 16 }} />

                <div className="w-full flex gap-10">
                    <div className="flex-1 flex flex-col gap-2 max-w-[30rem] shadow-allSide mt-2 rounded-md bg-white p-4 pb-20 relative">
                        <Skeleton.Input active size="default" style={{ width: 150, marginBottom: 16 }} />

                        <div className="flex flex-col gap-2">
                            <Skeleton.Input active size="small" style={{ width: 250 }} />
                            <div className="flex items-center gap-2">
                                <Skeleton.Input active size="default" style={{ width: 200 }} />
                                <Skeleton.Input active size="small" style={{ width: 80 }} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <Skeleton.Input active size="small" style={{ width: 200 }} />
                            <div className="flex items-center gap-2">
                                <Skeleton.Input active size="default" style={{ width: 200 }} />
                                <Skeleton.Input active size="small" style={{ width: 80 }} />
                            </div>
                        </div>

                        <div className="w-full flex justify-end absolute bottom-4 right-4">
                            <Skeleton.Button active size="default" />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2 max-w-[30rem] shadow-allSide mt-2 rounded-md bg-white pb-20 relative p-4">
                        <Skeleton.Input active size="default" style={{ width: 120, marginBottom: 16 }} />

                        <div className="flex flex-col gap-2">
                            <Skeleton.Input active size="small" style={{ width: 180 }} />
                            <div className="flex items-center gap-2">
                                <Skeleton.Input active size="default" style={{ width: 200 }} />
                                <Skeleton.Input active size="small" style={{ width: 80 }} />
                            </div>
                        </div>

                        <div className="w-full flex justify-end absolute bottom-4 right-4">
                            <Skeleton.Button active size="default" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-1 h-full w-full bg-white">
            <h1 className="text-xl font-semibold">System Settings</h1>

            <div className="w-full flex gap-10">
                <div className="flex-1 flex flex-col gap-2 max-w-[30rem] shadow-allSide mt-2 rounded-md bg-white p-4 pb-20 relative">
                    <h2 className="font-semibold text-lg">Scanner Settings</h2>
                    <div className="flex flex-col gap-2">
                        <span>Fingerprint Scanner Capture Timeout:</span>
                        <span className="flex items-center gap-2">
                            <Input
                                value={fingerprintTimeout}
                                onChange={(e) => setFingerprintTimeout(e.target.value)}
                                className="flex-1"
                                type="number"
                            />
                            <span className="flex-1">in seconds</span>
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span>Iris Scanner Capture Timeout:</span>
                        <span className="flex items-center gap-2">
                            <Input
                                value={irisTimeout}
                                onChange={(e) => setIrisTimeout(e.target.value)}
                                className="flex-1"
                                type="number"
                            />
                            <span className="flex-1">in seconds</span>
                        </span>
                    </div>

                    <div className="w-full flex justify-end absolute bottom-4 right-4">
                        <Button
                            type="primary"
                            onClick={handleScannerSubmit}
                            loading={isSubmitting}
                        >
                            Submit
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 max-w-[30rem] shadow-allSide mt-2 rounded-md bg-white pb-20 relative p-4">
                    <h2 className="font-semibold text-lg">Log Settings</h2>
                    <div className="flex flex-col gap-2">
                        <span>Log Refetch Interval:</span>
                        <span className="flex items-center gap-2">
                            <Input
                                value={logInterval}
                                onChange={(e) => setLogInterval(e.target.value)}
                                className="flex-1"
                                type="number"
                            />
                            <span className="flex-1">in seconds</span>
                        </span>
                    </div>
                    <div className="w-full flex justify-end absolute bottom-4 right-4">
                        <Button
                            type="primary"
                            onClick={handleLogSubmit}
                            loading={isSubmitting}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;