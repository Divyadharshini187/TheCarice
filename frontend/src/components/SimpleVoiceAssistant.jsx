import { useEffect, useState } from "react";

const SimpleVoiceAssistant = ({ onOrderConfirmed }) => {
  const [activated, setActivated] = useState(false);
  const [userName, setUserName] = useState("");
  const [order, setOrder] = useState("");
  const [billId, setBillId] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "ta-IN"; // Tamil

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      console.log("Heard:", transcript);

      if (!activated) {
        if (transcript.includes("vanakkam")) {
          setActivated(true);
          speak("Vanakkam! Please tell me your name and your order for today.");
        }
      } else {
        if (!userName) {
          // First phrase after activation = name
          setUserName(transcript);
          speak(`Hello ${transcript}, what would you like to order today?`);
        } else if (!order) {
          // Next phrase = order
          setOrder(transcript);
          const generatedId = `BILL-${Date.now()}`;
          setBillId(generatedId);
          speak(
            `Got it, ${userName}. You ordered ${transcript}. Your bill ID is ${generatedId}.`
          );
        }
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [activated, userName, order]);

  // Notify parent when order is confirmed
  useEffect(() => {
    if (order && userName && billId && onOrderConfirmed) {
      onOrderConfirmed({ name: userName, order, billId });
    }
  }, [order, userName, billId, onOrderConfirmed]);

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
  };

  return (
    <div>
      {!activated && <p>Say "Vanakkam" to start</p>}
      {activated && !order && <p>Listening for your name and order...</p>}
      {order && (
        <div>
          <h3>Order Confirmation</h3>
          <p>Name: {userName}</p>
          <p>Order: {order}</p>
          <p>Bill ID: {billId}</p>
        </div>
      )}
    </div>
  );
};

export default SimpleVoiceAssistant;