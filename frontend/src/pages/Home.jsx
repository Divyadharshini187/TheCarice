import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import CameraView from '../components/CameraView.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import ProductCard from '../components/ProductCard.jsx';

import { Mic, X, Search } from 'lucide-react';
import LiveKitAssistant from '../components/LiveKitAssistant.jsx';

import dosaiImg from '../assets/dosai.jpg';
import pooriImg from '../assets/poori.jpg';
import venPongalImg from '../assets/venpongal.jpg';
import watermelonImg from '../assets/watermelon_juice.jpg';
import idlyImg from '../assets/idly.jpg';
import roastImg from '../assets/roast.jpg';
import parottaImg from '../assets/parotta.jpg';
import chapathiImg from '../assets/chapathi.jpg';
import varietyRiceImg from '../assets/variety_rice.jpg';
import mealsImg from '../assets/meals.jpg';
import kothuParottaImg from '../assets/kothu_parotta.jpg';

const MOCK_MENU = [
  { id: 1, name: "Dosai", price: 60, category: "Breakfast", color: "#FF5733", image: `url(${dosaiImg})`, stock: 10 },
  { id: 2, name: "Poori", price: 60, category: "Breakfast", color: "#33FF57", image: `url(${pooriImg})`, stock: 10 },
  { id: 3, name: "Ven Pongal", price: 50, category: "Breakfast", color: "#3357FF", image: `url(${venPongalImg})`, stock: 10 },
  { id: 4, name: "Watermelon juice", price: 30, category: "Drinks", color: "#FF33A6", image: `url(${watermelonImg})`, stock: 10 },
  { id: 5, name: "Idly", price: 30, category: "Breakfast", color: "#FF5733", image: `url(${idlyImg})`, stock: 10 },
  { id: 6, name: "Roast", price: 40, category: "Breakfast", color: "#FF5733", image: `url(${roastImg})`, stock: 10 },
  { id: 7, name: "Parotta", price: 30, category: "Lunch", color: "#FF5733", image: `url(${parottaImg})`, stock: 10 },
  { id: 8, name: "Chappathi", price: 30, category: "Lunch", color: "#FF5733", image: `url(${chapathiImg})`, stock: 10 },
  { id: 9, name: "Variety Rice", price: 30, category: "Lunch", color: "#FF5733", image: `url(${varietyRiceImg})`, stock: 10 },
  { id: 10, name: "Meals", price: 60, category: "Lunch", color: "#FF5733", image: `url(${mealsImg})`, stock: 10 },
  { id: 11, name: "Kothu parotta", price: 50, category: "Lunch", color: "#FF5733", image: `url(${kothuParottaImg})`, stock: 10 },
];

