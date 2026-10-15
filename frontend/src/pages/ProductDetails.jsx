import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Package,
  IndianRupee,
  ShoppingCart,
  Loader2,
  AlertCircle,
  PackageX,
  Boxes,
  FileText,
  Heart,
  Plus,
  Minus,
} from 'lucide-react';
import { productService, wishlistService } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Wishlist state ──────────────────────────────────────────────────────────
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistChecked, setWishlistChecked] = useState(false); // has initial check run?

  // ── Cart state ──────────────────────────────────────────────────────────────
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const [cartActionLoading, setCartActionLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await productService.getById(id);
        setProduct(data.product);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else if (err.response?.status === 400) {
          setError('Invalid product ID.');
        } else {
          setError('Something went wrong while loading this product.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Check if this product is already in the user's wishlist (runs once after product loads)
  useEffect(() => {
    if (!user || !id || wishlistChecked) return;
    wishlistService.getAll()
      .then((data) => {
        const ids = new Set((data.wishlist || []).map((p) => p._id));
        setWishlisted(ids.has(id));
        setWishlistChecked(true);
      })
      .catch(() => setWishlistChecked(true));
  }, [user, id, wishlistChecked]);

  if (!user) return null;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading product details...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
          {error.includes('not found') || error.includes('Invalid') ? (
            <PackageX className="w-8 h-8 text-red-500" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-500" />
          )}
        </div>
        <p className="text-base font-bold text-slate-900 mb-1">Oops!</p>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <Link
          to="/products"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const isInStock = product.stock > 0;

  // Find this product in the cart
  const cartItem = cartItems.find((item) => item.product?._id === product._id);
  const cartQty = cartItem?.quantity || 0;

  // ── Wishlist Handler ─────────────────────────────────────────────────────────
  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await wishlistService.remove(product._id);
        setWishlisted(false);
      } else {
        await wishlistService.add(product._id);
        setWishlisted(true);
      }
    } catch (err) {
      if (err?.response?.status === 409) setWishlisted(true);
    } finally {
      setWishlistLoading(false);
    }
  };

  // ── Cart Handlers ────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
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
      const result = await removeFromCart(product._id);
      if (!result.success) setCartError(result.message || 'Could not remove item');
    } else {
      const result = await updateQuantity(product._id, cartQty - 1);
      if (!result.success) setCartError(result.message || 'Could not update');
    }
    setCartActionLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Navigation */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Product Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto bg-slate-100 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
              }}
            />
            {/* Category Badge */}
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-blue-700 border border-blue-100 shadow-sm flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              {product.category}
            </span>
          </div>

          {/* Product Info */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-1.5 mb-5">
              <IndianRupee className="w-5 h-5 text-slate-700" />
              <span className="text-3xl font-extrabold text-slate-900">
                {product.price.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <Boxes className="w-4 h-4 text-slate-500" />
              <span
                className={`text-sm font-semibold ${
                  isInStock ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {isInStock ? `${product.stock} units left` : 'Out of Stock'}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-slate-100 mb-6" />

            {/* Description */}
            <div className="mb-8 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Description
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  {product.category}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stock</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  {product.stock} units
                </p>
              </div>
            </div>

            {/* ── Action Buttons ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold border transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 ${
                  wishlisted
                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wishlistLoading
                  ? '⏳ Saving...'
                  : wishlisted
                  ? '♥ Saved to Wishlist — Click to Remove'
                  : '♡ Add to Wishlist'}
              </button>

              {/* Cart Button / Controls */}
              {isInStock ? (
                cartQty === 0 ? (
                  /* Not in cart → Add button */
                  <button
                    onClick={handleAddToCart}
                    disabled={cartActionLoading}
                    className="w-full py-3.5 px-4 text-white text-sm font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/35 disabled:opacity-70"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartActionLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                ) : (
                  /* In cart → inline [-] qty [+] controls */
                  <div className={`flex items-center rounded-xl border-2 border-emerald-400 overflow-hidden transition-opacity ${cartActionLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                    <button
                      onClick={handleDecrease}
                      className="flex-shrink-0 px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-lg transition-colors"
                      title={cartQty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex flex-col items-center justify-center py-2.5 bg-white">
                      <span className="text-xl font-extrabold text-emerald-700">{cartQty}</span>
                      <span className="text-xs text-slate-400 font-medium">in cart</span>
                    </div>
                    <button
                      onClick={handleIncrease}
                      disabled={cartQty >= product.stock}
                      className="flex-shrink-0 px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-4 bg-slate-300 text-white text-sm font-bold rounded-xl shadow-none cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Out of Stock
                </button>
              )}

              {cartError && (
                <p className="text-xs text-red-500 text-center">{cartError}</p>
              )}

              {!isInStock && (
                <p className="text-xs text-slate-400 text-center">
                  This product is currently unavailable.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
