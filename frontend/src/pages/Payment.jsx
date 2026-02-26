import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translations } from '../utils/translations';
import { CreditCard, QrCode, ArrowLeft, CheckCircle } from 'lucide-react';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state?.order || null;
    const language = localStorage.getItem('language') || 'en';
    const t = translations[language];

    const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'upi'
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'success', 'failed'

    // UPI Details (User can change these)
    const upiId = "yourname@okicici"; // Placeholder UPI ID
    const merchantName = "SREC Food Court";

    const amount = orderData?.total_amount || 0;
    const billId = orderData?.bill_id || "N/A";

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + billId)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const handleRazorpayPayment = async () => {
        setLoading(true);
        try {
            // 1. Create order on backend
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amount })
            });
            const data = await res.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: "rzp_test_placeholder", // Replace with real key
                amount: data.amount,
                currency: data.currency,
                name: "SREC Food Court",
                description: `Payment for Order ${billId}`,
                order_id: data.id,
                handler: async function (response) {
                    // 3. Verify payment on backend
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.status === 'success') {
                        setPaymentStatus('success');
                        setTimeout(() => navigate('/'), 3000);
                    } else {
                        alert("Payment verification failed!");
                    }
                },
                prefill: {
                    name: "Customer",
                    email: "customer@example.com",
                },
                theme: {
                    color: "#FF4757"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("Error initializing payment");
        } finally {
            setLoading(false);
        }
    };

    if (paymentStatus === 'success') {
        return (
            <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <div className="glass" style={{ padding: '50px', borderRadius: '32px', animation: 'scaleUp 0.5s ease-out' }}>
                    <CheckCircle size={80} color="#2ECC71" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)' }}>Payment Successful!</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>Your order is being prepared. Redirecting to home...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer', marginBottom: '30px' }}>
                <ArrowLeft size={20} /> Back
            </button>

            <div className="glass" style={{ padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px', color: 'var(--text-main)' }}>Finalize Payment</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: 'rgba(0,0,0,0.03)', borderRadius: '20px', marginBottom: '30px' }}>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '600' }}>Amount to Pay</p>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#FF4757' }}>₹{amount.toFixed(2)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '600' }}>Order ID</p>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{billId}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <button
                        onClick={() => setPaymentMethod('razorpay')}
                        style={{ flex: 1, padding: '15px', borderRadius: '16px', border: paymentMethod === 'razorpay' ? '2px solid #FF4757' : '2px solid transparent', background: paymentMethod === 'razorpay' ? 'rgba(255, 71, 87, 0.05)' : 'rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                        <CreditCard size={24} color={paymentMethod === 'razorpay' ? '#FF4757' : '#666'} style={{ marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontWeight: '700', color: paymentMethod === 'razorpay' ? '#FF4757' : '#666' }}>Razorpay</p>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('upi')}
                        style={{ flex: 1, padding: '15px', borderRadius: '16px', border: paymentMethod === 'upi' ? '2px solid #FF4757' : '2px solid transparent', background: paymentMethod === 'upi' ? 'rgba(255, 71, 87, 0.05)' : 'rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                        <QrCode size={24} color={paymentMethod === 'upi' ? '#FF4757' : '#666'} style={{ marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontWeight: '700', color: paymentMethod === 'upi' ? '#FF4757' : '#666' }}>Scan & Pay</p>
                    </button>
                </div>

                {paymentMethod === 'razorpay' ? (
                    <button
                        onClick={handleRazorpayPayment}
                        disabled={loading}
                        style={{ width: '100%', padding: '20px', borderRadius: '20px', background: '#FF4757', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(255, 71, 87, 0.3)', transition: 'all 0.3s ease' }}
                    >
                        {loading ? "Initializing..." : "Proceed to Pay with Razorpay"}
                    </button>
                ) : (
                    <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '24px', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                            <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '250px', height: '250px' }} />
                        </div>
                        <p style={{ fontWeight: '700', color: 'var(--text-main)', margin: '0 0 5px 0' }}>Scan the QR code to pay via UPI</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>UPI ID: {upiId}</p>

                        <button
                            onClick={() => { setPaymentStatus('success'); setTimeout(() => navigate('/'), 3000); }}
                            style={{ marginTop: '20px', width: '100%', padding: '15px', borderRadius: '16px', background: '#2ECC71', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                        >
                            I have paid (Simulate Success)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
