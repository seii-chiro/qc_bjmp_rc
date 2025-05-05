import { CivilStatus, Gender, JailBarangay, JailMunicipality, JailProvince, JailRegion, Nationality, Person } from "@/lib/definitions"
import { getCountries, getEmploymentTypes, getHealthConditionCategories, getIdTypes, getInterests, getJail_Barangay, getJail_Municipality, getJail_Province, getJailRegion, getReligion, getSkills, getSocialMediaPlatforms, getTalents } from "@/lib/queries";
import { PERSON } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useVisitorFormStatesStore } from "@/store/visitorFormStatesStore";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Input, Select, Upload, Modal } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import CustomWebCam from "@/components/WebcamCapture"

type Props = {
    person: Person | null;
    gender: Gender[] | null;
    genderLoading: boolean;
    nationality: Nationality[] | null;
    nationalityLoading: boolean;
    civilStatus: CivilStatus[] | null;
    civilStatusLoading: boolean;
    isPDL?: boolean
}

type PersonForm = {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    shortname: string;
    gender_id: number | null;
    date_of_birth: string;
    place_of_birth: string;
    nationality_id: number | string | null;
    civil_status_id: number | string | null;
    address_data?: AddressForm[];
    contact_data?: ContactForm[];
    employment_history_data?: EmploymentHistoryForm[];
    education_background_data?: EducationBackgroundForm[];
    social_media_account_data?: SocialMediaAccountForm[];
    diagnosis_data?: DiagnosisForm[];
    talent_id?: number[];
    skill_id?: number[];
    interest_id?: number[];
    identifier_data?: IdentifierForm[];
    religion_id?: number;
    media_data?: MediaForm[];
};

type DiagnosisForm = {
    health_condition: string;
    health_condition_category_id: number;
    diagnosis_date: string;
    description: string;
    treatment_plan: string;
    record_status_id: number;
}

type IdentifierForm = {
    id_type_id: number;
    id_number: string;
    issued_by: string;
    date_issued: string;
    expiry_date: string;
    place_issued: string;
    record_status_id: number;
}

type AddressForm = {
    type: "Home" | "Work" | "Other";
    province_id: number;
    city_municipality_id: number;
    region_id: number;
    barangay_id: number;
    street: string;
    postal_code: string;
    country_id: number;
    is_current: boolean;
    record_status_id: number;
}

type ContactForm = {
    type: string;
    value: string;
}

type MediaForm = {
    media_type: "Picture" | "Video" | "Document" | "Text File";
    picture_view?: "Profile" | "Front" | "Back" | "Left" | "Right" | "Top" | "Bottom";
    media_description?: string;
    media_base64?: string;
    record_status_id?: number;
}

type EmploymentHistoryForm = {
    employer_name: string;
    job_title: string;
    employment_type_id: number;
    start_date: string;
    end_date: string;
    location: string;
    responsibilities: string;
}

type EducationBackgroundForm = {
    institution_name: string;
    degree: string;
    field_of_study: string;
    start_year: number;
    end_year: number;
    honors_recieved: string;
}

type SocialMediaAccountForm = {
    platform_id: number;
    handle: string;
    profile_url: string;
    is_primary: boolean;
}

type FieldType = 'input' | 'select';

type Field = {
    id: number;
    name: string;
    type: FieldType;
    value: string;
    placeholder: string;
    options?: { value: number | string; label: string }[];
};

