import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { 
  FiClock, 
  FiMap, 
  FiDollarSign, 
  FiCalendar, 
  FiShare2,
  FiDownload,
  FiXCircle,
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiCoffee
} from "react-icons/fi";
import { MdTrain } from "react-icons/md";

import { motion, AnimatePresence } from "framer-motion";

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, train, fare
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("userToken");
      if (!token) return setError("Please login first.");

      const res = await fetch("http://localhost:5000/api/booking/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch trips");
      }

      const data = await res.json();
      setTrips(data);
      setTrips(data);
console.log("Fetched trips:", data);

// To see passengers for each trip
data.forEach(trip => {
  console.log(`Trip ${trip.trainNumber} passengers:`, trip.passengers);
});

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const getCountdown = (dateStr) => {
    const travelDate = new Date(dateStr);
    const now = new Date();
    const diffMs = travelDate - now;
    if (diffMs <= 0) return { text: "Departed", urgent: false };
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days < 2 };
    return { text: `${hours}h ${minutes}m left`, urgent: hours < 6 };
  };

  const getCardColor = (dateStr, status) => {
    if (status === "CANCELLED") return "bg-gray-100 border-l-4 border-gray-400";
    
    const travelDate = new Date(dateStr);
    const now = new Date();
    const diffDays = (travelDate - now) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 1) return "bg-red-50 border-l-4 border-red-500";
    if (diffDays < 3) return "bg-orange-50 border-l-4 border-orange-500";
    return "bg-blue-50 border-l-4 border-[#000080]";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "WAITLIST": return "bg-purple-100 text-purple-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const handleCancelTrip = async (bookingId) => {
    setCancelling(true);
    try {
      const token = sessionStorage.getItem("userToken");
      const res = await fetch(`http://localhost:5000/api/booking/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to cancel booking");
      
      // Update local state
      setTrips(trips.map(trip => 
        trip.bookingId === bookingId 
          ? { ...trip, status: "CANCELLED" } 
          : trip
      ));
      setShowCancelModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleShare = async (trip) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Trip on ${trip.trainName}`,
          text: `I'm traveling on ${trip.trainName} (${trip.trainNumber}) from ${trip.from} to ${trip.to} on ${new Date(trip.travelDate).toLocaleDateString()}.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`Trip Details: ${trip.trainName} (${trip.trainNumber}), ${trip.from} to ${trip.to}, ${new Date(trip.travelDate).toLocaleDateString()}`);
      alert('Trip details copied to clipboard!');
    }
  };

  const handleDownload = (trip) => {
    // Create a printable ticket format
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
        <h2 style="text-align: center; color: #000080;">E-Ticket</h2>
        <div style="border: 2px solid #000080; padding: 15px; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
              <strong>${trip.trainName} (${trip.trainNumber})</strong>
            </div>
            <div style="background: #000080; color: white; padding: 5px 10px; border-radius: 5px;">
              ${trip.status}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <strong>From:</strong> ${trip.from}
            </div>
            <div>
              <strong>To:</strong> ${trip.to}
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Date:</strong> ${new Date(trip.travelDate).toLocaleDateString()}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Class:</strong> ${trip.classType}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Fare:</strong> ₹${trip.totalFare}
          </div>
          <div style="text-align: center;">
            <img src="${document.querySelector(`#qr-${trip.bookingId}`).src}" alt="QR Code" style="width: 100px; height: 100px;" />
          </div>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const filteredAndSortedTrips = trips
    .filter(trip => {
      // Filter by status
      if (filter === "upcoming" && (trip.status !== "CONFIRMED" || new Date(trip.travelDate) < new Date())) 
        return false;
      if (filter === "past" && new Date(trip.travelDate) >= new Date()) 
        return false;
      if (filter === "cancelled" && trip.status !== "CANCELLED") 
        return false;
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          trip.trainName.toLowerCase().includes(term) ||
         trip.trainNumber.toString().toLowerCase().includes(term) ||
          trip.from.toLowerCase().includes(term) ||
          trip.to.toLowerCase().includes(term)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort trips
      let comparison = 0;
      
      if (sortBy === "date") {
        comparison = new Date(a.travelDate) - new Date(b.travelDate);
      } else if (sortBy === "train") {
        comparison = a.trainName.localeCompare(b.trainName);
      } else if (sortBy === "fare") {
        comparison = a.totalFare - b.totalFare;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#000080]"></div>
          <p className="mt-4 text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Trips</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchTrips}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (trips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <FiCoffee className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No trips booked yet</h3>
          <p className="mt-2 text-gray-500">When you book a trip, it will appear here.</p>
          <button 
            onClick={() => window.location.href = "/search"}
            className="mt-4 px-4 py-2 bg-[#000080] text-white rounded-md hover:bg-[#001f4d] transition"
          >
            Book Your First Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#000080]">My Trips</h1>
          <p className="text-gray-600 mt-2">Manage your upcoming and past journeys</p>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "all" ? "bg-[#000080] text-white" : "bg-gray-100 text-gray-700"}`}
              >
                All Trips
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "upcoming" ? "bg-[#000080] text-white" : "bg-gray-100 text-gray-700"}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter("past")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "past" ? "bg-[#000080] text-white" : "bg-gray-100 text-gray-700"}`}
              >
                Past Trips
              </button>
              <button
                onClick={() => setFilter("cancelled")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "cancelled" ? "bg-[#000080] text-white" : "bg-gray-100 text-gray-700"}`}
              >
                Cancelled
              </button>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 border-0 rounded-full px-4 py-2 text-sm text-[#000080]"
              >
                <option value="date">Sort by Date</option>
                <option value="train">Sort by Train</option>
                <option value="fare">Sort by Fare</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="bg-gray-100 border-0 rounded-full p-2 text-sm text-[#000080]"
              >
                {sortOrder === "asc" ? "A-Z" : "Z-A"}
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search trains, stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 border-0 rounded-full pl-10 pr-4 py-2 text-sm text-[#000080]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredAndSortedTrips.length} {filteredAndSortedTrips.length === 1 ? 'trip' : 'trips'} found
          </p>
        </div>
        
        {/* Trips List */}
        <div className="space-y-6 text-[#000080]">
          <AnimatePresence>
            {filteredAndSortedTrips.map((trip) => {
              const countdown = getCountdown(trip.travelDate);
              
              return (
                <motion.div
                  key={trip.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl shadow-lg overflow-hidden ${getCardColor(trip.travelDate, trip.status)}`}
                >
                  {/* Trip Summary */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedTrip(expandedTrip === trip.bookingId ? null : trip.bookingId)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{trip.trainName}</h3>
                          <span className="text-gray-500">({trip.trainNumber})</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-[#000080]-600 mb-2">
                          <div className="flex items-center font-bold">
                            <FiMap className="mr-1" />
                            <span>{trip.from} → {trip.to}</span>
                          </div>
                          <div className="flex items-center font-bold">
                            <FiCalendar className="mr-1" />
                            <span>{new Date(trip.travelDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center font-bold text-lg">
                           
                            <span>₹{trip.totalFare}</span>
                          </div>
                          <div className="flex items-center">
  <FiUser className="mr-1" />
  <span>
    {(() => {
      if (!trip.passengers) return 1; // default
      if (Array.isArray(trip.passengers)) return trip.passengers.length;
      if (typeof trip.passengers === "object") return Object.keys(trip.passengers).length;
      return 1; // fallback
    })()} Passenger
    {(() => {
      let count = 1;
      if (trip.passengers) {
        if (Array.isArray(trip.passengers)) count = trip.passengers.length;
        else if (typeof trip.passengers === "object") count = Object.keys(trip.passengers).length;
      }
      return count !== 1 ? "s" : "";
    })()}
  </span>
</div>

                          {trip.status === "CONFIRMED" && (
                            <div className={`flex items-center ${countdown.urgent ? 'text-red-600 font-semibold' : ''}`}>
                              <FiClock className="mr-1" />
                              <span>{countdown.text}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        {expandedTrip === trip.bookingId ? (
                          <FiChevronUp className="text-gray-500" />
                        ) : (
                          <FiChevronDown className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedTrip === trip.bookingId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* QR Code */}
                            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
                              <h4 className="font-medium mb-2 text-[#000080]">Digital Ticket</h4>
                              <QRCode
                                id={`qr-${trip.bookingId}`}
                                value={`PNR:${trip.bookingId}|Train:${trip.trainNumber}|Date:${trip.travelDate}|From:${trip.from}|To:${trip.to}`}
                                size={120}
                                bgColor="#fff"
                                fgColor="#000080"
                              />
                              <p className="text-xs text-gray-500 mt-2">Scan this QR code at the station</p>
                            </div>
                            
                            {/* Journey Progress */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h4 className="font-medium mb-2 text-[#000080]">Journey Progress</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className={new Date() > new Date(trip.travelDate) ? "font-semibold text-green-600" : ""}>
                                    Departure
                                  </span>
                                  <span className="text-gray-500">
                                    {new Date(trip.travelDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 transition-all duration-1000 ease-out"
                                    style={{
                                      width: `${Math.min(
                                        ((new Date() - new Date(trip.travelDate)) / 
                                        (new Date(trip.travelDate).getTime() + 86400000 - new Date(trip.travelDate))) * 100,
                                        100
                                      )}%`
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className={new Date() > new Date(trip.travelDate).getTime() + 86400000 ? "font-semibold text-green-600" : ""}>
                                    Completion
                                  </span>
                                  <span className="text-gray-500">
                                    {new Date(new Date(trip.travelDate).getTime() + 86400000).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Trip Actions */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h4 className="font-medium mb-2 text-[#000080]">Manage Trip</h4>
                              <div className="space-y-2">
                                <button
                                  onClick={() => handleShare(trip)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-[#000080] rounded-md hover:bg-gray-200 transition"
                                >
                                  <FiShare2 size={16} />
                                  Share
                                </button>
                                <button
                                  onClick={() => handleDownload(trip)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-[#000080] rounded-md hover:bg-gray-200 transition"
                                >
                                  <FiDownload size={16} />
                                  Download Ticket
                                </button>
                                {trip.status === "CONFIRMED" && new Date(trip.travelDate) > new Date() && (
                                  <button
                                    onClick={() => {
                                      setSelectedTrip(trip);
                                      setShowCancelModal(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-[#DA291C]rounded-md hover:bg-red-100 transition"
                                  >
                                    <FiXCircle size={16} />
                                    Cancel Trip
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Passenger Details */}
                          {/* Passenger Details */}
{trip.passengers && trip.passengers.length > 0 && (
  <div className="mt-6">
    <h4 className="text-lg font-semibold mb-3 text-[#000080]">Passenger Details</h4>
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#000080]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Age
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Gender
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Seat
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Preference
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trip.passengers.map((passenger, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {passenger.name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {passenger.age}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {passenger.gender}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#DA291C] font-semibold">
                {passenger.allocatedSeat || "Not allocated"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {passenger.seatPreference || "None"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* No results message */}
        {filteredAndSortedTrips.length === 0 && (
          <div className="text-center py-10">
            <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No trips match your criteria</h3>
            <p className="mt-2 text-gray-500">Try changing your filters or search term.</p>
          </div>
        )}
      </div>
      
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-bold mb-2">Cancel Trip</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your trip on {selectedTrip?.trainName}? 
                Cancellation fees may apply as per policy.
              </p>
              
              <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> 80% refund will be processed if cancelled more than 48 hours before departure.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                  disabled={cancelling}
                >
                  Go Back
                </button>
                <button
                  onClick={() => handleCancelTrip(selectedTrip.bookingId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2"
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cancelling...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyTrips;