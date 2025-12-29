import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchInput from './SearchInput';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems: cart } = useCart(); // Destructure cartItems and alias to cart
  const navigate = useNavigate();
  const location = useLocation();

  // Local UI state
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOpenSearchMobile, setIsOpenSearchMobile] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const dropdownRef = useRef(null);

  // Calculate cart item count (Defensive check: cart || [])
  const cartCount = (cart || []).reduce((total, item) => total + (item.quantity || 1), 0);

  // Calculate cart item count (Defensive check: cart || [])
  const cartCount = (cart || []).reduce((total, item) => total + (item.quantity || 1), 0);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/productscard" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    // Pulse animation when cart count increases
    let prev = 0;
    const current = cartCount;
    if (current > prev) {
      setCartPulse(true);
      const t = setTimeout(() => setCartPulse(false), 900);
      return () => clearTimeout(t);
    }
    prev = current;
  }, [cartCount]);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 sticky top-0 z-50 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">

          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <span className="text-white font-bold text-xl tracking-tighter">VR</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight group-hover:opacity-90 transition-opacity hidden sm:block">
              Vajra Retails
            </span>
          </div>

          {/* Center: Search & Nav (Desktop) */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8 max-w-4xl">
            {/* Links */}
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
                      : 'text-blue-50 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Large Search Bar */}
            <div className="flex-1 max-w-md relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                className="block w-full pl-10 pr-4 py-2.5 rounded-full border-0 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-white/50 focus:outline-none shadow-sm transition-shadow group-hover:shadow-md"
              />
            </div>
          </div>

          {/* Right: Cart & Auth */}
          <div className="flex items-center gap-4">
            {/* Mobile Search Toggle (Visible only on small screens) */}
            <button
              onClick={() => setIsOpenSearchMobile(s => !s)}
              aria-expanded={isOpenSearchMobile}
              className="lg:hidden p-2 text-white/80 hover:text-white"
              title="Search"
            >
              <Search className="h-6 w-6" />
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className={`relative p-2 text-blue-50 hover:text-white transition-colors group ${cartPulse ? 'cart-pulse' : ''}`}
              aria-label={`View cart, ${cartCount} item(s)`}
            >
              <ShoppingBag className="h-6 w-6 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-blue-600 transform translate-x-1/4 -translate-y-1/4 bg-white rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Buttons (Desktop) */}
            <div className="hidden md:flex items-center gap-3 relative" ref={dropdownRef}>
              {!user ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium text-white hover:text-blue-100 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-5 py-2 rounded-full bg-white text-blue-600 text-sm font-bold shadow-md hover:bg-blue-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDropdown(s => !s)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                    title="Account"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">{(user.displayName || 'U').slice(0,1)}</div>
                    <div className="text-left hidden xl:block">
                      <div className="text-xs text-blue-200">Welcome,</div>
                      <div className="text-sm font-medium text-white leading-none">{user.displayName || 'User'}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white hidden xl:block" />
                  </button>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="dropdown-menu absolute right-0 mt-3 w-44 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-slide z-50">
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { navigate('/profile'); setShowDropdown(false); }}>Profile</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { navigate('/orders'); setShowDropdown(false); }}>Orders</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50" onClick={() => { logout(); setShowDropdown(false); }}>Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-white/10 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Input (collapsible) */}
      {isOpenSearchMobile && (
        <div className="md:hidden px-4 pb-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600">
          <div className="mt-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-white/80" />
              </div>
              <input
                aria-label="Search products"
                type="text"
                placeholder="Search products, brands, categories..."
                className="block w-full pl-10 pr-4 py-2.5 rounded-full border-0 bg-white/10 text-white placeholder-white/80 focus:ring-2 focus:ring-white/40 focus:outline-none transition-shadow"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-800 border-t border-indigo-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive
                    ? 'bg-indigo-900 text-white'
                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-4 pt-4 border-t border-indigo-700 flex flex-col gap-2 p-2">
                <button onClick={() => { navigate('/login'); setIsOpen(false) }} className="w-full text-center py-2 text-white font-medium hover:bg-indigo-700 rounded-md">Log In</button>
                <button onClick={() => { navigate('/signup'); setIsOpen(false) }} className="w-full text-center py-2 bg-white text-indigo-600 font-bold rounded-md">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
