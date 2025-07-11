/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatePicker,
  Input,
  message,
  Modal,
  Select,
  Table,
  Tooltip,
} from "antd";
import { Plus } from "lucide-react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import AddAddress from "../visitor-data-entry/AddAddress";
import { useEffect, useState } from "react";
import VisitorProfile from "../visitor-data-entry/visitorprofile";
import Issue from "../visitor-data-entry/Issue";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  getCivilStatus,
  getCountries,
  getCurrentUser,
  getGenders,
  getJail_Barangay,
  getJail_Municipality,
  getJail_Province,
  getJailRegion,
  getNationalities,
  getPrefixes,
  getReligion,
  getSuffixes,
  getUsers,
  getVisitorAppStatus,
} from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { PersonForm, ServiceProviderForm } from "@/lib/visitorFormDefinition";
import { calculateAge } from "@/functions/calculateAge";
import { ColumnsType } from "antd/es/table";
import ContactForm from "../visitor-data-entry/ContactForm";
import Remarks from "./Remarks";
import { BiometricRecordFace } from "@/lib/scanner-definitions";
import { BASE_URL, BIOMETRIC, PERSON } from "@/lib/urls";
import Identifiers from "../personnel-data-entry/Identifiers";
import {
  getGroupAffiliations,
  getProvidedServices,
  getServiceProviderTypes,
} from "@/lib/additionalQueries";
import { sanitizeRFID } from "@/functions/sanitizeRFIDInput";
import { useLocation } from "react-router-dom";
import Spinner from "@/components/loaders/Spinner";
import { EnrolledBiometrics } from "../edit-visitor/EditVisitor";
import dayjs from "dayjs";

const patchPerson = async (payload: PersonForm, token: string, id: string) => {
  const res = await fetch(`${PERSON.postPERSON}${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.email?.[0] || "Error updating person");
  }

  return res.json();
};

const patchServiceProvider = async (
  visitor: ServiceProviderForm,
  token: string,
  id: number
) => {
  const res = await fetch(
    `${BASE_URL}/api/service-providers/service-providers/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(visitor),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(JSON.stringify(errorData));
  }

  return res.json();
};

const enrollBiometrics = async (
  enrollForm: BiometricRecordFace
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const response = await fetch(BIOMETRIC.ENROLL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(enrollForm),
  });

  if (!response.ok) {
    throw new Error("Failed to enroll biometric data");
  }

  return response.json();
};

