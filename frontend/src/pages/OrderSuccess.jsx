import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, MapPin, IndianRupee } from 'lucide-react';
import { orderService } from '../services/api';

const OrderSuccess = ({ user }) => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getById(id);
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error loading confirmed order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
      {/* Success Hero */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
        <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
        Payment Verified &bull; Test Mode
      </span>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
        Order Placed Successfully! 🎉
      </h1>
      <p className="text-slate-600 text-sm max-w-md mx-auto mb-8">
        Thank you for your purchase, <span className="font-semibold text-slate-800">{user?.fullName || 'Customer'}</span>. Your payment has been confirmed and order is being prepared.
      </p>

      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 text-left mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Order Reference ID</span>
            <span className="font-mono text-sm font-bold text-slate-900">{id}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Status</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {order?.status || 'PLACED'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-600 text-sm">Loading order details…</div>
        ) : order ? (
          <div className="py-5 space-y-6">
            {/* Items Snapshot */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Items Purchased</h3>
              <div className="space-y-3 divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-600">Qty: {item.quantity} &times; ₹{item.price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Delivery Address
                </h3>
                <p className="text-sm font-semibold text-slate-800">{order.shippingAddress.fullName} &bull; {order.shippingAddress.phone}</p>
                <p className="text-sm text-slate-600">
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-base font-extrabold text-slate-900">
              <span>Total Paid</span>
              <div className="flex items-center text-xl text-emerald-600">
                <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                {order.totalAmount?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition"
        >
          <Package className="w-4 h-4" />
          View My Orders
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
