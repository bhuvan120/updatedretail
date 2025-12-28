import React, { useState } from 'react';
import {
    User, Building, Lock, Bell, Palette, Boxes, CreditCard, Monitor,
    Save, LogOut, Upload, Plus, Trash2, Check, RefreshCw
} from 'lucide-react';

/* --- SUB-COMPONENTS --- */

const ProfileSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-6">
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md">
                    AD
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    <Upload size={14} />
                </button>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Admin User</h3>
                <p className="text-slate-500">Super Administrator</p>
                <p className="text-xs text-slate-400 mt-1">Bangalore, India</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input type="text" defaultValue="Admin User" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input type="email" defaultValue="admin@vajraretails.com" readOnly className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <input type="text" defaultValue="Super Admin" readOnly className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                <Save size={18} /> Save Changes
            </button>
        </div>
    </div>
);

const StoreSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Store Name</label>
                <input type="text" defaultValue="Vajra Retails" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Currency</label>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tax Percentage (%)</label>
                    <input type="number" defaultValue="18" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Business Address</label>
                <textarea rows="3" defaultValue="123, Tech Park Rd, Whitefield, Bangalore, Karnataka - 560066" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"></textarea>
            </div>
        </div>
        <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                <Save size={18} /> Save Store Settings
            </button>
        </div>
    </div>
);

const SecuritySettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
            <Lock className="text-orange-600 mt-1" size={20} />
            <div>
                <h4 className="font-semibold text-orange-900">Security Recommendation</h4>
                <p className="text-sm text-orange-700 mt-1">Enable Two-Factor Authentication (2FA) to add an extra layer of security to your account.</p>
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
            </div>
            <div className="flex justify-end">
                <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">Update Password</button>
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Active Sessions</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Monitor size={20} className="text-slate-500" />
                        <div>
                            <p className="font-medium text-slate-800">Windows PC - Chrome</p>
                            <p className="text-xs text-slate-500">Bangalore, India • Current Session</p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Monitor size={20} className="text-slate-400" />
                        <div>
                            <p className="font-medium text-slate-600">iPhone 14 - Safari</p>
                            <p className="text-xs text-slate-400">Bangalore, India • 2 hours ago</p>
                        </div>
                    </div>
                    <button className="text-xs text-rose-600 hover:text-rose-700 font-medium">Revoke</button>
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <button className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium text-sm">
                    <LogOut size={16} /> Log out from all devices
                </button>
            </div>
        </div>
    </div>
);

const NotificationSettings = () => (
    <div className="space-y-0 divide-y divide-slate-100 animate-in fade-in slide-in-from-right-4 duration-300">
        {[
            { title: "Email Notifications", desc: "Receive summary emails about store performance." },
            { title: "Order Alerts", desc: "Get notified immediately when a new order is placed." },
            { title: "Low Stock Alerts", desc: "Notification when product inventory dips below 10 items." },
            { title: "Return & Refund Alerts", desc: "Alerts for new return requests and processed refunds." },
        ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-4 first:pt-0">
                <div>
                    <h4 className="font-medium text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={idx !== 3} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        ))}
    </div>
);

const AppearanceSettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Theme Mode</h3>
            <div className="grid grid-cols-3 gap-4">
                {['Light', 'Dark', 'System'].map((mode) => (
                    <button key={mode} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'Light' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                        <div className={`w-8 h-8 rounded-full ${mode === 'Dark' ? 'bg-slate-800' : 'bg-white border border-slate-300'}`}></div>
                        <span className="font-medium text-sm">{mode}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Accent Color</h3>
            <div className="flex gap-4">
                {['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-orange-500'].map((color, idx) => (
                    <button key={idx} className={`w-10 h-10 rounded-full ${color} ring-2 ring-offset-2 ${idx === 0 ? 'ring-slate-400' : 'ring-transparent hover:ring-slate-300 transition-all'}`}></button>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Layout Density</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <p className="font-medium text-slate-800">Comfortable</p>
                    <p className="text-xs text-slate-500">More whitespace, easier to scan</p>
                </div>
                <div className="p-3 border-2 border-blue-600 bg-blue-50 rounded-lg cursor-pointer">
                    <p className="font-medium text-blue-800">Compact</p>
                    <p className="text-xs text-blue-600">Fit more content on screen</p>
                </div>
            </div>
        </div>
    </div>
);

const IntegrationsSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {[
            { name: 'Stripe Payments', icon: CreditCard, status: 'Connected', bg: 'bg-indigo-50', text: 'text-indigo-600' },
            { name: 'PayPal', icon: CreditCard, status: 'Connect', bg: 'bg-blue-50', text: 'text-blue-600' },
            { name: 'Razorpay', icon: CreditCard, status: 'Connect', bg: 'bg-sky-50', text: 'text-sky-600' },
            { name: 'Firebase Sync', icon: RefreshCw, status: 'Active', bg: 'bg-amber-50', text: 'text-amber-600' },
        ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center ${item.text}`}>
                        <item.icon size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">{item.name}</h4>
                        <p className="text-sm text-slate-500">Payment Gateway & Data Sync</p>
                    </div>
                </div>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.status === 'Connected' || item.status === 'Active' ? 'bg-green-100 text-green-700 cursor-default' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {item.status === 'Active' ? 'Active' : item.status === 'Connected' ? 'Connected' : 'Connect'}
                </button>
            </div>
        ))}
    </div>
);

const BillingSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-slate-400 text-sm mb-1">Current Plan</p>
                <h3 className="text-3xl font-bold mb-4">Pro Plan</h3>
                <p className="text-slate-300 mb-6">Next billing date: <span className="text-white font-medium">Jan 28, 2026</span></p>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-100">Upgrade Plan</button>
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium text-sm hover:bg-slate-600">Cancel Subscription</button>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard size={120} />
            </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h4 className="font-medium text-slate-800">Payment Methods</h4>
            </div>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">VISA</div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">Visa ending in 4242</p>
                        <p className="text-xs text-slate-500">Expiry 12/2028</p>
                    </div>
                </div>
                <button className="text-blue-600 text-sm hover:underline">Edit</button>
            </div>
        </div>
    </div>
);

const SystemPreferences = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Language</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Timezone</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option>(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                    <option>(GMT+00:00) London</option>
                    <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                </select>
            </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-xl">
                <div>
                    <h4 className="font-semibold text-rose-800">Reset System Settings</h4>
                    <p className="text-sm text-rose-600/80">This will revert all local preferences to default.</p>
                </div>
                <button className="px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 font-medium text-sm transition-colors">
                    Reset Defaults
                </button>
            </div>
        </div>
    </div>
);


/* --- MAIN COMPONENT --- */

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User, component: ProfileSettings },
        { id: 'store', label: 'Store Settings', icon: Building, component: StoreSettings },
        { id: 'security', label: 'Security', icon: Lock, component: SecuritySettings },
        { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
        { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
        { id: 'integrations', label: 'Integrations', icon: Boxes, component: IntegrationsSettings },
        { id: 'billing', label: 'Billing', icon: CreditCard, component: BillingSettings },
        { id: 'system', label: 'System Preferences', icon: Monitor, component: SystemPreferences },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ProfileSettings;

    return (
        <div className="min-h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your account, store, and system preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                        <nav className="flex flex-col p-2 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
                        <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            {/* Contextual actions could go here */}
                        </div>

                        <ActiveComponent />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
