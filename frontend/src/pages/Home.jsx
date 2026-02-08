import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import CameraView from '../components/CameraView.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import ProductCard from '../components/ProductCard.jsx';

import { Mic, X } from 'lucide-react';
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
  { id: 1, name: "Dosai", price: 60, category: "Breakfast", color: "#FF5733", image: `url(${dosaiImg})` },
  { id: 2, name: "Poori", price: 60, category: "Breakfast", color: "#33FF57", image: `url(${pooriImg})` },
  { id: 3, name: "Ven Pongal", price: 50, category: "Breakfast", color: "#3357FF", image: `url(${venPongalImg})` },
  { id: 4, name: "Watermelon juice", price: 30, category: "Drinks", color: "#FF33A6", image: `url(${watermelonImg})` },
  { id: 5, name: "Idly", price: 30, category: "Breakfast", color: "#FF5733", image: `url(${idlyImg})` },
  { id: 6, name: "Roast", price: 40, category: "Breakfast", color: "#FF5733", image: `url(${roastImg})` },
  { id: 7, name: "Parotta", price: 30, category: "Lunch", color: "#FF5733", image: `url(${parottaImg})` },
  { id: 8, name: "Chappathi", price: 30, category: "Lunch", color: "#FF5733", image: `url(${chapathiImg})` },
  { id: 9, name: "Variety Rice", price: 30, category: "Lunch", color: "#FF5733", image: `url(${varietyRiceImg})` },
  { id: 10, name: "Meals", price: 60, category: "Lunch", color: "#FF5733", image: `url(${mealsImg})` },
  { id: 11, name: "Kothu parotta", price: 50, category: "Lunch", color: "#FF5733", image: `url(${kothuParottaImg})` },
];

const Home = ({ setShowSupport }) => {
  const navigate = useNavigate();
  const [isMicActive, setIsMicActive] = useState(false);
  const [status, setStatus] = useState('Say "Vanakkam" to start');
  const [lkToken, setLkToken] = useState(null);
  const [lkUrl, setLkUrl] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);

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

  // ---- Menu matching helpers ----



  // ---- Product matching helpers (used by voice input) ----
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

      // exact token match
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

  // categories derived from products
  const categories = ['All', ...Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)))];

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

  const applyFilters = (list) => {
    return list
      .filter((p) => {
        if (inStockOnly && p.stock <= 0) return false;
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
        if (query.trim() !== '') {
          const q = normalize(query);
          const name = normalize(p.name);
          return name.includes(q) || q.split(/\s+/).some((t) => name.includes(t));
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return b.stock - a.stock; // featured -> show higher stock first
      });
  };

  const visibleProducts = applyFilters(products);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>The Carice — Costume Shop</h1>
        <p>{status}</p>
      </header>

      <div className={styles.inputs}>
        <div className={styles.cameraBox}>
          <CameraView />
        </div>
        <div className={styles.micButtonContainer}>
          <button className={`${styles.micButton} ${isMicActive ? styles.listening : ''}`} onClick={toggleMic}>
            <Mic size={32} />
          </button>
          <VoiceInput onOrder={handleVoiceOrder} isActive={!showAssistant} />
        </div>
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
              <X size={24} />
            </button>
            <LiveKitAssistant token={lkToken} serverUrl={lkUrl} onDisconnect={() => { setShowAssistant(false); setIsMicActive(false); }} />
          </div>
        </div>
      )}

      <div className={styles.menuSection}>
        <div className={styles.menuHeader}>
          <h3>Costumes</h3>
          <span className={styles.seeAll}>See All</span>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search costumes..."
          />

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock
          </label>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>

        <div className={styles.menuGrid}>
          {visibleProducts.map((item) => (
            <ProductCard
              key={item.id}
              name={item.name}
              price={item.price}
              category={item.category}
              stock={item.stock}
              image={item.image ? item.image : `linear-gradient(135deg, ${item.color}, ${item.color}88)`}
              onAdd={() => handleAddToCart(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
