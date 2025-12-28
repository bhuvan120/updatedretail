import React, { useMemo, useContext, useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  CreditCard,
  Clock,
  Package,
  CheckCircle,
  AlertCircle,
  Search,
  MapPin,
  Truck,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronRight,
  TrendingUp,
  Edit2,
  Save,
  X,
  ArrowLeft,
  Menu
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, subMonths, isSameMonth } from 'date-fns';

const UserDashboard = () => {
  const { orders, customers, loading } = useData();
  const { user: authUser } = useContext(AuthContext);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const navigate = useNavigate();

  // Logic to find the current customer data
  const currentUserId = useMemo(() => {
    if (authUser?.email) {
      const found = customers.find(c => c.email === authUser.email);
      if (found) return found.customer_id;
    }
    return 457; // Demo User ID
  }, [authUser, customers]);

  const dashboardData = useMemo(() => {
    if (loading) return null;

    // Find User Profile
    const userProfile = customers.find(c => c.customer_id === currentUserId) || {
      first_name: authUser?.displayName?.split(' ')[0] || "Guest",
      last_name: authUser?.displayName?.split(' ')[1] || "User",
      customer_full_name: authUser?.displayName || "Guest User",
      email: authUser?.email,
      customer_city: "Bangalore",
      customer_state: "KA",
      isGuest: true // Flag to indicate missing profile
    };

    // Filter User Orders
    const userOrders = orders
      .filter(o => o.customer_id === currentUserId)
      .sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

    // Calculate KPI Stats
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const activeOrders = userOrders.filter(o =>
      ['pending', 'processing', 'shipped'].includes(o.order_status?.toLowerCase())
    ).length;

    // Chart Data (Last 6 Months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return {
        date: format(d, 'MMM yyyy'),
        fullDate: d,
        spend: 0,
        orders: 0
      };
    });

    userOrders.forEach(order => {
      const orderDate = new Date(order.order_date);
      const monthData = last6Months.find(m => isSameMonth(m.fullDate, orderDate));
      if (monthData) {
        monthData.spend += order.total_amount || 0;
        monthData.orders += 1;
      }
    });

    return {
      user: userProfile,
      orders: userOrders,
      stats: { totalOrders, totalSpent, activeOrders },
      chartData: last6Months
    };
  }, [orders, customers, loading, currentUserId, authUser]);

  if (loading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  const { user, orders: userOrders, stats, chartData } = dashboardData;

  // Render Inner Content (Dashboard Stats or Profile Form)
  const renderContent = () => {
    if (showProfileForm) {
      return (
        <div className="max-w-3xl mx-auto pt-8 animate-in fade-in duration-300">
          <button
            onClick={() => setShowProfileForm(false)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
          >
            <X size={20} /> Cancel and go back
          </button>
          <ProfileForm user={user} onCancel={() => setShowProfileForm(false)} />
        </div>
      )
    }

    return (
      <div className="space-y-8 py-8 animate-in fade-in duration-500">

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user.first_name} 👋
            </h1>
            <p className="text-slate-500">Here's what's happening with your account today.</p>
          </div>

          <div className="flex items-center gap-3">
            {!showProfileForm && (
              <button
                onClick={() => setShowProfileForm(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
            <button className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100 relative">
              <ShoppingBag size={20} />
              {stats.activeOrders > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-50"></span>}
            </button>
          </div>
        </div>


        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="indigo" subtext="Lifetime orders" />
          <KPICard title="Total Spent" value={`$${stats.totalSpent.toLocaleString()}`} icon={CreditCard} color="emerald" subtext="Across all orders" />
          <KPICard title="Active Orders" value={stats.activeOrders} icon={Truck} color="amber" subtext="In progress" highlight={stats.activeOrders > 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content: Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" /> Recent Orders
                </h3>
                {userOrders.length > 0 && <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">View All History</button>}
              </div>

              {userOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-xs border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {userOrders.slice(0, 5).map(order => (
                        <tr key={order.order_id} className="group hover:bg-slate-50/80 transition-colors cursor-pointer">
                          <td className="px-6 py-4 font-medium text-slate-900">#{order.order_id}</td>
                          <td className="px-6 py-4 text-slate-500">{format(new Date(order.order_date), 'MMM dd, yyyy')}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">${order.total_amount?.toFixed(2)}</td>
                          <td className="px-6 py-4"><StatusBadge status={order.order_status} /></td>
                          <td className="px-6 py-4 text-right">
                            <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyOrdersState navigate={navigate} /> // Pass navigate to empty state
              )}
            </div>

            {/* User Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ActionCard icon={Search} label="Browse Products" color="blue" onClick={() => navigate('/productscard')} />
              <ActionCard icon={MapPin} label="Addresses" color="purple" />
              <ActionCard icon={CreditCard} label="Payment Methods" color="indigo" />
              <ActionCard icon={Settings} label="Account Settings" color="slate" onClick={() => setShowProfileForm(true)} />
            </div>
          </div>

          {/* Side Panel: Spending Chart */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={18} className="text-slate-400" /> Spending Activity
                </h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value}`, 'Spent']}
                    />
                    <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                <span className="text-slate-500">Avg. monthly spend</span>
                <span className="font-bold text-slate-900">${(stats.totalSpent / (chartData.filter(d => d.spend > 0).length || 1)).toFixed(0)}</span>
              </div>
            </div>

            {/* Promo / Info Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg transform transition-transform hover:scale-[1.02]">
              <h4 className="font-bold text-lg mb-2">Get 10% Off!</h4>
              <p className="text-indigo-100 text-sm mb-4">Refer a friend and earn rewards on your next purchase.</p>
              <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors w-full">Refer Now</button>
            </div>
          </div>

        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50">

      {/* --- NEW SECONDARY DASHBOARD NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* Left: Back to Home */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                <ArrowLeft size={16} />
              </div>
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            {/* Divider for desktop */}
            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Dashboard Title */}
            <h1 className="text-lg font-bold text-slate-800 hidden sm:block">User Dashboard</h1>
          </div>

          {/* Right: User Profile Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-2 hidden md:block">
              <span className="text-sm font-bold text-slate-700 leading-none">{user.first_name} {user.last_name}</span>
              <span className="text-xs text-slate-500 mt-0.5">Member</span>
            </div>

            <DashboardProfileMenu user={user} navigate={navigate} /> {/** Extracted component for dropdown logic */}
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>

    </div>
  );
};

/* --- SUB COMPONENTS --- */

const DashboardProfileMenu = ({ user, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white cursor-pointer hover:ring-blue-100 transition-all">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-200 transform origin-top-right">
          <div className="px-4 py-3 border-b border-slate-50 md:hidden">
            <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
          >
            <UserIcon size={16} /> My Profile
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
          >
            <Settings size={16} /> Settings
          </button>
          <div className="border-t border-slate-50 my-1"></div>
          <button
            onClick={() => {
              // Add logout logic here
              navigate('/login');
            }}
            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

const ProfileForm = ({ user, onCancel }) => {
  // Local state for form fields, pre-filled with user data if available
  const [formData, setFormData] = useState({
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.email || '',
    phone: user.customer_phone || '',
    address: user.customer_address || '',
    city: user.customer_city || '',
    state: user.customer_state || '',
    zip: user.customer_zip_code || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically call an API to update the profile
    console.log("Saving Profile Data:", formData);
    alert("Profile update simulation: Data saved!");
    onCancel(); // Go back to dashboard on success
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">
          {user.isGuest ? 'Create Your Profile' : 'Edit Profile'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">Update your personal details and shipping information.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" readOnly className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Shipping Address</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Street Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">City</label>
                <input name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">State</label>
                <input name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ZIP Code</label>
                <input name="zip" value={formData.zip} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
            <Save size={18} /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

/* --- Helper Components --- */

const KPICard = ({ title, value, icon: Icon, color, subtext, highlight }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border ${highlight ? 'border-amber-200 ring-4 ring-amber-50' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {highlight && <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-slate-500 font-medium text-sm flex items-center justify-between">
          {title}
          <span className="text-xs font-normal text-slate-400">{subtext}</span>
        </p>
      </div>
    </div>
  );
};

const ActionCard = ({ icon: Icon, label, color, onClick }) => {
  const colors = {
    blue: 'hover:border-blue-200 hover:bg-blue-50/50',
    purple: 'hover:border-purple-200 hover:bg-purple-50/50',
    indigo: 'hover:border-indigo-200 hover:bg-indigo-50/50',
    slate: 'hover:border-slate-300 hover:bg-slate-50',
  };

  return (
    <button onClick={onClick} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 transition-all group ${colors[color]}`}>
      <Icon size={24} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
      <span className="font-semibold text-slate-600 group-hover:text-slate-900 text-sm">{label}</span>
    </button>
  )
}

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (['delivered', 'completed'].includes(s))
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle size={12} /> Delivered</span>;
  if (['pending', 'processing'].includes(s))
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100"><Clock size={12} /> Processing</span>;
  if (['shipped'].includes(s))
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100"><Truck size={12} /> Shipped</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200"><Package size={12} /> {status}</span>;
}

const EmptyOrdersState = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <Package size={32} className="text-slate-300" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h3>
    <p className="text-slate-500 text-sm max-w-xs mb-6">Looks like you haven't placed any orders yet. Start exploring our products!</p>
    <button onClick={() => navigate('/productscard')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Start Shopping</button>
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-8 space-y-8">
    <div className="h-16 bg-slate-200 rounded-xl animate-pulse w-full max-w-7xl mx-auto"></div>
    <div className="h-20 bg-slate-200 rounded-xl animate-pulse w-full max-w-7xl mx-auto"></div>
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>)}
    </div>
    <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
      <div className="col-span-2 h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
      <div className="col-span-1 h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
    </div>
  </div>
);

export default UserDashboard;