const ServiceProviderUpdate = () => {
  const token = useTokenStore()?.token;
  const location = useLocation();
  const serviceProviderToEdit = location?.state || null;

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [editAddressIndex, setEditAddressIndex] = useState<number | null>(null);
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);

  const [personForm, setPersonForm] = useState<PersonForm>({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: null,
    prefix: null,
    shortname: "",
    gender_id: null,
    date_of_birth: "",
    place_of_birth: "",
    nationality_id: null,
    civil_status_id: null,
    address_data: [],
    contact_data: [],
    employment_history_data: [],
    education_background_data: [],
    social_media_account_data: [],
    skill_id: [],
    talent_id: [],
    interest_id: [],
    media_identifier_data: [],
    media_requirement_data: [],
    diagnosis_data: [],
    religion_id: 1,
    media_data: [],
    multiple_birth_sibling_data: [],
    affiliation_id: [],
  });
  const [serviceProviderForm, setServiceProviderForm] =
    useState<ServiceProviderForm>({
      person: null,
      id_number: "",
      sp_reg_no: "",
      visitor_status: null,
      remarks_data: [],
      approved_by_id: null,
      verified_by_id: null,
      visitor_type_id: null,
      record_status_id: 1,
      service_type_id: null,
      remarks_many_data: [],
      group_affiliation_id: null,
      approved_at: "",
      verified_at: "",
      provided_service: null,
    });

  const [enrolledBiometrics, setEnrolledBiometrics] =
    useState<EnrolledBiometrics>({
      rightIrisIsEnrolled: false,
      leftIrisIsEnrolled: false,
      rightLittleIsEnrolled: false,
      rightRingIsEnrolled: false,
      rightMiddleIsEnrolled: false,
      rightIndexIsEnrolled: false,
      rightThumbIsEnrolled: false,
      leftLittleIsEnrolled: false,
      leftRingIsEnrolled: false,
      leftMiddleIsEnrolled: false,
      leftIndexIsEnrolled: false,
      leftThumbIsEnrolled: false,
      faceIsEnrolled: false,
    });

  const [icao, setIcao] = useState("");

  const [enrollFormFace, setEnrollFormFace] = useState<BiometricRecordFace>({
    remarks: "Test",
    person: 0,
    biometric_type: "face",
    position: "face",
    place_registered: "Quezon City",
    upload_data: icao ?? "",
  });

  const [enrollFormLeftIris, setEnrollFormLeftIris] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "iris",
      position: "iris_left",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollFormRightIris, setEnrollFormRightIris] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "iris",
      position: "iris_right",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollLeftLittleFinger, setEnrollLeftLittleFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint", // Always face for this case
      position: "finger_left_little", // Position for left little finger
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollLeftRingFinger, setEnrollLeftRingFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_left_ring",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollLeftMiddleFinger, setEnrollLeftMiddleFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_left_middle",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollLeftIndexFinger, setEnrollLeftIndexFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_left_index",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollRightLittleFinger, setEnrollRightLittleFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_right_little",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollRightRingFinger, setEnrollRightRingFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_right_ring",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollRightMiddleFinger, setEnrollRightMiddleFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_right_middle",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollRightIndexFinger, setEnrollRightIndexFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_right_index",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollLeftThumbFinger, setEnrollLeftThumbFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_left_thumb",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const [enrollRightThumbFinger, setEnrollRightThumbFinger] =
    useState<BiometricRecordFace>({
      remarks: "",
      person: 0,
      biometric_type: "fingerprint",
      position: "finger_right_thumb",
      place_registered: "Quezon City",
      upload_data: "",
    });

  const showAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleAddressCancel = () => {
    setIsAddressModalOpen(false);
  };

  const showContactModal = () => {
    setIsContactModalOpen(true);
  };

  const handleContactCancel = () => {
    setIsContactModalOpen(false);
  };

  //Edit Handlers
  const handleEditAddress = (index: number) => {
    setEditAddressIndex(index);
    setIsAddressModalOpen(true);
  };

  const handleEditContact = (index: number) => {
    setEditContactIndex(index);
    setIsContactModalOpen(true);
  };

  const { data: serviceProviderData, isLoading: serviceProviderLoading } =
    useQuery({
      queryKey: ["service-provider", serviceProviderToEdit],
      queryFn: async () => {
        const res = await fetch(
          `${BASE_URL}/api/service-providers/service-providers/${serviceProviderToEdit}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch service provider ${serviceProviderToEdit} data.`
          );
        }

        return res.json();
      },
    });

  //Delete Handlers
  const handleDeleteAddress = (indexToDelete: number) => {
    Modal.confirm({
      centered: true,
      title: "Are you sure you want to delete this address?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setPersonForm((prev) => ({
          ...prev,
          address_data: prev?.address_data?.filter(
            (_, i) => i !== indexToDelete
          ),
        }));
      },
    });
  };

  const handleDeleteContact = (indexToDelete: number) => {
    Modal.confirm({
      centered: true,
      title: "Are you sure you want to delete this contact?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setPersonForm((prev) => ({
          ...prev,
          contact_data: prev?.contact_data?.filter(
            (_, i) => i !== indexToDelete
          ),
        }));
      },
    });
  };

  // const deleteRemarksByIndex = (index: number) => {
  //     setServiceProviderForm(prev => ({
  //         ...prev,
  //         remarks_data: prev?.remarks_data?.filter((_, i) => i !== index),
  //     }))
  // }

  const deleteRemarksByIndex = (index: number) => {
    setServiceProviderForm((prev) => ({
      ...prev,
      remarks_many_data: prev?.remarks_many_data?.filter((_, i) => i !== index),
    }));
  };

  const dropdownOptions = useQueries({
    queries: [
      {
        queryKey: ["get-affiliations"],
        queryFn: () => getGroupAffiliations(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["person-gender"],
        queryFn: () => getGenders(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["person-nationality"],
        queryFn: () => getNationalities(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["person-civil-status"],
        queryFn: () => getCivilStatus(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["religion"],
        queryFn: () => getReligion(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["regions"],
        queryFn: () => getJailRegion(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["provinces"],
        queryFn: () => getJail_Province(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["city/municipality"],
        queryFn: () => getJail_Municipality(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["barangays"],
        queryFn: () => getJail_Barangay(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["countries"],
        queryFn: () => getCountries(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["visitor-type"],
        queryFn: () => getServiceProviderTypes(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["users"],
        queryFn: () => getUsers(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["visitor-app-status"],
        queryFn: () => getVisitorAppStatus(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["current-user"],
        queryFn: () => getCurrentUser(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["prefix"],
        queryFn: () => getPrefixes(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["suffix"],
        queryFn: () => getSuffixes(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["service-provided", "update"],
        queryFn: () => getProvidedServices(token ?? ""),
        staleTime: 10 * 60 * 1000,
      },
    ],
  });

  const enrollFaceMutation = useMutation({
    mutationKey: ["enroll-face-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollFormFace, person: id }),
    onSuccess: () => message.success("Successfully enrolled Face"),
    onError: () => message.error("Failed to Enroll Face"),
  });

  const enrollLeftMutation = useMutation({
    mutationKey: ["enroll-left-iris-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollFormLeftIris, person: id }),
    onSuccess: () => message.success("Successfully enrolled Left Iris"),
    onError: () => message.error("Failed to Enroll Left Iris"),
  });

  const enrollRightMutation = useMutation({
    mutationKey: ["enroll-right-iris-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollFormRightIris, person: id }),
    onSuccess: () => message.success("Successfully enrolled Right Iris"),
    onError: () => message.error("Failed to Enroll Right Iris"),
  });

  const enrollLeftLittleMutation = useMutation({
    mutationKey: ["enroll-left-little-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollLeftLittleFinger, person: id }),
    onSuccess: () =>
      message.success("Successfully enrolled Left Little Finger"),
    onError: () => message.error("Failed to Enroll Left Little Finger"),
  });

  const enrollLeftRingMutation = useMutation({
    mutationKey: ["enroll-left-ring-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollLeftRingFinger, person: id }),
    onSuccess: () => message.success("Successfully enrolled Left Ring Finger"),
    onError: () => message.error("Failed to Enroll Left Ring Finger"),
  });

  const enrollLeftMiddleMutation = useMutation({
    mutationKey: ["enroll-left-middle-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollLeftMiddleFinger, person: id }),
    onSuccess: () =>
      message.success("Successfully enrolled Left Middle Finger"),
    onError: () => message.error("Failed to Enroll Left Middle Finger"),
  });

  const enrollLeftIndexMutation = useMutation({
    mutationKey: ["enroll-left-index-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollLeftIndexFinger, person: id }),
    onSuccess: () => message.success("Successfully enrolled Left Index Finger"),
    onError: () => message.error("Failed to Enroll Left Index Finger"),
  });

  const enrollRightLittleMutation = useMutation({
    mutationKey: ["enroll-right-little-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollRightLittleFinger, person: id }),
    onSuccess: () =>
      message.success("Successfully enrolled Right Little Finger"),
    onError: () => message.error("Failed to Enroll Right Little Finger"),
  });

  const enrollRightRingMutation = useMutation({
    mutationKey: ["enroll-right-ring-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollRightRingFinger, person: id }),
    onSuccess: () => message.success("Successfully enrolled Right Ring Finger"),
    onError: () => message.error("Failed to Enroll Right Ring Finger"),
  });

  const enrollRightMiddleMutation = useMutation({
    mutationKey: ["enroll-right-middle-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollRightMiddleFinger, person: id }),
    onSuccess: () =>
      message.success("Successfully enrolled Right Middle Finger"),
    onError: () => message.error("Failed to Enroll Right Middle Finger"),
  });

  const enrollRightIndexMutation = useMutation({
    mutationKey: ["enroll-right-index-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollRightIndexFinger, person: id }),
    onSuccess: () =>
      message.success("Successfully enrolled Right Index Finger"),
    onError: () => message.error("Failed to Enroll Right Index Finger"),
  });

  const enrollLeftThumbMutation = useMutation({
    mutationKey: ["enroll-left-thuumb-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollLeftThumbFinger, person: id }),
    onSuccess: () => message.success("Successfully enrolled Left Thumb Finger"),
    onError: () => message.error("Failed to Enroll Left Thumb Finger"),
  });

  const enrollRightThumbMutation = useMutation({
    mutationKey: ["enroll-right-thumb-mutation"],
    mutationFn: (id: number) =>
      enrollBiometrics({ ...enrollRightThumbFinger, person: id }),
    onSuccess: () =>
      message.success("Successfully enrolled Right Thumb Finger"),
    onError: () => message.error("Failed to Enroll Right Thumb Finger"),
  });

  const patchVisitorMutation = useMutation({
    mutationKey: ["patch-visitor-service-provider"],
    mutationFn: () =>
      patchServiceProvider(
        serviceProviderForm,
        token ?? "",
        serviceProviderToEdit
      ),
    onSuccess: () =>
      message.success("Successfully registered service provider."),
    onError: (err) => message.error(err.message),
  });

  const patchPersonMutation = useMutation({
    mutationKey: ["patch-person-service-provider"],
    mutationFn: () =>
      patchPerson(personForm, token ?? "", serviceProviderData?.person?.id),
    onSuccess: async () => {
      message?.success("Successfully Updated Person");
    },
    onError: (err) => {
      message?.error(err.message || "Something went wrong!");
    },
  });

  const handleUpdate = async () => {
    if (!serviceProviderData?.person?.id) {
      message.error("Person ID is not available.");
      return;
    }

    try {
      // Patch basic info first
      await Promise.all([
        patchVisitorMutation.mutateAsync(),
        patchPersonMutation.mutateAsync(),
      ]);

      // Config-driven biometric checks
      const biometricConfigs = [
        {
          form: enrollFormFace,
          enrolledKey: "faceIsEnrolled",
          mutation: enrollFaceMutation,
          label: "Face",
        },
        {
          form: enrollFormLeftIris,
          enrolledKey: "leftIrisIsEnrolled",
          mutation: enrollLeftMutation,
          label: "Left Iris",
        },
        {
          form: enrollFormRightIris,
          enrolledKey: "rightIrisIsEnrolled",
          mutation: enrollRightMutation,
          label: "Right Iris",
        },
        {
          form: enrollLeftLittleFinger,
          enrolledKey: "leftLittleIsEnrolled",
          mutation: enrollLeftLittleMutation,
          label: "Left Little Finger",
        },
        {
          form: enrollLeftRingFinger,
          enrolledKey: "leftRingIsEnrolled",
          mutation: enrollLeftRingMutation,
          label: "Left Ring Finger",
        },
        {
          form: enrollLeftMiddleFinger,
          enrolledKey: "leftMiddleIsEnrolled",
          mutation: enrollLeftMiddleMutation,
          label: "Left Middle Finger",
        },
        {
          form: enrollLeftIndexFinger,
          enrolledKey: "leftIndexIsEnrolled",
          mutation: enrollLeftIndexMutation,
          label: "Left Index Finger",
        },
        {
          form: enrollLeftThumbFinger,
          enrolledKey: "leftThumbIsEnrolled",
          mutation: enrollLeftThumbMutation,
          label: "Left Thumb Finger",
        },
        {
          form: enrollRightLittleFinger,
          enrolledKey: "rightLittleIsEnrolled",
          mutation: enrollRightLittleMutation,
          label: "Right Little Finger",
        },
        {
          form: enrollRightRingFinger,
          enrolledKey: "rightRingIsEnrolled",
          mutation: enrollRightRingMutation,
          label: "Right Ring Finger",
        },
        {
          form: enrollRightMiddleFinger,
          enrolledKey: "rightMiddleIsEnrolled",
          mutation: enrollRightMiddleMutation,
          label: "Right Middle Finger",
        },
        {
          form: enrollRightIndexFinger,
          enrolledKey: "rightIndexIsEnrolled",
          mutation: enrollRightIndexMutation,
          label: "Right Index Finger",
        },
        {
          form: enrollRightThumbFinger,
          enrolledKey: "rightThumbIsEnrolled",
          mutation: enrollRightThumbMutation,
          label: "Right Thumb Finger",
        },
      ];

      const enrollmentTasks = biometricConfigs.flatMap(
        ({ form, enrolledKey, mutation, label }) => {
          if (form?.upload_data) {
            if ((enrolledBiometrics as any)[enrolledKey]) {
              message.info(`${label} is already enrolled. Skipping...`);
              return [];
            }
            return [mutation.mutateAsync(serviceProviderData?.person?.id)];
          }
          return [];
        }
      );

      await Promise.all(enrollmentTasks);

      message.success("Successfully updated visitor information.");
    } catch (err) {
      console.error("Enrollment error:", err);
      message.error("Some enrollment steps failed.");
    }
  };

  const affiliations = dropdownOptions?.[0]?.data?.results;
  const affiliationsLoading = dropdownOptions?.[0]?.isLoading;
  const genders = dropdownOptions?.[1]?.data?.results;
  const nationalities = dropdownOptions?.[2]?.data?.results;
  const civilStatuses = dropdownOptions?.[3]?.data?.results;
  const religions = dropdownOptions?.[4]?.data?.results;
  const religionsLoading = dropdownOptions?.[4]?.isLoading;
  const regions = dropdownOptions?.[5]?.data?.results;
  const provinces = dropdownOptions?.[6]?.data?.results;
  const municipalities = dropdownOptions?.[7]?.data?.results;
  const barangays = dropdownOptions?.[8]?.data?.results;
  const countries = dropdownOptions?.[9]?.data?.results;
  const visitorTypes = dropdownOptions?.[10]?.data?.results;
  const visitorTypesLoading = dropdownOptions?.[10]?.isLoading;
  const users = dropdownOptions?.[11]?.data?.results;
  const userLoading = dropdownOptions?.[11]?.isLoading;
  const visitorAppStatus = dropdownOptions?.[12]?.data?.results;
  const visitorAppStatusLoading = dropdownOptions?.[12]?.isLoading;
  const currentUser = dropdownOptions?.[13]?.data;
  const prefixes = dropdownOptions?.[14]?.data?.results;
  const prefixesLoading = dropdownOptions?.[14]?.isLoading;
  const suffixes = dropdownOptions?.[15]?.data?.results;
  const suffixesLoading = dropdownOptions?.[15]?.isLoading;
  const services = dropdownOptions?.[16]?.data?.results;
  const servicesLoading = dropdownOptions?.[16]?.isLoading;

  const addressDataSource = personForm?.address_data?.map((address, index) => {
    return {
      key: index,
      type: address?.type,
      region: regions?.find((region) => region?.id === address?.region_id)
        ?.desc,
      province: provinces?.find(
        (province) => province?.id === address?.province_id
      )?.desc,
      municipality: municipalities?.find(
        (municipality) => municipality?.id === address?.municipality_id
      )?.desc,
      barangay: barangays?.find(
        (barangay) => barangay?.id === address?.barangay_id
      )?.desc,
      zip: address?.postal_code,
      country: countries?.find((country) => country?.id === address?.country_id)
        ?.country,
      current: address?.is_current ? "Yes" : "No",
      active: address?.is_active ? "Yes" : "No",
      actions: (
        <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center items-center">
          <button
            type="button"
            onClick={() => handleEditAddress(index)}
            className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-1 rounded w-10 h-10 flex items-center justify-center"
          >
            <AiOutlineEdit />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteAddress(index)}
            className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1 rounded flex w-10 h-10 items-center justify-center"
          >
            <AiOutlineDelete />
          </button>
        </div>
      ),
    };
  });

  const addressColumn: ColumnsType<{
    key: number;
    type: "Home" | "Work" | "Other";
    region: string | undefined;
    province: string | undefined;
    municipality: string | undefined;
    barangay: string | undefined;
    zip: string | null;
    country: string | undefined;
    current: string;
    active: string;
    actions: JSX.Element;
  }> = [
    {
      title: "Types",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
    },
    {
      title: "Province",
      dataIndex: "province",
      key: "province",
    },
    {
      title: "City/Mun",
      dataIndex: "municipality",
      key: "municipality",
    },
    {
      title: "Barangay",
      dataIndex: "barangay",
      key: "barangay",
    },
    {
      title: "Zip Code",
      dataIndex: "zip",
      key: "zip",
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
    },
    {
      title: "Current (Y/N)",
      dataIndex: "current",
      key: "current",
    },
    {
      title: "Active (Y/N)",
      dataIndex: "active",
      key: "active",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];

  const contactDataSource = personForm?.contact_data?.map((contact, index) => {
    return {
      key: index,
      contact_type: contact?.type,
      details: contact?.value,
      imei: contact?.mobile_imei,
      is_primary: contact?.is_primary ? "Yes" : "No",
      active: contact?.contact_status ? "Yes" : "No",
      remarks: contact?.remarks,
      actions: (
        <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center items-center">
          <button
            type="button"
            onClick={() => handleEditContact(index)}
            className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-1 rounded w-10 h-10 flex items-center justify-center"
          >
            <AiOutlineEdit />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteContact(index)}
            className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1 rounded flex w-10 h-10 items-center justify-center"
          >
            <AiOutlineDelete />
          </button>
        </div>
      ),
    };
  });
  const contactColumn: ColumnsType<{
    key: number;
    contact_type: string | null;
    details: string | null;
    imei: string | null;
    is_primary: string | null;
    active: string | null;
    remarks: string | null;
    actions: JSX.Element;
  }> = [
    {
      title: "Contact Type",
      dataIndex: "contact_type",
      key: "contact_type",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
    },
    {
      title: "SIM Card IMEI",
      dataIndex: "imei",
      key: "imei",
    },
    {
      title: "Primary (Y/N)",
      dataIndex: "is_primary",
      key: "is_primary",
    },
    {
      title: "Active (Y/N)",
      dataIndex: "active",
      key: "active",
    },
    {
      title: "Notes / Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
    },
  ];

  const handleRFIDScan = (input: string) => {
    const clean = sanitizeRFID(input);
    setServiceProviderForm((prev) => ({
      ...prev,
      id_number: clean,
    }));
  };

  useEffect(() => {
    setServiceProviderForm((prev) => ({
      ...prev,
      verified_by_id: currentUser?.id ?? 0,
    }));
  }, [serviceProviderForm?.verified_by_id, currentUser?.id]);

  useEffect(() => {
    const short = `${personForm?.first_name?.[0] ?? ""}${
      personForm?.last_name?.[0] ?? ""
    }`;
    setPersonForm((prev) => ({ ...prev, shortname: short.toUpperCase() }));
  }, [personForm.first_name, personForm.last_name]);

  const chosenGender =
    genders?.find((gender) => gender?.id === personForm?.gender_id)
      ?.gender_option || "";

  useEffect(() => {
    setPersonForm((prev) => ({
      ...prev,
      first_name: serviceProviderData?.person?.first_name,
      middle_name: serviceProviderData?.person?.middle_name,
      last_name: serviceProviderData?.person?.last_name,
      nationality_id:
        nationalities?.find(
          (nationality) =>
            nationality?.nationality ===
            serviceProviderData?.person?.nationality
        )?.id ?? null,
      gender_id: serviceProviderData?.person?.gender?.id,
      religion_id: serviceProviderData?.person?.religion?.id,
      civil_status_id:
        civilStatuses?.find(
          (status) =>
            status?.status === serviceProviderData?.person?.civil_status
        )?.id ?? null,
      place_of_birth: serviceProviderData?.person?.place_of_birth,
      date_of_birth: serviceProviderData?.person?.date_of_birth,
      suffix: serviceProviderData?.person?.suffix ?? null,
      prefix: serviceProviderData?.person?.prefix ?? null,
      shortname: serviceProviderData?.person?.person?.shortname ?? "",
      address_data:
        serviceProviderData?.person?.addresses?.map(
          (existingAddress: {
            region: string;
            province: string;
            municipality: string;
            barangay: string;
            country: string;
            postal_code: string;
            is_current: boolean;
          }) => ({
            ...existingAddress,
            region_id:
              regions?.find(
                (region) => region?.desc === existingAddress?.region
              )?.id ?? null,
            province_id:
              provinces?.find(
                (province) => province?.desc === existingAddress?.province
              )?.id ?? null,
            municipality_id:
              municipalities?.find(
                (municipality) =>
                  municipality?.desc === existingAddress?.municipality
              )?.id ?? null,
            barangay_id:
              barangays?.find(
                (brgy) => brgy?.desc === existingAddress?.barangay
              )?.id ?? null,
            country_id:
              countries?.find(
                (country) => country?.country === existingAddress?.country
              )?.id ?? null,
            postal_code: existingAddress?.postal_code ?? null,
            is_current: existingAddress?.is_current ?? false,
          })
        ) ?? [],
      contact_data: serviceProviderData?.person?.contacts ?? [],
      media_identifier_data:
        serviceProviderData?.person?.media_identifiers?.map(
          (prev: { idtype: any }) => ({
            ...prev,
            id_type_id: prev?.idtype,
          })
        ) ?? [],
      media_data:
        serviceProviderData?.person.media?.map((media: any) => ({
          ...media,
          media_base64: media?.media_binary,
        })) ?? [],
    }));
  }, [
    serviceProviderData?.person,
    nationalities,
    civilStatuses,
    barangays,
    countries,
    municipalities,
    regions,
    provinces,
  ]);

  useEffect(() => {
    setServiceProviderForm((prev) => ({
      ...prev,
      sp_reg_no: serviceProviderData?.sp_reg_no,
      service_type_id: serviceProviderData?.serv_prov_type ?? null,
      visitor_type_id:
        visitorTypes?.find(
          (type) => type?.serv_prov_type === serviceProviderData?.visitor_type
        )?.id ?? null,
      group_affiliation_id:
        affiliations?.find(
          (aff) => aff?.name === serviceProviderData?.group_affiliation
        )?.id ?? null,
      provided_service: serviceProviderData?.provided_service ?? null,
      visitor_status: serviceProviderData?.visitor_status,
      id_number: serviceProviderData?.id_number,
      person: serviceProviderData?.person?.id,
      verified_by_id:
        serviceProviderData?.verified_by ?? currentUser?.id ?? null,
      verified_at: serviceProviderData?.verified_at?.split("T")?.[0],
      approved_by_id: serviceProviderData?.approved_by ?? null,
      approved_at: serviceProviderData?.approved_at?.split("T")?.[0],
    }));
  }, [
    serviceProviderData,
    visitorTypes,
    affiliations,
    services,
    currentUser?.id,
  ]);

  if (serviceProviderLoading) {
    return <Spinner />;
  }

  console.log(serviceProviderForm);

  return (
    <div className="bg-white rounded-md shadow border border-gray-200 py-5 px-7 w-full mb-5">
      <h2 className="font-extrabold text-2xl">Service Provider Registration</h2>
      <form>
        <div className="mt-5 text-gray-700">
          <div className="w-full flex justify-between items-end -mt-14">
            <h3 className="font-bold text-xl">Service Provider Information</h3>
            <div className="flex flex-col mt-2 max-w-60 flex-1">
              <div className="flex gap-1 font-semibold">
                Visitor Type<p className="text-red-600">*</p>
              </div>
              <Select
                value={serviceProviderForm?.visitor_type_id}
                loading={visitorTypesLoading}
                className="mt-2 h-10 rounded-md outline-gray-300"
                placeholder="Visitor Type"
                showSearch
                optionFilterProp="label"
                options={visitorTypes?.map((type) => ({
                  label: type?.serv_prov_type,
                  value: type?.id,
                }))}
                onChange={(value) => {
                  setServiceProviderForm((prev) => ({
                    ...prev,
                    visitor_type_id: value,
                  }));
                }}
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="w-[60%] flex gap-2">
                <div className="flex flex-col mt-2 flex-1">
                  <div className="flex gap-1 font-semibold">
                    Registration No.<span className="text-red-600">*</span>
                  </div>
                  <Input
                    value={serviceProviderForm?.sp_reg_no}
                    readOnly
                    className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                    placeholder="YYYY-MM-DD-XXXXXX"
                  />
                </div>
                <div className="flex flex-col mt-2 flex-1">
                  <div className="flex gap-1 font-semibold">
                    Group Affiliation<p className="text-red-600">*</p>
                  </div>
                  <Select
                    value={serviceProviderForm?.group_affiliation_id}
                    loading={affiliationsLoading}
                    className="mt-2 h-10 rounded-md outline-gray-300"
                    placeholder="Group Affiliation"
                    showSearch
                    optionFilterProp="label"
                    options={affiliations?.map((affiliation) => ({
                      label: affiliation?.name,
                      value: affiliation?.id,
                    }))}
                    onChange={(value) => {
                      setServiceProviderForm((prev) => ({
                        ...prev,
                        group_affiliation_id: value,
                      }));
                    }}
                  />
                </div>

                <div className="flex flex-col mt-2 flex-1">
                  <div className="flex gap-1 font-semibold">
                    Nationality <span className="text-red-600">*</span>
                  </div>
                  <Select
                    value={personForm?.nationality_id}
                    loading={suffixesLoading}
                    showSearch
                    optionFilterProp="label"
                    className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                    options={nationalities
                      ?.map((nationality) => ({
                        value: nationality?.id,
                        label: nationality?.nationality,
                      }))
                      .sort((a, b) => {
                        if (a.label === "Filipino") return -1;
                        if (b.label === "Filipino") return 1;
                        return 0;
                      })}
                    onChange={(value) => {
                      setPersonForm((prev) => ({
                        ...prev,
                        nationality_id: value,
                      }));
                    }}
                  />
                </div>

                <div className="flex flex-col mt-2 flex-1">
                  <div className="flex gap-1 font-semibold">
                    Service Provided<span className="text-red-600">*</span>
                  </div>
                  <Select
                    value={serviceProviderForm?.provided_service}
                    className="mt-2 h-10 rounded-md outline-gray-300"
                    placeholder="Service Provided"
                    optionFilterProp="label"
                    showSearch
                    loading={servicesLoading}
                    options={services?.map((service) => ({
                      value: service?.id,
                      label: (
                        <Tooltip title={service.service_provided}>
                          <span>{service.service_provided}</span>
                        </Tooltip>
                      ),
                    }))}
                    onChange={(value) => {
                      setServiceProviderForm((prev) => ({
                        ...prev,
                        provided_service: value,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col mt-2 flex-1">
                <div className="flex gap-1 font-semibold">
                  Prefix<span className="text-red-600">*</span>
                </div>
                <Select
                  value={personForm?.prefix}
                  loading={prefixesLoading}
                  showSearch
                  optionFilterProp="label"
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={prefixes?.map((prefix) => ({
                    value: prefix?.id,
                    label: prefix?.prefix,
                  }))}
                  onChange={(value) => {
                    setPersonForm((prev) => ({
                      ...prev,
                      prefix: value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col mt-2 flex-[3]">
                <div className="flex gap-1 font-semibold">
                  Last Name<p className="text-red-600">*</p>
                </div>
                <Input
                  value={personForm?.last_name}
                  className="mt-2 px-3 py-2 rounded-md"
                  type="text"
                  name="lname"
                  placeholder="Last Name"
                  required
                  onChange={(e) =>
                    setPersonForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 flex-[3]">
                <div className="flex gap-1 font-semibold">
                  First Name<p className="text-red-600">*</p>
                </div>
                <Input
                  value={personForm?.first_name}
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300"
                  type="text"
                  name="fname"
                  placeholder="First Name"
                  required
                  onChange={(e) =>
                    setPersonForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 flex-[3]">
                <div className="flex gap-1 font-semibold">Middle Name</div>
                <Input
                  value={personForm?.middle_name}
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300"
                  type="text"
                  name="middle-name"
                  placeholder="Middle Name"
                  required
                  onChange={(e) =>
                    setPersonForm((prev) => ({
                      ...prev,
                      middle_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 flex-1">
                <div className="flex gap-1 font-semibold">Suffix</div>
                <Select
                  value={personForm?.suffix}
                  loading={suffixesLoading}
                  showSearch
                  optionFilterProp="label"
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={suffixes?.map((suffix) => ({
                    value: suffix?.id,
                    label: suffix?.suffix,
                  }))}
                  onChange={(value) => {
                    setPersonForm((prev) => ({
                      ...prev,
                      suffix: value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col mt-2 flex-[3]">
                <div className="flex gap-1 font-semibold">
                  Gender<p className="text-red-600">*</p>
                </div>
                <Select
                  value={personForm?.gender_id}
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={genders?.map((gender) => ({
                    value: gender?.id,
                    label: gender?.gender_option,
                  }))}
                  onChange={(value) => {
                    setPersonForm((prev) => ({
                      ...prev,
                      gender_id: value,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col mt-2 flex-[2]">
                <div className="flex gap-1 font-semibold">Short Name</div>
                <Input
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300"
                  type="text"
                  name="short-name"
                  placeholder="Short Name"
                  required
                  value={personForm.shortname ?? ""}
                  readOnly
                />
              </div>
              <div className="flex flex-col mt-2 flex-[2]">
                <div className="flex gap-1 font-semibold">
                  Date of Birth<p className="text-red-600">*</p>
                </div>
                <DatePicker
                  value={dayjs(personForm?.date_of_birth)}
                  placeholder="YYYY-MM-DD"
                  className="mt-2 h-10 rounded-md outline-gray-300"
                  onChange={(date) =>
                    setPersonForm((prev) => ({
                      ...prev,
                      date_of_birth: date ? date?.format("YYYY-MM-DD") : "",
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 flex-1">
                <div className="flex gap-1 font-semibold">
                  Age<p className="text-red-600">*</p>
                </div>
                <Input
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300 bg-gray-100"
                  type="text"
                  name="middle-name"
                  placeholder="Age"
                  disabled
                  value={calculateAge(personForm?.date_of_birth)}
                />
              </div>
              <div className="flex flex-col mt-2 flex-[3]">
                <div className="flex gap-1 font-semibold">
                  Place of Birth<p className="text-red-600">*</p>
                </div>
                <Input
                  value={personForm?.place_of_birth}
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300"
                  type="text"
                  name="birth-date"
                  placeholder="Date of Birth"
                  required
                  onChange={(e) =>
                    setPersonForm((prev) => ({
                      ...prev,
                      place_of_birth: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 flex-[1]">
                <div className="flex gap-1 font-semibold">
                  Civil Status<p className="text-red-600">*</p>
                </div>
                <Select
                  value={personForm?.civil_status_id}
                  showSearch
                  optionFilterProp="label"
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={civilStatuses?.map((civilStatus) => ({
                    value: civilStatus?.id,
                    label: civilStatus?.status,
                  }))}
                  onChange={(value) => {
                    setPersonForm((prev) => ({
                      ...prev,
                      civil_status_id: value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col mt-2 flex-[2]">
                <div className="flex gap-1 font-semibold">
                  Religion<span className="text-red-600">*</span>
                </div>
                <Select
                  value={personForm?.religion_id}
                  loading={religionsLoading}
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={religions?.map((religion) => ({
                    value: religion?.id,
                    label: religion?.name,
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-5 mt-10">
              <div className="flex justify-between">
                <h1 className="font-bold text-xl">Addresses</h1>
                <button
                  onClick={showAddressModal}
                  className="flex gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-400"
                  type="button"
                >
                  <Plus />
                  Add Address
                </button>
              </div>
              <div>
                <Table
                  className="border text-gray-200 rounded-md"
                  dataSource={addressDataSource}
                  columns={addressColumn}
                  scroll={{ x: 800 }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-5 mt-10">
              <div className="flex justify-between">
                <h1 className="font-bold text-xl">Contact Details</h1>
                <button
                  type="button"
                  className="flex gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-400"
                  onClick={showContactModal}
                >
                  <Plus />
                  Add Contact
                </button>
              </div>
              <div>
                <Table
                  className="border text-gray-200 rounded-md"
                  dataSource={contactDataSource}
                  columns={contactColumn}
                  scroll={{ x: 800 }}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/**Biometrics */}
      <VisitorProfile
        setEnrolledBiometrics={setEnrolledBiometrics}
        visitorToEdit={serviceProviderData}
        inputGender={chosenGender}
        icao={icao}
        setIcao={setIcao}
        setPersonForm={setPersonForm}
        enrollFormLeftIris={enrollFormLeftIris}
        enrollFormRightIris={enrollFormRightIris}
        setEnrollFormFace={setEnrollFormFace}
        setEnrollFormLeftIris={setEnrollFormLeftIris}
        setEnrollFormRightIris={setEnrollFormRightIris}
        setEnrollLeftIndexFinger={setEnrollLeftIndexFinger}
        setEnrollLeftLittleFinger={setEnrollLeftLittleFinger}
        setEnrollLeftMiddleFinger={setEnrollLeftMiddleFinger}
        setEnrollLeftRingFinger={setEnrollLeftRingFinger}
        setEnrollLeftThumbFinger={setEnrollLeftThumbFinger}
        setEnrollRightIndexFinger={setEnrollRightIndexFinger}
        setEnrollRightLittleFinger={setEnrollRightLittleFinger}
        setEnrollRightMiddleFinger={setEnrollRightMiddleFinger}
        setEnrollRightRingFinger={setEnrollRightRingFinger}
        setEnrollRightThumbFinger={setEnrollRightThumbFinger}
      />

      <Identifiers
        isEditing={!!serviceProviderToEdit}
        personForm={personForm}
        setPersonForm={setPersonForm}
      />

      <Modal
        className="overflow-y-auto rounded-lg scrollbar-hide"
        title={editAddressIndex !== null ? "Edit Address" : "Add Address"}
        open={isAddressModalOpen}
        onCancel={handleAddressCancel}
        footer={null}
        width="70%"
      >
        <AddAddress
          handleAddressCancel={handleAddressCancel}
          setPersonForm={setPersonForm}
          barangay={barangays || []}
          countries={countries || []}
          municipality={municipalities || []}
          provinces={provinces || []}
          regions={regions || []}
          editAddressIndex={editAddressIndex}
          personForm={personForm}
        />
      </Modal>

      <Modal
        centered
        className="overflow-y-auto rounded-lg scrollbar-hide"
        title={editContactIndex !== null ? "Edit Contact" : "Add Contact"}
        open={isContactModalOpen}
        onCancel={handleContactCancel}
        footer={null}
        width="30%"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <ContactForm
          setPersonForm={setPersonForm}
          handleContactCancel={handleContactCancel}
          editContactIndex={editContactIndex}
          personForm={personForm}
        />
      </Modal>

      <Issue />

      <Remarks
        deleteRemarksByIndex={deleteRemarksByIndex}
        currentUser={currentUser ?? null}
        setVisitorForm={setServiceProviderForm}
      />

      <form>
        <div className="flex gap-2 mt-5">
          <div className="flex flex-col gap-5 w-full">
            <div className="flex flex-col md:flex-row w-full gap-5">
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">
                  Visitor Registration Status<p className="text-red-600">*</p>
                </div>
                <Select
                  value={serviceProviderForm?.visitor_status}
                  loading={visitorAppStatusLoading}
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={visitorAppStatus?.map((status) => ({
                    value: status?.id,
                    label: status?.status,
                  }))}
                  onChange={(value) => {
                    setServiceProviderForm((prev) => ({
                      ...prev,
                      visitor_status: value,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">Verified By</div>
                <Input
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  value={
                    users?.find(
                      (user) => user?.id === serviceProviderForm?.verified_by_id
                    )?.email ??
                    currentUser?.first_name + " " + currentUser?.last_name
                  }
                  readOnly
                />
              </div>
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">Date Verified</div>
                <input
                  value={serviceProviderForm?.verified_at}
                  type="date"
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300 border"
                  onChange={(e) =>
                    setServiceProviderForm((prev) => ({
                      ...prev,
                      verified_at: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">
                  Approved By <span className="text-red-600">*</span>
                </div>
                <Select
                  value={serviceProviderForm?.approved_by_id}
                  loading={userLoading}
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={users?.map((user) => ({
                    value: user?.id,
                    label: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`,
                  }))}
                  onChange={(value) => {
                    setServiceProviderForm((prev) => ({
                      ...prev,
                      approved_by_id: value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">Date Approved</div>
                <input
                  value={serviceProviderForm?.approved_at}
                  type="date"
                  className="mt-2 px-3 py-2 rounded-md border outline-gray-300"
                  onChange={(e) =>
                    setServiceProviderForm((prev) => ({
                      ...prev,
                      approved_at: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between w-full gap-5">
              <div className="flex flex-col mt-2 w-[18.5%]">
                <div className="flex gap-1">ID No.</div>
                <input
                  value={serviceProviderForm?.id_number}
                  type="text"
                  className="mt-2 px-3 py-2 rounded-md border outline-gray-300"
                  onChange={(e) => handleRFIDScan(e.target.value)}
                />
              </div>

              <div className="flex gap-4 w-[30%] h-full items-end">
                <button
                  type="button"
                  className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1 opacity-0"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white rounded-md py-2 px-6 flex-1"
                  onClick={handleUpdate}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceProviderUpdate;
