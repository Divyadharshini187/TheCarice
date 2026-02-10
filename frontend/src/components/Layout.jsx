import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Utensils, User, Settings } from 'lucide-react';
import styles from './Layout.module.css';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, path: '/', label: 'Home' },
        { icon: Store, path: '/merchant', label: 'Merchant' },
        { icon: Utensils, path: '/add-items', label: 'Add Items' },
        { icon: User, path: '/profile', label: 'Profile' },
        { icon: Settings, path: '/settings', label: 'Settings' }
    ];

    return (
        <div className={styles.appContainer}>
            <aside className={styles.sidebar}>
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
            </aside>
            <main className={styles.mainWrapper}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
