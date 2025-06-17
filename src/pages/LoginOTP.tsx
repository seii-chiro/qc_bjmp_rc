import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTokenStore } from "@/store/useTokenStore";
import { useAuthStore } from "@/store/useAuthStore";
import bjmp_logo from "@/assets/Logo/bjmp.png"
import bjmpro_logo from "@/assets/Logo/BJMPRO.png"
import bp_logo from "@/assets/Logo/Bagong_Pilipinas_logo.png"
import lqp_logo from "@/assets/Logo/LQP.png"
import qcjmd_logo from "@/assets/Logo/QCJMD.png"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { message, Modal, Input } from 'antd';
import { BASE_URL } from "@/lib/urls";
import { useUserStore } from "@/store/useUserStore";
import tambuli_logo_horizontal from "@/assets/logo_tambuli-labs-horizontal.png"
import merlin_logo from "@/assets/MastheadLOGO.png"

const LoginOTP = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isOTPModalVisible, setIsOTPModalVisible] = useState(false);
    const [otp, setOtp] = useState("");
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const setToken = useTokenStore().setToken;
    const setIsAuthenticated = useAuthStore().setIsAuthenticated;
    const setUser = useUserStore()?.setUser;

    // Initial login request to get OTP
    const requestOTP = async ({ email, password }: { email: string; password: string; }) => {
        const response = await fetch(`${BASE_URL}/api/login_v2/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error);
        }

        const data = await response.json();

        // Return both the token and the status code for determining the flow
        return { token: data.token, user: data.user, status: response.status };
    };

    // Verify OTP request
    const verifyOTP = async ({ otp, email }: { otp: string; email: string; }) => {
        const response = await fetch(`${BASE_URL}/api/login_v2/login/verify-otp/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ otp, email }),
        });

        if (!response.ok) {
            const error = await response.json()
            throw new Error(JSON.stringify(error.error));
        }

        const data = await response.json();
        return data;
    };

    // Login mutation to request OTP
    const loginMutation = useMutation({
        mutationFn: requestOTP,
        onSuccess: (data) => {
            // If status is 200, immediately authenticate the user without OTP
            if (data.status === 200) {
                setToken(data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                message.success("Welcome");
                navigate("/jvms/dashboard");
            } else {
                // Otherwise, show OTP modal
                setIsOTPModalVisible(true);
                message.success("OTP sent to your email");
            }
        },
        onError: (error) => {
            console.error("Login error:", error);
            message.error(error.message || "Login Error");
        },
    });

    // OTP verification mutation
    const otpVerificationMutation = useMutation({
        mutationFn: verifyOTP,
        onSuccess: (data) => {
            setToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true);
            message.success("Welcome");
            setIsOTPModalVisible(false);
            navigate("/jvms/dashboard");
        },
        onError: (error) => {
            console.error("OTP verification error:", error);
            message.error(error.message || "OTP Verification Failed");
        },
    });

    const handleLogin = () => {
        if (!emailRef.current || !passwordRef.current) return;

        loginMutation.mutate({
            email: emailRef.current.value,
            password: passwordRef.current.value,
        });
    };

    const handleVerifyOTP = () => {
        if (!otp) {
            message.error("Please enter OTP");
            return;
        }

        otpVerificationMutation.mutate({
            otp,
            email: emailRef?.current?.value ?? "",
        });
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
    };

    const handleCancelOTP = () => {
        setIsOTPModalVisible(false);
        setOtp("");
    };

    return (
        <>
            <div className="bg-[url('/login.png')] bg-blue-500 bg-cover bg-center flex flex-col items-center justify-center gap-4 min-h-screen w-screen">
                {/* <div className="bg-white/50 filter backdrop-blur-sm p-14 rounded-xl flex flex-col gap-8 items-center justify-center w-[32rem] shadow-lg"></div> */}
                <div className="bg-white/50 filter backdrop-blur-sm p-10 rounded-xl flex flex-col gap-8 items-center justify-center w-[32rem] shadow-lg">
                    <div className="flex flex-col gap-6 items-center">
                        <div >
                            <div className="flex gap-2 items-center justify-center">
                                <div className="w-24 h-24">
                                    <img src={bjmp_logo} alt="tambuli alert logo" />
                                </div>
                                <div className="w-24 h-24">
                                    <img src={bjmpro_logo} alt="tambuli alert logo" />
                                </div>
                                <div className="w-[6.5rem] h-[6.5rem]">
                                    <img src={qcjmd_logo} alt="tambuli alert logo" />
                                </div>
                            </div>
                            <div className="flex gap-2 items-center justify-center">
                                <div className="w-24">
                                    <img src={lqp_logo} alt="tambuli alert logo" />
                                </div>
                                <div className="w-24">
                                    <img src={bp_logo} alt="tambuli alert logo" />
                                </div>
                            </div>
                        </div>
                        <p className="text-base font-semibold">Please login to continue.</p>
                    </div>
                    <div className="flex flex-col items-center w-full">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLogin();
                            }}
                            className="flex flex-col w-full"
                        >
                            <input
                                placeholder="Username"
                                type="email"
                                id="username"
                                className="border-2 border-gray-400 rounded-md px-1.5 py-0.5 w-full mb-4 h-12 bg-[#EAEAEC]"
                                ref={emailRef}
                                required
                            />
                            <div className="relative w-full">
                                <input
                                    placeholder="Password"
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="border-2 border-gray-400 rounded-md px-1.5 py-0.5 w-full mb-7 h-12 bg-[#EAEAEC]"
                                    required
                                    minLength={5}
                                    ref={passwordRef}
                                />
                                <div
                                    className="absolute z-50 top-3.5 right-5"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowPassword(prev => !prev);
                                    }}>
                                    {
                                        showPassword ?
                                            <AiOutlineEyeInvisible size={20} /> :
                                            <AiOutlineEye size={20} />
                                    }
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="shadow w-full bg-[#1E365D] text-white rounded-lg hover:bg-gray-600 hover:text-white h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? "Logging in..." : "Login"}
                            </button>
                            <div className="w-full flex justify-center items-center mt-4">
                                <div className="relative flex-1 flex items-center justify-center gap-1">
                                    <div className="font-bold text-xs text-[#1E365D]">Secured by:</div>
                                    <img
                                        src={merlin_logo}
                                        className="w-32"
                                    />
                                </div>
                                <div className="h-8 w-[2px] bg-[#1E365D] ml-5" />
                                <div className="relative flex-1 flex items-center justify-center gap-1">
                                    <div className="font-bold text-xs text-[#1E365D]">Powered by:</div>
                                    <img
                                        src={tambuli_logo_horizontal}
                                        className="w-20"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <Modal
                title="OTP Verification"
                centered
                open={isOTPModalVisible}
                onCancel={handleCancelOTP}
                footer={[
                    <button
                        key="cancel"
                        onClick={handleCancelOTP}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2"
                    >
                        Cancel
                    </button>,
                    <button
                        key="verify"
                        onClick={handleVerifyOTP}
                        disabled={otpVerificationMutation.isPending || !otp}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {otpVerificationMutation.isPending ? "Verifying..." : "Verify OTP"}
                    </button>
                ]}
            >
                <div className="flex flex-col items-center">
                    <p className="mb-4 text-center">
                        Please enter the One-Time Password (OTP) sent to your registered email.
                    </p>
                    <Input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={handleOtpChange}
                        className="mb-4 text-center text-xl tracking-widest"
                        maxLength={6}
                    />
                </div>
            </Modal>
        </>
    );
};

export default LoginOTP;