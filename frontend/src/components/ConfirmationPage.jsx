import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTrain, FaUser, FaPhone, FaCog, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;
  
  
  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000080] to-[#1a1a8a] p-4 font-sans">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-2xl text-[#DA291C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#DA291C] mb-2">No Booking Data Found</h2>
          <p className="text-gray-600 mb-4">Please complete your booking first.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#000080] hover:bg-[#000066] text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 w-full"
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
const depDate = bookingData.departureDate ? new Date(bookingData.departureDate) : null;
const arrDate = bookingData.arrivalDate ? new Date(bookingData.arrivalDate) : null;

  
  console.log("Booking data received:", bookingData);
console.log("depDate:", depDate, "arrDate:", arrDate);


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e6e9ff] py-6 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#000080] text-white p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white p-2 rounded-lg mr-3">
                <FaTrain className="text-2xl text-[#DA291C]" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold">Booking Confirmation</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Review your booking details before proceeding to payment
                </p>
              </div>
            </div>
            <div className="bg-[#DA291C] text-white px-3 py-1 rounded-lg text-sm md:text-base font-mono">
              Booking Ref: IR{Date.now().toString().slice(-6)}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">

          {/* Train Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 mb-6 border border-blue-100 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="bg-[#000080] p-2 rounded-lg mr-2">
                <FaTrain className="text-white text-lg" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[#000080]">Train Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* From */}
              <div className="bg-white p-4 rounded-lg border-l-4 border-[#000080] shadow">
                <p className="font-semibold text-[#DA291C] mb-1">From</p>
                <p className="text-base md:text-xl font-bold text-[#000080] mb-2">
                  {fromName} ({from})
                </p>
               <div className="flex flex-wrap items-center text-sm text-gray-600">
  <span className="font-medium">Departs:</span> 
  <span className="ml-1">{departureTime}</span>
  <span className="mx-2">•</span>
<span>
  {depDate
    ? depDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '--'}
</span>
</div>

              </div>

              {/* To */}
           {/* To */}
<div className="bg-white p-4 rounded-lg border-l-4 border-[#DA291C] shadow">
  <p className="font-semibold text-[#DA291C] mb-1">To</p>
  <p className="text-base md:text-xl font-bold text-[#000080] mb-2">
    {toName} ({to})
  </p>
 <div className="flex flex-wrap items-center text-sm text-gray-600">
  <span className="font-medium">Arrives:</span> 
  <span className="ml-1">{arrivalTime}</span>
  <span className="mx-2">•</span>
<span>
  {arrDate
    ? arrDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '--'}
</span>
</div>

</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 md:mt-6">
              <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Train Name & Number</p>
                <p className="font-bold text-[#000080]">{trainName} ({trainNumber})</p>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-semibold text-[#000080]">{classType}</p>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Available Seats</p>
                <p className="font-semibold text-[#000080]">{availableSeats ?? 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 mb-6 border border-blue-100 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="bg-[#000080] p-2 rounded-lg mr-2">
                <FaUser className="text-white text-lg" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[#000080]">Passenger Details</h2>
              <span className="ml-2 bg-[#DA291C] text-white text-xs px-2 py-1 rounded-full">
                {passengers.length} {passengers.length === 1 ? 'Passenger' : 'Passengers'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {passengers.map((p, i) => (
                <div key={i} className="bg-white p-3 md:p-4 rounded-lg border-l-4 border-[#000080] shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-base md:text-lg text-[#000080] mb-1">{p.name}</p>
                      <div className="flex items-center text-sm text-gray-600 mb-1 md:mb-2">
                        <span>{p.age} years</span>
                        <span className="mx-1 md:mx-2">•</span>
                        <span>{p.gender}</span>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-[#000080] text-xs px-2 py-1 rounded">
                      Passenger {i + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-gray-500">Berth Preference</p>
                      <p className="text-sm font-medium text-[#000080]">{p.berthPreference}</p>
                    </div>
                    {p.idType && (
                      <div>
                        <p className="text-xs text-gray-500">{p.idType}</p>
                        <p className="text-sm font-medium truncate text-[#000080]">{p.idNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* Contact */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="bg-[#000080] p-2 rounded-lg mr-2">
                  <FaPhone className="text-white text-lg" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-[#000080]">Contact Details</h2>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-[#000080]">{contact.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-[#000080]">{contact.email}</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="bg-[#000080] p-2 rounded-lg mr-2">
                  <FaCog className="text-white text-lg" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-[#000080]">Preferences</h2>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-[#000080]">Auto Upgrade</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${preferences.autoUpgrade ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {preferences.autoUpgrade ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#000080]">Travel Insurance</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${preferences.insurance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {preferences.insurance ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Fare & Buttons */}
          <div className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] rounded-xl p-4 md:p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-blue-200 text-sm md:text-base">Total Amount to Pay</p>
                <p className="text-2xl md:text-3xl font-bold">₹{totalFare.toFixed(2)}</p>
                <p className="text-blue-200 text-xs md:text-sm mt-1">Inclusive of all taxes</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-white text-[#000080] hover:bg-gray-100 py-2 px-4 md:px-6 rounded-lg font-semibold transition-all flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-2" /> Edit Details
                </button>
                <button
                  onClick={() => navigate('/payment', { state: { bookingData } })}
                  className="bg-[#DA291C] hover:bg-[#b72219] text-white py-2 px-6 md:px-8 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-gray-500 text-xs md:text-sm mt-4">
            Your booking will be confirmed only after successful payment. 
            <span className="text-[#000080] font-medium ml-1">Terms & Conditions apply</span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
