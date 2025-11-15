import React, { useState, useEffect } from "react";
// import SlProgress from "@shoelace-style/shoelace/dist/react/progress/index.js";
import "./AnimatedProgress.css";

interface AnimatedProgressProps extends React.HTMLProps<HTMLProgressElement> {
    duration?: number;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ duration, ...props }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startTime = Date.now();

        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const newProgress = (elapsed / (duration * 1000)) * 100;

            if (newProgress < 100) {
                setProgress(newProgress);
                requestAnimationFrame(updateProgress);
            } else {
                setProgress(100);
            }
        };

        requestAnimationFrame(updateProgress);

        return () => {
            setProgress(0);
        };
    }, [duration]);

    return <progress value={progress} max="100" {...props} />;
};
