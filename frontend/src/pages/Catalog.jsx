import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Layers,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Info,
  CheckCircle
} from 'lucide-react';

const Catalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, selectedCategory]);

  const fetchProducts = async () => {
    try {
      // Public route without token interceptor, but Axios API client handles it.
      // In backend, products endpoint is GET /api/products, which requires authenticateToken.
      // Wait! If GET /api/products requires authenticateToken, can guests view it?
      // Ah! In productRoutes.js:
      // router.get('/', authenticateToken, productController.getProducts);
      // Wait, is GET /api/products public?
      // "Product create/update/delete: Admin only. Customer: browse products".
      // Yes, all authenticated users can view products.
      // If a guest visits the catalog, they need to log in to see products, or we can make the product catalog public by allowing guests to fetch products.
      // Wait, does GET /api/products require login? Yes, because we mapped `router.get('/', authenticateToken, productController.getProducts)`.
      // If we want guests to browse the catalog, we should make the product fetch public (or allow it without JWT)!
      // Let's check: "Customer: browse products. /catalog public page".
      // If /catalog is a public page, then GET /api/products should allow access to guests too! Or, if the token is not present, we can bypass authorization for GET /api/products.
      // Let's modify `productRoutes.js` so that `GET /` is public (does not require authenticateToken, or is optional so if a user is logged in, they can add to cart, but guests can still browse items!).
      // Yes, making GET /api/products and GET /api/products/categories public is extremely logical for a public website catalog!
      // Let's edit `productRoutes.js` to remove `authenticateToken` from the GET endpoints, or we can write a public fetch.
      // Let's remove `authenticateToken` from `router.get('/')` and `router.get('/categories')` so that anyone (guests and customers) can query them. This makes `/catalog` 100% public!
      // That is a brilliant architectural adjustment to make the website public! Let's do that!
      const response = await API.get('/products', {
        params: {
          search: search || undefined,
          categoryId: selectedCategory || undefined
        }
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading public products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/products/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error loading public categories:', err);
    }
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  // Add to Local Storage Cart
  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const cartStr = localStorage.getItem('stocksync_cart') || '[]';
    const cart = JSON.parse(cartStr);
    
    const existingIdx = cart.findIndex(item => item.productId === product.id);
    if (existingIdx > -1) {
      cart[existingIdx].quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl,
        quantity: 1
      });
    }
    
    localStorage.setItem('stocksync_cart', JSON.stringify(cart));
    triggerAlert(`"${product.name}" added to shopping cart!`);
  };

  // Add to Local Storage Wishlist
  const handleAddToWishlist = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const wishStr = localStorage.getItem('stocksync_wishlist') || '[]';
    const wishlist = JSON.parse(wishStr);
    
    if (wishlist.some(item => item.id === product.id)) {
      triggerAlert(`"${product.name}" is already in your wishlist.`);
      return;
    }
    
    wishlist.push(product);
    localStorage.setItem('stocksync_wishlist', JSON.stringify(wishlist));
    triggerAlert(`"${product.name}" saved to wishlist!`);
  };

  const formatImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Floating Website Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-800/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              StockSync
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <Link to="/catalog" className="text-brand-400">Catalog Explorer</Link>
            <Link to="/about" className="hover:text-brand-400 transition">About Us</Link>
            <Link to="/pricing" className="hover:text-brand-400 transition">Pricing Plans</Link>
            <Link to="/contact" className="hover:text-brand-400 transition">Contact Support</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'Admin' ? '/dashboard' : (user.role === 'Staff' ? '/inventory' : '/portal/customer'))}
                className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition duration-200 shadow-md flex items-center gap-1.5"
              >
                Go to Portal
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition duration-200 shadow"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
        {/* Banner */}
        <div className="relative glass p-8 rounded-3xl border border-brand-500/10 bg-gradient-to-tr from-brand-600/5 to-slate-900/40 shadow-xl overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md mb-2 tracking-wider">
              <Sparkles className="h-3 w-3" />
              B2B wholesale pricing
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">StockSync Wholesale Catalog</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">Register an account to purchase items in bulk and track real-time stock levels.</p>
          </div>
          {user?.role === 'Customer' && (
            <Link 
              to="/portal/customer"
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition duration-200 shrink-0 flex items-center gap-1"
            >
              <ShoppingBag className="h-4 w-4 text-brand-400" />
              Open Customer Cart
            </Link>
          )}
        </div>

        {/* Alert message notification banner */}
        {alertMsg && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-brand-500/30 text-xs font-semibold text-brand-400 shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
            {alertMsg}
          </div>
        )}

        {/* Query Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center glass p-4 rounded-2xl border border-slate-800/80 bg-slate-900/10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wholesale products by keyword or SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2.5 min-w-[200px]">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 cursor-pointer outline-none transition"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="flex h-[30vh] flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="mt-4 text-xs text-slate-400">Loading catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass py-20 text-center rounded-2xl border border-slate-800/50">
            <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-200 font-bold text-sm">No Products Listed</h3>
            <p className="text-xs text-slate-500 mt-1">Check back later or register to view catalog updates.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const formattedImage = formatImageSource(product.imageUrl);
              const isLow = product.quantity < 10;
              const isOutOfStock = product.quantity === 0;

              return (
                <div 
                  key={product.id}
                  className="glass rounded-2xl border border-slate-800/80 bg-slate-900/10 overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-300"
                >
                  <div>
                    {/* Image Area */}
                    <div className="h-48 bg-slate-950/50 border-b border-slate-850 flex items-center justify-center overflow-hidden relative">
                      {formattedImage ? (
                        <img src={formattedImage} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Layers className="h-8 w-8 text-slate-700" />
                      )}
                      
                      {/* Stock alerts */}
                      {isOutOfStock ? (
                        <span className="absolute top-4 right-4 px-2.5 py-0.5 bg-red-650/90 text-white text-[9px] font-black uppercase rounded-md shadow">
                          Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="absolute top-4 right-4 px-2.5 py-0.5 bg-rose-500/80 text-white text-[9px] font-black uppercase rounded-md shadow animate-pulse">
                          Low Stock ({product.quantity})
                        </span>
                      ) : null}
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">{product.category?.name || 'N/A'}</span>
                        <span className="text-[10px] text-slate-500 font-mono select-all font-semibold">{product.sku}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-200">{product.name}</h3>
                      <p className="text-[11px] text-slate-450 leading-relaxed line-clamp-2">{product.description || 'No description added.'}</p>
                    </div>
                  </div>

                  {/* Pricing and Action row */}
                  <div className="p-5 pt-0 border-t border-slate-850/40 mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">Wholesale Price</span>
                      {user ? (
                        <span className="text-base font-bold text-slate-100">${parseFloat(product.price).toFixed(2)}</span>
                      ) : (
                        <span className="text-xs text-brand-400 font-bold flex items-center gap-1 leading-none mt-1">
                          <Info className="h-3.5 w-3.5" />
                          Login to view price
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {user?.role === 'Customer' ? (
                        <>
                          <button
                            onClick={() => handleAddToWishlist(product)}
                            className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-455 rounded-lg border border-slate-800 transition"
                            title="Add to Wishlist"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock}
                            className="py-2 px-3 bg-brand-650 hover:bg-brand-500 disabled:bg-brand-850 text-white text-[11px] font-bold rounded-lg transition duration-200 flex items-center gap-1"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Add to Cart
                          </button>
                        </>
                      ) : !user ? (
                        <Link
                          to="/login"
                          className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition duration-200"
                        >
                          Login to Buy
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold italic">Portal view</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
