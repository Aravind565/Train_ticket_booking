import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTrain, 
  FaUser, 
  FaPhone, 
  FaCog, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaRupeeSign,
  FaArrowRight,
  FaStar,
  FaLeaf,
  FaChair
} from 'react-icons/fa';
import { 
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle
} from 'react-icons/fi';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;
  
  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000080] via-[#1a1a8a] to-[#2d2d99] p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-105 transition-all duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-3xl text-[#DA291C]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Booking Data Found</h2>
          <p className="text-gray-600 mb-6">Please complete your booking process to view confirmation details.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] hover:from-[#000066] hover:to-[#151566] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 w-full shadow-lg hover:shadow-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    trainName,
    trainNumber,
    from,
    fromName,
    to,
    toName,
    classType,
    passengers,
    contact,
    preferences,
    totalFare,
    departureTime,
    arrivalTime,
    departureDate,
    arrivalDate,
    availableSeats,
  } = bookingData;

  const depDate = departureDate ? new Date(departureDate) : null;
  const arrDate = arrivalDate ? new Date(arrivalDate) : null;

  const bookingRef = `IR${Date.now().toString().slice(-8)}`;
  
  // Calculate insurance amount if enabled
// Calculate insurance amount if enabled - ₹0.45 per passenger
const insuranceAmount = preferences.insurance ? (0.45 * passengers.length) : 0;
const baseFare = totalFare - insuranceAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 font-sans">
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .confirmation-card {
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
        
        .info-card {
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          border: 1px solid rgba(0, 0, 128, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 128, 0.1);
        }
        
        .passenger-card {
          background: white;
          border-left: 4px solid #000080;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .passenger-card:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 20px -4px rgba(0, 0, 128, 0.15);
        }
        
        .status-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .price-tag {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 12px;
          padding: 8px 16px;
        }
        
        @media (max-width: 768px) {
          .confirmation-card {
            border-radius: 20px;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header with Booking Reference */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#000080] to-[#1a1a8a] rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-white text-xl" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Booking Confirmation</h1>
              <p className="text-gray-600 text-sm">Reference: <span className="font-mono font-bold text-[#000080]">{bookingRef}</span></p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your booking has been confirmed. Review your journey details below.
          </p>
        </div>

        <div className="confirmation-card overflow-hidden">
          {/* Enhanced Header */}
          <div className="gradient-header text-white p-6 md:p-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FaTrain className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{trainName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {trainNumber}
                    </span>
                    <span className="bg-[#DA291C] px-3 py-1 rounded-full text-sm font-medium">
                      {classType}
                    </span>
                    <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <FaChair className="text-sm" />
                      {availableSeats ?? 'N/A'} seats
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white/80 text-sm">Total Amount</div>
                  <div className="text-3xl font-bold">₹{totalFare.toFixed(2)}</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaRupeeSign className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Journey Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Departure */}
              <div className="info-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Departure</h3>
                    <p className="text-gray-600 text-sm">From station</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-gray-800">{fromName}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                      {from}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-blue-500" />
                      <span className="font-medium">{departureTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-500" />
                      <span>
                        {depDate
                          ? depDate.toLocaleDateString('en-IN', { 
                              weekday: 'short',
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration & Route */}
              <div className="info-card p-6 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <FaClock className="text-[#000080]" />
                  <span className="font-bold text-lg">
                    {(() => {
                      if (!departureTime || !arrivalTime) return '--';
                      const dep = departureTime.split(':').map(Number);
                      const arr = arrivalTime.split(':').map(Number);
                      let hours = arr[0] - dep[0];
                      let minutes = arr[1] - dep[1];
                      if (minutes < 0) {
                        hours -= 1;
                        minutes += 60;
                      }
                      if (hours < 0) hours += 24;
                      return `${hours}h ${minutes}m`;
                    })()}
                  </span>
                </div>
                
                <div className="w-full relative mb-4">
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full"></div>
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow"></div>
                  <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow"></div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Direct Journey</p>
              
                </div>
              </div>

              {/* Arrival */}
              <div className="info-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Arrival</h3>
                    <p className="text-gray-600 text-sm">To station</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-gray-800">{toName}</span>
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                      {to}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-red-500" />
                      <span className="font-medium">{arrivalTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-red-500" />
                      <span>
                        {arrDate
                          ? arrDate.toLocaleDateString('en-IN', { 
                              weekday: 'short',
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="info-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Passenger Details</h3>
                    <p className="text-gray-600">{passengers.length} {passengers.length === 1 ? 'Passenger' : 'Passengers'}</p>
                  </div>
                </div>
                <div className="status-badge">
                  Confirmed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {passengers.map((passenger, index) => (
                  <div key={index} className="passenger-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#000080] to-blue-600 rounded-lg flex items-center justify-center">
                          <FiUser className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{passenger.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{passenger.age} years</span>
                            <span>•</span>
                            <span className="capitalize">{passenger.gender}</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-blue-50 text-[#000080] text-xs font-bold px-3 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Berth Preference</p>
                        <p className="font-medium text-gray-800">{passenger.berthPreference}</p>
                      </div>
                      {passenger.idType && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{passenger.idType}</p>
                          <p className="font-medium text-gray-800 truncate">{passenger.idNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Preferences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="info-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <FiPhone className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
                    <p className="text-gray-600">For booking updates</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FiPhone className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-800">{contact.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FiMail className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-semibold text-gray-800">{contact.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Preferences */}
              <div className="info-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <FaCog className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Travel Preferences</h3>
                    <p className="text-gray-600">Your choices</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FaStar className="text-yellow-500" />
                      <span className="font-medium text-gray-800">Auto Upgrade</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      preferences.autoUpgrade 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FiCheckCircle />
                      {preferences.autoUpgrade ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FaShieldAlt className="text-blue-500" />
                      <span className="font-medium text-gray-800">Travel Insurance</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      preferences.insurance 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FiCheckCircle />
                      {preferences.insurance ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

           {/* Payment Section */}
<div className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] rounded-2xl p-6 md:p-8 text-white">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-3">
        <FaRupeeSign className="text-white/80" />
        <h3 className="text-xl font-bold">Payment Summary</h3>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-white/80">Base Fare ({passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'})</span>
          <span className="font-semibold">₹{baseFare.toFixed(2)}</span>
        </div>
        
        {preferences.insurance && (
          <div className="flex justify-between items-center">
            <span className="text-white/80">Travel Insurance (₹0.45 per passenger)</span>
            <span className="font-semibold">₹{insuranceAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="pt-3 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <div className="price-tag">
              <span className="text-2xl font-bold">₹{totalFare.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-white/70 text-sm">Inclusive of all applicable taxes</p>
    </div>

    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => navigate(-1)}
        className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
      >
        <FaArrowLeft />
        Edit Details
      </button>
      <button
        onClick={() => navigate('/payment', { state: { bookingData } })}
        className="bg-gradient-to-r from-[#DA291C] to-red-600 hover:from-red-600 hover:to-[#DA291C] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        Proceed to Payment
        <FaArrowRight />
      </button>
    </div>
  </div>
</div>
            {/* Additional Information */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-500" />
                  <span>100% Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaLeaf className="text-green-500" />
                  <span>E-Ticket Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-blue-500" />
                  <span>Instant Confirmation</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Your booking will be confirmed instantly after payment. 
                <span className="text-[#000080] font-medium ml-1 cursor-pointer hover:underline">
                  View Terms & Conditions
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;