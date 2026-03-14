import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import RawMaterialInventory from '../models/RawMaterialInventory.js';
import Product from '../models/Product.js';
import RawMaterialOrder from '../models/RawMaterialOrder.js';
import RawMaterial from '../models/RawMaterial.js';
import { Logger } from '../utils/logger.js';

export const executeQuery = async (intent, parameters, user) => {
  try {
    const role = user.role;
    const userId = user.id;

    switch (intent) {
      case 'sales_today':
        if (role !== 'admin') return "You don't have permission to view general sales data.";
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const ordersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
        return `Total sales today: ${ordersToday} orders.`;
      case 'total_orders':
        if (role !== 'admin') return "You don't have permission to view total system orders.";
        const totalOrdersCount = await Order.countDocuments();
        return `There are a total of ${totalOrdersCount} orders in the system.`;

      case 'low_stock_products':
        if (role !== 'admin') return "You don't have permission to view overall low stock products.";
        const inventories = await Inventory.find().populate('product', 'name');
        const lowStock = inventories.filter(inv => inv.availableQuantity <= inv.reorderLevel);
        if (lowStock.length === 0) return "No products are currently low on stock.";
        const productNames = lowStock.map(inv => inv.product?.name).filter(Boolean);
        return `Low stock products: ${productNames.join(', ')}.`;

      case 'low_stock_materials':
        if (role !== 'admin') return "You don't have permission to view low stock materials.";
        const rmInventories = await RawMaterialInventory.find().populate('rawMaterial', 'name');
        const lowStockRm = rmInventories.filter(inv => inv.availableQuantity <= inv.reorderLevel);
        if (lowStockRm.length === 0) return "No raw materials are currently low on stock.";
        const rmNames = lowStockRm.map(inv => inv.rawMaterial?.name).filter(Boolean);
        return `Low stock raw materials: ${rmNames.join(', ')}.`;

      case 'product_inventory':
        if (parameters && parameters.productName) {
            const regex = new RegExp(parameters.productName, 'i');
            const product = await Product.findOne({ name: regex, isActive: true });
            if (!product) return `Product '${parameters.productName}' not found.`;
            
            const inventory = await Inventory.findOne({ product: product._id });
            const qty = inventory ? inventory.availableQuantity : 0;
            
            if (role === 'wholesaler') {
                return qty > 0 ? `${product.name} is available in stock.` : `${product.name} is currently out of stock.`;
            } else {
                return `${product.name} Inventory: ${qty} units available.`;
            }
        } else {
            if (role === 'admin') {
                const totalInventory = await Inventory.aggregate([{ $group: { _id: null, total: { $sum: "$availableQuantity" } } }]);
                return `Total product inventory units: ${totalInventory[0]?.total || 0}.`;
            }
            return "Please specify a product name to check inventory.";
        }

      case 'product_price':
        if (parameters && parameters.productName) {
            const regex = new RegExp(parameters.productName, 'i');
            const product = await Product.findOne({ name: regex, isActive: true });
            if (!product) return `Product '${parameters.productName}' not found.`;
            return `The price of ${product.name} is $${product.basePrice}.`;
        }
        return "Please specify a product name to check the price.";

      case 'user_orders':
        if (role === 'wholesaler') {
            const wOrders = await Order.countDocuments({ wholesaler: userId });
            const lastwOrder = await Order.findOne({ wholesaler: userId }).sort({ createdAt: -1 });
            if (!lastwOrder) return "You haven't placed any orders yet.";
            return `You have ${wOrders} total orders. Your last order is ${lastwOrder.orderStatus || lastwOrder.status}.`;
        } else if (role === 'supplier') {
            const sOrders = await RawMaterialOrder.countDocuments({ supplier: userId });
            const lastSOrder = await RawMaterialOrder.findOne({ supplier: userId }).sort({ createdAt: -1 });
            if (!lastSOrder) return "You haven't received any orders yet.";
            return `You have ${sOrders} total orders. Your last order is ${lastSOrder.status}.`;
        }
        return "I can only check personal orders for wholesalers and suppliers.";

      case 'supplier_orders':
        if (role === 'admin') {
           const openRmOrders = await RawMaterialOrder.countDocuments({ status: { $nin: ['Delivered', 'Cancelled'] } });
           return `There are ${openRmOrders} pending raw material orders.`;
        }
        return "Only admin can view all supplier orders.";

      case 'supplier_materials':
        if (role === 'supplier') {
           const myMaterials = await RawMaterial.countDocuments({ supplier: userId, isActive: true });
           return `You have ${myMaterials} active raw materials listed.`;
        }
        return "Only suppliers can view their own materials.";

      case 'top_ordered_product':
        if (role !== 'admin') {
            return "I can only check the top ordered product for admins.";
        }
        
        try {
            const topProduct = await Order.aggregate([
                { $unwind: "$items" },
                { $group: {
                    _id: "$items.productName",
                    totalQuantity: { $sum: "$items.quantity" }
                }},
                { $sort: { totalQuantity: -1 } },
                { $limit: 1 }
            ]);

            if (topProduct && topProduct.length > 0) {
                return `The most ordered product is ${topProduct[0]._id} with a total of ${topProduct[0].totalQuantity} units ordered.`;
            }
            return "There are no orders to determine the top ordered product.";
        } catch (error) {
            Logger.error("Error finding top product:", error);
            return "There was an error determining the top ordered product.";
        }

      default:
        return "I couldn't understand that request or I don't have access to that data.";
    }
  } catch (error) {
    Logger.error("Chatbot query error:", error);
    return "There was an error processing your request against the database.";
  }
};
