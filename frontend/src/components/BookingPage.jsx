  import React, { useEffect, useState } from 'react';
  import { useParams, useLocation, useNavigate } from 'react-router-dom';
  import axios from 'axios';
  import { FaTrain, FaUser, FaPhone, FaEnvelope, FaPlus, FaTrash, FaChevronRight, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';
  import { MdDateRange, MdDirectionsRailway, MdAccessTime } from 'react-icons/md';

  const sleeperBerthOptions = [
    "No preference",
    "Lower",
    "Middle",
    "Upper",
    "Side Lower",
    "Side Upper"
  ];

  const sittingBerthOptions = [
    "No preference",
    "Window seat"
  ];

  // Combined options for trains with multiple class types
  const allBerthOptions = [
    "No preference",
    "Lower",
    "Middle", 
    "Upper",
    "Side Lower",
    "Side Upper",
    "Window seat"
  ];

  const idTypes = [
    "AADHAR ID/VIRTUAL ID",
    "BANK PASSBOOK",
    "CREDIT CARD WITH PHOTO",
    "DRIVING LICENSE",
    "GOVT ISSUED ID-CARD",
    "PAN CARD",
    "PASSPORT/TRAVEL DOCUMENT",
    "STUDENT ID-CARD",
    "VOTER ID-CARD"
  ];

  const genderOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" }
  ];

  const BookingPage = () => {
    const { trainId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const classType = searchParams.get('class');

    const [bookingInfo, setBookingInfo] = useState(null);
    const [trainDetails, setTrainDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [passengers, setPassengers] = useState([
      { name: '', age: '', gender: '', berthPreference: 'No preference', idType: '', idNumber: '' }
    ]);
    const [contact, setContact] = useState({ phone: '', email: '' });
    const [preferences, setPreferences] = useState({ autoUpgrade: false, insurance: false });
    const [errors, setErrors] = useState({ phone: '', email: '', passengers: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);
  const queryParams = new URLSearchParams(location.search);
    const nextWL = queryParams.get('nextWL');
    useEffect(() => {
  const fetchTrainAndBookingInfo = async () => {
    setIsLoading(true);
    try {
      // Fetch train details
    const trainRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/trains/${trainId}`);
      if (!trainRes.data) throw new Error('No train data received');
      
      const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const trainData = trainRes.data;
      const numericRunningDays = (trainData.runningDays || []).map(day => dayMap[day]);

      setTrainDetails({ ...trainData, numericRunningDays });

      // Fetch booking info
 const bookingInfoRes = await axios.get(
  `${import.meta.env.VITE_API_BASE_URL}/api/booking/train/${trainId}/booking-info`,
  {
    params: {
      from,
      to,
      classType,
      date,
    },
  }
);

      if (!bookingRes.data) throw new Error('No booking data received');
      setBookingInfo(bookingRes.data);
    } catch (err) {
      console.error('Failed to load train or booking info:', err);
      // Set state to show error to user
      setTrainDetails(null);
      setBookingInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

      if (trainId && from && to && classType && date) {
      console.log('Fetching train and booking info...');
      fetchTrainAndBookingInfo();
    }
  }, [trainId, from, to, classType, date]);

    // Get station details and timing info from the train data
    const getStationDetails = () => {
      if (!trainDetails || !trainDetails.route) return { departure: null, arrival: null };

      const normalize = str => str.trim().toLowerCase();

      const fromStation = trainDetails.route.find(station => 
        normalize(station.stationCode) === normalize(from) || 
        normalize(station.stationName) === normalize(from)
      );

      const toStation = trainDetails.route.find(station => 
        normalize(station.stationCode) === normalize(to) || 
        normalize(station.stationName) === normalize(to)
      );

      return {
        departure: fromStation,
        arrival: toStation
      };
    };

    // Calculate journey duration and dates
   // Accept travelDate as parameter
const calculateJourneyDetails = () => {
  const { departure, arrival } = getStationDetails();
  if (!departure || !arrival || !date) return { 
    duration: "-- hrs -- mins", 
    departureDate: new Date(date),  // fallback
    arrivalDate: new Date(date)     // fallback
  };

  const depTimeStr = departure.departureTime || "00:00";
  const arrTimeStr = arrival.arrivalTime || "00:00";

  const baseDate = new Date(date);

  const departureTimeInMinutes = convertTimeToMinutes(depTimeStr);
  const arrivalTimeInMinutes = convertTimeToMinutes(arrTimeStr);

  let diffMinutes = arrivalTimeInMinutes - departureTimeInMinutes;
  const isOvernightJourney = diffMinutes < 0;
  if (isOvernightJourney) diffMinutes += 24 * 60;

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  const departureDate = new Date(baseDate);
  const arrivalDate = new Date(baseDate);
  if (isOvernightJourney) arrivalDate.setDate(arrivalDate.getDate() + 1);

  return {
    duration: `${hours} hrs ${mins} mins`,
    departureDate,
    arrivalDate,
    isOvernightJourney
  };
};



    // Convert time string to minutes for calculations
    const convertTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Format date for display
    const formatDate = (date) => {
      if (!date) return '--';
      return date.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    };

    // Format date with year for detailed display
    const formatDetailedDate = (date) => {
      if (!date) return '--';
      return date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    };

    // Updated berth preference logic
    const getBerthOptions = () => {
    if (!classType) return ["No preference"]; // Default if no class selected
    
    const sleeperClasses = ["1A", "2A", "3A", "SL"];
    const sittingClasses = ["2S", "CC"];
    
    // Convert to lowercase for case-insensitive comparison
    const selectedClass = classType.toUpperCase();
    
    if (sleeperClasses.includes(selectedClass)) {
      return [
        "No preference",
        "Lower",
        "Middle",
        "Upper",
        "Side Lower",
        "Side Upper"
      ];
    }
    
    if (sittingClasses.includes(selectedClass)) {
      return [
        "No preference",
        "Window seat"
      ];
    }
    
    // Default fallback
    return ["No preference"];
  };
    const handlePassengerChange = (index, field, value) => {
      const updated = [...passengers];
      updated[index][field] = value;

      if (field === "idType" && !value) {
        updated[index].idNumber = "";
      }

      setPassengers(updated);
      
      // Clear errors when correcting
      if (errors.passengers[index]?.[field]) {
        const newErrors = {...errors};
        delete newErrors.passengers[index][field];
        setErrors(newErrors);
      }
    };

    const addPassenger = () => {
      if (passengers.length < 6) {
        setPassengers([...passengers, { name: '', age: '', gender: '', berthPreference: 'No preference', idType: '', idNumber: '' }]);
      }
    };

    const removePassenger = index => {
      setPassengers(passengers.filter((_, i) => i !== index));
    };

    const validateForm = () => {
    let valid = true;
    const newErrors = { phone: '', email: '', passengers: [] };

    // Phone validation - ensure exactly +91 followed by 10 digits
    if (!/^\+91\d{10}$/.test(contact.phone)) {
      newErrors.phone = "Enter valid 10-digit Indian number with +91";
      valid = false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      newErrors.email = "Valid email required";
      valid = false;
    }

    // Passenger validations
    passengers.forEach((p, idx) => {
      let passengerErrors = {};
      if (!p.name.trim()) {
        passengerErrors.name = "Name required";
        valid = false;
      }
      if (!p.age || isNaN(p.age) || p.age < 1 || p.age > 120) {
        passengerErrors.age = "Valid age (1-120) required";
        valid = false;
      }
      if (!p.gender) {
        passengerErrors.gender = "Gender required";
        valid = false;
      }
      // Ensure optional fields at least send empty string instead of undefined
      if (!p.idType) p.idType = "";
      if (!p.idNumber) p.idNumber = "";
      if (!p.berthPreference) p.berthPreference = "No preference";
      
      newErrors.passengers[idx] = passengerErrors;
    });

    setErrors(newErrors);
    return valid;
  };
  const user = JSON.parse(sessionStorage.getItem('userData'));
   const handleNext = (e) => {
  e.preventDefault();

  // 1️⃣ Check if user is logged in
  const user = JSON.parse(sessionStorage.getItem('userData'));
  if (!user) {
    alert('Please log in to proceed with booking');
    return;
  }

  // 2️⃣ Validate form
  if (!validateForm()) return;

  // 3️⃣ Get station details
  const { departure, arrival } = getStationDetails();
  if (!departure || !arrival) {
    alert("Could not find departure or arrival station. Please check your selections.");
    return;
  }

  if (!date) {
    alert("Travel date not selected.");
    return;
  }

  // 4️⃣ Calculate journey details
  const journeyDetails = calculateJourneyDetails();
  if (!journeyDetails.departureDate || !journeyDetails.arrivalDate) {
    alert("Could not calculate journey dates. Please check your selections.");
    return;
  }

  console.log("Journey details:", journeyDetails);

  // 5️⃣ Calculate total fare
  const totalFare =
    bookingInfo.fare * passengers.length +
    (preferences.insurance ? 0.45 * passengers.length : 0);

  // 6️⃣ Prepare booking data with guaranteed dates
  const bookingData = {
    userId: user._id,
    trainId,
    trainNumber: bookingInfo.trainNumber,
    trainName: bookingInfo.trainName,
    from,
    fromName: departure.stationName,
    to,
    toName: arrival.stationName,
    classType,
    travelDate: date,
    passengers,
    contact,
    preferences,
    totalFare,
    departureTime: departure.departureTime || '--:--',
    arrivalTime: arrival.arrivalTime || '--:--',
    departureDate: journeyDetails.departureDate.toISOString(),
    arrivalDate: journeyDetails.arrivalDate.toISOString(),
    availableSeats: bookingInfo.availability || bookingInfo.availableSeats || 'N/A',
  };

  console.log("Final bookingData sent to confirmation page:", bookingData);

  // 7️⃣ Navigate to ConfirmationPage with bookingData
  navigate('/confirmation', { state: { bookingData } });
};


    // Format day of the week for display
    const formatRunningDay = (dayNum) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[dayNum];
    };

    // Early returns for loading and error states
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#000080] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading booking information...</p>
          </div>
        </div>
      );
    }

    if (!bookingInfo || !trainDetails) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Information Not Available</h2>
            <p className="text-gray-600 mb-4">We couldn't load the train or booking information. Please try again later.</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-[#000080] text-white px-4 py-2 rounded hover:bg-[#00005c] transition"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    // Get computed values
    const { departure, arrival } = getStationDetails();
    const { duration, departureDate, arrivalDate, isOvernightJourney } = calculateJourneyDetails();
    const departureTime = departure?.departureTime || '--:--';
    const arrivalTime = arrival?.arrivalTime || '--:--';
    const runningDays = trainDetails.numericRunningDays || [];
    const berthOptions = getBerthOptions();

    return (
      <div className="min-h-screen bg-gray-50 pb-12">
       
        <div className="container mx-auto px-4 py-4">
          {/* Enhanced Journey Summary Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-200">
            {/* Header Section */}
            <div className="p-4 bg-gradient-to-r from-[#000080] to-[#1a237e] text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <h2 className="text-xl font-bold">{bookingInfo.trainName}</h2>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm bg-white rounded-full px-3 py-1 text-[#000080]">
                      {bookingInfo.trainNumber}
                    </span>
                    <span className="hidden sm:inline-block h-5 border-r border-white/50"></span>
                    <span className="text-sm font-semibold">{from} → {to}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-yellow-300" />
                  <span className="font-semibold">
                    {formatDetailedDate(departureDate)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Journey Details Section */}
            <div className="p-6">
              {/* Main Journey Timeline */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between relative">
                  {/* Departure */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Departure</span>
                    </div>
                    <div className="text-3xl font-bold text-[#000080] mb-1">{departureTime}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      {departure?.stationName || from} ({departure?.stationCode || from})
                    </div>
                    <div className="text-sm font-semibold text-[#000080]">
                      {formatDate(departureDate)}
                    </div>
                  </div>

                  {/* Journey Line */}
                  <div className="flex flex-col md:flex-row items-center justify-center flex-1 mx-4 my-4 md:my-0">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-red-500"></div>
                    <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-green-500 to-red-500"></div>
                    <div className="bg-white px-3 py-1 rounded-full shadow-md mx-2">
                      <p className="flex items-center gap-1 text-xs font-bold font-montserrat text-[#000080]">
                        <MdAccessTime/>{duration}
                      </p>
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-red-500"></div>
                    <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-green-500 to-red-500"></div>
                  </div>

                  {/* Arrival */}
                  <div className="flex flex-col items-center md:items-end text-center md:text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-[#DA291C] rounded-full"></div>
                      <span className="text-sm font-medium text-[#DA291C]">Arrival</span>
                    </div>
                    <div className="text-3xl font-bold text-[#000080] mb-1">{arrivalTime}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      {arrival?.stationName || to} ({arrival?.stationCode || to})
                    </div>
                    <div className="text-sm font-semibold text-[#000080]">
                      {formatDate(arrivalDate)}
                      {isOvernightJourney && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          +1 Day
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MdDirectionsRailway className="text-blue-600" size={20} />
                    <span className="text-sm font-medium text-blue-600">Class</span>
                  </div>
                  <div className="font-bold text-lg text-gray-800">{classType?.toUpperCase()}</div>
                </div>
                
      <div className={`p-4 rounded-lg ${queryParams.get('bookingType') === 'WAITLISTED' ? 'bg-[#FFE5E5]' : 'bg-green-50'}`}>
    <div className="flex items-center gap-2 mb-2">
      <svg className={`w-5 h-5 ${queryParams.get('bookingType') === 'WAITLISTED' ? 'text-[#DA291C]' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className={`text-sm font-medium ${queryParams.get('bookingType') === 'WAITLISTED' ? 'text-[#DA291C]' : 'text-green-600'}`}>
        Availability
      </span>
    </div>

    <div className={`font-bold text-lg ${queryParams.get('bookingType') === 'WAITLISTED' ? 'text-[#DA291C]' : 'text-green-600'}`}>
      {queryParams.get('bookingType') === 'WAITLISTED'
        ? `WL ${nextWL}`
        : `Available ${bookingInfo.availability}`}
    </div>
  </div>


                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaRupeeSign className="text-purple-600" size={16} />
                    <span className="text-sm font-medium text-purple-600">Base Fare</span>
                  </div>
                  <div className="font-bold text-lg text-gray-800">₹{bookingInfo.fare}</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MdDateRange className="text-orange-600" size={20} />
                    <span className="text-sm font-medium text-orange-600">Journey Type</span>
                  </div>
                  <div className="font-bold text-lg text-gray-800">
                    {isOvernightJourney ? 'Overnight' : 'Same Day'}
                  </div>
                </div>
              </div>
              
              {/* Running Days */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Running Days</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <span 
                          key={index} 
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            runningDays.includes(index)
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                          title={formatRunningDay(index)}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full"></div>
                      <span>Runs on respective day</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full"></div>
                      <span>Does not run</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Form */}
            <div className="lg:w-2/3">
              {/* Passenger Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-bold text-[#000080] flex items-center">
                    <FaUser className="mr-2" /> Passenger Details
                  </h3>
                </div>
                
                <div className="p-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-[#000080] text-lg">Passenger {index + 1}</h4>
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded flex items-center transition"
                          >
                            <FaTrash className="mr-1 text-xs" /> Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                          <input
                            type="text"
                            placeholder="Enter full name"
                            value={passenger.name}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            className={`w-full bg-white text-[#000080] p-3 border rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition ${errors.passengers[index]?.name ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          />
                          {errors.passengers[index]?.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.passengers[index].name}</p>
                          )}
                        </div>

                        {/* Age */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            placeholder="Age"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            className={`w-full bg-white text-[#000080] p-3 border rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition ${errors.passengers[index]?.age ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          />
                          {errors.passengers[index]?.age && (
                            <p className="mt-1 text-xs text-red-600">{errors.passengers[index].age}</p>
                          )}
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className={`w-full p-3 bg-white text-[#000080] border rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition ${errors.passengers[index]?.gender ? 'border-red-500' : 'border-gray-300'}`}
                            required
                          >
                            <option value="">Select Gender</option>
                            {genderOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          {errors.passengers[index]?.gender && (
                            <p className="mt-1 text-xs text-red-600">{errors.passengers[index].gender}</p>
                          )}
                        </div>

                        {/* Berth Preference */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Berth Preference</label>
                          <select
    value={passenger.berthPreference}
    onChange={(e) => handlePassengerChange(index, 'berthPreference', e.target.value)}
    className="w-full p-3 bg-white text-[#000080] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition"
  >
    {berthOptions.map((option, i) => (
      <option key={i} value={option}>{option}</option>
    ))}
  </select>
                        </div>

                        {/* ID Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Type</label>
                          <select
                            value={passenger.idType}
                            onChange={(e) => handlePassengerChange(index, 'idType', e.target.value)}
                            className="w-full p-3 bg-white text-[#000080] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition"
                          >
                            <option value="">Select ID Proof (Optional)</option>
                            {idTypes.map((type, i) => (
                              <option key={i} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        {/* ID Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Number</label>
                          <input
                            type="text"
                            placeholder="Enter if ID type selected"
                            value={passenger.idNumber}
                            onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                            className="w-full p-3 bg-white text-[#000080] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition"
                            disabled={!passenger.idType}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                    {passengers.length < 6 && (
                    <button
                      type="button"
                      onClick={addPassenger}
                      className="mt-4 p-3 border-2 bg-white border-dashed border-[#000080] text-[#000080] rounded-lg  transition flex items-center justify-center font-medium"
                    >
                      <FaPlus className="mr-2" /> Add Another Passenger
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Details Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-bold text-[#000080] flex items-center">
                    <FaPhone className="mr-2" /> Contact Details
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                      <input
                        type="tel"
                        placeholder="+91XXXXXXXXXX"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        className={`w-full p-3 bg-white text-[#000080] border rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                      )}
                      <p className="mt-1 text-xs text-[#000080]">Booking details will be sent to this number</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        className={`w-full p-3 bg-white text-[#000080] border rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                      <p className="mt-1 text-xs text-[#000080]">Ticket will be sent to this email</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-bold text-[#000080]">Travel Preferences</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Auto Upgrade */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="autoUpgrade"
                        checked={preferences.autoUpgrade}
                        onChange={(e) => setPreferences({ ...preferences, autoUpgrade: e.target.checked })}
                        className="mt-1 w-4 h-4 text-[#000080] border-gray-300 rounded focus:ring-[#000080]"
                      />
                      <div>
                        <label htmlFor="autoUpgrade" className="font-medium text-gray-700 cursor-pointer">
                          Auto Upgrade (Subject to availability)
                        </label>
                        <p className="text-sm text-[#000080]">
                          Automatically upgrade to higher class if available at time of booking
                        </p>
                      </div>
                    </div>

                    {/* Travel Insurance */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="insurance"
                        checked={preferences.insurance}
                        onChange={(e) => setPreferences({ ...preferences, insurance: e.target.checked })}
                        className="mt-1 w-4 h-4 text-[#000080] border-gray-300 rounded focus:ring-[#000080]"
                      />
                      <div>
                        <label htmlFor="insurance" className="font-medium text-gray-700 cursor-pointer">
                          Travel Insurance (₹0.45 per passenger)
                        </label>
                        <p className="text-sm text-[#000080]">
                          Cover your journey with comprehensive travel insurance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Booking Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
                <div className="p-4 bg-gradient-to-r from-[#000080] to-[#1a237e] text-white">
                  <h3 className="text-lg font-bold">Booking Summary</h3>
                </div>
                
                <div className="p-6">
                  {/* Journey Info */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Journey</span>
                      <span className="text-sm text-[#000080] font-medium">{from} → {to}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-sm text-[#000080] font-medium">{formatDetailedDate(departureDate)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Class</span>
                      <span className="text-sm text-[#000080]  font-medium">{classType.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Passengers</span>
                      <span className="text-sm text-[#000080] font-medium">{passengers.length}</span>
                    </div>
                  </div>

                  <hr className="mb-6" />

                  {/* Fare Breakdown */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">Fare Breakdown</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Base Fare × {passengers.length}
                        </span>
                        <span className="text-sm text-[#000080]  font-medium">
                          ₹{(bookingInfo.fare * passengers.length).toLocaleString()}
                        </span>
                      </div>
                      
                      {preferences.insurance && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Travel Insurance × {passengers.length}
                          </span>
                          <span className="text-sm text-[#000080]  font-medium">
                            ₹{(0.45 * passengers.length).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="mb-6" />

                  {/* Total Amount */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total Amount</span>
                      <span className="text-xl font-bold text-[#000080]">
                        ₹{(bookingInfo.fare * passengers.length + (preferences.insurance ? 0.45 * passengers.length : 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition flex items-center justify-center ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#DA291C] hover:bg-[#b8241a] active:bg-[#a01f17]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Book Now <FaChevronRight className="ml-2" />
                      </>
                    )}
                  </button>

                  {/* Booking Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="font-montserrat font-bold text-[#000080]">ⓘ</div>
                      <div className="text-xs text-blue-800">
                        <p className="font-bold mb-1 font-montserrat text-[#000080]">Important Notes:</p>
                        <ul className="space-y-1 font-montserrat text-[#000080]">
                                  <li>• Please ensure all passenger details are accurate.</li>
                      <li>• Children below 5 years can travel without a ticket.</li>
                          <li>• Report 30 minutes before departure</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default BookingPage;