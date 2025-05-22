import { useState } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { useTokenStore } from "@/store/useTokenStore";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJail_Security_Level, getJail_Type, getJail_Category, getJail_Province, getJail_Municipality, getJailRegion, getJail_Barangay } from "@/lib/queries";
import { JAIL } from "@/lib/urls";

const AddJailFacility = ({ onClose }: { onClose: () => void }) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [selectjail, setSelectJail] = useState({
        jail_region_id: null,
        jail_province_id: null,
        jail_city_municipality_id: null,
    });

    const results = useQueries({
        queries: [
            { queryKey: ['jail-type'], queryFn: () => getJail_Type(token ?? "") },
            { queryKey: ['jail-category'], queryFn: () => getJail_Category(token ?? "") },
            { queryKey: ['jail-province'], queryFn: () => getJail_Province(token ?? "") },
            { queryKey: ['city-municipality'], queryFn: () => getJail_Municipality(token ?? "") },
            { queryKey: ['jail-region'], queryFn: () => getJailRegion(token ?? "") },
            { queryKey: ['jail-barangay'], queryFn: () => getJail_Barangay(token ?? "") },
            { queryKey: ['security-level'], queryFn: () => getJail_Security_Level(token ?? "") },
        ]
    });

    const jailTypeData = results[0].data;
    const jailCategoryData = results[1].data;
    const jailProvinceData = results[2].data;
    const jailMunicipalityData = results[3].data;
    const jailRegionData = results[4].data;
    const jailBarangayData = results[5].data;
    const securityLevelData = results[6].data;

    const registerJailFacility = async (values: any) => {
        setIsLoading(true);
        const payload = {
            jail_name: values.jail_name,
            email_address: values.email_address,
            contact_number: values.contact_number,
            jail_type_id: values.jail_type_id,
            jail_category_id: values.jail_category_id,
            jail_region_id: values.jail_region_id,
            jail_province_id: values.jail_province_id,
            jail_city_municipality_id: values.jail_city_municipality_id,
            jail_barangay_id: values.jail_barangay_id,
            jail_street: values.jail_street,
            jail_postal_code: values.jail_postal_code,
            security_level_id: values.security_level_id,
            jail_capacity: values.jail_capacity,
            jail_description: values.jail_description,
        };
        const res = await fetch(JAIL.getJAIL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(payload),
        });
        setIsLoading(false);
        if (!res.ok) {
            let errorMessage = "Error registering Jail Facility";
            try {
                const errorData = await res.json();
                errorMessage = errorData?.message || errorData?.error || JSON.stringify(errorData);
            } catch {
                errorMessage = "Unexpected error occurred";
            }
            throw new Error(errorMessage);
        }
        return res.json();
    };

