import { getJail_Barangay, getJail_Category, getJail_Municipality, getJail_Province, getJail_Security_Level, getJail_Type, getJailRegion, updateJail } from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Button, Form, Input, message, Select } from "antd";
import { useEffect, useState } from "react";

type EditJailFacility = {
    jail_name: string;
    jail_type_id: number | null;
    jail_category_id: number | null;
    email_address: string;
    contact_number: string;
    jail_province_id: number| null;
    jail_city_municipality_id: number | null;
    jail_region_id: number| null;
    jail_barangay_id: number| null;
    jail_postal_code: number| null;
    security_level_id: number | null;
    jail_capacity: number | null;
    jail_description: string;
};

const EditJail = ({ jail, onClose }: { jail: any; onClose: () => void }) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false);
    const [ selectjail, setSelectJail] = useState<EditJailFacility>(
        {
        jail_name: '',
        jail_type_id: 0,
        jail_category_id: 0,
        email_address: '',
        contact_number: '',
        jail_province_id: 0,
        jail_city_municipality_id: 0,
        jail_region_id: 0,
        jail_barangay_id: 0,
        jail_postal_code: 0,
        security_level_id: 0,
        jail_capacity: 0,
        jail_description: ''
        }
    )

    const updateMutation = useMutation({
        mutationFn: (updatedData: any) =>
            updateJail(token ?? "", jail.id, updatedData),
        onSuccess: () => {
            setIsLoading(true); 
            messageApi.success("Jail Facility updated successfully");
            onClose();
        },
        onError: (error: any) => {
            setIsLoading(false); 
            messageApi.error(error.message || "Failed to update Jail Facility");
        },
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['jail-type'],
                queryFn: () => getJail_Type(token ?? "")
            },
            {
                queryKey: ['jail-category'],
                queryFn: () => getJail_Category(token ?? "")
            },
            {
                queryKey: ['jail-province'],
                queryFn: () => getJail_Province(token ?? "")
            },
            {
                queryKey: ['city-municipality'],
                queryFn: () => getJail_Municipality(token ?? "")
            },
            {
                queryKey: ['jail-region'],
                queryFn: () => getJailRegion(token ?? "")
            },
            {
                queryKey: ['jail-barangay'],
                queryFn: () => getJail_Barangay(token ?? "")
            },
            {
                queryKey: ['security-level'],
                queryFn: () => getJail_Security_Level(token ?? "")
            },
        ]
    });

    const jailTypeData = results[0].data;
    const jailCategoryData = results[1].data;
    const jailProvinceData = results[2].data;
    const jailMunicipalityData = results[3].data;
    const jailRegionData = results[4].data;
    const jailBarangayData = results[5].data;
    const securityLevelData = results[6].data;

    useEffect(() => {
        if (jail) {
            form.setFieldsValue({
                jail_name: jail.jail_name,
                jail_type_id: jail.jail_type_id,
                jail_category_id: jail.jail_category_id,
                email_address: jail.email_address,
                contact_number: jail.contact_number,
                jail_province_id: jail.jail_province_id,
                jail_city_municipality_id: jail.jail_city_municipality_id,
                jail_region_id: jail.jail_region_id,
                jail_barangay_id: jail.jail_barangay_id,
                jail_postal_code: jail.jail_postal_code,
                security_level_id: jail.security_level_id,
                jail_capacity: jail.jail_capacity,
                jail_description: jail.jail_description
            });
        }
    }, [jail, form]);

    const handleJailSubmit = (values: any) => {
        const payload = {
            jail_name: values.jail_name,
            jail_type_id: values.jail_type_id, 
            jail_category_id: values.jail_category_id, 
            email_address: values.email_address,
            contact_number: values.contact_number,
            jail_province_id: values.jail_province_id,
            jail_city_municipality_id: values.jail_city_municipality_id,
            jail_region_id: values.jail_region_id,
            jail_barangay_id: values.jail_barangay_id,
            jail_street: values.jail_street, // <-- add this if you have it in your form
            jail_postal_code: values.jail_postal_code,
            security_level_id: values.security_level_id,
            jail_capacity: values.jail_capacity,
            jail_description: values.jail_description
        };
        
            const cleanedPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== null)
            );
        
            setIsLoading(true);
            updateMutation.mutate(cleanedPayload);

            if (!values.jail_type_id || !values.jail_category_id) {
            message.error("Jail Type and Jail Category are required.");
            return;
            }
        };

    const onJailTypeChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_type_id: value
        }));
    };

    const onJailCategoryChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_category_id: value
        }));
    };

    const onRegionChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_region_id: value,
            jail_province_id: null,
            jail_city_municipality_id: null,
            jail_barangay_id: null,
        }));
        form.setFieldValue("jail_region_id", value);
    };
    
    const onJailProvinceChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_province_id: value,
            jail_city_municipality_id: null,
            jail_barangay_id: null,
        }));
        form.setFieldValue("jail_province_id", value);
    };
    
    const onMunicipalityChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_city_municipality_id: value,
            jail_barangay_id: null,
        }));
        form.setFieldValue("jail_city_municipality_id", value);
    };
    
    const onJailBarangayChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            jail_barangay_id: value,
        }));
        form.setFieldValue("jail_barangay_id", value);
    };    

    const onSecurityLevelChange = (value: number) => {
        setSelectJail(prevForm => ({
            ...prevForm,
            security_level_id: value,
        }));
    };  

    return (
        <div>
            {contextHolder}
            <h2 className="text-lg font-bold text-[#32507D]">Edit Jail Facility</h2>
            <Form
                className="mt-5"
                form={form}
                layout="vertical"
                onFinish={handleJailSubmit}
                initialValues={{
                    jail_name: jail?.jail_name ?? '',
                    jail_type_id: jail?.jail_type_id ?? '',
                    jail_category_id: jail?.jail_category_id ?? '',
                    email_address: jail?.email_address ?? '',
                    contact_number: jail?.contact_number ?? '',
                    jail_province_id: jail?.jail_province_id ?? '',
                    jail_city_municipality_id: jail?.jail_city_municipality_id ?? '',
                    jail_region_id: jail?.jail_region_id ?? '',
                    jail_barangay_id: jail?.jail_barangay_id ?? '',
                    jail_postal_code: jail?.jail_postal_code ?? '',
                    security_level_id: jail?.security_level_id ?? '',
                    jail_capacity: jail?.jail_capacity ?? '',
                    jail_description: jail?.jail_description ?? ''
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-3">
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Name:</span>}
                        name="jail_name"
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item name="jail_type_id" label={<span className="font-semibold text-[#333] text-[16px]">Jail Type:</span>} rules={[{ required: true, message: 'Please select a jail type' }]}>
                        <Select className="h-[3rem] w-full"
                            showSearch
                            placeholder="Jail Type"
                            optionFilterProp="label"
                            onChange={onJailTypeChange}
                            options={jailTypeData?.results?.map(jail_type => (
                                {
                                    value: jail_type.id,
                                    label: jail_type?.type_name,
                                }
                            ))}
                        />
                    </Form.Item>
                    <Form.Item
                    name="jail_category_id"
                    label={<span className="font-semibold text-[#333] text-[16px]">Jail Category:</span>}
                    rules={[{ required: true, message: 'Please select a jail type' }]}
                    >
                        <Select
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Jail Category"
                        optionFilterProp="label"
                        onChange={onJailCategoryChange}
                        options={jailCategoryData?.results?.map(jail_category => (
                            {
                                value: jail_category.id,
                                label: jail_category?.category_name,
                            }
                        ))}
                    />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Email Address:</span>}
                        name="email_address"
                    >
                        <Input className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Contact Number:</span>}
                        name="contact_number"
                    >
                        <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Jail Capacity:</span>}
                        name="jail_capacity"
                    >
                        <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                    <Form.Item 
                    name="security_level_id"
                    label={<span className="font-semibold text-[#333] text-[16px]">Security Level:</span>}
                    rules={[{ required: true, message: 'Please select a jail type' }]}>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Security Level"
                            optionFilterProp="label"
                            onChange={onSecurityLevelChange}
                            options={securityLevelData?.results?.map(security_level => (
                                {
                                    value: security_level.id,
                                    label: security_level?.category_name,
                                }
                            ))}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-[#333] text-[16px]">Description:</span>}
                        name="jail_description"
                    >
                        <Input type="text" className="h-12 border border-gray-300 rounded-lg px-2"/>
                    </Form.Item>
                </div>
                <h2 className="text-xl font-bold text-[#32507D]">Address</h2>
                <div className="border-2 p-4 border-gray-200 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Form.Item name="jail_region_id" label={<span className="font-semibold text-[#333] text-[16px]">Region:</span>}>
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

                    <Form.Item name="jail_province_id" label={<span className="font-semibold text-[#333] text-[16px]">Province:</span>}>
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

                    <Form.Item name="jail_city_municipality_id" label={<span className="font-semibold text-[#333] text-[16px]">City/Municipality:</span>}>
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

                    <Form.Item name="jail_barangay_id" label={<span className="font-semibold text-[#333] text-[16px]">Barangay:</span>}>
                        <Select
                            className="h-[3rem] w-full"
                            showSearch
                            placeholder="Barangay"
                            onChange={onJailBarangayChange}
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
                            label={<span className="font-semibold text-[#333] text-[16px]">Postal Code:</span>}
                            name="jail_postal_code"
                        >
                            <Input type="number" className="h-12 border border-gray-300 rounded-lg px-2"/>
                        </Form.Item>
                </div>
                <Form.Item>
                    <Button type="primary" className="mt-2 py-4 flex ml-auto bg-[#32507D]" htmlType="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Jail Facility"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default EditJail
