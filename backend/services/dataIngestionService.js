import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import RawMaterial from '../models/RawMaterial.js';
import RawMaterialInventory from '../models/RawMaterialInventory.js';
import RawMaterialOrder from '../models/RawMaterialOrder.js';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';

function safe(val, fallback = 'N/A') {
  return val !== undefined && val !== null ? String(val) : fallback;
}

export const ingestAllData = async () => {
  const chunks = [];

  // ── PRODUCTS ──────────────────────────────────────────────
  const products = await Product.find({ isActive: true }).lean();
  for (const p of products) {
    chunks.push({
      text: `Product: ${safe(p.name)}\nCategory: ${safe(p.category)}\nBase Price: $${safe(p.basePrice)}\nUnit: ${safe(p.unit)}\nDescription: ${safe(p.description)}\nStatus: ${p.isActive ? 'Active' : 'Inactive'}`,
      metadata: { collection: 'products', roleAccess: ['admin', 'wholesaler', 'supplier'], id: String(p._id) }
    });
  }

  // ── INVENTORY ─────────────────────────────────────────────
  const inventories = await Inventory.find().populate('product', 'name unit').lean();
  for (const inv of inventories) {
    chunks.push({
      text: `Product Inventory: ${safe(inv.product?.name)}\nAvailable Quantity: ${safe(inv.availableQuantity)} ${safe(inv.product?.unit)}\nReorder Level: ${safe(inv.reorderLevel)} ${safe(inv.product?.unit)}\nLow Stock: ${inv.availableQuantity <= inv.reorderLevel ? 'Yes' : 'No'}`,
      metadata: { collection: 'inventory', roleAccess: ['admin', 'wholesaler'], id: String(inv._id) }
    });
  }

  // ── ORDERS ────────────────────────────────────────────────
  const orders = await Order.find().populate('wholesaler', 'name businessName').lean();
  for (const o of orders) {
    const itemsSummary = (o.items || []).map(i => `${safe(i.productName)} x${safe(i.quantity)} @ $${safe(i.unitPrice)}`).join('; ');
    chunks.push({
      text: `Order: ${safe(o.orderNumber)}\nWholesaler: ${safe(o.wholesaler?.name)} (${safe(o.wholesaler?.businessName)})\nStatus: ${safe(o.orderStatus)}\nTotal Amount: $${safe(o.totalAmount)}\nItems: ${itemsSummary || 'N/A'}\nDate: ${o.createdAt ? new Date(o.createdAt).toDateString() : 'N/A'}`,
      metadata: { collection: 'orders', roleAccess: ['admin'], wholesalerId: String(o.wholesaler?._id || ''), id: String(o._id) }
    });
  }

  // ── RAW MATERIALS ─────────────────────────────────────────
  const rawMaterials = await RawMaterial.find().populate('supplier', 'name companyName').lean();
  for (const rm of rawMaterials) {
    chunks.push({
      text: `Raw Material: ${safe(rm.name)}\nMaterial Type: ${safe(rm.materialType)}\nSupplier: ${safe(rm.supplier?.companyName || rm.supplier?.name)}\nPrice Per Unit: $${safe(rm.pricePerUnit)}\nUnit: ${safe(rm.unit)}\nStatus: ${rm.isActive ? 'Active' : 'Inactive'}`,
      metadata: { collection: 'rawmaterials', roleAccess: ['admin', 'supplier'], supplierId: String(rm.supplier?._id || ''), id: String(rm._id) }
    });
  }

  // ── RAW MATERIAL INVENTORY ────────────────────────────────
  const rmInventory = await RawMaterialInventory.find().lean();
  for (const rmi of rmInventory) {
    chunks.push({
      text: `Raw Material Inventory: ${safe(rmi.materialType)}\nCategory: ${safe(rmi.category)}\nAvailable Quantity: ${safe(rmi.quantity)} ${safe(rmi.unit)}\nReorder Level: ${safe(rmi.reorderLevel)} ${safe(rmi.unit)}\nLow Stock: ${rmi.quantity <= rmi.reorderLevel ? 'Yes' : 'No'}`,
      metadata: { collection: 'rawmaterialinventory', roleAccess: ['admin', 'supplier'], id: String(rmi._id) }
    });
  }

  // ── RAW MATERIAL ORDERS ───────────────────────────────────
  const rmOrders = await RawMaterialOrder.find().populate('supplier', 'name companyName').populate('rawMaterial', 'name').lean();
  for (const rmo of rmOrders) {
    chunks.push({
      text: `Raw Material Order: ${safe(rmo.orderNumber)}\nSupplier: ${safe(rmo.supplier?.companyName || rmo.supplier?.name)}\nMaterial: ${safe(rmo.rawMaterial?.name)}\nQuantity: ${safe(rmo.quantity)}\nStatus: ${safe(rmo.status)}\nDate: ${rmo.orderDate ? new Date(rmo.orderDate).toDateString() : 'N/A'}`,
      metadata: { collection: 'rawmaterialorders', roleAccess: ['admin', 'supplier'], supplierId: String(rmo.supplier?._id || ''), id: String(rmo._id) }
    });
  }

  // ── SUPPLIERS ─────────────────────────────────────────────
  const suppliers = await Supplier.find().lean();
  for (const s of suppliers) {
    chunks.push({
      text: `Supplier: ${safe(s.companyName || s.name)}\nContact: ${safe(s.contactPerson)}\nEmail: ${safe(s.email)}\nPhone: ${safe(s.phone)}\nMaterial Types: ${Array.isArray(s.materialTypes) ? s.materialTypes.join(', ') : 'N/A'}\nStatus: ${safe(s.status)}`,
      metadata: { collection: 'suppliers', roleAccess: ['admin'], id: String(s._id) }
    });
  }

  // ── USERS (wholesalers) ───────────────────────────────────
  const wholesalers = await User.find({ role: 'wholesaler' }).lean();
  for (const w of wholesalers) {
    chunks.push({
      text: `Wholesaler: ${safe(w.name)}\nBusiness: ${safe(w.businessName)}\nEmail: ${safe(w.email)}\nPhone: ${safe(w.phone)}\nStatus: ${safe(w.status)}`,
      metadata: { collection: 'users', roleAccess: ['admin'], id: String(w._id) }
    });
  }

  return chunks;
};
