/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker, Input, message, Modal, Select, Table } from "antd";
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
  getMultipleBirthClassTypes,
  getNationalities,
  getPersonSearch,
  getPrefixes,
  getSuffixes,
  getUsers,
  getVisitor_to_PDL_Relationship,
  getVisitor_Type,
  getVisitorAppStatus,
} from "@/lib/queries";
import { useTokenStore } from "@/store/useTokenStore";
import { PersonForm, VisitorForm } from "@/lib/visitorFormDefinition";
import { calculateAge } from "@/functions/calculateAge";
import { ColumnsType } from "antd/es/table";
import ContactForm from "../visitor-data-entry/ContactForm";
import { BiometricRecordFace } from "@/lib/scanner-definitions";
import { BASE_URL, BIOMETRIC, PERSON } from "@/lib/urls";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import Spinner from "@/components/loaders/Spinner";
import UpdateRequirements from "./UpdateRequirements";
import UpdatePDLtoVisit from "./UpdatePDLtoVisit";
import UpdateMultipleBirthSiblings from "@/pages/pdl_management/pdl-information/UpdateMultiBirthSibling";
import Remarks from "../visitor-data-entry/Remarks";
import { sanitizeRFID } from "@/functions/sanitizeRFIDInput";

export type EnrolledBiometrics = {
  rightIrisIsEnrolled: boolean;
  leftIrisIsEnrolled: boolean;
  rightLittleIsEnrolled: boolean;
  rightRingIsEnrolled: boolean;
  rightMiddleIsEnrolled: boolean;
  rightIndexIsEnrolled: boolean;
  rightThumbIsEnrolled: boolean;
  leftLittleIsEnrolled: boolean;
  leftRingIsEnrolled: boolean;
  leftMiddleIsEnrolled: boolean;
  leftIndexIsEnrolled: boolean;
  leftThumbIsEnrolled: boolean;
  faceIsEnrolled: boolean;
};

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

