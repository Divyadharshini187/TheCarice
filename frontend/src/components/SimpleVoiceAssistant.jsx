import { useEffect, useState, useRef } from "react";
import { Room, RoomEvent } from "livekit-client";

const SimpleVoiceAssistant = ({ onOrderConfirmed }) => {
  const [status, setStatus] = useState("disconnected");
  const [transcript, setTranscript] = useState("");
  const [agentText, setAgentText] = useState("");

  const roomRef = useRef(null);
  const connectingRef = useRef(false);

  useEffect(() => {
    if (connectingRef.current) return;
    connectingRef.current = true;

    let mounted = true;

    const connectToAgent = async () => {
      try {
        setStatus("connecting");

        // ✅ fetch token safely
        const res = await fetch("/api/get-token");
        if (!res.ok) throw new Error("Token fetch failed");

        const { url, token } = await res.json();

        // ✅ create room with good defaults
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        roomRef.current = room;

        // ===============================
        // 🔹 DATA CHANNEL (orders)
        // ===============================
        room.on(RoomEvent.DataReceived, (payload) => {
          try {
            if (!payload) return;

            const decoded = new TextDecoder().decode(payload);
            const msg = JSON.parse(decoded);

            console.log("📦 Agent data:", msg);

            if (msg?.type === "order_update") {
              onOrderConfirmed?.({
                name: msg.customer_name,
                items: msg.items,
                billId: msg.bill_id,
                total: msg.total,
              });
            }
          } catch (e) {
            console.error("❌ Data parse error:", e);
          }
        });

        // ===============================
        // 🔹 TRANSCRIPTS
        // ===============================
        room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
          const text = segments.map((s) => s.text).join(" ").trim();
          if (!text) return;

          console.log("📝 Transcript:", text);

          if (participant?.isAgent) {
            setAgentText(text);
          } else {
            setTranscript(text);
          }
        });

        // ===============================
        // 🔹 CONNECTION EVENTS
        // ===============================
        room.on(RoomEvent.Connected, () => {
          console.log("✅ Connected to LiveKit");
          if (mounted) setStatus("connected");
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log("🔌 Disconnected");
          if (mounted) setStatus("disconnected");
          connectingRef.current = false;
        });

        // ===============================
        // 🔹 CONNECT
        // ===============================
        await room.connect(url, token);

        // ✅ IMPORTANT: warm up mic
        await room.localParticipant.setMicrophoneEnabled(true);
        console.log("🎤 Microphone enabled");

        if (mounted) setStatus("connected");
      } catch (err) {
        console.error("❌ Connection error:", err);
        if (mounted) setStatus("error");
        connectingRef.current = false;
      }
    };

    connectToAgent();

    return () => {
      mounted = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      connectingRef.current = false;
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

      {status === "error" && (
        <p style={{ color: "red" }}>
          Connection failed. Check console.
        </p>
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