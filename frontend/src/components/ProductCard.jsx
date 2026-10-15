import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, IndianRupee, Heart, ShoppingCart, Plus, Minus } from 'lucide-react';
import { wishlistService } from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * ProductCard — used on the /products page.
 *
 * Props:
 *   product          — the product object
 *   user             — logged-in user (null if not authenticated)
 *   initialWishlisted — boolean: is this product already in the user's wishlist?
 *                       Passed from Products.jsx which fetches wishlist IDs on mount.
 *   onWishlistChange — callback(productId, isSaved) so parent can keep its Set in sync
 */
const ProductCard = ({ product, user, initialWishlisted = false, onWishlistChange }) => {
  const isInStock = product.stock > 0;

  // ── Wishlist state ──────────────────────────────────────────────────────────
  // Initialised from the prop (which comes from a real API fetch in Products.jsx),
  // so it survives page refreshes correctly.
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  // Keep in sync if the parent re-fetches and passes a new prop value
  useEffect(() => {
    setWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  // ── Cart state (from global CartContext) ────────────────────────────────────
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  // Find this product's current entry in the cart (if any)
  const cartItem = cartItems.find((item) => item.product?._id === product._id);
  const cartQty = cartItem?.quantity || 0;

  // Per-button loading flags for + / - / add actions
  const [cartActionLoading, setCartActionLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  // ── Wishlist Handler ─────────────────────────────────────────────────────────
  const handleWishlistToggle = async () => {
    if (!user) {
      setWishlistError('Please log in first');
      return;
    }
    if (wishlistLoading) return;

    setWishlistLoading(true);
    setWishlistError('');

    try {
      if (wishlisted) {
        // Already saved → remove it
        await wishlistService.remove(product._id);
        setWishlisted(false);
        onWishlistChange?.(product._id, false);
      } else {
        // Not saved → add it (use toggle endpoint to be safe even if already exists)
        await wishlistService.add(product._id);
        setWishlisted(true);
        onWishlistChange?.(product._id, true);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      // 409 means already in wishlist — treat as saved
      if (err?.response?.status === 409) {
        setWishlisted(true);
        onWishlistChange?.(product._id, true);
      } else {
        setWishlistError('Could not update wishlist. Try again.');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // ── Cart Handlers ────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) { setCartError('Please log in first'); return; }
    if (cartActionLoading) return;
    setCartActionLoading(true);
    setCartError('');
    const result = await addToCart(product._id);
    if (!result.success) setCartError(result.message || 'Could not add to cart');
    setCartActionLoading(false);
  };

  const handleIncrease = async () => {
    if (cartActionLoading) return;
    setCartActionLoading(true);
    setCartError('');
    const result = await updateQuantity(product._id, cartQty + 1);
    if (!result.success) setCartError(result.message || 'Could not update quantity');
    setCartActionLoading(false);
  };

  const handleDecrease = async () => {
    if (cartActionLoading) return;
    setCartActionLoading(true);
    setCartError('');
    if (cartQty <= 1) {
      // Remove from cart entirely when quantity would drop to 0
      const result = await removeFromCart(product._id);
      if (!result.success) setCartError(result.message || 'Could not remove item');
    } else {
      const result = await updateQuantity(product._id, cartQty - 1);
      if (!result.success) setCartError(result.message || 'Could not update quantity');
    }
    setCartActionLoading(false);
  };

  return (
    <div className="product-card bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/30 overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-blue-700 border border-blue-100 shadow-sm flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {product.category}
        </span>
        {/* Stock Badge */}
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

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-1.5">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-1 mb-4">
          <IndianRupee className="w-4 h-4 text-slate-700" />
          <span className="text-xl font-extrabold text-slate-900">
            {product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* View Details */}
          <Link
            to={`/products/${product._id}`}
            className="product-primary-action w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 text-center block"
          >
            View Details
          </Link>

          {/* ── Wishlist Button (Lab 04) ─────────────────────────────────────── */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`w-full py-2 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 flex items-center justify-center gap-1.5 ${
              wishlisted
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
            } disabled:opacity-60`}
          >
            <Heart
              className={`w-4 h-4 transition-all ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
            />
            {wishlistLoading
              ? '⏳ Saving...'
              : wishlisted
              ? '♥ Added to Wishlist'
              : '♡ Add to Wishlist'}
          </button>
          {wishlistError && (
            <p className="text-xs text-red-500 text-center -mt-1">{wishlistError}</p>
          )}

          {/* ── Cart Controls (Lab 05) ───────────────────────────────────────── */}
          {isInStock && (
            <>
              {cartQty === 0 ? (
                /* Not in cart → show Add button */
                <button
                  onClick={handleAddToCart}
                  disabled={cartActionLoading}
                  className="w-full py-2 px-4 rounded-xl text-sm font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartActionLoading ? 'Adding...' : 'Add to Cart'}
                </button>
              ) : (
                /* Already in cart → show [-] qty [+] controls */
                <div className={`flex items-center rounded-xl border border-emerald-200 overflow-hidden transition-opacity ${cartActionLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <button
                    onClick={handleDecrease}
                    className="flex-shrink-0 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                    title={cartQty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-sm font-bold text-emerald-800">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                    {cartQty} in cart
                  </div>
                  <button
                    onClick={handleIncrease}
                    disabled={cartQty >= product.stock}
                    className="flex-shrink-0 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              {cartError && (
                <p className="text-xs text-red-500 text-center -mt-1">{cartError}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
