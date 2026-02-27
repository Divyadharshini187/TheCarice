import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import styles from './Home.module.css'; // Reusing some base styles for consistency

const AddItems = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Breakfast');
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newItem = {
            id: Date.now(),
            name,
            price: parseInt(price),
            category,
            image: previewImage ? `url(${previewImage})` : '',
            stock: 10
        };

        // Update localStorage
        const savedMenu = localStorage.getItem('food-court-menu');
        let menu = savedMenu ? JSON.parse(savedMenu) : [];

        // If it's the first time, we might want to seed it with current menu, 
        // but for now let's just append to what's there or start fresh.
        // The Home page will handle the "fallback to MOCK_MENU" logic if empty.

        menu.push(newItem);
        localStorage.setItem('food-court-menu', JSON.stringify(menu));

        console.log('Adding item:', newItem);
        alert(`Item "${name}" added successfully!`);

        // Reset form
        setName('');
        setPrice('');
        setPreviewImage(null);
        setImageFile(null);

        // Navigate back to shop to see the changes
        navigate('/');
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'Outfit, Inter, sans-serif',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
        }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#636E72',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '30px',
                    padding: '8px 0'
                }}
            >
                <ArrowLeft size={20} /> Back to Shop
            </button>

            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: '#2D3436' }}>Add New Item</h2>
                <p style={{ color: '#636E72', marginBottom: '40px' }}>Fill in the details to add a new costume or food item to the menu.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: '700', color: '#2D3436', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Masala Dosa"
                            required
                            style={{
                                padding: '16px 20px',
                                borderRadius: '16px',
                                border: '2px solid #F1F2F6',
                                background: '#F8F9FA',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontWeight: '700', color: '#2D3436', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Price (₹)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="60"
                                required
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '2px solid #F1F2F6',
                                    background: '#F8F9FA',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontWeight: '700', color: '#2D3436', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '2px solid #F1F2F6',
                                    background: '#F8F9FA',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    appearance: 'none'
                                }}
                            >
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Drinks</option>
                                <option>Snacks</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: '700', color: '#2D3436', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Item Image</label>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{
                                    padding: '10px',
                                    borderRadius: '12px',
                                    border: '2px dashed #D1D8E0',
                                    cursor: 'pointer'
                                }}
                            />
                            {previewImage && (
                                <div style={{
                                    width: '100%',
                                    height: '150px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '1px solid #F1F2F6'
                                }}>
                                    <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '20px',
                            padding: '18px',
                            background: '#FF4757',
                            color: 'white',
                            border: 'none',
                            borderRadius: '18px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 20px rgba(255, 71, 87, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Plus size={24} /> Create Item
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddItems;
