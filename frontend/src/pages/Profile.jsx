import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, LogOut, ArrowLeft } from 'lucide-react';
import styles from './Home.module.css'; // Reusing some animations/utilities if helpful or just use index.css

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
        <div className="animate-fade" style={{ padding: '80px 40px', maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'white',
                    border: '1px solid rgba(0,0,0,0.05)',
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-muted)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginBottom: '40px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.3s ease'
                }}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="glass" style={{
                padding: '50px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '40px'
            }}>
                <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '40px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #FF6B81 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 20px 40px var(--primary-glow)',
                    flexShrink: 0
                }}>
                    <User size={70} />
                </div>
                <div>
                    <span style={{
                        color: 'var(--primary)',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        fontSize: '0.85rem',
                        letterSpacing: '2px'
                    }}>Premium Member</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '5px 0', letterSpacing: '-2px' }}>{user.name}</h2>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            <Mail size={18} /> {user.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            <Phone size={18} /> {user.phone}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass" style={{
                padding: '50px',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Recent Orders</h3>
                    <Package size={32} color="var(--primary)" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {user.orders.map((order, index) => (
                        <div key={index} className="animate-slide-up" style={{
                            padding: '24px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(255,255,255,0.5)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid rgba(0,0,0,0.03)',
                            animationDelay: `${index * 0.1}s`
                        }}>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>{order.id}</div>
                                <div style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{order.date}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--primary)' }}>₹{order.total}</div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: '#10B981',
                                    fontWeight: '800',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-full)'
                                }}>{order.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                style={{
                    marginTop: '40px',
                    width: '100%',
                    padding: '24px',
                    background: 'var(--text-main)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-lg)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
                <LogOut size={24} /> Sign Out Account
            </button>
        </div>
    );
};

export default Profile;
