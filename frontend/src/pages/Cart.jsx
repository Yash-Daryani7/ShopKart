import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  IndianRupee,
  AlertCircle,
  PackageOpen,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

// Individual row for each cart item
const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const { product, quantity } = item;
  const [loading, setLoading] = React.useState(false);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1) return; // can't go below 1 — use Remove button instead
    if (newQty > product.stock) return; // respect stock limit
    setLoading(true);
    await onUpdateQty(product._id, newQty);
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(product._id);
    setLoading(false);
  };

  const lineTotal = product.price * quantity;

  return (
    <div className={`flex gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/96?text=N/A';
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-0.5">{product.name}</h3>
        <p className="text-xs text-slate-400 mb-2">{product.category}</p>

        {/* Price per unit */}
        <div className="flex items-center gap-0.5 text-sm font-semibold text-slate-700 mb-3">
          <IndianRupee className="w-3.5 h-3.5" />
          {product.price.toLocaleString('en-IN')}
          <span className="text-slate-400 font-normal ml-1">each</span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => handleQtyChange(quantity - 1)}
              disabled={quantity <= 1 || loading}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 py-1 text-sm font-bold text-slate-900 min-w-[2.5rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQtyChange(quantity + 1)}
              disabled={quantity >= product.stock || loading}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="hidden sm:flex flex-col items-end justify-center ml-auto pl-4 border-l border-slate-100">
        <span className="text-xs text-slate-400 mb-0.5">Subtotal</span>
        <div className="flex items-center gap-0.5 text-base font-extrabold text-slate-900">
          <IndianRupee className="w-3.5 h-3.5" />
          {lineTotal.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
};

// ── Cart Page ──────────────────────────────────────────────────────────────────
const Cart = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, loading, error, fetchCart, updateQuantity, removeFromCart, subtotal, totalQuantity } = useCart();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Load cart from backend when page mounts
  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading your cart…</p>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <AlertCircle className="w-14 h-14 text-red-400" />
        <div>
          <p className="text-lg font-semibold text-slate-800">Unable to load your cart.</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchCart}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty State ──
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800">Your cart is empty 🛒</p>
          <p className="text-sm text-slate-500 mt-1.5">
            Looks like you haven't added anything yet.
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

  // ── Cart with Items ──
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <ShoppingCart className="w-7 h-7 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Cart</h1>
          <p className="text-sm text-slate-500">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {totalQuantity} unit{totalQuantity !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => (
            <CartItem
              key={item.product._id}
              item={item}
              onUpdateQty={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}

          {/* Continue Shopping */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition mt-2"
          >
            <PackageOpen className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sticky top-20">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex justify-between text-slate-600">
                  <span className="truncate max-w-[60%]">
                    {item.product.name}
                    <span className="text-slate-400 ml-1">×{item.quantity}</span>
                  </span>
                  <div className="flex items-center gap-0.5 font-semibold text-slate-700 flex-shrink-0">
                    <IndianRupee className="w-3 h-3" />
                    {(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total</span>
                <div className="flex items-center gap-0.5 text-xl font-extrabold text-slate-900">
                  <IndianRupee className="w-4 h-4" />
                  {subtotal.toLocaleString('en-IN')}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{totalQuantity} units in total</p>
            </div>

            {/* Checkout Button */}
            <button
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
