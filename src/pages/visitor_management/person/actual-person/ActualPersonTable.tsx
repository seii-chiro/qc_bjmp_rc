import { getRealPerson } from '@/lib/queries'
import { useTokenStore } from "@/store/useTokenStore"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useState } from "react"
import type { ColumnsType } from "antd/es/table";
import { Table, message } from "antd"
import { GoPlus } from 'react-icons/go'
import { AiOutlineEdit } from 'react-icons/ai'
import { AiOutlineDelete } from 'react-icons/ai'
import { LuSearch } from "react-icons/lu";
import { NavLink } from 'react-router-dom';
import { PERSON, BASE_URL_BIOMETRIC } from "@/lib/urls"

const deletePerson = async (id: string | number, token: string) => {
    const res = await fetch(`${PERSON.deletePERSON}${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        }
    })

    if (!res.ok) {
        const errorData = await res.json();
        console.log(errorData)
    }

    return res.json()
}

const deletePersonBiometric = async (id: string | number) => {
    const res = await fetch(`${BASE_URL_BIOMETRIC}/api/biometric/delete-person/?person_id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (!res.ok) {
        const errorData = await res.json();
        console.log(errorData)
    }

    return res.json()
}

const syncBiometricDB = async () => {
    const res = await fetch(`${BASE_URL_BIOMETRIC}/api/biometric/sync_db_biometric/`)
    if (!res.ok) {
        const errorData = await res.json();
        console.log(errorData)
    }

    return res.json()
}

const Person = () => {
    const [searchText, setSearchText] = useState("")
    const token = useTokenStore().token
    const [messageApi, contextHolder] = message.useMessage()

    const { data: persons, refetch, isLoading: personIsLoading } = useQuery({
        queryKey: ['actual-person'],
        queryFn: () => getRealPerson(token ?? "")
    })

    const { refetch: refetchBiometric } = useQuery({
        queryKey: ["sync-biometric"],
        queryFn: syncBiometricDB,
        enabled: false,
    });

    const deletePersonMutation = useMutation({
        mutationKey: ['delete-person'],
        mutationFn: ({ id, token }: { id: string | number; token: string }) => deletePerson(id, token),
        onSuccess: () => { refetch() },
        onError: () => { refetch() }
    });

    const deletePersonBiometricMutation = useMutation({
        mutationKey: ['delete-person-biometric'],
        mutationFn: ({ id }: { id: string | number }) => deletePersonBiometric(id),
        onSuccess: () => { refetch() },
        // onError: () => { refetch() }
    })
    const dataSource = persons?.map((person, index) => (
        {
            key: index,
            id: person.id,
            firstName: person?.first_name ?? 'N/A',
            middleName: person?.middle_name ?? 'N/A',
            lastName: person?.last_name ?? 'N/A',
            suffix: person?.suffix ?? 'N/A',
            shortName: person?.shortname ?? 'N/A',
            biometricStatus: person?.biometric_status?.status ?? 'N/A',
            recordStatus: person?.record_status ?? 'N/A',
            actions: (
                <div className="flex gap-1.5 font-semibold transition-all ease-in-out duration-200 justify-center">
                    <button
                        className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-1 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                        <AiOutlineEdit />
                    </button>
                    <button
                        className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1 rounded-full flex w-10 h-10 items-center justify-center"
                        onClick={() => {
                            deletePersonMutation.mutate(
                                { id: person?.id, token: token ?? "" },
                            );
                            deletePersonBiometricMutation.mutate({ id: person.id })
                            messageApi.success(`Successfully Deleted ${person.first_name}`)
                        }}
                    >
                        <AiOutlineDelete />
                    </button>
                </div >
            ),
            profile: (
                <div className="flex items-center justify-center gap-1.5 font-semibold transition-all ease-in-out duration-200 w-24">
                    <NavLink
                        to={"enroll"}
                        state={{ selectedPerson: person }}
                        className="bg-blue-500 text-white w-full py-2 rounded-md flex gap-1 items-center justify-center"
                    >
                        <GoPlus />
                        Enroll
                    </NavLink>
                </div>
            ),
        }
    ))

    const filteredData = dataSource?.filter((visitor) =>
        Object.values(visitor).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    )?.reverse();


    const columns: ColumnsType<{
        key: number;
        id: number;
        firstName: string;
        middleName: string;
        lastName: string;
        suffix: string;
        shortName: string;
        recordStatus: string;
        actions: JSX.Element;
        profile: JSX.Element;
    }> = [
            {
                title: "Person ID",
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'First Name',
                dataIndex: 'firstName',
                key: 'firstName',
            },
            {
                title: 'Middle Name',
                dataIndex: 'middleName',
                key: 'middleName',
            },
            {
                title: 'Last Name',
                dataIndex: 'lastName',
                key: 'lastName',
            },
            {
                title: 'Suffix',
                dataIndex: 'suffix',
                key: 'suffix',
            },
            {
                title: 'Short Name',
                dataIndex: 'shortName',
                key: 'shortName',
            },
            {
                title: 'Record Status',
                dataIndex: 'recordStatus',
                key: 'recordStatus',
                render: (text) => (
                    <span className={text === 'Active' ? 'text-green-500' : text === 'Deleted' ? 'text-red-500' : 'text-gray-500'}>
                        {text}
                    </span>
                ),
                filters: [
                    {
                        text: 'Active',
                        value: 'Active',
                    },
                    {
                        text: 'Deleted',
                        value: 'Deleted',
                    },
                    {
                        text: 'N/A',
                        value: 'N/A',
                    },
                ],
                onFilter: (value, record) => record.recordStatus.indexOf(value as string) === 0,
                defaultSortOrder: "ascend",
                sorter: (a, b) => a?.recordStatus.localeCompare(b?.recordStatus),
            },
            {
                title: 'Biometric Status',
                dataIndex: 'biometricStatus',
                key: 'biometricStatus',
            },
            {
                title: 'Actions',
                dataIndex: 'actions',
                key: 'actions',
                align: 'center'
            }
        ];

    return (
        <>
            {contextHolder}
            <div className="mt-10 flex flex-col gap-5 item-center">
                <div className="w-full flex gap-5 justify-end">
                    <div className="w-72 relative flex items-center">
                        <input
                            placeholder="Search"
                            type="text"
                            onChange={(e) => setSearchText(e.target.value)}
                            className="border border-gray-400 h-10 w-full rounded-md px-2 active:outline-none focus:outline-none"
                        />
                        <LuSearch className="absolute right-[3%] text-gray-400" />
                    </div>
                    <button
                        onClick={() => refetchBiometric()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md flex gap-1 items-center justify-center"
                    >
                        Sync
                    </button>
                </div>
                <Table
                    loading={personIsLoading}
                    dataSource={filteredData}
                    columns={columns}
                />
            </div>

        </>
    )
}

export default Person