import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { format, parseISO } from 'date-fns';

const Orders = () => {
    const { orders: smallOrders, loading, dataStatus, db } = useData();
    const [page, setPage] = useState(1);
    const [ordersData, setOrdersData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const LIMIT = 20;

    useEffect(() => {
        if (loading && dataStatus === 'loading_small') return;

        let isMounted = true;
        setIsFetching(true);

        const fetchOrders = async () => {
            try {
                if (dataStatus === 'fully_synced') {
                    // Full DB Mode
                    const count = await db.orders.count();

                    // Efficient pagination with IDB
                    // Assuming 'order_date' is indexed, or we use primary key if it correlates with date
                    // If 'order_date' is not indexed, sorting might be slow for huge datasets.
                    // For now, let's assume natural order or try to sort by order_date if indexed.
                    // db.orders.orderBy('order_date') might require an index.
                    // If no index, simple reverse() on full collection is bad.
                    // Let's use reverse() on the natural key (primary key) if it's effectively temporal?
                    // Or just use offset/limit which IDB handles reasonably well even without index for iteration, but sort needs index.

                    // Let's try to get by offset/limit directly.
                    // If we want "Recent" first, we need to know how to sort.
                    // Let's assume ID is somewhat chronological or just fetch range.
                    // Actually, db.orders.reverse().offset(...).limit(...) works on primary key.

                    const paged = await db.orders
                        .reverse() // Newest first (assuming ID or insertion order)
                        .offset((page - 1) * LIMIT)
                        .limit(LIMIT)
                        .toArray();

                    if (isMounted) {
                        setTotalCount(count);
                        setOrdersData(paged);
                    }
                } else {
                    // Preview Mode
                    const sorted = [...smallOrders].sort((a, b) => (a.order_date > b.order_date ? -1 : 1));
                    setTotalCount(sorted.length);
                    setOrdersData(sorted.slice((page - 1) * LIMIT, page * LIMIT));
                }
            } catch (err) {
                console.error("Orders fetch failed:", err);
            } finally {
                if (isMounted) setIsFetching(false);
            }
        };

        fetchOrders();
        return () => { isMounted = false; };
    }, [page, smallOrders, dataStatus, db, loading]);


    if (loading && !ordersData.length) return <div className="p-8 text-center text-slate-500">Loading orders...</div>;

    return (
        <div className="space-y-6 fade-in pb-10">
            {/* Loading Indicator for Full Data */}
            {(dataStatus === 'initial_loaded' || dataStatus === 'loading_full') && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium text-sm">Showing preview data. Loading full history in background...</span>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
                    <p className="text-slate-500">
                        {dataStatus === 'fully_synced' ? 'Total Database Records: ' : 'Preview Records: '}
                        {totalCount.toLocaleString()}
                    </p>
                </div>
                {isFetching && <span className="text-sm text-blue-500 animate-pulse">Refreshing...</span>}
            </header>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Order ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Customer ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {ordersData.map((o) => (
                            <tr key={o.order_id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-900 font-medium font-mono">#{o.order_id}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {o.order_date ? format(parseISO(o.order_date), 'MMM dd, yyyy') : '-'}
                                </td>
                                <td className="px-6 py-4 text-slate-500">{o.customer_id}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.order_status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                            o.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                o.order_status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                        }`}>
                                        {o.order_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                    ${(o.order_total_amount || 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        {ordersData.length === 0 && !isFetching && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                    <button
                        disabled={page === 1 || isFetching}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-slate-600">
                        Page {page} of {Math.ceil(totalCount / LIMIT) || 1}
                    </span>
                    <button
                        disabled={page * LIMIT >= totalCount || isFetching}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Orders;
