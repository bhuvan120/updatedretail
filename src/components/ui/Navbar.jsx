import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag } from 'lucide-react';
import SearchInput from "./SearchInput";
import { useCart } from "../../context/CartContext";
import CartDrawer from "./CartDrawer";

const Navbar = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Consume Cart Context
  const { cartCount, toggleCart } = useCart();

  useEffect(() => {
    setIsAuth(localStorage.getItem("isAuthenticated") === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuth(false);
    navigate("/");
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/productscard" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-12">
              <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMenu}>
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  <ShoppingBag size={22} className="stroke-[2.5]" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors">
                  Vajra<span className="text-slate-500 font-medium">Retails</span>
                </span>
              </Link>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <SearchInput />
            </div>


            {/* Right Section: Links + Cart + Auth */}
            <div className="flex items-center gap-6">

              {/* Desktop Menu Links */}
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>

              <div className="flex items-center gap-3 pl-3 lg:border-l border-slate-200">

                {/* Cart Button */}
                <button
                  onClick={toggleCart}
                  className="relative p-2.5 hover:bg-slate-100 rounded-full transition-colors group"
                  aria-label="Open Cart"
                >
                  <ShoppingBag size={22} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white animate-in zoom-in duration-300">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Auth Buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  {!isAuth ? (
                    <>
                      <Link
                        to="/login"
                        className="text-slate-700 hover:text-blue-600 font-semibold text-sm px-4 py-2 transition-colors"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/signup"
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      Log Out
                    </button>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center md:hidden ml-2">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 absolute w-full shadow-xl animate-in slide-in-from-top-2">

            <div className="p-4 border-b border-slate-100">
              <SearchInput />
            </div>

            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-base font-medium ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="border-t border-slate-100 mt-4 pt-4 px-3 flex flex-col gap-3">
                {!isAuth ? (
                  <>
                    <Link to="/login" onClick={closeMenu} className="w-full text-center py-2.5 font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Log In</Link>
                    <Link to="/signup" onClick={closeMenu} className="w-full text-center py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">Sign Up</Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="w-full text-center py-2.5 bg-rose-50 text-rose-600 font-medium rounded-xl">Log Out</button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      <CartDrawer />
    </>
  );
};

export default Navbar;
