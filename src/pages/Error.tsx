import { motion } from "framer-motion";

const Error = () => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
            {/* Floating emoji */}
            {/* <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4"
            >
                😬
            </motion.div> */}

            {/* Error box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-gray-100 text-center text-xl flex flex-col gap-4 items-center justify-center rounded-xl p-10 font-semibold shadow-xl max-w-lg"
            >
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Oops, an unexpected error occurred.
                </motion.p>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Please refresh the page or try again later.
                </motion.p>

                {/* Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-black text-white px-5 py-2 rounded-md shadow hover:bg-gray-800 transition-colors duration-200"
                >
                    Try Again
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Error;
