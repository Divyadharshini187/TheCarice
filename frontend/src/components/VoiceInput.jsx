import React, { useState, useEffect } from 'react';

const VoiceInput = ({ onOrder, isActive = true }) => {
    const [listening, setListening] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("SpeechRecognition not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "ta-IN";

        recognition.onstart = () => {
            setListening(true);
            console.log("Listening for voice input...");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Heard:", transcript);
            onOrder(transcript);
        };

        recognition.onerror = (err) => {
            if (err.error !== 'aborted') {
                console.error("Speech recognition error:", err);
            }
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.log("Recognition already started or failed to start", e);
        }

        return () => {
            recognition.stop();
        };
    }, [onOrder, isActive]);
    return (
        <div>
            {listening ? <p>Listening for orders...</p> : <p> Say "Vanakkam" to start</p>}
        </div>);
};
export default VoiceInput;
