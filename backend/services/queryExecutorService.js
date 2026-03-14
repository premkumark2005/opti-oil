import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import RawMaterial from '../models/RawMaterial.js';
import RawMaterialOrder from '../models/RawMaterialOrder.js';
import User from '../models/User.js';
import { Logger } from '../utils/logger.js';

const models = {
  orders: Order,
  products: Product,
  inventory: Inventory,
  rawmaterials: RawMaterial,
  rawmaterialorders: RawMaterialOrder,
  suppliers: User,
  users: User
};

// MongoDB aggregation/query operator keys that should not be recursed into
const MONGO_OPERATORS = new Set(['$expr', '$lte', '$gte', '$lt', '$gt', '$eq', '$ne', '$in', '$nin', '$and', '$or', '$not', '$elemMatch', '$all', '$group', '$match', '$sort', '$limit', '$unwind', '$project', '$sum', '$avg', '$min', '$max', '$first', '$last', '$push', '$addToSet', '$lookup', '$unwind']);

function isMongoOperatorKey(key) {
  return key.startsWith('$');
}

function processFilterDates(filter) {
  if (!filter) return {};
  if (Array.isArray(filter)) {
    // Arrays in mongo operators (like $lte args) should be left as-is
    return filter;
  }
  if (typeof filter !== 'object') return filter;

  const processed = {};
  for (const [key, value] of Object.entries(filter)) {
    if (value === 'today') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      processed[key] = { $gte: start, $lte: end };
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recurse into nested objects (e.g. $expr: { $lte: [...] })
      // But preserve the inner structure as-is since mongo operators handle arrays themselves
      processed[key] = processFilterDates(value);
    } else {
      processed[key] = value;
    }
  }
  return processed;
}

export const executeDataQuery = async (queryObj) => {
  const { collection, operation, filter } = queryObj;
  const Model = models[collection.toLowerCase()];
  
  if (!Model) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  const processedFilter = processFilterDates(filter);

  switch (operation.toLowerCase()) {
    case 'find':
      let query = Model.find(processedFilter).limit(50);
      if (collection.toLowerCase() === 'inventory') query = query.populate('product', 'name basePrice');
      if (collection.toLowerCase() === 'orders') query = query.populate('wholesaler', 'name');
      if (collection.toLowerCase() === 'rawmaterialorders') query = query.populate('rawMaterial', 'name');
      return await query.lean();
    case 'count':
      return await Model.countDocuments(processedFilter);
    case 'sum':
    case 'aggregate':
      if (Array.isArray(processedFilter)) {
         return await Model.aggregate(processedFilter);
      } else {
         return await Model.aggregate([{ $match: processedFilter }]);
      }
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};
