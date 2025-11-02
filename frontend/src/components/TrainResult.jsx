// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { FaSortAmountDown, FaSortAmountUp, FaTrain, FaClock, FaCalendarAlt, FaSearch, FaArrowRight, FaChevronDown, FaChevronUp, FaWheelchair, FaWifi, FaUtensils, FaSnowflake, FaPlug, FaTimes, FaBed, FaFilter } from 'react-icons/fa';
// import { FiSunrise, FiSunset } from 'react-icons/fi';
// import { MdDirectionsRailway, MdAirlineSeatReclineNormal } from 'react-icons/md';

// const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// // Helper functions
// const formatDate = (date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });


// // Helper function at the top of the file
// const getStationDate = (baseDate, dayCount) => {
//   const stationDate = new Date(baseDate);
//   stationDate.setDate(baseDate.getDate() + (dayCount - 1));
//   return stationDate;
// };

// const parseDate = (dateString) => {
//   if (!dateString) return new Date();
//   const date = new Date(dateString);
//   return isNaN(date.getTime()) ? new Date() : date;
// };

// const doesTrainRunOnDate = (train, date) => {
//   if (!train.runningDays || !date) return true;
//   const dayOfWeek = daysMap[date.getDay()];
//   return train.runningDays.includes(dayOfWeek);
// };

// const getTimeAgo = (timestamp) => {
//   if (!timestamp) return 'Just now';
//   const now = new Date();
//   const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
  
//   if (diffInSeconds < 60) return 'Few seconds ago';
//   if (diffInSeconds < 120) return '1 minute ago';
//   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
//   if (diffInSeconds < 7200) return '1 hour ago';
//   return `${Math.floor(diffInSeconds / 3600)} hours ago`;
// };

// const calculateDuration = (departureTime, arrivalTime) => {
//   const parseTime = (timeStr) => {
//     const [hours, minutes] = timeStr.split(':').map(Number);
//     return { hours, minutes };
//   };

//   const dep = parseTime(departureTime);
//   const arr = parseTime(arrivalTime);

//   let totalMinutes = (arr.hours * 60 + arr.minutes) - (dep.hours * 60 + dep.minutes);
//   if (totalMinutes < 0) totalMinutes += 24 * 60;

//   const hours = Math.floor(totalMinutes / 60);
//   const minutes = totalMinutes % 60;

//   return `${hours}h ${minutes}m`;
// };

// const calculateDurationMinutes = (departureTime, arrivalTime) => {
//   const parseTime = (timeStr) => {
//     const [hours, minutes] = timeStr.split(':').map(Number);
//     return hours * 60 + minutes;
//   };

//   const dep = parseTime(departureTime);
//   const arr = parseTime(arrivalTime);
  
//   let duration = arr - dep;
//   if (duration < 0) duration += 1440;
  
//   return duration;
// };

// const getNextFiveDates = (startDate) => {
//   const dates = [];
//   for (let i = 0; i < 5; i++) {
//     const nextDate = new Date(startDate);
//     nextDate.setDate(startDate.getDate() + i);
//     dates.push(nextDate);
//   }
//   return dates;
// };

// const fetchAvailability = async (trainNumber, selectedDate) => {
//   const dates = getNextFiveDates(selectedDate).map(date => date.toISOString().split('T')[0]);
//   try {
//     const response = await fetch('http://localhost:5000/api/seatmaps/availability/bulk', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ trainNumber, dates }),
//     });
//     const rawData = await response.json();

//     const rawDataByDate = {};
//     rawData.forEach(item => {
//       rawDataByDate[item.date] = item;
//     });

//     const result = {};

//     for (const date of dates) {
//       const availabilityData = rawDataByDate[date];
//       if (!availabilityData || !availabilityData.coaches) continue;

//       const classWiseCount = {};

//       for (const coach of availabilityData.coaches) {
//         const { classType, availableSeats } = coach;

//         if (!classWiseCount[classType]) classWiseCount[classType] = 0;
//         classWiseCount[classType] += availableSeats;
//       }

//       result[date] = classWiseCount;
//     }

//     return result;
//   } catch (error) {
//     console.error('Error fetching seat availability:', error);
//     return {};
//   }
// };

// const getConfirmationChance = (count) => {
//   if (count > 0) return null;
//   if (count > -20) return { percentage: 'High (≥90%)', color: 'text-green-600' };
//   if (count > -40) return { percentage: 'Good (75-90%)', color: 'text-green-600' };
//   if (count > -60) return { percentage: 'Moderate (50-75%)', color: 'text-orange-500' };
//   return { percentage: 'Low (25-50%)', color: 'text-red-600' };
// };

// const TrainResult = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const queryParams = new URLSearchParams(location.search);

//   const [from, setFrom] = useState('');
//   const [to, setTo] = useState('');
//   const [journeyDate, setJourneyDate] = useState(null);
//   const [trains, setTrains] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [faresByDate, setFaresByDate] = useState({});
//   const [availabilityByTrainDate, setAvailabilityByTrainDate] = useState({});
//   const [selectedDateIndex, setSelectedDateIndex] = useState(0);
//   const [expandedTrain, setExpandedTrain] = useState(null);
//     const [trainDetails, setTrainDetails] = useState(null);
//   const [filterClass, setFilterClass] = useState('all');
//   const [filterAvailability, setFilterAvailability] = useState(false);
//   const [dateList, setDateList] = useState([]);
//   const [availabilityTimestamps, setAvailabilityTimestamps] = useState({});
//   const [sortBy, setSortBy] = useState('departure');
//   const [sortOrder, setSortOrder] = useState('asc');
//   const [selectedTrainTypes, setSelectedTrainTypes] = useState([]);
//   const [departureTimeFilter, setDepartureTimeFilter] = useState([]);
//   const [arrivalTimeFilter, setArrivalTimeFilter] = useState([]);

//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const [bookingInfoByTrainDate, setBookingInfoByTrainDate] = useState({});

//   const timeSlots = [
//     { label: 'Early Morning', start: 0, end: 6 },
//     { label: 'Morning', start: 6, end: 12 },
//     { label: 'Afternoon', start: 12, end: 16 },
//     { label: 'Evening', start: 16, end: 21 },
//     { label: 'Night', start: 21, end: 24 },
//   ];

//   const trainTypes = ['Superfast', 'Express', 'Passenger', 'Vande Bharat', 'Rajdhani', 'Duronto'];
// const [isMobileView, setIsMobileView] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobileView(window.innerWidth < 950);
//     };

//     // Set initial value
//     handleResize();
    
//     // Add event listener
//     window.addEventListener('resize', handleResize);
    
//     // Clean up
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);
//   useEffect(() => {
//     const fromParam = queryParams.get('from')?.toUpperCase() || '';
//     const toParam = queryParams.get('to')?.toUpperCase() || '';
//     const dateParam = queryParams.get('date');
    
//     setFrom(fromParam);
//     setTo(toParam);
//     setJourneyDate(parseDate(dateParam));
//   }, [location.search]);

//   useEffect(() => {
//     if (journeyDate) {
//       setDateList(getNextFiveDates(journeyDate));
//     }
//   }, [journeyDate]);

// useEffect(() => {
//   const fetchTrains = async () => {
//     if (!from || !to || !journeyDate) return;

//     setLoading(true);
//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/trains/search?from=${from}&to=${to}`
//       );

//       const data = await res.json();

//       if (Array.isArray(data)) {
//         // Get the day name for selected date (e.g., "Mon")
//            setTrains(data);
//       } else {
//         setTrains([]);
//       }
//     } catch (err) {
//       console.error('Error fetching trains:', err);
//       setTrains([]);
//     }

//     setLoading(false);
//   };

//   fetchTrains();
// }, [from, to, journeyDate]);


//   useEffect(() => {
//     const getFaresForDates = async () => {
//       if (!trains.length || !from || !to || !dateList.length) return;

//       const dateStrings = dateList.map(date => date.toISOString().split('T')[0]);
//       const allFares = {};

//       for (const date of dateStrings) {
//         const queries = [];

//         trains.forEach((train) => {
//           if (!train.seatAvailability) return;
//           Object.keys(train.seatAvailability).forEach((classType) => {
//             queries.push({ trainNumber: train.trainNumber, from, to, classType });
//           });
//         });

//         try {
//           const res = await fetch('http://localhost:5000/api/fares/bulk', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ queries }),
//           });

//           const fareData = await res.json();
//           const fareMap = {};

//           queries.forEach(({ trainNumber, classType }) => {
//             const key = `${trainNumber}_${classType}`;
//             fareMap[key] = fareData[`${trainNumber}_${classType}_${from}_${to}`] ?? 'N/A';
//           });

//           allFares[date] = fareMap;
//         } catch (err) {
//           console.error('Error fetching fares:', err);
//         }
//       }

//       setFaresByDate(allFares);
//     };

//     getFaresForDates();
//   }, [trains, from, to, dateList]);

//   useEffect(() => {
//     const fetchAllAvailability = async () => {
//       if (!trains.length || !dateList.length) return;

//       const availabilityMap = {};
//       const timestampMap = {};
//       const now = new Date();
      
//       await Promise.all(trains.map(async (train) => {
//         const result = await fetchAvailability(train.trainNumber, dateList[0]);
//         availabilityMap[train.trainNumber] = result;
//         timestampMap[train.trainNumber] = now;
//       }));
      
//       setAvailabilityByTrainDate(availabilityMap);
//       setAvailabilityTimestamps(timestampMap);
//     };

//     fetchAllAvailability();
//   }, [trains, dateList]);

