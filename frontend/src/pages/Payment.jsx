import React from 'react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Payment Gateway</h2>
            <p>Simulating secure payment...</p>
            <div style={{ margin: '30px 0', fontSize: '2rem' }}>💳 💸</div>
            <button
                onClick={() => { alert('Payment Successful!'); navigate('/'); }}
                style={{ padding: '10px 20px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                Confirm Payment
            </button>
        </div>
    );
};

export default Payment;
