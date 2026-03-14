# 🚀 Quick Start Guide - Supplier Portal

## ⚡ Start the Application

### Backend
```bash
cd backend
npm start
```
✅ Backend running on: **http://localhost:5000**

### Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on: **http://localhost:5173**

---

## 🎯 Quick Test (5 Minutes)

### Step 1: Register Supplier (1 min)
1. Visit: http://localhost:5173/supplier/signup
2. Fill form with any data
3. Click "Register"
4. ✅ See: "Your account is pending admin approval"

### Step 2: Admin Approves Supplier (1 min)
1. Visit: http://localhost:5173/login
2. Login as admin (your existing admin credentials)
3. Click "Supplier Users" in sidebar (new menu item)
4. Click "Approve" on the pending supplier
5. ✅ Status changes to "Approved"

### Step 3: Supplier Adds Raw Material (1 min)
1. Visit: http://localhost:5173/supplier/login
2. Login with supplier credentials
3. Click "Raw Materials" in sidebar
4. Click "+ Add Raw Material"
5. Fill form:
   - Name: "Sunflower Seeds"
   - Category: "Seeds"
   - Unit: "kg"
   - Price: 85
   - Quantity: 5000
6. Click "Create"
7. ✅ Material appears in table

### Step 4: Admin Orders Raw Material (1 min)
1. Switch to admin panel (or open new tab)
2. Click "Raw Materials" in admin sidebar (new menu item)
3. Find "Sunflower Seeds" card
4. Click "Place Order"
5. Enter Quantity: 1000
6. Click "Place Order"
7. ✅ Order placed successfully

### Step 5: Supplier Delivers Order (1 min)
1. Switch back to supplier panel
2. Click "Orders" in sidebar
3. Find the order (RMO-...)
4. Click "Confirm" → Status becomes "confirmed"
5. Click "Mark as Delivered"
6. Confirm the dialog
7. ✅ Status becomes "delivered"
8. ✅ Supplier dashboard shows revenue

### Step 6: Admin Checks Inventory
1. Switch to admin panel
2. Click "Raw Inventory" in sidebar (new menu item)
3. ✅ See "Sunflower Seeds" with quantity 1000 kg
4. Click "Show History"
5. ✅ See transaction: "Order RMO-... delivered"

---

## ✅ Success Indicators

If you see all these, everything works:

- ✅ Supplier can register and needs approval
- ✅ Admin can approve suppliers
- ✅ Supplier can create raw materials
- ✅ Admin can browse and order materials
- ✅ Supplier can confirm and deliver orders
- ✅ Inventory auto-updates on delivery
- ✅ Dashboard statistics update correctly
- ✅ All pages load without errors

---

## 📊 What's Available

### Supplier Features
- **Dashboard**: Statistics, widgets, charts
- **Raw Materials**: CRUD operations, filters
- **Orders**: View, confirm, deliver orders
- **Profile**: Update info, change password

### Admin Features  
- **Supplier Users**: Approve/reject/manage suppliers
- **Raw Materials**: Browse catalog, place orders
- **Raw Inventory**: Stock in/out/adjust, transaction history

---

## 🔗 All Routes

### Public
- http://localhost:5173/supplier/signup
- http://localhost:5173/supplier/login

### Supplier (Protected)
- http://localhost:5173/supplier/dashboard
- http://localhost:5173/supplier/raw-materials
- http://localhost:5173/supplier/orders
- http://localhost:5173/supplier/profile

### Admin (Protected - New Items)
- http://localhost:5173/admin/supplier-management
- http://localhost:5173/admin/raw-material-ordering
- http://localhost:5173/admin/raw-material-inventory

---

## 📝 Next Steps

1. ✅ Complete the 5-minute quick test above
2. 📖 Read `TESTING_GUIDE.md` for comprehensive testing (40+ test cases)
3. 📚 Read `IMPLEMENTATION_COMPLETE.md` for full feature list
4. 🎓 Explore all pages and features
5. 🐛 Report any issues found

---

## 🆘 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm start
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### Database connection error
- Check MongoDB is running
- Check connection string in backend/.env

### Cannot login
- Check user exists in database
- Check user status is "approved" (for suppliers)
- Check password is correct

### Pages not loading
- Check browser console for errors (F12)
- Clear browser cache and reload
- Check all files are created (41 total)

---

## 📞 Support

For detailed testing and troubleshooting:
- **Complete Testing Guide**: `TESTING_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_COMPLETE.md`
- **Previous Guide**: `SUPPLIER_PORTAL_IMPLEMENTATION.md`

---

**Everything is ready! Start with the 5-minute quick test above.** ⚡

*Total Setup Time: 2 minutes*
*Total Test Time: 5 minutes*
*Total Files: 41 (created/modified)*
