import { generateOASISAlertXMLII } from "@/lib/oasis-query";
import { useQuery } from "@tanstack/react-query";
import XMLForm from "./XMLForm";
import { Button } from "antd";
import { BASE_URL } from "@/lib/urls";

type Props = {
    chosenXML: string;
    token: string;
};

const cleanXML = (xmlString: string): string => {
    return xmlString
        .replace(/\s*=\s*/g, "=")
        .replace(/>\s+</g, "><")
        .trim();
};

const XMLPreview = ({ chosenXML, token }: Props) => {
    const { data: xml, isLoading, error } = useQuery({
        queryKey: ["generate-xml", chosenXML],
        queryFn: () => generateOASISAlertXMLII(token, chosenXML),
        enabled: !!token && !!chosenXML
    });

    const downloadXMLPage = async () => {
        try {
            const response = await fetch(`${BASE_URL}/${chosenXML}`, { headers: { Authorization: `Token ${token}` } });
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            let xmlText = await response.text();

            // Clean up malformed XML before saving
            xmlText = cleanXML(xmlText);

            const blob = new Blob([xmlText], { type: "application/xml" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "OASIS-alert.xml";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            alert("Failed to download XML. " + (err?.message || ""));
        }
    };

    if (isLoading) return <div className="w-60 mx-auto pl-[6%] font-semibold">Loading XML...</div>;
    if (error) return <div className="w-60 pl-[6%] mx-auto font-semibold">Error loading XML</div>;

    return (
        <div className="w-full ">
            <XMLForm xml={xml ?? ""} />

            <div className="w-full flex justify-center">
                <Button
                    onClick={downloadXMLPage}
                    type="primary"
                >
                    Download XML
                </Button>
            </div>
        </div>
    );
};

export default XMLPreview;