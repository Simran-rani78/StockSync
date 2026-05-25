import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft,
  Layers,
  CheckCircle2
} from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('stocksync_wishlist') || '[]');
    setWishlist(items);
  }, []);

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleRemove = (id) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('stocksync_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    triggerAlert('Product removed from wishlist.');
  };

  // Add to Local Storage Cart from Wishlist
  const handleAddToCart = (product) => {
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
    window.dispatchEvent(new Event('storage'));
    triggerAlert(`"${product.name}" added to shopping cart!`);
  };

  const formatImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Alert toast notification */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-brand-500/30 text-xs font-semibold text-brand-400 shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          {alertMsg}
        </div>
      )}

      {/* Header Banner */}
      <div>
        <Link to="/catalog" className="text-xs font-semibold text-slate-455 hover:text-slate-200 inline-flex items-center gap-1.5 mb-2 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Catalog
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Your Saved Wishlist</h2>
        <p className="text-xs text-slate-450 mt-0.5">Quickly review and bulk purchase products saved from catalog browsing.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="glass py-24 text-center rounded-3xl border border-slate-850/80 bg-slate-900/5">
          <Heart className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-200">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Click the heart button on items in the Catalog Explorer to save products here for later purchase.</p>
          <Link 
            to="/catalog"
            className="mt-6 py-2.5 px-5 bg-brand-650 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition duration-200 inline-block shadow shadow-brand-500/10"
          >
            Go to Catalog Explorer
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((product) => {
            const formattedImage = formatImageSource(product.imageUrl);
            const isOutOfStock = product.quantity === 0;

            return (
              <div 
                key={product.id}
                className="glass rounded-2xl border border-slate-850/80 bg-slate-900/10 overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-750 transition duration-300 animate-fadeIn"
              >
                <div>
                  {/* Thumbnail Area */}
                  <div className="h-44 bg-slate-950/40 border-b border-slate-850/50 flex items-center justify-center overflow-hidden relative">
                    {formattedImage ? (
                      <img src={formattedImage} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Layers className="h-8 w-8 text-slate-750" />
                    )}
                    {isOutOfStock && (
                      <span className="absolute top-4 right-4 px-2 py-0.5 bg-red-650/90 text-white text-[9px] font-black uppercase rounded-md shadow">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-brand-400 font-bold uppercase">{product.category?.name || 'Category'}</span>
                      <span className="text-slate-500 font-mono font-semibold">{product.sku}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">{product.name}</h3>
                    <p className="text-[11px] text-slate-450 leading-relaxed line-clamp-2">{product.description || 'No description added.'}</p>
                  </div>
                </div>

                {/* Footer buttons row */}
                <div className="p-5 pt-0 border-t border-slate-850/40 mt-auto flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-semibold">Price</span>
                    <span className="text-base font-bold text-slate-100">${parseFloat(product.price).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="p-2 hover:bg-rose-500/10 text-slate-550 hover:text-rose-455 rounded-xl border border-slate-850/80 transition"
                      title="Remove from saved list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className="py-2 px-3 bg-brand-650 hover:bg-brand-500 disabled:bg-brand-850 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
