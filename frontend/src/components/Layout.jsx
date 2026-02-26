import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Utensils, User, Settings, Package, TrendingUp } from 'lucide-react';
import { translations } from '../utils/translations';
import styles from './Layout.module.css';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = React.useState(null);
    const [language, setLanguage] = React.useState(localStorage.getItem('language') || 'en');

    React.useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [location.pathname]);

    // Update language state when settings change
    React.useEffect(() => {
        const handleStorageChange = () => {
            setLanguage(localStorage.getItem('language') || 'en');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const t = translations[language];

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, path: '/', label: t.home },
        { icon: Store, path: '/merchant', label: t.merchant },
        { icon: TrendingUp, path: '/sales-report', label: 'Sales Report' },
        { icon: Package, path: '/inventory', label: 'Inventory' },
        { icon: Utensils, path: '/add-items', label: t.addItems },
        { icon: User, path: '/profile', label: t.profile },
        { icon: Settings, path: '/settings', label: t.settings }
    ];

    return (
        <div className={styles.appContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo} onClick={() => navigate('/')}>
                    <span style={{ color: '#FF4757', fontWeight: 'bold', fontSize: '1.2rem' }}>TC</span>
                </div>

                <div className={styles.navGroup}>
                    {navItems.map((item) => (
                        <div
                            key={item.path}
                            className={`${styles.navIcon} ${location.pathname === item.path ? styles.active : ''}`}
                            onClick={() => navigate(item.path)}
                            title={item.label}
                        >
                            <item.icon size={26} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                        </div>
                    ))}
                </div>

                <div className={styles.sidebarFooter}>
                    {user ? (
                        <div className={styles.userSection} title={`Logged in as ${user.name}`}>
                            <div className={styles.userAvatar} onClick={() => navigate('/profile')}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.logoutBtn} onClick={handleLogout} title="Logout">
                                <Settings size={20} />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.navIcon} onClick={() => navigate('/login')} title="Login">
                            <User size={26} />
                        </div>
                    )}
                </div>
            </aside>
            <main className={styles.mainWrapper}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
