import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/vajraDB';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    // We only keep "small" preview data in memory for instant UI.
    // The full charts/analytics will query IDB directly.
    const [data, setData] = useState({
        products: [],
        orders: [],
        returns: [],
        customers: [],
        orderItems: []
    });
    const [loading, setLoading] = useState(true);
    const [dataStatus, setDataStatus] = useState('idle'); // 'idle' | 'loading_small' | 'small_loaded' | 'syncing_full' | 'fully_synced'
    const [error, setError] = useState(null);
    const [syncProgress, setSyncProgress] = useState(0);

    const initialized = React.useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initData = async () => {
            setLoading(true);
            setDataStatus('loading_small');

            // Launch both concurrency
            loadSmallData();
            checkAndSyncFullDB();
        };

        const loadSmallData = async () => {
            try {
                const [pS, oS, rS, cS, iS] = await Promise.all([
                    fetch('/vajra_products_small.json').then(r => r.json()),
                    fetch('/vajra_orders_small.json').then(r => r.json()),
                    fetch('/vajra_order_returns_small.json').then(r => r.json()),
                    fetch('/vajra_customers_small.json').then(r => r.json()),
                    fetch('/vajra_order_items_small.json').then(r => r.json())
                ]);

                setData({
                    products: pS || [],
                    orders: oS || [],
                    returns: rS || [],
                    customers: cS || [],
                    orderItems: iS || []
                });

                setLoading(false);
                setDataStatus('small_loaded');
            } catch (smallErr) {
                console.error("Small files fetch failed:", smallErr);
                setLoading(false);
            }
        };

        const checkAndSyncFullDB = async () => {
            try {
                const productsCount = await db.products.count();
                const ordersCount = await db.orders.count();

                // If DB has < 1000 items, assume it's not fully synced
                if (productsCount < 1000 || ordersCount < 1000) {
                    await syncFullDataToDB();
                } else {
                    console.log(`IDB already populated (P: ${productsCount}, O: ${ordersCount})`);
                    // If small loaded, we can switch to full mode
                    setDataStatus('fully_synced');
                }
            } catch (err) {
                console.error("DB Check failed:", err);
            }
        };

        const syncFullDataToDB = async () => {
            try {
                // If we are already 'small_loaded', this status update notifies UI that syncing is happening
                // But we shouldn't overwrite 'small_loaded' if we want UI to stay visible?
                // Actually 'syncing_full' is fine if UI handles it (Overview.jsx doesn't check 'syncing_full' explicitly to hide stuff).
                // However, let's keep status as 'small_loaded' or distinct 'syncing_full'.
                // If we set 'syncing_full', we need valid data in 'data' state (which we have from small load).

                // setDataStatus('syncing_full'); // Optional, might cause flickers if logic relies on it?
                // Overview.jsx checks: dataStatus === 'fully_synced' for DB mode.

                console.log("Starting full data background sync...");

                const fetchAndBulkAdd = async (url, table) => {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
                    const json = await res.json();
                    await table.clear();
                    await table.bulkAdd(json);
                    console.log(`Synced ${table.name}: ${json.length} items`);
                    return json.length;
                };

                await Promise.all([
                    fetchAndBulkAdd('/vajra_products.json', db.products),
                    fetchAndBulkAdd('/vajra_orders.json', db.orders),
                    fetchAndBulkAdd('/vajra_order_returns.json', db.returns),
                    fetchAndBulkAdd('/vajra_customers.json', db.customers),
                    fetchAndBulkAdd('/vajra_order_items.json', db.orderItems)
                ]);

                setDataStatus('fully_synced');
                console.log("Full data synced to IndexedDB!");

            } catch (err) {
                console.error("Sync failed:", err);
            }
        };

        // Initialize only once
        initData();

    }, []);

    // We expose 'db' so components can query it directly if they want, 
    // effectively bypassing the context state for heavy lifting.
    return (
        <DataContext.Provider value={{ ...data, loading, dataStatus, error, syncProgress, db }}>
            {children}
        </DataContext.Provider>
    );
};
