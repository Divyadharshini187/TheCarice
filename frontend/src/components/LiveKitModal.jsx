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
  token={import.meta.env.VITE_LIVEKIT_TOKEN}
  connect={true}
  video={false}
  audio={true}
  onDisconnected={() => {
    setShowSupport(false);
    // Here you can show the order summary
    alert(`Order confirmed!\nName: ${userName}\nOrder: ${order}\nBill ID: ${billId}`);
  }}
>
  <RoomAudioRenderer />
  <SimpleVoiceAssistant
    onOrderConfirmed={(details) => {
      // details = { name, order, billId }
      console.log("Order details:", details);
    }}
  />
</LiveKitRoom>
      </div>
    </div>
  );
}
export default LiveKitModal;