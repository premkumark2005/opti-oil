export const validateRoleAccess = (collection, filter, user) => {
  const role = user.role;
  const userId = user.id;

  const isArrayFilter = Array.isArray(filter);
  let safeFilter = isArrayFilter ? [...filter] : { ...(filter || {}) };
  let matchStage = {};

  switch (collection.toLowerCase()) {
    case 'orders':
      if (role === 'wholesaler') {
        matchStage.wholesaler = userId;
      } else if (role === 'supplier') {
        throw new Error("Suppliers cannot access orders collection.");
      }
      break;
    
    case 'products':
      // Currently, anyone can view active products.
      matchStage.isActive = true;
      break;

    case 'inventory':
      if (role === 'supplier') {
         throw new Error("Suppliers cannot view product inventory.");
      }
      break;

    case 'rawmaterials':
      if (role === 'supplier') {
        matchStage.supplier = userId;
      } else if (role === 'wholesaler') {
        throw new Error("Wholesalers cannot access raw materials.");
      }
      break;
      
    case 'rawmaterialorders':
      if (role === 'supplier') {
        matchStage.supplier = userId;
      } else if (role === 'wholesaler') {
        throw new Error("Wholesalers cannot access raw material orders.");
      }
      break;

    case 'suppliers':
    case 'users':
    case 'production':
      // Assume production and supplier tracking requires admin
      if (role !== 'admin') {
         throw new Error(`Role ${role} cannot access ${collection}.`);
      }
      break;
      
    default:
      throw new Error(`Collection ${collection} is not accessible.`);
  }

  if (isArrayFilter) {
    if (Object.keys(matchStage).length > 0) {
      safeFilter.unshift({ $match: matchStage });
    }
  } else {
    Object.assign(safeFilter, matchStage);
  }

  return safeFilter;
};
