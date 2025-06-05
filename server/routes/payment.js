import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

router.post('/order', auth, async (req, res) => {
  const { amount, currency = 'INR', userId } = req.body || {};
  if (!amount) return res.status(400).json({ error: 'Amount required' });
  if (userId && userId !== String(req.user._id)) {
    return res.status(403).json({ error: 'User mismatch' });
  }
  try {
    const options = {
      amount: Math.round(amount),
      currency,
      receipt: `rec_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('razorpay order error', err);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

router.post('/verify', auth, async (req, res) => {
  const { orderId, paymentId, signature } = req.body || {};
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }
  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const digest = hmac.digest('hex');
    if (digest !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    await User.findByIdAndUpdate(req.user._id, { subscriptionActive: true });
    res.json({ success: true });
  } catch (err) {
    console.error('razorpay verify error', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