//   const toggleTrainDetails = (trainId) => {
//     setExpandedTrain(expandedTrain === trainId ? null : trainId);
//   };
//   const fetchBookingInfo = async (trainId, trainNumber, classType, dateStr) => {
//   try {
//     const res = await fetch(
//       `http://localhost:5000/api/booking/train/${trainId}/booking-info?from=${from}&to=${to}&classType=${classType}&date=${dateStr}`
//     );
//     const data = await res.json();

//     setBookingInfoByTrainDate(prev => ({
//       ...prev,
//       [trainNumber]: {
//         ...(prev[trainNumber] || {}),
//         [dateStr]: {
//           ...(prev[trainNumber]?.[dateStr] || {}),
//           [classType]: data,
//         },
//       },
//     }));
//   } catch (err) {
//     console.error('Failed to fetch booking info:', err);
//   }
// };
// useEffect(() => {
//   if (expandedTrain) {
//     const train = trains.find(t => t._id === expandedTrain);
//     if (!train) return;

//     const dateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0];
//     if (!dateStr) return;

//     Object.keys(train.seatAvailability || {}).forEach(classType => {
//       fetchBookingInfo(train._id, train.trainNumber, classType, dateStr);
//     });
//   }
// }, [expandedTrain, selectedDateIndex]);

// const handleBookNow = (train, classType) => {
//   const dateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0];
//   if (!dateStr) return;

//   const trainAvailability = availabilityByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType];
//   const bookingType = trainAvailability > 0 ? 'CONFIRMED' : 'WAITLISTED';
//   const nextWaitlistNumber = bookingInfoByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType]?.nextWaitlistNumber || 0;

//   navigate(
//     `/seatmap/${train._id}?from=${from}&to=${to}&date=${dateStr}&class=${classType}&bookingType=${bookingType}&nextWL=${nextWaitlistNumber}`
//   );
// };


//  const filteredTrains = trains.filter(train => {
//   const fromStation = train.route?.find(s => s.stationCode === from);
//   const toStation = train.route?.find(s => s.stationCode === to);
  
//   if (!fromStation || !toStation) return false;
  
//   // Add running days check here using the currently selected date
//   const selectedDate = dateList[selectedDateIndex];
//   if (!doesTrainRunOnDate(train, selectedDate)) return false;
  
//   if (filterClass !== 'all' && !train.seatAvailability?.[filterClass]) return false;
  
//   const selectedDateStr = selectedDate?.toISOString().split('T')[0] || '';
//   const availability = availabilityByTrainDate[train.trainNumber]?.[selectedDateStr] || {};
  
//   if (filterAvailability && !Object.values(availability).some(count => count > 0)) return false;
//   if (selectedTrainTypes.length > 0 && !selectedTrainTypes.includes(train.type)) return false;
  
//   // Departure time filter
//   if (departureTimeFilter.length > 0) {
//     const departureHour = parseInt(fromStation.departureTime?.split(':')[0]);
//     const matches = departureTimeFilter.some(slot => 
//       departureHour >= slot.start && departureHour < slot.end
//     );
//     if (!matches) return false;
//   }

//   // Arrival time filter
//   if (arrivalTimeFilter.length > 0) {
//     const arrivalHour = parseInt(toStation.arrivalTime?.split(':')[0]);
//     const matches = arrivalTimeFilter.some(slot => 
//       arrivalHour >= slot.start && arrivalHour < slot.end
//     );
//     if (!matches) return false;
//   }

//   return true;
//   }).sort((a, b) => {
//     const fromA = a.route?.find(s => s.stationCode === from);
//     const fromB = b.route?.find(s => s.stationCode === from);
//     const toA = a.route?.find(s => s.stationCode === to);
//     const toB = b.route?.find(s => s.stationCode === to);

//     if (!fromA || !fromB || !toA || !toB) return 0;

//     switch(sortBy) {
//       case 'departure':
//         return sortOrder === 'asc' ? 
//           fromA.departureTime.localeCompare(fromB.departureTime) :
//           fromB.departureTime.localeCompare(fromA.departureTime);
//       case 'arrival':
//         return sortOrder === 'asc' ?
//           toA.arrivalTime.localeCompare(toB.arrivalTime) :
//           toB.arrivalTime.localeCompare(toA.arrivalTime);
//       case 'duration': {
//         const durationA = calculateDurationMinutes(fromA.departureTime, toA.arrivalTime);
//         const durationB = calculateDurationMinutes(fromB.departureTime, toB.arrivalTime);
//         return sortOrder === 'asc' ? durationA - durationB : durationB - durationA;
//       }
//       case 'price': {
//         const selectedDateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0] || '';
//         const selectedFares = faresByDate[selectedDateStr] || {};
        
//         const getMinFare = (train) => {
//           const fares = Object.entries(train.seatAvailability || {})
//             .map(([cls]) => selectedFares[`${train.trainNumber}_${cls}`])
//             .filter(v => typeof v === 'number');
//           return fares.length > 0 ? Math.min(...fares) : Infinity;
//         };
        
//         const priceA = getMinFare(a);
//         const priceB = getMinFare(b);
//         return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
//       }
//       default:
//         return 0;
//     }
//   });

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white">
//       <div className="animate-pulse flex flex-col items-center">
//         <MdDirectionsRailway className="text-6xl text-[#000080] mb-4 animate-bounce" />
//         <div className="text-2xl font-bold text-[#000080] mb-2">Searching for Trains</div>
//         <div className="text-gray-600">Please wait while we fetch the best options for you</div>
//         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 max-w-md">
//           <div className="bg-[#000080] h-2.5 rounded-full animate-progress" style={{ width: '65%' }}></div>
//         </div>
//       </div>
//     </div>
//   );

//   if (!dateList.length) return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white">
//       <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-gray-200">
//         <FaTimes className="text-5xl text-[#DA291C] mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Date</h2>
//         <p className="text-gray-600 mb-6">Please select a valid date to view available trains.</p>
//         <button 
//           onClick={() => navigate('/')}
//           className="bg-[#000080] hover:bg-[#0000a0] text-white font-medium py-2 px-6 rounded-lg transition duration-300"
//         >
//           Back to Search
//         </button>
//       </div>
//     </div>
//   );

//   if (!Array.isArray(trains) || trains.length === 0) return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white">
//       <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-gray-200">
//         <FaTrain className="text-5xl text-gray-400 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">No Trains Found</h2>
//         <p className="text-gray-600 mb-6">We couldn't find any trains for the selected route. Please try different stations.</p>
//         <button 
//           onClick={() => navigate('/')}
//           className="bg-[#000080] hover:bg-[#0000a0] text-white font-medium py-2 px-6 rounded-lg transition duration-300"
//         >
//           New Search
//         </button>
//       </div>
//     </div>
//   );

//   const selectedDate = dateList[selectedDateIndex];
//   const selectedDateStr = selectedDate.toISOString().split('T')[0];
//   const selectedFares = faresByDate[selectedDateStr] || {};
//   const dateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0];


//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-[#000080] to-[#1a237e] text-white shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h1 className="text-xl md:text-2xl font-bold">Available Trains</h1>
//               <div className="flex flex-col xs:flex-row items-baseline gap-2 mt-2">
//                 <div className="flex items-center gap-1">
//                   <span className="font-medium bg-white/90 text-[#000080] px-2 py-1 rounded text-sm">
//                     {trains[0]?.route.find(s => s.stationCode === from)?.stationName} ({from})
//                   </span>
//                   <FaArrowRight className="text-blue-200 shrink-0" />
//                   <span className="font-medium bg-white/90 text-[#000080] px-2 py-1 rounded text-sm">
//                     {trains[0]?.route.find(s => s.stationCode === to)?.stationName} ({to})
//                   </span>
//                 </div>
//                 <div className="flex items-center text-xs md:text-sm bg-white/10 px-2 py-1 rounded">
//                   <FaCalendarAlt className="mr-1" />
//                   {selectedDate.toLocaleDateString('en-IN', {
//                     weekday: 'short',
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric'
//                   })}
//                 </div>
//               </div>
//             </div>
//             <button 
//               onClick={() => navigate('/')}
//               className="hidden md:flex items-center bg-white text-[#000080] hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition-all"
//             >
//               New Search
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Filter Toggle Button */}
//       {isMobileView && (
//         <div className="fixed bottom-4 right-4 z-20">
//           <button
//             onClick={() => setShowMobileFilters(!showMobileFilters)}
//             className="bg-[#000080] text-white p-3 rounded-full shadow-lg hover:bg-[#0000a0] transition-all flex items-center justify-center"
//           >
//             <FaFilter className="text-xl mr-2" />
//             {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
//           </button>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
//         {/* Desktop Filters Sidebar */}
//         {!isMobileView && (
//           <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-100px)] bg-white lg:overflow-y-auto lg:w-[300px]">
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-6">
//               {/* Date Selector */}
//               <div className="mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                 <span className="font-bold text-[#000080]">Filters:</span>
//                 <div className="bg-white rounded-lg text-right">
//               <button
//                 onClick={() => {
//                   setFilterClass('all');
//                   setFilterAvailability(false);
//                   setSelectedTrainTypes([]);
//                   setDepartureTimeFilter([]);
//                   setArrivalTimeFilter([]);
                  
//                 }}
//                 className="bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white font-medium rounded-lg"
//               >
//                 Reset
//               </button>
//             </div>
//             </div>  <br></br>
//                 <h3 className="text-sm font-semibold text-[#000080] mb-3">Select Date</h3>
//                 <div className="grid grid-cols-3 gap-2">
//                   {dateList.map((date, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => setSelectedDateIndex(idx)}
//                       className={`p-2 bg-[#000080] border-black font-bold  font-montserrat text-center rounded-lg border ${
//                         idx === selectedDateIndex
//                           ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                       }`}
//                     >
//                       <div className="text-xs font-montserrat font-medium">{daysMap[date.getDay()]}</div>
             
