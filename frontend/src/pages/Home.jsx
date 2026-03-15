import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-blue-50 text-slate-900">
      {/* 1️⃣ Hero Section */}
      <header className="border-b border-blue-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo + headline */}
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-lg shadow-amber-500/40">
                  <span className="text-2xl">🛢️</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/90">
                    Opti-Oil
                  </p>
                  <p className="text-sm font-medium text-slate-600">
                    Smart Oil Distribution Cloud
                  </p>
                </div>
              </div>

              {/* Top-right login shortcuts */}
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  to="/login"
                  className="rounded-full border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:border-blue-400 hover:text-blue-800 bg-white/80"
                >
                  Admin Login
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:border-blue-400 hover:text-blue-800 bg-white/80"
                >
                  Wholesaler Login
                </Link>
                <Link
                  to="/supplier/login"
                  className="rounded-full border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:border-blue-400 hover:text-blue-800 bg-white/80"
                >
                  Supplier Login
                </Link>
              </div>
            </div>

            <div className="mt-2 max-w-2xl space-y-4">
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
                Manage your edible oil supply chain from one intelligent platform.
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-slate-600">
                Track inventory, coordinate suppliers, and process wholesale orders in real time.
              </p>
            </div>

            {/* Hero CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-amber-300"
              >
                Login as Admin
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-sky-500/90 px-5 py-2.5 text-sm font-semibold text-slate-50 hover:bg-sky-400"
              >
                Login as Wholesaler
              </Link>
              <Link
                to="/supplier/login"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500/90 px-5 py-2.5 text-sm font-semibold text-slate-50 hover:bg-emerald-400"
              >
                Login as Supplier
              </Link>
            </div>
          </div>

          {/* Simple dashboard-style preview block */}
          <div className="mt-6 w-full max-w-md flex-1 rounded-2xl border border-blue-100 bg-white p-4 shadow-lg lg:mt-0">
            <p className="text-xs font-semibold text-slate-600">Dashboard preview</p>
            <div className="mt-3 space-y-2 rounded-xl bg-blue-50 p-3">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Today&apos;s orders</span>
                <span className="font-semibold text-emerald-300">32</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Warehouses online</span>
                <span className="font-semibold text-sky-300">5</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Suppliers connected</span>
                <span className="font-semibold text-amber-300">12</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* 2️⃣ Live Operations Section */}
        <section className="border-b border-blue-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-500">
              Live Operations Overview
            </h2>
            <div className="mt-5 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm sm:grid-cols-4">
              <div className="flex flex-col gap-1 rounded-xl bg-white p-3">
                <span className="text-xs text-slate-500">Optimal Stock Coverage</span>
                <span className="text-lg font-semibold text-blue-700">98%</span>
              </div>
              <div className="flex flex-col gap-1 rounded-xl bg-white p-3">
                <span className="text-xs text-slate-500">Orders Processing</span>
                <span className="text-lg font-semibold text-blue-700">32</span>
              </div>
              <div className="flex flex-col gap-1 rounded-xl bg-white p-3">
                <span className="text-xs text-slate-500">Active Suppliers</span>
                <span className="text-lg font-semibold text-blue-700">12</span>
              </div>
              <div className="flex flex-col gap-1 rounded-xl bg-white p-3">
                <span className="text-xs text-slate-500">Inventory Health</span>
                <span className="text-lg font-semibold text-blue-700">Good</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3️⃣ Workflow Visualization */}
        <section className="border-b border-blue-100 bg-blue-50 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-4 text-slate-900">
            <h2 className="text-lg font-semibold text-blue-950">
              End-to-End Oil Flow Management
            </h2>
            <p className="text-sm text-slate-700">
              Supplier → Warehouse → Production → Wholesaler
            </p>

            <div className="mt-4 grid gap-4 rounded-2xl border border-blue-100 bg-white p-4 text-sm sm:grid-cols-4">
              <div className="space-y-1 rounded-xl bg-blue-50 p-3">
                <p className="font-semibold text-blue-900">Supplier</p>
                <p className="text-xs text-slate-700">Raw materials</p>
              </div>
              <div className="space-y-1 rounded-xl bg-blue-50 p-3">
                <p className="font-semibold text-blue-900">Production / Warehouse</p>
                <p className="text-xs text-slate-700">Storage and processing</p>
              </div>
              <div className="space-y-1 rounded-xl bg-blue-50 p-3">
                <p className="font-semibold text-blue-900">Finished Oil Inventory</p>
                <p className="text-xs text-slate-700">Ready for dispatch</p>
              </div>
              <div className="space-y-1 rounded-xl bg-blue-50 p-3">
                <p className="font-semibold text-blue-900">Wholesaler Orders</p>
                <p className="text-xs text-slate-700">Bulk order fulfillment</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4️⃣ Role-Based System Section */}
        <section className="border-b border-blue-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-lg font-semibold text-blue-950">Role-based dashboards</h2>
            <p className="mt-2 text-sm text-slate-700">
              Clear workspaces for admins, wholesalers, and suppliers.
            </p>

            <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-xl text-blue-900">👑 Admin Control Center</p>
                <ul className="space-y-1 text-slate-700">
                  <li>• Manage products</li>
                  <li>• Monitor inventory</li>
                  <li>• Approve orders</li>
                  <li>• Track suppliers</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-xl text-blue-900">🏬 Wholesaler Portal</p>
                <ul className="space-y-1 text-slate-700">
                  <li>• Browse products</li>
                  <li>• Place bulk orders</li>
                  <li>• Track deliveries</li>
                  <li>• View order history</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-xl text-blue-900">🚚 Supplier Dashboard</p>
                <ul className="space-y-1 text-slate-700">
                  <li>• Manage raw materials</li>
                  <li>• View purchase orders</li>
                  <li>• Update deliveries</li>
                  <li>• Track payments</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5️⃣ Feature Highlights */}
        <section className="border-b border-blue-100 bg-blue-50 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-lg font-semibold text-blue-950">Key features</h2>

            <div className="mt-6 grid gap-4 text-sm md:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="mb-1 text-xl text-blue-900">📦 Smart Inventory</p>
                <p className="text-slate-700">
                  Monitor stock levels in real time and prevent shortages with automated alerts.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="mb-1 text-xl text-blue-900">🛒 Connected Ordering</p>
                <p className="text-slate-700">
                  Link suppliers, admins, and wholesalers in one seamless order pipeline.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="mb-1 text-xl text-blue-900">📊 Analytics &amp; Insights</p>
                <p className="text-slate-700">
                  Track sales trends, inventory movement, and supplier performance.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="mb-1 text-xl text-blue-900">🤖 AI Assistant</p>
                <p className="text-slate-700">
                  Ask questions about sales, inventory, and orders using the built-in AI chatbot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6️⃣ Platform Benefits Section */}
        <section className="border-b border-blue-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-lg font-semibold text-blue-950">
              Built for modern oil distribution businesses
            </h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-slate-700">
                Real-time data synchronization
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-slate-700">
                Centralized supply chain management
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-slate-700">
                Automated inventory monitoring
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-slate-700">
                Secure payment and transaction tracking
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7️⃣ Footer Section */}
      <footer className="bg-white px-4 py-8 text-xs text-slate-500 sm:px-6 lg:px-8 border-t border-blue-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">Opti-Oil</p>
            <p className="text-xs text-slate-500">Smart Oil Distribution Platform</p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <Link to="/login" className="text-blue-700 hover:text-blue-900">
              Admin Login
            </Link>
            <Link to="/supplier/login" className="text-blue-700 hover:text-blue-900">
              Supplier Portal
            </Link>
            <Link to="/login" className="text-blue-700 hover:text-blue-900">
              Wholesaler Portal
            </Link>
            <button type="button" className="text-slate-600 hover:text-slate-800">
              About
            </button>
            <button type="button" className="text-slate-600 hover:text-slate-800">
              Contact
            </button>
            <button type="button" className="text-slate-600 hover:text-slate-800">
              Privacy
            </button>
          </div>

          <p className="text-[0.7rem] text-slate-600">© 2026 Opti-Oil</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
