const fs = require('fs');
const path = require('path');

// Try to find the large files. Based on sizes:
// 58MB -> likely order_items or orders?
// 36MB -> likely orders?
// 15MB -> likely products?

// Let's guess names from common conventions or list from previous turns.
// vajra_orders.json is likely one of them.
// Let's iterate directory to find JSONs.

const dir = path.join(__dirname, 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

console.log("JSON Files:", files);

files.forEach(f => {
    if (f.includes('order') && !f.includes('small') && !f.includes('items')) {
        try {
            console.log(`Reading ${f}...`);
            // Read first 5MB to get a sample if too large? 
            // Or just read whole thing if < 50MB. 36MB is fine for node.
            const content = fs.readFileSync(path.join(dir, f), 'utf8');
            const data = JSON.parse(content);
            if (Array.isArray(data) && data.length > 0 && data[0].order_status) {
                const statuses = {};
                data.forEach(o => statuses[o.order_status] = (statuses[o.order_status] || 0) + 1);
                console.log(`Statuses in ${f}:`, statuses);
            }
        } catch (e) {
            console.log(`Error reading ${f}: ${e.message}`);
        }
    }
});