//                       <div className="text-xs">{formatDate(date)}</div>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Class Filter */}
//               <div>
//                 <h3 className="text-sm font-semibold text-[#000080] mb-3">Class Type</h3>
//                 <div className="grid grid-cols-3 gap-2">
//                   {['2S', 'CC', 'SL', '3A', '2A'].map(cls => (
//                     <button
//                       key={cls}
//                       onClick={() => setFilterClass(cls)}
//                       className={`p-2 border-black font-bold  rounded text-sm ${
//                         filterClass === cls 
//                          ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                       }`}
//                     >
//                       {cls}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Availability Filter */}
//               <div>
//                 <h3 className="text-sm font-semibold text-[#000080] mb-3">Availability</h3>
//                 <label className="flex items-center justify-between p-3 border border-black rounded-lg hover:border-[#000080]">
//                   <span className="text-sm bg-white text-[#000080] ">Show available only</span>
//                   <input 
//                     type="checkbox"
//                     checked={filterAvailability}
//                     onChange={() => setFilterAvailability(!filterAvailability)}
//                     className="h-4 w-4 text-[#000080] rounded focus:ring-[#000080]"
//                   />
//                 </label>
//               </div>

//               {/* Train Type Filter */}
//               <div>
//                 <h3 className="text-sm font-semibold text-[#000080] mb-3">Train Type</h3>
//                 <div className="grid grid-cols-2 gap-2 ">
//                   {trainTypes.map(type => (
//                     <button
//                       key={type}
//                       onClick={() => setSelectedTrainTypes(prev => 
//                         prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
//                       )}
//                       className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
//                         selectedTrainTypes.includes(type)
//                         ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                       }`}
//                     >
//                       {type}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Time Filters */}
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
//                     <FiSunrise className="mr-2" />
//                     Departure Time
//                   </h3>
//                   <div className="grid grid-cols-2 gap-2">
//                     {timeSlots.map(slot => (
//                       <button
//                         key={slot.label}
//                         onClick={() => setDepartureTimeFilter(prev =>
//                           prev.some(s => s.label === slot.label)
//                             ? prev.filter(s => s.label !== slot.label)
//                             : [...prev, slot]
//                         )}
//                         className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
//                           departureTimeFilter.some(s => s.label === slot.label)
//                           ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                         }`}
//                       >
//                         {slot.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
//                     <FiSunset className="mr-2" />
//                     Arrival Time
//                   </h3>
//                   <div className="grid grid-cols-2 gap-2">
//                     {timeSlots.map(slot => (
//                       <button
//                         key={slot.label}
//                         onClick={() => setArrivalTimeFilter(prev =>
//                           prev.some(s => s.label === slot.label)
//                             ? prev.filter(s => s.label !== slot.label)
//                             : [...prev, slot]
//                         )}
//                         className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
//                           arrivalTimeFilter.some(s => s.label === slot.label)
//                             ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                         }`}
//                       >
//                         {slot.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>

             
//             </div>
//           </div>
//         )}

//         {/* Mobile Filters Panel */}
//         {isMobileView && showMobileFilters && (
//           <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex justify-end">
//             <div className="bg-white w-5/6 h-full overflow-y-auto p-4 animate-slide-in">
//               <div className="flex  items-center mb-5">
//                 <h2 className="text-lg font-bold text-[#000080]">Filters</h2>
//                 <div className="flex justify-end flex-1 gap-3">
//                 <div className="bg-white rounded-lg">
//               <button
//                 onClick={() => {
//                   setFilterClass('all');
//                   setFilterAvailability(false);
//                   setSelectedTrainTypes([]);
//                   setDepartureTimeFilter([]);
//                   setArrivalTimeFilter([]);
                  
//                 }}
//                 className="bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white font-medium rounded-lg"
//               >
//                 Reset
//               </button>
//             </div>
//                 <button 
//                   onClick={() => setShowMobileFilters(false)}
//                   className="text-[#000080] border-black bg-white hover:text-gray-700"
//                 >
//                   <FaTimes />
//                 </button>
//               </div>
//               </div>
              
//               {/* Mobile Filter Content */}
//               <div className="space-y-6">
//                 {/* Date Selector */}
//                 <div className="mb-6">
//                   <h3 className="text-sm font-semibold text-[#000080] mb-3">Select Date</h3>
//                   <div className="grid grid-cols-3 gap-2">
//                     {dateList.map((date, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => {
//                           setSelectedDateIndex(idx);
//                           setShowMobileFilters(false);
//                         }}
//                         className={`p-2 text-center border-black rounded-lg border ${
//                           idx === selectedDateIndex
//                        ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                         }`}
//                       >
//                         <div className="text-xs font-medium">{daysMap[date.getDay()]}</div>
//                         <div className="text-sm font-bold">{date.getDate()}</div>
//                         <div className="text-xs">{formatDate(date)}</div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Class Filter */}
//                 <div>
//                   <h3 className="text-sm font-semibold text-[#000080] mb-3">Class Type</h3>
//                   <div className="grid grid-cols-3 gap-2">
//                     {['2S', 'CC', 'SL', '3A', '2A'].map(cls => (
//                       <button
//                         key={cls}
//                         onClick={() => setFilterClass(cls)}
//                         className={`p-2 rounded-lg border-black text-sm border ${
//                           filterClass === cls 
//                         ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                         }`}
//                       >
//                         {cls}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Availability Filter */}
//                 <div>
//                   <h3 className="text-sm font-semibold text-[#000080] mb-3">Availability</h3>
//                   <label className="flex items-center justify-between p-3 border border-black rounded-lg hover:border-[#000080]">
//                     <span className="text-sm text-[#000080]">Show available only</span>
//                     <input 
//                       type="checkbox"
//                       checked={filterAvailability}
//                       onChange={() => setFilterAvailability(!filterAvailability)}
//                       className="h-4 w-4 text-[#000080] rounded focus:ring-[#000080]"
//                     />
//                   </label>
//                 </div>

//                 {/* Train Type Filter */}
//                 <div>
//                   <h3 className="text-sm font-semibold text-[#000080] mb-3">Train Type</h3>
//                   <div className="grid grid-cols-2 gap-2">
//                     {trainTypes.map(type => (
//                       <button
//                         key={type}
//                         onClick={() => setSelectedTrainTypes(prev => 
//                           prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
//                         )}
//                         className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
//                           selectedTrainTypes.includes(type)
//                            ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                         }`}
//                       >
//                         {type}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Time Filters */}
//                 <div className="space-y-4">
//                   <div>
//                     <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
//                       <FiSunrise className="mr-2" />
//                       Departure Time
//                     </h3>
//                     <div className="grid grid-cols-2 gap-2">
//                       {timeSlots.map(slot => (
//                         <button
//                           key={slot.label}
//                           onClick={() => setDepartureTimeFilter(prev =>
//                             prev.some(s => s.label === slot.label)
//                               ? prev.filter(s => s.label !== slot.label)
//                               : [...prev, slot]
//                           )}
//                           className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
//                             departureTimeFilter.some(s => s.label === slot.label)
//                         ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                           }`}
//                         >
//                           {slot.label}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
//                       <FiSunset className="mr-2" />
//                       Arrival Time
//                     </h3>
//                     <div className="grid grid-cols-2 gap-2">
//                       {timeSlots.map(slot => (
//                         <button
//                           key={slot.label}
//                           onClick={() => setArrivalTimeFilter(prev =>
//                             prev.some(s => s.label === slot.label)
//                               ? prev.filter(s => s.label !== slot.label)
//                               : [...prev, slot]
//                           )}
//                           className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
//                             arrivalTimeFilter.some(s => s.label === slot.label)
//                          ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                           }`}
//                         >
//                           {slot.label}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Main Content Area */}
//         <div className="flex-1">
//           {/* Sorting Controls */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
//             <div className="flex flex-wrap gap-4 items-center">
//               <span className="text-sm font-semibold text-[#000080]">Sort by:</span>
//               {['Departure', 'Arrival', 'Duration', 'Price'].map((option) => (
//                 <button
//                   key={option}
//                   onClick={() => {
//                     const optionLower = option.toLowerCase();
//                     if (sortBy === optionLower) {
//                       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//                     } else {
//                       setSortBy(optionLower);
//                       setSortOrder('asc');
//                     }
//                   }}
//                   className={`flex items-center border-black px-4 py-2 rounded-full text-sm border ${
//                     sortBy === option.toLowerCase() 
//                    ? 'border-[#000080] bg-[#000080] text-white'
//                             : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
//                   }`}
//                 >
//                   {option}
//                   {sortBy === option.toLowerCase() && (
//                     <span className="ml-2">
//                       {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
//                     </span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Results Count */}
//           <div className="mb-6">
//             <div className="text-sm text-gray-600">
//               Showing <span className="font-semibold text-[#000080]">{filteredTrains.length}</span> out of <span className="font-semibold">{trains.length}</span> trains
//             </div>
//             {filteredTrains.length < trains.length && (
//               <div className="text-xs text-gray-500 mt-1">
//                 {trains.length - filteredTrains.length} train(s) hidden - not operational on {daysMap[dateList[selectedDateIndex].getDay()]}
//               </div>
//             )}
//           </div>

//           {/* Train List */}
//           <div className="space-y-4">
//             {filteredTrains.map((train) => {
//               const fromStation = train.route?.find(s => s.stationCode === from);
//               const toStation = train.route?.find(s => s.stationCode === to);
//               if (!fromStation || !toStation) return null;

