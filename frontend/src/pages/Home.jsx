<<<<<<< HEAD
import { useState, useCallback, useEffect } from 'react';
=======
import { useState, useCallback } from 'react';
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { translations } from '../utils/translations';

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
<<<<<<< HEAD
=======

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
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96

const Home = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const t = translations[language];

  // Reference map for static images
  const IMAGE_MAP = {
    "Dosai": dosaiImg,
    "Poori": pooriImg,
    "Ven Pongal": venPongalImg,
    "Watermelon juice": watermelonImg,
    "Idly": idlyImg,
    "Roast": roastImg,
    "Parotta": parottaImg,
    "Chappathi": chapathiImg,
    "Variety Rice": varietyRiceImg,
    "Meals": mealsImg,
    "Kothu parotta": kothuParottaImg
  };



  const [isMicActive, setIsMicActive] = useState(false);
  const [status, setStatus] = useState(t.vanakkamPrompt);
  const [lkToken, setLkToken] = useState(null);
  const [lkUrl, setLkUrl] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantItems, setAssistantItems] = useState([]);
<<<<<<< HEAD
  const [products, setProducts] = useState([]);
  const [isManageMode, setIsManageMode] = useState(false);


  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error("Failed to fetch menu");
      const data = await response.json();

      const translatedData = data.map(item => {
        const itemKeyForTrans = item.name.toLowerCase().replace(/\s+/g, '');
        // Try to find if we have a translation key
        let displayName = item.name;
        for (const key in translations.en) {
          if (key.toLowerCase() === itemKeyForTrans || translations.en[key].toLowerCase() === item.name.toLowerCase()) {
            displayName = t[key] || item.name;
            break;
          }
        }

        return {
          ...item,
          displayName,
          image: IMAGE_MAP[item.name] ? `url(${IMAGE_MAP[item.name]})` : null
        };
      });
      setProducts(translatedData);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
    setStatus(t.vanakkamPrompt);
  }, [language]);

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const response = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (response.ok) fetchMenu();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus })
      });
      if (response.ok) fetchMenu();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };
=======
  const [products, setProducts] = useState(MOCK_MENU);
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96

  const handleDisconnect = useCallback(() => {
    setShowAssistant(false);
    setIsMicActive(false);
    if (assistantItems.length > 0) {
<<<<<<< HEAD
=======
      console.log("Navigating to order confirmation on disconnect with items:", assistantItems);
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
      navigate('/order-confirmation', { state: { items: assistantItems } });
    }
  }, [assistantItems, navigate]);

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/get-token');
      if (!response.ok) throw new Error("Server error fetching token");
      const data = await response.json();
      if (data.token) {
        setLkToken(data.token);
        setLkUrl(data.url);
        setShowAssistant(true);
      }
    } catch (error) {
      console.error(error);
      setStatus("Error: " + error.message);
    }
  };

  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const handleVoiceOrder = useCallback(
    (text) => {
      if (!text || text.trim() === '') return;
      const normalizedText = text.toLowerCase();
      if (normalizedText.includes('vanakkam')) {
        setStatus(t.vanakkamConnecting);
        setIsMicActive(true);
        fetchToken();
        return;
      }
<<<<<<< HEAD
=======
      // Basic matching logic preserved from original
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
    },
    [navigate, products, t]
  );

  const toggleMic = () => {
    if (!isMicActive) {
      setIsMicActive(true);
      setStatus('Listening...');
      fetchToken();
    } else {
      setIsMicActive(false);
      setShowAssistant(false);
      setStatus(t.vanakkamPrompt);
    }
  };

<<<<<<< HEAD
=======
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

>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
  const handleAssistantData = useCallback((data) => {
    if (!data) return;
    if (data.items && Array.isArray(data.items)) {
      setAssistantItems((prev) => {
        const newItems = data.items.map((it, idx) => {
<<<<<<< HEAD
          const found = products.find((p) => normalize(p.name) === normalize(it.name));
=======
          const found = MOCK_MENU.find((p) => normalize(p.name) === normalize(it.name)) || MOCK_MENU.find((p) => p.id === it.id);
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
          return found ? { ...found, quantity: it.quantity || 1 } : { id: Date.now() + idx, name: it.name, price: it.price || 0, category: it.category || 'Misc', quantity: it.quantity || 1 };
        });
        return [...prev, ...newItems];
      });
    }
<<<<<<< HEAD
  }, [products]);
=======
  }, []);
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
<<<<<<< HEAD
          <h1 className={styles.mainTitle}>{t.heroTitle}</h1>
          <button
            onClick={() => setIsManageMode(!isManageMode)}
            style={{
              background: isManageMode ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: isManageMode ? 'white' : 'var(--text-main)',
              border: '1px solid var(--glass-border)',
              padding: '8px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              marginTop: '10px'
            }}
          >
            {isManageMode ? "Exit Manage Mode" : "Manage Menu"}
          </button>
        </div>

=======

          <h1 className={styles.mainTitle}>SREC Food Court</h1>

        </div>

>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
        <div className={styles.hubContainer}>
          <div className={`${styles.controlHub} glass`}>
            <div className={styles.hubHeader}>
              <div className={styles.hubStatus}>
                <div className={`${styles.statusDot} ${isMicActive ? styles.active : ''}`}></div>
<<<<<<< HEAD
                <span>{isMicActive ? t.aiStatusActive : t.aiStatusReady}</span>
=======
                <span>{isMicActive ? 'AI Assistant Active' : 'AI Assistant Ready'}</span>
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
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
<<<<<<< HEAD
                  <p className={styles.statusSecondary}>{t.micInstruction}</p>
=======
                  <p className={styles.statusSecondary}>Say "Vanakkam" or tap the mic to start</p>
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
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
<<<<<<< HEAD
            <h3 className={styles.sectionTitle}>{t.todaysSpecials}</h3>
=======
            <h3 className={styles.sectionTitle}>Today's Specials</h3>
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
            <div className={styles.divider}></div>
          </div>
        </div>

        <div className={styles.menuGrid}>
<<<<<<< HEAD
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: 'var(--text-muted)' }}>
              No items found. Use "Add Items" to populate the menu.
            </div>
          ) : products.map((p, idx) => (
            <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <ProductCard
                name={p.displayName || p.name}
                price={p.price}
                category={p.category}
                image={p.image}
                available={p.available}
                stockCount={p.stock_count}
                onClick={() => { if (p.available && p.stock_count > 0) navigate('/order-confirmation', { state: { items: [p] } }) }}
                onDelete={isManageMode ? () => handleDeleteItem(p.id) : null}
                onToggleAvailability={isManageMode ? () => handleToggleAvailability(p.id, p.available) : null}
=======
          {products.map((p, idx) => (
            <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <ProductCard
                name={p.name}
                price={p.price}
                category={p.category}
                image={p.image}
                onClick={() => { }}
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
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
