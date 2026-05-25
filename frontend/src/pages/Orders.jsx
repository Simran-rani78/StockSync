import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  ShoppingCart, 
  Trash2, 
  Check, 
  Clock, 
  Eye, 
  X, 
  AlertCircle, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Package,
  Printer
} from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  
  // Tabs: 'history' or 'new_order'
  const [activeTab, setActiveTab] = useState('history');
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Order Basket state
  const [basket, setBasket] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [basketError, setBasketError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Expanded Order details modal
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchActiveProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not retrieve order history logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProducts = async () => {
    try {
      const response = await API.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products for dropdown:', err);
    }
  };

  // Add to basket
  const handleAddToBasket = () => {
    setBasketError('');
    if (!selectedProductId) {
      setBasketError('Please select a product.');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (selectedQty <= 0) {
      setBasketError('Quantity must be 1 or more.');
      return;
    }

    if (product.quantity < selectedQty) {
      setBasketError(`Insufficient stock. Available quantity is ${product.quantity}.`);
      return;
    }

    // Check if product is already in the basket
    const existingIndex = basket.findIndex(item => item.productId === selectedProductId);
    if (existingIndex > -1) {
      const updatedQty = basket[existingIndex].quantity + parseInt(selectedQty, 10);
      if (product.quantity < updatedQty) {
        setBasketError(`Cannot add more. Available stock is ${product.quantity}, but basket would have ${updatedQty}.`);
        return;
      }
      const newBasket = [...basket];
      newBasket[existingIndex].quantity = updatedQty;
      newBasket[existingIndex].totalPrice = updatedQty * parseFloat(product.price);
      setBasket(newBasket);
    } else {
      setBasket([
        ...basket,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: parseFloat(product.price),
          quantity: parseInt(selectedQty, 10),
          totalPrice: parseInt(selectedQty, 10) * parseFloat(product.price)
        }
      ]);
    }

    // Reset selection inputs
    setSelectedProductId('');
    setSelectedQty(1);
  };

  // Remove item from basket
  const handleRemoveFromBasket = (index) => {
    const newBasket = [...basket];
    newBasket.splice(index, 1);
    setBasket(newBasket);
  };

  // Submit Order Checkout
  const handleCheckout = async () => {
    if (basket.length === 0) return;
    setCheckoutLoading(true);
    setBasketError('');

    const payload = {
      items: basket.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      await API.post('/orders', payload);
      setBasket([]);
      setActiveTab('history');
      fetchOrders();
      fetchActiveProducts(); // refresh stock numbers
    } catch (err) {
      console.error('Checkout error:', err);
      setBasketError(err.response?.data?.error || 'Failed to place order. Double check inventory availability.');
    } finally {
      setCheckoutLoading(false);
    }
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

  // Update status (Admin & Staff)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchActiveProducts(); // refresh stock numbers in case of cancellation
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update order status.');
    }
  };

  // Calculate basket total
  const basketTotal = basket.reduce((sum, item) => sum + item.totalPrice, 0);

  const getStatusClass = (status) => {
    const maps = {
      Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
      Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      Cancelled: 'bg-red-500/10 text-red-400 border-red-500/25'
    };
    return maps[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Order Dispatch Workspace</h2>
        <p className="text-sm text-slate-400">Place client checkout orders and review historic purchase logs.</p>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-slate-800/80 gap-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3.5 px-6 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4.5 w-4.5" />
          Order History Log
        </button>
        <button
          onClick={() => setActiveTab('new_order')}
          className={`py-3.5 px-6 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 ${
            activeTab === 'new_order'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="h-4.5 w-4.5" />
          Basket Checkout Desk
        </button>
      </div>

      {/* Tab CONTENT 1: Order History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex h-[30vh] flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <p className="mt-4 text-xs text-slate-400">Loading order records...</p>
            </div>
          ) : error ? (
            <div className="glass p-6 text-center text-rose-455 border border-rose-500/10 rounded-2xl">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="glass py-16 text-center rounded-2xl border border-slate-800/60">
              <ShoppingCart className="h-10 w-10 text-slate-655 mx-auto mb-3" />
              <h3 className="text-slate-200 font-bold text-sm">No Orders Placed</h3>
              <p className="text-xs text-slate-500 mt-1">Open the Basket Checkout tab to start processing client sales.</p>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-slate-800/80 bg-slate-900/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-450 bg-slate-900/30 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-4">Operator Name</th>
                      <th className="py-4 px-4 text-center">Items Ordered</th>
                      <th className="py-4 px-4 text-right">Order Value</th>
                      <th className="py-4 px-4 text-center">Date Placed</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-6 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {orders.map((order) => {
                      const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                      return (
                        <tr key={order.id} className="hover:bg-slate-900/20 transition duration-150">
                          {/* Order ID */}
                          <td className="py-4 px-6 font-mono text-slate-400 select-all font-semibold">
                            #{order.id.substring(0, 8)}
                          </td>
                          {/* Operator */}
                          <td className="py-4 px-4 font-bold text-slate-250">
                            {order.user?.name || 'Unknown Operator'}
                          </td>
                          {/* Items Count */}
                          <td className="py-4 px-4 text-center text-slate-350 font-medium">
                            {itemCount} units
                          </td>
                          {/* Total Value */}
                          <td className="py-4 px-4 text-right font-bold text-slate-200">
                            ${parseFloat(order.totalPrice).toFixed(2)}
                          </td>
                          {/* Date */}
                          <td className="py-4 px-4 text-center text-slate-500 font-medium">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          {/* Status Edit Select or Read-only badge */}
                          <td className="py-4 px-4 text-center">
                            {user?.role === 'Customer' ? (
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusClass(order.status)}`}>
                                {order.status}
                              </span>
                            ) : (
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer text-center bg-slate-950 ${getStatusClass(order.status)}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            )}
                          </td>
                          {/* View details */}
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="p-1.5 hover:bg-brand-500/15 text-slate-400 hover:text-brand-400 rounded-lg transition"
                              title="View details"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab CONTENT 2: New Order Basket Checkout Desk */}
      {activeTab === 'new_order' && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add SKU Selector panel */}
          <div className="glass p-6 rounded-2xl border border-slate-800/80 bg-slate-900/10 flex flex-col h-fit">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-brand-500" />
              Add Items to Basket
            </h3>
            
            {basketError && (
              <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{basketError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Catalog Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setBasketError('');
                  }}
                  className="w-full px-3.5 py-3 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition cursor-pointer"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.name} ({p.sku}) - ${parseFloat(p.price).toFixed(2)} [Stock: {p.quantity}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Show live info if product is selected */}
              {selectedProductId && (() => {
                const prod = products.find(p => p.id === selectedProductId);
                if (!prod) return null;
                return (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850/60 text-xs text-slate-350 space-y-1.5 animate-fadeIn">
                    <div className="flex justify-between"><span className="text-slate-500">Unit SKU Price:</span><span className="font-semibold text-slate-200">${parseFloat(prod.price).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Available Stock:</span><span className={`font-semibold ${prod.quantity < 10 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>{prod.quantity} units</span></div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Purchase Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={selectedQty}
                  onChange={(e) => {
                    setSelectedQty(parseInt(e.target.value, 10) || '');
                    setBasketError('');
                  }}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition"
                />
              </div>

              <button
                type="button"
                onClick={handleAddToBasket}
                className="w-full py-3 bg-slate-850 hover:bg-slate-850/80 text-brand-400 font-semibold text-xs border border-brand-500/25 hover:border-brand-500/40 rounded-xl transition duration-200 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Item to Basket
              </button>
            </div>
          </div>

          {/* Current Basket summary table */}
          <div className="glass lg:col-span-2 p-6 rounded-2xl border border-slate-800/80 bg-slate-900/10 flex flex-col justify-between shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-100 mb-5 flex items-center justify-between">
                <span>Active Basket Checkout</span>
                <span className="text-xs text-slate-450 font-normal">{basket.length} lines listed</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Product Name</th>
                      <th className="pb-3 px-4">SKU</th>
                      <th className="pb-3 px-4 text-right">Unit Price</th>
                      <th className="pb-3 px-4 text-center">Qty</th>
                      <th className="pb-3 px-4 text-right">Subtotal</th>
                      <th className="pb-3 pl-4 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {basket.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                          No items loaded in basket yet. Select a product on the left to add items.
                        </td>
                      </tr>
                    ) : (
                      basket.map((item, idx) => (
                        <tr key={`${item.productId}-${idx}`} className="hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold text-slate-350">{item.name}</td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400 select-all">{item.sku}</td>
                          <td className="py-3 px-4 text-right text-slate-200">${item.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-200">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-100">${item.totalPrice.toFixed(2)}</td>
                          <td className="py-3 pl-4 text-center">
                            <button
                              onClick={() => handleRemoveFromBasket(idx)}
                              className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-455 rounded transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total display & checkout submit button */}
            {basket.length > 0 && (
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Estimated Total Price</span>
                  <span className="text-2xl font-black text-slate-100">${basketTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="py-3 px-6 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white text-xs font-semibold rounded-xl transition duration-200 shadow-lg shadow-brand-500/15 flex items-center justify-center gap-1.5"
                >
                  {checkoutLoading && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>}
                  Process Checkout Dispatch
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS DRAWER MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="glass w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl p-6 md:p-8 animate-scaleIn bg-slate-900/95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-500" />
                  Purchase Receipt Info
                </h3>
                <p className="text-[10px] text-mono text-slate-500 mt-1 select-all">Order ID: #{viewingOrder.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(viewingOrder)}
                  className="py-1.5 px-3 bg-slate-850 hover:bg-slate-800 text-brand-400 hover:text-brand-350 text-xs font-bold rounded-xl border border-brand-500/20 transition flex items-center gap-1.5 mr-2"
                  title="Print invoice to PDF"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 bg-slate-950/40 p-4.5 rounded-xl border border-slate-850/80 mb-6 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-[10px] text-slate-450 uppercase tracking-wider">Placed By</h4>
                <p className="text-slate-200 font-semibold">{viewingOrder.user?.name}</p>
                <p className="text-slate-500 text-[11px]">{viewingOrder.user?.email}</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-[10px] text-slate-450 uppercase tracking-wider">Dispatch Logistics</h4>
                <p className="text-slate-200 font-semibold">
                  Date: {new Date(viewingOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusClass(viewingOrder.status)}`}>
                    {viewingOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Tracker */}
            {viewingOrder.status !== 'Cancelled' && (
              <div className="mb-6 bg-slate-955/20 p-4 rounded-xl border border-slate-850/50">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Estimated Delivery Tracker</span>
                <div className="flex items-center justify-between relative px-2.5">
                  <div className="absolute left-6 right-6 top-[15px] h-0.5 bg-slate-800 z-0"></div>
                  <div 
                    className="absolute left-6 top-[15px] h-0.5 bg-brand-500 transition-all duration-500 z-0" 
                    style={{
                      width: viewingOrder.status === 'Completed' 
                        ? 'calc(100% - 48px)' 
                        : viewingOrder.status === 'Processing' 
                          ? 'calc(50% - 24px)' 
                          : '0%'
                    }}
                  ></div>

                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition duration-300 ${
                      viewingOrder.status === 'Pending' || viewingOrder.status === 'Processing' || viewingOrder.status === 'Completed'
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
                      viewingOrder.status === 'Processing' || viewingOrder.status === 'Completed'
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
                      viewingOrder.status === 'Completed'
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
                      viewingOrder.status === 'Completed'
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

            <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-3">Itemized SKU Breakdowns</h4>
            <div className="border border-slate-850/80 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Item Details</th>
                    <th className="py-2.5 px-3 text-right">Price Sold</th>
                    <th className="py-2.5 px-3 text-center">Qty Ordered</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {viewingOrder.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-250">{item.product?.name || 'Deleted SKU'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.product?.sku || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-350">${parseFloat(item.price).toFixed(2)}</td>
                      <td className="py-3 px-3 text-center text-slate-200 font-bold">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-100 font-bold">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-5 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Order Net Total</span>
              <span className="text-xl font-black text-slate-100">${parseFloat(viewingOrder.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