//               const durationText = calculateDuration(fromStation.departureTime, toStation.arrivalTime);
//               const dateAvailability = availabilityByTrainDate[train.trainNumber]?.[selectedDateStr] || {};
         

//               // Get fares safely
//               const classFares = Object.entries(train.seatAvailability || {})
//                 .map(([cls]) => selectedFares[`${train.trainNumber}_${cls}`])
//                 .filter(v => typeof v === 'number');

//               const minFare = classFares.length > 0 ? Math.min(...classFares) : 'N/A';

//               return (
//                 <div key={train._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                   {/* Train Header */}
//      <div className="p-4">
//   <div className="flex flex-col gap-4">
//     {/* Top Section: Train Details */}
//     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      
//       {/* Left Section: Icon + Train Info */}
//       <div className="flex gap-3 flex-1">
//         {/* Icon */}
//         <div className="w-10 h-8 rounded-lg bg-white flex items-center justify-center text-[#000080] shrink-0">
//           <FaTrain className="text-xl" />
//         </div>

//         {/* Train Details */}
//         <div className="flex flex-col gap-1 w-full">
//           {/* Train Name and Number */}
//           <div className="flex items-center justify-between sm:flex-row sm:items-center sm:gap-2">
//             <h2 className="text-base sm:text-lg font-bold text-gray-800">
//               {train.trainName}
//             </h2>
//             <span className="text-sm mt-1 sm:mt-0 font-montserrat bg-[#000080] font-bold text-white rounded px-2 py-1 w-fit">
//               {train.trainNumber}
//             </span>
//           </div>

//           {/* Running Days */}
//           <div className="flex flex-wrap gap-1 mt-2 sm:mt-1">
//             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//               <span
//                 key={day}
//                 className={`text-xs sm:text-xs font-montserrat px-1.5 rounded-full ${
//                   train.runningDays.includes(day)
//                    ? 'bg-green-100 text-green-800 border border-green-200'
//                             : 'bg-red-100 text-red-800 border border-red-200'
//                 }`}
//                 title={day}
//               >
//                 {day}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//       {/* Right: Fare */}
//       <div className="text-right min-w-[120px]">
//         <div className="text-xs text-gray-500">Starting from</div>
//         <div className="text-lg font-bold text-[#DA291C]">
//           {typeof minFare === 'number' ? `₹${minFare.toLocaleString('en-IN')}` : minFare}
//         </div>
//       </div>
//     </div>
//     {/* Schedule Grid: Departure - Duration - Arrival */}
//     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//       {/* Departure */}
//       <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
//   <div className="flex justify-between items-baseline">
//     <div className="font-montserrat font-bold text-lg text-[#000080]">{fromStation.departureTime}</div>
//     <div className="text-xs text-gray-600">
//       {getStationDate(selectedDate, fromStation.dayCount).toLocaleDateString('en-IN', {
//         day: 'numeric', month: 'short', year: 'numeric'
//       })}
//     </div>
//   </div>
//   <div className="text-xs text-gray-700 mt-1 truncate">
//     {fromStation.stationName} ({from})
//   </div>
//    {(fromStation.dayCount > 1 || toStation.dayCount > 1) && (
//     <div className="text-xs font-montserrat font-bold  text-[#DA291C] mt-1">
//       Day {fromStation.dayCount}
//     </div>
//   )}
//       </div>

//       {/* Duration */}
//       <div className="flex flex-col items-center justify-center sm:py-2">
//         <div className="flex items-center text-[#000080] text-sm">
//           <FaClock className="mr-2" />
//           <span>{durationText}</span>
//         </div>
//         <div className="w-full mt-3 h-px bg-gradient-to-r from-blue-100 via-[#000080] to-blue-100" />
//       </div>

//       {/* Arrival */}
//      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
//   <div className="flex justify-between items-baseline">
//     <div className="font-montserrat font-bold text-lg text-[#000080]">{toStation.arrivalTime}</div>
//     <div className="text-xs text-gray-600">
//       {getStationDate(selectedDate, toStation.dayCount).toLocaleDateString('en-IN', {
//         day: 'numeric', month: 'short', year: 'numeric'
//       })}
//     </div>
//   </div>
//   <div className="text-xs text-gray-700 mt-1 truncate">
//     {toStation.stationName} ({to})
//   </div>
//    {(fromStation.dayCount > 1 || toStation.dayCount > 1) && (
//     <div className="text-xs font-montserrat font-bold  text-[#DA291C]  mt-1">
//       Day {toStation.dayCount}
//     </div>
//   )}
//       </div>
//     </div>

//     {/* Footer: View Details (left), View Schedule (right) */}
//     <div className="pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-gray-200">
//       {/* Left: View Details */}
//       <button
//         onClick={() => toggleTrainDetails(train._id)}
//         className="flex items-center text-sm border-black bg-white font-medium"
//       >
//         {expandedTrain === train._id ? (
//           <>
//             <span className="text-[#000080]">Hide details</span>
//             <FaChevronUp className="ml-2 text-[#000080]" />
//           </>
//         ) : (
//           <>
//             <span className="text-[#000080]">View details</span>
//             <FaChevronDown className="ml-2 text-[#000080]" />
//           </>
//         )}
//       </button>

//       {/* Right: View Schedule */}
//       <button
//         onClick={() => navigate(`/schedule/${train.trainNumber}`)}
//         className="text-sm text-[#000080] bg-white underline hover:text-[#1a237e] self-end sm:self-auto"
//       >
//         View Full Schedule
//       </button>
//     </div>
//   </div>
// </div>


//                   {/* Expanded Details */}
//   {expandedTrain === train._id && (
//   <div className="border-t border-gray-200 p-4 bg-gray-50">
//     <div>
//       <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
//         <MdAirlineSeatReclineNormal className="mr-2" />
//         Seat Availability
//         <span className="ml-auto text-xs font-medium text-[#000080]">
//           Last updated: {getTimeAgo(availabilityTimestamps[train.trainNumber])}
//         </span>
//       </h3>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//         {Object.entries(train.seatAvailability || {}).map(([classType, quota]) => {
//           const availability = dateAvailability[classType] ?? 0;
//           const fare = selectedFares[`${train.trainNumber}_${classType}`] ?? 'N/A';
//           const confirmationChance = getConfirmationChance(availability);
//  const nextWaitlistNumber = bookingInfoByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType]?.nextWaitlistNumber ?? Math.abs(availability);
//           return (
//             <div
//   key={classType}
//   className="border border-black rounded-lg p-3 hover:border-[#000080] transition-all text-sm sm:text-base flex flex-col justify-between h-full w-full max-w-[320px] mx-auto"
// >

//               {/* Class Type & Fare */}
//               <div className="flex justify-between items-start mb-2">
//                 <div className="font-bold text-[#000080] text-base">{classType}</div>
//                 <div className="text-sm font-bold text-[#DA291C]">
//                   {typeof fare === 'number' ? `₹${fare.toLocaleString('en-IN')}` : fare}
//                 </div>
//               </div>

//               {/* Availability */}
//               <div className="mt-1 flex justify-between items-center">
//                 <span className="text-sm text-[#000080]">Status:</span>
//                 <span
//                   className={`inline-block px-3 py-0.5 rounded-full text-xs font-montserrat font-bold ${
//                     availability > 0
//                       ? 'bg-green-100 text-green-700'
//                       : 'bg-[#FFE5E5] text-[#DA291C]'
//                   }`}
//                 >
//                  {availability > 0
//   ? `Available ${availability}`
//   : `WL ${bookingInfoByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType]?.nextWaitlistNumber ?? Math.abs(availability)}`}
//                 </span>
//               </div>

//               {/* Confirmation Chance */}
//               {confirmationChance && (
//                 <div className="mt-1 flex justify-between items-center">
//                   <span className="text-sm text-[#000080]">Confirmation:</span>
//                   <span className={`text-xs font-medium ${confirmationChance.color}`}>
//                     {confirmationChance.percentage}
//                   </span>
//                 </div>
//               )}
//                <button
//   onClick={() => handleBookNow(train, classType)}
//   className={`mt-3 w-full py-1.5 rounded-lg text-sm font-medium transition-colors ${
//     availability > 0
//       ? 'bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white'
//       : 'bg-[#DA291C] hover:from-yellow-600 hover:to-yellow-800 text-white'
//   }`}
// >
// Book Now

// </button>


//        {/* <button
//   onClick={() => handleBookNow(train, classType)}
//   disabled={availability <= 0}
//   className={`mt-3 w-full py-1.5 rounded-lg text-sm font-medium transition-colors ${
//     availability > 0
//       ? 'bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white'
//       : 'bg-gray-400 text-white cursor-not-allowed'
//   }`}
// >
//   {availability > 0 ? 'Book Now' : 'Not Available'}
// </button> */}



//             </div>
//           );
//         })}
//       </div>
//     </div>
//   </div>
// )}


//                 </div>
//               );
//             })}
//           </div>

//           {/* No Results */}
//           {filteredTrains.length === 0 && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
//               <FaFilter className="text-4xl text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-700 mb-2">No trains match your filters</h3>
//               <p className="text-gray-500 mb-4">Try adjusting your filters or select a different date</p>
//               <button
//                 onClick={() => {
//                   setFilterClass('all');
//                   setFilterAvailability(false);
//                   setSelectedTrainTypes([]);
//                   setDepartureTimeFilter([]);
//                   setArrivalTimeFilter([]);

//                 }}
//                 className="bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white font-medium py-2 px-6 rounded-lg"
//               >
//                 Reset Filters
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TrainResult;


