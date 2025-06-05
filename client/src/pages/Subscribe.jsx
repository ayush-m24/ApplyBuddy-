import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Subscribe() {
  const [message, setMessage] = useState('');

  const handleSubscribe = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.id) {
      setMessage('Please login first');
      return;
    }
    try {
      const resp = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 19900, userId: user.id }),
      });
      const data = await resp.json();
      if (!data.id) throw new Error('Order creation failed');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency,
        name: 'ApplyBuddy',
        order_id: data.id,
        prefill: {
          name: user.name,
          email: user.email,
        },
        handler: async function (response) {
          try {
            const verifyResp = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyResp.json();
            if (verifyData.success) {
              setMessage('Subscription activated! Redirecting...');
              localStorage.setItem(
                'user',
                JSON.stringify({ ...user, subscriptionActive: true })
              );
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1500);
            } else {
              setMessage('Payment verification failed');
            }
          } catch (err) {
            setMessage('Payment verification failed');
          }
        },
        theme: { color: '#2b6cb0' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage('Failed to start payment');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.button
        onClick={handleSubscribe}
        whileHover={{ scale: 1.05 }}
        className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
      >
        Subscribe Now
      </motion.button>
      {message && <p className="text-center mt-2">{message}</p>}
    </motion.div>
  );
}
