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
  Sparkles,
  Users,
  Star,
  User
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
  {
    name: "Accessories",
    icon: Watch,
    image: "https://img.freepik.com/premium-photo/essentials-fashion-apparel-footwear-accessories_818261-13345.jpg?w=2000", // <- put your URL here
    gradient: "from-blue-50 to-indigo-50",
    iconColor: "text-blue-600"
  },
  {
    name: "Apparel",
    icon: Shirt,
    image: "https://i.pinimg.com/736x/a1/42/b5/a142b5b7a06b7bfa74fe43794cebe12c.jpg",
    gradient: "from-purple-50 to-pink-50",
    iconColor: "text-purple-600"
  },
  {
    name: "Footwear",
    icon: Footprints,
    image: "https://i.pinimg.com/1200x/98/d1/9b/98d19b753c86339f1225fde95694a04a.jpg",
    gradient: "from-emerald-50 to-teal-50",
    iconColor: "text-emerald-600"
  },
  {
    name: "Essentials",
    icon: ShoppingBag,
    image: "https://i.pinimg.com/1200x/cb/0c/2e/cb0c2e226c35da8ec459bb9e8c078aca.jpg",
    gradient: "from-amber-50 to-orange-50",
    iconColor: "text-amber-600"
  }
];
  return (
    <div className="bg-pink-200 min-h-screen font-sans">

      {/* HERO SECTION */}
      <section className="relative h-[650px] overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.pinimg.com/1200x/ce/fa/bb/cefabbcebea8d7e10f383ba5fd81ec98.jpg"
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
                  {cat.image && (
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-30" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/30"></div>
                  </div>
                )}

                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity relative z-10">
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

      {/* WRAPPED SECTIONS - subtle textured background */}
      <div className="relative overflow-hidden">
        {/* Subtle textured background image (low opacity) */}
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover opacity-10 pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=60')" }}
        />

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

      {/* BRAND STORY */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">About Our Brand</h2>
          <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We are a modern retail brand focused on quality products, affordability, and customer satisfaction. Trusted by thousands of customers, we craft a shopping experience that delivers value, style, and peace of mind.
          </p>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900">Why Choose Us</h3>
            <p className="text-slate-500">Shop with confidence — here’s why customers trust us</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-sm flex flex-col items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Star size={24} />
              </div>
              <h4 className="font-semibold text-slate-900">Premium Quality Products</h4>
              <p className="text-sm text-slate-500">Carefully curated selection with strict quality standards.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm flex flex-col items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-semibold text-slate-900">Secure Payments</h4>
              <p className="text-sm text-slate-500">Safe & encrypted checkout for every purchase.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm flex flex-col items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                <Truck size={24} />
              </div>
              <h4 className="font-semibold text-slate-900">Fast & Reliable Delivery</h4>
              <p className="text-sm text-slate-500">Timely shipments with careful handling.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm flex flex-col items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <RotateCcw size={24} />
              </div>
              <h4 className="font-semibold text-slate-900">Easy Returns & Support</h4>
              <p className="text-sm text-slate-500">Hassle-free returns and friendly customer service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS / TRUST */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <Users size={20} />
              </div>
              <div className="text-2xl font-bold text-slate-900">10,000+</div>
              <div className="text-sm text-slate-500">Happy Customers</div>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <ShoppingBag size={20} />
              </div>
              <div className="text-2xl font-bold text-slate-900">1,000+</div>
              <div className="text-sm text-slate-500">Products</div>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-3">
                <Truck size={20} />
              </div>
              <div className="text-2xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-500">Orders Delivered Monthly</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900">What Our Customers Say</h3>
            <p className="text-slate-500">Real feedback from happy shoppers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Asha R.</div>
                  <div className="text-sm text-slate-500">Verified Buyer</div>
                </div>
              </div>
              <p className="text-slate-600">"Great product quality and fast delivery — exceeded my expectations."</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Rahul M.</div>
                  <div className="text-sm text-slate-500">Verified Buyer</div>
                </div>
              </div>
              <p className="text-slate-600">"Excellent customer service and easy returns — very satisfied."</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Priya S.</div>
                  <div className="text-sm text-slate-500">Verified Buyer</div>
                </div>
              </div>
              <p className="text-slate-600">"Affordable prices without compromising on quality."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-bold">Start shopping with confidence today</h3>
            <p className="text-slate-200 mt-2">Discover quality, value, and support with every purchase.</p>
          </div>
          <div>
            <button
              onClick={() => navigate('/productscard')}
              className="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>
      </div>

    </div>
  );
};

export default Home;
