import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useFilters } from '../context/FilterContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, BarChart, Bar
} from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const SalesAnalytics = () => {
    // We access RAW data + DB. We do NOT use useFilteredData hook for Full DB mode as it is in-memory only.
    const { orders: smallOrders, orderItems: smallItems, products: smallProducts, returns, loading, dataStatus, db } = useData();
    const { filters } = useFilters();

    const [analytics, setAnalytics] = useState({
        trendData: [],
        categoryData: [],
        brandData: [],
        deptData: []
    });
    const [isCalculating, setIsCalculating] = useState(false);
    const [progress, setProgress] = useState(0);

    // --- Calculation Logic ---
    useEffect(() => {
        if (loading && dataStatus === 'loading_small') return;

        let isMounted = true;
        setIsCalculating(true);
        setProgress(0);

        const runAnalysis = async () => {
            try {
                const useDB = dataStatus === 'fully_synced';
                // console.log(`Sales Analytics: Mode ${useDB ? 'DB' : 'Preview'}`);

                // Data Structures
                const trendsMap = new Map(); // "YYYY-MM-DD" -> { Revenue, Cost, Profit }
                const catMap = {};
                const brandMap = {};
                const deptMap = {};

                const processItem = (item, product, orderDate) => {
                    if (!product || !orderDate) return;

                    const amt = (item.total_amount || 0);

                    // Estimate cost if missing
                    let quantity = 1;
                    if (product.selling_unit_price > 0) {
                        quantity = Math.round(amt / product.selling_unit_price) || 1;
                    }
                    const cost = (product.cost_unit_price || 0) * quantity;
                    const profit = amt - cost;

                    // 1. Trends (By Date)
                    const dateKey = orderDate; // YYYY-MM-DD
                    if (!trendsMap.has(dateKey)) {
                        trendsMap.set(dateKey, { Revenue: 0, Cost: 0, Profit: 0 });
                    }
                    const t = trendsMap.get(dateKey);
                    t.Revenue += amt;
                    t.Cost += cost;
                    t.Profit += profit;

                    // 2. Breakdowns
                    catMap[product.product_category || 'Unknown'] = (catMap[product.product_category || 'Unknown'] || 0) + amt;
                    brandMap[product.product_brand || 'Unknown'] = (brandMap[product.product_brand || 'Unknown'] || 0) + amt;
                    deptMap[product.product_department || 'Unknown'] = (deptMap[product.product_department || 'Unknown'] || 0) + amt;
                };

                if (useDB) {
                    // --- DB MODE ---
                    // 1. Fetch Products Map (Fast)
                    const productMap = new Map();
                    await db.products.each(p => productMap.set(p.product_id, p));

                    // 2. Fetch Orders Map (Filtered by Date)
                    // We need to apply 'filters.startDate' and 'filters.endDate' if present.
                    // Also 'filters.category/brand/dept' -> These filter the ITEMS/PRODUCTS, not necessarily the order itself, 
                    // but in dashboard context, if you filter 'Nike', you want sales of Nike items.

                    // Step A: Load relevant orders (for Date Range)
                    const orderDateMap = new Map();
                    const ordersTable = db.orders;
                    let orderCollection;

                    if (filters.startDate || filters.endDate) {
                        const start = filters.startDate || '0000-00-00';
                        const end = filters.endDate || '9999-99-99';
                        orderCollection = ordersTable.where('order_date').between(start, end, true, true);
                    } else {
                        orderCollection = ordersTable.toCollection();
                    }

                    await orderCollection.each(o => {
                        if (o.order_status === 'Cancelled') return;
                        orderDateMap.set(o.order_id, o.order_date);
                    });

                    // Step B: Iterate Items
                    let processed = 0;
                    const totalItemsApprox = await db.orderItems.count();

                    await db.orderItems.each(item => {
                        // Check Order Filter
                        const oDate = orderDateMap.get(item.order_id);
                        if (!oDate) return; // Order not in date range (or cancelled)

                        // Check Product Filter
                        // We must fetch product to check category/brand filters
                        const prod = productMap.get(item.product_id);
                        if (!prod) return;

                        // Apply Filters from Context
                        if (filters.category !== 'All' && prod.product_category !== filters.category) return;
                        if (filters.department !== 'All' && prod.product_department !== filters.department) return;
                        if (filters.brand !== 'All' && prod.product_brand !== filters.brand) return;

                        processItem(item, prod, oDate);

                        processed++;
                        if (processed % 5000 === 0) setProgress(Math.round((processed / totalItemsApprox) * 100));
                    });

                } else {
                    // --- PREVIEW MODE ---
                    // Build Maps
                    const productMap = new Map();
                    smallProducts.forEach(p => productMap.set(p.product_id, p));

                    const orderDateMap = new Map();
                    smallOrders.forEach(o => {
                        if (o.order_status === 'Cancelled') return;
                        if (filters.startDate && o.order_date < filters.startDate) return;
                        if (filters.endDate && o.order_date > filters.endDate) return;
                        orderDateMap.set(o.order_id, o.order_date);
                    });

                    smallItems.forEach((item, idx) => {
                        const oDate = orderDateMap.get(item.order_id);
                        if (!oDate) return;

                        const prod = productMap.get(item.product_id);
                        if (!prod) return;

                        if (filters.category !== 'All' && prod.product_category !== filters.category) return;
                        if (filters.department !== 'All' && prod.product_department !== filters.department) return;
                        if (filters.brand !== 'All' && prod.product_brand !== filters.brand) return;

                        processItem(item, prod, oDate);
                        if (idx % 500 === 0) setProgress(Math.round((idx / smallItems.length) * 100));
                    });
                }

                if (!isMounted) return;

                // Transform to Charts
                const trendData = Array.from(trendsMap.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([date, vals]) => ({
                        name: date,
                        displayDate: format(parseISO(date), 'MMM dd'),
                        ...vals
                    }));

                const toArray = (m) => Object.entries(m)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);

                setAnalytics({
                    trendData,
                    categoryData: toArray(catMap),
                    brandData: toArray(brandMap).slice(0, 10),
                    deptData: toArray(deptMap)
                });
                setIsCalculating(false);

            } catch (err) {
                console.error("Sales Analytics Error:", err);
                if (isMounted) setIsCalculating(false);
            }
        };

        const t = setTimeout(runAnalysis, 100);
        return () => {
            isMounted = false;
            clearTimeout(t);
        };

    }, [smallOrders, smallItems, smallProducts, loading, dataStatus, db, filters]);


    const handleDownload = () => {
        const headers = ['Date,Revenue,Cost,Profit\n'];
        const rows = analytics.trendData.map(d => `${d.name},${d.Revenue},${d.Cost},${d.Profit}`);
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_analytics.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Sales & Revenue Analytics</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500">Deep dive into revenue, cost, and profit margins over time.</p>
                        {isCalculating && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">Updating... {progress}%</span>}
                        {dataStatus === 'fully_synced' && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Full Data Mode</span>}
                    </div>
                </div>
                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                    <Download size={16} /> Export CSV
                </button>
            </header>

            {/* Profit vs Cost Area Chart */}
            <div className={`bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-opacity duration-300 ${isCalculating ? 'opacity-70' : 'opacity-100'}`}>
                <h3 className="text-lg font-bold text-slate-800 mb-6">Profit vs Cost Over Time</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="displayDate" />
                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Legend />
                            <Area type="monotone" dataKey="Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
                            <Area type="monotone" dataKey="Cost" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Revenue Trend */}
            <div className={`bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-opacity duration-300 ${isCalculating ? 'opacity-70' : 'opacity-100'}`}>
                <h3 className="text-lg font-bold text-slate-800 mb-6">Daily Revenue Trend</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="displayDate" />
                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Breakdown Charts */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isCalculating ? 'opacity-70' : 'opacity-100'}`}>
                {/* By Category */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Revenue by Category</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.categoryData}>
                                <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* By Brand */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Revenue by Brand (Top 10)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.brandData} layout="vertical">
                                <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* By Dept */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Revenue by Dept</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.deptData}>
                                <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                <XAxis dataKey="name" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;
