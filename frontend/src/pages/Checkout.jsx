import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Ticket
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    street: '',
    city: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    paymentMethod: 'Wholesale Net-30 Invoice'
  });

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('stocksync_cart') || '[]');
    setCart(items);
  }, []);

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');

    // Map cart items to backend format: { productId, quantity }
    const itemsPayload = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    try {
      const response = await API.post('/orders', { items: itemsPayload });
      
      // Order created successfully!
      setSuccessOrder(response.data);
      
      // Clear cart
      localStorage.removeItem('stocksync_cart');
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Checkout dispatch error:', err);
      setErrorMsg(err.response?.data?.error || 'Server error processing order. Please verify stock counts.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const delivery = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + tax + delivery;

  // Render Success Receipt
  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-scaleUp py-6">
        <div className="glass p-8 rounded-3xl border border-emerald-500/25 bg-emerald-500/5 shadow-2xl text-center space-y-5">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-450 mx-auto flex items-center justify-center animate-pulse">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Order Locked & Dispatched!</h2>
            <p className="text-xs text-slate-400 mt-1">Your PostgreSQL transaction was committed. Warehouse stock levels updated.</p>
          </div>

          {/* Details slip */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 text-left text-xs font-mono divide-y divide-slate-850/50 space-y-3">
            <div className="flex justify-between text-slate-400 pb-2.5">
              <span>ORDER REFERENCE</span>
              <span className="font-bold text-slate-200 select-all">#{successOrder.id}</span>
            </div>
            <div className="flex justify-between text-slate-400 py-2.5">
              <span>DATE</span>
              <span className="text-slate-200">{new Date(successOrder.createdAt).toLocaleString()}</span>
            </div>
            <div className="py-2.5 space-y-1.5">
              <span className="text-slate-500 uppercase text-[10px] block font-bold font-sans">SHIPPING DETAILS</span>
              <p className="text-slate-300 leading-relaxed font-sans font-medium">
                {shippingInfo.street}, {shippingInfo.city}, {shippingInfo.zipCode}, {shippingInfo.country}
              </p>
            </div>
            <div className="flex justify-between text-slate-400 py-2.5">
              <span>PAYMENT TERMS</span>
              <span className="text-slate-200">{shippingInfo.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-brand-400 pt-3 text-sm font-bold font-sans">
              <span>TOTAL INVOICED</span>
              <span>${parseFloat(successOrder.totalPrice).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/portal/customer"
              className="py-2.5 px-5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow shadow-brand-500/10"
            >
              <Ticket className="h-4 w-4" />
              Go to Customer Portal
            </Link>
            <Link 
              to="/catalog"
              className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-750 text-slate-350 transition duration-200"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header link */}
      <div>
        <Link to="/cart" className="text-xs font-semibold text-slate-450 hover:text-slate-200 inline-flex items-center gap-1.5 mb-2 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Cart
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Wholesale Checkout</h2>
        <p className="text-xs text-slate-450 mt-0.5">Specify delivery destinations and submit bulk invoice checkout orders.</p>
      </div>

      {cart.length === 0 ? (
        <div className="glass py-16 text-center rounded-3xl border border-slate-850/80 bg-slate-900/5">
          <ShoppingBag className="h-10 w-10 text-slate-750 mx-auto mb-3" />
          <p className="text-xs text-slate-450">Checkout is locked since your cart is empty.</p>
          <Link to="/catalog" className="text-brand-400 hover:text-brand-350 text-[11px] font-semibold mt-1 inline-block">Explore products</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-5 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-3">
            <div className="glass p-6 sm:p-8 rounded-3xl border border-slate-850/80 bg-slate-900/5">
              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2.5 animate-fadeIn">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand-400" />
                    Delivery Destination
                  </h3>
                  
                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Street Address</label>
                      <input
                        type="text"
                        name="street"
                        required
                        value={shippingInfo.street}
                        onChange={handleInputChange}
                        placeholder="123 Warehouse Logistics Blvd"
                        className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">City / Region</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          placeholder="San Francisco"
                          className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ZIP / Postal Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          value={shippingInfo.zipCode}
                          onChange={handleInputChange}
                          placeholder="94107"
                          className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Country</label>
                        <input
                          type="text"
                          name="country"
                          required
                          value={shippingInfo.country}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Phone</label>
                        <input
                          type="text"
                          name="phone"
                          required
                          value={shippingInfo.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-slate-850 pt-5">
                  <h3 className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-brand-400" />
                    B2B Payment Terms
                  </h3>

                  <div className="pt-2">
                    <select
                      name="paymentMethod"
                      value={shippingInfo.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 cursor-pointer outline-none transition"
                    >
                      <option value="Wholesale Net-30 Invoice">Wholesale Net-30 Invoice (Default)</option>
                      <option value="Wholesale Net-60 Invoice">Wholesale Net-60 Invoice (+1.5% fee)</option>
                      <option value="Direct ACH Transfer">Direct ACH Bank Wire</option>
                    </select>
                    <span className="text-[10px] text-slate-500 block mt-1.5">Invoices are processed automatically upon delivery receipt.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-655 hover:bg-brand-500 disabled:bg-brand-850 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow shadow-brand-500/10"
                >
                  {loading ? (
                    <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Place Bulk Order (Commit Invoice)
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right sidebar details */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest pl-1">Order Details</h3>
            
            <div className="glass p-5 rounded-3xl border border-slate-850/80 bg-slate-900/5 space-y-4">
              {/* Products items check */}
              <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-850/50 pr-1">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-xs py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <span className="text-slate-300 font-bold truncate block">{item.name}</span>
                      <span className="text-[9px] text-slate-550 font-mono mt-0.5 block">SKU: {item.sku}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-200 font-bold block">${(item.price * item.quantity).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{item.quantity} x ${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-slate-850/60 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-450">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-450">
                  <span>Sales Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-450">
                  <span>Processing & Delivery</span>
                  <span>${delivery.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-850 pt-3 flex justify-between text-sm font-bold text-slate-100">
                  <span>Total Due</span>
                  <span className="text-brand-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