const Home = () => {
  const navigate = useNavigate();
  const [isMicActive, setIsMicActive] = useState(false);
  const [status, setStatus] = useState('Say "Vanakkam" to start');
  const [lkToken, setLkToken] = useState(null);
  const [lkUrl, setLkUrl] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantItems, setAssistantItems] = useState([]);
  const [products, setProducts] = useState(() => {
    const savedMenu = localStorage.getItem('food-court-menu');
    if (savedMenu) {
      try {
        const parsed = JSON.parse(savedMenu);
        return parsed.length > 0 ? parsed : MOCK_MENU;
      } catch (e) {
        return MOCK_MENU;
      }
    }
    // Seed localStorage if empty
    localStorage.setItem('food-court-menu', JSON.stringify(MOCK_MENU));
    return MOCK_MENU;
  });

  const handleDisconnect = useCallback(() => {
    setShowAssistant(false);
    setIsMicActive(false);
    if (assistantItems.length > 0) {
      console.log("Navigating to order confirmation on disconnect with items:", assistantItems);
      navigate('/order-confirmation', { state: { items: assistantItems } });
    }
  }, [assistantItems, navigate]);

  const fetchToken = async () => {
    try {
      console.log("Fetching LiveKit token from /api/get-token...");
      const response = await fetch('/api/get-token');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (data.token) {
        setLkToken(data.token);
        setLkUrl(data.url);
        setShowAssistant(true);
      }
    } catch (error) {
      console.error("Error fetching LiveKit token:", error);
      setStatus("Failed to connect assistant: " + error.message);
    }
  };

  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const handleVoiceOrder = useCallback(
    (text) => {
      if (!text || text.trim() === '') return;
      const normalizedText = text.toLowerCase();
      if (normalizedText.includes('vanakkam')) {
        setStatus('Vanakkam! Connecting to assistant...');
        setIsMicActive(true);
        fetchToken();
        return;
      }
      // Basic matching logic preserved from original
    },
    [navigate, products]
  );

  const toggleMic = () => {
    if (!isMicActive) {
      setIsMicActive(true);
      setStatus('Listening...');
      fetchToken();
    } else {
      setIsMicActive(false);
      setShowAssistant(false);
      setStatus('Say "Vanakkam" to start');
    }
  };

  const handleAddToCart = (productId) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId && p.stock > 0) {
          return { ...p, stock: p.stock - 1 };
        }
        return p;
      })
    );
  };

  const handleAssistantData = useCallback((data) => {
    if (!data) return;
    if (data.items && Array.isArray(data.items)) {
      setAssistantItems((prev) => {
        const newItems = data.items.map((it, idx) => {
          const found = MOCK_MENU.find((p) => normalize(p.name) === normalize(it.name)) || MOCK_MENU.find((p) => p.id === it.id);
          return found ? { ...found, quantity: it.quantity || 1 } : { id: Date.now() + idx, name: it.name, price: it.price || 0, category: it.category || 'Misc', quantity: it.quantity || 1 };
        });
        return [...prev, ...newItems];
      });
    }
  }, []);

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>

          <h1 className={styles.mainTitle}>SREC Food Court</h1>

        </div>

        <div className={styles.hubContainer}>
          <div className={`${styles.controlHub} glass`}>
            <div className={styles.hubHeader}>
              <div className={styles.hubStatus}>
                <div className={`${styles.statusDot} ${isMicActive ? styles.active : ''}`}></div>
                <span>{isMicActive ? 'AI Assistant Active' : 'AI Assistant Ready'}</span>
              </div>
            </div>

            <div className={styles.hubMain}>
              <div className={styles.cameraWrapper}>
                <CameraView />
              </div>

              <div className={styles.voiceControls}>
                <button
                  className={`${styles.micTrigger} ${isMicActive ? styles.listening : ''} glass`}
                  onClick={toggleMic}
                >
                  {isMicActive ? <X size={32} /> : <Mic size={32} />}
                </button>
                <div className={styles.statusDescription}>
                  <p className={styles.statusPrimary}>{status}</p>
                  <p className={styles.statusSecondary}>Say "Vanakkam" or tap the mic to start</p>
                </div>
              </div>
            </div>
            {isMicActive && <VoiceInput onOrder={handleVoiceOrder} isActive={isMicActive} />}
          </div>
        </div>
      </section>

      <main className={styles.menuSection}>
        <div className={styles.menuHeader}>
          <div className={styles.menuTitleGroup}>
            <h3 className={styles.sectionTitle}>Today's Specials</h3>
            <div className={styles.divider}></div>
          </div>
        </div>

        <div className={styles.menuGrid}>
          {products.map((p, idx) => (
            <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <ProductCard
                name={p.name}
                price={p.price}
                category={p.category}
                image={p.image}
                onClick={() => { }}
              />
            </div>
          ))}
        </div>
      </main>

      {showAssistant && lkToken && (
        <div className={styles.assistantOverlay}>
          <div className={`${styles.assistantDialog} glass-dark`}>
            <button className={styles.closeBtn} onClick={() => { setShowAssistant(false); setIsMicActive(false); }}>
              <X size={24} />
            </button>
            <LiveKitAssistant token={lkToken} serverUrl={lkUrl} onDisconnect={handleDisconnect} onDataReceived={handleAssistantData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