const patchVisitor = async (
  visitor: VisitorForm,
  token: string,
  id: number
) => {
  const res = await fetch(`${BASE_URL}/api/visitors/visitor/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(visitor),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(JSON.stringify(errorData));
  }

  return res.json();
};

const enrollBiometrics = async (
  enrollForm: BiometricRecordFace
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

const VisitorRegistration = () => {
  const token = useTokenStore()?.token;
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const location = useLocation();
  const visitor = location.state?.visitor;
  const [editAddressIndex, setEditAddressIndex] = useState<number | null>(null);
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);
  const [editPdlToVisitIndex, setEditPdlToVisitIndex] = useState<number | null>(
    null
  );

  const [personSearch, setPersonSearch] = useState("");
  const [personPage, setPersonPage] = useState(1);

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
    multiple_birth_sibling_data: [],
    affiliation_id: [],
  });
  const [visitorForm, setVisitorForm] = useState<VisitorForm>({
    approved_at: null,
    approved_by_id: null,
    id_number: null,
    jail_id: 1,
    org_id: 1,
    pdl_data: [],
    record_status_id: 1,
    remarks: "",
    remarks_data: [],
    shortname: "",
    verified_at: null,
    verified_by_id: null,
    visited_pdl_have_twins: false,
    visited_pdl_twin_name: "",
    visitor_app_status_id: null,
    visitor_have_twins: false,
    visitor_reg_no: 1,
    visitor_twin_name: "",
    visitor_type_id: 1,
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
    remarks: "",
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

  const handleDeleteMultipleBirthSibling = (indexToDelete: number) => {
    setPersonForm((prev) => ({
      ...prev,
      multiple_birth_sibling_data: prev?.multiple_birth_sibling_data?.filter(
        (_, i) => i !== indexToDelete
      ),
    }));
  };

  const deletePdlToVisit = (index: number) => {
    setVisitorForm((prev) => ({
      ...prev,
      pdl_data: prev?.pdl_data?.filter((_, i) => i !== index),
    }));
  };

  const deleteMediaIdentifierByIndex = (index: number) => {
    setPersonForm((prev) => ({
      ...prev,
      media_identifier_data: prev?.media_identifier_data?.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const deleteMediaRequirementByIndex = (index: number) => {
    setPersonForm((prev) => ({
      ...prev,
      media_requirement_data: prev?.media_requirement_data?.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const deleteRemarksByIndex = (index: number) => {
    setVisitorForm((prev) => ({
      ...prev,
      remarks_data: prev?.remarks_data?.filter((_, i) => i !== index),
    }));
  };

  const handleRFIDScan = (input: string) => {
    const clean = sanitizeRFID(input);
    setVisitorForm((prev) => ({
      ...prev,
      id_number: Number(clean),
    }));
  };

  const { data: personsPaginated, isLoading: personsLoading } = useQuery({
    queryKey: ["paginated-person", personSearch, personPage],
    queryFn: () => getPersonSearch(token ?? "", 10, personSearch, personPage),
    staleTime: 600_000,
    enabled: !!token,
    placeholderData: (prevData) => prevData,
  });

  const dropdownOptions = useQueries({
    queries: [
      {
        queryKey: ["visitor-type"],
        queryFn: () => getVisitor_Type(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["person-gender"],
        queryFn: () => getGenders(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["person-nationality"],
        queryFn: () => getNationalities(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["person-civil-status"],
        queryFn: () => getCivilStatus(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["regions"],
        queryFn: () => getJailRegion(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["provinces"],
        queryFn: () => getJail_Province(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["city/municipality"],
        queryFn: () => getJail_Municipality(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["barangays"],
        queryFn: () => getJail_Barangay(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["countries"],
        queryFn: () => getCountries(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["users"],
        queryFn: () => getUsers(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["visitor-app-status"],
        queryFn: () => getVisitorAppStatus(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["current-user"],
        queryFn: () => getCurrentUser(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["prefix"],
        queryFn: () => getPrefixes(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["suffix"],
        queryFn: () => getSuffixes(token ?? ""),
        staleTime: 600_000,
      },
      {
        queryKey: ["multiple-birth-class-types"],
        queryFn: () => getMultipleBirthClassTypes(token ?? ""),
        staleTime: 600_000,
      },
    ],
  });

  const { data: relationships } = useQuery({
    queryKey: ["editVisitor", "relationships"],
    queryFn: () => getVisitor_to_PDL_Relationship(token ?? ""),
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

  const visitorTypes = dropdownOptions?.[0]?.data?.results;
  const genders = dropdownOptions?.[1]?.data?.results;
  const nationalities = dropdownOptions?.[2]?.data?.results;
  const civilStatuses = dropdownOptions?.[3]?.data?.results;
  const regions = dropdownOptions?.[4]?.data?.results;
  const provinces = dropdownOptions?.[5]?.data?.results;
  const municipalities = dropdownOptions?.[6]?.data?.results;
  const barangays = dropdownOptions?.[7]?.data?.results;
  const countries = dropdownOptions?.[8]?.data?.results;
  const users = dropdownOptions?.[9]?.data?.results;
  const userLoading = dropdownOptions?.[9]?.isLoading;
  const visitorAppStatus = dropdownOptions?.[10]?.data?.results;
  const visitorAppStatusLoading = dropdownOptions?.[10]?.isLoading;
  const currentUser = dropdownOptions?.[11]?.data;
  const prefixes = dropdownOptions?.[12]?.data?.results;
  const prefixesLoading = dropdownOptions?.[12]?.isLoading;
  const suffixes = dropdownOptions?.[13]?.data?.results;
  const suffixesLoading = dropdownOptions?.[13]?.isLoading;
  const birthClassTypes = dropdownOptions?.[14]?.data?.results;
  const birthClassTypesLoading = dropdownOptions?.[14]?.isLoading;

  const persons = personsPaginated?.results || [];
  const personsCount = personsPaginated?.count || 0;

  const { data: visitorData, isLoading } = useQuery({
    queryKey: ["visitor", visitor?.id],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/api/visitors/visitor/${visitor?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    enabled: !!visitor?.id && !!token,
  });

  const patchVisitorMutation = useMutation({
    mutationKey: ["patch-visitor"],
    mutationFn: () => patchVisitor(visitorForm, token ?? "", visitorData?.id),
    onSuccess: () => message.success("Successfully registered Visitor"),
    onError: (err) => message.error(err.message),
  });

  const patchPersonMutation = useMutation({
    mutationKey: ["patch-person-visitor"],
    mutationFn: () =>
      patchPerson(personForm, token ?? "", visitorData?.person?.id),
    onSuccess: async () => {
      message?.success("Successfully Updated Person");
    },
    onError: (err) => {
      message?.error(err.message || "Something went wrong!");
    },
  });

  const handleUpdate = async () => {
    if (!visitorData?.person?.id) {
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
            return [mutation.mutateAsync(visitorData.person.id)];
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

  useEffect(() => {
    setPersonForm({
      // affiliation_id: affiliations?.find(type => type?.id === visitorData?.person?.affiliation) ?? null,
      first_name: visitorData?.person?.first_name ?? "",
      middle_name: visitorData?.person?.middle_name ?? "",
      last_name: visitorData?.person?.last_name ?? "",
      suffix: visitorData?.person?.suffix ?? null,
      prefix: visitorData?.person?.prefix ?? null,
      shortname: visitorData?.person?.shortname ?? "",
      gender_id: visitorData?.person?.gender?.id ?? null,
      date_of_birth: visitorData?.person?.date_of_birth ?? "",
      place_of_birth: visitorData?.person?.place_of_birth ?? "",
      nationality_id:
        nationalities?.find(
          (nationality) =>
            nationality?.nationality === visitorData?.person?.nationality
        )?.id ?? null,
      civil_status_id:
        civilStatuses?.find(
          (civilStatus) =>
            civilStatus?.status === visitorData?.person?.civil_status
        )?.id ?? null,
      address_data:
        visitorData?.person?.addresses?.map(
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
      contact_data: visitorData?.person?.contacts ?? [],
      employment_history_data: visitorData?.person?.employment_histories ?? [],
      social_media_account_data:
        visitorData?.person?.social_media_accounts ?? [],
      skill_id: visitorData?.person?.skill ?? [],
      talent_id: visitorData?.person?.talent ?? [],
      interest_id: visitorData?.person?.interest ?? [],
      media_data:
        visitorData?.person.media?.map((media: any) => ({
          ...media,
          media_base64: media?.media_binary,
        })) ?? [],
      media_identifier_data:
        visitorData?.person?.media_identifiers?.map(
          (prev: { idtype: number }) => ({
            ...prev,
            id_type_id: prev?.idtype,
          })
        ) ?? [],
      media_requirement_data: visitorData?.person?.media_requirements ?? [],
      diagnosis_data: visitorData?.person?.diagnoses ?? [],
      religion_id: visitorData?.person?.religion?.id ?? 1,
      multiple_birth_sibling_data:
        visitorData?.person?.multiple_birth_siblings?.map((sibling: any) => ({
          ...sibling,
          sibling_person_id: +sibling?.sibling_person_id_display,
          person_id: visitorData?.person?.id ?? null,
        })) ?? [],
      ethnicity_province: visitorData?.person?.ethnicity_province,
    });

    setVisitorForm((prev) => ({
      ...prev,
      visitor_reg_no: visitorData?.visitor_reg_no ?? "",
      visitor_type_id:
        visitorData?.visitor_type_id ?? prev.visitor_type_id ?? 1,
      org_id: visitorData?.org_id ?? prev.org_id,
      jail_id: visitorData?.jail_id ?? prev.jail_id,
      shortname: visitorData?.shortname ?? "",
      visitor_have_twins: visitorData?.visitor_have_twins ?? false,
      visitor_twin_name: visitorData?.visitor_twin_name ?? "",
      visited_pdl_have_twins: visitorData?.visited_pdl_have_twins ?? false,
      visited_pdl_twin_name: visitorData?.visited_pdl_twin_name ?? "",
      remarks_data:
        visitorData?.remarks?.map((remark: any) => ({
          remarks: remark?.remarks ?? "N/A",
          created_by: `${
            users?.find((user) => user?.id === remark?.visitor)?.first_name ??
            ""
          } ${
            users?.find((user) => user?.id === remark?.visitor)?.last_name ?? ""
          }`,
          created_at: visitorData?.updated_at ?? "",
        })) ?? [],
      visitor_app_status_id:
        visitorData?.visitor_app_status_id ?? prev.visitor_app_status_id ?? 1,
      record_status_id:
        visitorData?.record_status_id ?? prev.record_status_id ?? 1,
      verified_by_id:
        users?.find((user) => user?.email === visitorData?.verified_by)?.id ??
        currentUser?.id ??
        null,
      approved_by_id:
        users?.find((user) => user?.email === visitorData?.approved_by)?.id ??
        null,
      pdl_data:
        visitorData?.pdls?.map(
          (pdl: { pdl: any; relationship_to_pdl: string }) => ({
            ...pdl,
            pdl_id: pdl?.pdl?.id,
            last_name: pdl?.pdl?.person?.last_name,
            first_name: pdl?.pdl?.person?.first_name,
            middle_name: pdl?.pdl?.person?.middle_name,
            annex: pdl?.pdl?.cell?.floor,
            dorm: pdl?.pdl?.cell?.cell_name,
            level: pdl?.pdl?.jail?.jail_name,
            visitationStatus: pdl?.pdl?.visitation_status,
            birthClassClassification:
              pdl?.pdl?.person?.multiple_birth_siblings?.[0]
                ?.multiple_birth_class,
            relationship_to_pdl_id: relationships?.results?.find(
              (rel) => rel?.relationship_name === pdl?.relationship_to_pdl
            )?.id,
          })
        ) ?? [],
      id_number: visitorData?.id_number ?? null,
      verified_at: visitorData?.verified_at ?? null,
      approved_at: visitorData?.approved_at
        ? new Date(visitorData?.approved_at)?.toISOString()
        : null,
    }));
  }, [
    visitorData,
    barangays,
    civilStatuses,
    countries,
    currentUser?.id,
    municipalities,
    nationalities,
    provinces,
    regions,
    relationships,
    users,
  ]);

  // console.log("Visitor Form", visitorForm)

  const chosenGender =
    genders?.find((gender) => gender?.id === personForm?.gender_id)
      ?.gender_option || "";

  useEffect(() => {
    const short = `${personForm?.first_name?.[0] ?? ""}${
      personForm?.last_name?.[0] ?? ""
    }`;
    setPersonForm((prev) => ({ ...prev, shortname: short.toUpperCase() }));
  }, [personForm?.first_name, personForm?.last_name]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <Spinner />
      </div>
    );

  return (
    <div className="bg-white rounded-md shadow border border-gray-200 py-5 px-7 w-full mb-5">
      <div className="mb-4 flex gap-3 items-center">
        <h2 className="font-extrabold text-2xl">Visitor Registration</h2>
      </div>
      <form>
        <div className="mt-5 text-gray-700">
          <h3 className="font-bold text-xl">Visitor Information</h3>
          <div className="flex flex-col w-full gap-2">
            <div className="flex gap-2 w-[50%]">
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">
                  Visitor No. <p className="text-red-600">*</p>
                </div>
                <Input
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300 bg-gray-100"
                  value={visitorForm?.visitor_reg_no}
                  type="text"
                  name="visitor_reg_no"
                  placeholder="YYYY-MM-DD-XXXXXXX"
                  readOnly
                />
              </div>
              {/*Select Input Field */}
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">Visitor Type</div>
                <Select
                  value={visitorForm?.visitor_type_id ?? null}
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={visitorTypes?.map((type) => ({
                    value: type.id,
                    label: type.visitor_type,
                  }))}
                  onChange={(value) =>
                    setVisitorForm((prev) => ({
                      ...prev,
                      visitor_type_id: value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">
                  Nationality<p className="text-red-600">*</p>
                </div>
                <Select
                  value={personForm?.nationality_id}
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
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col mt-2 flex-1">
                <div className="flex gap-1">Prefix</div>
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
                <div className="flex gap-1">
                  Last Name<p className="text-red-600">*</p>
                </div>
                <Input
                  value={personForm.last_name ?? ""}
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
                <div className="flex gap-1">
                  First Name<p className="text-red-600">*</p>
                </div>
                <Input
                  value={personForm.first_name ?? ""}
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
                <div className="flex gap-1">Middle Name</div>
                <Input
                  value={personForm.middle_name ?? ""}
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
                <div className="flex gap-1">Suffix</div>
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
                <div className="flex gap-1">
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
              <div className="flex flex-col mt-2 flex-[4]">
                <div className="flex gap-1">Short Name</div>
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
                <div className="flex gap-1">
                  Date of Birth<p className="text-red-600">*</p>
                </div>
                <DatePicker
                  value={
                    personForm.date_of_birth
                      ? dayjs(personForm.date_of_birth)
                      : null
                  }
                  placeholder="YYYY-MM-DD"
                  className="mt-2 h-10 rounded-md outline-gray-300"
                  onChange={(date) =>
                    setPersonForm((prev) => ({
                      ...prev,
                      date_of_birth: date ? date.format("YYYY-MM-DD") : "",
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 flex-1">
                <div className="flex gap-1 text-gray-400">
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
                <div className="flex gap-1">Place of Birth</div>
                <Input
                  value={personForm?.place_of_birth}
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300"
                  type="text"
                  name="birth-date"
                  placeholder="Place of Birth"
                  required
                  onChange={(e) =>
                    setPersonForm((prev) => ({
                      ...prev,
                      place_of_birth: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col mt-2 flex-1">
                <div className="flex gap-1">
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
              {/* <div className='flex flex-col mt-2 flex-[2]'>
                                <div className='flex gap-1'>Affiliation</div>
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    options={affiliations?.map(affiliation => ({
                                        value: affiliation?.id,
                                        label: affiliation?.affiliation_type
                                    }))}
                                    className='mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100'
                                    value={personForm?.affiliation_id}
                                />
                            </div> */}
            </div>

            <UpdateMultipleBirthSiblings
              handleDeleteMultipleBirthSibling={
                handleDeleteMultipleBirthSibling
              }
              prefixes={prefixes || []}
              suffixes={suffixes || []}
              genders={genders || []}
              setPersonForm={setPersonForm}
              personForm={personForm}
              birthClassTypes={birthClassTypes || []}
              birthClassTypesLoading={birthClassTypesLoading}
              persons={persons || []}
              personsLoading={personsLoading}
              currentPersonId={visitorData?.person?.id}
              setPersonPage={setPersonPage}
              setPersonSearch={setPersonSearch}
              personPage={personPage}
              personsCount={personsCount}
            />

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

      <VisitorProfile
        setEnrolledBiometrics={setEnrolledBiometrics}
        inputGender={chosenGender}
        visitorToEdit={visitorData}
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

      <UpdatePDLtoVisit
        editPdlToVisitIndex={editPdlToVisitIndex}
        setEditPdlToVisitIndex={setEditPdlToVisitIndex}
        deletePdlToVisit={deletePdlToVisit}
        setVisitorForm={setVisitorForm}
        visitorForm={visitorForm}
      />

      <UpdateRequirements
        deleteMediaRequirementByIndex={deleteMediaRequirementByIndex}
        deleteMediaIdentifierByIndex={deleteMediaIdentifierByIndex}
        setPersonForm={setPersonForm}
        personForm={personForm}
        setVisitorForm={setVisitorForm}
      />
      <Issue />
      <Remarks
        visitorForm={visitorForm}
        deleteRemarksByIndex={deleteRemarksByIndex}
        currentUser={currentUser ?? null}
        setVisitorForm={setVisitorForm}
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
                  value={visitorForm?.visitor_app_status_id}
                  loading={visitorAppStatusLoading}
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={visitorAppStatus?.map((status) => ({
                    value: status?.id,
                    label: status?.status,
                  }))}
                  onChange={(value) => {
                    setVisitorForm((prev) => ({
                      ...prev,
                      visitor_app_status_id: value,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">Verified By</div>
                <Input
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  value={currentUser?.first_name + " " + currentUser?.last_name}
                  readOnly
                />
              </div>
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">Date Verified</div>
                <input
                  type="date"
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300 bg-gray-100"
                  value={visitorForm?.verified_at?.split("T")?.[0] ?? ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    setVisitorForm((prev) => ({
                      ...prev,
                      verified_at: date ? `${date}T00:00:00` : null,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">
                  Approved By <span className="text-red-600">*</span>
                </div>
                <Select
                  value={visitorForm?.approved_by_id ?? null}
                  loading={userLoading}
                  className="mt-2 h-10 rounded-md outline-gray-300 !bg-gray-100"
                  options={users?.map((user) => ({
                    value: user?.id,
                    label: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`,
                  }))}
                  onChange={(value) => {
                    setVisitorForm((prev) => ({
                      ...prev,
                      approved_by_id: value,
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col mt-2 w-full">
                <div className="flex gap-1">Date Approved</div>
                <input
                  type="date"
                  value={visitorForm?.approved_at?.split("T")?.[0] ?? ""}
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300 bg-gray-100"
                  onChange={(e) => {
                    const date = e.target.value;
                    setVisitorForm((prev) => ({
                      ...prev,
                      approved_at: date ? `${date}T00:00:00` : null,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between w-full gap-5">
              <div className="flex flex-col mt-2 w-[18.5%]">
                <div className="flex gap-1">ID No.</div>
                <input
                  value={visitorForm?.id_number ?? ""}
                  type="text"
                  className="mt-2 px-3 py-2 rounded-md outline-gray-300 bg-gray-100"
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

export default VisitorRegistration;
