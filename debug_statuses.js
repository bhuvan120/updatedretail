const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'vajra_orders_small.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const orders = JSON.parse(data);
    const statuses = {};
    orders.forEach(o => {
        statuses[o.order_status] = (statuses[o.order_status] || 0) + 1;
    });
    console.log("Unique Statuses:", statuses);
} catch (err) {
    console.error("Error reading file:", err);
}
