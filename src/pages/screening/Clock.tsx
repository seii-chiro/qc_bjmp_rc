import React, { useState } from "react";
import { useEffect } from "react";

const Clock = React.memo(() => {
    const [dateTime, setDateTime] = useState<string>("");

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            };
            setDateTime(now.toLocaleString("en-US", options));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return <div className="text-sm md:text-base text-gray-600">{dateTime}</div>;
});

export default Clock;
