import { useEffect, useState } from "react";

const SimpleVoiceAssistant = () => {
  const [activated, setActivated] = useState(false);
  const [userName, setUserName] = useState("");
  const [order, setOrder] = useState("");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "ta-IN"; // or "ta-IN" for Tamil

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Heard:", transcript);

      if (!activated) {
        if (transcript.includes("vanakkam")) {
          setActivated(true);
          speak("Vanakkam! Please tell me your name and your order for today.");
        }
      } else {
        // If name not set yet, assume first phrase is name
        if (!userName) {
          setUserName(transcript);
          speak(`Hello ${transcript}, what would you like to order today?`);
        } else if (!order) {
          setOrder(transcript);
          speak(`Got it, ${userName}. You ordered ${transcript}. Confirming your order now.`);
        }
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [activated, userName, order]);

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
        </div>
      )}
    </div>
  );
};

export default SimpleVoiceAssistant;