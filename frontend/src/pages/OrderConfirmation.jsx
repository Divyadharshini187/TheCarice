import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const items = location.state?.items || [];
    const [orderResult, setOrderResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const total = items.reduce((sum, item) => sum + item.price, 0);

    const handleConfirmOrder = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: "Customer", // Can be dynamic if we have user context
                    items: items.map(item => item.name)
                })
            });

            if (!response.ok) throw new Error("Failed to place order");

            const result = await response.json();
            setOrderResult(result);
        } catch (error) {
            console.error("Order error:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (orderResult) {
        return (
            <div className="bill-container" style={{ padding: '2rem', maxWidth: '400px', margin: '40px auto', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px dashed #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#2D3436' }}>FOOD COURT BILL</h1>
                    <p style={{ margin: '5px 0', color: '#636E72', fontSize: '0.9rem' }}>{new Date(orderResult.timestamp).toLocaleString()}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <p style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                        <span style={{ fontWeight: 'bold' }}>Bill ID:</span>
                        <span>{orderResult.bill_id}</span>
                    </p>
                </div>

                <div style={{ borderBottom: '1px solid #eee', marginBottom: '15px' }}>
                    {items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1rem' }}>
                            <span>{item.name}</span>
                            <span>${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', color: '#2D3436', marginTop: '10px' }}>
                    <span>Total</span>
                    <span>${orderResult.total_amount.toFixed(2)}</span>
                </div>

                <div style={{ marginTop: '40px', display: 'flex', gap: '10px' }} className="no-print">
                    <button
                        onClick={handlePrint}
                        style={{ flex: 1, padding: '12px', background: '#3498DB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Print Bill
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{ flex: 1, padding: '12px', background: '#F1F2F6', color: '#2D3436', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Home
                    </button>
                </div>

                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        body * { visibility: hidden; }
                        .bill-container, .bill-container * { visibility: visible; }
                        .bill-container { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>Review Your Order</h2>
            {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '12px' }}>
                    <p>No items in your tray yet.</p>
                    <button onClick={() => navigate('/')} style={{ color: '#FF4757', border: 'none', background: 'none', cursor: 'pointer' }}>Go back to menu</button>
                </div>
            ) : (
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {items.map((item, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f2f6' }}>
                                <span style={{ fontWeight: '500' }}>{item.name}</span>
                                <span style={{ fontWeight: '600' }}>${item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '800' }}>
                        <span>Total Amount</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ flex: 1, padding: '16px', background: '#f1f2f6', color: '#2d3436', border: 'none', borderRadius: '12px', fontWeight: '600' }}
                >
                    Cancel
                </button>
                <button
                    disabled={items.length === 0 || loading}
                    onClick={handleConfirmOrder}
                    style={{
                        flex: 2,
                        padding: '16px',
                        backgroundColor: '#2ECC71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 20px rgba(46, 204, 113, 0.2)'
                    }}
                >
                    {loading ? 'Processing...' : 'Confirm & Generate Bill'}
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmation;
