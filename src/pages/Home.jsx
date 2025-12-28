import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import {
  ArrowRight,
  Watch,
  Shirt,
  Footprints,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const Home = () => {
  const { products } = useData();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // State for added items in Featured section
  const [addedItems, setAddedItems] = useState({});

  // Get 4 random featured products
  const featuredProducts = products.length > 0 ? products.slice(0, 4) : [];

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart({
      id: product.product_id,
      name: product.product_name,
      price: `$${product.selling_unit_price}`,
      image: "https://placehold.co/100?text=No+Img",
      brand: product.product_brand
    });

    setAddedItems(prev => ({ ...prev, [product.product_id]: true }));
    setTimeout(() => {
      setAddedItems(prev => {
        const next = { ...prev };
        delete next[product.product_id];
        return next;
      });
    }, 2000);
  };

  const categories = [
    { name: "Accessories", icon: Watch, gradient: "from-blue-50 to-indigo-50", iconColor: "text-blue-600" },
    { name: "Apparel", icon: Shirt, gradient: "from-purple-50 to-pink-50", iconColor: "text-purple-600" },
    { name: "Footwear", icon: Footprints, gradient: "from-emerald-50 to-teal-50", iconColor: "text-emerald-600" },
    { name: "Essentials", icon: ShoppingBag, gradient: "from-amber-50 to-orange-50", iconColor: "text-amber-600" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* HERO SECTION */}
      <section className="relative h-[650px] overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.pinimg.com/736x/6d/63/36/6d6336b9272628212eae8f73ae1546a9.jpg"
            alt="Shopping Background"
            className="w-full h-full object-cover animate-pan-slow" // Assume 'animate-pan-slow' might be a custom class or just placeholder for subtle zoom
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl space-y-8 animate-fade-in-up">
            <div>
              {/* <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold mb-4 backdrop-blur-sm">
                ✨ New Season Arrivals
              </span> */}
              <h1 className="text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg">
                Vajra Retails
              </h1>
              <p className="text-2xl text-slate-200 mt-2 font-light tracking-wide">
                Smart Shopping. <span className="font-semibold text-white">Better Living.</span>
              </p>
            </div>

            <p className="text-lg text-slate-300 max-w-lg leading-relaxed border-l-2 border-blue-500 pl-4">
              Explore our premium collection of curated fashion, tech, and lifestyle essentials designed for the modern you.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate('/productscard')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-900/50 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                Shop Now <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/productscard')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
              >
                Explore Categories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Shop by Category</h2>
            <p className="text-slate-500">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/productscard')}
                className={`group cursor-pointer relative p-8 rounded-3xl bg-gradient-to-br ${cat.gradient} border border-white shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-6 text-center overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <cat.icon size={120} />
                </div>

                <div className={`p-5 rounded-full bg-white shadow-sm ${cat.iconColor} group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <cat.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors relative z-10">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-500 text-sm font-bold uppercase tracking-wider mb-1">
                <Sparkles size={16} /> Trending
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Featured Products
              </h2>
            </div>
            <button
              onClick={() => navigate('/productscard')}
              className="hidden sm:flex text-blue-600 font-bold hover:text-blue-700 items-center gap-2 group transition-colors"
            >
              View All Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  isAdded={addedItems[product.product_id]}
                  onAdd={(e) => handleAddToCart(e, product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <div className="animate-pulse">Loading best sellers...</div>
            </div>
          )}
          <button
            onClick={() => navigate('/productscard')}
            className="mt-8 w-full sm:hidden py-3 border border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            View All Products
          </button>
        </div>
      </section>

      {/* VALUE PROPOSITION STRIP */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="p-3 bg-blue-500 rounded-lg text-white">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Fast Delivery</h3>
                <p className="text-slate-400 text-sm">Shipment within 24 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="p-3 bg-purple-500 rounded-lg text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Secure Payment</h3>
                <p className="text-slate-400 text-sm">100% encrypted transactions</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="p-3 bg-emerald-500 rounded-lg text-white">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Easy Returns</h3>
                <p className="text-slate-400 text-sm">30-day money back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
