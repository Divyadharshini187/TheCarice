import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Login</h2>
            <form onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
                <div style={{ marginBottom: '1rem' }}>
                    <input type="email" placeholder="Email" style={{ width: '100%', padding: '10px' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px' }} />
                </div>
                <button type="submit" style={{ padding: '10px 20px', width: '100%', backgroundColor: '#FF4757', color: 'white', border: 'none' }}>Log In</button>
            </form>
            <p style={{ marginTop: '1rem' }}>
                Don't have an account? <span onClick={() => navigate('/signup')} style={{ color: '#FF4757', cursor: 'pointer' }}>Sign Up</span>
            </p>
        </div>
    );
};

export default Login;
