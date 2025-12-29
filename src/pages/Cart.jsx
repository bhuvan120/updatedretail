import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    ShoppingBag,
    ShieldCheck,
    CreditCard
} from 'lucide-react';

const Cart = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal,
        clearCart
    } = useCart();

    const navigate = useNavigate();

    // Calculate tax/shipping (mock logic)
    const shipping = cartTotal > 50 ? 0 : 5.99;
    const tax = cartTotal * 0.08;
    const finalTotal = cartTotal + shipping + tax;

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                    <ShoppingBag size={48} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8 text-center max-w-sm">
                    Looks like you haven't added anything to your cart yet.
                    Explore our products to find something you love!
                </p>
                <button
                    onClick={() => navigate('/productscard')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#F9F7F2] min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center gap-2 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Shopping Cart ({cartItems.length})</h1>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12">

                    {/* Cart Items List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {/* Image */}
                                        <div className="w-full sm:w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img
                                                src={item.image || "https://placehold.co/100?text=No+Img"}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                                                        <p className="text-sm text-slate-500 font-medium">{item.brand}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg text-slate-900">{item.price}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Control */}
                                                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-white hover:text-blue-600 transition-colors rounded-l-lg"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-white hover:text-blue-600 transition-colors rounded-r-lg"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                {/* Actions */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-slate-400 hover:text-rose-500 text-sm font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 size={16} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Actions */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <button onClick={clearCart} className="text-rose-600 text-sm font-bold hover:underline">
                                    Clear Cart
                                </button>
                                <button onClick={() => navigate('/productscard')} className="text-blue-600 text-sm font-bold hover:underline">
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-900">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping Estimate</span>
                                    <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax Estimate (8%)</span>
                                    <span className="font-medium text-slate-900">${tax.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-slate-100 pt-4 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-base font-bold text-slate-900">Order Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-slate-900">${finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-8 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                                Checkout <CreditCard size={20} />
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck size={14} />
                                <span>Secure Checkout & Encryption</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;
