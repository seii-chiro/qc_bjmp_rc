import { Button, Image, Input, Select, message } from "antd"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css";
import markerIcon from "@/assets/location_marker.png"
import L from "leaflet";
import { useEffect, useState } from "react";
import { IncidentFormType } from "@/lib/incidents";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { getIncidentTypes, getSeverityLevels } from "@/lib/incidentQueries";
import img_placeholder from "@/assets/img_placeholder.jpg"

const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const FlyToLocation = ({ position }: { position: [number, number] | null }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 14);
            map.invalidateSize();
        }
    }, [position, map]);

    return null;
};

const Report = () => {
    const token = useTokenStore()?.token
    const [incidentForm, setIncidentForm] = useState<IncidentFormType>({
        type_id: null,
        severity_id: null,
        status_id: null,
        incident_code: "",
        name: "",
        incident_details: "",
        longitude_incident: null,
        latitude_incident: null,
        address_incident: "",
        longitude_reported: null,
        latitude_reported: null,
        incident_image_base64: "",
        incident_image: "",
        address_reported: "",
    })
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [selectOnMap, setSelectOnMap] = useState(false);
    const [uploadedImg, setUploadedImg] = useState<string | null>(null);
    const [reportedAddressInput, setReportedAddressInput] = useState("");

    const { data: incidentTypes, isLoading: incidentLoading } = useQuery({
        queryKey: ['indident-types'],
        queryFn: () => getIncidentTypes(token ?? ""),
    })

    const { data: severityLevels, isLoading: severityLevelsLoading } = useQuery({
        queryKey: ['indident-severity-levels'],
        queryFn: () => getSeverityLevels(token ?? ""),
    })

    useEffect(() => {
        if (incidentForm?.type_id) {
            setIncidentForm(prev => ({
                ...prev,
                name: incidentTypes?.find(type => type.id === incidentForm.type_id)?.name || "",
            }))
        }
    }, [incidentForm?.type_id, incidentTypes])

    const handleIncidentAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIncidentForm((prev) => ({
            ...prev,
            address_incident: e.target.value,
        }));
    };

    const handleIncidentAddressBlur = async () => {
        const value = incidentForm.address_incident;
        if (value.trim() === "") return;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
            );
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setPosition([lat, lon]);
                setIncidentForm((prev) => ({
                    ...prev,
                    latitude_incident: lat,
                    longitude_incident: lon,
                    address_incident: value,
                }));
            }
        } catch (err) {
            message.error(`Failed to geocode address: ${err}`);
        }
    };

    function MapClickHandler() {
        useMap().on("click", async (e: L.LeafletMouseEvent) => {
            if (selectOnMap) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                // Reverse geocode to get address
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
                    const data = await res.json();
                    const address = data.display_name || `${lat}, ${lng}`;
                    setIncidentForm((prev) => ({
                        ...prev,
                        latitude_incident: lat,
                        longitude_incident: lng,
                        address_incident: address,
                    }));
                } catch {
                    setIncidentForm((prev) => ({
                        ...prev,
                        latitude_incident: lat,
                        longitude_incident: lng,
                        address_incident: `${lat}, ${lng}`,
                    }));
                }
            }
        });
        return null;
    }

    const handleUseCurrentLocation = () => {
        if (!useCurrentLocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    // Reverse geocode to get address
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await res.json();
                        const address = data.display_name || `${latitude}, ${longitude}`;
                        setIncidentForm((prev) => ({
                            ...prev,
                            latitude_incident: latitude,
                            longitude_incident: longitude,
                            address_incident: address,
                        }));
                    } catch {
                        setIncidentForm((prev) => ({
                            ...prev,
                            latitude_incident: latitude,
                            longitude_incident: longitude,
                            address_incident: `${latitude}, ${longitude}`,
                        }));
                    }
                },
                () => message.error("Unable to get current location.")
            );
        }
        setUseCurrentLocation(!useCurrentLocation);
        setSelectOnMap(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                setUploadedImg(result);

                // Remove data:image/*;base64, prefix if present
                const base64 = result.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

                setIncidentForm((prev) => ({
                    ...prev,
                    incident_image_base64: base64,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetReportedLocation = () => {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setIncidentForm((prev) => ({
                    ...prev,
                    latitude_reported: latitude,
                    longitude_reported: longitude,
                }));
                // Reverse geocode to get human-readable address
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await res.json();
                    const address = data.display_name || `${latitude}, ${longitude}`;
                    setReportedAddressInput(address);
                    setIncidentForm((prev) => ({
                        ...prev,
                        address_reported: address,
                    }));
                } catch {
                    setReportedAddressInput(`${latitude}, ${longitude}`);
                }
                message.success("Reported location set!");
            },
            () => message.error("Unable to get reported location.")
        );
    };

    const handleSelectOnMap = () => {
        setSelectOnMap(!selectOnMap);
        setUseCurrentLocation(false);
    };

    console.log(incidentForm)

    return (
        <div className="pt-1 pb-3">
            <div className="w-full h-full flex gap-10 rounded shadow-allSide p-5">
                <div className="flex-1 flex flex-col gap-4">
                    <div>
                        <span className="font-semibold">Incident Description</span>
                        <Input.TextArea
                            className="w-full !h-28"
                            value={incidentForm?.incident_details}
                            onChange={(e) => {
                                setIncidentForm((prev) => ({
                                    ...prev,
                                    incident_details: e.target.value,
                                }));
                            }}
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <span className="font-semibold">Incident Type</span>
                        <Select
                            loading={incidentLoading}
                            options={incidentTypes?.map(type => ({
                                label: type?.name,
                                value: type?.id,
                            }))}
                            className="h-10 w-full"
                            onChange={(value) => {
                                setIncidentForm(prev => ({
                                    ...prev,
                                    type_id: value,
                                }))
                            }}
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <span className="font-semibold">Severity Level</span>
                        <Select
                            loading={incidentLoading}
                            options={severityLevels?.map(type => ({
                                label: type?.name,
                                value: type?.id,
                            }))}
                            className="h-10 w-full"
                            onChange={(value) => {
                                setIncidentForm(prev => ({
                                    ...prev,
                                    severity_id: value,
                                }))
                            }}
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <span className="font-semibold">Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    <div className="w-full flex items-center justify-center">
                        <Image
                            src={uploadedImg || img_placeholder}
                            alt="Uploaded"
                            className="w-full object-cover rounded-md"
                            style={{ height: 400, width: '100%', objectFit: "cover" }}
                        />
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    <div className="w-full flex flex-col gap-2">
                        <span className="font-semibold">Enter or Select Incident Address on the Map</span>
                        <Input
                            className="h-10"
                            value={incidentForm.address_incident}
                            onChange={handleIncidentAddressChange}
                            onBlur={handleIncidentAddressBlur}
                            disabled={useCurrentLocation || selectOnMap}
                            placeholder="Type address here"
                        />
                    </div>
                    <div className="w-full flex gap-10">
                        <span className="flex gap-2">
                            <input
                                type="checkbox"
                                checked={useCurrentLocation}
                                onChange={handleUseCurrentLocation}
                                disabled={selectOnMap}
                            />
                            <span>Use Current Location</span>
                        </span>
                        <span className="flex gap-2">
                            <input
                                type="checkbox"
                                checked={selectOnMap}
                                onChange={handleSelectOnMap}
                                disabled={useCurrentLocation}
                            />
                            <span>Select on Map</span>
                        </span>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <p className="font-semibold">Incident Address</p>
                        <div className="h-[30rem] rounded-md overflow-hidden">
                            <MapContainer center={position || [14.6760, 121.0437]} zoom={position ? 18 : 5} style={{ height: "100%", width: "100%" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <FlyToLocation position={position} />
                                {selectOnMap && <MapClickHandler />}
                                {position && <Marker position={position} icon={customMarkerIcon} />}
                            </MapContainer>
                        </div>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <p className="font-semibold">Reported Address</p>
                        <div className="flex gap-2">
                            <Input
                                className="h-10"
                                value={reportedAddressInput}
                                onChange={e => {
                                    setReportedAddressInput(e.target.value);
                                    setIncidentForm(prev => ({
                                        ...prev,
                                        address_reported: e.target.value,
                                    }));
                                }}
                                placeholder="Enter reported address"
                            />
                            <Button onClick={handleGetReportedLocation} className="h-10">
                                Use My Location
                            </Button>
                        </div>
                    </div>
                    <Button
                        variant="solid"
                        color="primary"
                        className="w-full h-10 font-semibold"
                    >
                        Submit Report
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Report