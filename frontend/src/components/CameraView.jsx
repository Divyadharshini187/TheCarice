import React, { useRef, useEffect } from 'react';

const CameraView = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                }

            } catch (err) {
                console.error("Error accesseing camera:", err);
            }
        };
        startCamera();
    }, []);
    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "400%", height: "400%", objectFit: "cover" }}
        />
    );
};
// In a real app, this would request camera access.
// For now, just a placeholder or we can try adding real logic if we want.
// navigator.mediaDevices.getUserMedia({ video: true })
//     .then(stream => {
//         if (videoRef.current) {
//             videoRef.current.srcObject = stream;
//         }
//     })
//     .catch(err => console.error("Camera error:", err));

export default CameraView;
