import { getProvidedServices, getServiceProviderTypes } from "@/lib/additionalQueries";
import { getPerson } from "@/lib/queries";
import { deleteServiceProvider, getService_Provider } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";

export interface ServiceProviderPayload {
    key: number;
    id: number;
    sp_reg_no: string;
    serv_prov_type: number;
    provided_service: number;
    visitor_type: string;
    group_affiliation: string;
    person: number;
}
const ServiceProvider = () => {
    const [searchText, setSearchText] = useState("");
    const token = useTokenStore().token;
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: ServicerProviderData } = useQuery({
        queryKey: ['service-provider'],
        queryFn: () => getService_Provider(token ?? ""),
    });

    const { data: PersonsData } = useQuery({
        queryKey: ['person'],
        queryFn: () => getPerson(token ?? ""),
    });

    const { data: SPTypeData } = useQuery({
        queryKey: ['sptype-data'],
        queryFn: () => getServiceProviderTypes(token ?? ""),
    });

    const { data: ProvidedServiceData } = useQuery({
        queryKey: ['ps-data'],
        queryFn: () => getProvidedServices(token ?? ""),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteServiceProvider(token ?? "", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["service-provider"] });
            messageApi.success("Service Provider deleted successfully");
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to delete Service Provider");
        },
    });
    const dataSource = ServicerProviderData?.results?.map((provider, index) => {
        const matchedPerson = PersonsData?.find(person => person.id === provider.person);

        const matchedServiceProviderType = SPTypeData?.find(serv_prov_type => serv_prov_type.id === provider.serv_prov_type);

        const PSmatchData = ProvidedServiceData?.find(provided_service => provided_service.id === provider.provided_service);
    
        return {
            key: provider.id,
            sp_reg_no: provider?.sp_reg_no,
            serv_prov_type: matchedServiceProviderType?.serv_prov_type,
            provided_service: PSmatchData?.service_provided,
            visitor_type: provider?.visitor_type,
            group_affiliation: provider?.group_affiliation,
            person: `${matchedPerson?.first_name || ''} ${matchedPerson?.middle_name || ''} ${matchedPerson?.last_name || ''}` || "", 
        };
    }) || [];    

    const filteredData = dataSource?.filter((provider) =>
        Object.values(provider).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns: ColumnsType<ServiceProviderPayload> = [
        {
            title: 'No.',
            key: 'no',
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'SP Type',
            dataIndex: 'serv_prov_type',
            key: 'serv_prov_type',
            sorter: (a, b) => a.serv_prov_type.localeCompare(b.serv_prov_type),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.serv_prov_type))
                ).map(serv_prov_type => ({
                    text: serv_prov_type,
                    value: serv_prov_type,
                }))
            ],
            onFilter: (value, record) => record.serv_prov_type === value,
        },
        {
            title: 'Provided Service',
            dataIndex: 'provided_service',
            key: 'provided_service',
            sorter: (a, b) => a.provided_service.localeCompare(b.provided_service),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.provided_service))
                ).map(provided_service => ({
                    text: provided_service,
                    value: provided_service,
                }))
            ],
            onFilter: (value, record) => record.provided_service === value,
        },
        {
            title: 'SP No.',
            dataIndex: 'sp_reg_no',
            key: 'sp_reg_no',
            sorter: (a, b) => a.sp_reg_no.localeCompare(b.sp_reg_no),
        },
        {
            title: 'Person',
            dataIndex: 'person',
            key: 'person',
            sorter: (a, b) => a.person.localeCompare(b.person),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.person))
                ).map(person => ({
                    text: person,
                    value: person,
                }))
            ],
            onFilter: (value, record) => record.person === value,
        },
        {
            title: 'Visitor Type',
            dataIndex: 'visitor_type',
            key: 'visitor_type',
            sorter: (a, b) => a.visitor_type.localeCompare(b.visitor_type),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.visitor_type))
                ).map(visitor_type => ({
                    text: visitor_type,
                    value: visitor_type,
                }))
            ],
            onFilter: (value, record) => record.visitor_type === value,
        },
        {
            title: 'Group Affiliation',
            dataIndex: 'group_affiliation',
            key: 'group_affiliation',
            sorter: (a, b) => a.group_affiliation.localeCompare(b.group_affiliation),
            filters: [
                ...Array.from(
                    new Set(filteredData.map(item => item.group_affiliation))
                ).map(name => ({
                    text: name,
                    value: name,
                }))
            ],
            onFilter: (value, record) => record.group_affiliation === value,
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="link"
                        danger
                        onClick={() => deleteMutation.mutate(record.id)}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        },
    ]
    return (
        <div>
            {contextHolder}
            <h1 className="text-2xl font-bold text-[#1E365D]">Service Provider</h1>
            <div className="flex items-center justify-between my-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search Service Provider..."
                        value={searchText}
                        className="py-2 md:w-64 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>
            <Table dataSource={filteredData} columns={columns}/>
        </div>
    )
}

export default ServiceProvider
