import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  ShoppingBag, 
  Clock, 
  Heart, 
  RefreshCw, 
  Bell, 
  CheckCircle2, 
  ChevronRight, 
  Package,
  AlertCircle,
  Printer
} from 'lucide-react';

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchPortalData();
    // Read local cache sizes
    const wish = JSON.parse(localStorage.getItem('stocksync_wishlist') || '[]');
    setWishlistCount(wish.length);
    const cart = JSON.parse(localStorage.getItem('stocksync_cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  // Reorder copies all items back to local cart
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    
    const cartStr = localStorage.getItem('stocksync_cart') || '[]';
    const cart = JSON.parse(cartStr);

    order.items.forEach(item => {
      const pId = item.productId;
      const existingIdx = cart.findIndex(c => c.productId === pId);
      
      if (existingIdx > -1) {
        cart[existingIdx].quantity += item.quantity;
      } else {
        cart.push({
          productId: pId,
          name: item.product?.name || 'Reordered Product',
          sku: item.product?.sku || '',
          price: parseFloat(item.price),
          imageUrl: item.product?.imageUrl || null,
          quantity: item.quantity
        });
      }
    });

    localStorage.setItem('stocksync_cart', JSON.stringify(cart));
    // Trigger storage event so navbar updates if it listens
    window.dispatchEvent(new Event('storage'));
    triggerAlert('Items cloned into cart! Redirecting to checkout desk...');
    setTimeout(() => {
      navigate('/cart');
    }, 1000);
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Popup blocker prevented opening the invoice.');

    const itemsHtml = order.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <div style="font-weight: bold; font-size: 13px;">${item.product?.name || 'Legacy Catalog Item'}</div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">SKU: ${item.product?.sku || 'N/A'}</div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    const subtotal = order.items?.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) || 0;
    const tax = subtotal * 0.08;
    const processingFee = subtotal > 0 ? 15.00 : 0;
    const total = parseFloat(order.totalPrice || subtotal + tax + processingFee);

    const invoiceContent = `
      <html>
        <head>
          <title>Invoice - Order #${order.id.substring(0, 8)}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #525cff; }
            .title { font-size: 20px; font-weight: bold; color: #0f172a; text-align: right; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 12px; }
            .meta-block { display: flex; flex-direction: column; gap: 4px; }
            .meta-title { font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; padding: 12px 10px; text-align: left; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font-size: 12px; }
            .totals-row { display: flex; width: 250px; justify-content: space-between; }
            .grand-total { font-size: 16px; font-weight: bold; color: #525cff; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 4px; }
            .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">StockSync</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">B2B Wholesale Portal</div>
            </div>
            <div>
              <div class="title">INVOICE RECEIPT</div>
              <div style="font-size: 11px; color: #64748b; text-align: right; margin-top: 4px;">Order #${order.id}</div>
            </div>
          </div>

          <div class="meta">
            <div class="meta-block">
              <span class="meta-title">ISSUED TO</span>
              <span style="font-weight: bold; font-size: 13px;">${order.user?.name || 'Valued B2B Customer'}</span>
              <span>Client Account Portal</span>
            </div>
            <div class="meta-block" style="text-align: right;">
              <span class="meta-title">DATE ISSUED</span>
              <span style="font-weight: bold;">${new Date(order.createdAt).toLocaleString()}</span>
              <span class="meta-title" style="margin-top: 10px;">ORDER STATUS</span>
              <span style="font-weight: bold; color: #059669;">${order.status}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product details</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 100px;">Price</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span style="color: #64748b;">Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span style="color: #64748b;">Tax (8%):</span>
              <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span style="color: #64748b;">Delivery Processing Fee:</span>
              <span>$${processingFee.toFixed(2)}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Grand Total:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for choosing StockSync as your B2B supply partner.</p>
            <p style="font-size: 9px; color: #94a3b8; margin-top: 8px;">Generated automatically from StockSync Platform</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  // Stats derivations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const totalSpent = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);

  // Dynamic notifications feed generated from order status changes
  const notifications = orders.flatMap(order => {
    const events = [];
    // Date format helper
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (order.status === 'Completed') {
      events.push({
        id: `comp-${order.id}`,
        title: 'Dispatch Delivered',
        desc: `Order #${order.id.substring(0, 8)} is completed and shipped.`,
        time: formatDate(order.updatedAt),
        type: 'success'
      });
    } else if (order.status === 'Processing') {
      events.push({
        id: `proc-${order.id}`,
        title: 'Warehouse Processing',
        desc: `Order #${order.id.substring(0, 8)} is verified by inventory managers.`,
        time: formatDate(order.updatedAt),
        type: 'info'
      });
    } else if (order.status === 'Cancelled') {
      events.push({
        id: `canc-${order.id}`,
        title: 'Order Cancelled',
        desc: `Order #${order.id.substring(0, 8)} was cancelled. Restocked inventory.`,
        time: formatDate(order.updatedAt),
        type: 'error'
      });
    } else {
      events.push({
        id: `pend-${order.id}`,
        title: 'Order Created',
        desc: `Order #${order.id.substring(0, 8)} successfully queued for validation.`,
        time: formatDate(order.createdAt),
        type: 'info'
      });
    }
    return events;
  }).slice(0, 5); // display top 5 events

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-yellow-500/10 text-yellow-450 border border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Alert toast Banner */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-brand-500/30 text-xs font-semibold text-brand-400 shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          {alertMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="relative glass p-6 sm:p-8 rounded-3xl border border-brand-500/10 bg-gradient-to-tr from-brand-600/5 to-slate-900/40 shadow-xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md tracking-wider">
            Customer Dashboard
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">Welcome to StockSync Client Portal</h2>
          <p className="text-xs text-slate-450 mt-1 max-w-xl">Track bulk order states, inspect active wishlists, reorder past catalogs, and review dispatch notifications.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link 
            to="/catalog"
            className="py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow"
          >
            Catalog Explorer
          </Link>
          <Link 
            to="/cart"
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 text-slate-300 transition duration-200"
          >
            Basket ({cartCount})
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
        <div className="glass p-5 rounded-2xl border border-slate-850/80 bg-slate-900/5">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="h-4.5 w-4.5 text-brand-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-200 mt-2">{totalOrders}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-850/80 bg-slate-900/5">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Dispatches</span>
            <Clock className="h-4.5 w-4.5 text-yellow-450 animate-pulse" />
          </div>
          <p className="text-xl font-extrabold text-slate-200 mt-2">{pendingOrders}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-850/80 bg-slate-900/5">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Saved in Wishlist</span>
            <Heart className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-200 mt-2">{wishlistCount}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-850/80 bg-slate-900/5">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Spend</span>
            <span className="text-xs font-bold text-emerald-450">$</span>
          </div>
          <p className="text-xl font-extrabold text-slate-200 mt-2">${totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* Split layout: Order Logs and Notifications */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Orders list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300">Order Logs & Tracking</h3>
            <button onClick={fetchPortalData} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="glass py-20 text-center rounded-2xl border border-slate-850/80">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto"></div>
              <p className="text-[10px] text-slate-500 mt-3">Syncing history logs...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass py-20 text-center rounded-2xl border border-slate-850/80">
              <Package className="h-8 w-8 text-slate-650 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No orders placed yet.</p>
              <Link to="/catalog" className="text-brand-400 hover:text-brand-350 text-[11px] font-semibold mt-1.5 inline-block">Browse Wholesale Catalog →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="glass p-5 rounded-2xl border border-slate-850/80 bg-slate-900/5 space-y-4">
                  {/* Title Bar */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Order ID</span>
                      <h4 className="text-xs font-mono font-bold text-slate-350 select-all leading-none mt-1">
                        #{order.id.substring(0, 8)}...
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                      <button 
                        onClick={() => handleReorder(order)}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-brand-400 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 transition flex items-center gap-1"
                        title="Copy items back to cart"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Reorder
                      </button>
                      <button 
                        onClick={() => handlePrintInvoice(order)}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-brand-400 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 transition flex items-center gap-1"
                        title="Print invoice to PDF"
                      >
                        <Printer className="h-3 w-3" />
                        Print Invoice
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t border-b border-slate-850/50 py-3.5 space-y-2">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-xs items-center gap-4">
                        <div className="overflow-hidden">
                          <span className="text-slate-300 font-semibold truncate block">{item.product?.name || 'Legacy Catalog Item'}</span>
                          <span className="text-[9px] text-slate-550 block font-mono mt-0.5">SKU: {item.product?.sku || 'N/A'}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-400 font-medium">{item.quantity} units</span>
                          <span className="text-[10px] text-slate-550 block font-semibold mt-0.5">${parseFloat(item.price).toFixed(2)}/u</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Estimated Delivery Tracker */}
                  {order.status !== 'Cancelled' && (
                    <div className="mt-4 pt-3.5 border-t border-slate-850/50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Estimated Delivery Tracker</span>
                      <div className="flex items-center justify-between relative px-2.5">
                        <div className="absolute left-6 right-6 top-[15px] h-0.5 bg-slate-800 z-0"></div>
                        <div 
                          className="absolute left-6 top-[15px] h-0.5 bg-brand-500 transition-all duration-500 z-0" 
                          style={{
                            width: order.status === 'Completed' 
                              ? 'calc(100% - 48px)' 
                              : order.status === 'Processing' 
                                ? 'calc(50% - 24px)' 
                                : '0%'
                          }}
                        ></div>

                        {/* Step 1: Placed */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition duration-300 ${
                            order.status === 'Pending' || order.status === 'Processing' || order.status === 'Completed'
                              ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            1
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Placed</span>
                        </div>

                        {/* Step 2: Packed */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition duration-300 ${
                            order.status === 'Processing' || order.status === 'Completed'
                              ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            2
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Packed</span>
                        </div>

                        {/* Step 3: Dispatched */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition duration-300 ${
                            order.status === 'Completed'
                              ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            3
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Dispatched</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition duration-300 ${
                            order.status === 'Completed'
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            4
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Footer */}
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-500 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <div>
                      <span className="text-slate-500 font-semibold mr-1.5 text-[11px]">Total Price:</span>
                      <span className="font-bold text-slate-200">${parseFloat(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-brand-400" />
            Platform Notifications
          </h3>

          <div className="glass p-5 rounded-3xl border border-slate-850/80 bg-slate-900/5 space-y-4">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-slate-750" />
                No dispatch alerts or receipts.
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-850">
                {notifications.map(notif => (
                  <div key={notif.id} className="relative pl-7 group">
                    {/* Event Indicator dot */}
                    <div className={`absolute left-1 top-1.5 h-4 w-4 rounded-full bg-slate-950 border flex items-center justify-center ${
                      notif.type === 'success' ? 'border-emerald-500' : (notif.type === 'error' ? 'border-rose-500' : 'border-blue-500')
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        notif.type === 'success' ? 'bg-emerald-500' : (notif.type === 'error' ? 'bg-rose-500' : 'bg-blue-500')
                      }`}></div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">{notif.time}</span>
                      <h5 className="text-xs font-bold text-slate-250 mt-0.5">{notif.title}</h5>
                      <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">{notif.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Help Box */}
          <div className="glass p-5 rounded-3xl border border-slate-850/40 bg-slate-900/10 text-xs text-slate-450 leading-relaxed space-y-2">
            <h4 className="font-bold text-slate-350">Need Order Adjustments?</h4>
            <p>Once orders enter the <b>Processing</b> stage, inventory is deducted. If you need to edit quantities or cancel, contact Support immediately via our <Link to="/contact" className="text-brand-400 hover:underline font-semibold">Contact Desk</Link> before warehouse dispatch completes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
