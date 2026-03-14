export const formatResponse = (collection, operation, result) => {
  if (result === null || result === undefined || (Array.isArray(result) && result.length === 0)) {
    return "No records found for the requested query.";
  }

  if (operation === 'count') {
     return `There is/are ${result} record(s) matching your query in ${collection}.`;
  }

  if (Array.isArray(result)) {
     if (operation === 'aggregate') {
         if (result.length === 1 && result[0] && typeof result[0] === 'object' && result[0]._id === null) {
             const keys = Object.keys(result[0]).filter(k => k !== '_id');
             if (keys.length === 1) {
                const val = result[0][keys[0]];
                const num = Number(val);
                if (!isNaN(num)) {
                   const valStr = num % 1 !== 0 ? num.toFixed(2) : num;
                   return `Total ${keys[0]}: ${keys[0].toLowerCase().includes('amount') || keys[0].toLowerCase().includes('revenue') || keys[0].toLowerCase().includes('price') || keys[0].toLowerCase().includes('total') && num > 100 ? '$'+valStr : valStr}.`;
                }
             }
         }
         if (result.length === 1 && result[0] && typeof result[0] === 'object' && Object.keys(result[0]).length <= 2) {
            return `Result: ${JSON.stringify(result[0])}`;
         }
         return `Aggregate result: ${JSON.stringify(result).substring(0, 150)}...`;
     }

     if (collection === 'inventory' || collection === 'rawmaterialinventory') {
        const lines = result.map(r => {
           const name = r.product?.name || r.rawMaterial?.name || 'Item';
           return `${name} inventory: ${r.availableQuantity} units available.`;
        });
        return lines.join('\n');
     }
     
     if (collection === 'orders' || collection === 'rawmaterialorders') {
        const lines = result.map(r => `Order ${r.orderNumber || r._id} (Status: ${r.orderStatus || r.status || 'Unknown'})`);
        return `Found ${result.length} orders: ${lines.join(', ')}`;
     }

     if (collection === 'products' || collection === 'rawmaterials') {
        const lines = result.map(r => `${r.name}: priced at $${r.basePrice || r.pricePerUnit || 0}`);
        return lines.join('\n');
     }

     if (collection === 'users' || collection === 'suppliers') {
        const lines = result.map(r => `${r.name} (${r.role || 'user'}) - ${r.email || r.companyName || 'No email'}`);
        return `Found ${result.length} users/suppliers:\n${lines.join('\n')}`;
     }
  }

  // Fallback serialization
  return `Found records. Here is a summary: ${JSON.stringify(result).substring(0, 150)}...`;
};
