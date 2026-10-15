const { verifyPaymentSignature } = require('../config/razorpay');

describe('payment signature verification', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  test.each(['development', 'test'])(
    'allows simulated signatures in %s',
    (nodeEnv) => {
      process.env.NODE_ENV = nodeEnv;
      expect(verifyPaymentSignature({
        razorpayOrderId: 'order_test',
        razorpayPaymentId: 'payment_test',
        razorpaySignature: 'simulated_test_signature',
      })).toBe(true);
    }
  );

  test.each(['production', undefined])(
    'rejects simulated signatures when NODE_ENV is %s',
    (nodeEnv) => {
      if (nodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = nodeEnv;
      }

      expect(verifyPaymentSignature({
        razorpayOrderId: 'order_test',
        razorpayPaymentId: 'payment_test',
        razorpaySignature: 'sim_sig_forged',
      })).toBe(false);
    }
  );
});
