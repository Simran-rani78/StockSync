import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  Layers,
  Heart,
  ShoppingBag
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    { name: 'Portal Home', href: '/portal/customer', icon: LayoutDashboard, roles: ['Customer'] },
    { name: 'Catalog Explorer', href: '/catalog', icon: Package, roles: ['Customer'] },
    { name: 'Products List', href: '/products', icon: Package, roles: ['Admin', 'Staff'] },
    { name: 'Order Logs', href: '/orders', icon: ShoppingCart, roles: ['Admin', 'Staff', 'Customer'] },
    { name: 'Inventory Registry', href: '/inventory', icon: ClipboardList, roles: ['Admin', 'Staff'] },
    { name: 'Shopping Cart', href: '/cart', icon: ShoppingBag, roles: ['Customer'] },
    { name: 'Saved Wishlist', href: '/wishlist', icon: Heart, roles: ['Customer'] },
  ].filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Return standard sidebar layout for all roles
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col glass border-r border-slate-800/60 z-20">
        <div className="flex h-16 items-center px-6 gap-2.5 border-b border-slate-800/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 shadow-md shadow-brand-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              StockSync
            </span>
            <span className="text-[10px] block font-semibold text-brand-400 tracking-wider uppercase -mt-0.5">
              B2B Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navigation.map((item) => {
            const Active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  Active
                    ? 'bg-brand-500/10 text-brand-455 border-l-4 border-brand-500 shadow-inner'
                    : 'text-slate-450 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${Active ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-slate-800/40">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800/30 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-brand-400">
              <UserIcon className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                user?.role === 'Admin' 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : user?.role === 'Staff'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-455 rounded-xl transition duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="relative flex w-full max-w-xs flex-col bg-slate-900 border-r border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Layers className="h-6 w-6 text-brand-500" />
                <span className="text-lg font-bold text-slate-100">StockSync</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const Active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium ${
                      Active
                        ? 'bg-brand-500/10 text-brand-400 border-l-4 border-brand-500'
                        : 'text-slate-450 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-800 pt-6 mt-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-brand-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-400 uppercase font-medium">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-455 rounded-xl transition"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between px-6 glass-panel border-b border-slate-800/40 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-slate-200 md:text-lg">
              {navigation.find(item => isActive(item.href))?.name || 'StockSync System'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="mr-1" />
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
              <span className="text-[10px] text-brand-400 font-bold uppercase mt-0.5 tracking-wider">{user?.role}</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-bold flex items-center justify-center text-xs uppercase shadow shadow-brand-500/10">
              {user?.name ? user.name.substring(0, 2) : 'SS'}
            </div>
          </div>
        </header>

        {/* Main Content Scroll Wrap */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
