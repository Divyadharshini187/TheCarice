import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { translations } from '../utils/translations';
import styles from './Home.module.css';

const AddItems = () => {
    const navigate = useNavigate();
    const language = localStorage.getItem('language') || 'en';
    const t = translations[language];

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(t.breakfast);
    const [previewImage, setPreviewImage] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price: parseInt(price), category })
            });

            if (response.ok) {
                alert(`Item "${name}" added successfully!`);
                setName('');
                setPrice('');
                setPreviewImage(null);
            } else {
                throw new Error('Failed to add item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'Outfit, Inter, sans-serif',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--bg-color) 0%, var(--glass-bg) 100%)'
        }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '30px',
                    padding: '8px 0'
                }}
            >
                <ArrowLeft size={20} /> {t.backToDashboard}
            </button>

            <div className="glass" style={{
                padding: '40px',
                borderRadius: '32px'
            }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>{t.addItems}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>{language === 'ta' ? "மெனுவில் புதிய உணவுப் பொருளைச் சேர்க்க விவரங்களைப் பூர்த்தி செய்யவும்." : "Fill in the details to add a new food item to the menu."}</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{language === 'ta' ? "பொருள் பெயர்" : "Item Name"}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={language === 'ta' ? "உதாரணம்: மசாலா தோசை" : "e.g. Masala Dosa"}
                            required
                            style={{
                                padding: '16px 20px',
                                borderRadius: '16px',
                                border: '2px solid var(--glass-border)',
                                background: 'var(--glass-bg)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{language === 'ta' ? "விலை (₹)" : "Price (₹)"}</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="60.00"
                                required
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '2px solid var(--glass-border)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{language === 'ta' ? "வகை" : "Category"}</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '2px solid var(--glass-border)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    appearance: 'none'
                                }}
                            >
                                <option>{t.breakfast}</option>
                                <option>{t.lunch}</option>
                                <option>{t.drinks}</option>
                                <option>{t.dinner}</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '20px',
                            padding: '18px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '18px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 20px var(--primary-glow)',
                            transition: 'all 0.3s ease',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        <Plus size={24} /> {loading ? (language === 'ta' ? 'சேர்க்கப்படுகிறது...' : 'Adding...') : (language === 'ta' ? "பொருளை உருவாக்கு" : "Create Item")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddItems;
