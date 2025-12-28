import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Clock, Truck, RotateCcw } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

const Returns = () => {
    const { returns, loading, dataStatus, db } = useData();
    const [analytics, setAnalytics] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        if (loading && dataStatus === 'loading_small') return;

        let isMounted = true;
        setIsCalculating(true);

        const calculateAnalytics = async () => {
            try {
                const useDB = dataStatus === 'fully_synced';
                // console.log(`Returns Analytics: Mode ${useDB ? 'FULL DB' : 'PREVIEW'}`);

                let returnsData = [];

                if (useDB) {
                    // Fetch all returns from IDB
                    returnsData = await db.returns.toArray();
                } else {
                    // Use context small data
                    returnsData = returns;
                }

                if (!isMounted) return;

                // --- Perform Calculations ---
                let totalProcessingTime = 0;
                let processedCount = 0;
                let totalPickupDelay = 0;
                let pickupCount = 0;
                const monthlyReturns = {};

                returnsData.forEach(ret => {
                    // Refund Processing Time
                    if (ret.refund_processed_date && ret.return_date) {
                        const days = differenceInDays(parseISO(ret.refund_processed_date), parseISO(ret.return_date));
                        totalProcessingTime += days;
                        processedCount++;
                    }

                    // Pickup Delay
                    if (ret.pickup_scheduled_date && ret.return_date) {
                        const days = differenceInDays(parseISO(ret.pickup_scheduled_date), parseISO(ret.return_date));
                        totalPickupDelay += days;
                        pickupCount++;
                    }

                    // Monthly Count
                    if (ret.return_date) {
                        const month = ret.return_date.substring(0, 7); // YYYY-MM
                        monthlyReturns[month] = (monthlyReturns[month] || 0) + 1;
                    }
                });

                const avgProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount : 0;
                const avgPickupDelay = pickupCount > 0 ? totalPickupDelay / pickupCount : 0;

                const chartData = Object.keys(monthlyReturns)
                    .sort()
                    .map(date => ({
                        name: format(parseISO(date + "-01"), "MMM yyyy"),
                        Returns: monthlyReturns[date]
                    }));

                setAnalytics({
                    totalReturns: returnsData.length,
                    avgProcessingTime,
                    avgPickupDelay,
                    chartData
                });
                setIsCalculating(false);

            } catch (err) {
                console.error("Returns calculation error:", err);
                if (isMounted) setIsCalculating(false);
            }
        };

        // Debounce slightly to prevent UI thrashing
        const t = setTimeout(calculateAnalytics, 100);
        return () => {
            isMounted = false;
            clearTimeout(t);
        };

    }, [returns, loading, dataStatus, db]);


    if (loading || !analytics) return <div className="p-8 text-center text-slate-500">Loading returns analysis...</div>;

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Header */}
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">Returns Analytics</h2>
                    {isCalculating && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">Updating...</span>}
                    {dataStatus === 'fully_synced' && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Full Data Mode</span>}
                </div>
                <p className="text-slate-500">Analyze return rates, processing times, and logistics efficiency.</p>
            </div>

            {/* Metrics */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${isCalculating ? 'opacity-70' : 'opacity-100'}`}>
                <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
                        <RotateCcw size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Returns</p>
                        <p className="text-2xl font-bold text-slate-900">{analytics.totalReturns.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Avg Refund Time</p>
                        <p className="text-2xl font-bold text-slate-900">{analytics.avgProcessingTime.toFixed(1)} Days</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                        <Truck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Avg Pickup Delay</p>
                        <p className="text-2xl font-bold text-slate-900">{analytics.avgPickupDelay.toFixed(1)} Days</p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className={`bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-opacity duration-300 ${isCalculating ? 'opacity-70' : 'opacity-100'}`}>
                <h3 className="text-lg font-bold text-slate-800 mb-6">Returns Volume per Month</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="Returns" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Returns;
