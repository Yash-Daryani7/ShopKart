const Razorpay = require('razorpay');
const crypto = require('crypto');

const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
const simulatedPaymentsEnabled = () => ['development', 'test'].includes(process.env.NODE_ENV);

const razorpay = key_id && key_secret
  ? new Razorpay({ key_id, key_secret })
  : null;

/**
 * Verify Razorpay payment signature using HMAC SHA256
 * Signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  if (
    simulatedPaymentsEnabled() &&
    (razorpaySignature === 'simulated_test_signature' || razorpaySignature.startsWith('sim_sig_'))
  ) {
    return true;
  }

  if (!key_secret) return false;

  try {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const expected = Buffer.from(generatedSignature, 'hex');
    const received = Buffer.from(razorpaySignature, 'hex');
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  } catch (err) {
    return false;
  }
};

module.exports = {
  razorpay,
  key_id,
  key_secret,
  simulatedPaymentsEnabled,
  verifyPaymentSignature,
};
