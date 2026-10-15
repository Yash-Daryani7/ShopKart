import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  IndianRupee,
  AlertCircle,
  ArrowLeft,
  Lock,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import { loadRazorpayScript } from '../utils/razorpay';

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalQuantity, clearCart } = useCart();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Validate form before submitting
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = 'Valid 10-digit phone number is required';
    }

    if (!formData.addressLine1.trim()) errors.addressLine1 = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';

    const cleanPincode = formData.pincode.trim();
    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      errors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error as user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError(null);
  };

  // Main Checkout & Payment Trigger
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setServerError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create pending order and Razorpay order on backend
      const data = await orderService.createPaymentOrder(formData);
      const { orderId, razorpayOrderId, amount, currency, keyId } = data;

      if (!keyId && import.meta.env.DEV) {
        console.warn('Razorpay credentials are not configured. Using development-only simulated checkout.');
        await handleVerifySimulatedPayment(orderId, razorpayOrderId);
        return;
      }

      if (!keyId) {
        setServerError('Razorpay is not configured. Please contact the store administrator.');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Ensure Razorpay SDK script is loaded
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        setServerError('Razorpay checkout is unavailable. Please try again later.');
        setIsSubmitting(false);
        return;
      }

      // Step 3: Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${orderId.slice(-6)} Checkout`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: user?.email || '',
          contact: formData.phone,
        },
        theme: {
          color: '#2563eb', // Blue brand color
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setServerError('Payment was cancelled. Your cart has been preserved.');
          },
        },
        handler: async function (response) {
          // Step 4: Payment succeeded on Razorpay -> verify HMAC signature on backend
          try {
            const verificationPayload = {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const result = await orderService.verifyPayment(verificationPayload);

            if (result.success) {
              // Clear global cart state in memory
              clearCart();
              // Navigate to Order Success Screen
              navigate(`/order-success/${orderId}`);
            } else {
              setServerError(result.message || 'Payment signature verification failed.');
              setIsSubmitting(false);
            }
          } catch (err) {
            setServerError(
              err?.response?.data?.message || 'Failed to verify payment with server. Cart preserved.'
            );
            setIsSubmitting(false);
          }
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setIsSubmitting(false);
          setServerError(
            response.error?.description || 'Payment failed. Please retry with a valid test card.'
          );
        });
        rzp.open();
      } catch (openErr) {
        console.warn('Error opening Razorpay checkout window:', openErr);
        setServerError('Razorpay checkout could not be opened. Please try again later.');
        setIsSubmitting(false);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to initialize checkout. Please retry.';
      setServerError(errMsg);
      setIsSubmitting(false);
    }
  };

  // Helper for evaluation / simulated sandbox test
  const handleVerifySimulatedPayment = async (orderId, razorpayOrderId) => {
    if (!import.meta.env.DEV) {
      setServerError('Simulated payments are only available during development.');
      setIsSubmitting(false);
      return;
    }

    try {
      const simPayload = {
        orderId,
        razorpay_order_id: razorpayOrderId || `sim_order_${Date.now()}`,
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_signature: 'simulated_test_signature',
      };
      const result = await orderService.verifyPayment(simPayload);
      if (result.success) {
        clearCart();
        navigate(`/order-success/${orderId}`);
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Verification failed.');
      setIsSubmitting(false);
    }
  };

  // If cart is empty, render friendly empty state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-6">
          You need items in your cart before you can proceed to checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          Step 2 of 2: Checkout
        </span>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
        Secure Checkout
      </h1>

      {/* Global Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="text-sm">
            <span className="font-bold">Checkout Error: </span>
            {serverError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Shipping Address</h2>
                <p className="text-xs text-slate-500">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} id="checkoutForm" className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition ${
                    formErrors.fullName
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-xs text-red-500 font-medium mt-1">{formErrors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition ${
                    formErrors.phone
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500 font-medium mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Street Address / House No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. Flat 4B, 22 MG Road"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition ${
                    formErrors.addressLine1
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {formErrors.addressLine1 && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {formErrors.addressLine1}
                  </p>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition ${
                      formErrors.city
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.city && (
                    <p className="text-xs text-red-500 font-medium mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition ${
                      formErrors.state
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.state && (
                    <p className="text-xs text-red-500 font-medium mt-1">{formErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  6-Digit Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition ${
                    formErrors.pincode
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {formErrors.pincode && (
                  <p className="text-xs text-red-500 font-medium mt-1">{formErrors.pincode}</p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Summary & Pay CTA */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 mb-4">
              Order Summary ({totalQuantity} items)
            </h2>

            {/* Cart Items Snapshot */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-5 divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div
                  key={item.product?._id || Math.random()}
                  className="pt-3 first:pt-0 flex items-center gap-3"
                >
                  <img
                    src={
                      item.product?.image ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'
                    }
                    alt={item.product?.name || 'Product'}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity} &times; ₹{item.product?.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-slate-900 flex-shrink-0">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standard Delivery</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Fees</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-extrabold text-base text-slate-900">
                <span>Total Amount</span>
                <div className="flex items-center text-xl text-blue-600">
                  <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                  {subtotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              form="checkoutForm"
              disabled={isSubmitting}
              className={`mt-6 w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/35 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Payment…</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{subtotal.toLocaleString('en-IN')} with Razorpay</span>
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Razorpay Test Mode
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> 256-Bit SSL Secured
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
