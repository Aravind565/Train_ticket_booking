import React, { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaTrain, 
  FaUser, 
  FaCreditCard, 
  FaShieldAlt, 
  FaLock, 
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRupeeSign
} from 'react-icons/fa';
import { 
  FiArrowLeft,
  FiClock,
  FiMapPin
} from 'react-icons/fi';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bookingData = state?.bookingData;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  const handlePayment = useCallback(async () => {
    if (!bookingData) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Create Order
     const { data: { order } } = await axios.post(
  `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-order`,
  { amount: bookingData.totalFare }
);


      // Step 2: Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        order_id: order.id,
        name: 'Indian Railways',
        description: `Booking for ${bookingData.trainName} (${bookingData.trainNumber})`,
        handler: async (response) => {
        try {
  console.log("Sending bookingData to backend:", bookingData);
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/payment/verify-payment`,
    { ...response, bookingData }
  );


            if (data.success || data.message === "Payment verified and booking saved") {
              navigate('/booking-success', {
                state: {
                  bookingData: {
                    ...bookingData,
                    passengers: data.passengers || bookingData.passengers,
                    pnr: data.pnr || bookingData.pnr,
                  },
                  paymentId: response.razorpay_payment_id,
                  bookingId: data.bookingId,
                }
              });
            } else {
              setError('Payment verification failed: ' + (data.error || 'Unknown error'));
            }
          } catch (error) {
            setError('Verification error: ' + error.message);
          }
        },
        prefill: {
          name: bookingData.passengers?.[0]?.name || '',
          email: bookingData.contact.email,
          contact: bookingData.contact.phone,
        },
        theme: { 
          color: '#000080',
          backdrop_color: '#1e40af'
        },
        modal: {
          ondismiss: function() {
            setPaymentInitialized(false);
            setError('Payment was cancelled. You can try again.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPaymentInitialized(true);
      
    } catch (error) {
      setError('Payment initialization failed: ' + error.message);
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingData, navigate]);

  useEffect(() => {
    // Small delay to show the beautiful UI before initiating payment
    const timer = setTimeout(() => {
      handlePayment();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [handlePayment]);

  const handleRetry = () => {
    setError(null);
    handlePayment();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Booking Data</h2>
          <p className="text-gray-600 mb-6">Please complete your booking process first.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 w-full shadow-lg hover:shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 font-sans">
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .payment-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 128, 0.15);
        }
        
        .gradient-header {
          background: linear-gradient(135deg, #000080 0%, #1a1a8a 50%, #2d2d99 100%);
          position: relative;
          overflow: hidden;
        }
        
        .gradient-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }
        
        .loading-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .security-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#000080] to-[#1a1a8a] rounded-xl flex items-center justify-center">
              <FaCreditCard className="text-white text-xl" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Secure Payment</h1>
              <p className="text-gray-600 text-sm">Complete your booking with Razorpay</p>
            </div>
          </div>
        </div>

        <div className="payment-card overflow-hidden">
          {/* Header */}
          <div className="gradient-header text-white p-6 md:p-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FaTrain className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{bookingData.trainName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {bookingData.trainNumber}
                    </span>
                    <span className="bg-[#DA291C] px-3 py-1 rounded-full text-sm font-medium">
                      {bookingData.classType}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white/80 text-sm">Amount to Pay</div>
                  <div className="text-3xl font-bold">₹{bookingData.totalFare?.toFixed(2)}</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaRupeeSign className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Journey Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <FiMapPin className="text-blue-600 text-xl" />
                  <h3 className="font-semibold text-gray-800">Journey Route</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{bookingData.fromName}</p>
                      <p className="text-sm text-gray-600">{bookingData.from}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{bookingData.departureTime}</p>
                      <p className="text-sm text-gray-600">
                        {bookingData.departureDate ? new Date(bookingData.departureDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '--'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-4/5 h-1 bg-gradient-to-r from-blue-500 to-red-500 rounded-full relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-purple-500"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{bookingData.toName}</p>
                      <p className="text-sm text-gray-600">{bookingData.to}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{bookingData.arrivalTime}</p>
                      <p className="text-sm text-gray-600">
                        {bookingData.arrivalDate ? new Date(bookingData.arrivalDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '--'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <FaUser className="text-green-600 text-xl" />
                  <h3 className="font-semibold text-gray-800">Passenger Details</h3>
                </div>
                <div className="space-y-3">
                  {bookingData.passengers?.map((passenger, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-semibold text-gray-800">{passenger.name}</p>
                        <p className="text-sm text-gray-600">
                          {passenger.age} yrs • {passenger.gender}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="text-center mb-8">
              {loading && !paymentInitialized && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#000080] to-[#1a1a8a] rounded-2xl flex items-center justify-center mx-auto loading-pulse">
                    <FaSyncAlt className="text-white text-2xl animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Initializing Payment</h3>
                    <p className="text-gray-600">Preparing secure payment gateway...</p>
                  </div>
                </div>
              )}

              {paymentInitialized && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                    <FaCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Gateway Ready</h3>
                    <p className="text-gray-600">Razorpay checkout window should open automatically</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                    <FaExclamationTriangle className="text-red-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Issue</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={handleGoBack}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <FiArrowLeft />
                        Go Back
                      </button>
                      <button
                        onClick={handleRetry}
                        className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] hover:from-[#000066] hover:to-[#151566] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <FaSyncAlt />
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Features */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <FaLock className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">256-bit SSL Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Instant Confirmation</span>
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm">
                Your payment is securely processed by Razorpay. We never store your card details.
              </p>
            </div>

            {/* Manual Payment Trigger */}
            {!paymentInitialized && !error && (
              <div className="text-center mt-6">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] hover:from-[#000066] hover:to-[#151566] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <FaSyncAlt className="animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaCreditCard />
                      Proceed to Payment
                    </div>
                  )}
                </button>
                <p className="text-gray-500 text-sm mt-3">
                  You will be redirected to Razorpay's secure payment page
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;