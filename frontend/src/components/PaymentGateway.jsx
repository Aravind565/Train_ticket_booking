import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bookingData = state?.bookingData;

  const handlePayment = useCallback(async () => {
    if (!bookingData) {
      navigate('/');
      return;
    }

    try {
      // Step 1: Create Order
      const { data: { order } } = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        { amount: bookingData.totalFare }
      );
  console.log('RAZORPAY KEY:', import.meta.env.VITE_RAZORPAY_KEY_ID);
      // Step 2: Open Razorpay Checkout
   const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: 'INR',
  order_id: order.id,
  name: 'Train Ticket Booking',
  description: `Booking for ${bookingData.trainName}`,
  handler: async (response) => {
    try {
      console.log("Sending bookingData to backend:", bookingData);  
      const { data } = await axios.post(
        'http://localhost:5000/api/payment/verify-payment',
        { ...response, bookingData }
      );

      // Adjusted check:
      if (data.success || data.message === "Payment verified and booking saved") {
       navigate('/booking-success', {
  state: {
    bookingData: {
      ...bookingData,
      passengers: data.passengers,
      trainName: data.trainName,
      route: data.route,
      date: data.date,
      classType: data.classType,
      totalFare: data.totalFare
    },
    paymentId: response.razorpay_payment_id,
    bookingId: data.bookingId
  }
});
      } else {
        alert('Payment verification failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Verification error: ' + error.message);
    }
  },
  prefill: {
    name: bookingData.passengers?.[0]?.name || '',
    email: bookingData.contact.email,
    contact: bookingData.contact.phone,
  },
  theme: { color: '#000080' },
};


      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Payment initialization failed: ' + error.message);
      navigate('/'); // Redirect on error
    }
  }, [bookingData, navigate]);

  useEffect(() => {
    handlePayment();
  }, [handlePayment]);

  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold mb-4">Processing Payment...</h2>
      <p>Redirecting to Razorpay checkout.</p>
    </div>
  );
};

export default PaymentGateway;