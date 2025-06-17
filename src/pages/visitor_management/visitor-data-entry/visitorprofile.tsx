/* eslint-disable @typescript-eslint/no-explicit-any */
import { BiometricRecordFace, CustomFingerResponse, FaceVerificationResponse } from "@/lib/scanner-definitions";
import { captureFace, getIrisScannerInfo, uninitIrisScanner, captureIris, captureFingerprints, uninitScanner, getScannerInfo, verifyIris, verifyFingerprint, verifyFace, } from "@/lib/scanner-queries";
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IoIosCamera } from "react-icons/io";
import { RiFullscreenLine } from "react-icons/ri";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { message, Modal, Spin, Upload, UploadProps } from "antd"
import CustomWebCam from "@/components/WebcamCapture"
import WebcamFullBody from "@/components/WebcamFullBody";
import { PersonForm } from "@/lib/visitorFormDefinition";
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { verifyFaceInWatchlist } from "@/lib/threatQueries";
import { Signature } from "./Signature";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useSystemSettingsStore } from "@/store/useSystemSettingStore";
import { EnrolledBiometrics } from "../edit-visitor/EditVisitor";
import WatchlistMatchAlert from "./WatchlistMatchAlert";
import { PiShieldWarningFill } from "react-icons/pi";

type Props = {
    setEnrolledBiometrics?: Dispatch<SetStateAction<EnrolledBiometrics>>;
    visitorToEdit?: any;
    inputGender: string;
    setPersonForm: Dispatch<SetStateAction<PersonForm>>;
    icao: string;
    setIcao: Dispatch<SetStateAction<string>>;
    setEnrollFormFace: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollFormLeftIris: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollFormRightIris: Dispatch<SetStateAction<BiometricRecordFace>>;
    enrollFormLeftIris: BiometricRecordFace;
    enrollFormRightIris: BiometricRecordFace;
    setEnrollLeftLittleFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollLeftRingFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollLeftMiddleFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollLeftIndexFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollRightLittleFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollRightRingFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollRightMiddleFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollRightIndexFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollLeftThumbFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
    setEnrollRightThumbFinger: Dispatch<SetStateAction<BiometricRecordFace>>;
}

const { Dragger } = Upload;

