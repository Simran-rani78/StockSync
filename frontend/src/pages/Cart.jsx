import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  Tag,
  Search,
  Check
} from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickQty, setQuickQty] = useState(1);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickAddError, setQuickAddError] = useState('');

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('stocksync_cart') || '[]');
    setCart(items);
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await API.get('/products');
        setCatalog(response.data);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.relative')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const updateCartStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem('stocksync_cart', JSON.stringify(newCart));
    // Trigger storage event so other components (nav) refresh
    window.dispatchEvent(new Event('storage'));
  };

  const handleQtyChange = (productId, change) => {
    const newCart = cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + change;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });
    updateCartStorage(newCart);
  };

  const handleRemoveItem = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    updateCartStorage(newCart);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setCatalogSearch('');
    setQuickAddError('');
    setQuickQty(1);
  };

  const handleQuickAdd = () => {
    if (!selectedProduct) return;
    if (selectedProduct.quantity < quickQty) {
      setQuickAddError(`Insufficient stock. Only ${selectedProduct.quantity} units available.`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.productId === selectedProduct.id);
    let newCart = [...cart];
    if (existingIndex > -1) {
      const targetQty = newCart[existingIndex].quantity + quickQty;
      if (selectedProduct.quantity < targetQty) {
        setQuickAddError(`Cannot add more. Only ${selectedProduct.quantity} units available in total.`);
        return;
      }
      newCart[existingIndex].quantity = targetQty;
    } else {
      newCart.push({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        price: parseFloat(selectedProduct.price),
        imageUrl: selectedProduct.imageUrl,
        quantity: quickQty
      });
    }
    updateCartStorage(newCart);
    setQuickAddError('');
    setSelectedProduct(null);
    setCatalogSearch('');
    setQuickQty(1);
  };

  const formatImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendBase = apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${url}`;
  };

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const processingFee = subtotal > 0 ? 15.00 : 0; // Flat wholesale delivery fee
  const total = subtotal + tax + processingFee;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header banner */}
      <div>
        <Link to="/catalog" className="text-xs font-semibold text-slate-450 hover:text-slate-200 inline-flex items-center gap-1.5 mb-2 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue Shopping
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Your Shopping Cart</h2>
        <p className="text-xs text-slate-450 mt-0.5">Review items in your basket and prepare wholesale orders.</p>
      </div>

      {cart.length === 0 ? (
        <div className="glass py-24 text-center rounded-3xl border border-slate-850/80 bg-slate-900/5">
          <ShoppingBag className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-200">Your basket is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Explore our catalog of electronics, bakery ingredients, and apparel items to place bulk orders.</p>
          <Link 
            to="/catalog"
            className="mt-6 py-2.5 px-5 bg-brand-650 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition duration-200 inline-block shadow shadow-brand-500/10"
          >
            Go to Catalog Explorer
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const formattedImg = formatImageSource(item.imageUrl);
              return (
                <div 
                  key={item.productId}
                  className="glass p-4 rounded-2xl border border-slate-850/80 bg-slate-900/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 bg-slate-955 rounded-xl border border-slate-850 shrink-0 flex items-center justify-center overflow-hidden">
                      {formattedImg ? (
                        <img src={formattedImg} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-slate-750" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">{item.name}</h4>
                      <span className="text-[9px] text-slate-550 font-mono block mt-0.5 select-all">SKU: {item.sku}</span>
                      <span className="text-xs font-bold text-slate-350 block mt-1.5">${parseFloat(item.price).toFixed(2)} / unit</span>
                    </div>
                  </div>

                  {/* Quantity and delete */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850/80 rounded-xl px-2 py-1">
                      <button 
                        onClick={() => handleQtyChange(item.productId, -1)}
                        className="p-1 hover:bg-slate-800 text-slate-450 hover:text-slate-200 rounded transition"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-300 w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleQtyChange(item.productId, 1)}
                        className="p-1 hover:bg-slate-800 text-slate-450 hover:text-slate-200 rounded transition"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-455 rounded-xl transition border border-slate-850/50"
                      title="Remove product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary card */}
          <div className="glass p-6 rounded-3xl border border-slate-850/80 bg-slate-900/5 space-y-6">
            <h3 className="text-sm font-bold text-slate-350 border-b border-slate-850/50 pb-3">Checkout Summary</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-450">
                <span>Wholesale Subtotal</span>
                <span className="text-slate-300 font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-450">
                <span>State Tax (8%)</span>
                <span className="text-slate-300 font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-450">
                <span>Delivery Processing fee</span>
                <span className="text-slate-300 font-semibold">${processingFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-850 pt-3.5 flex justify-between text-sm font-bold text-slate-200">
                <span>Grand Total</span>
                <span className="text-brand-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Wholesale promo coupon simulated */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-550" />
                <input 
                  type="text" 
                  disabled
                  placeholder="BULKSYNC15 (Inactive)" 
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/40 border border-slate-850 text-[10px] text-slate-500 rounded-lg outline-none cursor-not-allowed"
                />
              </div>
              <button disabled className="px-3 py-2 bg-slate-800 text-[10px] font-bold rounded-lg border border-slate-700 text-slate-500 cursor-not-allowed">Apply</button>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-brand-650 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow shadow-brand-500/10"
            >
              Proceed to Dispatch Details
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Add by SKU Panel */}
      <div className="glass p-6 rounded-3xl border border-slate-850/80 bg-slate-900/5 mt-6">
        <h3 className="text-sm font-bold text-slate-200 mb-1">Quick Add by SKU</h3>
        <p className="text-xs text-slate-450 mb-4">Quickly add products to your wholesale order by searching by SKU or name.</p>
        
        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div className="md:col-span-2 relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search Catalog</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Enter SKU code or product name..."
                value={catalogSearch}
                onChange={(e) => {
                  setCatalogSearch(e.target.value);
                  setDropdownOpen(true);
                  if (selectedProduct) setSelectedProduct(null);
                }}
                onFocus={() => setDropdownOpen(true)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/40 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition"
              />
              {(catalogSearch || selectedProduct) && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Auto-complete Dropdown */}
            {dropdownOpen && catalogSearch && !selectedProduct && (
              <div className="absolute z-30 left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl divide-y divide-slate-800/60">
                {catalog
                  .filter(p => p.sku.toLowerCase().includes(catalogSearch.toLowerCase()) || p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setCatalogSearch(`${p.sku} - ${p.name}`);
                        setDropdownOpen(false);
                        setQuickAddError('');
                      }}
                      className="p-3 text-xs hover:bg-brand-500/10 cursor-pointer flex items-center justify-between transition text-slate-300 hover:text-white"
                    >
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <span className="text-[10px] text-slate-550 font-mono">SKU: {p.sku}</span>
                      </div>
                      <span className="text-[10px] bg-slate-950/60 border border-slate-800 px-2.5 py-0.5 rounded text-brand-400 font-bold">
                        {p.quantity} in stock
                      </span>
                    </div>
                  ))}
                {catalog.filter(p => p.sku.toLowerCase().includes(catalogSearch.toLowerCase()) || p.name.toLowerCase().includes(catalogSearch.toLowerCase())).length === 0 && (
                  <div className="p-3 text-xs text-slate-500 text-center">No matching products found</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Order Quantity</label>
            <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800 rounded-xl p-1 h-[42px] max-w-[140px]">
              <button
                type="button"
                onClick={() => setQuickQty(prev => Math.max(1, prev - 1))}
                className="p-2 hover:bg-slate-800 text-slate-450 hover:text-slate-200 rounded-lg transition"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={quickQty}
                onChange={(e) => setQuickQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 bg-transparent text-center font-mono text-xs font-bold text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuickQty(prev => prev + 1)}
                className="p-2 hover:bg-slate-800 text-slate-450 hover:text-slate-200 rounded-lg transition"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!selectedProduct}
              className={`w-full h-[42px] px-5 text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow ${
                selectedProduct
                  ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/10'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              <Check className="h-4 w-4" />
              Add to Basket
            </button>
          </div>
        </div>

        {quickAddError && (
          <p className="text-[11px] text-rose-450 font-semibold mt-3 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
            {quickAddError}
          </p>
        )}
      </div>
    </div>
  );
};

export default Cart;
