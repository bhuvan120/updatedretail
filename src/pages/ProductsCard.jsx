import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import {
  Search,
  ShoppingBag,
  Filter,
  ArrowUpDown,
  Check,
  Plus,
  Tag,
  Layers,
  TrendingUp,
  MoreHorizontal,
  Box,
  Circle
} from 'lucide-react';

const Products = () => {
  const { products, loading } = useData();
  const { addToCart } = useCart();

  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [department, setDepartment] = useState("All");
  const [brand, setBrand] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");

  // UI State
  const [addedItems, setAddedItems] = useState({});

  // Memoized Derived Data to prevent expensive recalcs
  const { uniqueBrands, uniqueCategories, uniqueDepartments } = useMemo(() => {
    if (!products.length) return { uniqueBrands: [], uniqueCategories: [], uniqueDepartments: [] };

    // Using Sets for specific unique extraction
    const brands = new Set();
    const cats = new Set();
    const depts = new Set();

    products.forEach(p => {
      if (p.product_brand) brands.add(p.product_brand);
      if (p.product_category) cats.add(p.product_category);
      if (p.product_department) depts.add(p.product_department);
    });

    return {
      uniqueBrands: ['All', ...Array.from(brands).sort()],
      uniqueCategories: ['All', ...Array.from(cats).sort()],
      uniqueDepartments: ['All', ...Array.from(depts).sort()]
    };
  }, [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.product_brand.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || p.product_category === category;
      const matchesDept = department === "All" || p.product_department === department;
      const matchesBrand = brand === "All" || p.product_brand === brand;
      const matchesStatus = status === "All" || (status === 'Active' ? p.is_product_active : !p.is_product_active);

      return matchesSearch && matchesCategory && matchesDept && matchesBrand && matchesStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.selling_unit_price - b.selling_unit_price;
        case 'price-desc': return b.selling_unit_price - a.selling_unit_price;
        case 'margin-desc': return (b.product_margin_percent || 0) - (a.product_margin_percent || 0);
        case 'name-asc': return a.product_name.localeCompare(b.product_name);
        default: return 0;
      }
    }).slice(0, 500); // Limit to 500 for performance if dataset is huge, matching previous logic roughly
  }, [products, search, category, department, brand, status, sortBy]);


  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart({
      id: product.product_id,
      name: product.product_name,
      price: `$${product.selling_unit_price}`,
      image: "https://placehold.co/100?text=No+Img", // Fallback for cart
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="text-slate-500 text-sm font-medium">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/50">

      {/* Sticky Header with Search & Filters */}
      <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

          {/* Top Row: Title + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight hidden md:block">Products</h1>

            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products, brands, or SKUs..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
              <span>{filteredProducts.length} items</span>
            </div>
          </div>

          {/* Bottom Row: Filters (Scrollable on mobile) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <Filter size={16} className="text-slate-400 shrink-0" />

            {/* Category Filter */}
            <select
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {uniqueCategories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            {/* Brand Filter */}
            <select
              value={brand} onChange={(e) => setBrand(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {uniqueBrands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
            </select>

            {/* Status Filter */}
            <select
              value={status} onChange={(e) => setStatus(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="border-l border-slate-200 h-6 mx-1"></div>

            {/* Sort */}
            <select
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="margin-desc">Highest Margin</option>
              <option value="name-asc">Name: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.product_id}
                product={product}
                isAdded={addedItems[product.product_id]}
                onAdd={(e) => handleAddToCart(e, product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-slate-200 p-4 rounded-full mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); setBrand("All"); }}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

const ProductCard = ({ product, isAdded, onAdd }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full group relative overflow-hidden">

      {/* Top Bar showing Status */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Brand & Status */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-sm">
            {product.product_brand || 'Generic'}
          </span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${product.is_product_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${product.is_product_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
            {product.is_product_active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-800 leading-snug mb-2 line-clamp-2 min-h-[2.5rem]" title={product.product_name}>
          {product.product_name}
        </h3>

        {/* Metadata Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
            <Tag size={12} /> {product.product_category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md">
            <Layers size={12} /> {product.product_department}
          </span>
        </div>

        {/* Metrics Spacer */}
        <div className="mt-auto"></div>

        {/* Price & Margin Block */}
        <div className="flex items-end justify-between border-t border-slate-50 pt-4 mb-4">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-0.5">Price</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              ${product.selling_unit_price.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium mb-0.5 flex items-center justify-end gap-1">
              Margin <TrendingUp size={10} />
            </div>
            <div className={`text-sm font-semibold px-2 py-0.5 rounded-md ${(product.product_margin_percent || 0) > 0.4
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
              }`}>
              {((product.product_margin_percent || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            View Details
          </button>
          <button
            onClick={onAdd}
            disabled={isAdded}
            className={`col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md transform hover:-translate-y-0.5 active:scale-95 ${isAdded
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-200'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200 hover:shadow-lg'
              }`}
          >
            {isAdded ? <Check size={16} strokeWidth={3} /> : <ShoppingBag size={16} strokeWidth={2.5} />}
            {isAdded ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
