import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  TrendingUp, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await API.get('/dashboard/stats');
        const { stats, salesAnalytics, recentOrders, lowStockList } = response.data;
        setStats(stats);
        setSalesAnalytics(salesAnalytics);
        setRecentOrders(recentOrders);
        setLowStockList(lowStockList);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to fetch dashboard intelligence. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 rounded-2xl border border-red-500/20 max-w-xl mx-auto text-center my-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-100">Data Fetch Failed</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 transition rounded-xl text-sm font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = [
    {
      name: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      gradient: 'from-blue-600/20 to-cyan-600/5 border-blue-500/20',
      iconColor: 'text-blue-400',
      description: 'SKUs cataloged'
    },
    {
      name: 'Orders Today',
      value: stats?.ordersToday ?? 0,
      icon: ShoppingCart,
      gradient: 'from-amber-600/20 to-orange-600/5 border-amber-500/20',
      iconColor: 'text-amber-400',
      description: 'Placed today'
    },
    {
      name: 'Completed Revenue',
      value: `$${(stats?.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: 'from-emerald-600/20 to-teal-600/5 border-emerald-500/20',
      iconColor: 'text-emerald-400',
      description: 'Settled funds'
    },
    {
      name: 'Low Stock Alerts',
      value: stats?.lowStockProducts ?? 0,
      icon: AlertTriangle,
      gradient: stats?.lowStockProducts > 0 
        ? 'from-rose-600/20 to-pink-650/5 border-rose-500/25 animate-pulse'
        : 'from-slate-600/20 to-slate-600/5 border-slate-500/20',
      iconColor: stats?.lowStockProducts > 0 ? 'text-rose-400' : 'text-slate-400',
      description: 'SKUs < 10 units'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Analytics Overview</h2>
          <p className="text-sm text-slate-400">Welcome to the StockSync dashboard. Here is your inventory and order status today.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.name}
              className={`glass rounded-2xl p-6 border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] shadow-xl ${kpi.gradient}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">{kpi.name}</span>
                <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800 ${kpi.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-slate-100">{kpi.value}</span>
                <p className="text-xs text-slate-500 mt-1 font-medium">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend Chart */}
        <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100">Revenue Analytics</h3>
              <p className="text-xs text-slate-400">Trend of completed orders revenue (7 days)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
              Live Updates
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6380ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6380ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#6380ff" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Volume Chart */}
        <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100">Order Volumetrics</h3>
              <p className="text-xs text-slate-400">Daily placed order volumes (7 days)</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <Clock className="h-3.5 w-3.5" />
              Real Time
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value) => [value, 'Orders']}
                />
                <Bar dataKey="orders" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Lower Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Log Table */}
        <div className="glass lg:col-span-2 p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-100">Recent Purchase Orders</h3>
              <p className="text-xs text-slate-400">Log of newest client orders in system</p>
            </div>
            <Link 
              to="/orders" 
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group"
            >
              Order Desk
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 px-4">Client</th>
                  <th className="pb-3 px-4 text-right">Amount</th>
                  <th className="pb-3 pl-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                      No customer orders logged yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusColors = {
                      Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                      Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
                    };
                    return (
                      <tr key={order.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-3.5 pr-4 font-mono text-xs text-slate-400 select-all truncate max-w-[80px]">
                          #{order.id.substring(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-300">
                          {order.user?.name}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-200">
                          ${parseFloat(order.totalPrice).toFixed(2)}
                        </td>
                        <td className="py-3.5 pl-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock alerts panel */}
        <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-100">Critical Restock Alerts</h3>
              <p className="text-xs text-slate-400">Inventory levels falling below 10 units</p>
            </div>
            <Link 
              to="/inventory" 
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
            >
              Reorder Desk
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {lowStockList.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-450 font-semibold">All products fully stocked!</p>
              </div>
            ) : (
              lowStockList.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10"
                >
                  <div className="overflow-hidden pr-2">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{product.name}</h4>
                    <span className="text-[10px] text-slate-450 block font-mono mt-0.5">{product.sku}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-rose-400">{product.quantity}</span>
                    <span className="text-[9px] block text-slate-500 font-semibold uppercase">left</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
