import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { ColumnsType } from "antd/es/table";
import { Image, Input, Table } from "antd";
import { useEffect, useState } from "react";
import noimg from "../../../../public/noimg.png";
import { BASE_URL } from "@/lib/urls";

const fetchVisitLogs = async (url: string, token: string) => {
    const res = await fetch(url, {
        headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
        },
    });
    if (!res.ok) throw new Error("Network error");
    return res.json();
};

const limit = 10;

const PDLVisitors = () => {
    const token = useTokenStore().token;
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [visitorPage, setVisitorPage] = useState(1);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
        return () => clearTimeout(timeout);
    }, [searchText]);

    const { data: visitorData, isLoading: visitorLogsLoading } = useQuery({
        queryKey: ["visitor", visitorPage, limit, debouncedSearch],
        queryFn: async () => {
            const offset = (visitorPage - 1) * limit;
            const url = debouncedSearch
                ? `${BASE_URL}/api/visit-logs/visitor-station-visits/?search=${debouncedSearch}&limit=${limit}&offset=${offset}`
                : `${BASE_URL}/api/visit-logs/visitor-station-visits/?&limit=${limit}&offset=${offset}`;
            return fetchVisitLogs(url, token ?? "");
        },
        placeholderData: (prevData) => prevData,
    });

    const dataSource = (visitorData?.results || []).map((entry, index) => {
        const visitorPerson = entry?.visitor?.person;
        const visitorMedia = visitorPerson?.media?.find((m: any) => m.picture_view === "Front");
        const pdl = entry?.visitor?.pdls?.[0]?.pdl;
        const pdlPerson = pdl?.person;
        const pdlMedia = pdlPerson?.media?.find((m: any) => m.picture_view === "Front");

        return {
            key: entry?.id ?? index + 1,
            id: entry?.id ?? "N/A",
            timestampIn: entry?.timestamp_in ?? "",
            timestampOut: entry?.timestamp_out ?? "",
            status: entry?.status ?? "",
            visitor: visitorPerson
                ? `${visitorPerson?.first_name ?? ""} ${visitorPerson?.last_name ?? ""}`.trim()
                : "N/A",
            visitor_type: entry?.visitor?.visitor_type || "N/A",
            visitorPhoto: visitorMedia
                ? {
                    media_binary: visitorMedia.media_binary,
                    media_filepath: visitorMedia.media_filepath,
                }
                : null,
            pdlPhoto: pdlMedia
                ? {
                    media_binary: pdlMedia.media_binary,
                    media_filepath: pdlMedia.media_filepath,
                }
                : null,
            pdl_name: pdlPerson
                ? `${pdlPerson?.first_name ?? ""} ${pdlPerson?.last_name ?? ""}`.trim()
                : "N/A",
            relationshipToPDL: entry?.visitor?.pdls?.[0]?.relationship_to_pdl || "No PDL relationship",
            level: pdl?.cell?.cell_name || "N/A",
            annex: pdl?.cell?.floor?.split("(")[1]?.replace(")", "") || "N/A",
            dorm: pdl?.cell?.floor || "N/A",
        };
    });

    const filteredData = dataSource.filter((visit) =>
        Object.values(visit).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<any> = [
        {
            title: "No.",
            dataIndex: "key",
            key: "key",
            render: (_: any, __: any, index: number) => (visitorPage - 1) * limit + index + 1,
        },
        {
            title: "Visitor Name",
            dataIndex: "visitor",
            key: "visitor",
            sorter: (a, b) => {
                const nameA = a.visitor?.toLowerCase();
                const nameB = b.visitor?.toLowerCase();
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: "Visitor Type",
            dataIndex: "visitor_type",
            key: "visitor_type",
            sorter: (a, b) => (a.visitor_type || "").localeCompare(b.visitor_type || ""),
            filters: [
                { text: 'Regular', value: 'Regular' },
                { text: 'Senior Citizen', value: 'Senior Citizen' },
                { text: 'Person with Disabilities', value: 'Person with Disabilities' },
                { text: 'Pregnant Woman', value: 'Pregnant Woman' },
                { text: 'Minor', value: 'Minor' },
                { text: 'LGBTQ + TRANSGENDER', value: 'LGBTQ + TRANSGENDER' },
                { text: 'LGBTQ + GAY / BISEXUAL', value: 'LGBTQ + GAY / BISEXUAL' },
                { text: 'LGBTQ + LESBIAN / BISEXUAL', value: 'LGBTQ + LESBIAN / BISEXUAL' },
            ],
            onFilter: (value, record) => record.visitor_type.includes(value),
        },
        {
            title: "Visitor Photo",
            dataIndex: "visitorPhoto",
            key: "visitorPhoto",
            render: (photo) => (
                <div className="w-[90px] h-[90px] rounded-xl overflow-hidden flex items-center justify-center">
                    {photo?.media_binary ? (
                        <Image
                            src={`data:image/bmp;base64,${photo.media_binary}`}
                            alt="Visitor"
                            className="w-full h-full object-cover"
                        />
                    ) : photo?.media_filepath ? (
                        <Image
                            src={photo.media_filepath}
                            alt="Visitor"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={noimg}
                            alt="No Image"
                            className="w-2/3 h-2/3 object-contain p-2 bg-gray-100 rounded-lg"
                        />
                    )}
                </div>
            ),
        },
        {
            title: "PDL Photo",
            dataIndex: "pdlPhoto",
            key: "pdlPhoto",
            render: (photo) => (
                <div className="w-[90px] h-[90px] rounded-xl overflow-hidden flex items-center justify-center">
                    {photo?.media_binary ? (
                        <Image
                            src={`data:image/bmp;base64,${photo.media_binary}`}
                            alt="PDL"
                            className="w-full h-full object-cover"
                        />
                    ) : photo?.media_filepath ? (
                        <img
                            src={photo.media_filepath}
                            alt="PDL"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={noimg}
                            alt="No Image"
                            className="w-2/3 h-2/3 object-contain p-2 bg-gray-100 rounded-lg"
                        />
                    )}
                </div>
            ),
        },
        {
            title: "PDL Name",
            dataIndex: "pdl_name",
            key: "pdl_name",
        },
        {
            title: "Relationship to PDL",
            dataIndex: "relationshipToPDL",
            key: "relationshipToPDL",
        },
        {
            title: "Level",
            dataIndex: "level",
            key: "level",
        },
        {
            title: "Annex",
            dataIndex: "annex",
            key: "annex",
        },
        {
            title: "Dorm",
            dataIndex: "dorm",
            key: "dorm",
        },
        {
            title: "Login",
            dataIndex: "timestampIn",
            key: "timestampIn",
            render: (text) => text ? new Date(text).toLocaleString() : "...",
            sorter: (a, b) => new Date(b.timestampIn) - new Date(a.timestampIn),
            defaultSortOrder: 'descend',
        },
        {
            title: "Logout",
            dataIndex: "timestampOut",
            key: "timestampOut",
            render: (text) => text ? new Date(text).toLocaleString() : "...",
            sorter: (a, b) => new Date(b.timestampOut || 0) - new Date(a.timestampOut || 0),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
    ];

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-[#1E365D]">PDL Visitor Logs</h1>
                <Input
                    placeholder="Search logs..."
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setVisitorPage(1);
                    }}
                    className="py-2 w-full md:w-64"
                />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
                <Table
                    loading={visitorLogsLoading}
                    dataSource={debouncedSearch ? filteredData : dataSource}
                    columns={columns}
                    scroll={{ x: 800, y: "calc(100vh - 200px)" }}
                    pagination={
                        debouncedSearch
                            ? false
                            : {
                                current: visitorPage,
                                pageSize: limit,
                                total: visitorData?.count || 0,
                                onChange: (newPage) => setVisitorPage(newPage),
                                showSizeChanger: false,
                            }
                    }
                    rowKey="key"
                />
            </div>
        </div>
    );
};

export default PDLVisitors;