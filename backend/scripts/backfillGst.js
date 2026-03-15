import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import RawMaterialOrder from '../models/RawMaterialOrder.js';

dotenv.config({ path: './.env' });

const backfill = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Backfill Products (ensure gstRate exists)
        const products = await Product.find({ gstRate: { $exists: false } });
        console.log(`Found ${products.length} products missing gstRate field.`);
        for (const p of products) {
            p.gstRate = 0;
            await p.save();
        }

        // 2. Backfill Wholesale Orders
        const orders = await Order.find();
        console.log(`Processing ${orders.length} Wholesale Orders...`);
        let updatedOrders = 0;
        for (const order of orders) {
            let totalBase = 0;
            let totalGst = 0;
            let changed = false;
            
            for (const item of order.items) {
                // If it's an old order, gstRate might be undefined or 0
                // We'll try to update it only if it seems empty
                if (item.gstRate === undefined || item.gstRate === null) {
                    const prod = await Product.findById(item.product);
                    item.gstRate = prod?.gstRate || 0;
                    changed = true;
                }
                
                // Recalculate derived fields
                const subtotal = item.quantity * item.unitPrice;
                const gstAmount = (subtotal * (item.gstRate || 0)) / 100;
                
                if (item.subtotal !== subtotal || item.gstAmount !== gstAmount) {
                    item.subtotal = subtotal;
                    item.gstAmount = gstAmount;
                    changed = true;
                }
                
                totalBase += subtotal;
                totalGst += gstAmount;
            }
            
            const total = totalBase + totalGst;
            if (order.baseTotalAmount !== totalBase || order.totalGstAmount !== totalGst || order.totalAmount !== total) {
                order.baseTotalAmount = totalBase;
                order.totalGstAmount = totalGst;
                order.totalAmount = total;
                changed = true;
            }
            
            if (changed) {
                await order.save();
                updatedOrders++;
            }
        }
        console.log(`Updated ${updatedOrders} Wholesale Orders with correct GST calculations.`);

        // 3. Backfill Raw Material Orders
        const rmOrders = await RawMaterialOrder.find();
        console.log(`Processing ${rmOrders.length} Raw Material Orders...`);
        let updatedRMOrders = 0;
        for (const order of rmOrders) {
            let changed = false;
            const baseTotal = order.quantityOrdered * order.pricePerUnit;
            const gst = (baseTotal * (order.gstRate || 0)) / 100;
            const total = baseTotal + gst;

            if (order.baseTotalAmount !== baseTotal || order.gstAmount !== gst || order.totalPrice !== total) {
                order.baseTotalAmount = baseTotal;
                order.gstAmount = gst;
                order.totalPrice = total;
                changed = true;
            }

            if (changed) {
                await order.save();
                updatedRMOrders++;
            }
        }
        console.log(`Updated ${updatedRMOrders} Raw Material Orders with correct GST calculations.`);

        console.log('🚀 GST Backfill complete! All historical data is now consistent.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during backfill:', err);
        process.exit(1);
    }
};

backfill();
