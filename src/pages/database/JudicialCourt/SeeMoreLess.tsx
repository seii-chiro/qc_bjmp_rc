import { useState } from "react";

const SeeMoreLess = ({ text, maxLength = 80 }) => {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;

    const isLong = text.length > maxLength;
    const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "...";

    return (
        <div style={styles.container}>
            <span style={styles.text}>
                {displayText}
            </span>
            {isLong && (
                <a
                    style={styles.link}
                    onClick={() => setExpanded(prev => !prev)}
                >
                    {expanded ? "See less" : "See more"}
                </a>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#333'
    },
    text: {
        flex: 1,
    },
    link: {
        marginLeft: 8,
        color: '#1E365D',
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
};

export default SeeMoreLess;