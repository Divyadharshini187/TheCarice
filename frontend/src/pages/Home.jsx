import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import CameraView from '../components/CameraView.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import ProductCard from '../components/ProductCard.jsx';

import { Mic, X, LayoutDashboard, Utensils, User, Settings, Store } from 'lucide-react';
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

const Home = ({ setShowSupport }) => {
  const navigate = useNavigate();
  const [isMicActive, setIsMicActive] = useState(false);
  const [status, setStatus] = useState('Say "Vanakkam" to start');
  const [lkToken, setLkToken] = useState(null);
  const [lkUrl, setLkUrl] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantItems, setAssistantItems] = useState([]);
  const [products, setProducts] = useState(MOCK_MENU);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

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
      console.log("Token fetched successfully:", { hasToken: !!data.token, url: data.url });
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

  const levenshtein = (a, b) => {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };

  const matchProducts = (text) => {
    const cleaned = normalize(text);
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const matches = [];
    for (const item of products) {
      const name = normalize(item.name);
      for (const t of tokens) {
        if (name.split(/\s+/).includes(t)) {
          matches.push(item);
          break;
        }
      }
      if (matches.includes(item)) continue;
      if (cleaned.includes(name) || name.includes(cleaned)) {
        matches.push(item);
        continue;
      }
      const distance = levenshtein(name, cleaned);
      const threshold = Math.max(1, Math.floor(name.length * 0.35));
      if (distance <= threshold) {
        matches.push(item);
      }
    }
    return Array.from(new Set(matches));
  };

  const handleVoiceOrder = useCallback(
    (text) => {
      if (!text || text.trim() === '') return;
      const normalizedText = text.toLowerCase();
      console.log('Processing voice:', normalizedText);
      if (normalizedText.includes('vanakkam')) {
        setStatus('Vanakkam! Connecting to assistant...');
        setIsMicActive(true);
        fetchToken();
        return;
      }
      const items = matchProducts(text);
      if (items.length > 0) {
        console.log('Matched products:', items.map((i) => i.name));
        navigate('/order-confirmation', { state: { items } });
      } else {
        console.log('No products matched for:', text);
      }
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

  const categories = ['All', ...Array.from(new Set(MOCK_MENU.map((p) => p.category)))];
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

  const filteredProducts = products
    .filter((p) => (categoryFilter === 'All' ? true : p.category === categoryFilter))
    .filter((p) => (inStockOnly ? p.stock > 0 : true))
    .filter((p) => (query && query.trim() !== '' ? normalize(p.name).includes(normalize(query)) : true));

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <LayoutDashboard className={`${styles.navIcon} ${styles.active}`} size={28} />
        <Store className={styles.navIcon} size={28} onClick={() => navigate('/merchant')} />
        <Utensils className={styles.navIcon} size={28} onClick={() => navigate('/add-items')} />
        <User className={styles.navIcon} size={28} onClick={() => navigate('/profile')} />
        <Settings className={styles.navIcon} size={28} onClick={() => navigate('/settings')} />
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Carice Canteen</h1>
            <p>Experience the future of dining</p>
          </div>

          <div className={styles.controlHub}>
            <div className={styles.cameraCard}>
              <CameraView />
            </div>

            <div className={styles.statusInfo}>
              <p className={styles.statusMain}>
                {isMicActive ? 'Listening...' : 'Voice Assistant'}
              </p>
              <p className={styles.statusSub}>{status}</p>
            </div>

            <button
              className={`${styles.micButton} ${isMicActive ? styles.listening : ''}`}
              onClick={toggleMic}
              aria-pressed={isMicActive}
            >
              {isMicActive ? <X size={48} /> : <Mic size={48} />}
            </button>

            {isMicActive && <VoiceInput onOrder={handleVoiceOrder} isActive={isMicActive} />}
          </div>
        </header>

        <main className={styles.menuSection}>
          <div className={styles.menuHeader}>
            <h3>Today's Specials</h3>
          </div>

          <div className={styles.menuGrid}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price}
                category={p.category}
                image={p.image}
                onClick={() => {
                  handleAddToCart(p.id);
                }}
              />
            ))}
          </div>
        </main>
      </div>

      {showAssistant && lkToken && (
        <div className={styles.assistantOverlay}>
          <div className={styles.assistantContainer}>
            <button
              className={styles.closeAssistant}
              onClick={() => {
                setShowAssistant(false);
                setIsMicActive(false);
              }}
            >
              <X size={32} />
            </button>
            <LiveKitAssistant token={lkToken} serverUrl={lkUrl} onDisconnect={handleDisconnect} onDataReceived={handleAssistantData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;