const addAdditionalPersonInformation = async (payload: PersonForm, token: string, id: string | number) => {

    const res = await fetch(`${PERSON.getPERSON}${id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.email[0] || 'Error registering visitor');
    }

    return res.json()
}

const AddAdditionalPersonInfoForm = ({
    isPDL,
    person,
    nationality,
    civilStatus,
}: Props) => {
    const token = useTokenStore().token
    const setAddAdditionalPersonInfoFormDone = useVisitorFormStatesStore()?.setAddAdditionalPersonInfoFormDone

    const [cameraModalOpen, setCameraModalOpen] = useState(false)
    const [cameraFullBodyModalOpen, setCameraFullBodyModalOpen] = useState(false)
    const [cameraLeftModalOpen, setCameraLeftModalOpen] = useState(false)
    const [cameraRightModalOpen, setCameraRightModalOpen] = useState(false)

    const [image, setImage] = useState<string | null>(null);
    const [imageFullBody, setImageFullBody] = useState<string | null>(null);
    const [imageLeftSide, setImageLeftSide] = useState<string | null>(null);
    const [imageRightSide, setImageRightSide] = useState<string | null>(null);

    const [webcamKey, setWebcamKey] = useState(0);

    const handleRetake = () => {
        setImage(null);
        setWebcamKey(prev => prev + 1); // Change the key = remount WebcamCapture
    };

    const handleRetakeFullBody = () => {
        setImageFullBody(null);
        setWebcamKey(prev => prev + 1); // Change the key = remount WebcamCapture
    };

    const handleRetakeLeftSide = () => {
        setImageLeftSide(null);
        setWebcamKey(prev => prev + 1); // Change the key = remount WebcamCapture
    };

    const handleRetakeRightSide = () => {
        setImageRightSide(null);
        setWebcamKey(prev => prev + 1); // Change the key = remount WebcamCapture
    };

    const [personForm, setPersonForm] = useState<PersonForm>({
        first_name: person?.first_name ?? "",
        middle_name: person?.middle_name ?? "",
        last_name: person?.last_name ?? "",
        suffix: person?.suffix ?? "",
        shortname: person?.shortname ?? "",
        gender_id: person?.gender?.id ?? null,
        date_of_birth: person?.date_of_birth ?? "",
        place_of_birth: person?.place_of_birth ?? "",
        nationality_id: nationality?.find(nationality => nationality?.nationality === person?.nationality)?.id ?? null,
        civil_status_id: civilStatus?.find(status => status?.status === person?.civil_status)?.id ?? null,
        address_data: [],
        contact_data: [],
        employment_history_data: [],
        education_background_data: [],
        social_media_account_data: [],
        skill_id: [],
        talent_id: [],
        interest_id: [],
        identifier_data: [],
        diagnosis_data: [],
        religion_id: 1,
        media_data: [],
    })

    const [fileListWaiver1, setFileListWaiver1] = useState<UploadFile[]>([]);
    const [fileListWaiver2, setFileListWaiver2] = useState<UploadFile[]>([]);
    // const [fileListThumbmark, setFileListThumbmark] = useState<UploadFile[]>([]);
    const [fileListSignature, setFileListSignature] = useState<UploadFile[]>([]);
    // const [fileListFront, setFileListFront] = useState<UploadFile[]>([]);
    // const [fileListRightSide, setFileListRightSide] = useState<UploadFile[]>([]);
    // const [fileListFullBodyFront, setFileListFullBodyFront] = useState<UploadFile[]>([]);
    // const [fileListLeftSide, setFileListLeftSide] = useState<UploadFile[]>([]);


    const handlePreview = async (file: UploadFile) => {
        let src = file.url as string;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj as Blob);
                reader.onload = () => resolve(reader.result as string);
            });
        }
        const imgWindow = window.open(src);
        imgWindow?.document.write(`<img src='${src}' style='max-width: 100%;' />`);
    };

    const handleChangeWaiver1 = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        setFileListWaiver1(newFileList);
    };

    const handleChangeWaiver2 = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        setFileListWaiver2(newFileList);
    };

    // const handleChangeThumbmark = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    //     setFileListThumbmark(newFileList);
    // };

    const handleChangeSignature = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        setFileListSignature(newFileList);
    };

    // const handleChangeFront = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    //     setFileListFront(newFileList);
    // };

    // const handleChangeRightSide = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    //     setFileListRightSide(newFileList);
    // };

    // const handleChangeFullBodyFront = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    //     setFileListFullBodyFront(newFileList);
    // };

    // const handleChangeLeftSide = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    //     setFileListLeftSide(newFileList);
    // };

    const handleChangeIdentifierUpload = (index: number, { fileList: newFileList }: { fileList: UploadFile[] }) => {
        setFileListIdentifiers((prev) => {
            const updatedFileList = [...prev];
            updatedFileList[index] = newFileList;
            return updatedFileList;
        });
    };

    const handleRemoveMedia = (file: UploadFile, description: string) => {
        setPersonForm((prev) => {
            const updatedMediaData = (prev.media_data || []).filter(
                (media) => media.media_description !== description
            );

            return {
                ...prev,
                media_data: updatedMediaData,
            };
        });

        // Update the corresponding file list state
        if (description === "Waiver 1") {
            setFileListWaiver1((prev) => prev.filter((item) => item.uid !== file.uid));
        } else if (description === "Waiver 2") {
            setFileListWaiver2((prev) => prev.filter((item) => item.uid !== file.uid));
        } else if (description === "Signature") {
            setFileListSignature((prev) => prev.filter((item) => item.uid !== file.uid));
        }

        // else if (description === "Close-Up Front Picture") {
        //     setFileListFront((prev) => prev.filter((item) => item.uid !== file.uid));
        // } else if (description === "Full-Body Front Picture") {
        //     setFileListFullBodyFront((prev) => prev.filter((item) => item.uid !== file.uid));
        // } else if (description === "Left-Side View Picture") {
        //     setFileListLeftSide((prev) => prev.filter((item) => item.uid !== file.uid));
        // } else if (description === "Right-Side View Picture") {
        //     setFileListRightSide((prev) => prev.filter((item) => item.uid !== file.uid));
        // }
    };

    const handleRemoveIdentifierMedia = (index: number) => {
        setFileListIdentifiers((prev) => {
            const updatedFileList = [...prev];
            updatedFileList[index] = [];
            return updatedFileList;
        });
    };

    const [addressForm, setAddressForm] = useState<AddressForm[]>([])
    const [fields, setFields] = useState<Field[][]>([]);
    const [counter, setCounter] = useState(0);

    const [contactForm, setContactForm] = useState<ContactForm[]>([]);
    const [employmentHistoryForm, setEmploymentHistoryForm] = useState<EmploymentHistoryForm[]>([]);
    const [educationBackgroundForm, setEducationBackgroundForm] = useState<EducationBackgroundForm[]>([]);
    const [socialMediaAccountForm, setSocialMediaAccountForm] = useState<SocialMediaAccountForm[]>([]);
    const [diagnosisForm, setDiagnosisForm] = useState<DiagnosisForm[]>([]);
    const [identifierForm, setIdentifierForm] = useState<IdentifierForm[]>([]);

    useEffect(() => {
        setPersonForm(prev => (
            {
                ...prev,
                first_name: person?.first_name ?? "",
                middle_name: person?.middle_name ?? "",
                last_name: person?.last_name ?? "",
                suffix: person?.suffix ?? "",
                shortname: person?.shortname ?? "",
                gender_id: person?.gender?.id ?? null,
                date_of_birth: person?.date_of_birth ?? "",
                place_of_birth: person?.place_of_birth ?? "",
                nationality_id: nationality?.find(nationality => nationality?.nationality === person?.nationality)?.id ?? null,
                civil_status_id: civilStatus?.find(status => status?.status === person?.civil_status)?.id ?? null,
            }
        ))
    }, [person])

    useEffect(() => {
        setFileListIdentifiers(identifierForm.map(() => []));
    }, [identifierForm]);

    const results = useQueries({
        queries: [
            {
                //0
                queryKey: ['barangay'],
                queryFn: () => getJail_Barangay(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //1
                queryKey: ['province'],
                queryFn: () => getJail_Province(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //2
                queryKey: ['region'],
                queryFn: () => getJailRegion(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //3
                queryKey: ['country'],
                queryFn: () => getCountries(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //4
                queryKey: ['municipality'],
                queryFn: () => getJail_Municipality(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //5
                queryKey: ['religion'],
                queryFn: () => getReligion(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //6
                queryKey: ['employment-types'],
                queryFn: () => getEmploymentTypes(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //7
                queryKey: ['social-media-platform'],
                queryFn: () => getSocialMediaPlatforms(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //8
                queryKey: ['health-condition-categories'],
                queryFn: () => getHealthConditionCategories(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //9
                queryKey: ['skills'],
                queryFn: () => getSkills(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //10
                queryKey: ['talents'],
                queryFn: () => getTalents(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //11
                queryKey: ['interests'],
                queryFn: () => getInterests(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
            {
                //12
                queryKey: ['id-types'],
                queryFn: () => getIdTypes(token ?? ""),
                staleTime: 10 * 60 * 1000
            },
        ]
    })

    const addFormGroup = () => {
        const newFields: Field[] = [
            {
                id: counter,
                name: 'type',
                type: 'select',
                placeholder: 'Address Type',
                value: '',
                options: [
                    { value: 'Home', label: 'Home' },
                    { value: 'Work', label: 'Work' },
                    { value: 'Other', label: 'Other' },
                ],
            },
            {
                id: counter + 4,
                name: 'city_municipality_id',
                placeholder: 'City/Municipality',
                type: 'select',
                value: '',
                options: results[4].data?.map((municipality: JailMunicipality) => ({
                    value: municipality?.id,
                    label: municipality?.desc,
                })),
            },
            {
                id: counter + 1,
                name: 'country_id',
                placeholder: 'Country',
                type: 'select',
                value: '',
                options: results[3].data?.map((country: { id: number, code: string, country: string }) => ({
                    value: country?.id,
                    label: country?.country,
                })),
            },
            {
                id: counter + 5,
                name: 'barangay_id',
                placeholder: 'Barangay',
                type: 'select',
                value: '',
                options: results[0].data?.map((barangay: JailBarangay) => ({
                    value: barangay?.id,
                    label: barangay?.desc,
                })),
            },
            {
                id: counter + 2,
                name: 'region_id',
                placeholder: 'Region',
                type: 'select',
                value: '',
                options: results[2].data?.map((region: JailRegion) => ({
                    value: region?.id,
                    label: region?.desc,
                })),
            },
            {
                id: counter + 6,
                name: 'street',
                placeholder: 'Street',
                type: 'input',
                value: '',
            },
            {
                id: counter + 3,
                name: 'province_id',
                placeholder: 'Province',
                type: 'select',
                value: '',
                options: results[1].data?.map((province: JailProvince) => ({
                    value: province?.id,
                    label: province?.desc,
                })),
            },
            {
                id: counter + 7,
                name: 'postal_code',
                placeholder: 'Postal Code',
                type: 'input',
                value: '',
            },
        ];

        setFields((prev) => [...prev, newFields]); // Add the new group of fields as an array

        // Add a new address object to addressForm
        setAddressForm((prev) => [
            ...prev,
            {
                type: "Home",
                province_id: 0,
                city_municipality_id: 0,
                region_id: 0,
                barangay_id: 0,
                street: "",
                postal_code: "",
                country_id: 0,
                is_current: true,
                record_status_id: 1,
            },
        ]);

        setCounter((prev) => prev + newFields.length);
    };

    const addContactFormGroup = () => {
        setContactForm((prev) => [
            ...prev,
            {
                type: "",
                value: "",
            } // Add a new empty contact entry
        ]);
    };

    const addEmploymentHistoryFormGroup = () => {
        setEmploymentHistoryForm((prev) => [
            ...prev,
            {
                employer_name: "",
                job_title: "",
                employment_type_id: 0,
                start_date: "",
                end_date: "",
                location: "",
                responsibilities: "",
            },
        ]);
    };

    const addEducationBackgroundFormGroup = () => {
        setEducationBackgroundForm((prev) => [
            ...prev,
            {
                institution_name: "",
                degree: "",
                field_of_study: "",
                start_year: 0,
                end_year: 0,
                honors_recieved: "",
            },
        ]);
    };

    const addSocialMediaAccountFormGroup = () => {
        setSocialMediaAccountForm((prev) => [
            ...prev,
            {
                platform_id: 0,
                handle: "",
                profile_url: "",
                is_primary: false,
            },
        ]);
    };

    const addDiagnosisFormGroup = () => {
        setDiagnosisForm((prev) => [
            ...prev,
            {
                health_condition: "",
                health_condition_category_id: 0,
                diagnosis_date: "",
                description: "",
                treatment_plan: "",
                record_status_id: 1,
            },
        ]);
    };

    const addIdentifierFormGroup = () => {
        setIdentifierForm((prev) => [
            ...prev,
            {
                id_type_id: 0,
                id_number: "",
                issued_by: "",
                date_issued: "",
                expiry_date: "",
                place_issued: "",
                record_status_id: 1,
            },
        ]);
    };

    const addAdditionalPersonInfoMutation = useMutation({
        mutationKey: ['add-person'],
        mutationFn: () => addAdditionalPersonInformation(personForm, token ?? "", person?.id ?? ""),
        onSuccess: () => {
            setAddAdditionalPersonInfoFormDone(true)
        }
    })

    const [fileListIdentifiers, setFileListIdentifiers] = useState<UploadFile[][]>(
        identifierForm.map(() => [])
    );

    useEffect(() => {
        setPersonForm({
            first_name: person?.first_name ?? "",
            middle_name: person?.middle_name ?? "",
            last_name: person?.last_name ?? "",
            suffix: person?.suffix ?? "",
            shortname: person?.shortname ?? "",
            gender_id: person?.gender?.id ?? null,
            date_of_birth: person?.date_of_birth ?? "",
            place_of_birth: person?.place_of_birth ?? "",
            nationality_id: nationality?.find(nationality => nationality?.nationality === person?.nationality)?.id ?? null,
            civil_status_id: civilStatus?.find(status => status?.status === person?.civil_status)?.id ?? null,
            address_data: addressForm,
            contact_data: contactForm,
            employment_history_data: employmentHistoryForm,
            education_background_data: educationBackgroundForm,
            social_media_account_data: socialMediaAccountForm,
            diagnosis_data: diagnosisForm,
            identifier_data: identifierForm,
            skill_id: personForm.skill_id, // Include skill_id
            talent_id: personForm.talent_id, // Include talent_id
            interest_id: personForm.interest_id,
            media_data: personForm.media_data,
            religion_id: 1
        });
    }, [
        person,
        nationality,
        civilStatus,
        addressForm,
        contactForm,
        employmentHistoryForm,
        educationBackgroundForm,
        socialMediaAccountForm,
        diagnosisForm,
        identifierForm,
        personForm.skill_id,
        personForm.talent_id,
        personForm.interest_id,
        personForm.media_data,
    ]);

    useEffect(() => {
        setPersonForm((prev) => {
            const updatedMediaData = [
                ...(prev.media_data || []).filter(
                    (media) =>
                        !["Close-Up Front Picture", "Full-Body Front Picture", "Left-Side View Picture", "Right-Side View Picture"].includes(
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

            return {
                ...prev,
                media_data: updatedMediaData,
            };
        });
    }, [image, imageFullBody, imageLeftSide, imageRightSide]);

    const handleAddressChange = (id: number, value: string, name: string) => {
        // Update the state for fields
        setFields(prevFields =>
            prevFields.map(fieldGroup =>
                fieldGroup.map(field =>
                    field.id === id ? { ...field, value } : field
                )
            )
        );

        // Update the corresponding addressForm field
        setAddressForm(prevForm => {
            const updatedForm = [...prevForm];
            const fieldIndex = Math.floor(id / 8); // Each address group has 8 fields
            if (updatedForm[fieldIndex]) {
                updatedForm[fieldIndex] = {
                    ...updatedForm[fieldIndex],
                    [name]: value,
                };
            }
            return updatedForm;
        });
    };

    const handleContactChange = (index: number, name: string, value: string) => {
        setContactForm((prev) => {
            const updatedContacts = [...prev];
            updatedContacts[index] = {
                ...updatedContacts[index],
                [name]: value,
            };
            return updatedContacts;
        });
    };

    const handleEmploymentHistoryChange = (index: number, name: string, value: string | number) => {
        setEmploymentHistoryForm((prev) => {
            const updatedHistory = [...prev];
            updatedHistory[index] = {
                ...updatedHistory[index],
                [name]: value,
            };
            return updatedHistory;
        });
    };

    const handleEducationBackgroundChange = (index: number, name: string, value: string | number) => {
        setEducationBackgroundForm((prev) => {
            const updatedEducation = [...prev];
            updatedEducation[index] = {
                ...updatedEducation[index],
                [name]: value,
            };
            return updatedEducation;
        });
    };

    const handleSocialMediaAccountChange = (index: number, name: string, value: string | number | boolean) => {
        setSocialMediaAccountForm((prev) => {
            const updatedAccounts = [...prev];
            updatedAccounts[index] = {
                ...updatedAccounts[index],
                [name]: value,
            };
            return updatedAccounts;
        });
    };

    const handleDiagnosisChange = (index: number, name: string, value: string | number) => {
        setDiagnosisForm((prev) => {
            const updatedDiagnosis = [...prev];
            updatedDiagnosis[index] = {
                ...updatedDiagnosis[index],
                [name]: value,
            };
            return updatedDiagnosis;
        });
    };

    const handleIdentifierChange = (index: number, name: string, value: string | number) => {
        setIdentifierForm((prev) => {
            const updatedIdentifiers = [...prev];
            updatedIdentifiers[index] = {
                ...updatedIdentifiers[index],
                [name]: value,
            };
            return updatedIdentifiers;
        });
    };

    const handleMediaUpload = (file: File, description: string, pictureView?: string) => {
        const reader = new FileReader();

        reader.onload = () => {
            let base64 = reader.result as string;
            base64 = base64.replace(/^data:image\/\w+;base64,/, ""); // Remove the data:image/png;base64 prefix

            setPersonForm((prev) => {
                const updatedMediaData = (prev.media_data || []).filter(
                    (media) => media.media_description !== description
                );

                return {
                    ...prev,
                    media_data: [
                        ...updatedMediaData,
                        {
                            media_type: file.type.startsWith("image/") ? "Picture" : "Document",
                            media_base64: base64,
                            media_description: description,
                            picture_view: pictureView as "Profile" | "Front" | "Back" | "Left" | "Right" | "Top" | "Bottom" | undefined,
                            record_status_id: 1,
                        },
                    ],
                };
            });
        };

        reader.readAsDataURL(file);

        return false;
    };

    return (
        <>
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
                    <CustomWebCam key={webcamKey} onCapture={setImageFullBody} setCameraModalOpen={setCameraFullBodyModalOpen} />
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
            <div className="w-full flex flex-col gap-16">
                <form action="" className="flex flex-col gap-10 w-full">
                    <h1 className="w-full text-center font-semibold text-xl">Additional Person Information</h1>
                    <div className="w-full flex flex-col items-center justify-center">
                        <div className="flex gap-16 w-full flex-col items-center justify-center">
                            {/* <div className="flex gap-5 w-full flex-1">
                            <div className="flex flex-col gap-5 flex-1">
                                <Input value={personForm?.first_name} type="text" name="first_name" id="fname" onChange={handleInputChange} placeholder="First Name" required className="h-12 border border-gray-300 rounded-lg px-2" />
                                <Input value={personForm?.middle_name} type="text" name="middle_name" id="mname" onChange={handleInputChange} placeholder="Middle Name" className="h-12 border border-gray-300 rounded-lg px-2" />
                                <Input value={personForm?.last_name} type="text" name="last_name" id="lname" onChange={handleInputChange} placeholder="Last Name" required className="h-12 border border-gray-300 rounded-lg px-2" />
                                <Input value={personForm?.suffix} type="text" name="suffix" id="suffix" onChange={handleInputChange} placeholder="Suffix" className="h-12 border border-gray-300 rounded-lg px-2" />
                                <Input value={personForm?.shortname} type="text" name="shortname" id="shortname" onChange={handleInputChange} placeholder="Short Name" className="h-12 border border-gray-300 rounded-lg px-2" />
                            </div>

                            <div className="flex flex-col gap-5 flex-1">
                                <Input value={personForm?.date_of_birth} type="date" name="date_of_birth" id="date_of_birth" onChange={handleInputChange} className="h-12 border border-gray-300 rounded-lg px-2" />
                                <Input value={personForm?.place_of_birth} type="text" name="place_of_birth" id="pob" onChange={handleInputChange} placeholder="Place of birth" className="h-12 border border-gray-300 rounded-lg px-2" />

                                <Select
                                    value={personForm?.gender_id}
                                    className="h-[3rem] w-full"
                                    showSearch
                                    placeholder="Gender"
                                    optionFilterProp="label"
                                    onChange={(value) => {
                                        setPersonForm(prev => ({
                                            ...prev,
                                            gender_id: value
                                        }))
                                    }}
                                    loading={genderLoading}
                                    options={gender?.map(gender => ({
                                        value: gender?.id,
                                        label: gender?.gender_option,
                                    }))}
                                />

                                <Select
                                    value={personForm?.civil_status_id}
                                    className="h-[3rem] w-full"
                                    showSearch
                                    placeholder="Civil Status"
                                    optionFilterProp="label"
                                    onChange={(value) => {
                                        setPersonForm(prev => ({
                                            ...prev,
                                            civil_status_id: value
                                        }))
                                    }}
                                    loading={civilStatusLoading}
                                    options={civilStatus?.map(status => ({
                                        value: status.id,
                                        label: status?.status
                                    }))}
                                />

                                <Select
                                    value={personForm?.nationality_id}
                                    className="h-[3rem] w-full"
                                    showSearch
                                    placeholder="Nationality"
                                    optionFilterProp="label"
                                    onChange={(value) => {
                                        setPersonForm(prev => ({
                                            ...prev,
                                            nationality_id: value
                                        }))
                                    }}
                                    loading={nationalityLoading}
                                    options={nationality?.map(nationality => ({
                                        value: nationality.id,
                                        label: nationality?.nationality
                                    }))}
                                />
                            </div>
                        </div> */}

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <div className="flex gap-2 items-center">
                                    <h2>Address</h2>

                                    <button
                                        type="button"
                                        onClick={addFormGroup}
                                        className="w-7 h-7 bg-[#1976D2] text-white rounded flex justify-center items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {fields.map((fieldGroup, groupIndex) => (
                                        <div key={`header-${groupIndex}`}>
                                            <h2 className="text-sm my-2" key={`header-${groupIndex}`}>Address {groupIndex + 1}</h2>
                                            <div key={groupIndex} className="grid grid-cols-2 gap-x-20 gap-y-4">
                                                {fieldGroup.map((field) => (
                                                    <div key={field.id}>
                                                        {field.type === 'input' ? (
                                                            <Input
                                                                className="h-10"
                                                                placeholder={field?.placeholder}
                                                                value={field.value}
                                                                onChange={(e) => handleAddressChange(field.id, e.target.value, field.name)}
                                                            />
                                                        ) : (
                                                            <Select
                                                                className="h-10"
                                                                showSearch
                                                                optionFilterProp="label"
                                                                placeholder={`Select ${field?.placeholder}`}
                                                                value={field.value || undefined}
                                                                style={{ width: '100%' }}
                                                                options={field.options}
                                                                onChange={(value) => handleAddressChange(field.id, value, field.name)}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <div className="flex gap-2 items-center">
                                    <h2>Contact</h2>

                                    <button
                                        type="button"
                                        onClick={addContactFormGroup}
                                        className="w-7 h-7 bg-[#1976D2] text-white rounded flex justify-center items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 w-[47.5%]">
                                    {contactForm.map((contact, index) => (
                                        <div key={`contact-${index}`} className="flex flex-col gap-4">
                                            <h2 className="text-sm">Contact {index + 1}</h2>
                                            <Input
                                                className="h-10"
                                                placeholder="Contact Type (e.g., Phone, Email)"
                                                value={contact.type}
                                                onChange={(e) =>
                                                    handleContactChange(index, "type", e.target.value)
                                                }
                                            />
                                            <Input
                                                className="h-10"
                                                placeholder="Contact Value"
                                                value={contact.value}
                                                onChange={(e) =>
                                                    handleContactChange(index, "value", e.target.value)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <div className="flex gap-2 items-center">
                                    <h2>Employment History</h2>
                                    <button
                                        type="button"
                                        onClick={addEmploymentHistoryFormGroup}
                                        className="w-7 h-7 bg-[#1976D2] text-white rounded flex justify-center items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {employmentHistoryForm.map((history, index) => (
                                        <div key={`employment-${index}`} className="flex flex-col gap-2">
                                            <h2 className="text-sm">Employment History {index + 1}</h2>
                                            <div className="flex w-full gap-20">
                                                <div className="flex-1 flex flex-col gap-4">
                                                    <Input
                                                        className="h-10"
                                                        placeholder="Employer Name"
                                                        value={history.employer_name}
                                                        onChange={(e) =>
                                                            handleEmploymentHistoryChange(index, "employer_name", e.target.value)
                                                        }
                                                    />
                                                    <Input
                                                        className="h-10"
                                                        placeholder="Job Title"
                                                        value={history.job_title}
                                                        onChange={(e) =>
                                                            handleEmploymentHistoryChange(index, "job_title", e.target.value)
                                                        }
                                                    />
                                                    <Select
                                                        className="h-10"
                                                        placeholder="Employment Type"
                                                        value={history.employment_type_id || undefined}
                                                        options={results[6]?.data?.map(employmentType => ({
                                                            value: employmentType.id,
                                                            label: employmentType?.employment_type,
                                                        }))}
                                                        onChange={(value) =>
                                                            handleEmploymentHistoryChange(index, "employment_type_id", value)
                                                        }
                                                    />
                                                    <label htmlFor="start_date" className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold flex-1">Start Date:</span>
                                                        <Input
                                                            className="flex-[6] h-10"
                                                            id="start_date"
                                                            placeholder="Start Date"
                                                            type="date"
                                                            value={history.start_date}
                                                            onChange={(e) =>
                                                                handleEmploymentHistoryChange(index, "start_date", e.target.value)
                                                            }
                                                        />
                                                    </label>

                                                    <label htmlFor="start_date" className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold flex-1">End Date:</span>
                                                        <Input
                                                            className="flex-[6] h-10"
                                                            placeholder="End Date"
                                                            type="date"
                                                            value={history.end_date}
                                                            onChange={(e) =>
                                                                handleEmploymentHistoryChange(index, "end_date", e.target.value)
                                                            }
                                                        />
                                                    </label>
                                                </div>
                                                <div className="flex-1 flex flex-col gap-4">
                                                    <Input
                                                        className="h-10"
                                                        placeholder="Location"
                                                        value={history.location}
                                                        onChange={(e) =>
                                                            handleEmploymentHistoryChange(index, "location", e.target.value)
                                                        }
                                                    />
                                                    <Input
                                                        className="h-10"
                                                        placeholder="Responsibilities"
                                                        value={history.responsibilities}
                                                        onChange={(e) =>
                                                            handleEmploymentHistoryChange(index, "responsibilities", e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <div className="flex gap-2 items-center">
                                    <h2>Education Background</h2>
                                    <button
                                        type="button"
                                        onClick={addEducationBackgroundFormGroup}
                                        className="w-7 h-7 bg-[#1976D2] text-white rounded flex justify-center items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 w-[47.5%]">
                                    {educationBackgroundForm.map((education, index) => (
                                        <div key={`education-${index}`} className="flex flex-col gap-2">
                                            <h2 className="text-sm">Education {index + 1}</h2>
                                            <Input
                                                className="h-10"
                                                placeholder="Institution Name"
                                                value={education.institution_name}
                                                onChange={(e) =>
                                                    handleEducationBackgroundChange(index, "institution_name", e.target.value)
                                                }
                                            />
                                            <Input
                                                className="h-10"
                                                placeholder="Degree"
                                                value={education.degree}
                                                onChange={(e) =>
                                                    handleEducationBackgroundChange(index, "degree", e.target.value)
                                                }
                                            />
                                            <Input
                                                className="h-10"
                                                placeholder="Field of Study"
                                                value={education.field_of_study}
                                                onChange={(e) =>
                                                    handleEducationBackgroundChange(index, "field_of_study", e.target.value)
                                                }
                                            />
                                            <label className="flex items-center gap-2">
                                                <span className="text-sm font-semibold flex-1">Start Year:</span>
                                                <Input
                                                    className="flex-[6] h-10"
                                                    placeholder="Start Year"
                                                    type="number"
                                                    value={education.start_year}
                                                    onChange={(e) =>
                                                        handleEducationBackgroundChange(index, "start_year", parseInt(e.target.value, 10))
                                                    }
                                                />
                                            </label>

                                            <label className="flex items-center gap-2">
                                                <span className="text-sm font-semibold flex-1">End Year:</span>
                                                <Input
                                                    className="flex-[6] h-10"
                                                    placeholder="End Year"
                                                    type="number"
                                                    value={education.end_year}
                                                    onChange={(e) =>
                                                        handleEducationBackgroundChange(index, "end_year", parseInt(e.target.value, 10))
                                                    }
                                                />
                                            </label>

                                            <Input
                                                className="h-10"
                                                placeholder="Honors Received"
                                                value={education.honors_recieved}
                                                onChange={(e) =>
                                                    handleEducationBackgroundChange(index, "honors_recieved", e.target.value)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full flex gap-20">
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="w-full flex flex-col gap-2">
                                        <h2 className="text-lg font-semibold">Religion</h2>
                                        <Select
                                            className="w-full h-10"
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Religion"
                                            options={results[5]?.data?.map(religion => ({
                                                value: religion.id,
                                                label: religion?.name,
                                            }))}
                                            onChange={(value) => {
                                                setPersonForm(prev => ({
                                                    ...prev,
                                                    religion_id: value
                                                }))
                                            }}
                                        />
                                    </div>

                                    <div className="w-full flex flex-col gap-2">
                                        <h2 className="text-lg font-semibold">Skills</h2>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Skills"
                                            value={personForm.skill_id || []} // Bind to personForm.skill_id
                                            className="w-full h-10"
                                            showSearch
                                            optionFilterProp="label"
                                            onChange={(values) => {
                                                setPersonForm((prev) => ({
                                                    ...prev,
                                                    skill_id: values, // Update skill_id directly in personForm
                                                }));
                                            }}
                                            options={results[9]?.data?.map((skill) => ({
                                                value: skill.id,
                                                label: skill.name,
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex gap-2 items-center">
                                            <h2 className="text-lg font-semibold">Talents</h2>
                                        </div>

                                        <Select
                                            mode="multiple"
                                            placeholder="Select Talents"
                                            value={personForm.talent_id || []} // Bind to personForm.talent_id
                                            className="w-full h-10"
                                            showSearch
                                            optionFilterProp="label"
                                            onChange={(values) => {
                                                setPersonForm((prev) => ({
                                                    ...prev,
                                                    talent_id: values, // Update talent_id directly in personForm
                                                }));
                                            }}
                                            options={results[10]?.data?.map((talent) => ({
                                                value: talent.id,
                                                label: talent.name,
                                            }))}
                                        />
                                    </div>

                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex gap-2 items-center">
                                            <h2 className="text-lg font-semibold">Interests</h2>
                                        </div>

                                        <Select
                                            mode="multiple"
                                            placeholder="Select Interests"
                                            value={personForm.interest_id || []} // Bind to personForm.interest_id
                                            className="w-full h-10"
                                            showSearch
                                            optionFilterProp="label"
                                            onChange={(values) => {
                                                setPersonForm((prev) => ({
                                                    ...prev,
                                                    interest_id: values, // Update interest_id directly in personForm
                                                }));
                                            }}
                                            options={results[11]?.data?.map((interest) => ({
                                                value: interest.id,
                                                label: interest.name,
                                            }))}
                                        />
                                    </div>

                                </div>
                            </div>



                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                            </div>

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <div className="flex gap-2 items-center">
                                    <h2>Identifiers (IDs)</h2>
                                    <button
                                        type="button"
                                        onClick={addIdentifierFormGroup}
                                        className="w-7 h-7 bg-[#1976D2] text-white rounded flex justify-center items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 w-[47.5%]">
                                    {identifierForm.map((identifier, index) => (
                                        <div key={`identifier-${index}`} className="flex flex-col gap-4">
                                            <h2 className="text-sm">Identifier {index + 1}</h2>
                                            <Select
                                                className="h-10"
                                                placeholder="ID Type"
                                                value={identifier.id_type_id || undefined}
                                                options={results[12]?.data?.map((idType) => ({
                                                    value: idType.id,
                                                    label: idType?.id_type,
                                                }))}
                                                onChange={(value) =>
                                                    handleIdentifierChange(index, "id_type_id", value)
                                                }
                                            />
                                            <Input
                                                className="h-10"
                                                placeholder="ID Number"
                                                value={identifier.id_number}
                                                onChange={(e) =>
                                                    handleIdentifierChange(index, "id_number", e.target.value)
                                                }
                                            />
                                            <Input
                                                className="h-10"
                                                placeholder="Issued By"
                                                value={identifier.issued_by}
                                                onChange={(e) =>
                                                    handleIdentifierChange(index, "issued_by", e.target.value)
                                                }
                                            />
                                            <label className="flex items-center gap-2">
                                                <span className="text-sm font-semibold flex-1">Date Issued:</span>
                                                <Input
                                                    className="flex-[5] h-10"
                                                    placeholder="Date Issued"
                                                    type="date"
                                                    value={identifier.date_issued}
                                                    onChange={(e) =>
                                                        handleIdentifierChange(index, "date_issued", e.target.value)
                                                    }
                                                />
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <span className="text-sm font-semibold flex-1">Expiry Date:</span>
                                                <Input
                                                    className="flex-[5] h-10"
                                                    placeholder="Expiry Date"
                                                    type="date"
                                                    value={identifier.expiry_date}
                                                    onChange={(e) =>
                                                        handleIdentifierChange(index, "expiry_date", e.target.value)
                                                    }
                                                />
                                            </label>
                                            <Input
                                                className="h-10"
                                                placeholder="Place Issued"
                                                value={identifier.place_issued}
                                                onChange={(e) =>
                                                    handleIdentifierChange(index, "place_issued", e.target.value)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <div className="flex gap-2 items-center">
                                    <h2>Social Media Accounts</h2>
                                    <button
                                        type="button"
                                        onClick={addSocialMediaAccountFormGroup}
                                        className="w-7 h-7 bg-[#1976D2] text-white rounded flex justify-center items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 w-[47.5%]">
                                    {socialMediaAccountForm.map((account, index) => (
                                        <div key={`social-media-${index}`} className="flex flex-col gap-4">
                                            <h2 className="text-sm">Social Media Account {index + 1}</h2>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={account.is_primary}
                                                    onChange={(e) =>
                                                        handleSocialMediaAccountChange(index, "is_primary", e.target.checked)
                                                    }
                                                />
                                                <span className="text-sm">Set as Primary</span>
                                            </label>
                                            <Select
                                                className="h-10"
                                                placeholder="Platform"
                                                value={account.platform_id || undefined}
                                                options={results[7]?.data?.map(platform => ({
                                                    value: platform.id,
                                                    label: platform?.platform_name,
                                                }))}
                                                onChange={(value) =>
                                                    handleSocialMediaAccountChange(index, "platform_id", value)
                                                }
                                            />
                                            <Input
                                                className="h-10"
                                                placeholder="Handle (e.g., @username)"
                                                value={account.handle}
                                                onChange={(e) =>
                                                    handleSocialMediaAccountChange(index, "handle", e.target.value)
                                                }
                                            />
                                            <Input
                                                className="h-10"
                                                placeholder="Profile URL"
                                                value={account.profile_url}
                                                onChange={(e) =>
                                                    handleSocialMediaAccountChange(index, "profile_url", e.target.value)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <div className="flex gap-2 items-center">
                                    <h2>Diagnosis</h2>
                                    <button
                                        type="button"
                                        onClick={addDiagnosisFormGroup}
                                        className="w-7 h-7 bg-[#1976D2] text-white rounded flex justify-center items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    {diagnosisForm.map((diagnosis, index) => (
                                        <div key={`diagnosis-${index}`} className="flex flex-col gap-2 w-full">
                                            <h2 className="text-sm">Diagnosis {index + 1}</h2>
                                            <div className="flex w-full gap-20">
                                                <div className="flex-1 flex flex-col gap-4">
                                                    <Input
                                                        className="h-10"
                                                        placeholder="Health Condition"
                                                        value={diagnosis.health_condition}
                                                        onChange={(e) =>
                                                            handleDiagnosisChange(index, "health_condition", e.target.value)
                                                        }
                                                    />
                                                    <Select
                                                        className="h-10"
                                                        placeholder="Health Condition Category"
                                                        value={diagnosis.health_condition_category_id || undefined}
                                                        options={results[8]?.data?.map((category) => ({
                                                            value: category.id,
                                                            label: category?.category_name,
                                                        }))}
                                                        onChange={(value) =>
                                                            handleDiagnosisChange(index, "health_condition_category_id", value)
                                                        }
                                                    />
                                                    <label className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold flex-1">Diagnosis Date:</span>
                                                        <Input
                                                            className="flex-[4] h-10"
                                                            placeholder="Diagnosis Date"
                                                            type="date"
                                                            value={diagnosis.diagnosis_date}
                                                            onChange={(e) =>
                                                                handleDiagnosisChange(index, "diagnosis_date", e.target.value)
                                                            }
                                                        />
                                                    </label>
                                                </div>
                                                <div className="flex-1 flex flex-col gap-4">
                                                    <Input
                                                        className="h-10"
                                                        placeholder="Description"
                                                        value={diagnosis.description}
                                                        onChange={(e) =>
                                                            handleDiagnosisChange(index, "description", e.target.value)
                                                        }
                                                    />
                                                    <Input
                                                        className="h-10"
                                                        placeholder="Treatment Plan"
                                                        value={diagnosis.treatment_plan}
                                                        onChange={(e) =>
                                                            handleDiagnosisChange(index, "treatment_plan", e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="w-full font-semibold text-lg flex flex-col gap-10">
                                <h2>Uploads</h2>

                                {
                                    !isPDL && (
                                        <div className="w-full flex gap-10">
                                            {/* Waiver 1 */}
                                            <div className="flex flex-col gap-1 justify-center text-xs">
                                                <h3 className="text-sm">Waiver 1</h3>
                                                <Upload
                                                    className="custom-upload-card"
                                                    listType="picture-card"
                                                    fileList={fileListWaiver1}
                                                    onPreview={handlePreview}
                                                    onChange={handleChangeWaiver1}
                                                    onRemove={(file) => handleRemoveMedia(file, "Waiver 1")}
                                                    beforeUpload={(file) => handleMediaUpload(file, "Waiver 1")}
                                                    accept="image/*"
                                                >
                                                    {fileListWaiver1.length < 1 && <div>Upload</div>}
                                                </Upload>
                                            </div>

                                            {/* Waiver 2 */}
                                            <div className="flex flex-col gap-1 justify-center text-xs">
                                                <h3 className="text-sm">Waiver 2</h3>
                                                <Upload
                                                    className="custom-upload-card"
                                                    listType="picture-card"
                                                    fileList={fileListWaiver2}
                                                    onPreview={handlePreview}
                                                    onChange={handleChangeWaiver2}
                                                    onRemove={(file) => handleRemoveMedia(file, "Waiver 2")}
                                                    beforeUpload={(file) => handleMediaUpload(file, "Waiver 2")}
                                                    accept="image/*"
                                                >
                                                    {fileListWaiver2.length < 1 && <div>Upload</div>}
                                                </Upload>
                                            </div>

                                            {/* Thumbmark */}
                                            {/* <div className="flex flex-col gap-1 items-center justify-center text-sm">
                                    <h3>Thumbmark</h3>
                                    <Upload
                                        listType="picture-card"
                                        fileList={fileListThumbmark}
                                        onPreview={handlePreview}
                                        onChange={handleChangeThumbmark}
                                        beforeUpload={(file) => handleMediaUpload(file, "Thumbmark")}
                                        accept="image/*"
                                    >
                                        {fileListThumbmark.length < 1 && <div>Upload</div>}
                                    </Upload>
                                </div> */}

                                            {/* Signature */}
                                            <div className="flex flex-col gap-1 justify-center text-xs">
                                                <h3>Signature</h3>
                                                <Upload
                                                    className="custom-upload-card"
                                                    listType="picture-card"
                                                    fileList={fileListSignature}
                                                    onPreview={handlePreview}
                                                    onChange={handleChangeSignature}
                                                    onRemove={(file) => handleRemoveMedia(file, "Signature")}
                                                    beforeUpload={(file) => handleMediaUpload(file, "Signature")}
                                                    accept="image/*"
                                                >
                                                    {fileListSignature.length < 1 && <div>Upload</div>}
                                                </Upload>
                                            </div>
                                        </div>
                                    )
                                }

                                <div className="flex gap-4 w-full">
                                    <div className="flex-1">
                                        <div className="flex flex-col items-center gap-2">
                                            {
                                                image ? (
                                                    <img src={image ?? ""} className="rounded w-full" />
                                                ) : (
                                                    <div className="border border-dashed border-black rounded h-48 w-80">

                                                    </div>
                                                )
                                            }
                                            <h3 className="text-sm">Close-Up Front Picture</h3>
                                            <button
                                                onClick={() => {
                                                    setCameraModalOpen(true)
                                                    handleRetake()
                                                }}
                                                className="bg-blue-600 text-white py-1 px-3 text-center rounded text-sm"
                                                type="button"
                                            >
                                                Capture
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col items-center gap-2">
                                            {
                                                imageFullBody ? (
                                                    <img src={imageFullBody ?? ""} className="rounded" />
                                                ) : (
                                                    <div className="border border-dashed border-black rounded h-48 w-80">

                                                    </div>
                                                )
                                            }
                                            <h3 className="text-sm">Full-Body Front Picture</h3>
                                            <button
                                                onClick={() => {
                                                    setCameraFullBodyModalOpen(true)
                                                    handleRetakeFullBody()
                                                }}
                                                className="bg-blue-600 text-white py-1 px-3 text-center rounded text-sm"
                                                type="button"
                                            >
                                                Capture
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col items-center gap-2">
                                            {
                                                imageLeftSide ? (
                                                    <img src={imageLeftSide ?? ""} className="rounded" />
                                                ) : (
                                                    <div className="border border-dashed border-black rounded h-48 w-80">

                                                    </div>
                                                )
                                            }
                                            <h3 className="text-sm">Left-Side View Picture</h3>
                                            <button
                                                onClick={() => {
                                                    setCameraLeftModalOpen(true)
                                                    handleRetakeLeftSide()
                                                }}
                                                className="bg-blue-600 text-white py-1 px-3 text-center rounded text-sm"
                                                type="button"
                                            >
                                                Capture
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col items-center gap-2">
                                            {
                                                imageRightSide ? (
                                                    <img src={imageRightSide ?? ""} className="rounded" />
                                                ) : (
                                                    <div className="border border-dashed border-black rounded h-48 w-80">

                                                    </div>
                                                )
                                            }
                                            <h3 className="text-sm">Right-Side View Picture</h3>
                                            <button
                                                onClick={() => {
                                                    setCameraRightModalOpen(true)
                                                    handleRetakeRightSide()
                                                }}
                                                className="bg-blue-600 text-white py-1 px-3 text-center rounded text-sm"
                                                type="button"
                                            >
                                                Capture
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="w-full flex gap-10 text-sm">
                                  
                                    <div className="flex flex-col gap-1 justify-center text-xs">
                                        <h3>Close-Up Front Picture</h3>
                                        <Upload
                                            className="custom-upload-card"
                                            listType="picture-card"
                                            fileList={fileListFront}
                                            onPreview={handlePreview}
                                            onChange={handleChangeFront}
                                            onRemove={(file) => handleRemoveMedia(file, "Close-Up Front Picture")}
                                            beforeUpload={(file) => handleMediaUpload(file, "Close-Up Front Picture", "Front")}
                                            accept="image/*"
                                        >
                                            {fileListFront.length < 1 && <div>Upload</div>}
                                        </Upload>
                                    </div>

                            
                                    <div className="flex flex-col gap-1 justify-center text-xs">
                                        <h3>Full-Body Front Picture</h3>
                                        <Upload
                                            className="custom-upload-card"
                                            listType="picture-card"
                                            fileList={fileListFullBodyFront}
                                            onPreview={handlePreview}
                                            onChange={handleChangeFullBodyFront}
                                            onRemove={(file) => handleRemoveMedia(file, "Full-Body Front Picture")}
                                            beforeUpload={(file) => handleMediaUpload(file, "Full-Body Front Picture", "Front")}
                                            accept="image/*"
                                        >
                                            {fileListFullBodyFront.length < 1 && <div>Upload</div>}
                                        </Upload>
                                        <button
                                            onClick={() => {
                                                setCameraFullBodyModalOpen(true)
                                                handleRetakeFullBody()
                                            }}
                                            className="bg-blue-600 text-white py-1 text-center rounded"
                                            type="button"
                                        >
                                            Capture
                                        </button>
                                    </div>

                              
                                    <div className="flex flex-col gap-1 justify-center text-xs">
                                        <h3>Left-Side View Picture</h3>
                                        <Upload
                                            className="custom-upload-card"
                                            listType="picture-card"
                                            fileList={fileListLeftSide}
                                            onPreview={handlePreview}
                                            onChange={handleChangeLeftSide}
                                            onRemove={(file) => handleRemoveMedia(file, "Left-Side View Picture")}
                                            beforeUpload={(file) => handleMediaUpload(file, "Left-Side View Picture", "Left")}
                                            accept="image/*"
                                        >
                                            {fileListLeftSide.length < 1 && <div>Upload</div>}
                                        </Upload>
                                        <button
                                            onClick={() => {
                                                setCameraLeftModalOpen(true)
                                                handleRetakeLeftSide()
                                            }}
                                            className="bg-blue-600 text-white py-1 text-center rounded"
                                            type="button"
                                        >
                                            Capture
                                        </button>
                                    </div>

                                   
                                    <div className="flex flex-col gap-1 justify-center text-xs">
                                        <h3>Right-Side View Picture</h3>
                                        <Upload
                                            className="custom-upload-card"
                                            listType="picture-card"
                                            fileList={fileListRightSide}
                                            onPreview={handlePreview}
                                            onChange={handleChangeRightSide}
                                            onRemove={(file) => handleRemoveMedia(file, "Right-Side View Picture")}
                                            beforeUpload={(file) => handleMediaUpload(file, "Right-Side View Picture", "Right")}
                                            accept="image/*"
                                        >
                                            {fileListRightSide.length < 1 && <div>Upload</div>}
                                        </Upload>
                                        <button
                                            onClick={() => {
                                                setCameraRightModalOpen(true)
                                                handleRetakeRightSide()
                                            }}
                                            className="bg-blue-600 text-white py-1 text-center rounded"
                                            type="button"
                                        >
                                            Capture
                                        </button>
                                    </div>
                                </div> */}

                            </div>

                            <div className="w-full font-semibold text-lg flex flex-col gap-6">
                                <h2>Upload ID/s</h2>
                                <div className="flex gap-10">
                                    {identifierForm.map((_, index) => (
                                        <div key={`identifier-upload-${index}`} className="flex flex-col gap-1 justify-center text-xs">
                                            <h3>ID {index + 1}</h3>
                                            <Upload
                                                className="custom-upload-card"
                                                listType="picture-card"
                                                fileList={fileListIdentifiers[index]}
                                                onChange={(fileList) => handleChangeIdentifierUpload(index, fileList)}
                                                onRemove={() => handleRemoveIdentifierMedia(index)}
                                                beforeUpload={(file) => {
                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        const base64 = (reader.result as string).replace(/^data:image\/\w+;base64,/, "");
                                                        setPersonForm((prev) => {
                                                            const updatedMediaData = [...(prev.media_data || [])];
                                                            updatedMediaData.push({
                                                                media_type: "Picture",
                                                                media_base64: base64,
                                                                media_description: `Identifier ${index + 1} Upload`,
                                                                record_status_id: 1,
                                                            });
                                                            return { ...prev, media_data: updatedMediaData };
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                    return false;
                                                }}
                                                accept="image/*"
                                            >
                                                {fileListIdentifiers[index]?.length < 1 && <div>Upload</div>}
                                            </Upload>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-[20%]">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        addAdditionalPersonInfoMutation.mutate()
                                    }}
                                    className="bg-[#1976D2] text-white font-semibold px-3 py-1.5 rounded-lg flex justify-center items-center w-full"
                                >
                                    Submit
                                </button>
                            </div>

                        </div>
                    </div>
                </form >
            </div >
        </>
    )
}

export default AddAdditionalPersonInfoForm