const VisitorProfile = ({
    icao,
    setIcao,
    setPersonForm,
    setEnrollLeftIndexFinger,
    setEnrollLeftLittleFinger,
    setEnrollLeftMiddleFinger,
    setEnrollLeftRingFinger,
    setEnrollLeftThumbFinger,
    setEnrollRightIndexFinger,
    setEnrollRightLittleFinger,
    setEnrollRightMiddleFinger,
    setEnrollRightRingFinger,
    setEnrollRightThumbFinger,
    setEnrollFormRightIris,
    setEnrollFormLeftIris,
    enrollFormLeftIris,
    enrollFormRightIris,
    setEnrollFormFace,
    visitorToEdit,
    inputGender,
    setEnrolledBiometrics
}: Props) => {
    const token = useTokenStore()?.token;
    const faceHandle = useFullScreenHandle();
    const irisHandle = useFullScreenHandle();
    const leftFingersHandle = useFullScreenHandle();
    const rightFingersHandle = useFullScreenHandle();
    const thumbFingersHandle = useFullScreenHandle();
    const fullBodyHandle = useFullScreenHandle();
    const frontViewHandle = useFullScreenHandle();
    const leftViewHandle = useFullScreenHandle();
    const rightViewHandle = useFullScreenHandle();
    const [cameraModalOpen, setCameraModalOpen] = useState(false)
    const [cameraFullBodyModalOpen, setCameraFullBodyModalOpen] = useState(false)
    const [cameraLeftModalOpen, setCameraLeftModalOpen] = useState(false)
    const [cameraRightModalOpen, setCameraRightModalOpen] = useState(false)
    const [image, setImage] = useState<string | null>(null);
    const [imageFullBody, setImageFullBody] = useState<string | null>(null);
    const [imageLeftSide, setImageLeftSide] = useState<string | null>(null);
    const [imageRightSide, setImageRightSide] = useState<string | null>(null);
    const [webcamKey, setWebcamKey] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWatchlistMatchModalOpen, setIsWatchlistMatchModalOpen] = useState(false);

    const [watchlistData, setWatchlistData] = useState<any | null>(null)

    const { fingerScannerTimeout, irisScannerTimeout, nfiqQuality, allowForce } = useSystemSettingsStore()

    const handleOpenPad = () => setIsModalOpen(true);
    const handleClosePad = () => setIsModalOpen(false);

    const handleSaveDrawing = (dataUrl: string) => {
        setPreviewUrl(dataUrl);
        setIsModalOpen(false);
    };

    const captureLeftFingersPayload = {
        TimeOut: +fingerScannerTimeout || 60,
        Slap: 0,
        FingerPosition: {
            LEFT_LITTLE: false,
            LEFT_RING: false,
            LEFT_MIDDLE: false,
            LEFT_INDEX: false,
            RIGHT_INDEX: true,
            RIGHT_MIDDLE: true,
            RIGHT_RING: true,
            RIGHT_LITTLE: true,
            LEFT_THUMB: true,
            RIGHT_THUMB: true,
        },
        NFIQ_Quality: +nfiqQuality || 20
    }

    const captureRightFingersPayload = {
        TimeOut: +fingerScannerTimeout || 60,
        Slap: 1,
        FingerPosition: {
            LEFT_LITTLE: true,
            LEFT_RING: true,
            LEFT_MIDDLE: true,
            LEFT_INDEX: true,
            RIGHT_INDEX: false,
            RIGHT_MIDDLE: false,
            RIGHT_RING: false,
            RIGHT_LITTLE: false,
            LEFT_THUMB: true,
            RIGHT_THUMB: true,
        },
        NFIQ_Quality: +nfiqQuality || 20
    }

    const captureThumbsPayload = {
        TimeOut: +fingerScannerTimeout || 60,
        Slap: 2,
        FingerPosition: {
            LEFT_LITTLE: true,
            LEFT_RING: true,
            LEFT_MIDDLE: true,
            LEFT_INDEX: true,
            RIGHT_INDEX: true,
            RIGHT_MIDDLE: true,
            RIGHT_RING: true,
            RIGHT_LITTLE: true,
            LEFT_THUMB: false,
            RIGHT_THUMB: false,
        },
        NFIQ_Quality: +nfiqQuality || 20
    }

    const captureIrisPayload = { TimeOut: +irisScannerTimeout || 60, IrisSide: 0 }

    const props: UploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        accept: 'image/*',
        customRequest({ file, onSuccess }) {
            const reader = new FileReader();
            reader.onload = e => {
                setPreviewUrl(e.target?.result as string);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                onSuccess && onSuccess("ok");
            };
            reader.readAsDataURL(file as File);
        },
    };

    const handleClearImage = () => {
        setPreviewUrl(null);
    };

    const handleRetake = () => {
        setImage(null);
        setWebcamKey(prev => prev + 1);
    };

    const handleRetakeFullBody = () => {
        setImageFullBody(null);
        setWebcamKey(prev => prev + 1);
    };

    const handleRetakeLeftSide = () => {
        setImageLeftSide(null);
        setWebcamKey(prev => prev + 1);
    };

    const handleRetakeRightSide = () => {
        setImageRightSide(null);
        setWebcamKey(prev => prev + 1);
    };

    //Face Related States
    const [faceVerificationResponse, setFaceVerificationResponse] = useState<FaceVerificationResponse | null>(null)

    //Iris Related States
    const [irisScannerReady, setIrisScannerReady] = useState(false)
    const [leftIrisVerificationResponse, setLeftIrisVerificationResponse] = useState<any | null>(null)
    const [rightIrisVerificationResponse, setRightIrisVerificationResponse] = useState<any | null>(null)

    //Fingerprint Related States
    const [fingerScanner, setFingerScannerReady] = useState(false)
    const [LeftFingerResponse, setLeftFingerResponse] = useState<CustomFingerResponse | null>(null)
    const [RightFingerResponse, setRightFingerResponse] = useState<CustomFingerResponse | null>(null)
    const [ThumbFingerResponse, setThumbFingerResponse] = useState<CustomFingerResponse | null>(null)

    const addOrUpdateLeftFinger = (newFingerData: any, index: number) => {
        setLeftFingerResponse(prev => {
            const updatedFingers = prev?.CapturedFingers ? [...prev.CapturedFingers] : [];
            updatedFingers[index] = newFingerData;
            return {
                ...prev,
                CapturedFingers: updatedFingers,
                GraphicalPlainBitmap: prev?.GraphicalPlainBitmap ?? "",
            };
        });
    };

    const addOrUpdateRightFinger = (newFingerData: any, index: number) => {
        setRightFingerResponse(prev => {
            const updatedFingers = prev?.CapturedFingers ? [...prev.CapturedFingers] : [];
            updatedFingers[index] = newFingerData;
            return {
                ...prev,
                CapturedFingers: updatedFingers,
                GraphicalPlainBitmap: prev?.GraphicalPlainBitmap ?? "",
            };
        });
    };

    const addOrUpdateThumb = (newFingerData: any, index: number) => {
        setThumbFingerResponse(prev => {
            const updatedFingers = prev?.CapturedFingers ? [...prev.CapturedFingers] : [];
            updatedFingers[index] = newFingerData;
            return {
                ...prev,
                CapturedFingers: updatedFingers,
                GraphicalPlainBitmap: prev?.GraphicalPlainBitmap ?? "",
            };
        });
    };

    useEffect(() => {
        if (!isInWatchlist || !token) return;

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
                    message.open({
                        type: "success",
                        content: "Issue successfully submitted! Go to Issues module to view complete details.",
                        duration: 10
                    })
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
    }, [isInWatchlist, token]);

    useEffect(() => {
        const mediaArray = visitorToEdit?.person?.media ?? [];
        const closeUpImage = mediaArray.find(
            (media: { media_description: string; }) => media?.media_description === "Close-Up Front Picture"
        )?.media_binary;

        const signatureImage = mediaArray.find(
            (media: { media_description: string; }) => media?.media_description === "Signature Picture"
        )?.media_binary;

        const fullBodyImage = mediaArray.find(
            (media: { media_description: string; }) => media?.media_description === "Full-Body Front Picture"
        )?.media_binary;

        const leftsideImage = mediaArray.find(
            (media: { media_description: string; }) => media?.media_description === "Left-Side View Picture"
        )?.media_binary;

        const rightsideImage = mediaArray.find(
            (media: { media_description: string; }) => media?.media_description === "Right-Side View Picture"
        )?.media_binary;

        if (closeUpImage) {
            setImage(`data:image/png;base64,${closeUpImage}`);
        }

        if (signatureImage) {
            setPreviewUrl(`data:image/png;base64,${signatureImage}`);
        }

        if (fullBodyImage) {
            setImageFullBody(`data:image/png;base64,${fullBodyImage}`);
        }

        if (leftsideImage) {
            setImageLeftSide(`data:image/png;base64,${leftsideImage}`);
        }

        if (rightsideImage) {
            setImageRightSide(`data:image/png;base64,${rightsideImage}`);
        }

    }, [visitorToEdit?.person?.media]);

    useEffect(() => {
        const biometricArray = visitorToEdit?.person?.biometrics ?? [];

        const rightIris = biometricArray.find((biometric: { position: string; }) => biometric?.position === "iris_right")?.data
        const leftIris = biometricArray.find((biometric: { position: string; }) => biometric?.position === "iris_left")?.data

        const face = biometricArray.find((biometric: { position: string; }) => biometric?.position === "face")?.data

        const rightLittle = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_right_little")?.data
        const rightRing = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_right_ring")?.data
        const rightMiddle = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_right_middle")?.data
        const rightIndex = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_right_index")?.data
        const rightThumb = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_right_thumb")?.data

        const leftLittle = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_left_little")?.data
        const leftRing = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_left_ring")?.data
        const leftMiddle = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_left_middle")?.data
        const leftIndex = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_left_index")?.data
        const leftThumb = biometricArray.find((biometric: { position: string; }) => biometric?.position === "finger_left_thumb")?.data

        if (rightIris) {
            setEnrollFormRightIris(prev => ({
                ...prev,
                upload_data: rightIris
            }))
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    rightIrisIsEnrolled: true
                }));
            }
        }

        if (leftIris) {
            setEnrollFormLeftIris(prev => ({
                ...prev,
                upload_data: leftIris
            }))
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    leftIrisIsEnrolled: true
                }));
            }
        }

        if (face) {
            setIcao(face)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    faceIsEnrolled: true
                }));
            }
        }

        if (rightLittle) {
            setEnrollRightLittleFinger(prev => ({
                ...prev,
                upload_data: rightLittle
            }))
            addOrUpdateRightFinger({ FingerBitmapStr: rightLittle }, 0)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    rightLittleIsEnrolled: true
                }));
            }
        }

        if (rightRing) {
            setEnrollRightRingFinger(prev => ({
                ...prev,
                upload_data: rightRing
            }))
            addOrUpdateRightFinger({ FingerBitmapStr: rightRing }, 1)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    rightRingIsEnrolled: true
                }));
            }
        }

        if (rightMiddle) {
            setEnrollRightMiddleFinger(prev => ({
                ...prev,
                upload_data: rightMiddle
            }))
            addOrUpdateRightFinger({ FingerBitmapStr: rightMiddle }, 2)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    rightMiddleIsEnrolled: true
                }));
            }
        }

        if (rightIndex) {
            setEnrollRightIndexFinger(prev => ({
                ...prev,
                upload_data: rightIndex
            }))
            addOrUpdateRightFinger({ FingerBitmapStr: rightIndex }, 3)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    rightIndexIsEnrolled: true
                }));
            }
        }

        if (rightThumb) {
            setEnrollRightThumbFinger(prev => ({
                ...prev,
                upload_data: rightThumb
            }))
            addOrUpdateThumb({ FingerBitmapStr: rightThumb }, 1)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    rightThumbIsEnrolled: true
                }));
            }
        }

        if (leftLittle) {
            setEnrollLeftLittleFinger(prev => ({
                ...prev,
                upload_data: leftLittle
            }))
            addOrUpdateLeftFinger({ FingerBitmapStr: leftLittle }, 0)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    leftLittleIsEnrolled: true
                }));
            }
        }

        if (leftRing) {
            setEnrollLeftRingFinger(prev => ({
                ...prev,
                upload_data: leftRing
            }))
            addOrUpdateLeftFinger({ FingerBitmapStr: leftRing }, 1)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    leftRingIsEnrolled: true
                }));
            }
        }

        if (leftMiddle) {
            setEnrollLeftMiddleFinger(prev => ({
                ...prev,
                upload_data: leftMiddle
            }))
            addOrUpdateLeftFinger({ FingerBitmapStr: leftMiddle }, 2)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    leftMiddleIsEnrolled: true
                }));
            }
        }

        if (leftIndex) {
            setEnrollLeftIndexFinger(prev => ({
                ...prev,
                upload_data: leftIndex
            }))
            addOrUpdateLeftFinger({ FingerBitmapStr: leftIndex }, 3)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    leftIndexIsEnrolled: true
                }));
            }
        }

        if (leftThumb) {
            setEnrollLeftThumbFinger(prev => ({
                ...prev,
                upload_data: leftThumb
            }))
            addOrUpdateThumb({ FingerBitmapStr: leftIndex }, 0)
            if (setEnrolledBiometrics) {
                setEnrolledBiometrics(prev => ({
                    ...prev,
                    leftThumbIsEnrolled: true
                }));
            }
        }

    }, [visitorToEdit?.person?.biometrics])

    // UseEffect to update the enrollment data when LeftFingerResponse or RightFingerResponse changes
    useEffect(() => {
        if (LeftFingerResponse) {
            setEnrollLeftLittleFinger(prev => ({
                ...prev,
                upload_data: LeftFingerResponse.CapturedFingers?.[0]?.FingerBitmapStr ?? "",
            }));

            setEnrollLeftRingFinger(prev => ({
                ...prev,
                upload_data: LeftFingerResponse.CapturedFingers?.[1]?.FingerBitmapStr ?? "",
            }));

            setEnrollLeftMiddleFinger(prev => ({
                ...prev,
                upload_data: LeftFingerResponse.CapturedFingers?.[2]?.FingerBitmapStr ?? "",
            }));

            setEnrollLeftIndexFinger(prev => ({
                ...prev,
                upload_data: LeftFingerResponse.CapturedFingers?.[3]?.FingerBitmapStr ?? "",
            }));
        }

        if (RightFingerResponse) {
            setEnrollRightLittleFinger(prev => ({
                ...prev,
                upload_data: RightFingerResponse.CapturedFingers?.[0]?.FingerBitmapStr ?? "",
            }));

            setEnrollRightRingFinger(prev => ({
                ...prev,
                upload_data: RightFingerResponse.CapturedFingers?.[1]?.FingerBitmapStr ?? "",
            }));

            setEnrollRightMiddleFinger(prev => ({
                ...prev,
                upload_data: RightFingerResponse.CapturedFingers?.[2]?.FingerBitmapStr ?? "",
            }));

            setEnrollRightIndexFinger(prev => ({
                ...prev,
                upload_data: RightFingerResponse.CapturedFingers?.[3]?.FingerBitmapStr ?? "",
            }));
        }

        if (ThumbFingerResponse) {
            // Handle Thumb Responses for Left and Right Thumb
            setEnrollLeftThumbFinger(prev => ({
                ...prev,
                upload_data: ThumbFingerResponse.CapturedFingers?.[0]?.FingerBitmapStr ?? "",
            }));

            setEnrollRightThumbFinger(prev => ({
                ...prev,
                upload_data: ThumbFingerResponse.CapturedFingers?.[1]?.FingerBitmapStr ?? "",
            }));
        }
    }, [LeftFingerResponse, RightFingerResponse, ThumbFingerResponse]);

    const [fingerprintVerificationResult1, setFingerprintVerificationResult1] = useState<any | null>(null)
    const [fingerprintVerificationResult2, setFingerprintVerificationResult2] = useState<any | null>(null)
    const [fingerprintVerificationResult3, setFingerprintVerificationResult3] = useState<any | null>(null)
    const [fingerprintVerificationResult4, setFingerprintVerificationResult4] = useState<any | null>(null)
    const [fingerprintVerificationResult5, setFingerprintVerificationResult5] = useState<any | null>(null)
    const [fingerprintVerificationResult6, setFingerprintVerificationResult6] = useState<any | null>(null)
    const [fingerprintVerificationResult7, setFingerprintVerificationResult7] = useState<any | null>(null)
    const [fingerprintVerificationResult8, setFingerprintVerificationResult8] = useState<any | null>(null)
    const [fingerprintVerificationResult9, setFingerprintVerificationResult9] = useState<any | null>(null)
    const [fingerprintVerificationResult10, setFingerprintVerificationResult10] = useState<any | null>(null)

    //Face Capture Related Functions
    const verifyFaceMutation = useMutation({
        mutationKey: ['biometric-enrollment'],
        mutationFn: verifyFace,
        onSuccess: (data) => {
            setFaceVerificationResponse(data);
            message.info({
                content: "Facial Biometric Match Found in Biometric Database!",
                duration: 5
            });
        },
        onError: (error) => {
            console.error("Biometric enrollment failed:", error);
            setFaceVerificationResponse({ message: "No Matches Found.", data: [] });
            message.info({
                content: `Facial Biometric ${error?.message} in Person Biometric Database!`,
                duration: 5
            });
        },
    });

    const verifyFaceInWatchlistMutation = useMutation({
        mutationKey: ['biometric-verification', 'threat'],
        mutationFn: verifyFaceInWatchlist,
        onSuccess: (data) => {
            message.warning({
                // content: `Watchlist: ${data['message']}`,
                content: `This person is found in the Watchlist Database!`,
                duration: 30
            });
            setWatchlistData(data?.data)
            setIsWatchlistMatchModalOpen(true)
            setIsInWatchlist(true)
        },
        onError: (error) => {
            // message.info(`Watchlist: ${error?.message}`);
            message.info({
                content: `${error?.message} in Watchlist Database!`,
                duration: 5
            });
        },
    });

    const faceRegistrationMutation = useMutation({
        mutationKey: ['visitor-registration'],
        mutationFn: captureFace,
        onSuccess: async (data) => {
            setIcao(data?.images?.icao);
            setEnrollFormFace(prevStates => ({
                ...prevStates,
                upload_data: data?.images?.icao,
            }));
            if (data?.images?.icao) {
                if (data?.images?.gender !== inputGender) {
                    message.warning("The provided gender does not match the gender identified through face recognition.")
                }
                verifyFaceMutation.mutate({ template: data?.images?.icao, type: "face" })
                verifyFaceInWatchlistMutation.mutate({ template: data?.images?.icao, type: "face" })
            } else {
                message.warning("No Face Captured. Please try again")
            }
        },
        onError: (error) => {
            message.error(error.message);
        }
    });


    //Iris Capture Related Functions
    const irisScannerUninitThenInitMutation = useMutation({
        mutationKey: ['iris-scanner-uninit'],
        mutationFn: uninitIrisScanner,
        onSuccess: () => {
            irisScannerInitMutation.mutate();
        },
        onError: (error) => {
            console.error(error.message);
        }
    });

    const irisScannerInitMutation = useMutation({
        mutationKey: ['iris-scanner-init'],
        mutationFn: getIrisScannerInfo,
        onSuccess: () => {
            setIrisScannerReady(true);
            message.info("Iris Scanner Ready")
        },
        onError: (error) => {
            console.error(error.message);
            message.info("Error Initializing Fingerprint Scanner")
        }
    });

    const verifyLeftIrisMutation = useMutation({
        mutationKey: ['left-iris-verification'],
        mutationFn: verifyIris,
        onSuccess: (data) => {
            setLeftIrisVerificationResponse(data)
            message.info(data?.message === "Match found." ? "Match Found" : "No Matches Found");
        },
        onError: () => {
            setLeftIrisVerificationResponse([{ message: "Match not Found." }])
            message.info("Match Not Found");
        },
    });

    const verifyRightIrisMutation = useMutation({
        mutationKey: ['left-iris-verification'],
        mutationFn: verifyIris,
        onSuccess: (data) => {
            setRightIrisVerificationResponse(data)
            message.info(data?.message === "Match found." ? "Match Found" : "No Matches Found");
        },
        onError: () => {
            setRightIrisVerificationResponse([{ message: "Match not Found." }])
            message.info("Match Not Found");
        },
    });


    const handleVerifyIris = (leftIris: string | null, rightIris: string | null) => {
        if (!leftIris && !rightIris) {
            message.warning("At least one iris sample must be provided.");
            return;
        }

        if (leftIris) {
            verifyLeftIrisMutation.mutate({ template: leftIris, type: "iris" });
        }

        if (rightIris) {
            verifyRightIrisMutation.mutate({ template: rightIris, type: "iris" });
        }
    };

    const irisScannerCaptureMutation = useMutation({
        mutationKey: ['finger-scanner-init'],
        mutationFn: () => captureIris(captureIrisPayload),
        onSuccess: (data) => {
            if (data?.ErrorDescription === "Device not initialized.") {
                message.error(data?.ErrorDescription)
                return
            }

            setEnrollFormLeftIris(prev => ({
                ...prev,
                upload_data: data.ImgDataLeft
            }))
            setEnrollFormRightIris(prev => ({
                ...prev,
                upload_data: data.ImgDataRight
            }))
            handleVerifyIris(data?.ImgDataLeft, data?.ImgDataRight)
        },
        onError: (error) => {
            console.error(error.message);
            irisScannerUninitThenInitMutation.mutate()
        }
    });


    //Fingerprint Capture Related Functions
    const fingerScannerUninitThenInitMutation = useMutation({
        mutationKey: ['finger-scanner-uninit'],
        mutationFn: uninitScanner,
        onSuccess: () => {
            fingerScannerInitMutation.mutate();
        },
        onError: (error) => {
            console.error(error.message);
            fingerScannerInitMutation.mutate();
        }
    });

    const fingerScannerInitMutation = useMutation({
        mutationKey: ['finger-scanner-init'],
        mutationFn: getScannerInfo,
        onSuccess: () => {
            setFingerScannerReady(true);
            message.info("Fingerprint Scanner Ready")
        },
        onError: (error) => {
            console.error(error.message);
            message.info("Error Initializing Fingerprint Scanner")
        }
    });

    const verifyFingerprintMutation1 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult1(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult1({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult1({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation2 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult2(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult2({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult2({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation3 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult3(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult3({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult3({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation4 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult4(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult4({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult4({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation5 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult5(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult5({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult5({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation6 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult6(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult6({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult6({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation7 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult7(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult7({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult7({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation8 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult8(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult8({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult8({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation9 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult9(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult9({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult9({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const verifyFingerprintMutation10 = useMutation({
        mutationKey: ['fingerprint-verification'],
        mutationFn: verifyFingerprint,
        onSuccess: (data) => {
            setFingerprintVerificationResult10(data);
            message.info("Match Found");
        },
        onError: (error) => {
            if (error?.message === "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated") {
                setFingerprintVerificationResult10({ message: error.message });
                message.error("Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated");
            } else {
                setFingerprintVerificationResult10({ message: "Match not found." });
                message.info(`${error?.message}: Match Not Found.`);
            }
        },
    });

    const handleThumbFingers = (img0: string | null, img1: string | null) => {
        if (!img0 && !img1) {
            message.info("Fingerprint samples cannot be empty. Please try again.");
            return;
        }

        if (img0) {
            verifyFingerprintMutation1.mutate({ template: img0, type: "fingerprint" });
        }

        if (img1) {
            verifyFingerprintMutation6.mutate({ template: img1, type: "fingerprint" });
        }
    };

    const handleVerifyRightFingers = (
        img0: string | null,
        img1: string | null,
        img2: string | null,
        img3: string | null
    ) => {
        if (!img0 && !img1 && !img2 && !img3) {
            message.info("Fingerprint samples cannot be empty. Please try again.");
            return;
        }

        if (img0) verifyFingerprintMutation7.mutate({ template: img0, type: "fingerprint" });
        if (img1) verifyFingerprintMutation8.mutate({ template: img1, type: "fingerprint" });
        if (img2) verifyFingerprintMutation9.mutate({ template: img2, type: "fingerprint" });
        if (img3) verifyFingerprintMutation10.mutate({ template: img3, type: "fingerprint" });
    };

    const handleVerifyLeftFingers = (
        img0: string | null,
        img1: string | null,
        img2: string | null,
        img3: string | null
    ) => {
        if (!img0 && !img1 && !img2 && !img3) {
            message.info("Fingerprint samples cannot be empty. Please try again.");
            return;
        }

        if (img0) verifyFingerprintMutation2.mutate({ template: img0, type: "fingerprint" });
        if (img1) verifyFingerprintMutation3.mutate({ template: img1, type: "fingerprint" });
        if (img2) verifyFingerprintMutation4.mutate({ template: img2, type: "fingerprint" });
        if (img3) verifyFingerprintMutation5.mutate({ template: img3, type: "fingerprint" });
    };

    const fingerScannerCaptureLeftMutation = useMutation({
        mutationKey: ['finger-scanner-init'],
        mutationFn: () => captureFingerprints(captureLeftFingersPayload),
        onSuccess: (data) => {
            if (data?.ErrorDescription === "Device not connected.") {
                message.error(data?.ErrorDescription)
            }

            setLeftFingerResponse(prev => ({
                ...prev,
                CapturedFingers: data?.CaptureData?.CapturedFingers,
                GraphicalPlainBitmap: data?.CaptureData?.GraphicalPlainBitmap
            }))
            handleVerifyLeftFingers(
                data?.CaptureData?.CapturedFingers?.[0]?.FingerBitmapStr,
                data?.CaptureData?.CapturedFingers?.[1]?.FingerBitmapStr,
                data?.CaptureData?.CapturedFingers?.[2]?.FingerBitmapStr,
                data?.CaptureData?.CapturedFingers?.[3]?.FingerBitmapStr,
            )
        },
        onError: (error) => {
            message.error(error.message)
            console.error(error.message);
        }
    });

    const fingerScannerCaptureRightMutation = useMutation({
        mutationKey: ['finger-scanner-init'],
        mutationFn: () => captureFingerprints(captureRightFingersPayload),
        onSuccess: (data) => {
            if (data?.ErrorDescription === "Device not connected.") {
                message.error(data?.ErrorDescription)
            }

            setRightFingerResponse(prev => ({
                ...prev,
                CapturedFingers: data?.CaptureData?.CapturedFingers,
                GraphicalPlainBitmap: data?.CaptureData?.GraphicalPlainBitmap
            }))
            handleVerifyRightFingers(
                data?.CaptureData?.CapturedFingers?.[0]?.FingerBitmapStr,
                data?.CaptureData?.CapturedFingers?.[1]?.FingerBitmapStr,
                data?.CaptureData?.CapturedFingers?.[2]?.FingerBitmapStr,
                data?.CaptureData?.CapturedFingers?.[3]?.FingerBitmapStr,
            )

        },
        onError: (error) => {
            console.error(error.message);
        }
    });

    const fingerScannerCaptureThumbMutation = useMutation({
        mutationKey: ['finger-scanner-init'],
        mutationFn: () => captureFingerprints(captureThumbsPayload),
        onSuccess: (data) => {
            if (data?.ErrorDescription === "Device not connected.") {
                message.error(data?.ErrorDescription)
            }

            setThumbFingerResponse(prev => ({
                ...prev,
                CapturedFingers: data?.CaptureData?.CapturedFingers,
                GraphicalPlainBitmap: data?.CaptureData?.GraphicalPlainBitmap
            }))
            handleThumbFingers(
                data?.CaptureData?.CapturedFingers?.[0]?.FingerBitmapStr,
                data?.CaptureData?.CapturedFingers?.[1]?.FingerBitmapStr
            )
        },
        onError: (error) => {
            console.error(error.message);
        }
    });


    useEffect(() => {
        setPersonForm((prev) => {
            const updatedMediaData = [
                ...(prev.media_data || []).filter(
                    (media) =>
                        !["Close-Up Front Picture", "Full-Body Front Picture", "Left-Side View Picture", "Right-Side View Picture", "Signature Picture"].includes(
                            media.media_description || ""
                        )
                ),
            ];

            if (image) {
                updatedMediaData.push({
                    media_type: "Picture",
                    media_base64: image.replace(/^data:image\/\w+;base64,/, ""),
                    media_description: "Close-Up Front Picture",
                    picture_view: "Front",
                    record_status_id: 1,
                });
            }

            if (imageFullBody) {
                updatedMediaData.push({
                    media_type: "Picture",
                    media_base64: imageFullBody.replace(/^data:image\/\w+;base64,/, ""),
                    media_description: "Full-Body Front Picture",
                    picture_view: "Front",
                    record_status_id: 1,
                });
            }

            if (imageLeftSide) {
                updatedMediaData.push({
                    media_type: "Picture",
                    media_base64: imageLeftSide.replace(/^data:image\/\w+;base64,/, ""),
                    media_description: "Left-Side View Picture",
                    picture_view: "Left",
                    record_status_id: 1,
                });
            }

            if (imageRightSide) {
                updatedMediaData.push({
                    media_type: "Picture",
                    media_base64: imageRightSide.replace(/^data:image\/\w+;base64,/, ""),
                    media_description: "Right-Side View Picture",
                    picture_view: "Right",
                    record_status_id: 1,
                });
            }

            if (previewUrl) {
                updatedMediaData.push({
                    media_type: "Picture",
                    media_base64: previewUrl.replace(/^data:image\/\w+;base64,/, ""),
                    media_description: "Signature Picture",
                    record_status_id: 1,
                });
            }

            return {
                ...prev,
                media_data: updatedMediaData,
            };
        });
    }, [image, imageFullBody, imageLeftSide, imageRightSide, previewUrl]);


    useEffect(() => {
        irisScannerUninitThenInitMutation.mutate()
        fingerScannerUninitThenInitMutation.mutate()
    }, [])

    // console.log(visitorToEdit)

    return (
        <div className="w-full mt-5">
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
            <Modal
                open={cameraModalOpen}
                onCancel={() => setCameraModalOpen(false)}
                footer={[]}
                width={"50%"}
            >
                <div className="w-full flex flex-col mt-8 rounded">
                    <CustomWebCam key={webcamKey} onCapture={setImage} setCameraModalOpen={setCameraModalOpen} />
                </div>
            </Modal>
            <Modal
                open={cameraFullBodyModalOpen}
                onCancel={() => setCameraFullBodyModalOpen(false)}
                footer={[]}
                width={"50%"}
            >
                <div className="w-full flex flex-col mt-8 rounded">
                    <WebcamFullBody key={webcamKey} onCapture={setImageFullBody} setCameraModalOpen={setCameraFullBodyModalOpen} />
                </div>
            </Modal>
            <Modal
                open={cameraLeftModalOpen}
                onCancel={() => setCameraLeftModalOpen(false)}
                footer={[]}
                width={"50%"}
            >
                <div className="w-full flex flex-col mt-8 rounded">
                    <CustomWebCam key={webcamKey} onCapture={setImageLeftSide} setCameraModalOpen={setCameraLeftModalOpen} />
                </div>
            </Modal>
            <Modal
                open={cameraRightModalOpen}
                onCancel={() => setCameraRightModalOpen(false)}
                footer={[]}
                width={"50%"}
            >
                <div className="w-full flex flex-col mt-8 rounded">
                    <CustomWebCam key={webcamKey} onCapture={setImageRightSide} setCameraModalOpen={setCameraRightModalOpen} />
                </div>
            </Modal>
            <h1 className="font-extrabold text-2xl">Biometric Capture</h1>
            <div className="w-full border mt-5 border-gray-200 rounded-md">
                <div className="flex flex-col lg:flex-row text-gray-700 p-5 gap-5">
                    {/* Full Body */}
                    <div className="flex-grow w-full lg:w-[22rem]">
                        <div className="border border-gray-200 bg-gray-100 flex justify-center items-end w-full rounded-md min-h-[44rem] relative overflow-hidden">
                            {
                                imageFullBody && (
                                    <FullScreen handle={fullBodyHandle}>
                                        <img
                                            src={imageFullBody}
                                            alt="front-view image"
                                            className="w-full h-full"
                                        />
                                    </FullScreen>
                                )
                            }
                            <div className="flex justify-center items-center gap-10 py-2 absolute bottom-0 bg-white/70 w-full">
                                <button
                                    onClick={() => {
                                        setCameraFullBodyModalOpen(true)
                                        handleRetakeFullBody()
                                    }}>
                                    <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                </button>
                                <h1>Full Body - Front</h1>
                                <button onClick={fullBodyHandle.enter}>
                                    <RiFullscreenLine className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-5 w-full md:w-auto">
                        <div className="flex gap-5">
                            <div className="flex gap-5 w-full md:w-auto">
                                {/* FRONT VIEW */}
                                <div className="flex-grow md:w-64">
                                    <div className="border border-gray-200 bg-gray-100 flex justify-center items-end w-full rounded-md min-h-[16.5rem] relative overflow-hidden">
                                        <div className="w-full h-full object-contain overflow-hidden">
                                            {
                                                image && (
                                                    <FullScreen handle={frontViewHandle}>
                                                        <img
                                                            src={image}
                                                            alt="front-view image"
                                                            className="w-full h-full"
                                                        />
                                                    </FullScreen>
                                                )
                                            }
                                        </div>
                                        <div className="flex justify-center items-center gap-10 py-2 absolute bottom-0 bg-white/70 w-full">
                                            <button
                                                onClick={() => {
                                                    setCameraModalOpen(true)
                                                    handleRetake()
                                                }}
                                            >
                                                <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                            <h1>Front View</h1>
                                            <button onClick={frontViewHandle.enter}>
                                                <RiFullscreenLine className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* LEFT-SIDE VIEW */}
                                <div className="flex-grow md:w-64">
                                    <div className=" relative border border-gray-200 bg-gray-100 flex justify-center items-end w-full rounded-md min-h-[16.5rem] overflow-hidden">
                                        {
                                            imageLeftSide && (
                                                <FullScreen handle={leftViewHandle}>
                                                    <img
                                                        src={imageLeftSide}
                                                        alt="front-view image"
                                                        className="w-full h-full"
                                                    />
                                                </FullScreen>
                                            )
                                        }
                                        <div className="flex justify-center items-center gap-10 py-2 absolute bottom-0 bg-white/70 w-full">
                                            <button
                                                onClick={() => {
                                                    setCameraLeftModalOpen(true)
                                                    handleRetakeLeftSide()
                                                }}
                                            >
                                                <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                            <h1>Left-Side View</h1>
                                            <button onClick={leftViewHandle.enter}>
                                                <RiFullscreenLine className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT-SIDE VIEW */}
                                <div className="flex-grow md:w-64">
                                    <div className="border border-gray-200 bg-gray-100 flex justify-center items-end w-full rounded-md min-h-[16.5rem] relative overflow-hidden">
                                        {
                                            imageRightSide && (
                                                <FullScreen handle={rightViewHandle}>
                                                    <img
                                                        src={imageRightSide}
                                                        alt="front-view image"
                                                        className="w-full h-full"
                                                    />
                                                </FullScreen>
                                            )
                                        }
                                        <div className="flex justify-center items-center gap-10 py-2 absolute bottom-0 bg-white/70 w-full">
                                            <button
                                                onClick={() => {
                                                    setCameraRightModalOpen(true)
                                                    handleRetakeRightSide()
                                                }}
                                            >
                                                <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                            <h1>Right-Side View</h1>
                                            <button onClick={rightViewHandle.enter}>
                                                <RiFullscreenLine className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[16.5rem] flex flex-col gap-2 w-full">
                                {/* IRIS VIEWS */}
                                <div className="h-full w-full">
                                    <FullScreen handle={irisHandle} className="h-full flex flex-col gap-2">
                                        {/* Left Iris Box */}
                                        <div className="border border-gray-200 bg-gray-100 w-full flex-1 rounded-md overflow-hidden relative">
                                            {
                                                leftIrisVerificationResponse && enrollFormLeftIris?.upload_data && (
                                                    leftIrisVerificationResponse?.message === "Match found." ?
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p> :
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                )

                                            }
                                            <div className="h-full w-full flex items-center justify-center">
                                                {
                                                    enrollFormLeftIris?.upload_data && (
                                                        <img
                                                            src={`data:image/bmp;base64,${enrollFormLeftIris?.upload_data}`}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    )
                                                }
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full px-2 py-1 ">
                                                <h1>Left Iris</h1>
                                            </div>
                                        </div>

                                        {/* Right Iris Box */}
                                        <div className="border border-gray-200 bg-gray-100 w-full flex-1 rounded-md overflow-hidden relative">
                                            {
                                                rightIrisVerificationResponse && enrollFormRightIris?.upload_data && (
                                                    rightIrisVerificationResponse?.message === "Match found." ?
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p> :
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                )

                                            }
                                            <div className="h-full w-full flex items-center justify-center">
                                                {
                                                    enrollFormRightIris?.upload_data && (
                                                        <img
                                                            src={`data:image/bmp;base64,${enrollFormRightIris?.upload_data}`}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    )
                                                }
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full px-2 py-1 flex justify-between">
                                                <h1>Right Iris</h1>
                                                <div className="flex gap-2 items-center">
                                                    <button onClick={irisHandle.enter}>
                                                        <RiFullscreenLine className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                                    </button>
                                                    <button onClick={() => irisScannerCaptureMutation.mutate()}>
                                                        {
                                                            irisScannerReady ? (
                                                                <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                                            ) : <Spin />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </FullScreen>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            {/* FACIAL RECOGNITION */}
                            <div className="w-[33.2rem] h-[26.5rem]">
                                <div className="relative border border-gray-200 gap-6 flex flex-col items-center w-full rounded-md h-[26.5rem] object-cover">

                                    <div className="w-full h-[90%]">
                                        <FullScreen handle={faceHandle} className="w-full h-full object-scale-down overflow-hidden">
                                            {
                                                faceVerificationResponse && (
                                                    faceVerificationResponse?.message === "No Matches Found." && !isInWatchlist ?
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p> :
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                )

                                            }
                                            {
                                                icao && (
                                                    <img
                                                        src={`data:image/bmp;base64,${icao}`}
                                                        className="w-full h-full object-scale-down"
                                                    />
                                                )
                                            }
                                        </FullScreen>
                                    </div>
                                    <div className="flex w-full justify-center items-center gap-10 py-2 absolute bottom-0 bg-white">
                                        <button onClick={() => faceRegistrationMutation.mutate(allowForce)}>
                                            <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                        </button>
                                        <h1>Facial Recognition</h1>
                                        <button onClick={faceHandle.enter}>
                                            <RiFullscreenLine className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                        </button>
                                    </div>
                                    {
                                        isInWatchlist && (
                                            <button
                                                onClick={() => setIsWatchlistMatchModalOpen(true)}
                                                className="absolute bottom-3 right-2"
                                            >
                                                <PiShieldWarningFill
                                                    size={22}
                                                    fill="orange"
                                                />
                                            </button>
                                        )
                                    }
                                </div>
                            </div>

                            {/* REMARKS */}
                            <div className="flex-grow md:w-[35.2rem]">
                                <div className="border border-gray-200 flex gap-2 py-2 flex-wrap justify-center w-full rounded-md min-h-[26.5rem]">
                                    <FullScreen
                                        className="w-full h-full flex gap-2 px-3 items-center justify-center"
                                        handle={leftFingersHandle}
                                    >
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">LL</p>
                                            {
                                                fingerprintVerificationResult2 &&
                                                LeftFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult2?.message === "Match found." ||
                                                        fingerprintVerificationResult2?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                LeftFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${LeftFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                        </div>
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">LR</p>
                                            {
                                                fingerprintVerificationResult3 &&
                                                LeftFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult3?.message === "Match found." ||
                                                        fingerprintVerificationResult3?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                LeftFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${LeftFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                        </div>
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">LM</p>
                                            {
                                                fingerprintVerificationResult4 &&
                                                LeftFingerResponse?.CapturedFingers?.[2]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult4?.message === "Match found." ||
                                                        fingerprintVerificationResult4?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                LeftFingerResponse?.CapturedFingers?.[2]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${LeftFingerResponse?.CapturedFingers?.[2]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                        </div>
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">LI</p>
                                            {
                                                fingerprintVerificationResult5 &&
                                                LeftFingerResponse?.CapturedFingers?.[3]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult5?.message === "Match found." ||
                                                        fingerprintVerificationResult5?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                LeftFingerResponse?.CapturedFingers?.[3]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${LeftFingerResponse?.CapturedFingers?.[3]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                            <button
                                                onClick={() => fingerScannerCaptureLeftMutation.mutate()}
                                                className="h-4 w-4 text-sm absolute right-1.5 bottom-1"
                                            >
                                                {
                                                    fingerScanner ? (
                                                        <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                                    ) : <Spin />
                                                }
                                            </button>
                                            <button
                                                onClick={leftFingersHandle.enter}
                                                className="h-4 w-4 text-sm absolute right-7 bottom-1"
                                            >
                                                <RiFullscreenLine className="text-lg hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                        </div>
                                    </FullScreen>

                                    <FullScreen
                                        className="w-full h-full flex gap-2 px-3 items-center justify-center"
                                        handle={rightFingersHandle}
                                    >
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">RI</p>
                                            {
                                                fingerprintVerificationResult7 &&
                                                RightFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult7?.message === "Match found." ||
                                                        fingerprintVerificationResult7?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                RightFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${RightFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                        </div>
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">RM</p>
                                            {
                                                fingerprintVerificationResult8 &&
                                                RightFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult8?.message === "Match found." ||
                                                        fingerprintVerificationResult8?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                RightFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${RightFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                        </div>
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">RI</p>
                                            {
                                                fingerprintVerificationResult9 &&
                                                RightFingerResponse?.CapturedFingers?.[2]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult9?.message === "Match found." ||
                                                        fingerprintVerificationResult9?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                RightFingerResponse?.CapturedFingers?.[2]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${RightFingerResponse?.CapturedFingers?.[2]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                        </div>
                                        <div className="w-32 h-32 border rounded-md relative">
                                            <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">RL</p>
                                            {
                                                fingerprintVerificationResult10 &&
                                                RightFingerResponse?.CapturedFingers?.[3]?.FingerBitmapStr && (
                                                    fingerprintVerificationResult10?.message === "Match found." ||
                                                        fingerprintVerificationResult10?.message ===
                                                        "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                        <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                    ) : (
                                                        <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                    )
                                                )
                                            }
                                            {
                                                RightFingerResponse?.CapturedFingers?.[3]?.FingerBitmapStr && (
                                                    <img
                                                        src={`data:image/bmp;base64,${RightFingerResponse?.CapturedFingers?.[3]?.FingerBitmapStr}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                )
                                            }
                                            <button
                                                onClick={() => fingerScannerCaptureRightMutation.mutate()}
                                                className="h-4 w-4 text-sm absolute right-1.5 bottom-1"
                                            >
                                                {
                                                    fingerScanner ? (
                                                        <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                                    ) : <Spin />
                                                }
                                            </button>
                                            <button
                                                onClick={rightFingersHandle.enter}
                                                className="h-4 w-4 text-sm absolute right-7 bottom-1"
                                            >
                                                <RiFullscreenLine className="text-lg hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                            </button>
                                        </div>
                                    </FullScreen>

                                    <div className="flex gap-2 px-3">
                                        <FullScreen
                                            className="h-full flex gap-2 flex-1 items-center justify-center"
                                            handle={thumbFingersHandle}
                                        >
                                            <div className="w-32 h-32 border rounded-md relative">
                                                <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">LT</p>
                                                {
                                                    fingerprintVerificationResult1 &&
                                                    ThumbFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr && (
                                                        fingerprintVerificationResult1?.message === "Match found." ||
                                                            fingerprintVerificationResult1?.message ===
                                                            "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                            <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                        ) : (
                                                            <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                        )
                                                    )
                                                }
                                                {
                                                    ThumbFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr && (
                                                        <img
                                                            src={`data:image/bmp;base64,${ThumbFingerResponse?.CapturedFingers?.[0]?.FingerBitmapStr}`}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    )
                                                }
                                            </div>
                                            <div className="w-32 h-32 border rounded-md relative">
                                                <p className="h-5 w-5 flex items-center justify-center text-sm bg-white absolute font-semibold">RT</p>
                                                {
                                                    fingerprintVerificationResult6 &&
                                                    ThumbFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr && (
                                                        fingerprintVerificationResult6?.message === "Match found." ||
                                                            fingerprintVerificationResult6?.message ===
                                                            "Error identifying fingerprint data. - NBiometricStatus is not OK: operation_not_activated" ? (
                                                            <p className="h-4 w-4 text-sm bg-red-500 absolute right-0"></p>
                                                        ) : (
                                                            <p className="h-4 w-4 text-sm bg-green-500 absolute right-0"></p>
                                                        )
                                                    )
                                                }
                                                {
                                                    ThumbFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr && (
                                                        <img
                                                            src={`data:image/bmp;base64,${ThumbFingerResponse?.CapturedFingers?.[1]?.FingerBitmapStr}`}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    )
                                                }
                                                <button
                                                    onClick={() => fingerScannerCaptureThumbMutation.mutate()}
                                                    className="h-4 w-4 text-sm absolute right-1.5 bottom-1"
                                                >
                                                    {
                                                        fingerScanner ? (
                                                            <IoIosCamera className="text-2xl hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                                        ) : <Spin />
                                                    }
                                                </button>
                                                <button
                                                    onClick={thumbFingersHandle.enter}
                                                    className="h-4 w-4 text-sm absolute right-7 bottom-1"
                                                >
                                                    <RiFullscreenLine className="text-lg hover:scale-125 transition-all ease-in-out hover:text-blue-500" />
                                                </button>
                                            </div>
                                        </FullScreen>

                                        {/* Sample Remarks */}
                                        <div className="flex-1 w-[16.5rem] text-sm h-32 border rounded-md ">
                                            {/* <p className="font-bold">Remarks</p>
                                            <ul className="list-disc text-red-500">
                                                {leftIrisVerificationResponse?.message === "Match found." && <li>Found a match for left iris.</li>}
                                                {rightIrisVerificationResponse?.message === "Match found." && <li>Found a match for right iris.</li>}
                                                {faceVerificationResponse && faceVerificationResponse?.message !== "No Matches Found." && <li>Found a match for face recognition.</li>}
                                                {fingerprintVerificationResult1?.message === "Match found." && <li>Found a match for left thumb fingerprint.</li>}
                                                {fingerprintVerificationResult6?.message === "Match found." && <li>Found a match for right thumb fingerprint.</li>}
                                                {fingerprintVerificationResult2?.message === "Match found." && <li>Found a match for left index fingerprint.</li>}
                                                {fingerprintVerificationResult7?.message === "Match found." && <li>Found a match for right index fingerprint.</li>}
                                                {fingerprintVerificationResult3?.message === "Match found." && <li>Found a match for left middle fingerprint.</li>}
                                                {fingerprintVerificationResult8?.message === "Match found." && <li>Found a match for right middle fingerprint.</li>}
                                                {fingerprintVerificationResult4?.message === "Match found." && <li>Found a match for left ring fingerprint.</li>}
                                                {fingerprintVerificationResult9?.message === "Match found." && <li>Found a match for right ring fingerprint.</li>}
                                                {fingerprintVerificationResult5?.message === "Match found." && <li>Found a match for left little fingerprint.</li>}
                                                {fingerprintVerificationResult10?.message === "Match found." && <li>Found a match for right little fingerprint.</li>}
                                            </ul> */}

                                            {previewUrl ? (
                                                <div className="relative h-full w-full">
                                                    <img src={previewUrl} alt="signature preview" className="h-full w-full object-contain" />
                                                    <div className="absolute top-0 right-0 flex space-x-1">
                                                        <button onClick={handleClearImage} className="bg-gray-100 hover:bg-gray-200 p-1 rounded-full text-gray-600" title="Remove signature">
                                                            <CloseOutlined style={{ fontSize: '12px' }} />
                                                        </button>
                                                        <Upload {...props} className="bg-gray-100 hover:bg-gray-200 p-1 rounded-full text-gray-600">
                                                            <button title="Replace signature">
                                                                <EditOutlined style={{ fontSize: '12px' }} />
                                                            </button>
                                                        </Upload>
                                                        <button onClick={handleOpenPad} className="bg-gray-100 hover:bg-gray-200 p-1 rounded-full text-gray-600" title="Draw signature">
                                                            ✍🏼
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Dragger {...props}
                                                    className="!h-full !w-full !p-0 !m-0 bg-transparent border-0"
                                                    style={{ background: 'transparent' }}
                                                >
                                                    <p className="text-sm text-gray-500">Click or drag to upload signature</p>
                                                    <button
                                                        type="button"
                                                        onClick={e => { e.stopPropagation(); handleOpenPad(); }}
                                                        className="mt-2 underline text-blue-500 hover:text-blue-600"
                                                    >
                                                        Or draw signature
                                                    </button>
                                                </Dragger>
                                            )}
                                        </div>

                                        <Modal
                                            open={isModalOpen}
                                            onCancel={handleClosePad}
                                            onClose={handleClosePad}
                                            footer={null}
                                            centered
                                            width={650}
                                        >
                                            <div className="space-y-4">
                                                <h2 className="text-lg font-semibold">Draw Your Signature</h2>
                                                <Signature onSave={handleSaveDrawing} />
                                            </div>
                                        </Modal>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default VisitorProfile