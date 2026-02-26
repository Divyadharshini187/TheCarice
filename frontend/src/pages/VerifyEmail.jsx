import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('tempUser') || 'null');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUserEmail(currentUser.email);

        // Send actual email using EmailJS
        sendRealEmail(currentUser.email, currentUser.name);
    }, [navigate]);

    const sendRealEmail = async (email, name) => {
        setIsSending(true);
        const tempUser = JSON.parse(localStorage.getItem('tempUser') || '{}');
        const verificationCode = tempUser.code || "123456";

        const templateParams = {
            to_name: name,
            to_email: email,
            message: `Your verification code for The Carice is: ${verificationCode}`,
        };

        try {
            await emailjs.send(
                'service_3p9l2ls', // Replace with your Service ID
                'template_qax3m68', // Replace with your Template ID
                templateParams,
                'ZDCHpC_f-X8Ww7yN8'  // Replace with your Public Key
            );
            console.log('REAL EMAIL SENT SUCCESSFULLY');
        } catch (err) {
            console.error('FAILED TO SEND REAL EMAIL:', err);
            alert(`A verification code has been generated for ${email}.\n\n(Code: ${verificationCode})`);
        } finally {
            setIsSending(false);
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        const tempUser = JSON.parse(localStorage.getItem('tempUser') || '{}');

        if (code === tempUser.code) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            // Mark user as verified
            const updatedUsers = users.map(u => {
                if (u.email === tempUser.email) {
                    return { ...u, isVerified: true };
                }
                return u;
            });

            localStorage.setItem('users', JSON.stringify(updatedUsers));
            localStorage.setItem('currentUser', JSON.stringify({ name: tempUser.name, email: tempUser.email }));
            localStorage.removeItem('tempUser');

            alert('Verified successfully!');
            navigate('/');
        } else {
            setError('Invalid verification code. Please try again.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '1rem'
        }}>
            <div style={{ padding: '2.5rem', maxWidth: '400px', width: '100%', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)' }}>
                <h2 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.8rem' }}>Verify Your Email</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {isSending ? 'Sending code to...' : 'We\'ve sent a 6-digit verification code to'} <br />
                    <strong style={{ color: '#333' }}>{userEmail}</strong>
                </p>

                {error && <p style={{ color: '#FF4757', marginBottom: '1rem', fontWeight: '500' }}>{error}</p>}

                <form onSubmit={handleVerify}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '10px',
                                border: '2px solid #ddd',
                                boxSizing: 'border-box',
                                fontSize: '1.2rem',
                                textAlign: 'center',
                                letterSpacing: '5px',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>
                    <button type="submit" disabled={isSending} style={{ padding: '14px', width: '100%', backgroundColor: isSending ? '#ccc' : '#FF4757', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: '700', cursor: isSending ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)' }}>
                        {isSending ? 'Sending Email...' : 'Verify & Continue'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                    Didn't receive the email? <span onClick={() => sendRealEmail(userEmail, 'User')} style={{ color: '#FF4757', cursor: 'pointer', fontWeight: '700' }}>Resend Code</span>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
