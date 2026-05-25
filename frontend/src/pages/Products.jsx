import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  Package, 
  Tag, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form state
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodQty, setProdQty] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Category Form state
  const [catName, setCatName] = useState('');
  const [catError, setCatError] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products', {
        params: {
          search: search || undefined,
          categoryId: selectedCategory || undefined
        }
      });
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Could not retrieve product list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/products/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Triggered when opening product modal for creation
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSku('');
    setProdPrice('');
    setProdQty('');
    setProdCategory(categories[0]?.id || '');
    setProdDesc('');
    setProdImage(null);
    setImagePreview(null);
    setFormError('');
    setProductModalOpen(true);
  };

  // Triggered when opening product modal for editing
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdSku(product.sku);
    setProdPrice(product.price);
    setProdQty(product.quantity);
    setProdCategory(product.categoryId);
    setProdDesc(product.description || '');
    setProdImage(null);
    
    // Resolve proper image preview url
    const imgUrl = product.imageUrl 
      ? (product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`)
      : null;
    setImagePreview(imgUrl);
    setFormError('');
    setProductModalOpen(true);
  };

  // Image selection handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProdImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodSku || !prodPrice || prodQty === '' || !prodCategory) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const formData = new FormData();
    formData.append('name', prodName);
    formData.append('sku', prodSku);
    formData.append('price', prodPrice);
    formData.append('quantity', prodQty);
    formData.append('categoryId', prodCategory);
    formData.append('description', prodDesc);
    if (prodImage) {
      formData.append('image', prodImage);
    }

    try {
      if (editingProduct) {
        // UPDATE
        await API.put(`/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // CREATE
        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setFormError(err.response?.data?.error || 'Failed to save product details.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product SKU?')) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.error || 'Failed to delete product SKU.');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName) return;

    setCatLoading(true);
    setCatError('');

    try {
      await API.post('/products/categories', { name: catName });
      setCatName('');
      setCatError('');
      fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      setCatError(err.response?.data?.error || 'Failed to create category.');
    } finally {
      setCatLoading(false);
    }
  };

  const handleRenameCategory = async (id) => {
    if (!editingCategoryName) return;
    setCatLoading(true);
    setCatError('');
    try {
      await API.put(`/products/categories/${id}`, { name: editingCategoryName });
      setEditingCategoryId(null);
      setEditingCategoryName('');
      fetchCategories();
      fetchProducts();
    } catch (err) {
      console.error('Error renaming category:', err);
      setCatError(err.response?.data?.error || 'Failed to rename category.');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will block deletion.')) return;
    setCatLoading(true);
    setCatError('');
    try {
      await API.delete(`/products/categories/${id}`);
      fetchCategories();
      fetchProducts();
    } catch (err) {
      console.error('Error deleting category:', err);
      setCatError(err.response?.data?.error || 'Failed to delete category.');
    } finally {
      setCatLoading(false);
    }
  };

  const formatImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Product Management</h2>
          <p className="text-sm text-slate-400">Inventory SKU control, descriptions, prices, and categories.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCategoryModalOpen(true);
                setCatError('');
                setCatName('');
              }}
              className="py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-2"
            >
              <Tag className="h-4 w-4" />
              Manage Categories
            </button>
            <button
              onClick={handleOpenAddModal}
              className="py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition duration-200 shadow-md shadow-brand-500/10 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product SKU
            </button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center glass p-4 rounded-2xl border border-slate-800/80 bg-slate-900/10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by SKU, name, or description..."
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

      {/* Main Table */}
      {loading ? (
        <div className="flex h-[30vh] flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="mt-4 text-xs text-slate-400">Loading catalog...</p>
        </div>
      ) : error ? (
        <div className="glass p-6 text-center text-rose-400 border border-rose-500/10 rounded-2xl">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="glass py-16 text-center rounded-2xl border border-slate-800/50">
          <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-200 font-bold text-sm">No Products Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try refining your search or add a new product to this catalog.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-800/80 bg-slate-900/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-450 bg-slate-900/30 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Product details</th>
                  <th className="py-4 px-4">SKU</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-right">Price</th>
                  <th className="py-4 px-6 text-center">Stock Count</th>
                  {isAdmin && <th className="py-4 px-6 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {products.map((product) => {
                  const isLow = product.quantity < 10;
                  const formattedImage = formatImageSource(product.imageUrl);

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-slate-900/20 transition duration-150 ${
                        isLow ? 'bg-rose-500/5 hover:bg-rose-500/10 border-l-2 border-rose-500' : ''
                      }`}
                    >
                      {/* Image & Details */}
                      <td className="py-4 px-6 flex items-center gap-4.5 min-w-[280px]">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          {formattedImage ? (
                            <img src={formattedImage} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-250 text-sm truncate">{product.name}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-xs">{product.description || 'No description added'}</p>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-400 select-all">
                        {product.sku}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-medium text-slate-350">
                        {product.category?.name || 'N/A'}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 text-right font-bold text-slate-200">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>

                      {/* Stock Count */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isLow 
                            ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isLow ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                          {product.quantity}
                        </span>
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 hover:bg-brand-500/15 text-slate-400 hover:text-brand-400 rounded-lg transition"
                              title="Edit product"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1.5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded-lg transition"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product ADD/EDIT Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="glass w-full max-w-xl rounded-2xl border border-slate-800 shadow-2xl p-6 md:p-8 animate-scaleIn bg-slate-900/90 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <h3 className="text-base font-bold text-slate-100">
                {editingProduct ? `Edit SKU Details` : 'Add New Product SKU'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-2.5 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Wireless Smart Buds"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="ELEC-WBUDS-PRO"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="89.99"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    value={prodQty}
                    onChange={(e) => setProdQty(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Provide details about product attributes..."
                  rows="3"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition resize-none"
                />
              </div>

              {/* Image upload picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Product Image</label>
                <div className="flex items-center gap-4 p-4.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                  <div className="h-16 w-16 bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-655" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg text-slate-200 cursor-pointer transition">
                      <Upload className="h-3.5 w-3.5" />
                      Upload File
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-1.5">JPG, PNG, WEBP, or GIF. Max size 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2.5 px-5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  {formLoading && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category CRUD Manager Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="glass w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl p-6 bg-slate-900/95 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-5">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Tag className="h-4.5 w-4.5 text-brand-500" />
                Manage Categories
              </h3>
              <button
                onClick={() => {
                  setCategoryModalOpen(false);
                  setEditingCategoryId(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {catError && (
              <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{catError}</span>
              </div>
            )}

            {/* Create Category form */}
            <form onSubmit={handleCategorySubmit} className="space-y-4 mb-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="New category name..."
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-slate-200 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={catLoading}
                  className="py-2 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  {catLoading && !editingCategoryId && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>}
                  Add
                </button>
              </div>
            </form>

            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Category Registry</h4>
            <div className="border border-slate-850/85 rounded-xl divide-y divide-slate-850 max-h-60 overflow-y-auto">
              {categories.map((c) => {
                const isEditing = editingCategoryId === c.id;
                return (
                  <div key={c.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-slate-955/80 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameCategory(c.id)}
                          disabled={catLoading}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryName('');
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-355">{c.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(c.id);
                              setEditingCategoryName(c.name);
                            }}
                            className="p-1 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded transition"
                            title="Rename category"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1 text-slate-500 hover:text-rose-455 hover:bg-rose-500/10 rounded transition"
                            title="Delete category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {categories.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">No categories added yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
