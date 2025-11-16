import React, { useState, useEffect, useMemo } from "react";

interface Props {
    text: string;
}

export const TypewriterEffect: React.FC<Props> = ({ text }) => {
    const [display, setDisplay] = useState(" ");
    const [currentIndex, setCurrentIndex] = useState(0);

    const [prevText, setPrevText] = useState(text);
    if (text !== prevText) {
      setPrevText(text);
      setCurrentIndex(1);
      setDisplay(text.slice(0, 1));
    }

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplay((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, 50);

            return () => clearTimeout(timeout);
        }
    }, [text, currentIndex]);

    return <>{display}</>;
};
