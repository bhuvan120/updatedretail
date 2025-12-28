import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import {
  Search,
  Filter
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

export default Products;
