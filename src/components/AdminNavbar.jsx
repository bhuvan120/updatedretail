import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, LogOut, ChevronDown } from 'lucide-react';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        // Clear auth data logic here if needed
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm h-16 px-8 flex items-center justify-between">
            {/* Left: Logo & Back */}
            <div className="flex items-center gap-8">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Vajra Retails
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200 group border border-slate-200"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                </button>
            </div>

            {/* Right: Admin Profile */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        AD
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-semibold text-slate-700 leading-none">Admin</span>
                        <span className="text-xs text-slate-500">Super User</span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-50">
                            <p className="text-sm font-medium text-slate-900">Admin User</p>
                            <p className="text-xs text-slate-500 truncate">admin@vajraretails.com</p>
                        </div>

                        <div className="py-1">
                            <button onClick={() => navigate('/admin/settings')} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-left">
                                <User size={16} />
                                Profile
                            </button>
                            <button onClick={() => navigate('/admin/settings')} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-left">
                                <Settings size={16} />
                                Settings
                            </button>
                        </div>

                        <div className="border-t border-slate-50 py-1">
                            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default AdminNavbar;
