import { getGroup_Role } from "@/lib/query";
import { BASE_URL } from "@/lib/urls";
import { useTokenStore } from "@/store/useTokenStore";
import { useMutation, useQueries, useQueryClient} from "@tanstack/react-query";
import { message, Select } from "antd";
import { useState } from "react";

type AddUserForm = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    groups: string[];
}

const AddUser = ({ onClose }) => {
    const token = useTokenStore().token;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectUser, setSelectUser] = useState<AddUserForm>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        groups: [],
    });

const UserMutation = useMutation({
    mutationKey: ['user'],
    mutationFn: async (user: AddUserForm) => {
        const res = await fetch(`${BASE_URL}/api/user/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(user),
        });
        if (!res.ok) {
            let errorMessage = "Error Adding User";
            try {
                const errorData = await res.json();
                errorMessage =
                    errorData?.message ||
                    errorData?.error ||
                    JSON.stringify(errorData);
            } catch {
                errorMessage = "Unexpected error occurred";
            }
            throw new Error(errorMessage);
        }
        return res.json();
    },
    onSuccess: (newUser) => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        messageApi.success("User added successfully");
        onClose(newUser.email); 
    },
    onError: (error) => {
        messageApi.error(error.message);
    },
});

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        UserMutation.mutate(selectUser);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setSelectUser(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const results = useQueries({
        queries: [
            {
                queryKey: ["roles"],
                queryFn: () => getGroup_Role(token ?? ""),
            },
        ],
    });

    const groupRoleData = results[0].data;

    const onGroupRoleChange = (values: string[]) => {
        setSelectUser(prevForm => ({
            ...prevForm,
            groups: values,
        }));
    }; 
    return (
        <div>
            {contextHolder}
            <form onSubmit={handleUserSubmit}>
                <div className="grid grid-cols-1 w-full gap-3">
                    <div>
                        <p className="py-1 text-base font-semibold text-gray-500">Email:</p>
                        <input
                            type="email"
                            name="email"
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="h-12 border w-full border-gray-300 rounded-lg px-2"
                        />
                    </div>
                    <div>
                        <p className="py-1 text-base font-semibold text-gray-500">Password:</p>
                        <input
                            type="text"
                            name="password"
                            onChange={handleInputChange}
                            placeholder="Password"
                            className="h-12 border w-full border-gray-300 rounded-lg px-2"
                        />
                    </div>
                    <div>
                        <p className="py-1 text-base font-semibold text-gray-500">First Name:</p>
                        <input
                            type="text"
                            name="first_name"
                            onChange={handleInputChange}
                            placeholder="First Name"
                            className="h-12 border w-full border-gray-300 rounded-lg px-2"
                        />
                    </div>
                    <div>
                        <p className="py-1 text-base font-semibold text-gray-500">Last Name:</p>
                        <input
                            type="text"
                            name="last_name"
                            onChange={handleInputChange}
                            placeholder="Last Name"
                            className="h-12 border w-full border-gray-300 rounded-lg px-2"
                        />
                    </div>
                    <div>
                        <p className="py-1 text-base font-semibold text-gray-500">Groups:</p>
                        <Select
                            className="py-2 w-full"
                            showSearch
                            mode="multiple"
                            placeholder="Groups"
                            optionFilterProp="label"
                            onChange={onGroupRoleChange}
                            options={groupRoleData?.results?.map(group => ({
                                value: group.name, 
                                label: group.name
                            }))} />
                    </div>
                </div>
                    <button type="submit" className="mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 flex ml-auto">Add User</button>
            </form>
        </div>
    );
};

export default AddUser;