// LiveKitModal.jsx
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import SimpleVoiceAssistant from "./SimpleVoiceAssistant";

const LiveKitModal = ({ setShowSupport }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <LiveKitRoom
          serverUrl={import.meta.env.VITE_LIVEKIT_URL}
          token={import.meta.env.VITE_LIVEKIT_TOKEN} // supply from your backend
          connect={true}
          video={false}
          audio={true}
          onDisconnected={() => setShowSupport(false)}
        >
          <RoomAudioRenderer />
          <SimpleVoiceAssistant />
        </LiveKitRoom>
      </div>
    </div>
  );
};

export default LiveKitModal;