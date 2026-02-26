import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (localStorage.getItem('currentUser')) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Find user
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Generate unique 6-digit code for 2FA
            const uniqueCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Store in temp for verification page
            localStorage.setItem('tempUser', JSON.stringify({ name: user.name, email: user.email, code: uniqueCode }));

            alert('A unique verification code has been sent to your email for security.');
            navigate('/verify-email');
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '1rem'
        }}>
            <div style={{ padding: '2.5rem', maxWidth: '400px', width: '100%', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)' }}>
                <h2 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '2rem' }}>Login</h2>
                {error && <p style={{ color: '#FF4757', marginBottom: '1rem', fontWeight: '500' }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1rem' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1rem' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '14px', width: '100%', backgroundColor: '#FF4757', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)' }}>
                        Log In
                    </button>
                </form>
                <p style={{ marginTop: '1.5rem', color: '#444', fontSize: '0.95rem' }}>
                    Don't have an account? <span onClick={() => navigate('/signup')} style={{ color: '#FF4757', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>Sign Up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
