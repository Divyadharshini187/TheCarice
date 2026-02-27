import React, { useEffect } from "react";
import {
  LiveKitRoom,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
  useDataChannel,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";

const LiveKitAssistant = ({
  token,
  serverUrl,
  onDisconnect,
  onDataReceived,
}) => {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onDisconnect}
      data-lk-theme="default"
      style={{
        height: "320px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        background: "rgba(0,0,0,0.55)",
      }}
    >
      <AssistantInner onDataReceived={onDataReceived} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

const AssistantInner = ({ onDataReceived }) => {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();

  // ✅ ensure mic stays enabled
  useEffect(() => {
    localParticipant?.setMicrophoneEnabled(true).catch(() => {});
  }, [localParticipant]);

  // ✅ robust data channel handler
  useDataChannel((msg) => {
    try {
      if (!msg?.payload) return;

      const decoded = new TextDecoder().decode(msg.payload);
      if (!decoded) return;

      const data = JSON.parse(decoded);

      console.log("📦 Agent data:", data);

      if (data?.type === "order_update") {
        onDataReceived?.(data);
      }
    } catch (err) {
      console.error("❌ Data channel parse error:", err);
    }
  });

  const getStatusText = () => {
    switch (state) {
      case "idle":
        return "Waiting for you to speak...";
      case "listening":
        return "🎤 Listening...";
      case "thinking":
        return "🤔 Thinking...";
      case "speaking":
        return "🔊 Agent is speaking...";
      default:
        return "Connecting...";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "18px",
        padding: "20px",
      }}
    >
      {/* ✅ voice visualizer */}
      <div style={{ width: "100%", height: "100px" }}>
        <BarVisualizer state={state} trackRef={audioTrack} />
      </div>

      {/* ✅ status text */}
      <div
        style={{
          color: "white",
          fontSize: "1.15rem",
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        {getStatusText()}
      </div>

      {/* ✅ controls */}
      <VoiceAssistantControlBar />
    </div>
  );
};

export default LiveKitAssistant;