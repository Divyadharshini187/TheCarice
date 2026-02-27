import { useEffect, useState, useRef } from "react";
import { Room, RoomEvent } from "livekit-client";

const SimpleVoiceAssistant = ({ onOrderConfirmed }) => {
  const [status, setStatus] = useState("disconnected");
  const [transcript, setTranscript] = useState("");
  const [agentText, setAgentText] = useState("");

  const roomRef = useRef(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (connectedRef.current) return;

    const connectToAgent = async () => {
      try {
        setStatus("connecting");

        // ✅ fetch token safely
        const res = await fetch("/api/get-token");
        if (!res.ok) throw new Error("Token fetch failed");

        const { url, token } = await res.json();
        if (!url || !token) throw new Error("Invalid token response");

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        roomRef.current = room;

        // ✅ ORDER DATA FROM AGENT
        room.on(RoomEvent.DataReceived, (data) => {
          try {
            const msg = JSON.parse(new TextDecoder().decode(data));

            if (msg.type === "order_update") {
              onOrderConfirmed?.({
                name: msg.customer_name,
                items: msg.items,
                billId: msg.bill_id,
                total: msg.total,
              });
            }
          } catch (e) {
            console.error("Data parse error:", e);
          }
        });

        // ✅ TRANSCRIPTION (FIXED AGENT DETECTION)
        room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
          const text = segments.map((s) => s.text).join(" ").trim();
          if (!text) return;

          // 🔥 reliable agent detection
          const isAgent =
            participant?.kind === "agent" ||
            participant?.identity?.toLowerCase().includes("agent");

          if (isAgent) {
            setAgentText(text);
          } else {
            setTranscript(text);
            console.log("User said:", text);
          }
        });

        room.on(RoomEvent.Connected, () => {
          console.log("Connected to LiveKit");
          setStatus("connected");
          connectedRef.current = true;
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log("Disconnected");
          setStatus("disconnected");
          connectedRef.current = false;
        });

        // ✅ CONNECT
        await room.connect(url, token);

        // ✅ ENABLE MIC
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (err) {
        console.error("Connection error:", err);
        setStatus("error");
        connectedRef.current = false;
      }
    };

    connectToAgent();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      connectedRef.current = false;
    };
  }, [onOrderConfirmed]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Food Court Assistant</h2>

      <div
        style={{
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px",
          background: status === "connected" ? "#d4edda" : "#f8d7da",
        }}
      >
        Status: {status}
      </div>

      {status === "connecting" && <p>Connecting to assistant...</p>}

      {status === "connected" && (
        <p>🎤 Speak now — say வணக்கம் to start</p>
      )}

      {agentText && (
        <div
          style={{
            padding: "10px",
            background: "#e8f4f8",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        >
          <strong>Assistant:</strong> {agentText}
        </div>
      )}

      {transcript && (
        <div
          style={{
            padding: "10px",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <strong>You:</strong> {transcript}
        </div>
      )}
    </div>
  );
};

export default SimpleVoiceAssistant;