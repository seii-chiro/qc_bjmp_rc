/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from '@/lib/urls'
import { useTokenStore } from '@/store/useTokenStore'
import { useQuery } from '@tanstack/react-query'
import { Select } from 'antd'
import { useEffect, useState } from 'react'
import img_placeholder from "@/assets/img_placeholder.jpg"
import { toPng } from 'html-to-image';
import JSZip from "jszip";
import { saveAs } from "file-saver";

const VisitorID = () => {
    const token = useTokenStore()?.token
    const [chosenVisitor, setChosenVisitor] = useState<string>("")
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 400)
        return () => clearTimeout(handler)
    }, [searchQuery])

    // Function to fetch paginated visitors with search
    const fetchVisitors = async () => {
        const offset = (currentPage - 1) * pageSize;
        const searchParams = new URLSearchParams({
            limit: pageSize.toString(),
            offset: offset.toString(),
        });

        if (debouncedSearch) {
            searchParams.append('search', debouncedSearch);
        }

        const res = await fetch(
            `${BASE_URL}/api/visitors/visitor/?${searchParams.toString()}`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) throw new Error("Failed to fetch visitors");
        const data = await res.json();

        // setTotalVisitors(data.count || 0);

        return data;
    };

    // Query for paginated visitors with search
    const { data: visitors, isLoading: visitorsLoading, isFetching } = useQuery({
        queryKey: ['visitors', 'visitorID', currentPage, pageSize, debouncedSearch],
        queryFn: fetchVisitors,
        placeholderData: 'keep',
    });

    // Fetch visitor-specific logs when a visitor is chosen
    const { data: specificVisitor } = useQuery({
        queryKey: ['visitor-specific-logs', chosenVisitor],
        queryFn: async () => {
            if (!chosenVisitor) return [];
            const res = await fetch(
                `${BASE_URL}/api/visit-logs/visitor-specific/?id_number=${chosenVisitor}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!res.ok) throw new Error("Failed to fetch visitor logs");
            return res.json();
        },
        enabled: !!chosenVisitor, // Only run when chosenVisitor is set
    });

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        // Get PNG data URLs
        const frontElement = document.getElementById("visitor-front");
        const backElement = document.getElementById("visitor-back");
        if (!frontElement || !backElement) return;

        const frontDataUrl = await toPng(frontElement);
        const backDataUrl = await toPng(backElement);

        // Convert data URLs to blobs
        const frontBlob = await (await fetch(frontDataUrl)).blob();
        const backBlob = await (await fetch(backDataUrl)).blob();

        // Add to zip
        zip.file("visitor_front.png", frontBlob);
        zip.file("visitor_back.png", backBlob);

        // Generate zip and trigger download
        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, `${specificVisitor?.person?.first_name ?? ""}_${specificVisitor?.person?.last_name ?? ""}_Visitor_ID.zip`);
        });
    };

    return (
        <div>
            <div className='w-full h-full flex flex-col gap-10 mt-10'>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <Select
                        loading={visitorsLoading}
                        showSearch
                        optionFilterProp='label'
                        placeholder='Select Visitor'
                        className='w-72 h-10'
                        value={chosenVisitor}
                        options={visitors?.results?.map((visitor: { id_number: any; person: { first_name: any; middle_name: any; last_name: any } }) => ({
                            value: visitor.id_number,
                            label: `${visitor?.person?.first_name ?? ""} ${visitor?.person?.middle_name ?? ""} ${visitor?.person?.last_name ?? ""}`,
                        })) ?? []}
                        onChange={value => setChosenVisitor(value)}
                        notFoundContent={visitorsLoading || isFetching ? <span>Loading...</span> : 'No visitors found'}
                        onSearch={value => {
                            setSearchQuery(value);
                            setCurrentPage(1);
                        }}
                        filterOption={false}
                    />

                </div>

                <div className='w-full flex flex-col lg:flex-row lg:gap-12'>
                    <div className='flex-1 flex flex-col gap-4'>
                        <h2 className='w-full text-2xl font-bold text-center'>Front</h2>

                        <div id="visitor-front" className='w-full border-4 border-black h-[30rem] flex flex-col bg-gray-200 relative'>
                            <div className='flex'>
                                <div className='custom-shape1 bg-gray-600 absolute w-[45%] h-10 right-0 z-10'>
                                    <p className='text-center text-white text-xl py-1.5 font-semibold'>VISITOR ID CARD</p>
                                </div>
                                <div className='custom-shape1 bg-black absolute w-[50%] h-12 right-0 top-[5%]'></div>
                                <div className='custom-shape2 bg-gray-600 absolute w-[55%] h-20 top-[8.5%] z-[2]'></div>
                                <div className='custom-shape4 bg-black absolute w-[50%] pl-0 py-5 pr-8 h-16 top-[12.5%] z-10 flex items-center justify-center'>
                                    <p className='text-center text-white text-xl font-semibold'>QUEZON CITY JAIL MALE DORM</p>
                                </div>
                                <div className='custom-shape3 bg-gray-400 absolute w-full h-8 top-[21%] flex items-center justify-end pr-[12%]'>
                                    <p className='text-white text-right font-semibold'>
                                        {specificVisitor?.person?.first_name ?? ""} &nbsp;
                                        {specificVisitor?.person?.middle_name ? specificVisitor.person.middle_name.charAt(0) : ""} &nbsp;
                                        {specificVisitor?.person?.last_name ?? ""}
                                    </p>
                                </div>
                            </div>
                            <div className='flex absolute top-[25%] left-0 w-full h-full p-5'>
                                <div className='flex-1 border-4 border-black h-[75%]'>
                                    <img
                                        className='w-full h-full object-cover'
                                        src={
                                            specificVisitor?.person?.media?.find(
                                                (m: any) => m.media_description === "Close-Up Front Picture"
                                            )?.media_binary
                                                ? `data:image/png;base64,${specificVisitor.person.media.find(
                                                    (m: any) => m.media_description === "Close-Up Front Picture"
                                                ).media_binary
                                                }`
                                                : img_placeholder
                                        }
                                        alt="visitor face photo"
                                    />
                                </div>
                                <div className="flex flex-col justify-between h-[70%] w-10 pt-28">
                                    <span
                                        className="text-sm font-semibold tracking-widest"
                                        style={{ transform: "rotate(-90deg)", display: "inline-block", letterSpacing: "0.4em" }}
                                    >
                                        {specificVisitor?.id_number ?? ""}
                                    </span>
                                    <span
                                        className="text-sm font-semibold tracking-widest mt-24"
                                        style={{ transform: "rotate(-90deg)", display: "inline-block", letterSpacing: "0.4em" }}
                                    >
                                        NUMBER:
                                    </span>
                                    <span
                                        className="text-sm font-semibold tracking-widest"
                                        style={{ transform: "rotate(-90deg)", letterSpacing: "0.4em" }}
                                    >
                                        ID
                                    </span>
                                </div>
                                <div className='flex-1 border-4 border-black h-[75%]'>
                                    <img
                                        className='w-full h-full object-cover'
                                        src={specificVisitor?.encrypted_id_number_qr
                                            ? `data:image;base64,${specificVisitor.encrypted_id_number_qr}`
                                            : img_placeholder}
                                        alt="visitor qr code"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex-1 flex flex-col gap-4'>
                        <h2 className='w-full text-2xl font-bold text-center'>Back</h2>

                        <div id="visitor-back" className='w-full border-4 border-black h-[30rem] flex flex-col bg-gray-200 relative'>
                            <div className='flex'>
                                <div className='custom-shape1 bg-gray-600 absolute w-[45%] h-10 right-0 z-10'>
                                    <p className='text-center text-white text-xl py-1.5 font-semibold'>VISITOR ID CARD</p>
                                </div>
                                <div className='custom-shape1 bg-black absolute w-[50%] h-12 right-0 top-[5%]'></div>
                                <div className='custom-shape2 bg-gray-600 absolute w-[55%] h-20 top-[8.5%] z-[2]'></div>
                                <div className='custom-shape4 bg-black absolute w-[50%] pl-0 py-5 pr-8 h-16 top-[12.5%] z-10 flex items-center justify-center'>
                                    <p className='text-center text-white text-xl font-semibold'>QUEZON CITY JAIL MALE DORM</p>
                                </div>
                                <div className='custom-shape3 bg-gray-400 absolute w-full h-8 top-[21%] flex items-center justify-end pr-[15%]'>
                                    <p className='text-white text-right font-semibold'>Regular Visitor</p>
                                </div>
                            </div>
                            <div className='flex absolute top-[25%] left-0 w-full h-full p-5'>
                                <div className='flex-1 border-4 border-black h-[75%] text-sm'>
                                    <div className='p-2'>
                                        <h1 className='w-full text-center font-semibold text-lg'>TERMS AND CONDITION</h1>
                                        <div className='w-full flex flex-col gap-2 pt-4 text-justify'>
                                            <p>
                                                This Identfication card is only valid for verified
                                                visitors for Jail Visitation on Bureau of Jail
                                                Management and Penology - Quezon City Jail
                                                Male dorm premises only.
                                            </p>
                                            <p>
                                                This card is used for entering/ exiting the jail
                                                facility and for the identification of the card
                                                holder.
                                            </p>
                                            <p>
                                                This identification card is non-transferrable.
                                            </p>
                                            <p>
                                                Report immediately upon the loss of this card
                                                and if found, please return this ID card to BJMP
                                                QCJMD Gate Security.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between h-[70%] w-10 pt-28">
                                    <span
                                        className="text-sm font-semibold tracking-widest"
                                        style={{ transform: "rotate(-90deg)", display: "inline-block", letterSpacing: "0.4em" }}
                                    >
                                        {specificVisitor?.id_number ?? ""}
                                    </span>
                                    <span
                                        className="text-sm font-semibold tracking-widest mt-24"
                                        style={{ transform: "rotate(-90deg)", display: "inline-block", letterSpacing: "0.4em" }}
                                    >
                                        NUMBER:
                                    </span>
                                    <span
                                        className="text-sm font-semibold tracking-widest"
                                        style={{ transform: "rotate(-90deg)", letterSpacing: "0.4em" }}
                                    >
                                        ID
                                    </span>
                                </div>
                                <div className='flex-1 flex flex-col border-4 border-black h-[75%] overflow-hidden'>
                                    <div className='flex-[2] flex items-center justify-center overflow-hidden'>
                                        {
                                            specificVisitor?.person?.biometrics?.find(
                                                (b: any) => b.position === "finger_left_thumb"
                                            )?.data && (
                                                < img
                                                    style={{ transform: "rotate(-90deg)" }}
                                                    className='w-full h-full max-h-full max-w-full object-contain'
                                                    src={
                                                        specificVisitor?.person?.biometrics?.find(
                                                            (b: any) => b.position === "finger_left_thumb"
                                                        )?.data
                                                            ? `data:image/png;base64,${specificVisitor.person.biometrics.find(
                                                                (b: any) => b.position === "finger_left_thumb"
                                                            ).data
                                                            }`
                                                            : img_placeholder
                                                    }
                                                    alt="visitor left thumb photo"
                                                />
                                            )
                                        }
                                    </div>

                                    <div className='flex-1 flex flex-col relative items-center justify-center overflow-hidden'>
                                        {
                                            specificVisitor?.person?.media?.find(
                                                (m: any) => m.media_description === "Signature Picture"
                                            )?.media_binary && (
                                                < img
                                                    className='w-full h-full object-cover'
                                                    src={
                                                        specificVisitor?.person?.media?.find(
                                                            (m: any) => m.media_description === "Signature Picture"
                                                        )?.media_binary
                                                            ? `data:image/png;base64,${specificVisitor.person.media.find(
                                                                (m: any) => m.media_description === "Signature Picture"
                                                            ).media_binary
                                                            }`
                                                            : img_placeholder
                                                    }
                                                    alt="visitor face photo"
                                                />
                                            )
                                        }
                                        <p className='text-right font-semibold text-xl absolute bottom-2 z-10'>
                                            {specificVisitor?.person?.first_name ?? ""} &nbsp;
                                            {specificVisitor?.person?.middle_name ? specificVisitor.person.middle_name.charAt(0) : ""} &nbsp;
                                            {specificVisitor?.person?.last_name ?? ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full flex justify-center'>
                    <button
                        onClick={handleDownloadAll}
                        disabled={!chosenVisitor}
                        className={`${!chosenVisitor ? 'bg-gray-400' : 'bg-blue-500'} text-white px-4 py-2 rounded w-40`}
                    >
                        Download ID
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VisitorID