import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaTrain, 
  FaClock, 
  FaCalendarAlt, 
  FaSearch, 
  FaArrowRight, 
  FaChevronDown, 
  FaChevronUp, 
  FaUsers,
  FaWheelchair, 
  FaWifi, 
  FaUtensils, 
  FaSnowflake, 
  FaPlug, 
  FaTimes, 
  FaBed, 
  FaFilter,
  FaStar,
  FaShieldAlt,
  FaBolt,
  FaFire,
  FaHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown
} from 'react-icons/fa';
import { 
  FiSunrise, 
  FiSunset,
  FiTrendingUp,
  FiInfo
} from 'react-icons/fi';
import { 
  MdDirectionsRailway, 
  MdAirlineSeatReclineNormal,
  MdVerified,
  MdTrendingUp
} from 'react-icons/md';
import {
  SparklesIcon,
  BoltIcon,
  StarIcon,
  ClockIcon,
  ArrowRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper functions (keeping your existing ones)
const formatDate = (date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const getStationDate = (baseDate, dayCount) => {
  const stationDate = new Date(baseDate);
  stationDate.setDate(baseDate.getDate() + (dayCount - 1));
  return stationDate;
};

const parseDate = (dateString) => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
};

const doesTrainRunOnDate = (train, date) => {
  if (!train.runningDays || !date) return true;
  const dayOfWeek = daysMap[date.getDay()];
  return train.runningDays.includes(dayOfWeek);
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
  
  if (diffInSeconds < 60) return 'Few seconds ago';
  if (diffInSeconds < 120) return '1 minute ago';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 7200) return '1 hour ago';
  return `${Math.floor(diffInSeconds / 3600)} hours ago`;
};

const calculateDuration = (departureTime, arrivalTime) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  const dep = parseTime(departureTime);
  const arr = parseTime(arrivalTime);

  let totalMinutes = (arr.hours * 60 + arr.minutes) - (dep.hours * 60 + dep.minutes);
  if (totalMinutes < 0) totalMinutes += 24 * 60;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const calculateDurationMinutes = (departureTime, arrivalTime) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const dep = parseTime(departureTime);
  const arr = parseTime(arrivalTime);
  
  let duration = arr - dep;
  if (duration < 0) duration += 1440;
  
  return duration;
};

const getNextFiveDates = (startDate) => {
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
};

const fetchAvailability = async (trainNumber, selectedDate) => {
  const dates = getNextFiveDates(selectedDate).map(date => date.toISOString().split('T')[0]);
  try {
    const response = await fetch('http://localhost:5000/api/seatmaps/availability/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainNumber, dates }),
    });
    const rawData = await response.json();

    const rawDataByDate = {};
    rawData.forEach(item => {
      rawDataByDate[item.date] = item;
    });

    const result = {};

    for (const date of dates) {
      const availabilityData = rawDataByDate[date];
      if (!availabilityData || !availabilityData.coaches) continue;

      const classWiseCount = {};

      for (const coach of availabilityData.coaches) {
        const { classType, availableSeats } = coach;

        if (!classWiseCount[classType]) classWiseCount[classType] = 0;
        classWiseCount[classType] += availableSeats;
      }

      result[date] = classWiseCount;
    }

    return result;
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    return {};
  }
};

const getConfirmationChance = (count) => {
  if (count > 0) return null;
  if (count > -20) return { percentage: 'High (≥90%)', color: 'text-green-600', bgColor: 'bg-green-100', icon: <FaCheckCircle /> };
  if (count > -40) return { percentage: 'Good (75-90%)', color: 'text-green-600', bgColor: 'bg-green-100', icon: <FaCheckCircle /> };
  if (count > -60) return { percentage: 'Moderate (50-75%)', color: 'text-orange-500', bgColor: 'bg-orange-100', icon: <FiInfo /> };
  return { percentage: 'Low (25-50%)', color: 'text-red-600', bgColor: 'bg-red-100', icon: <FaTimesCircle /> };
};

