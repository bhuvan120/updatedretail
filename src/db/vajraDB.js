import Dexie from 'dexie';

export const db = new Dexie('VajraRetailDB');

// Version 1: Initial schema (had incorrect customer key)
// Version 2: Fixed customer key to 'customer_id' to match JSON
db.version(2).stores({
    products: 'product_id, product_category, product_brand, product_department, is_product_active',
    orders: 'order_id, customer_id, order_status, order_date',
    returns: 'return_id, order_id',
    customers: 'customer_id, customer_email, customer_full_name', // Fixed key
    orderItems: 'order_item_id, order_id, product_id'
}).upgrade(tx => {
    // Optional: clear old data if needed, but version change usually handles store recreation if keys differ
    // or we can explicitly clear to force re-sync
    return tx.table('customers').clear();
});

export const clearDatabase = async () => {
    await db.delete();
    await db.open();
};
