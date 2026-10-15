import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, Eye, IndianRupee, Tag, AlertCircle, PackageOpen } from 'lucide-react';
import { wishlistService } from '../services/api';

// Individual card for items displayed on the Wishlist page
const WishlistCard = ({ product, onRemove, removing }) => {
  const isInStock = product.stock > 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-blue-700 border border-blue-100 shadow-sm flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {product.category}
        </span>
        {/* Stock badge */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
            isInStock
              ? 'bg-emerald-50/90 text-emerald-700 border border-emerald-200'
              : 'bg-red-50/90 text-red-700 border border-red-200'
          }`}
        >
          {isInStock ? `${product.stock} in stock` : 'Out of Stock'}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-base font-bold text-slate-900 line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-1">
          <IndianRupee className="w-4 h-4 text-slate-700" />
          <span className="text-lg font-extrabold text-slate-900">
            {product.price.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          {/* View Details */}
          <Link
            to={`/products/${product._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>

          {/* Remove */}
          <button
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
            {removing ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Wishlist Page ──────────────────────────────────────────────────────────────
const Wishlist = ({ user }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await wishlistService.getAll();
      setWishlist(data.wishlist || []);
    } catch {
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user, fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await wishlistService.remove(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      alert('Failed to remove product. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading your wishlist…</p>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <AlertCircle className="w-14 h-14 text-red-400" />
        <div>
          <p className="text-lg font-semibold text-slate-800">Something went wrong.</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchWishlist}
          className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty State ──
  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
          <Heart className="w-10 h-10 text-rose-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800">Your wishlist is empty ❤️</p>
          <p className="text-sm text-slate-500 mt-1.5">
            Save products you love and find them here later.
          </p>
        </div>
        <Link
          to="/products"
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // ── Wishlist Cards ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Heart className="w-7 h-7 text-rose-500 fill-rose-100" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
          <p className="text-sm text-slate-500">{wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            removing={removingId === product._id}
          />
        ))}
      </div>

      {/* Continue shopping */}
      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50 transition"
        >
          <PackageOpen className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
