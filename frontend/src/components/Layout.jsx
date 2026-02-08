import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="app-container">
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
