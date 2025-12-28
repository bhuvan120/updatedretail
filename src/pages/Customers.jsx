import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Customers = () => {
    const { orders, customers, returns, loading, dataStatus, db } = useData();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [customerData, setCustomerData] = useState([]); // Array of {id, name, totalSpent, lastOrder}
    const [isCalculating, setIsCalculating] = useState(false);
    const [progress, setProgress] = useState(0);

    // Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Async Calculation
    useEffect(() => {
        if (loading && dataStatus === 'loading_small') return;

        let isMounted = true;
        setIsCalculating(true);
        setProgress(0);

        const calculateCustomers = async () => {
            try {
                const useDB = dataStatus === 'fully_synced';
                //console.log(`Starting Customer Calc. Mode: ${useDB ? 'DB' : 'Preview'}`);

                const finalDataMap = new Map(); // cid -> Obj

                if (useDB) {
                    // --- DB MODE ---
                    // Strategy:
                    // 1. Load All Customers (Small table, 5-10k?) 
                    //    Actually user said "public pay folder" -> might be large.
                    //    If customers table is huge (100k+), we should rely on SEARCH mostly.
                    //    But current UI shows "Top 50" by spend.
                    //    Calculating Total Spend for ALL 100k customers requires scanning ALL orders.
                    //    That is unavoidable for "Top Spenders" list.

                    // Optimization:
                    // We scan ALL orders (50k) once, aggregate spend/lastOrder by CustomerID.
                    // Then we join with Customer Name only for the Top 50 or Search Matches.

                    const spendingMap = new Map(); // cid -> { total, last }

                    let processed = 0;
                    const totalOrdersApprox = await db.orders.count();

                    // Prepare Returns
                    const returnedIds = new Set((await db.returns.toArray()).map(r => r.order_id));

                    await db.orders.each(o => {
                        if (o.order_status === 'Cancelled') return;
                        if (returnedIds.has(o.order_id) || o.order_status === 'Returned') return;

                        const cur = spendingMap.get(o.customer_id) || { total: 0, last: '' };
                        cur.total += (o.order_total_amount || 0);
                        if (!cur.last || o.order_date > cur.last) {
                            cur.last = o.order_date;
                        }
                        spendingMap.set(o.customer_id, cur);

                        processed++;
                        if (processed % 2000 === 0) setProgress(Math.round((processed / totalOrdersApprox) * 100));
                    });

                    // Convert to Array
                    const allStats = Array.from(spendingMap.entries()).map(([cid, stats]) => ({
                        id: cid,
                        name: '', // Fill later
                        totalSpent: stats.total,
                        lastOrder: stats.last
                    }));

                    // Sort by Spend (desc)
                    allStats.sort((a, b) => b.totalSpent - a.totalSpent);

                    // Now, we need Names.
                    // If we have 10k customers, fetching all names is fine.
                    // If we have 1M customers, we only fetch names for Top N + Search Matches?
                    // The UI purely filters the *results list*.
                    // If user searches "John", we need to search DB for "John", get IDs, then look up their stats.
                    // But computing stats for everyone is needed for "Top Spenders" view (default).

                    // Let's assume we proceed with Top 100 for display, plus we handle search separately?
                    // OR we just hydrate names for everyone if < 50k?
                    // Let's count customers.
                    const customerCount = await db.customers.count();

                    if (customerCount < 20000) {
                        // Load all names into map
                        const nameMap = new Map();
                        await db.customers.each(c => nameMap.set(c.customer_id, c.customer_first_name + ' ' + c.customer_last_name));

                        allStats.forEach(item => {
                            item.name = nameMap.get(item.id) || `Customer ${item.id}`;
                        });
                        if (isMounted) setCustomerData(allStats);
                    } else {
                        // Too many customers. Only hydrate top 100 initially.
                        // AND hydrate search results?
                        // Implementing "Server-Side" search logic with IDB is complex here without full re-write.
                        // Let's hydrate Top 500.
                        const top500 = allStats.slice(0, 500);

                        // Fetch names for these 500
                        await Promise.all(top500.map(async (item) => {
                            const c = await db.customers.get(item.id);
                            item.name = c ? (c.customer_first_name + ' ' + c.customer_last_name) : `Customer ${item.id}`;
                        }));

                        if (isMounted) setCustomerData(top500);
                        // Note: This disables client-side search across ALL customers if they aren't in top 500.
                        // But for "Rapid Fast" requirement with huge data, this is the tradeoff unless we implement search index in IDB.
                        // Given the constraints, showing Top Spenders is the priority. 
                        // Accessing specific ID via search works if we check if search is ID key.
                    }

                } else {
                    // --- PREVIEW MODE ---
                    // Map Names
                    const customerMap = new Map();
                    customers.forEach(c => customerMap.set(c.customer_id, c.customer_first_name + ' ' + c.customer_last_name));

                    // Aggregate Orders
                    const spendingMap = new Map(); // cid -> { total, last }
                    const returnedIds = new Set(returns.map(r => r.order_id));
                    orders.forEach(o => {
                        if (o.order_status === 'Cancelled') return;
                        if (returnedIds.has(o.order_id) || o.order_status === 'Returned') return;
                        const cur = spendingMap.get(o.customer_id) || { total: 0, last: '' };
                        cur.total += (o.order_total_amount || 0);
                        if (!cur.last || o.order_date > cur.last) cur.last = o.order_date;
                        spendingMap.set(o.customer_id, cur);
                    });

                    const finalData = Array.from(spendingMap.entries()).map(([cid, stat]) => ({
                        id: cid,
                        name: customerMap.get(cid) || `Customer ${cid}`,
                        totalSpent: stat.total,
                        lastOrder: stat.last
                    })).sort((a, b) => b.totalSpent - a.totalSpent);

                    if (isMounted) setCustomerData(finalData);
                }

                setIsCalculating(false);

            } catch (err) {
                console.error("Customers Calc Error:", err);
                if (isMounted) setIsCalculating(false);
            }
        };

        const t = setTimeout(calculateCustomers, 100);
        return () => {
            isMounted = false;
            clearTimeout(t);
        };
    }, [orders, customers, loading, dataStatus, db]);


    // Client-Side Search (over whatever data we loaded)
    const filtered = customerData.filter(c =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.id.toString().includes(debouncedSearch)
    );

    if (loading) return <div className="p-8 text-center text-slate-500">Loading customer profiles...</div>;

    if (isCalculating && !customerData.length) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Calculating customer lifetime value... {progress}%</p>
        </div>
    );

    return (
        <div className="space-y-6 fade-in pb-10">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500">
                            {dataStatus === 'fully_synced' ? 'Top Active Customers' : `Total ${customers.length} registered customers (Preview)`}
                        </p>
                        {isCalculating && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">Updating... {progress}%</span>}
                        {dataStatus === 'fully_synced' && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Full Data Mode</span>}
                    </div>
                </div>
            </header>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative w-64 mb-4">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Customer</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">ID</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Last Order</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.slice(0, 50).map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{c.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                        {c.id}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {c.lastOrder ? format(parseISO(c.lastOrder), 'MMM dd, yyyy') : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                        ${c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="p-4 text-xs text-slate-400 text-center">Showing top 50 matches</p>
                </div>
            </div>
        </div>
    );
};

export default Customers;
