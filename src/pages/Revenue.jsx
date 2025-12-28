import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { format, parseISO, getYear, getMonth } from 'date-fns';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, ComposedChart
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Activity } from 'lucide-react';
import MetricCard from '../components/MetricCard';

const Revenue = () => {
    const { orderItems, products, orders, loading, dataStatus, db } = useData();

    // Filters
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState('All');

    // State for calculated metrics
    const [metrics, setMetrics] = useState({
        kpi: null,
        chartData: [],
        costBreakdown: []
    });
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationProgress, setCalculationProgress] = useState(0);

    // --- Filter Options (Memoized) ---
    // Use Orders as the source of truth for Years?
    // In DB mode, getting unique years efficiently is tricky without scanning all.
    // We will stick to the 'orders' array from context (small data) for UI options, 
    // or hardcode a range if needed. Usually preview data covers the years.
    const years = useMemo(() => {
        if (!orders.length) return ['2023', '2022'];
        return [...new Set(orders.map(o => getYear(parseISO(o.order_date))))].sort().reverse();
    }, [orders]);

    // --- Async Analytics Logic ---
    useEffect(() => {
        if (loading && dataStatus === 'loading_small') return;

        let isMounted = true;
        setIsCalculating(true);
        setCalculationProgress(0);

        const calculateFinancials = async () => {
            try {
                const useDB = dataStatus === 'fully_synced';
                //console.log(`Starting Revenue Calc. Mode: ${useDB ? 'DB' : 'Preview'}`);

                // State Accumulators
                let totalRevenue = 0;
                let totalCost = 0;
                const dailyStats = {}; // Key: "MMM yyyy"
                const productPerformance = {}; // Key: product_id

                // Helper to update accumulators
                const processItem = (item, product, orderDate) => {
                    if (item.is_returned) return;

                    const revenue = item.total_amount || 0;

                    // Cost Calc
                    let quantity = 1;
                    // Heuristic to guess quantity if not present (dataset issue in past?)
                    if (product && product.selling_unit_price > 0) {
                        quantity = Math.round(revenue / product.selling_unit_price) || 1;
                    }
                    const cost = (product?.cost_unit_price || 0) * quantity;

                    totalRevenue += revenue;
                    totalCost += cost;

                    // Chart Aggregation
                    if (orderDate) {
                        // We need correct Key
                        // "MMM yyyy"
                        // Parsing string manually is safer/faster?
                        // YYYY-MM-DD
                        const y = parseInt(orderDate.substring(0, 4));
                        const m = parseInt(orderDate.substring(5, 7)); // 1-12

                        // Check Filter matches
                        if (selectedYear !== 'All' && y.toString() !== selectedYear) return;
                        if (selectedMonth !== 'All' && m.toString() !== selectedMonth) return;

                        const dObj = new Date(y, m - 1, 1);
                        const dateKey = format(dObj, 'MMM yyyy');
                        const sortKey = dObj.getTime();

                        if (!dailyStats[dateKey]) dailyStats[dateKey] = { name: dateKey, revenue: 0, cost: 0, profit: 0, sortKey };
                        dailyStats[dateKey].revenue += revenue;
                        dailyStats[dateKey].cost += cost;
                        dailyStats[dateKey].profit += (revenue - cost);
                    }

                    // Product Performance (Global? Or filtered? Usually filtered by time)
                    // If the Item matched the time filter (checked above), we add it.
                    // IMPORTANT: The check above `if (selectedYear...) return` prevents adding to dailyStats.
                    // We should verify if we want Product Table to also be filtered. YES.

                    // Re-Check filter for Product Map
                    if (orderDate) {
                        const y = parseInt(orderDate.substring(0, 4));
                        const m = parseInt(orderDate.substring(5, 7));
                        if (selectedYear !== 'All' && y.toString() !== selectedYear) return;
                        if (selectedMonth !== 'All' && m.toString() !== selectedMonth) return;
                    }

                    if (!productPerformance[item.product_id]) {
                        productPerformance[item.product_id] = {
                            id: item.product_id,
                            name: product?.product_name || `ID ${item.product_id}`,
                            category: product?.product_category || 'N/A',
                            revenue: 0,
                            cost: 0,
                            profit: 0
                        };
                    }
                    productPerformance[item.product_id].revenue += revenue;
                    productPerformance[item.product_id].cost += cost;
                    productPerformance[item.product_id].profit += (revenue - cost);
                };

                if (useDB) {
                    // --- DB MODE ---
                    // We need to iterate OrderItems.
                    // However, we need 'order_date' for filtering. OrderItems don't have date. Orders have date.
                    // Strategy:
                    // 1. Get List of OrderIDs that match the Date Filter. (Fast using Index on Orders table).
                    // 2. Iterate filtered orders, loop their OrderItems? 
                    // Wait, `orderItems` table usually maps item->order_id.
                    // If we iterate Orders, do we have easy access to Items?
                    // Dexie: `db.orderItems.where('order_id').anyOf(arrayOfOrderIds)` -> fast if array small.
                    // If array is 50k, it crashes.

                    // Better Strategy for Big Data:
                    // Iterate ALL OrderItems? No, 500k.
                    // Iterate Orders (filtered), then for each order, fetch items? n+1 problem, slow (50k requests).

                    // Optimization for this user's specific dataset structure/reqs:
                    // "Rapid Fast".
                    // Maybe we fetch ALL products into a Map first? (15k products -> fast enough).
                    const productMap = new Map();
                    await db.products.each(p => productMap.set(p.product_id, p));

                    // Using Orders to filter items
                    // If Filter is "All Years", we essentially process everything.
                    // Streaming 500k orderItems and joining with Orders (50k) is the only way for accurate "All Time".
                    // But we can cache the Order Date?
                    // Or easier: 
                    // 1. Load All Orders (id, date) into a Map. (50k ints + strings -> ~2MB RAM, instant).
                    const orderDateMap = new Map();
                    // Apply Date filter here!
                    const ordersTable = db.orders;
                    let orderCollection;

                    if (selectedYear !== 'All') {
                        // Range Query
                        const yStart = selectedYear;
                        const yEnd = selectedYear + '\uffff';
                        orderCollection = ordersTable.where('order_date').between(yStart, yEnd, true, true);
                    } else {
                        orderCollection = ordersTable.toCollection();
                    }

                    await orderCollection.each(o => {
                        if (o.order_status === 'Cancelled') return;
                        // Month check if needed for 'All Years' (though specific year + month handled above)
                        if (selectedMonth !== 'All') {
                            const m = o.order_date.substring(5, 7);
                            if (parseInt(m).toString() !== selectedMonth) return;
                        }
                        orderDateMap.set(o.order_id, o.order_date);
                    });

                    // 2. Iterate All OrderItems.
                    // If item.order_id is in Map, process it.
                    // This is O(N_items) but with fast Set lookup.
                    // 500k iterations in JS = < 500ms.
                    // Reading 500k items from IDB = 1-2s. Acceptable.

                    let processed = 0;
                    const totalItemsApprox = await db.orderItems.count(); // for progress bar

                    await db.orderItems.each(item => {
                        if (orderDateMap.has(item.order_id)) {
                            const p = productMap.get(item.product_id);
                            const d = orderDateMap.get(item.order_id);
                            processItem(item, p, d);
                        }
                        processed++;
                        if (processed % 5000 === 0) {
                            setCalculationProgress(Math.round((processed / totalItemsApprox) * 100));
                        }
                    });

                } else {
                    // --- PREVIEW MODE ---
                    // In-Memory Arrays (orders, orderItems, products)
                    // 1. Build Product Map
                    const productMap = new Map();
                    products.forEach(p => productMap.set(p.product_id, p));

                    // 2. Build Filtered Order Set
                    const orderDateMap = new Map();
                    orders.forEach(o => {
                        if (o.order_status === 'Cancelled') return;
                        if (!o.order_date) return;
                        const y = o.order_date.substring(0, 4);
                        const m = o.order_date.substring(5, 7);
                        if (selectedYear !== 'All' && y !== selectedYear) return;
                        if (selectedMonth !== 'All' && parseInt(m).toString() !== selectedMonth) return; // '01' -> '1'
                        orderDateMap.set(o.order_id, o.order_date);
                    });

                    // 3. Process Items
                    orderItems.forEach((item, idx) => {
                        if (orderDateMap.has(item.order_id)) {
                            const p = productMap.get(item.product_id);
                            const d = orderDateMap.get(item.order_id);
                            processItem(item, p, d);
                        }
                        if (idx % 1000 === 0) {
                            setCalculationProgress(Math.round((idx / orderItems.length) * 100));
                        }
                    });
                }

                // Finalize
                if (!isMounted) return;
                const grossProfit = totalRevenue - totalCost;
                const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
                const sortedChartData = Object.values(dailyStats).sort((a, b) => a.sortKey - b.sortKey);
                const breakdown = Object.values(productPerformance).sort((a, b) => b.revenue - a.revenue);

                setMetrics({
                    kpi: { totalRevenue, totalCost, grossProfit, margin },
                    chartData: sortedChartData,
                    costBreakdown: breakdown
                });
                setIsCalculating(false);

            } catch (err) {
                console.error("Revenue Calc Error:", err);
                if (isMounted) setIsCalculating(false);
            }
        };

        // Debounce
        const t = setTimeout(calculateFinancials, 100);
        return () => {
            isMounted = false;
            clearTimeout(t);
        };

    }, [orders, products, orderItems, loading, selectedYear, selectedMonth, dataStatus, db]);


    if (loading) return <div className="p-8 text-center text-slate-500">Loading revenue intelligence...</div>;

    const showLoading = isCalculating || !metrics.kpi;
    if (showLoading && !metrics.kpi) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Analyzing financials... {calculationProgress}%</p>
        </div>
    );

    const { kpi, chartData, costBreakdown } = metrics;

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Revenue Analysis</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500">Cost, Margin, and Profitability Breakdown</p>
                        {isCalculating && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">Updating... {calculationProgress}%</span>}
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

            {/* KPI Cards */}
            {kpi && (
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition-opacity duration-300 ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>
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
                        title="Total Cost"
                        value={kpi.totalCost}
                        prefix="$"
                        icon={CreditCard}
                        color="text-rose-500"
                        bgColor="bg-rose-50"
                        subtitle="COGS"
                    />
                    <MetricCard
                        title="Gross Profit"
                        value={kpi.grossProfit}
                        prefix="$"
                        icon={Activity}
                        color="text-blue-500"
                        bgColor="bg-blue-50"
                        subtitle="Revenue - Cost"
                    />
                    <MetricCard
                        title="Profit Margin"
                        value={kpi.margin.toFixed(1)}
                        suffix="%"
                        isCurrency={false}
                        icon={TrendingUp}
                        color="text-amber-500"
                        bgColor="bg-amber-50"
                        subtitle="Performance"
                    />
                </div>
            )}

            {/* Charts: Revenue vs Cost */}
            <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-opacity duration-300 ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>
                <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue vs Cost Trend</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip
                                formatter={(val) => `$${val.toLocaleString()}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="cost" name="Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                            <Line type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" strokeWidth={3} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity duration-300 ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>
                <div className="p-6 border-b border-slate-50">
                    <h3 className="font-bold text-slate-900">Product Financial Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                                <th className="px-6 py-3 text-right">Cost</th>
                                <th className="px-6 py-3 text-right">Profit</th>
                                <th className="px-6 py-3 text-right">Margin %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {costBreakdown.slice(0, 50).map((item, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50">
                                    <td className="px-6 py-3 font-medium text-slate-700 max-w-xs truncate" title={item.name}>{item.name}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.category}</td>
                                    <td className="px-6 py-3 text-right text-emerald-600 font-medium">${item.revenue.toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right text-rose-600">${item.cost.toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-900">${item.profit.toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right text-slate-500">
                                        {item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : 0}%
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

export default Revenue;
