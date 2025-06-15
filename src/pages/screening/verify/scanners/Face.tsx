/* eslint-disable @typescript-eslint/no-explicit-any */
import { captureFace, verifyFace } from '@/lib/scanner-queries'
import { useMutation } from '@tanstack/react-query'
import { message, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import check from "@/assets/Icons/check-mark.png"
import ex from "@/assets/Icons/close.png"
import { useTokenStore } from '@/store/useTokenStore'
import { BASE_URL } from '@/lib/urls'
import { Device } from '@/lib/definitions'
import { verifyFaceInWatchlist } from '@/lib/threatQueries'
import VisitorProfilePortrait from '../../VisitorProfilePortrait'
import PdlProfilePortrait from '../../PdlProfilePortrait'
import { useSystemSettingsStore } from '@/store/useSystemSettingStore'
import WatchlistMatchAlert from '@/pages/visitor_management/visitor-data-entry/WatchlistMatchAlert'

type Props = {
  devices: Device[];
  deviceLoading: boolean;
  selectedArea: string;
}

const Face = ({ devices, deviceLoading, selectedArea }: Props) => {
  const [icao, setIcao] = useState("")
  const [verificationPayload, setVerificationPayload] = useState({ template: '', type: 'face' })
  // const [verificationResult, setVerificationResult] = useState<any | null>(null)

  const [lastScanned, setLastScanned] = useState<any | null>(null);
  const [lastScannedPdl, setLastScannedPdl] = useState<any | null>(null);
  const token = useTokenStore()?.token;

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const [inWatchList, setInWatchlist] = useState<string | null>(null)
  const [watchlistData, setWatchlistData] = useState<any | null>(null)
  const [isWatchlistMatchModalOpen, setIsWatchlistMatchModalOpen] = useState(false);

  const allowForce = useSystemSettingsStore(state => state.allowForce)

  useEffect(() => {
    if (!deviceLoading && devices && devices.length > 0) {
      const webcamDevice = devices.find(device =>
        device?.device_name?.toLowerCase().includes("webcam")
      );
      if (webcamDevice) {
        setSelectedDeviceId(webcamDevice.id);
      }
    }
  }, [devices, deviceLoading]);

  const faceRegistrationMutation = useMutation({
    mutationKey: ['capture-face'],
    mutationFn: captureFace,
    onSuccess: (data) => {
      setIcao(data?.images?.icao);
      const payload = { ...verificationPayload, template: data?.images?.icao };
      setVerificationPayload(payload);

      // Automatically run verification after capture
      verifyFaceMutation.mutate(payload);
      verifyFaceInWatchlistMutation.mutate(payload);
    },
    onError: (error) => {
      console.error(error);
    }
  });

  const handleCaptureFace = () => {
    faceRegistrationMutation.mutate(allowForce)
  };

  // Function to process visitor log and make API calls
  const processVisitorLog = async (verificationData: any) => {

    if (!selectedDeviceId) {
      message.warning("Please select a device.");
      return;
    }

    const idNumber = verificationData?.data?.[0]?.biometric?.person_data?.visitor?.id_number;
    const pdlId = verificationData?.data?.[0]?.biometric?.person_data?.pdl?.id

    if (selectedArea !== "PDL Station") {
      if (!idNumber) {
        message.warning("No ID number found.");
        return;
      }
    }

    // Determine URLs based on selectedArea
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
      case "pdl station":
        visitsUrl = `${BASE_URL}/api/visit-logs/pdl-station-visits/`;
        trackingUrl = `${BASE_URL}/api/visit-logs/pdl-station-tracking/`;
        break;
      default:
        message.error("Unknown area. Cannot post visit.");
        return;
    }

    let fetchingMessage: (() => void) | undefined = undefined;
    let processingMessage: (() => void) | undefined = undefined;

    setError(null);

    try {
      let visitorData = verificationData;

      fetchingMessage = message.loading("Fetching person information...", 0);
      // Skip fetch if selectedArea is "pdl station"
      if (selectedArea?.toLowerCase() !== "pdl station") {
        const res = await fetch(`${BASE_URL}/api/visit-logs/visitor-specific/?id_number=${idNumber}`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch visitor.`);
        visitorData = await res.json();
        setLastScanned(visitorData);
      } else {
        const res = await fetch(`${BASE_URL}/api/pdls/pdl/${pdlId}`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch PDL.`);
        visitorData = await res.json();
        setLastScannedPdl(visitorData);
      }

      fetchingMessage?.();
      processingMessage = message.loading("Processing...", 0);

      // Post to visit log endpoint
      const postRes = await fetch(visitsUrl, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          device_id: selectedDeviceId,
          id_number: idNumber,
          binary_data: visitorData?.encrypted_id_number_qr,
          person_id: visitorData?.person?.id || verificationData?.data?.[0]?.biometric?.person_data?.id
        })
      });

      if (!postRes.ok) throw new Error(`Failed to log visit.`);
      const visitLogResponse = await postRes.json();

      // Post to tracking endpoint
      if (visitLogResponse?.id) {
        const trackingRes = await fetch(trackingUrl, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({ visit_id: visitLogResponse.id })
        });

        if (!trackingRes.ok) throw new Error(`Failed to log visit tracking.`);

        processingMessage?.();
        message.success("Visit and tracking logged successfully!");
      } else {
        processingMessage?.();
        message.warning("Visit logged, but tracking failed due to missing visit ID.");
      }

    } catch (err: any) {
      fetchingMessage?.();
      processingMessage?.();
      message.warning("No id number provided.");
      message.error(`Error: ${err.message}`);
      setError(err);
    }
  };

  const verifyFaceMutation = useMutation({
    mutationKey: ['face-verification'],
    mutationFn: verifyFace,
    onMutate: () => {
      message.open({
        key: 'face-verification',
        type: 'loading',
        content: 'Verifying person’s face...',
        duration: 0,
      });
    },
    onSuccess: (data) => {
      message.open({
        key: 'face-verification',
        type: 'info',
        content: 'Match Found',
        duration: 3,
      });
      processVisitorLog(data);
    },
    onError: (error) => {
      console.error("Biometric enrollment failed:", error);
      message.open({
        key: 'face-verification',
        type: 'info',
        content: 'No Matches Found',
        duration: 3,
      });
    },
  });

  const verifyFaceInWatchlistMutation = useMutation({
    mutationKey: ['face-verification'],
    mutationFn: verifyFaceInWatchlist,
    onSuccess: (data) => {
      message.warning({
        // content: `Watchlist: ${data['message']}`,
        content: `This person is found in the Watchlist Database!`,
        duration: 20
      });
      setWatchlistData(data?.data)
      setIsWatchlistMatchModalOpen(true)
      setInWatchlist("Warning: This individual has a match in the watchlist database.")
    },
    onError: (error) => {
      message.info(`Watchlist: ${error.message}`);
    },
  });

  if (error) {
    message.error(`Error: ${error.message}`);
  }

  useEffect(() => {
    if (!inWatchList || !token) return;

    let isCancelled = false;
    const submitIssue = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/issues_v2/issues/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            impact_id: 8,
            impact_level_id: 2,
            issueType: 15,
            issue_category_id: 1,
            issue_status_id: 1,
            issue_type_id: 15,
            recommendedAction: "Cross-Check With Watchlists and Prior Incidents: Look for related entries or historical patterns.",
            risk_level_id: 2,
            risks: 7,
            status_id: 1
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (!isCancelled) {
            message.error(`Error submitting issue: ${JSON.stringify(errorData) || 'Unknown error'}`);
          }
          return;
        }

        if (!isCancelled) {
          message.success('Issue successfully submitted!');
        }
      } catch (error) {
        if (!isCancelled) {
          message.error(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };

    submitIssue();

    return () => {
      isCancelled = true;
    };
  }, [inWatchList, token]);

  return (
    <div>
      <Modal
        centered
        open={isWatchlistMatchModalOpen}
        onCancel={() => setIsWatchlistMatchModalOpen(false)}
        onClose={() => setIsWatchlistMatchModalOpen(false)}
        footer={[]}
        width={"70%"}
      >
        <WatchlistMatchAlert
          icao={icao}
          watchlistData={watchlistData}
        />
      </Modal >
      <div className="flex">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full flex items-center justify-center">
            <img
              src={icao ? `data:image/bmp;base64,${icao}` :
                "https://i2.wp.com/vdostavka.ru/wp-content/uploads/2019/05/no-avatar.png?fit=512%2C512&ssl=1"}
              className="w-[50%]"
            />
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-1 mt-1 p-4">
            <div className="w-[50%] bg-blue-500 text-white font-semibold px-3 py-1.5 rounded flex justify-center items-center">
              <button onClick={handleCaptureFace}>Capture Face</button>
            </div>
          </div>

          <div className="w-full flex gap-3 items-center justify-center">
            <span className="font-semibold">DEVICE ID:</span>
            <Select
              loading={deviceLoading}
              showSearch
              optionFilterProp="label"
              className="h-10 w-72"
              options={devices
                ?.filter(device => device?.device_name?.toLowerCase().includes("webcam"))
                .map(device => ({
                  label: device?.device_name,
                  value: device?.id
                }))
              }
              value={selectedDeviceId || undefined}
              onChange={value => {
                setSelectedDeviceId(value)
              }}
              placeholder="Select a device"
            />
          </div>
        </div>

        <div className='flex-1'>
          {
            selectedArea?.toLowerCase() === "pdl station" ? (
              <div className="flex-1">
                <PdlProfilePortrait visitorData={lastScannedPdl} />
              </div>
            ) : (
              <div className='flex-1'>
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
            )
          }
        </div>

      </div>
    </div>
  )
}

export default Face