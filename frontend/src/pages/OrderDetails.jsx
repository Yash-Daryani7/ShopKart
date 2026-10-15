import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  IndianRupee,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { orderService } from '../services/api';

const OrderDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getById(id);
        if (data.success) {
          setOrder(data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading order #{id?.slice(-6)}…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-1">Order Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This order does not exist or you do not have permission to view it.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Orders
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              ShopKart Verified Order
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Order #{order._id}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Placed on {dateStr}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Status: {order.status}
            </span>
          </div>
        </div>

        {/* Razorpay Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-800 block">Razorpay Order ID</span>
            <span className="font-mono text-slate-500">{order.razorpayOrderId || '—'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Razorpay Payment ID</span>
            <span className="font-mono text-slate-500">{order.razorpayPaymentId || '—'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Shipping Address */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" /> Shipping Destination
          </h2>
          {order.shippingAddress ? (
            <div className="text-sm space-y-1 text-slate-600">
              <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No address recorded</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Summary
            </h2>
            <div className="text-xs text-slate-500 space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-slate-800">Razorpay Test</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600">FREE</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-900">
            <span>Total Paid</span>
            <span className="text-lg font-extrabold text-blue-600 flex items-center">
              <IndianRupee className="w-4 h-4" />
              {order.totalAmount?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Snapshot Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" /> Items in this Order ({order.items?.length || 0})
          </h2>
          <span className="text-xs text-slate-400">Captured at purchase time</span>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Price at purchase: ₹{item.price?.toLocaleString('en-IN')} &times; {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-base font-extrabold text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
