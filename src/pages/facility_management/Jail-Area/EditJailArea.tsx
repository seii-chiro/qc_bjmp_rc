import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Button, message, Select } from "antd";
import { getDetention_Building, getDetention_Floor, getJail, updateJailArea} from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { useEffect, useState } from "react";

type EditJailArea = {
    jail_id: number | null;
    building_id : number | null;
    floor_id: number | null;
    area_name: string;
}

const EditJailArea = ({ jailarea, onClose }: { jailarea: any; onClose: () => void }) => {
    const token = useTokenStore().token;
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false); 
    const [jailArea, setJailArea] = useState<EditJailArea>({
        jail_id: null,
        building_id: null,
        floor_id: null,
        area_name: '',
    });

    const updateMutation = useMutation({
        mutationFn: (updatedData: any) =>
            updateJailArea(token ?? "", jailarea.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jail-area'] });
            setIsLoading(true); 
            messageApi.success("Jail Area updated successfully");
            onClose();
        },
        onError: (error: any) => {
            setIsLoading(false); 
            messageApi.error(error.message || "Failed to update Jail Area");
        },
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['jail'],
                queryFn: () => getJail(token ?? "")
            },
            {
                queryKey: ['building'],
                queryFn: () => getDetention_Building(token ?? "")
            },
            {
            queryKey: ['floor'],
            queryFn: () => getDetention_Floor(token ?? "")
            }
        ]
    });

    const JailData = results[0].data;
    const JailLoading = results[0].isLoading;

    const DetentionBuildingData = results[1].data;
    const DetentionBuildingLoading = results[1].isLoading;

    const DetentionFloorData = results[2].data;
    const DetentionFloorLoading = results[2].isLoading;


    useEffect(() => {
        if (jailarea) {
            form.setFieldsValue({
                jail_id: jailarea.jail_id,
                building_id: jailarea.building_id,
                floor_id: jailarea.floor_id,
                area_name: jailarea.area_name,
            });
            }
        }, [jailarea, form]);

        const handleJailAreaSubmit = (values: any) => {
            const payload = {
            jail_id: values.jail_id,
            building_id: values.building_id,
            floor_id: values.floor_id,
            area_name: values.area_name,
            };
        
            setIsLoading(true);
            updateMutation.mutate(payload);

            if (!values.jail_id || !values.building_id || !values.floor_id) {
                message.error("Jail, Building and Floor are required.");
                return;
                }
        };
    
    const onJailChange = (value: number) => {
        setJailArea(prevForm => ({
            ...prevForm,
            jail: value
        }));
    };

    const onDetentionBuildingChange = (value: string) => {
        setJailArea(prevForm => ({
            ...prevForm,
            building: value
        }));
    };

  const onDetentionFloorChange = (value: number) => {
      setJailArea(prevForm => ({
          ...prevForm,
          floor: value
      }));
  };

    return (
        <div>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleJailAreaSubmit}
            >

                <Form.Item
                    label="Area Name"
                    name="area_name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Jail"
                    name="jail_id"
                >
                    <Select 
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Jail"
                        optionFilterProp="label"
                        onChange={onJailChange}
                        loading={JailLoading}
                        options={JailData?.results?.map(jail => (
                            {
                                value: jail.id,
                                label: jail?.jail_name
                            }
                        ))}/>
                </Form.Item>
                <Form.Item
                    label="Building"
                    name="building_id"
                >
                    <Select 
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Building"
                        optionFilterProp="label"
                        onChange={onDetentionBuildingChange}
                        loading={DetentionBuildingLoading}
                        options={DetentionBuildingData?.results?.map(building => (
                            {
                                value: building.id,
                                label: building?.bldg_name
                            }
                        ))}/>
                </Form.Item>
                <Form.Item
                    label="Floor"
                    name="floor_id"
                >
                    <Select 
                        className="h-[3rem] w-full"
                        showSearch
                        placeholder="Floor"
                        optionFilterProp="label"
                        onChange={onDetentionFloorChange}
                        loading={DetentionFloorLoading}
                        options={DetentionFloorData?.results?.map(floor => (
                            {
                                value: floor.id,
                                label: floor?.floor_name
                            }
                        ))}/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" className="flex ml-auto" htmlType="submit" >
                        Update Jail Area
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditJailArea;
