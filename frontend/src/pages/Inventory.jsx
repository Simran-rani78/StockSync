import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus, 
  Check, 
  X, 
  ClipboardList 
} from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Inline adjustment state (tracks which product ID is currently being edited)
  const [adjustingProductId, setAdjustingProductId] = useState(null);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, selectedCategory, filterLowStock]);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products', {
        params: {
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          lowStock: filterLowStock ? 'true' : undefined
        }
      });
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory products:', err);
      setError('Could not retrieve inventory levels.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/products/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories for filter:', err);
    }
  };

  // Start adjusting stock inline
  const handleStartAdjustment = (product) => {
    setAdjustingProductId(product.id);
    setAdjustmentValue(product.quantity);
  };

  // Increment or Decrement locally before saving
  const changeAdjustmentValue = (amount) => {
    setAdjustmentValue(prev => Math.max(0, prev + amount));
  };

  // Save the adjustment back to DB
  const handleSaveAdjustment = async (productId) => {
    setAdjustmentLoading(true);
    try {
      await API.put(`/products/${productId}`, {
        quantity: adjustmentValue
      });
      setAdjustingProductId(null);
      fetchProducts();
    } catch (err) {
      console.error('Error updating stock count inline:', err);
      alert(err.response?.data?.error || 'Failed to update stock quantity.');
    } finally {
      setAdjustmentLoading(false);
    }
  };

  // Quick single step plus/minus directly on database
  const handleQuickStep = async (product, step) => {
    const targetQty = Math.max(0, product.quantity + step);
    try {
      await API.put(`/products/${product.id}`, {
        quantity: targetQty
      });
      // Update local state directly for responsive feedback
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: targetQty } : p));
    } catch (err) {
      console.error('Error in quick step adjustment:', err);
      alert(err.response?.data?.error || 'Failed to adjust stock count.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Inventory Registry</h2>
          <p className="text-sm text-slate-400">Monitor stock levels, execute quantity adjustments, and track restocks.</p>
        </div>
      </div>

      {/* Restock Alerts Alarm Banner */}
      {!loading && products.some(p => p.quantity < 10) && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-rose-455 animate-pulse">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold text-rose-400">Restock Alarm Triggered</p>
            <p className="text-[11px] text-rose-400/90 mt-0.5">
              There are currently {products.filter(p => p.quantity < 10).length} items running below the minimum threshold (10 units). Please issue warehouse restock orders immediately.
            </p>
          </div>
        </div>
      )}

      {/* Query Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center glass p-4 rounded-2xl border border-slate-800/80 bg-slate-900/10 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, name, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
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

        {/* Low Stock Warning filter */}
        <div className="flex items-center border-t border-slate-800 pt-4 md:border-none md:pt-0 pl-2 shrink-0">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500 cursor-pointer outline-none"
            />
            <span className="flex items-center gap-1.5 text-rose-455">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              Low Stock Warnings Only
            </span>
          </label>
        </div>
      </div>

      {/* Main Registry list */}
      {loading ? (
        <div className="flex h-[30vh] flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="mt-4 text-xs text-slate-400">Loading registry...</p>
        </div>
      ) : error ? (
        <div className="glass p-6 text-center text-rose-455 border border-rose-500/10 rounded-2xl">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="glass py-16 text-center rounded-2xl border border-slate-800/60">
          <ClipboardList className="h-10 w-10 text-slate-655 mx-auto mb-3" />
          <h3 className="text-slate-200 font-bold text-sm">No Inventory Matches</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or create products to populate inventory logs.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-800/80 bg-slate-900/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-450 bg-slate-900/30 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Catalog SKU</th>
                  <th className="py-4 px-4">SKU Code</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-center">Status Flag</th>
                  <th className="py-4 px-6 text-center">Warehouse Stock</th>
                  <th className="py-4 px-6 text-center">Adjust quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {products.map((product) => {
                  const isLow = product.quantity < 10;
                  const isAdjusting = adjustingProductId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-slate-900/20 transition duration-150">
                      {/* Product details */}
                      <td className="py-4 px-6 min-w-[220px]">
                        <h4 className="font-bold text-slate-250 text-sm">{product.name}</h4>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Price: ${parseFloat(product.price).toFixed(2)}</span>
                      </td>

                      {/* SKU Code */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-400 select-all">
                        {product.sku}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-medium text-slate-350">
                        {product.category?.name || 'N/A'}
                      </td>

                      {/* Alert Flag */}
                      <td className="py-4 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="h-3 w-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Fully Stocked
                          </span>
                        )}
                      </td>

                      {/* Current Warehouse Count */}
                      <td className="py-4 px-6 text-center font-mono text-sm font-bold text-slate-200">
                        {product.quantity}
                      </td>

                      {/* Adjust controls */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {isAdjusting ? (
                            <div className="flex items-center gap-2 bg-slate-950/80 p-1 border border-slate-800 rounded-xl animate-fadeIn">
                              <button
                                onClick={() => changeAdjustmentValue(-1)}
                                className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg transition"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              
                              <input
                                type="number"
                                value={adjustmentValue}
                                onChange={(e) => setAdjustmentValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="w-12 bg-transparent text-center font-mono text-xs font-bold text-slate-200 focus:outline-none"
                              />

                              <button
                                onClick={() => changeAdjustmentValue(1)}
                                className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg transition"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => handleSaveAdjustment(product.id)}
                                disabled={adjustmentLoading}
                                className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition border border-emerald-500/20"
                                title="Confirm Save"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              
                              <button
                                onClick={() => setAdjustingProductId(null)}
                                className="p-1 hover:bg-rose-500/20 text-rose-455 rounded-lg transition border border-rose-500/20"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              {/* Fast plus/minus micro-adjusters */}
                              <button
                                onClick={() => handleQuickStep(product, -1)}
                                className="p-1.5 hover:bg-slate-900 border border-slate-850 text-slate-500 hover:text-slate-200 rounded-lg transition"
                                title="Quick reduce 1"
                              >
                                <ArrowDownRight className="h-4 w-4 text-rose-500/60 hover:text-rose-500" />
                              </button>
                              
                              <button
                                onClick={() => handleStartAdjustment(product)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-slate-100 font-semibold border border-slate-800/80 rounded-xl transition duration-200"
                              >
                                Set Count
                              </button>
                              
                              <button
                                onClick={() => handleQuickStep(product, 1)}
                                className="p-1.5 hover:bg-slate-900 border border-slate-850 text-slate-500 hover:text-slate-200 rounded-lg transition"
                                title="Quick add 1"
                              >
                                <ArrowUpRight className="h-4 w-4 text-emerald-500/60 hover:text-emerald-500" />
                              </button>
                            </div>
                          )}
                        </div>
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
  );
};

export default Inventory;
