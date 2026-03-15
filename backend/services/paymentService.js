import Razorpay from 'razorpay';
import crypto from 'crypto';

class PaymentService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_SECRET || '';
    this.isLive = this.keyId && this.keySecret &&
      !this.keyId.includes('YourTest') && !this.keyId.includes('dummy');

    if (this.isLive) {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret
      });
    }
  }

  /**
   * Create a new order for Razorpay Checkout
   * @param {number} amount - Amount in INR
   * @param {string} receiptId - Order ID or receipt ID
   * @returns {Promise<Object>} Razorpay Order Object
   */
  async createOrder(amount, receiptId) {
    if (!this.isLive) {
      // Return a mock order so the frontend flow can be tested without real credentials
      const mockId = `order_DEMO${Date.now()}`;
      console.warn('[PaymentService] Using DEMO mode. Set real RAZORPAY_KEY_ID and RAZORPAY_SECRET for live payments.');
      return {
        id: mockId,
        entity: 'order',
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: receiptId.toString(),
        status: 'created'
      };
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paisa
      currency: 'INR',
      receipt: receiptId.toString()
    };

    return await this.razorpay.orders.create(options);
  }

  /**
   * Verify Razorpay Payment Signature
   * @param {string} orderId
   * @param {string} paymentId
   * @param {string} signature
   * @returns {boolean} is valid
   */
  verifySignature(orderId, paymentId, signature) {
    if (!this.isLive) {
      // In demo mode, allow any signature so devs can complete the flow
      console.warn('[PaymentService] DEMO mode – skipping signature verification.');
      return true;
    }

    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Create Payout to Supplier (simulated for demo)
   * @param {Object} supplier - Supplier object with bank details
   * @param {number} amount - Amount in INR
   * @param {string} referenceId - Order ID or reference
   * @returns {Promise<Object>} Payout response object
   */
  async createPayout(supplier, amount, referenceId) {
    // Simulated payout — replace with real RazorpayX API call when you have a live account
    return {
      id: `pout_${Date.now()}`,
      entity: 'payout',
      fund_account_id: `fa_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      status: 'processed',
      purpose: 'payout',
      utr: `UTR${Date.now()}`,
      mode: 'IMPS',
      reference_id: referenceId.toString(),
      created_at: Math.floor(Date.now() / 1000)
    };
  }
}

export const paymentService = new PaymentService();
