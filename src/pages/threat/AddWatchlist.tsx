/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Image, Input, message, Select } from "antd"
import { useEffect, useState } from "react";
import image_placeholder from "../../assets/img_placeholder.jpg"
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { enrollBiometrics, getWhiteListedRiskLevels, getWhiteListedThreatLevels, getWhiteListedTypes, postPerson, postWatchlistPerson, verifyFaceInWatchlist } from "@/lib/threatQueries";
import { getCivilStatus, getGenders, getNationalities } from "@/lib/queries";
import { BiometricRecordFace } from "@/lib/scanner-definitions";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "@/lib/urls";
import Spinner from "@/components/loaders/Spinner";
import { patchPerson, patchWatchlistPerson } from "@/lib/watchlistQueries";

export type WatchlistForm = {
    person_id: number | null;
    white_listed_type_id: number | null;
    risk_level_id: number | null;
    threat_level_id: number | null;
    risks: string;
    threats: string;
    mitigation: string
    remarks: string;
}

export type PersonForm = {
    gender_id: number | null;
    nationality_id: number | null;
    civil_status_id: number | null;
    first_name: string;
    last_name: string;
    middle_name: string;
}

const AddWatchlist = () => {
    const token = useTokenStore()?.token
    const location = useLocation()
    const existingRecord = location?.state || null

    const { data: whitelistedPersonData, isLoading: whitelistedPersonDataLoading } = useQuery({
        queryKey: ['watchlist', 'edit', existingRecord],
        queryFn: async () => {
            const res = await fetch(
                `${BASE_URL}/api/whitelists/whitelisted-persons/${existingRecord}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (res.status === 403) {
                throw new Error(
                    "Access denied: You are not authorized to view Whitelisted Person data."
                );
            }

            if (!res.ok) {
                throw new Error("Failed to fetch Whitelisted Person data.");
            }

            return res.json();
        },
        enabled: !!token && !!existingRecord
    })

    const { data: personData, isLoading: personDataLoading } = useQuery({
        queryKey: ['person', 'edit', whitelistedPersonData?.person_id_display],
        queryFn: async () => {
            const res = await fetch(
                `${BASE_URL}/api/standards/persons/${whitelistedPersonData?.person_id_display}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (res.status === 403) {
                throw new Error(
                    "Access denied: You are not authorized to view Person data."
                );
            }

            if (!res.ok) {
                throw new Error("Failed to fetch Person data.");
            }

            return res.json();
        },
        enabled: !!token && !!existingRecord && !!whitelistedPersonData?.person_id_display
    })

    const { data: whitelistedPersonBiometric } = useQuery({
        queryKey: ['watchlist', 'biometric', existingRecord],
        queryFn: async () => {
            const res = await fetch(
                `${BASE_URL}/api/whitelists/whitelist-biometrics/${existingRecord}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (res.status === 403) {
                throw new Error(
                    "Access denied: You are not authorized to view Whitelisted Person Biometric data."
                );
            }

            if (!res.ok) {
                throw new Error("Failed to fetch Whitelisted Person Biometric data.");
            }

            return res.json();
        },
        enabled: !!token && !!existingRecord
    })

    const [personForm, setPersonForm] = useState<PersonForm>({
        first_name: "",
        last_name: "",
        middle_name: "",
        civil_status_id: null,
        gender_id: null,
        nationality_id: null,
    })

    const [watchlistForm, setWatchlistForm] = useState<WatchlistForm>({
        person_id: null,
        white_listed_type_id: null,
        risk_level_id: null,
        threat_level_id: null,
        risks: "",
        threats: "",
        mitigation: "",
        remarks: "",
    })

    const [enrollFormFace, setEnrollFormFace] = useState<BiometricRecordFace>(
        {
            remarks: "Test",
            person: null,
            biometric_type: "face",
            position: "face",
            place_registered: "Quezon City",
            upload_data: "",
        }
    )

    const { data: riskLevels, isLoading: riskLevelsLoading } = useQuery({
        queryKey: ['whitelistedRiskLevels'],
        queryFn: () => getWhiteListedRiskLevels(token ?? "")
    })

    const { data: threatLevels, isLoading: threatLevelsLoading } = useQuery({
        queryKey: ['whitelistedThreatLevels'],
        queryFn: () => getWhiteListedThreatLevels(token ?? "")
    })

    const { data: types, isLoading: typesLoading } = useQuery({
        queryKey: ['whitelistedTypes'],
        queryFn: () => getWhiteListedTypes(token ?? "")
    })

    const { data: genders, isLoading: gendersLoading } = useQuery({
        queryKey: ['genders', 'threats'],
        queryFn: () => getGenders(token ?? "")
    })

    const { data: nationalities, isLoading: nationalitiesLoading } = useQuery({
        queryKey: ['nationalities', 'threats'],
        queryFn: () => getNationalities(token ?? "")
    })

    const { data: civilStatuses, isLoading: civilStatusesLoading } = useQuery({
        queryKey: ['civilStatuses', 'threats'],
        queryFn: () => getCivilStatus(token ?? "")
    })

    const verifyFaceInWatchlistMutation = useMutation({
        mutationKey: ['biometric-verification', 'threat'],
        mutationFn: verifyFaceInWatchlist,
        onSuccess: (data) => {
            message.warning({
                content: `${data['message']}`,
                duration: 30
            });
        },
        onError: (error) => {
            message.info(error?.message);
        },
    });

    const enrollFaceMutation = useMutation({
        mutationKey: ['enroll-face-mutation', 'threats'],
        onMutate: () => {
            message.open({
                key: 'add-watchlist-person-mutation',
                type: "loading",
                content: "Enrolling facial biometric...",
                duration: 0
            })
        },
        mutationFn: (id: number) => enrollBiometrics({ ...enrollFormFace, person: id }),
        onSuccess: () => message.success('Successfully enrolled Face'),
        onError: (err) => message.error(err.message)
    })

    const personMutation = useMutation({
        mutationKey: ['addPerson', 'threats'],
        mutationFn: () => postPerson(token ?? "", personForm),
        onMutate: () => {
            message.open({
                key: 'add-watchlist-person-mutation',
                type: "loading",
                content: "Saving person information...",
                duration: 0
            })
        },
        onSuccess: (data) => {
            setWatchlistForm(prev => ({ ...prev, person_id: data.id }));
            message.success("Person added successfully");
            enrollFaceMutation.mutate(data.id, {
                onSuccess: () => {
                    watchlistPersonMutation.mutate({ ...watchlistForm, person_id: data.id });
                }
            });
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const watchlistPersonMutation = useMutation({
        mutationKey: ['addWatchlistPerson', 'threats'],
        mutationFn: (data: WatchlistForm) => postWatchlistPerson(token ?? "", data),
        onMutate: () => {
            message.open({
                key: 'add-watchlist-person-mutation',
                type: "loading",
                content: "Saving records to watchlist database...",
                duration: 0
            })
        },
        onSuccess: () => {
            message.open({
                key: 'add-watchlist-person-mutation',
                type: "success",
                content: "Successfully added person information to watchlist database.",
                duration: 3
            })
        },
        onError: (error) => {
            message.error(error.message)
        }
    })

    const patchPersonMutation = useMutation({
        mutationKey: ['patchPerson', 'threats'],
        mutationFn: (data: { id: number, form: PersonForm }) => patchPerson(token ?? "", data.id, data.form),
        onMutate: () => {
            message.open({
                key: 'edit-watchlist-person-mutation',
                type: "loading",
                content: "Updating person information...",
                duration: 0
            })
        },
        onSuccess: () => {
            message.success("Person updated successfully");
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const patchWatchlistPersonMutation = useMutation({
        mutationKey: ['patchWatchlistPerson', 'threats'],
        mutationFn: (data: { id: number, form: WatchlistForm }) => patchWatchlistPerson(token ?? "", data.id, data.form),
        onMutate: () => {
            message.open({
                key: 'edit-watchlist-person-mutation',
                type: "loading",
                content: "Updating watchlist record...",
                duration: 0
            })
        },
        onSuccess: () => {
            message.open({
                key: 'edit-watchlist-person-mutation',
                type: "success",
                content: "Successfully updated watchlist record.",
                duration: 3
            })
        },
        onError: (error) => {
            message.error(error.message)
        }
    });

    const handleSubmit = async () => {
        if (
            !personForm.first_name ||
            !personForm.last_name ||
            !personForm.gender_id ||
            !personForm.civil_status_id ||
            !personForm.nationality_id ||
            !watchlistForm.white_listed_type_id ||
            !watchlistForm.risk_level_id ||
            !watchlistForm.threat_level_id
        ) {
            message.warning("Please fill out all required fields.");
            return;
        }

        if (existingRecord) {
            // PATCH logic
            try {
                await patchPersonMutation.mutateAsync({
                    id: personData?.id,
                    form: personForm
                });
                await patchWatchlistPersonMutation.mutateAsync({
                    id: whitelistedPersonData?.id,
                    form: watchlistForm
                });
                message.success("Watchlist record updated successfully.");
            } catch (error: any) {
                message.error(error?.message || "Failed to update record.");
            }
            return;
        }

        // ...existing POST logic...
        let verifyResult;
        try {
            verifyResult = await verifyFaceInWatchlistMutation.mutateAsync({
                type: "face",
                template: enrollFormFace?.upload_data
            });
        } catch (error: any) {
            if (
                error?.message === "No Matches Found" ||
                error?.response?.data?.message === "No Matches Found"
            ) {
                verifyResult = { message: "No Matches Found" };
            } else {
                message.error(error?.message || "Face verification failed.");
                return;
            }
        }

        if (verifyResult?.message === "Match found.") {
            message.warning(verifyResult?.message || "Face already exists in watchlist.");
            return;
        } else {
            personMutation.mutate();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();

            reader.onloadend = () => {
                let base64String = reader.result as string;
                const commaIndex = base64String.indexOf(',');
                if (commaIndex !== -1) {
                    base64String = base64String.substring(commaIndex + 1);
                }
                setEnrollFormFace(prev => ({
                    ...prev,
                    upload_data: base64String
                }));
            };

            reader.readAsDataURL(selectedFile);
        }
    };

    useEffect(() => {
        setPersonForm(prev => ({
            ...prev,
            first_name: personData?.first_name,
            middle_name: personData?.middle_name,
            last_name: personData?.last_name,
            gender_id: personData?.gender?.id,
            civil_status_id: civilStatuses?.results?.find(stat => stat?.status === personData?.civil_status)?.id ?? null,
            nationality_id: nationalities?.results?.find(nat => nat?.nationality === personData?.nationality)?.id ?? null
        }))
    }, [civilStatuses, nationalities, personData])

    useEffect(() => {
        setWatchlistForm(prev => ({
            ...prev,
            person_id: personData?.id,
            risk_level_id: riskLevels?.results?.find(lvl => lvl?.risk_severity === whitelistedPersonData?.risk_level)?.id ?? null,
            threat_level_id: threatLevels?.results?.find(lvl => lvl?.threat_level === whitelistedPersonData?.threat_level)?.id ?? null,
            white_listed_type_id: types?.results?.find(type => type?.name === whitelistedPersonData?.white_listed_type)?.id ?? null,
        }))
    }, [riskLevels, whitelistedPersonData, threatLevels, types, personData])

    if (personDataLoading || whitelistedPersonDataLoading) return (
        <div className="flex justify-center items-center h-[90vh]">
            <Spinner />
        </div>
    );

    console.log(whitelistedPersonBiometric)

    return (
        <div className='w-full h-full mb-4'>
            <div className='shadow-allSide rounded-md p-5 mt-1 flex flex-col gap-5'>
                <h1 className='text-2xl font-bold'>Watchlist Registration</h1>

                <div className='w-full flex flex-col gap-5 text-[#374151]'>
                    <h3 className="text-[#374151] font-bold text-xl">Personal Information</h3>

                    <div className="w-full flex gap-4">
                        <div className="flex flex-1 flex-col gap-1">
                            <span>First Name <span className="text-red-600">*</span></span>
                            <Input
                                value={personForm.first_name}
                                onChange={(e) => setPersonForm({ ...personForm, first_name: e.target.value })}
                                className="h-10"
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <span>Last Name  <span className="text-red-600">*</span></span>
                            <Input
                                value={personForm.last_name}
                                onChange={(e) => setPersonForm({ ...personForm, last_name: e.target.value })}
                                className="h-10"
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <span>Middle Name</span>
                            <Input
                                value={personForm.middle_name}
                                onChange={(e) => setPersonForm({ ...personForm, middle_name: e.target.value })}
                                className="h-10"
                            />
                        </div>
                    </div>

                    <div className="w-full flex gap-4">
                        <div className="flex flex-1 flex-col gap-1">
                            <span>Gender <span className="text-red-600">*</span></span>
                            <Select
                                value={personForm.gender_id}
                                loading={gendersLoading}
                                options={genders?.results?.map(gender => ({
                                    label: gender?.gender_option,
                                    value: gender?.id
                                }))}
                                className="h-10"
                                onChange={value => {
                                    setPersonForm({ ...personForm, gender_id: value })
                                }}
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <span>Nationality <span className="text-red-600">*</span></span>
                            <Select
                                showSearch
                                optionFilterProp="label"
                                value={personForm.nationality_id}
                                loading={nationalitiesLoading}
                                options={
                                    nationalities?.results
                                        ?.slice()
                                        .sort((a, b) => {
                                            if (a.nationality?.toLowerCase() === "filipino") return -1;
                                            if (b.nationality?.toLowerCase() === "filipino") return 1;
                                            return 0;
                                        })
                                        .map(lvl => ({
                                            label: lvl?.nationality,
                                            value: lvl?.id
                                        }))
                                }
                                className="h-10"
                                onChange={value => {
                                    setPersonForm({ ...personForm, nationality_id: value })
                                }}
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <span>Civil Status <span className="text-red-600">*</span></span>
                            <Select
                                value={personForm.civil_status_id}
                                loading={civilStatusesLoading}
                                options={civilStatuses?.results?.map(lvl => ({
                                    label: lvl?.status,
                                    value: lvl?.id
                                }))}
                                className="h-10"
                                onChange={value => {
                                    setPersonForm({ ...personForm, civil_status_id: value })
                                }}
                            />
                        </div>
                    </div>

                    <div className="w-full flex gap-4">
                        <div className="flex flex-1 flex-col gap-1">
                            <span>Type <span className="text-red-600">*</span></span>
                            <Select
                                value={watchlistForm.white_listed_type_id}
                                loading={typesLoading}
                                options={types?.results?.map(type => ({
                                    label: type?.name,
                                    value: type?.id
                                }))}
                                className="h-10"
                                onChange={value => {
                                    setWatchlistForm({ ...watchlistForm, white_listed_type_id: value })
                                }}
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <span>Threat Level  <span className="text-red-600">*</span></span>
                            <Select
                                value={watchlistForm.threat_level_id}
                                loading={threatLevelsLoading}
                                options={threatLevels?.results?.map(lvl => ({
                                    label: lvl?.threat_level,
                                    value: lvl?.id
                                }))}
                                className="h-10"
                                onChange={value => {
                                    setWatchlistForm({ ...watchlistForm, threat_level_id: value })
                                }}
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <span>Risk Level  <span className="text-red-600">*</span></span>
                            <Select
                                value={watchlistForm.risk_level_id}
                                loading={riskLevelsLoading}
                                options={riskLevels?.results?.map(lvl => ({
                                    label: lvl?.risk_severity,
                                    value: lvl?.id
                                }))}
                                className="h-10"
                                onChange={value => {
                                    setWatchlistForm({ ...watchlistForm, risk_level_id: value })
                                }}
                            />
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        <div className="w-full flex flex-col gap-1">
                            <span className="">Upload Photo</span>
                            <input
                                type="file"
                                onChange={handleFileChange}
                            />
                        </div>

                        {
                            existingRecord ? (
                                <div className="w-full flex justify-center items-center">
                                    <Image
                                        src={
                                            whitelistedPersonBiometric?.data
                                                ? `data:image/png;base64,${whitelistedPersonBiometric?.data}`
                                                : image_placeholder
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="w-full flex justify-center items-center">
                                    <Image
                                        src={
                                            enrollFormFace?.upload_data
                                                ? `data:image/png;base64,${enrollFormFace.upload_data ?? whitelistedPersonBiometric?.data}`
                                                : image_placeholder
                                        }
                                    />
                                </div>
                            )
                        }
                    </div>

                    <div className="w-full flex justify-end">
                        <Button
                            loading={
                                verifyFaceInWatchlistMutation.isPending ||
                                personMutation.isPending ||
                                enrollFaceMutation.isPending ||
                                watchlistPersonMutation.isPending
                            }
                            type="primary"
                            variant="solid"
                            onClick={handleSubmit}
                        >
                            {
                                verifyFaceInWatchlistMutation.isPending ||
                                    personMutation.isPending ||
                                    enrollFaceMutation.isPending ||
                                    watchlistPersonMutation.isPending ?
                                    "Submitting" : "Submit"
                            }
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AddWatchlist
