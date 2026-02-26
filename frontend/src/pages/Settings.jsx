import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Moon, Languages, Shield, ArrowLeft, Key, Eye, Trash2, Share2 } from 'lucide-react';
import { translations } from '../utils/translations';

const Settings = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });
    const [showSecurity, setShowSecurity] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [dataSharing, setDataSharing] = useState(true);

    const t = translations[language];

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const SettingItem = ({ icon: Icon, title, description, value, onChange, type = 'toggle', options = [], onClick }) => (
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
                <div style={{ cursor: type === 'link' ? 'pointer' : 'default' }} onClick={onClick}>
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
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-main)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            )}
            {type === 'link' && (
                <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer' }}>
                    {showSecurity ? "Hide" : "Manage"}
                </button>
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
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
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
                <ArrowLeft size={20} /> {t.backToDashboard}
            </button>

            <div className="glass" style={{
                padding: '50px',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div style={{
                        background: 'var(--text-main)',
                        color: 'var(--bg-color)',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <SettingsIcon size={32} />
                    </div>
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: 0, color: 'var(--text-main)', letterSpacing: '-2px' }}>{t.settingsTitle}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <SettingItem
                        icon={Bell}
                        title={t.pushNotifications}
                        description={t.pushNotificationsDesc}
                        value={notifications}
                        onChange={setNotifications}
                    />
                    <SettingItem
                        icon={Moon}
                        title={t.darkMode}
                        description={t.darkModeDesc}
                        value={darkMode}
                        onChange={setDarkMode}
                    />
                    <SettingItem
                        icon={Languages}
                        title={t.langPref}
                        description={t.langPrefDesc}
                        type="select"
                        value={language}
                        onChange={setLanguage}
                        options={[
                            { label: 'English', value: 'en' },
                            { label: 'தமிழ் (Tamil)', value: 'ta' }
                        ]}
                    />
                    <SettingItem
                        icon={Shield}
                        title={t.privacySecurity}
                        description={t.privacySecurityDesc}
                        type="link"
                        onClick={() => setShowSecurity(!showSecurity)}
                    />

                    {showSecurity && (
                        <div style={{
                            marginTop: '10px',
                            padding: '20px',
                            background: 'rgba(0,0,0,0.02)',
                            borderRadius: '16px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            animation: 'slideUp 0.4s ease'
                        }}>
                            <SettingItem
                                icon={Key}
                                title={t.twoFactorAuth}
                                description={t.twoFactorDesc}
                                value={twoFactor}
                                onChange={setTwoFactor}
                            />
                            <SettingItem
                                icon={Share2}
                                title={t.dataSharing}
                                description={t.dataSharingDesc}
                                value={dataSharing}
                                onChange={setDataSharing}
                            />
                            <SettingItem
                                icon={Trash2}
                                title={t.clearCache}
                                description={t.clearCacheDesc}
                                type="button"
                                onClick={() => alert("Cache cleared successfully!")}
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={() => {
                        window.location.reload();
                    }}
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
                    {t.applyChanges}
                </button>
            </div>
        </div>
    );
};

export default Settings;
