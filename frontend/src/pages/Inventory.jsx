import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, RefreshCw } from 'lucide-react';

const Inventory = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleUpdateStock = async (id, currentStock) => {
        const newStock = prompt("Enter new stock count:", currentStock);
        if (newStock === null || isNaN(newStock)) return;

        try {
            const res = await fetch(`/api/menu/${id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock_count: parseInt(newStock) })
            });
            if (res.ok) fetchInventory();
        } catch (error) {
            alert("Failed to update stock");
        }
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer', marginBottom: '30px' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="glass" style={{ padding: '40px', borderRadius: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>Inventory Management</h2>
                        <p style={{ color: 'var(--text-muted)', margin: '5px 0' }}>Track and manage food stock levels.</p>
                    </div>
                    <button onClick={fetchInventory} className="glass" style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>
                        <RefreshCw size={20} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading inventory...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {items.map(item => (
                            <div key={item.id} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '20px', border: item.stock_count < 10 ? '2px solid rgba(255, 71, 87, 0.3)' : '1px solid rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={24} color="#666" />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{item.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.category}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>STOCK</p>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: item.stock_count < 10 ? '#FF4757' : '#2ECC71' }}>
                                            {item.stock_count} {item.stock_count < 10 && <AlertTriangle size={16} inline />}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateStock(item.id, item.stock_count)}
                                        style={{ padding: '10px 20px', background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
