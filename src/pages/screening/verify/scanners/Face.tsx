/* eslint-disable @typescript-eslint/no-explicit-any */
import { captureFace, verifyFace } from '@/lib/scanner-queries'
import { useMutation } from '@tanstack/react-query'
import { message, Select } from 'antd'
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
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [inWatchList, setInWatchlist] = useState<string | null>(null)

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

    setIsFetching(true);
    setError(null);

    try {
      let visitorData = verificationData;

      // Skip fetch if selectedArea is "pdl station"
      if (selectedArea?.toLowerCase() !== "pdl station") {
        const res = await fetch(`${BASE_URL}/api/visit-logs/visitor-specific/?id_number=${idNumber}`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch visitor. Status: ${res.status}`);
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

        if (!res.ok) throw new Error(`Failed to fetch PDL. Status: ${res.status}`);
        visitorData = await res.json();

        setLastScannedPdl(visitorData);
      }

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

      if (!postRes.ok) throw new Error(`Failed to log visit. Status: ${postRes.status}`);

      const visitLogResponse = await postRes.json();
      message.success("Visit logged successfully!");

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

        if (!trackingRes.ok) throw new Error(`Failed to log visit tracking. Status: ${trackingRes.status}`);

        message.success("Visit tracking created successfully!");
        message.success("Process Complete!");
      } else {
        message.warning("Missing visit ID for tracking");
      }

    } catch (err: any) {
      message.warning("No id number provided.");
      message.error(`Error: ${err.message}`);
      setError(err);
    } finally {
      setIsFetching(false);
    }
  };

  const verifyFaceMutation = useMutation({
    mutationKey: ['face-verification'],
    mutationFn: verifyFace,
    onSuccess: (data) => {
      // setVerificationResult(data);
      message.info("Match Found");
      // Process visitor log after successful verification
      processVisitorLog(data);
      // setVerificationResult(data)
    },
    onError: (error) => {
      console.error("Biometric enrollment failed:", error);
      // setVerificationResult((prev: any) => ({ ...prev, status: "match_not_found" }));
      message.info("No Matches Found");
    },
  });

  const verifyFaceInWatchlistMutation = useMutation({
    mutationKey: ['face-verification'],
    mutationFn: verifyFaceInWatchlist,
    onSuccess: (data) => {
      message.warning({
        content: `Watchlist: ${data['message']}`,
        duration: 20
      });
      setInWatchlist("Warning: This individual has a match in the watchlist database.")
    },
    onError: (error) => {
      message.info(`Watchlist: ${error.message}`);
    },
  });

  if (isFetching) {
    message.info("Processing scan...");
  }

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