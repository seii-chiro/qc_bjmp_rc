import { Modal } from "antd";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import qrScanImg from "@/assets/qr-code.png"
import rfidScanImg from "@/assets/rfid-colored.png"
import fingerScanImg from "@/assets/fingerprint-scan.png"
import irisqrScanImg from "@/assets/eye-scan.png"
import faceqrScanImg from "@/assets/face-scan.png"

type Props = {
    open: boolean;
    onClose: () => void;
    selectedArea: string | null;
};

const ScannerSelection = ({ open, onClose, selectedArea }: Props) => {
    const [selectedScanners, setSelectedScanners] = useState<string[]>([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    let scannerSelection = [];

    if (selectedArea === "PDL Station") {
        scannerSelection = [
            { scanner: "Fingerprint", icon: fingerScanImg },
            { scanner: "Iris", icon: irisqrScanImg },
            { scanner: "Face Recognition", icon: faceqrScanImg },
        ];
    } else if (selectedArea === "Main Gate") {
        scannerSelection = [
            { scanner: "RFID", icon: rfidScanImg },
            { scanner: "QR", icon: qrScanImg },
        ]
    } else {
        scannerSelection = [
            { scanner: "RFID", icon: rfidScanImg },
            { scanner: "QR", icon: qrScanImg },
            { scanner: "Fingerprint", icon: fingerScanImg },
            { scanner: "Iris", icon: irisqrScanImg },
            { scanner: "Face Recognition", icon: faceqrScanImg },
        ];
    }

    const toggleScanner = (scannerName: string) => {
        setSelectedScanners((prev) =>
            prev.includes(scannerName)
                ? prev.filter((name) => name !== scannerName)
                : [...prev, scannerName]
        );
    };

    // Determine modal width based on screen size
    const getModalWidth = () => {
        if (windowWidth < 640) {
            return "95%";
        } else if (windowWidth < 1024) {
            return "70%";
        } else {
            return "40%";
        }
    };

    // Calculate grid columns based on screen size
    const getGridCols = () => {
        if (windowWidth < 480) {
            return "grid-cols-1";
        } else if (windowWidth < 768) {
            return "grid-cols-2";
        } else {
            return "grid-cols-2";
        }
    };

    return (
        <Modal
            width={getModalWidth()}
            centered
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <div className="w-full mt-4 flex flex-col items-center gap-4 p-2">
                <h1 className="w-full text-center text-xl md:text-xl font-semibold px-2">
                    Please select mode(s) of verification.
                </h1>

                <div className={`w-full md:w-[80%] lg:w-[70%] gap-x-2 gap-y-3 grid ${getGridCols()} place-items-center`}>
                    {scannerSelection.map((scanner, id) => {
                        const isSelected = selectedScanners.includes(scanner.scanner);
                        const isLastItemOdd = id === scannerSelection.length - 1 && scannerSelection.length % 2 !== 0;

                        return (
                            <motion.div
                                key={id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: id * 0.1,
                                }}
                                onClick={() => toggleScanner(scanner.scanner)}
                                className={`
                                    w-full max-w-xs flex flex-col justify-center items-center 
                                    gap-2 rounded-lg p-3 md:p-4 cursor-pointer border-2
                                    ${isSelected ? 'border-green-600' : 'bg-gray-100 border-gray-200 text-gray-700'}
                                    ${isLastItemOdd && windowWidth >= 480 ? 'col-span-2 md:col-span-2' : ''}
                                `}
                            >
                                <div className="w-12 sm:w-16 md:w-20 flex items-center justify-center">
                                    <img
                                        src={scanner.icon}
                                        alt={`${scanner.scanner} icon`}
                                        className="object-cover h-full w-full"
                                    />
                                </div>
                                <span className="text-lg md:text-xl font-semibold">{scanner.scanner}</span>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="w-full flex justify-center mt-2 md:mt-4">
                    <NavLink
                        to="verify"
                        state={{
                            scanners: selectedScanners,
                            selectedArea,
                        }}
                        className={`px-3 py-2 md:px-4 md:py-2 rounded-md font-semibold transition
                            ${selectedScanners.length === 0
                                ? "bg-gray-400 cursor-not-allowed pointer-events-none opacity-30"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }
                        `}
                    >
                        Next
                    </NavLink>
                </div>
            </div>
        </Modal>
    );
};

export default ScannerSelection;