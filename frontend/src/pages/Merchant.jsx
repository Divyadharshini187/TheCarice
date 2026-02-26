import React, { useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const Merchant = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Active'); // Active, All
    const language = localStorage.getItem('language') || 'en';
    const t = translations[language];

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/merchant/orders');
            if (!response.ok) throw new Error("Failed to fetch orders");
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Polling every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (billId, newStatus) => {
        try {
            const response = await fetch(`/api/merchant/orders/${billId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setOrders(orders.map(order =>
                    order.bill_id === billId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#FF9F43';
            case 'Preparing': return '#00CFE8';
            case 'Ready': return '#2ECC71';
            case 'Completed': return '#A4B0BE';
            default: return '#2D3436';
        }
    };

    // Helper to translate food items back for merchant display
    const translateItem = (itemName) => {
        const itemKey = itemName.toLowerCase().replace(/\s+/g, '');
        // Search for a matching key in translations
        for (const key in translations.en) {
            if (key.toLowerCase() === itemKey || translations.en[key].toLowerCase() === itemName.toLowerCase()) {
                return t[key] || itemName;
            }
        }
        return itemName;
    };

    const filteredOrders = filter === 'Active'
        ? orders.filter(o => o.status !== 'Completed')
        : orders;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#F8F9FA', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#2D3436', margin: 0 }}>{t.merchantDashboard}</h1>
                    <p style={{ color: '#636E72', marginTop: '8px' }}>{t.merchantDesc}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', background: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={() => setFilter('Active')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: filter === 'Active' ? '#2D3436' : 'transparent',
                            color: filter === 'Active' ? 'white' : '#636E72',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t.activeOrders}
                    </button>
                    <button
                        onClick={() => setFilter('All')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: filter === 'All' ? '#2D3436' : 'transparent',
                            color: filter === 'All' ? 'white' : '#636E72',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t.allHistory}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="spinner"></div>
                    <p>{t.loadingOrders}</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '1.2rem', color: '#636E72' }}>{t.noOrdersFound}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {filteredOrders.map(order => (
                        <div key={order.bill_id} style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '24px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
                            border: '1px solid #F1F2F6',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '6px',
                                height: '100%',
                                backgroundColor: getStatusColor(order.status)
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        backgroundColor: `${getStatusColor(order.status)}15`,
                                        color: getStatusColor(order.status),
                                        letterSpacing: '0.5px'
                                    }}>
                                        {language === 'ta' ? (order.status === 'Pending' ? 'நிலுவையில்' : order.status === 'Preparing' ? 'தயாரிக்கப்படுகிறது' : order.status === 'Ready' ? 'தயார்' : 'முடிந்தது') : order.status.toUpperCase()}
                                    </span>
                                    <h3 style={{ margin: '12px 0 4px 0', fontSize: '1.25rem', fontWeight: '800' }}>{order.customer_name}</h3>
                                    <p style={{ margin: 0, color: '#A4B0BE', fontSize: '0.85rem' }}>{new Date(order.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#A4B0BE', fontWeight: '600' }}>{t.tokenLabel}</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2D3436' }}>{order.token}</div>
                                </div>
                            </div>

                            <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {order.order_items.map((item, idx) => (
                                        <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginRight: '12px' }} />
                                            {translateItem(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {order.status === 'Pending' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.bill_id, 'Preparing')}
                                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#00CFE8', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        {t.startCooking}
                                    </button>
                                )}
                                {order.status === 'Preparing' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.bill_id, 'Ready')}
                                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2ECC71', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        {t.ready}
                                    </button>
                                )}
                                {order.status === 'Ready' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.bill_id, 'Completed')}
                                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2D3436', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        {t.markCompleted}
                                    </button>
                                )}
                                {order.status === 'Completed' && (
                                    <div style={{ flex: 1, textAlign: 'center', padding: '12px', color: '#A4B0BE', fontWeight: '600' }}>
                                        {t.orderFinished}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(0,0,0,0.1);
                    border-left-color: #2D3436;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px auto;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Merchant;
