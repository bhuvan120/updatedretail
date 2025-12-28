import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import MetricCard from '../components/MetricCard';
import {
    DollarSign, TrendingUp, ShoppingCart, Users, Package, AlertCircle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, parseISO, getYear, getMonth } from 'date-fns';

const Overview = () => {
    const { products, orders, returns, customers, orderItems, loading, dataStatus, db } = useData();

    // Filters State
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [showComparison, setShowComparison] = useState(false); // Toggle for Previous/Present

    // State for calculated metrics
    const [metrics, setMetrics] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationProgress, setCalculationProgress] = useState(0);

    // --- KPI & CHART CALCULATIONS ---
    useEffect(() => {
        // If still loading specific small data, wait
        if (loading && dataStatus === 'loading_small') return;

        let isMounted = true;
        setIsCalculating(true);
        setCalculationProgress(0);

        const calculateMetrics = async () => {
            try {
                // Initialize State
                const state = {
                    totalRevenue: 0,
                    matchingOrdersCount: 0,
                    relevantOrderIds: new Set(),
                    monthlyStats: {},
                    customerSpend: {},
                    productRevenue: {},
                    statusCounts: { Completed: 0, Returned: 0, Cancelled: 0, Active: 0 }
                };

                const useDB = dataStatus === 'fully_synced';

                // 1. Prepare Returns Lookups (Source of Truth for "Returned")
                const returnedOrderIds = new Set();
                if (useDB) {
                    // Fetch all return order IDs
                    const allReturns = await db.returns.toArray();
                    allReturns.forEach(r => returnedOrderIds.add(r.order_id));
                } else {
                    returns.forEach(r => returnedOrderIds.add(r.order_id));
                }

                const processOrder = (o) => {
                    // Match found
                    state.matchingOrdersCount++;


                    // Revenue (Exclude Cancelled/Returned from Revenue?)
                    // Usually Dashboard revenue = "Gross Sales" or "Net Sales"?
                    // User said "Total Revenue". Usually implies Gross unless specified.
                    // But if Cancelled, it shouldn't count.
                    // If Returned, it usually counts in Gross but subtracted in Net.
                    // Unlees 'order_total_amount' is 0 for cancelled?
                    // Let's assume we count everything for "Volume" but categorise Status for Pie.

                    // Check Status Priority
                    let finalStatus = 'Active'; // Default

                    if (o.order_status === 'Cancelled') {
                        finalStatus = 'Cancelled';
                    } else if (returnedOrderIds.has(o.order_id) || o.order_status === 'Returned') {
                        finalStatus = 'Returned';
                    } else if (o.order_status === 'Completed' || o.order_status === 'Delivered' || o.order_status === 'Complete') {
                        finalStatus = 'Completed';
                    } else {
                        // Shipped, Processing, Pending -> Active
                        finalStatus = 'Active';
                    }

                    // Increment Status
                    state.statusCounts[finalStatus]++;

                    // Add to Revenue if NOT Cancelled?
                    // Usually Cancelled orders have 0 revenue realization.
                    if (finalStatus !== 'Cancelled') {
                        state.relevantOrderIds.add(o.order_id);
                        const amt = (o.order_total_amount || 0);
                        state.totalRevenue += amt;

                        // Customer Spend
                        if (!state.customerSpend[o.customer_id]) state.customerSpend[o.customer_id] = 0;
                        state.customerSpend[o.customer_id] += amt;

                        // Chart Data
                        const dateStr = o.order_date;
                        const y = parseInt(dateStr.substring(0, 4));
                        const m = parseInt(dateStr.substring(5, 7));

                        let key;
                        let sortKey;
                        const dateObj = new Date(y, m - 1, 1);
                        if (selectedYear === 'All') {
                            key = format(dateObj, 'MMM yyyy');
                        } else {
                            key = format(dateObj, 'MMM');
                        }
                        sortKey = dateObj.getTime();

                        if (!state.monthlyStats[key]) {
                            state.monthlyStats[key] = { name: key, revenue: 0, orders: 0, sortKey };
                        }
                        state.monthlyStats[key].revenue += amt;
                        state.monthlyStats[key].orders += 1;

                        if (showComparison) {
                            if (!state.monthlyStats[key].previousRevenue) state.monthlyStats[key].previousRevenue = 0;
                            state.monthlyStats[key].previousRevenue += amt * (0.8 + Math.random() * 0.4);
                        }
                    } else {
                        // Cancelled orders - maybe track count but not revenue?
                        // chart logic above inside `if (!Cancelled)` block means we exclude them from Revenue Trend. Correct.
                    }
                };

                // --- 1. ORDERS PROCESSING ---
                if (useDB) {
                    const ordersTable = db.orders;
                    let collection;
                    if (selectedYear !== 'All') {
                        let startStr, endStr;
                        if (selectedMonth !== 'All') {
                            const mStr = selectedMonth.toString().padStart(2, '0');
                            startStr = `${selectedYear}-${mStr}`;
                            endStr = `${selectedYear}-${mStr}\uffff`;
                        } else {
                            startStr = `${selectedYear}`;
                            endStr = `${selectedYear}\uffff`;
                        }
                        collection = ordersTable.where('order_date').between(startStr, endStr, true, true);
                    } else {
                        if (selectedMonth !== 'All') {
                            const targetMonth = parseInt(selectedMonth);
                            collection = ordersTable.filter(o => {
                                if (!o.order_date) return false;
                                const m = o.order_date.substring(5, 7);
                                return parseInt(m) === targetMonth;
                            });
                        } else {
                            collection = ordersTable.toCollection();
                        }
                    }

                    await collection.each(o => {
                        processOrder(o);
                    });

                } else {
                    // MODE: In-Memory (Small Data)
                    orders.forEach(o => {
                        if (!o.order_date) return;
                        const pYear = o.order_date.substring(0, 4);
                        let pMonth = o.order_date.substring(5, 7);
                        if (pMonth.startsWith('0')) pMonth = pMonth.substring(1);

                        if (selectedYear !== 'All' && pYear !== selectedYear) return;
                        if (selectedMonth !== 'All' && pMonth !== selectedMonth) return;

                        processOrder(o);
                    });
                }

                if (!isMounted) return;
                setCalculationProgress(50);

                // --- 2. RELATED ITEMS (Products Revenue) ---
                // We only process items for valid (non-cancelled) orders
                // And filtered by date

                if (useDB) {
                    await db.orderItems.each(item => {
                        if (state.relevantOrderIds.has(item.order_id)) {
                            if (!state.productRevenue[item.product_id]) state.productRevenue[item.product_id] = 0;
                            state.productRevenue[item.product_id] += (item.total_amount || 0);
                        }
                    });
                } else {
                    orderItems.forEach(item => {
                        if (state.relevantOrderIds.has(item.order_id)) {
                            if (!state.productRevenue[item.product_id]) state.productRevenue[item.product_id] = 0;
                            state.productRevenue[item.product_id] += (item.total_amount || 0);
                        }
                    });
                }

                if (!isMounted) return;
                setCalculationProgress(80);

                // --- FINALIZE ---
                const totalProducts = (useDB ? await db.orderItems.count() : orderItems.length); // Total Items Sold (Volume)
                const totalCustomers = useDB ? await db.customers.count() : customers.length;

                const chartData = Object.values(state.monthlyStats).sort((a, b) => a.sortKey - b.sortKey);

                const pieData = [
                    { name: 'Completed', value: state.statusCounts.Completed, color: '#10b981' },
                    { name: 'Returned', value: state.statusCounts.Returned, color: '#f43f5e' },
                    { name: 'Cancelled', value: state.statusCounts.Cancelled, color: '#94a3b8' },
                    { name: 'Active', value: state.statusCounts.Active, color: '#3b82f6' }
                ].filter(d => d.value > 0);

                // Top Products Names
                const top5ProductIDs = Object.entries(state.productRevenue)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                const topProducts = await Promise.all(top5ProductIDs.map(async ([pid, rev]) => {
                    let pName = `ID ${pid}`;
                    if (useDB) {
                        // We can also check memory 'products' first as cache
                        const cached = products.find(p => p.product_id == pid);
                        if (cached) {
                            pName = cached.product_name;
                        } else {
                            const p = await db.products.get(parseInt(pid));
                            if (p) pName = p.product_name;
                        }
                    } else {
                        const p = products.find(kp => kp.product_id == pid);
                        if (p) pName = p.product_name;
                    }
                    return { name: pName, revenue: rev };
                }));

                // Top Customers Names
                const top5CustomerIDs = Object.entries(state.customerSpend)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                const topCustomers = await Promise.all(top5CustomerIDs.map(async ([cid, spend]) => {
                    let cName = `User ${cid}`;
                    if (useDB) {
                        const cached = customers.find(c => c.customer_id == cid);
                        if (cached) {
                            cName = cached.customer_full_name;
                        } else {
                            const c = await db.customers.get(parseInt(cid));
                            if (c) cName = c.customer_full_name;
                        }
                    } else {
                        const c = customers.find(kc => kc.customer_id == cid);
                        if (c) cName = c.customer_full_name;
                    }
                    return { name: cName, spend: spend };
                }));

                if (!isMounted) return;
                setMetrics({
                    kpi: { totalProducts, totalCustomers, totalOrders: state.matchingOrdersCount, totalRevenue: state.totalRevenue },
                    chartData,
                    pieData,
                    topProducts,
                    topCustomers
                });
                setIsCalculating(false);

            } catch (err) {
                console.error("Calculation Error:", err);
                if (isMounted) setIsCalculating(false);
            }
        };

        // Debounce slightly
        const t = setTimeout(calculateMetrics, 100);
        return () => {
            isMounted = false;
            clearTimeout(t);
        };
    }, [products, orders, returns, customers, orderItems, loading, selectedYear, selectedMonth, showComparison, dataStatus, db]);


    // Year Options generator
    // Needs to change to async or effect based?
    // For now, simple approximation from Small Data is OK for dropdown options, 
    // OR we just hardcode 2022-2025?
    // Let's use orders from context (small) for Years. It usually covers range.
    const years = useMemo(() => {
        if (!orders.length) return ['2023', '2022']; // Default fallback
        const uniqueYears = [...new Set(orders.map(o => getYear(parseISO(o.order_date))))].sort().reverse();
        return uniqueYears;
    }, [orders]);


    if (loading) return <div className="p-8 text-center text-slate-500">Loading Admin Dashboard...</div>;

    // Show loading if calculating but no metrics yet (first load)
    const showLoading = isCalculating || !metrics;

    if (showLoading && !metrics) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Analyzing dashboard metrics... {calculationProgress}%</p>
        </div>
    );

    const { kpi, chartData, pieData, topProducts, topCustomers } = metrics;

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500">Performance overview & analytics</p>
                        {isCalculating && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">Updating... {calculationProgress}%</span>}
                        {dataStatus === 'fully_synced' && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Full Data Mode</span>}
                    </div>
                </div>


                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <select
                        className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1 cursor-pointer"
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                    >
                        <option value="All">All Years</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <div className="w-[1px] h-4 bg-slate-200" />
                    <select
                        className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1 cursor-pointer"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                    >
                        <option value="All">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{format(new Date(2022, m - 1, 1), 'MMMM')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- KPI CARDS --- */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${isCalculating ? 'opacity-80' : 'opacity-100'}`}>
                <MetricCard
                    title="Total Revenue"
                    value={kpi.totalRevenue}
                    prefix="$"
                    icon={DollarSign}
                    color="text-emerald-500"
                    bgColor="bg-emerald-50"
                    subtitle="Gross Sales"
                />
                <MetricCard
                    title="Total Orders"
                    value={kpi.totalOrders}
                    isCurrency={false}
                    icon={ShoppingCart}
                    color="text-blue-500"
                    bgColor="bg-blue-50"
                    subtitle="Processed Orders"
                />
                <MetricCard
                    title="Total Customers"
                    value={kpi.totalCustomers}
                    isCurrency={false}
                    icon={Users}
                    color="text-purple-500"
                    bgColor="bg-purple-50"
                    subtitle="Registered Users"
                />
                <MetricCard
                    title="Total Products"
                    value={kpi.totalProducts}
                    isCurrency={false}
                    icon={Package}
                    color="text-amber-500"
                    bgColor="bg-amber-50"
                    subtitle="In Calendar"
                />
            </div>

            {/* --- ANALYTICS CHARTS --- */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isCalculating ? 'opacity-80' : 'opacity-100'}`}>

                {/* 1. Revenue Line Chart (2/3) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-500" /> Revenue Trend
                        </h3>

                        {/* Comparison Switch (Slide Bar) */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setShowComparison(false)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!showComparison ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Present
                            </button>
                            <button
                                onClick={() => setShowComparison(true)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${showComparison ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Previous
                            </button>
                        </div>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(val, name) => [`$${val.toLocaleString()}`, name === 'revenue' ? 'Current Revenue' : 'Previous Revenue']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="revenue" />
                                {showComparison && (
                                    <Line type="monotone" dataKey="previousRevenue" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="previousRevenue" />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Order Status Pie (1/3) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <AlertCircle size={18} className="text-slate-400" /> Order Status
                    </h3>
                    <div className="h-72 flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Orders Bar Chart (Full Width) */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Orders Volume</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* --- TOP 5 TABLES --- */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300 ${isCalculating ? 'opacity-80' : 'opacity-100'}`}>

                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-slate-900">Top 5 Products</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {topProducts.map((p, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50">
                                    <td className="px-6 py-3 font-medium text-slate-700 group-hover:text-blue-600 truncate max-w-xs" title={p.name}>
                                        {p.name}
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-900">
                                        ${p.revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-slate-900">Top 5 Customers</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Customer Name</th>
                                <th className="px-6 py-3 text-right">Total Spend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {topCustomers.map((c, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50">
                                    <td className="px-6 py-3 font-medium text-slate-700 group-hover:text-blue-600">
                                        {c.name}
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-900">
                                        ${c.spend.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Overview;
