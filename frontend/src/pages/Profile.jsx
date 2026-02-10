import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, LogOut, ArrowLeft } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();

    const user = {
        name: "Divya",
        email: "divya@example.com",
        phone: "+91 98765 43210",
        address: "123 Food Street, Chennai",
        orders: [
            { id: "FC-20260208-1", date: "2026-02-08", total: 120, status: "Delivered" },
            { id: "FC-20260207-4", date: "2026-02-07", total: 60, status: "Delivered" }
        ]
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
                    marginBottom: '30px'
                }}
            >
                <ArrowLeft size={20} /> Back to Shop
            </button>

            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                marginBottom: '30px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '40px' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '30px',
                        background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 10px 20px rgba(255, 71, 87, 0.2)'
                    }}>
                        <User size={50} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#2D3436' }}>{user.name}</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#636E72', fontWeight: '500' }}>Premium Member</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#636E72' }}>
                        <Mail size={20} /> <span>{user.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#636E72' }}>
                        <Phone size={20} /> <span>{user.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#636E72' }}>
                        <MapPin size={20} /> <span>{user.address}</span>
                    </div>
                </div>
            </div>

            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', color: '#2D3436', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package size={24} color="#FF4757" /> Recent Orders
                </h3>

                {user.orders.map((order, index) => (
                    <div key={index} style={{
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#F8F9FA',
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: '700', color: '#2D3436' }}>{order.id}</div>
                            <div style={{ fontSize: '0.9rem', color: '#636E72' }}>{order.date}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', color: '#FF4757' }}>${order.total.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8rem', color: '#2ECC71', fontWeight: '600' }}>{order.status}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                style={{
                    marginTop: '30px',
                    width: '100%',
                    padding: '18px',
                    background: 'none',
                    color: '#FF4757',
                    border: '2px solid rgba(255, 71, 87, 0.2)',
                    borderRadius: '20px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}
            >
                <LogOut size={20} /> Sign Out
            </button>
        </div>
    );
};

export default Profile;
