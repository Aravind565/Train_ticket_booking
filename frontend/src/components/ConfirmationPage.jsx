import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;

  if (!bookingData) {
    return (
      <div className="p-8 text-center font-sans text-[#DA291C]">
        <h2 className="text-2xl font-bold mb-4">Error: No booking data found.</h2>
        <p className="mb-6">Please complete your booking first.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#DA291C] hover:bg-[#b72219] text-white px-6 py-2 rounded-md transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    userId,
  trainName,
  trainNumber,
  from,
  to,

  classType,
  travelDate,
  passengers,
  contact,
  preferences,
  totalFare,
  departureTime,
  arrivalTime
} = bookingData;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg font-sans text-[#000080]">
      <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">Booking Confirmation</h1>

      {/* Train Details */}
      <section className="mb-8 border-b border-gray-300 pb-6">
        <h2 className="text-xl font-semibold mb-4 border-l-4 border-[#DA291C] pl-3 text-[#DA291C]">Train Details</h2>
        <p className="mb-1"><span className="font-semibold">Train Name:</span> {trainName}</p>
        <p className="mb-1"><span className="font-semibold">Train Number:</span> {trainNumber}</p>
        <p className="mb-1"><span className="font-semibold">From:</span> {from}</p>
        <p className="mb-1"><span className="font-semibold">To:</span> {to}</p>
        <p className="mb-1"><span className="font-semibold">Class:</span> {classType}</p>
        <p className="mb-1"><span className="font-semibold">Departure time:</span> {departureTime}</p>
        <p className="mb-1"><span className="font-semibold">Arrival time:</span> {arrivalTime}</p>
        <p className="mb-1">
          <span className="font-semibold">Travel Date:</span>{' '}
          {new Date(travelDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </section>

      {/* Passenger Details */}
      <section className="mb-8 border-b border-gray-300 pb-6">
        <h2 className="text-xl font-semibold mb-4 border-l-4 border-[#DA291C] pl-3 text-[#DA291C]">Passenger Details</h2>
        {passengers.map((p, i) => (
          <div
            key={i}
            className="mb-4 p-4 bg-white rounded-md shadow-sm border-l-4 border-[#000080]"
          >
            <p className="font-semibold mb-2 text-[#DA291C]">Passenger {i + 1}</p>
            <p className="mb-1"><span className="font-semibold">Name:</span> {p.name}</p>
            <p className="mb-1"><span className="font-semibold">Age:</span> {p.age}</p>
            <p className="mb-1"><span className="font-semibold">Gender:</span> {p.gender}</p>
            <p className="mb-1"><span className="font-semibold">Berth Preference:</span> {p.berthPreference}</p>
            {p.idType && (
              <p className="mb-1">
                <span className="font-semibold">{p.idType}:</span> {p.idNumber}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Contact Details */}
      <section className="mb-8 border-b border-gray-300 pb-6">
        <h2 className="text-xl font-semibold mb-4 border-l-4 border-[#DA291C] pl-3 text-[#DA291C]">Contact Details</h2>
        <p className="mb-1"><span className="font-semibold">Phone:</span> {contact.phone}</p>
        <p><span className="font-semibold">Email:</span> {contact.email}</p>
      </section>

      {/* Preferences */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-l-4 border-[#DA291C] pl-3 text-[#DA291C]">Preferences</h2>
        <p className="mb-1">Auto Upgrade: {preferences.autoUpgrade ? 'Yes' : 'No'}</p>
        <p>Travel Insurance: {preferences.insurance ? 'Yes' : 'No'}</p>
      </section>

      {/* Total Fare */}
      <div className="text-center text-2xl font-bold text-[#000080] mb-8">
        Total Fare: ₹{totalFare.toFixed(2)}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
  onClick={() => navigate('/payment', { state: { bookingData } })}
  className="bg-[#000080] hover:bg-[#000066] text-white py-3 px-8 rounded-md font-semibold transition"
>
  Confirm Booking
</button>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#DA291C] hover:bg-[#b72219] text-white py-3 px-8 rounded-md font-semibold transition"
        >
          Go Back & Edit
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