const TrainResult = () => {
  // All your existing state variables
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [journeyDate, setJourneyDate] = useState(null);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [faresByDate, setFaresByDate] = useState({});
  const [availabilityByTrainDate, setAvailabilityByTrainDate] = useState({});
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [expandedTrain, setExpandedTrain] = useState(null);
  const [trainDetails, setTrainDetails] = useState(null);
  const [filterClass, setFilterClass] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState(false);
  const [dateList, setDateList] = useState([]);
  const [availabilityTimestamps, setAvailabilityTimestamps] = useState({});
  const [sortBy, setSortBy] = useState('departure');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTrainTypes, setSelectedTrainTypes] = useState([]);
  const [departureTimeFilter, setDepartureTimeFilter] = useState([]);
  const [arrivalTimeFilter, setArrivalTimeFilter] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [bookingInfoByTrainDate, setBookingInfoByTrainDate] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);

  const timeSlots = [
    { label: 'Early Morning', start: 0, end: 6, icon: <FiSunrise />, color: 'from-blue-400 to-blue-600' },
    { label: 'Morning', start: 6, end: 12, icon: <FiSunrise />, color: 'from-yellow-400 to-yellow-600' },
    { label: 'Afternoon', start: 12, end: 16, icon: <FaBolt />, color: 'from-orange-400 to-orange-600' },
    { label: 'Evening', start: 16, end: 21, icon: <FiSunset />, color: 'from-purple-400 to-purple-600' },
    { label: 'Night', start: 21, end: 24, icon: <FiSunset />, color: 'from-indigo-400 to-indigo-600' },
  ];

  const trainTypes = [
    { name: 'Superfast', icon: <FaBolt />, color: 'from-yellow-500 to-yellow-600' },
    { name: 'Express', icon: <FaTrain />, color: 'from-blue-500 to-blue-600' },
    { name: 'Passenger', icon: <FaUsers />, color: 'from-green-500 to-green-600' },
    { name: 'Vande Bharat', icon: <FaCrown />, color: 'from-purple-500 to-purple-600' },
    { name: 'Rajdhani', icon: <FaStar />, color: 'from-red-500 to-red-600' },
    { name: 'Duronto', icon: <FaFire />, color: 'from-orange-500 to-orange-600' }
  ];

  // All your existing useEffect hooks (keeping them as they are)
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 950);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fromParam = queryParams.get('from')?.toUpperCase() || '';
    const toParam = queryParams.get('to')?.toUpperCase() || '';
    const dateParam = queryParams.get('date');
    
    setFrom(fromParam);
    setTo(toParam);
    setJourneyDate(parseDate(dateParam));
  }, [location.search]);

  useEffect(() => {
    if (journeyDate) {
      setDateList(getNextFiveDates(journeyDate));
    }
  }, [journeyDate]);

  useEffect(() => {
    const fetchTrains = async () => {
      if (!from || !to || !journeyDate) return;

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/trains/search?from=${from}&to=${to}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setTrains(data);
        } else {
          setTrains([]);
        }
      } catch (err) {
        console.error('Error fetching trains:', err);
        setTrains([]);
      }
      setLoading(false);
    };

    fetchTrains();
  }, [from, to, journeyDate]);

  useEffect(() => {
    const getFaresForDates = async () => {
      if (!trains.length || !from || !to || !dateList.length) return;

      const dateStrings = dateList.map(date => date.toISOString().split('T')[0]);
      const allFares = {};

      for (const date of dateStrings) {
        const queries = [];

        trains.forEach((train) => {
          if (!train.seatAvailability) return;
          Object.keys(train.seatAvailability).forEach((classType) => {
            queries.push({ trainNumber: train.trainNumber, from, to, classType });
          });
        });

        try {
          const res = await fetch('http://localhost:5000/api/fares/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queries }),
          });

          const fareData = await res.json();
          const fareMap = {};

          queries.forEach(({ trainNumber, classType }) => {
            const key = `${trainNumber}_${classType}`;
            fareMap[key] = fareData[`${trainNumber}_${classType}_${from}_${to}`] ?? 'N/A';
          });

          allFares[date] = fareMap;
        } catch (err) {
          console.error('Error fetching fares:', err);
        }
      }

      setFaresByDate(allFares);
    };

    getFaresForDates();
  }, [trains, from, to, dateList]);

  useEffect(() => {
    const fetchAllAvailability = async () => {
      if (!trains.length || !dateList.length) return;

      const availabilityMap = {};
      const timestampMap = {};
      const now = new Date();
      
      await Promise.all(trains.map(async (train) => {
        const result = await fetchAvailability(train.trainNumber, dateList[0]);
        availabilityMap[train.trainNumber] = result;
        timestampMap[train.trainNumber] = now;
      }));
      
      setAvailabilityByTrainDate(availabilityMap);
      setAvailabilityTimestamps(timestampMap);
    };

    fetchAllAvailability();
  }, [trains, dateList]);

  // New useEffect for scrolling to expanded train
  useEffect(() => {
    if (expandedTrain) {
      // Small delay to allow DOM update
      setTimeout(() => {
        const el = document.getElementById(`train-${expandedTrain}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [expandedTrain]);

  const toggleTrainDetails = (trainId) => {
    setExpandedTrain(expandedTrain === trainId ? null : trainId);
  };

  const fetchBookingInfo = async (trainId, trainNumber, classType, dateStr) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/booking/train/${trainId}/booking-info?from=${from}&to=${to}&classType=${classType}&date=${dateStr}`
      );
      const data = await res.json();

      setBookingInfoByTrainDate(prev => ({
        ...prev,
        [trainNumber]: {
          ...(prev[trainNumber] || {}),
          [dateStr]: {
            ...(prev[trainNumber]?.[dateStr] || {}),
            [classType]: data,
          },
        },
      }));
    } catch (err) {
      console.error('Failed to fetch booking info:', err);
    }
  };

  useEffect(() => {
    if (expandedTrain) {
      const train = trains.find(t => t._id === expandedTrain);
      if (!train) return;

      const dateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0];
      if (!dateStr) return;

      Object.keys(train.seatAvailability || {}).forEach(classType => {
        fetchBookingInfo(train._id, train.trainNumber, classType, dateStr);
      });
    }
  }, [expandedTrain, selectedDateIndex]);

  const handleBookNow = (train, classType) => {
    const dateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0];
    if (!dateStr) return;

    const trainAvailability = availabilityByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType];
    const bookingType = trainAvailability > 0 ? 'CONFIRMED' : 'WAITLISTED';
    const nextWaitlistNumber = bookingInfoByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType]?.nextWaitlistNumber || 0;

    navigate(
      `/seatmap/${train._id}?from=${from}&to=${to}&date=${dateStr}&class=${classType}&bookingType=${bookingType}&nextWL=${nextWaitlistNumber}`
    );
  };

  const filteredTrains = trains.filter(train => {
    const fromStation = train.route?.find(s => s.stationCode === from);
    const toStation = train.route?.find(s => s.stationCode === to);
    
    if (!fromStation || !toStation) return false;
    
    const selectedDate = dateList[selectedDateIndex];
    if (!doesTrainRunOnDate(train, selectedDate)) return false;
    
    if (filterClass !== 'all' && !train.seatAvailability?.[filterClass]) return false;
    
    const selectedDateStr = selectedDate?.toISOString().split('T')[0] || '';
    const availability = availabilityByTrainDate[train.trainNumber]?.[selectedDateStr] || {};
    
    if (filterAvailability && !Object.values(availability).some(count => count > 0)) return false;
    if (selectedTrainTypes.length > 0 && !selectedTrainTypes.some(type => type.name === train.type)) return false;
    
    if (departureTimeFilter.length > 0) {
      const departureHour = parseInt(fromStation.departureTime?.split(':')[0]);
      const matches = departureTimeFilter.some(slot => 
        departureHour >= slot.start && departureHour < slot.end
      );
      if (!matches) return false;
    }

    if (arrivalTimeFilter.length > 0) {
      const arrivalHour = parseInt(toStation.arrivalTime?.split(':')[0]);
      const matches = arrivalTimeFilter.some(slot => 
        arrivalHour >= slot.start && arrivalHour < slot.end
      );
      if (!matches) return false;
    }

    return true;
  }).sort((a, b) => {
    const fromA = a.route?.find(s => s.stationCode === from);
    const fromB = b.route?.find(s => s.stationCode === from);
    const toA = a.route?.find(s => s.stationCode === to);
    const toB = b.route?.find(s => s.stationCode === to);

    if (!fromA || !fromB || !toA || !toB) return 0;

    switch(sortBy) {
      case 'departure':
        return sortOrder === 'asc' ? 
          fromA.departureTime.localeCompare(fromB.departureTime) :
          fromB.departureTime.localeCompare(fromA.departureTime);
      case 'arrival':
        return sortOrder === 'asc' ?
          toA.arrivalTime.localeCompare(toB.arrivalTime) :
          toB.arrivalTime.localeCompare(toA.arrivalTime);
      case 'duration': {
        const durationA = calculateDurationMinutes(fromA.departureTime, toA.arrivalTime);
        const durationB = calculateDurationMinutes(fromB.departureTime, toB.arrivalTime);
        return sortOrder === 'asc' ? durationA - durationB : durationB - durationA;
      }
      case 'price': {
        const selectedDateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0] || '';
        const selectedFares = faresByDate[selectedDateStr] || {};
        
        const getMinFare = (train) => {
          const fares = Object.entries(train.seatAvailability || {})
            .map(([cls]) => selectedFares[`${train.trainNumber}_${cls}`])
            .filter(v => typeof v === 'number');
          return fares.length > 0 ? Math.min(...fares) : Infinity;
        };
        
        const priceA = getMinFare(a);
        const priceB = getMinFare(b);
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      }
      default:
        return 0;
    }
  });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <style jsx>{`
        .floating-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 128, 0.15);
        }
        
        .animate-train {
          animation: trainMove 2s ease-in-out infinite;
        }
        
        @keyframes trainMove {
          0%, 100% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
        }
        
        .progress-wave {
          background: linear-gradient(90deg, #000080 0%, #1e40af 50%, #DA291C 100%);
          background-size: 200% 100%;
          animation: wave 2s linear infinite;
        }
        
        @keyframes wave {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      
      <div className="floating-card p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-[#000080] to-[#DA291C] rounded-2xl mx-auto mb-6 flex items-center justify-center animate-train">
          <FaTrain className="text-white text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Finding Your Perfect Journey</h2>
        <p className="text-gray-600 mb-6">Searching through thousands of trains to bring you the best options...</p>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div className="progress-wave h-3 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <SparklesIcon className="w-4 h-4" />
          <span>Almost there...</span>
        </div>
      </div>
    </div>
  );

  if (!dateList.length) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="floating-card p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <FaTimes className="text-white text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Date</h2>
        <p className="text-gray-600 mb-8">Please select a valid date to view available trains.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-[#000080] to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Back to Search
        </button>
      </div>
    </div>
  );

  if (!Array.isArray(trains) || trains.length === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="floating-card p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <FaTrain className="text-white text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Trains Found</h2>
        <p className="text-gray-600 mb-8">We couldn't find any trains for the selected route. Please try different stations.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          New Search
        </button>
      </div>
    </div>
  );

  const selectedDate = dateList[selectedDateIndex];
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedFares = faresByDate[selectedDateStr] || {};
  const dateStr = dateList[selectedDateIndex]?.toISOString().split('T')[0];

  return (
    <>
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .floating-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 128, 0.15);
        }
        
        .glassmorphism {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, #000080 0%, #1e40af 50%, #DA291C 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }
        
        .train-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 128, 0.1);
        }
        
        .train-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -5px rgba(0, 0, 128, 0.15);
        }
        
        .filter-button {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(0, 0, 128, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .filter-button.active {
          background: linear-gradient(135deg, #000080 0%, #1e40af 100%);
          border-color: #000080;
          color: white;
          transform: scale(1.05);
        }
        
        .filter-button:hover:not(.active) {
          border-color: #000080;
          background: rgba(255, 255, 255, 1);
        }
        
        .floating-filter-panel {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          margin-top: 90px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 128, 0.25);
        }
        
        .mobile-slide-in {
          animation: slideInFromRight 0.3s ease-out;
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .route-line {
          background: linear-gradient(90deg, #000080 0%, #1e40af 50%, #DA291C 100%);
          height: 2px;
        }
        
        .availability-badge {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .running-days-compact {
          display: flex;
          gap: 1px;
          align-items: center;
        }
        
        .day-pill {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          transition: all 0.2s ease;
          color: white;
        }
        
        .day-pill.active {
          background: #10b981;
        }
        
        .day-pill.inactive {
          background: #DA291C;
        }
        
        .content-container {
          min-height: calc(100vh - 200px);
        }
        
        .scrollable-main {
          overflow-y: auto;
          max-height: calc(100vh - 250px);
        }
        
        .scrollable-main::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollable-main::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .scrollable-main::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #000080 0%, #1e40af 100%);
          border-radius: 10px;
        }
        
        .filter-sidebar-content {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        
        .filter-sidebar-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .filter-sidebar-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .filter-sidebar-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #000080 0%, #1e40af 100%);
          border-radius: 10px;
        }
        
        .sidebar-sticky {
          position: sticky;
          top: 120px;
          align-self: flex-start;
        }
        
        @media (max-width: 768px) {
          .floating-card {
            border-radius: 16px;
          }
          
          .train-card {
            border-radius: 16px;
          }
          
          .content-container {
            min-height: calc(100vh - 150px);
          }
          
          .scrollable-main {
            max-height: calc(100vh - 200px);
          }
        }
        
        @media (min-width: 950px) and (max-width: 1279px) {
          .sidebar-sticky {
            top: 100px;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Enhanced Header */}
        <div className="hero-gradient text-white shadow-2xl relative">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FaTrain className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black">Available Trains</h1>
                    <p className="text-white/80">Your journey options await</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="font-semibold">
                      {trains[0]?.route.find(s => s.stationCode === from)?.stationName} ({from})
                    </span>
                    <ArrowRightIcon className="w-4 h-4 text-white/60" />
                    <span className="font-semibold">
                      {trains[0]?.route.find(s => s.stationCode === to)?.stationName} ({to})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                    <FaCalendarAlt className="text-white/60" />
                    <span className="text-sm">
                      {selectedDate.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-green-400/20 px-3 py-2 rounded-xl">
                    <MdVerified className="text-green-300" />
                    <span className="text-sm">{filteredTrains.length} trains available</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/')}
                className="hidden lg:flex items-center gap-2 bg-white text-[#000080] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <FaSearch />
                New Search
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="content-container">
          <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col xl:flex-row gap-8">
            {/* Enhanced Desktop Filters Sidebar - Fixed */}
            {!isMobileView && (
              <div className="xl:w-80 flex-shrink-0 sidebar-sticky">
                <div className="floating-card p-6 filter-sidebar-content">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FunnelIcon className="w-6 h-6 text-[#000080]" />
                      Filters
                    </h2>
                    <button
                      onClick={() => {
                        setFilterClass('all');
                        setFilterAvailability(false);
                        setSelectedTrainTypes([]);
                        setDepartureTimeFilter([]);
                        setArrivalTimeFilter([]);
                      }}
                      className="text-sm bg-gradient-to-r from-[#DA291C] to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      Reset All
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Enhanced Date Selector */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-[#000080]" />
                        Select Date
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {dateList.map((date, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedDateIndex(idx)}
                            className={`filter-button p-2 text-[#000080] text-center transition-all duration-300 ${
                              idx === selectedDateIndex ? 'active' : ''
                            }`}
                          >
                            <div className="font-bold text-sm">{daysMap[date.getDay()]}</div>
                            <div className="text-lg font-black">{date.getDate()}</div>
                            <div className="text-xs opacity-75">{formatDate(date)}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Class Filter */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MdAirlineSeatReclineNormal className="text-[#000080]" />
                        Travel Class
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {['all', '2S', 'CC', 'SL', '3A', '2A'].map(cls => (
                          <button
                            key={cls}
                            onClick={() => setFilterClass(cls)}
                            className={`filter-button p-3 text-[#000080] font-bold text-sm ${
                              filterClass === cls ? 'active' : ''
                            }`}
                          >
                            {cls === 'all' ? 'All' : cls}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Availability Filter */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-[#000080]" />
                        Availability
                      </h3>
                      <label className="flex items-center justify-between p-4 filter-button cursor-pointer hover:border-[#000080]">
                        <div className="flex items-center gap-3">
                          <FaBolt className="text-[#000080]" />
                          <span className="font-semibold text-[#000080]">Show available only</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={filterAvailability}
                          onChange={() => setFilterAvailability(!filterAvailability)}
                          className="w-5 h-5 text-[#000080] rounded focus:ring-[#000080]"
                        />
                      </label>
                    </div>

                    {/* Enhanced Train Type Filter */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaTrain className="text-[#000080]" />
                        Train Types
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {trainTypes.map(type => (
                          <button
                            key={type.name}
                            onClick={() => setSelectedTrainTypes(prev => 
                              prev.some(t => t.name === type.name) 
                                ? prev.filter(t => t.name !== type.name) 
                                : [...prev, type]
                            )}
                            className={`filter-button p-3 flex items-center text-[#000080] justify-center gap-2 text-sm font-semibold ${
                              selectedTrainTypes.some(t => t.name === type.name) ? 'active' : ''
                            }`}
                          >
                            {type.icon}
                            <span>{type.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Time Filters */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FiSunrise className="text-[#000080]" />
                          Departure Time
                        </h3>
                        <div className="space-y-2">
                          {timeSlots.map(slot => (
                            <button
                              key={slot.label}
                              onClick={() => setDepartureTimeFilter(prev =>
                                prev.some(s => s.label === slot.label)
                                  ? prev.filter(s => s.label !== slot.label)
                                  : [...prev, slot]
                              )}
                              className={`filter-button w-full text-[#000080] p-3 flex items-center gap-3 ${
                                departureTimeFilter.some(s => s.label === slot.label) ? 'active' : ''
                              }`}
                            >
                              {slot.icon}
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-sm">{slot.label}</div>
                                <div className="text-xs opacity-75">
                                  {slot.start === 0 ? '12' : slot.start}:00 - {slot.end === 24 ? '11' : slot.end}:59
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FiSunset className="text-[#000080]" />
                          Arrival Time
                        </h3>
                        <div className="space-y-2">
                          {timeSlots.map(slot => (
                            <button
                              key={slot.label}
                              onClick={() => setArrivalTimeFilter(prev =>
                                prev.some(s => s.label === slot.label)
                                  ? prev.filter(s => s.label !== slot.label)
                                  : [...prev, slot]
                              )}
                              className={`filter-button w-full text-[#000080] p-3 flex items-center gap-3 ${
                                arrivalTimeFilter.some(s => s.label === slot.label) ? 'active' : ''
                              }`}
                            >
                              {slot.icon}
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-sm">{slot.label}</div>
                                <div className="text-xs opacity-75">
                                  {slot.start === 0 ? '12' : slot.start}:00 - {slot.end === 24 ? '11' : slot.end}:59
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 scrollable-main">
              <div className="space-y-6">
                {/* Enhanced Sorting Controls */}
                <div className="floating-card p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BoltIcon className="w-5 h-5 text-[#000080]" />
                      <span className="font-bold text-gray-800">Sort by:</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: 'departure', label: 'Departure', icon: <FiSunrise /> },
                        { key: 'arrival', label: 'Arrival', icon: <FiSunset /> },
                        { key: 'duration', label: 'Duration', icon: <FaClock /> },
                        { key: 'price', label: 'Price', icon: <FiTrendingUp /> }
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => {
                            if (sortBy === option.key) {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy(option.key);
                              setSortOrder('asc');
                            }
                          }}
                          className={`filter-button px-4 py-2 text-[#000080] flex items-center gap-2 ${
                            sortBy === option.key ? 'active' : ''
                          }`}
                        >
                          {option.icon}
                          <span className="font-medium">{option.label}</span>
                          {sortBy === option.key && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Results Count */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-gray-600">
                      Showing <span className="font-bold text-[#000080]">{filteredTrains.length}</span> of{' '}
                      <span className="font-bold text-gray-800">{trains.length}</span> trains
                    </div>
                    {filteredTrains.length < trains.length && (
                      <div className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                        {trains.length - filteredTrains.length} hidden by filters
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>Last updated: {getTimeAgo(availabilityTimestamps[trains[0]?.trainNumber])}</span>
                  </div>
                </div>

                {/* Enhanced Train List */}
                <div className="space-y-6">
                  {filteredTrains.map((train) => {
                    const fromStation = train.route?.find(s => s.stationCode === from);
                    const toStation = train.route?.find(s => s.stationCode === to);
                    if (!fromStation || !toStation) return null;

                    const durationText = calculateDuration(fromStation.departureTime, toStation.arrivalTime);
                    const dateAvailability = availabilityByTrainDate[train.trainNumber]?.[selectedDateStr] || {};

                    const classFares = Object.entries(train.seatAvailability || {})
                      .map(([cls]) => selectedFares[`${train.trainNumber}_${cls}`])
                      .filter(v => typeof v === 'number');

                    const minFare = classFares.length > 0 ? Math.min(...classFares) : 'N/A';

                    return (
                      <div key={train._id} id={`train-${train._id}`} className="train-card overflow-hidden">
                        {/* Enhanced Train Header */}
                        <div className="p-6">
                          <div className="flex flex-col gap-6">
                            {/* Top Section: Train Info & Price */}
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                {/* Train Icon with Type Badge */}
                                <div className="relative">
                                  <div className="w-16 h-16 bg-gradient-to-br from-[#000080] to-blue-600 rounded-2xl flex items-center justify-center">
                                    <FaTrain className="text-white text-2xl" />
                                  </div>
                                  {train.type && (
                                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#DA291C] to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                      {train.type}
                                    </div>
                                  )}
                                </div>

                                {/* Train Details */}
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                    <h2 className="text-xl font-bold text-gray-800">{train.trainName}</h2>
                                    <div className="flex items-center gap-2">
                                      <span className="bg-gradient-to-r from-[#000080] to-blue-600 text-white px-4 py-1 rounded-full text-sx font-bold">
                                        {train.trainNumber}
                                      </span>
                                
                                    </div>
                                  </div>

                                  {/* Enhanced Compact Running Days */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-[#000080]">Runs:</span>
                                    <div className="running-days-compact">
                                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                                        const fullDay = daysMap[index];
                                        const isRunning = train.runningDays?.includes(fullDay) ?? true;
                                        return (
                                          <div
                                            key={index}
                                            className={`day-pill ${isRunning ? 'active' : 'inactive'}`}
                                            title={`${fullDay} - ${isRunning ? 'Runs' : 'Not Running'}`}
                                          >
                                            {day}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Price Section */}
                              <div className="text-center lg:text-right bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-2xl border border-green-200">
                                <div className="text-sx text-green-700 font-medium">Starting from</div>
                                <div className="text-3xl font-black text-green-800">
                                  {typeof minFare === 'number' ? `₹${minFare.toLocaleString('en-IN')}` : minFare}
                                </div>
                                <div className="text-xs text-green-600">per person</div>
                              </div>
                            </div>

                            {/* Enhanced Schedule Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Departure */}
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <FiSunrise className="text-blue-600" />
                                    <span className="text-sm font-semibold text-blue-700">Departure</span>
                                  </div>
                                  {(fromStation.dayCount > 1 || toStation.dayCount > 1) && (
                                    <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                                      Day {fromStation.dayCount}
                                    </span>
                                  )}
                                </div>
                                <div className="text-3xl font-black text-blue-800 mb-2">
                                  {fromStation.departureTime}
                                </div>
                                <div className="text-sm font-medium text-blue-700">
                                  {fromStation.stationName}(
                                  {fromStation.stationCode})
                                </div>
                                <div className="text-xs text-blue-600">
                                  {getStationDate(selectedDate, fromStation.dayCount).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  })}
                                </div>
                              </div>

                              {/* Duration */}
                              <div className="flex flex-col items-center justify-center p-6">
                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                  <FaClock />
                                  <span className="font-bold">{durationText}</span>
                                </div>
                                <div className="w-full route-line rounded-full relative">
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#000080]"></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 text-center">Non-stop journey</div>
                              </div>

                              {/* Arrival */}
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <FiSunset className="text-purple-600" />
                                    <span className="text-sm font-semibold text-purple-700">Arrival</span>
                                  </div>
                                  {(fromStation.dayCount > 1 || toStation.dayCount > 1) && (
                                    <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                                      Day {toStation.dayCount}
                                    </span>
                                  )}
                                </div>
                                <div className="text-3xl font-black text-purple-800 mb-2">
                                  {toStation.arrivalTime}
                                </div>
                                <div className="text-sm font-medium text-purple-700">
                                  {toStation.stationName}(
                                  {toStation.stationCode}
                                  )
                                </div>
                                <div className="text-xs text-purple-600">
                                  {getStationDate(selectedDate, toStation.dayCount).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => toggleTrainDetails(train._id)}
                                className="flex items-center gap-2 text-[#000080] bg-white font-semibold hover:text-blue-700 transition-colors"
                              >
                                {expandedTrain === train._id ? (
                                  <>
                                    <FaChevronUp />
                                    <span>Hide availability & details</span>
                                  </>
                                ) : (
                                  <>
                                    <FaChevronDown />
                                    <span>View availability & details</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => navigate(`/schedule/${train.trainNumber}`)}
                                  className="text-sm text-[#000080] bg-white  font-semibold pt-4 border-t border-gray-400"
                                >
                                  Full Schedule
                                </button>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <StarIcon className="w-4 h-4" />
                                  <span className='text-[#000080]'>4.{Math.floor(Math.random() * 5) + 3} rating</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Expanded Details */}
                        {expandedTrain === train._id && (
                          <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-6">
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                  <MdAirlineSeatReclineNormal className="text-[#000080]" />
                                  Seat Availability & Booking
                                </h3>
                                <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                  Live updates: {getTimeAgo(availabilityTimestamps[train.trainNumber])}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {Object.entries(train.seatAvailability || {}).map(([classType, quota]) => {
                                  const availability = dateAvailability[classType] ?? 0;
                                  const fare = selectedFares[`${train.trainNumber}_${classType}`] ?? 'N/A';
                                  const confirmationChance = getConfirmationChance(availability);
                                  const nextWaitlistNumber = bookingInfoByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType]?.nextWaitlistNumber ?? Math.abs(availability);

                                  return (
                                    <div
                                      key={classType}
                                      className="floating-card p-6 hover:scale-105 transition-all duration-300"
                                    >
                                      {/* Class Header */}
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-10 h-10 bg-gradient-to-br from-[#000080] to-blue-600 rounded-xl flex items-center justify-center">
                                            <MdAirlineSeatReclineNormal className="text-white" />
                                          </div>
                                          <div>
                                            <div className="font-bold text-gray-800">{classType}</div>
                                            <div className="text-xs text-gray-500">Class</div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-lg font-black text-[#DA291C]">
                                            {typeof fare === 'number' ? `₹${fare.toLocaleString('en-IN')}` : fare}
                                          </div>
                                          <div className="text-xs text-gray-500">per person</div>
                                        </div>
                                      </div>

                                      {/* Availability Status */}
                                      <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-700">Status:</span>
                                          <span
                                            className={`availability-badge px-3 py-1 rounded-full text-sm font-bold ${
                                              availability > 0
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                            }`}
                                          >
                                            {availability > 0
                                              ? `Available ${availability}`
                                              : `WL ${nextWaitlistNumber}`
                                            }
                                          </span>
                                        </div>

                                        {/* Confirmation Chance */}
                                        {confirmationChance && (
                                          <div className={`flex items-center gap-2 p-3 rounded-lg ${confirmationChance.bgColor} border`}>
                                            {confirmationChance.icon}
                                            <div>
                                              <div className="text-sm font-semibold">Confirmation Chance</div>
                                              <div className={`text-xs ${confirmationChance.color}`}>
                                                {confirmationChance.percentage}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Book Now Button */}
                                      <button
                                        onClick={() => handleBookNow(train, classType)}
                                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                          availability > 0
                                            ? 'bg-gradient-to-r from-[#000080] to-blue-600 hover:from-blue-600 hover:to-[#000080]'
                                            : 'bg-gradient-to-r from-[#DA291C] to-red-600 hover:from-red-600 hover:to-[#DA291C]'
                                        }`}
                                      >
                                        {availability > 0 ? (
                                          <div className="flex items-center justify-center gap-2">
                                            <FaCheckCircle />
                                            <span>Book Now</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-center gap-2">
                                            <FaClock />
                                            <span>Join Waitlist</span>
                                          </div>
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced No Results */}
                {filteredTrains.length === 0 && (
                  <div className="floating-card p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <FaFilter className="text-white text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">No trains match your filters</h3>
                    <p className="text-gray-600 mb-8">Try adjusting your filters or select a different date to see more options.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button
                        onClick={() => {
                          setFilterClass('all');
                          setFilterAvailability(false);
                          setSelectedTrainTypes([]);
                          setDepartureTimeFilter([]);
                          setArrivalTimeFilter([]);
                        }}
                        className="bg-gradient-to-r from-[#000080] to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        Reset All Filters
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="border-2 border-[#000080] bg-white text-[#000080] px-8 py-3 rounded-xl font-semibold hover:bg-[#000080] hover:text-white transition-all duration-300"
                      >
                        New Search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Filter Button */}
        {isMobileView && (
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-16 h-16 bg-gradient-to-br from-[#000080] to-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
            >
              <FunnelIcon className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Enhanced Mobile Filters Panel */}
        {isMobileView && showMobileFilters && (
          <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="floating-filter-panel w-5/6 h-full overflow-y-auto p-6 mobile-slide-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FunnelIcon className="w-6 h-6 text-[#000080]" />
                  Filters
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setFilterClass('all');
                      setFilterAvailability(false);
                      setSelectedTrainTypes([]);
                      setDepartureTimeFilter([]);
                      setArrivalTimeFilter([]);
                    }}
                    className="text-sm bg-gradient-to-r from-[#DA291C] to-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-200"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              {/* Mobile filter content */}
              <div className="space-y-6">
                {/* Date Selector */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-[#000080]" />
                    Select Date
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {dateList.map((date, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedDateIndex(idx);
                          setShowMobileFilters(false);
                        }}
                        className={`filter-button p-2 text-[#000080] text-center ${
                          idx === selectedDateIndex ? 'active' : ''
                        }`}
                      >
                        <div className="font-bold text-sm">{daysMap[date.getDay()]}</div>
                        <div className="text-lg font-black">{date.getDate()}</div>
                        <div className="text-xs opacity-75">{formatDate(date)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Filter */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdAirlineSeatReclineNormal className="text-[#000080]" />
                    Travel Class
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['all', '2S', 'CC', 'SL', '3A', '2A'].map(cls => (
                      <button
                        key={cls}
                        onClick={() => {
                          setFilterClass(cls);
                          setShowMobileFilters(false);
                        }}
                        className={`filter-button p-3 text-[#000080] font-bold text-sm ${
                          filterClass === cls ? 'active' : ''
                        }`}
                      >
                        {cls === 'all' ? 'All' : cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaCheckCircle className="text-[#000080]" />
                    Availability
                  </h3>
                  <label className="flex items-center justify-between p-4 filter-button cursor-pointer hover:border-[#000080]">
                    <div className="flex items-center gap-3">
                      <FaBolt className="text-[#000080]" />
                      <span className="font-semibold text-[#000080]">Show available only</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={filterAvailability}
                      onChange={() => {
                        setFilterAvailability(!filterAvailability);
                        setShowMobileFilters(false);
                      }}
                      className="w-5 h-5 text-[#000080] rounded focus:ring-[#000080]"
                    />
                  </label>
                </div>

                {/* Train Type Filter */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaTrain className="text-[#000080]" />
                    Train Types
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {trainTypes.map(type => (
                      <button
                        key={type.name}
                        onClick={() => {
                          setSelectedTrainTypes(prev => 
                            prev.some(t => t.name === type.name) 
                              ? prev.filter(t => t.name !== type.name) 
                              : [...prev, type]
                          );
                          setShowMobileFilters(false);
                        }}
                        className={`filter-button p-3 flex items-center text-[#000080] justify-center gap-2 text-sm font-semibold ${
                          selectedTrainTypes.some(t => t.name === type.name) ? 'active' : ''
                        }`}
                      >
                        {type.icon}
                        <span>{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Departure Time Filter */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiSunrise className="text-[#000080]" />
                    Departure Time
                  </h3>
                  <div className="space-y-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.label}
                        onClick={() => {
                          setDepartureTimeFilter(prev =>
                            prev.some(s => s.label === slot.label)
                              ? prev.filter(s => s.label !== slot.label)
                              : [...prev, slot]
                          );
                          setShowMobileFilters(false);
                        }}
                        className={`filter-button w-full p-3 text-[#000080] flex items-center gap-3 ${
                          departureTimeFilter.some(s => s.label === slot.label) ? 'active' : ''
                        }`}
                      >
                        {slot.icon}
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-sm">{slot.label}</div>
                          <div className="text-xs opacity-75">
                            {slot.start === 0 ? '12' : slot.start}:00 - {slot.end === 24 ? '11' : slot.end}:59
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arrival Time Filter */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiSunset className="text-[#000080]" />
                    Arrival Time
                  </h3>
                  <div className="space-y-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.label}
                        onClick={() => {
                          setArrivalTimeFilter(prev =>
                            prev.some(s => s.label === slot.label)
                              ? prev.filter(s => s.label !== slot.label)
                              : [...prev, slot]
                          );
                          setShowMobileFilters(false);
                        }}
                        className={`filter-button w-full text-[#000080] p-3 flex items-center gap-3 ${
                          arrivalTimeFilter.some(s => s.label === slot.label) ? 'active' : ''
                        }`}
                      >
                        {slot.icon}
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-sm">{slot.label}</div>
                          <div className="text-xs opacity-75">
                            {slot.start === 0 ? '12' : slot.start}:00 - {slot.end === 24 ? '11' : slot.end}:59
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrainResult;