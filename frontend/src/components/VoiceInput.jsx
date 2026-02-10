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
        recognition.lang = "ta-IN"; // Default to Tamil

        let retryWithEnglish = false;

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
            console.error("Speech recognition error:", err.error, err.message);
            if (err.error === 'no-speech' && !retryWithEnglish) {
                retryWithEnglish = true;
                recognition.lang = "en-IN";
                try { recognition.start(); } catch (e) { }
                return;
            }
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
            // Optionally auto-restart if isActive is still true and it wasn't a manual stop
            // But let's keep it simple for now to avoid loops
            console.log("Recognition ended.");
        };


        try {
            if (isActive) {
                console.log("Starting speech recognition...");
                recognition.start();
            }
        } catch (e) {
            console.log("Recognition start failed or already running", e);
        }

        return () => {
            console.log("Cleaning up speech recognition...");
            try {
                recognition.stop();
            } catch (e) { }
        };
    }, [onOrder, isActive]);


    return (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <p style={{ color: listening ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                {listening ? '● Listening...' : 'Speech recognition paused'}
            </p>
        </div>
    );

};
export default VoiceInput;
