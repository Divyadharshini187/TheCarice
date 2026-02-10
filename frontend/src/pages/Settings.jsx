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
            padding: '24px 0',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div className="glass" style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0
                }}>
                    <Icon size={28} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{title}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{description}</p>
                </div>
            </div>
            {type === 'toggle' && (
                <button
                    onClick={() => onChange(!value)}
                    style={{
                        width: '64px',
                        height: '34px',
                        borderRadius: 'var(--radius-full)',
                        background: value ? 'var(--primary)' : '#E2E8F0',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: value ? '0 4px 12px var(--primary-glow)' : 'none'
                    }}
                >
                    <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '4px',
                        left: value ? '34px' : '4px',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} />
                </button>
            )}
            {type === 'select' && (
                <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1rem' }}>English</div>
            )}
        </div>
    );

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
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div style={{
                        background: 'var(--text-main)',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <SettingsIcon size={32} />
                    </div>
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: 0, letterSpacing: '-2px' }}>Settings</h2>
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
                        title="Language Preference"
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
                        marginTop: '50px',
                        width: '100%',
                        padding: '24px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 20px var(--primary-glow)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    Apply All Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;