const jailFacilityMutation = useMutation({
        mutationKey: ['jail'],
        mutationFn: registerJailFacility,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jail"] }); // <-- refresh list
            messageApi.success("Jail Facility added successfully");
            onClose(); // <-- close modal after refresh
        },
        onError: (error: any) => {
            messageApi.error(error.message || "Failed to add Jail Facility");
        }
    });

    const handleJailSubmit = (values: any) => {
        jailFacilityMutation.mutate(values);
    };

    // Handlers for cascading selects
    const onRegionChange = (value: number) => {
        setSelectJail({
            jail_region_id: value,
            jail_province_id: null,
            jail_city_municipality_id: null,
        });
        form.setFieldValue("jail_region_id", value);
        form.setFieldValue("jail_province_id", null);
        form.setFieldValue("jail_city_municipality_id", null);
        form.setFieldValue("jail_barangay_id", null);
    };
    const onJailProvinceChange = (value: number) => {
        setSelectJail(prev => ({
            ...prev,
            jail_province_id: value,
            jail_city_municipality_id: null,
        }));
        form.setFieldValue("jail_province_id", value);
        form.setFieldValue("jail_city_municipality_id", null);
        form.setFieldValue("jail_barangay_id", null);
    };
    const onMunicipalityChange = (value: number) => {
        setSelectJail(prev => ({
            ...prev,
            jail_city_municipality_id: value,
        }));
        form.setFieldValue("jail_city_municipality_id", value);
        form.setFieldValue("jail_barangay_id", null);
    };

    return (
        <div>
            {contextHolder}
            <h2 className="text-lg font-bold text-[#32507D]">Add Jail Facility</h2>
            <Form
                className="mt-5"
                form={form}
                layout="vertical"
                onFinish={handleJailSubmit}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-3">
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Name:</span>}
                        name="jail_name"
                        rules={[{ required: true, message: 'Please enter jail name' }]}
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2" />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Email Address:</span>}
                        name="email_address"
                        rules={[{ required: true, message: 'Please enter email address' }]}
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2" />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Contact Number:</span>}
                        name="contact_number"
                        rules={[{ required: true, message: 'Please enter contact number' }]}
                    >
                        <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2" />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Type:</span>}
                        name="jail_type_id"
                        rules={[{ required: true, message: 'Please select a jail type' }]}
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Type"
                            optionFilterProp="label"
                            options={jailTypeData?.results?.map(jail_type => ({
                                value: jail_type.id,
                                label: jail_type?.type_name,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Category:</span>}
                        name="jail_category_id"
                        rules={[{ required: true, message: 'Please select a jail category' }]}
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Category"
                            optionFilterProp="label"
                            options={jailCategoryData?.results?.map(jail_category => ({
                                value: jail_category.id,
                                label: jail_category?.category_name,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Capacity:</span>}
                        name="jail_capacity"
                    >
                        <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2" />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Security Level:</span>}
                        name="security_level_id"
                        rules={[{ required: true, message: 'Please select a security level' }]}
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Security Level"
                            optionFilterProp="label"
                            options={securityLevelData?.results?.map(security_level => ({
                                value: security_level.id,
                                label: security_level?.category_name,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Description:</span>}
                        name="jail_description"
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2" />
                    </Form.Item>
                </div>
                <h2 className="text-xl font-bold text-[#32507D]">Address</h2>
                <div className="border-2 p-4 border-gray-200 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Form.Item
                        name="jail_region_id"
                        label={<span className="font-semibold text-[#333] text-[16px]">Region:</span>}
                        rules={[{ required: true, message: 'Please select a region' }]}
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Region"
                            onChange={onRegionChange}
                            options={jailRegionData?.results?.map(region => ({
                                value: region.id,
                                label: region?.desc,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="jail_province_id"
                        label={<span className="font-semibold text-[#333] text-[16px]">Province:</span>}
                        rules={[{ required: true, message: 'Please select a province' }]}
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Province"
                            onChange={onJailProvinceChange}
                            disabled={!selectjail.jail_region_id}
                            options={jailProvinceData?.results
                                ?.filter(province => province.region === selectjail.jail_region_id)
                                .map(province => ({
                                    value: province.id,
                                    label: province?.desc,
                                }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="jail_city_municipality_id"
                        label={<span className="font-semibold text-[#333] text-[16px]">City/Municipality:</span>}
                        rules={[{ required: true, message: 'Please select a city/municipality' }]}
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Municipality"
                            onChange={onMunicipalityChange}
                            disabled={!selectjail.jail_province_id}
                            options={jailMunicipalityData?.results
                                ?.filter(municipality => municipality.province === selectjail.jail_province_id)
                                .map(municipality => ({
                                    value: municipality.id,
                                    label: municipality?.desc,
                                }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="jail_barangay_id"
                        label={<span className="font-semibold text-[#333] text-[16px]">Barangay:</span>}
                        rules={[{ required: true, message: 'Please select a barangay' }]}
                    >
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Barangay"
                            disabled={!selectjail.jail_city_municipality_id}
                            options={jailBarangayData?.results
                                ?.filter(barangay => barangay.municipality === selectjail.jail_city_municipality_id)
                                .map(barangay => ({
                                    value: barangay.id,
                                    label: barangay?.desc,
                                }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Street:</span>}
                        name="jail_street"
                        rules={[{ required: true, message: 'Please enter street' }]}
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2" />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Postal Code:</span>}
                        name="jail_postal_code"
                        rules={[{ required: true, message: 'Please enter postal code' }]}
                    >
                        <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2" />
                    </Form.Item>
                </div>
                <Form.Item>
                    <Button type="primary" className="mt-2 py-4 flex ml-auto bg-[#32507D]" htmlType="submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Jail Facility"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddJailFacility;