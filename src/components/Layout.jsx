import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import GlobalFilters from './GlobalFilters';

import AdminNavbar from './AdminNavbar';

const Layout = ({ children }) => {
    const location = useLocation();
    const isSettingsPage = location.pathname === '/admin/settings';

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-900 relative">
            {/* Sidebar Component - Fixed Position */}
            <Sidebar />

            {/* Main Content Area - Margined to accommodate Sidebar */}
            <main className="flex-1 ml-64 min-h-screen transition-all duration-300 flex flex-col">
                {/* Top Navigation Bar */}
                <AdminNavbar />

                <div className="p-8 max-w-7xl mx-auto space-y-8 w-full">
                    {/* Global Filters Section */}
                    {!isSettingsPage && (
                        <div className="fade-in">
                            <GlobalFilters />
                        </div>
                    )}

                    {/* Page Content */}
                    <div className="fade-in delay-100">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
