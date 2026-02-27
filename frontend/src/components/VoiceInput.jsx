import React, { useState, useEffect, useRef, useCallback } from "react";
import { Room, RoomEvent, ParticipantKind } from "livekit-client";

const VoiceInput = ({ onOrder, isActive = true }) => {
  const [status, setStatus] = useState("disconnected");
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [agentTranscript, setAgentTranscript] = useState("");

  const roomRef = useRef(null);
  const connectedRef = useRef(false);
  const speakingTimeoutRef = useRef(null);
  const clearTranscriptTimeoutRef = useRef(null);

  // ✅ Stable callback ref — prevents useEffect re-running on every parent render
  const onOrderRef = useRef(onOrder);
  useEffect(() => { onOrderRef.current = onOrder; }, [onOrder]);

  const disconnect = useCallback(() => {
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    if (clearTranscriptTimeoutRef.current) clearTimeout(clearTranscriptTimeoutRef.current);
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    connectedRef.current = false;
  }, []);

  useEffect(() => {
    if (!isActive) {
      disconnect();
      return;
    }

    if (connectedRef.current) return;

    const connectToAgent = async () => {
      try {
        setStatus("connecting");

        const res = await fetch("/api/get-token");
        if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);

        const { url, token } = await res.json();
        if (!url || !token) throw new Error("Invalid token response");

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        // ── Order data from agent ──────────────────────────
        room.on(RoomEvent.DataReceived, (data) => {
          try {
            const msg = JSON.parse(new TextDecoder().decode(data));
            if (msg.type === "order_placed" || msg.type === "order_update") {
              onOrderRef.current?.({
                items: msg.items,
                billId: msg.bill_id,
                total: msg.total,
              });
            }
          } catch (e) {
            console.error("Data parse error:", e);
          }
        });

        // ── Transcription ──────────────────────────────────
        room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
          const text = segments.map((s) => s.text).join(" ").trim();
          if (!text) return;

          // ✅ Use ParticipantKind enum, not string comparison
          const isAgent = participant?.kind === ParticipantKind.AGENT;

          if (isAgent) {
            setAgentTranscript(text);
            setAgentSpeaking(true);

            if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = setTimeout(() => {
              setAgentSpeaking(false);
            }, 1500);

            // ✅ Clear transcript after agent finishes so stale text doesn't linger
            if (clearTranscriptTimeoutRef.current) clearTimeout(clearTranscriptTimeoutRef.current);
            clearTranscriptTimeoutRef.current = setTimeout(() => {
              setAgentTranscript("");
            }, 6000);

          } else {
            setUserTranscript(text);
            // Clear user transcript after a short delay
            setTimeout(() => setUserTranscript(""), 4000);
          }
        });

        // ── Connection lifecycle ───────────────────────────
        room.on(RoomEvent.Connected, async () => {
          console.log("Connected to LiveKit");
          setStatus("connected");
          connectedRef.current = true;

          // ✅ Enable mic only after confirmed connection
          try {
            await room.localParticipant.setMicrophoneEnabled(true);
          } catch (e) {
            console.error("Mic enable failed:", e);
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log("Disconnected from LiveKit");
          setStatus("disconnected");
          connectedRef.current = false;
          roomRef.current = null;
        });

        room.on(RoomEvent.MediaDevicesError, (e) => {
          console.error("Media device error:", e);
          setStatus("error");
        });

        await room.connect(url, token);

      } catch (err) {
        console.error("Connection error:", err);
        setStatus("error");
        connectedRef.current = false;
      }
    };

    connectToAgent();

    return () => disconnect();

  // ✅ onOrder removed from deps — handled via ref above
  }, [isActive, disconnect]);

  const handleRetry = () => {
    disconnect();
    setStatus("disconnected");
    // Small delay so the effect can re-run cleanly
    setTimeout(() => setStatus("connecting"), 100);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      {status === "connecting" && (
        <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>
          Connecting to assistant...
        </p>
      )}

      {status === "connected" && (
        <p style={{ color: "var(--primary)", fontWeight: 600 }}>
          {agentSpeaking ? "🔊 Assistant speaking..." : "● Listening..."}
        </p>
      )}

      {status === "error" && (
        <div>
          <p style={{ color: "red", fontWeight: 600 }}>
            Connection failed.
          </p>
          {/* ✅ Retry button instead of "please refresh" */}
          <button
            onClick={handleRetry}
            style={{
              marginTop: "8px",
              padding: "6px 16px",
              background: "var(--primary, #FF5C3A)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {agentTranscript && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "#e8f4f8",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <strong>Assistant:</strong> {agentTranscript}
        </div>
      )}

      {userTranscript && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "#f0f0f0",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <strong>You:</strong> {userTranscript}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;