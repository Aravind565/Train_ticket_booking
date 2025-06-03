import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.bookingData || !state?.bookingId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-600">Booking Failed</h2>
        <p className="mt-2">No booking information found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          aria-label="Back to Home"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const { bookingData, bookingId, paymentId } = state;
  const formattedDate = new Date(bookingData.travelDate).toLocaleDateString();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingId);
    alert('Booking ID copied to clipboard!');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 bg-white text-black shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-green-700 mb-4">🎉 Booking Confirmed!</h1>

      <div className="mb-6">
        <p>
          <strong>Booking ID:</strong> {bookingId}{' '}
          <button
            onClick={copyToClipboard}
            className="ml-2 px-2 py-1 text-sm bg-gray-300 rounded"
            aria-label="Copy Booking ID"
          >
            Copy
          </button>
        </p>
        {paymentId && <p><strong>Payment ID:</strong> {paymentId}</p>}
        <p><strong>Train:</strong> {bookingData.trainName} ({bookingData.trainNumber})</p>
        <p><strong>Route:</strong> {bookingData.source} ➝ {bookingData.destination}</p>
        <p><strong>Date:</strong> {formattedDate}</p>
        <p><strong>Class:</strong> {bookingData.classType}</p>
        <p><strong>Total Fare:</strong> ₹{bookingData.totalFare}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">🧍 Passenger Details & Seat Allocation</h2>
      <ul className="space-y-2">
        {bookingData.passengers.map((p, index) => (
  <div key={index} className="p-4 border rounded-md shadow-md mb-3">
    <h3 className="font-semibold text-lg">Passenger {index + 1}</h3>
    <p>Name: {p.name}</p>
    <p>Age: {p.age}</p>
    <p>Gender: {p.gender}</p>
    <p>Seat: {p.allocatedSeat}</p>
    <p>Coach: {p.coachNumber}</p>
    <p>Seat Number: {p.seatNumber}</p>
    <p>Preference Given: {p.berthPreference}</p>
    <p>Preference Allocated: {p.seatPreference}</p>
  </div>
))}

      </ul>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          aria-label="Go to Home"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
