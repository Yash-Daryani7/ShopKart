import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  Clock,
  IndianRupee,
  ShoppingBag,
  AlertCircle,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { orderService } from '../services/api';

const Orders = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getAll();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err?.response?.data?.message || 'Failed to load order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Loading State
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading your orders…</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-1">Unable to Load Orders</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty State
  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5 text-slate-400">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Orders Yet</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
          You have not placed any orders yet. Discover our curated collection and make your first purchase!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and track all your previous purchases ({orders.length} order{orders.length > 1 ? 's' : ''})
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-blue-600 hover:bg-blue-50 transition border border-blue-200 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const dateStr = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—';

          const isPaid = order.paymentStatus === 'PAID';

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition duration-200"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700 uppercase tracking-wider block">Order ID</span>
                    <span className="font-mono text-sm font-bold text-slate-900">#{order._id.slice(-8)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 uppercase tracking-wider block">Date Placed</span>
                    <span className="text-sm text-slate-800 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateStr}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 uppercase tracking-wider block">Total Amount</span>
                    <span className="text-sm font-bold text-slate-900 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    {order.status || 'PENDING'}
                  </span>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                  >
                    Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-4 sm:p-6 divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          Qty: {item.quantity} &times; ₹{item.price?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
