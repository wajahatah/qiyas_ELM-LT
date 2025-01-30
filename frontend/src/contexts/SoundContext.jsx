import React, { createContext, useContext, useState } from "react";

// Create Sound Context
const SoundContext = createContext();

// Sound Provider Component
export const SoundProvider = ({ children }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    // Function to play a sound
    const playSound = (soundPath) => {
        if (isSoundEnabled) {
            const audio = new Audio(soundPath);
            audio.play().catch((error) => {
                console.error("Error playing sound:", error);
            });
        }
    };

    // Function to toggle sound
    const toggleSound = () => {
        setIsSoundEnabled((prev) => !prev);
    };

    return (
        <SoundContext.Provider value={{ playSound, toggleSound, isSoundEnabled }}>
            {children}
        </SoundContext.Provider>
    );
};

// Custom hook to use Sound Context
export const useSound = () => useContext(SoundContext);
