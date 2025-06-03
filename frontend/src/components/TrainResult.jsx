import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSortAmountDown, FaSortAmountUp, FaTrain, FaClock, FaCalendarAlt, FaSearch, FaArrowRight, FaChevronDown, FaChevronUp, FaWheelchair, FaWifi, FaUtensils, FaSnowflake, FaPlug, FaTimes, FaBed, FaFilter } from 'react-icons/fa';
import { FiSunrise, FiSunset } from 'react-icons/fi';
import { MdDirectionsRailway, MdAirlineSeatReclineNormal } from 'react-icons/md';

const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper functions
const formatDate = (date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });


// Helper function at the top of the file
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
  if (count > -20) return { percentage: 'High (≥90%)', color: 'text-green-600' };
  if (count > -40) return { percentage: 'Good (75-90%)', color: 'text-green-600' };
  if (count > -60) return { percentage: 'Moderate (50-75%)', color: 'text-orange-500' };
  return { percentage: 'Low (25-50%)', color: 'text-red-600' };
};

const TrainResult = () => {
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

  const timeSlots = [
    { label: 'Early Morning', start: 0, end: 6 },
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Afternoon', start: 12, end: 16 },
    { label: 'Evening', start: 16, end: 21 },
    { label: 'Night', start: 21, end: 24 },
  ];

  const trainTypes = ['Superfast', 'Express', 'Passenger', 'Vande Bharat', 'Rajdhani', 'Duronto'];
const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 950);
    };

    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
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
      const res = await fetch(
        `http://localhost:5000/api/trains/search?from=${from}&to=${to}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        // Get the day name for selected date (e.g., "Mon")
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
  
  // Add running days check here using the currently selected date
  const selectedDate = dateList[selectedDateIndex];
  if (!doesTrainRunOnDate(train, selectedDate)) return false;
  
  if (filterClass !== 'all' && !train.seatAvailability?.[filterClass]) return false;
  
  const selectedDateStr = selectedDate?.toISOString().split('T')[0] || '';
  const availability = availabilityByTrainDate[train.trainNumber]?.[selectedDateStr] || {};
  
  if (filterAvailability && !Object.values(availability).some(count => count > 0)) return false;
  if (selectedTrainTypes.length > 0 && !selectedTrainTypes.includes(train.type)) return false;
  
  // Departure time filter
  if (departureTimeFilter.length > 0) {
    const departureHour = parseInt(fromStation.departureTime?.split(':')[0]);
    const matches = departureTimeFilter.some(slot => 
      departureHour >= slot.start && departureHour < slot.end
    );
    if (!matches) return false;
  }

  // Arrival time filter
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <MdDirectionsRailway className="text-6xl text-[#000080] mb-4 animate-bounce" />
        <div className="text-2xl font-bold text-[#000080] mb-2">Searching for Trains</div>
        <div className="text-gray-600">Please wait while we fetch the best options for you</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 max-w-md">
          <div className="bg-[#000080] h-2.5 rounded-full animate-progress" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  );

  if (!dateList.length) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-gray-200">
        <FaTimes className="text-5xl text-[#DA291C] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Date</h2>
        <p className="text-gray-600 mb-6">Please select a valid date to view available trains.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#000080] hover:bg-[#0000a0] text-white font-medium py-2 px-6 rounded-lg transition duration-300"
        >
          Back to Search
        </button>
      </div>
    </div>
  );

  if (!Array.isArray(trains) || trains.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-gray-200">
        <FaTrain className="text-5xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Trains Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find any trains for the selected route. Please try different stations.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#000080] hover:bg-[#0000a0] text-white font-medium py-2 px-6 rounded-lg transition duration-300"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1a237e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Available Trains</h1>
              <div className="flex flex-col xs:flex-row items-baseline gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium bg-white/90 text-[#000080] px-2 py-1 rounded text-sm">
                    {trains[0]?.route.find(s => s.stationCode === from)?.stationName} ({from})
                  </span>
                  <FaArrowRight className="text-blue-200 shrink-0" />
                  <span className="font-medium bg-white/90 text-[#000080] px-2 py-1 rounded text-sm">
                    {trains[0]?.route.find(s => s.stationCode === to)?.stationName} ({to})
                  </span>
                </div>
                <div className="flex items-center text-xs md:text-sm bg-white/10 px-2 py-1 rounded">
                  <FaCalendarAlt className="mr-1" />
                  {selectedDate.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="hidden md:flex items-center bg-white text-[#000080] hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition-all"
            >
              New Search
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      {isMobileView && (
        <div className="fixed bottom-4 right-4 z-20">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="bg-[#000080] text-white p-3 rounded-full shadow-lg hover:bg-[#0000a0] transition-all flex items-center justify-center"
          >
            <FaFilter className="text-xl mr-2" />
            {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Desktop Filters Sidebar */}
        {!isMobileView && (
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-100px)] bg-white lg:overflow-y-auto lg:w-[300px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-6">
              {/* Date Selector */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-[#000080]">Filters:</span>
                <div className="bg-white rounded-lg text-right">
              <button
                onClick={() => {
                  setFilterClass('all');
                  setFilterAvailability(false);
                  setSelectedTrainTypes([]);
                  setDepartureTimeFilter([]);
                  setArrivalTimeFilter([]);
                  
                }}
                className="bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white font-medium rounded-lg"
              >
                Reset
              </button>
            </div>
            </div>  <br></br>
                <h3 className="text-sm font-semibold text-[#000080] mb-3">Select Date</h3>
                <div className="grid grid-cols-3 gap-2">
                  {dateList.map((date, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDateIndex(idx)}
                      className={`p-2 bg-[#000080] border-black font-bold  font-montserrat text-center rounded-lg border ${
                        idx === selectedDateIndex
                          ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                      }`}
                    >
                      <div className="text-xs font-montserrat font-medium">{daysMap[date.getDay()]}</div>
             
                      <div className="text-xs">{formatDate(date)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Filter */}
              <div>
                <h3 className="text-sm font-semibold text-[#000080] mb-3">Class Type</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['2S', 'CC', 'SL', '3A', '2A'].map(cls => (
                    <button
                      key={cls}
                      onClick={() => setFilterClass(cls)}
                      className={`p-2 border-black font-bold  rounded text-sm ${
                        filterClass === cls 
                         ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h3 className="text-sm font-semibold text-[#000080] mb-3">Availability</h3>
                <label className="flex items-center justify-between p-3 border border-black rounded-lg hover:border-[#000080]">
                  <span className="text-sm bg-white text-[#000080] ">Show available only</span>
                  <input 
                    type="checkbox"
                    checked={filterAvailability}
                    onChange={() => setFilterAvailability(!filterAvailability)}
                    className="h-4 w-4 text-[#000080] rounded focus:ring-[#000080]"
                  />
                </label>
              </div>

              {/* Train Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-[#000080] mb-3">Train Type</h3>
                <div className="grid grid-cols-2 gap-2 ">
                  {trainTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedTrainTypes(prev => 
                        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                      )}
                      className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
                        selectedTrainTypes.includes(type)
                        ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Filters */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
                    <FiSunrise className="mr-2" />
                    Departure Time
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.label}
                        onClick={() => setDepartureTimeFilter(prev =>
                          prev.some(s => s.label === slot.label)
                            ? prev.filter(s => s.label !== slot.label)
                            : [...prev, slot]
                        )}
                        className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
                          departureTimeFilter.some(s => s.label === slot.label)
                          ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
                    <FiSunset className="mr-2" />
                    Arrival Time
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.label}
                        onClick={() => setArrivalTimeFilter(prev =>
                          prev.some(s => s.label === slot.label)
                            ? prev.filter(s => s.label !== slot.label)
                            : [...prev, slot]
                        )}
                        className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
                          arrivalTimeFilter.some(s => s.label === slot.label)
                            ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

             
            </div>
          </div>
        )}

        {/* Mobile Filters Panel */}
        {isMobileView && showMobileFilters && (
          <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex justify-end">
            <div className="bg-white w-5/6 h-full overflow-y-auto p-4 animate-slide-in">
              <div className="flex  items-center mb-5">
                <h2 className="text-lg font-bold text-[#000080]">Filters</h2>
                <div className="flex justify-end flex-1 gap-3">
                <div className="bg-white rounded-lg">
              <button
                onClick={() => {
                  setFilterClass('all');
                  setFilterAvailability(false);
                  setSelectedTrainTypes([]);
                  setDepartureTimeFilter([]);
                  setArrivalTimeFilter([]);
                  
                }}
                className="bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white font-medium rounded-lg"
              >
                Reset
              </button>
            </div>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="text-[#000080] border-black bg-white hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              </div>
              
              {/* Mobile Filter Content */}
              <div className="space-y-6">
                {/* Date Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#000080] mb-3">Select Date</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {dateList.map((date, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedDateIndex(idx);
                          setShowMobileFilters(false);
                        }}
                        className={`p-2 text-center border-black rounded-lg border ${
                          idx === selectedDateIndex
                       ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                        }`}
                      >
                        <div className="text-xs font-medium">{daysMap[date.getDay()]}</div>
                        <div className="text-sm font-bold">{date.getDate()}</div>
                        <div className="text-xs">{formatDate(date)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-[#000080] mb-3">Class Type</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['2S', 'CC', 'SL', '3A', '2A'].map(cls => (
                      <button
                        key={cls}
                        onClick={() => setFilterClass(cls)}
                        className={`p-2 rounded-lg border-black text-sm border ${
                          filterClass === cls 
                        ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-[#000080] mb-3">Availability</h3>
                  <label className="flex items-center justify-between p-3 border border-black rounded-lg hover:border-[#000080]">
                    <span className="text-sm text-[#000080]">Show available only</span>
                    <input 
                      type="checkbox"
                      checked={filterAvailability}
                      onChange={() => setFilterAvailability(!filterAvailability)}
                      className="h-4 w-4 text-[#000080] rounded focus:ring-[#000080]"
                    />
                  </label>
                </div>

                {/* Train Type Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-[#000080] mb-3">Train Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {trainTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedTrainTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        )}
                        className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
                          selectedTrainTypes.includes(type)
                           ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Filters */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
                      <FiSunrise className="mr-2" />
                      Departure Time
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot.label}
                          onClick={() => setDepartureTimeFilter(prev =>
                            prev.some(s => s.label === slot.label)
                              ? prev.filter(s => s.label !== slot.label)
                              : [...prev, slot]
                          )}
                          className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
                            departureTimeFilter.some(s => s.label === slot.label)
                        ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
                      <FiSunset className="mr-2" />
                      Arrival Time
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot.label}
                          onClick={() => setArrivalTimeFilter(prev =>
                            prev.some(s => s.label === slot.label)
                              ? prev.filter(s => s.label !== slot.label)
                              : [...prev, slot]
                          )}
                          className={`flex items-center border-black justify-center p-2 text-sm rounded-lg border ${
                            arrivalTimeFilter.some(s => s.label === slot.label)
                         ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Sorting Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-semibold text-[#000080]">Sort by:</span>
              {['Departure', 'Arrival', 'Duration', 'Price'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    const optionLower = option.toLowerCase();
                    if (sortBy === optionLower) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(optionLower);
                      setSortOrder('asc');
                    }
                  }}
                  className={`flex items-center border-black px-4 py-2 rounded-full text-sm border ${
                    sortBy === option.toLowerCase() 
                   ? 'border-[#000080] bg-[#000080] text-white'
                            : 'border-gray-200 bg-white text-[#000080] hover:border-[#000080]'
                  }`}
                >
                  {option}
                  {sortBy === option.toLowerCase() && (
                    <span className="ml-2">
                      {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-[#000080]">{filteredTrains.length}</span> out of <span className="font-semibold">{trains.length}</span> trains
            </div>
            {filteredTrains.length < trains.length && (
              <div className="text-xs text-gray-500 mt-1">
                {trains.length - filteredTrains.length} train(s) hidden - not operational on {daysMap[dateList[selectedDateIndex].getDay()]}
              </div>
            )}
          </div>

          {/* Train List */}
          <div className="space-y-4">
            {filteredTrains.map((train) => {
              const fromStation = train.route?.find(s => s.stationCode === from);
              const toStation = train.route?.find(s => s.stationCode === to);
              if (!fromStation || !toStation) return null;

              const durationText = calculateDuration(fromStation.departureTime, toStation.arrivalTime);
              const dateAvailability = availabilityByTrainDate[train.trainNumber]?.[selectedDateStr] || {};
         

              // Get fares safely
              const classFares = Object.entries(train.seatAvailability || {})
                .map(([cls]) => selectedFares[`${train.trainNumber}_${cls}`])
                .filter(v => typeof v === 'number');

              const minFare = classFares.length > 0 ? Math.min(...classFares) : 'N/A';

              return (
                <div key={train._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Train Header */}
     <div className="p-4">
  <div className="flex flex-col gap-4">
    {/* Top Section: Train Details */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      
      {/* Left Section: Icon + Train Info */}
      <div className="flex gap-3 flex-1">
        {/* Icon */}
        <div className="w-10 h-8 rounded-lg bg-white flex items-center justify-center text-[#000080] shrink-0">
          <FaTrain className="text-xl" />
        </div>

        {/* Train Details */}
        <div className="flex flex-col gap-1 w-full">
          {/* Train Name and Number */}
          <div className="flex items-center justify-between sm:flex-row sm:items-center sm:gap-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              {train.trainName}
            </h2>
            <span className="text-sm mt-1 sm:mt-0 font-montserrat bg-[#000080] font-bold text-white rounded px-2 py-1 w-fit">
              {train.trainNumber}
            </span>
          </div>

          {/* Running Days */}
          <div className="flex flex-wrap gap-1 mt-2 sm:mt-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span
                key={day}
                className={`text-xs sm:text-xs font-montserrat px-1.5 rounded-full ${
                  train.runningDays.includes(day)
                   ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                }`}
                title={day}
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Right: Fare */}
      <div className="text-right min-w-[120px]">
        <div className="text-xs text-gray-500">Starting from</div>
        <div className="text-lg font-bold text-[#DA291C]">
          {typeof minFare === 'number' ? `₹${minFare.toLocaleString('en-IN')}` : minFare}
        </div>
      </div>
    </div>
    {/* Schedule Grid: Departure - Duration - Arrival */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Departure */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
  <div className="flex justify-between items-baseline">
    <div className="font-montserrat font-bold text-lg text-[#000080]">{fromStation.departureTime}</div>
    <div className="text-xs text-gray-600">
      {getStationDate(selectedDate, fromStation.dayCount).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })}
    </div>
  </div>
  <div className="text-xs text-gray-700 mt-1 truncate">
    {fromStation.stationName} ({from})
  </div>
   {(fromStation.dayCount > 1 || toStation.dayCount > 1) && (
    <div className="text-xs font-montserrat font-bold  text-[#DA291C] mt-1">
      Day {fromStation.dayCount}
    </div>
  )}
      </div>

      {/* Duration */}
      <div className="flex flex-col items-center justify-center sm:py-2">
        <div className="flex items-center text-[#000080] text-sm">
          <FaClock className="mr-2" />
          <span>{durationText}</span>
        </div>
        <div className="w-full mt-3 h-px bg-gradient-to-r from-blue-100 via-[#000080] to-blue-100" />
      </div>

      {/* Arrival */}
     <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
  <div className="flex justify-between items-baseline">
    <div className="font-montserrat font-bold text-lg text-[#000080]">{toStation.arrivalTime}</div>
    <div className="text-xs text-gray-600">
      {getStationDate(selectedDate, toStation.dayCount).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })}
    </div>
  </div>
  <div className="text-xs text-gray-700 mt-1 truncate">
    {toStation.stationName} ({to})
  </div>
   {(fromStation.dayCount > 1 || toStation.dayCount > 1) && (
    <div className="text-xs font-montserrat font-bold  text-[#DA291C]  mt-1">
      Day {toStation.dayCount}
    </div>
  )}
      </div>
    </div>

    {/* Footer: View Details (left), View Schedule (right) */}
    <div className="pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-gray-200">
      {/* Left: View Details */}
      <button
        onClick={() => toggleTrainDetails(train._id)}
        className="flex items-center text-sm border-black bg-white font-medium"
      >
        {expandedTrain === train._id ? (
          <>
            <span className="text-[#000080]">Hide details</span>
            <FaChevronUp className="ml-2 text-[#000080]" />
          </>
        ) : (
          <>
            <span className="text-[#000080]">View details</span>
            <FaChevronDown className="ml-2 text-[#000080]" />
          </>
        )}
      </button>

      {/* Right: View Schedule */}
      <button
        onClick={() => navigate(`/schedule/${train.trainNumber}`)}
        className="text-sm text-[#000080] bg-white underline hover:text-[#1a237e] self-end sm:self-auto"
      >
        View Full Schedule
      </button>
    </div>
  </div>
</div>


                  {/* Expanded Details */}
  {expandedTrain === train._id && (
  <div className="border-t border-gray-200 p-4 bg-gray-50">
    <div>
      <h3 className="text-sm font-semibold text-[#000080] mb-3 flex items-center">
        <MdAirlineSeatReclineNormal className="mr-2" />
        Seat Availability
        <span className="ml-auto text-xs font-medium text-[#000080]">
          Last updated: {getTimeAgo(availabilityTimestamps[train.trainNumber])}
        </span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(train.seatAvailability || {}).map(([classType, quota]) => {
          const availability = dateAvailability[classType] ?? 0;
          const fare = selectedFares[`${train.trainNumber}_${classType}`] ?? 'N/A';
          const confirmationChance = getConfirmationChance(availability);
 const nextWaitlistNumber = bookingInfoByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType]?.nextWaitlistNumber ?? Math.abs(availability);
          return (
            <div
  key={classType}
  className="border border-black rounded-lg p-3 hover:border-[#000080] transition-all text-sm sm:text-base flex flex-col justify-between h-full w-full max-w-[320px] mx-auto"
>

              {/* Class Type & Fare */}
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-[#000080] text-base">{classType}</div>
                <div className="text-sm font-bold text-[#DA291C]">
                  {typeof fare === 'number' ? `₹${fare.toLocaleString('en-IN')}` : fare}
                </div>
              </div>

              {/* Availability */}
              <div className="mt-1 flex justify-between items-center">
                <span className="text-sm text-[#000080]">Status:</span>
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-xs font-montserrat font-bold ${
                    availability > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#FFE5E5] text-[#DA291C]'
                  }`}
                >
                 {availability > 0
  ? `Available ${availability}`
  : `WL ${bookingInfoByTrainDate?.[train.trainNumber]?.[dateStr]?.[classType]?.nextWaitlistNumber ?? Math.abs(availability)}`}
                </span>
              </div>

              {/* Confirmation Chance */}
              {confirmationChance && (
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-sm text-[#000080]">Confirmation:</span>
                  <span className={`text-xs font-medium ${confirmationChance.color}`}>
                    {confirmationChance.percentage}
                  </span>
                </div>
              )}

              {/* Book Button */}
         <button
  onClick={() => handleBookNow(train, classType)}
  className={`mt-3 w-full py-1.5 rounded-lg text-sm font-medium transition-colors ${
    availability > 0
      ? 'bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white'
      : 'bg-[#DA291C] hover:from-yellow-600 hover:to-yellow-800 text-white'
  }`}
>
Book Now

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

          {/* No Results */}
          {filteredTrains.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FaFilter className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No trains match your filters</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or select a different date</p>
              <button
                onClick={() => {
                  setFilterClass('all');
                  setFilterAvailability(false);
                  setSelectedTrainTypes([]);
                  setDepartureTimeFilter([]);
                  setArrivalTimeFilter([]);

                }}
                className="bg-gradient-to-r from-[#000080] to-[#1a237e] hover:from-[#1a237e] hover:to-[#000080] text-white font-medium py-2 px-6 rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainResult;