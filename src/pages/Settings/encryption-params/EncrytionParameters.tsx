const EncrytionParameters = () => {
    return (
        <div className="mt-1 h-full w-full bg-white">
            <h1 className="text-xl font-semibold">Encryption Parameters</h1>

            <div className="w-full flex gap-10">
                <div className="flex-1 flex flex-col gap-4 max-w-[30rem] shadow-allSide mt-2 rounded-md bg-white p-4 relative">
                    <div>
                        <h2 className="font-bold text-lg">[ENCRYPTION]</h2>
                        <div className="flex flex-col">
                            <span>key_length = 1024</span>
                            <span>security_parameter_length = 128</span>
                            <span>expiration_seconds = 600</span>
                            <span>signature_type = Ed25519</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-bold text-lg">[RDG]</h2>
                        <div className="flex flex-col">
                            <span>entropy_bytes = 512</span>
                            <span>expand_factor = 4</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-bold text-lg">[AUTH_FACTORS]</h2>
                        <div className="flex flex-col">
                            <span>num_factors = 6</span>
                            <span>factor_length = 16</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EncrytionParameters