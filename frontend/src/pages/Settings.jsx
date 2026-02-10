import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Moon, Languages, Shield, ArrowLeft } from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const SettingItem = ({ icon: Icon, title, description, value, onChange, type = 'toggle' }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid #F1F2F6'
        }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: '#F8F9FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF4757'
                }}>
                    <Icon size={24} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#2D3436' }}>{title}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#636E72' }}>{description}</p>
                </div>
            </div>
            {type === 'toggle' && (
                <button
                    onClick={() => onChange(!value)}
                    style={{
                        width: '50px',
                        height: '26px',
                        borderRadius: '13px',
                        background: value ? '#FF4757' : '#D1D8E0',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: value ? '27px' : '3px',
                        transition: 'all 0.3s ease'
                    }} />
                </button>
            )}
        </div>
    );

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
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <SettingsIcon size={32} color="#2D3436" />
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#2D3436' }}>Settings</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <SettingItem
                        icon={Bell}
                        title="Push Notifications"
                        description="Receive updates about your orders and offers."
                        value={notifications}
                        onChange={setNotifications}
                    />
                    <SettingItem
                        icon={Moon}
                        title="Dark Mode"
                        description="Switch between light and dark themes."
                        value={darkMode}
                        onChange={setDarkMode}
                    />
                    <SettingItem
                        icon={Languages}
                        title="Language"
                        description="Select your preferred language (English/Tamil)."
                        type="select"
                    />
                    <SettingItem
                        icon={Shield}
                        title="Privacy & Security"
                        description="Manage your account security and data."
                        type="link"
                    />
                </div>

                <button
                    style={{
                        marginTop: '40px',
                        width: '100%',
                        padding: '16px',
                        background: '#2D3436',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;
