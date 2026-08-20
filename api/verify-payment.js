import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        error: 'Razorpay secret is missing'
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        error: 'Payment signature verification failed'
      });
    }

    return res.status(200).json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
