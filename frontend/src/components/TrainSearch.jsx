import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaTrain, 
  FaExchangeAlt, 
  FaSearch, 
  FaCalendarAlt,
  FaTicketAlt,
  FaChevronDown,
  FaInfoCircle
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

export default function TrainSearch() {
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [filteredFrom, setFilteredFrom] = useState([]);
  const [filteredTo, setFilteredTo] = useState([]);
  const [selectedFromIndex, setSelectedFromIndex] = useState(-1);
  const [selectedToIndex, setSelectedToIndex] = useState(-1);
  const [date, setDate] = useState("");
  const [ticketType, setTicketType] = useState("General");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketTypes, setShowTicketTypes] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState([]);

  // Color constants
  const primaryColor = "#000080";
  const secondaryColor = "#DA291C";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const stationsRes = await axios.get("http://localhost:5000/api/stations");
          if (!stationsRes?.data) {
          throw new Error("No stations data received");
        }
        setStations(stationsRes.data);
        
      } catch (error) {
        console.error("Error fetching data:", error);
                setErrorMessage("Failed to load station data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const isExactMatch = (input, type) => {
    const match = stations.find(
      (s) =>
        s.stationName.toLowerCase() === input.toLowerCase() ||
        s.stationCode.toLowerCase() === input.toLowerCase()
    );

    if (match) {
      if (type === "from") {
        setFromStation(`${match.stationName} (${match.stationCode})`);
      } else {
        setToStation(`${match.stationName} (${match.stationCode})`);
      }
    }

    return Boolean(match);
  };

  const handleFromInput = (e) => {
    const input = e.target.value;
    setFromStation(input);
    const filtered = stations.filter(
      (s) =>
        (s.stationName.toLowerCase().includes(input.toLowerCase()) ||
          s.stationCode.toLowerCase().includes(input.toLowerCase())) &&
        s.stationName.toLowerCase() !== toStation.toLowerCase()
    );
    setFilteredFrom(filtered);
    setSelectedFromIndex(-1);
    isExactMatch(input, "from");
  };

  const handleToInput = (e) => {
    const input = e.target.value;
    setToStation(input);
    const filtered = stations.filter(
      (s) =>
        (s.stationName.toLowerCase().includes(input.toLowerCase()) ||
          s.stationCode.toLowerCase().includes(input.toLowerCase())) &&
        s.stationName.toLowerCase() !== fromStation.toLowerCase()
    );
    setFilteredTo(filtered);
    setSelectedToIndex(-1);
    isExactMatch(input, "to");
  };

  const handleSelectFromStation = (station) => {
    setFromStation(`${station.stationName} (${station.stationCode})`);
    setFilteredFrom([]);
    setSelectedFromIndex(-1);
    setErrorMessage("");
  };

  const handleSelectToStation = (station) => {
    setToStation(`${station.stationName} (${station.stationCode})`);
    setFilteredTo([]);
    setSelectedToIndex(-1);
    setErrorMessage("");
  };

  const handleSwapStations = () => {
    const tempStation = fromStation;
    setFromStation(toStation);
    setToStation(tempStation);
    setFilteredFrom([]);
    setFilteredTo([]);
    setErrorMessage("");
  };

  const handleSearch = () => {
    if (!fromStation || !toStation || !date) {
      setErrorMessage("All fields are required");
      return;
    }

    if (fromStation.trim().toLowerCase() === toStation.trim().toLowerCase()) {
      setErrorMessage("Departure and arrival stations cannot be same");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    
    // Extract station codes from the input (format: "Station Name (CODE)")
    const fromCode = fromStation.match(/\(([^)]+)\)/)?.[1] || "";
    const toCode = toStation.match(/\(([^)]+)\)/)?.[1] || "";

    navigate(
      `/results?from=${fromCode}&to=${toCode}&date=${date}&type=${ticketType}`
    );
  };

  const handleKeyDownFrom = (e) => {
    if (!filteredFrom.length) return;
    if (e.key === "ArrowDown") {
      setSelectedFromIndex((prev) =>
        prev < filteredFrom.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setSelectedFromIndex((prev) =>
        prev > 0 ? prev - 1 : filteredFrom.length - 1
      );
    } else if (e.key === "Enter" && selectedFromIndex >= 0) {
      handleSelectFromStation(filteredFrom[selectedFromIndex]);
    }
  };

  const handleKeyDownTo = (e) => {
    if (!filteredTo.length) return;
    if (e.key === "ArrowDown") {
      setSelectedToIndex((prev) =>
        prev < filteredTo.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setSelectedToIndex((prev) =>
        prev > 0 ? prev - 1 : filteredTo.length - 1
      );
    } else if (e.key === "Enter" && selectedToIndex >= 0) {
      handleSelectToStation(filteredTo[selectedToIndex]);
    }
  };

  const handlePopularRouteSelect = (from, to) => {
    setFromStation(`${from.stationName} (${from.stationCode})`);
    setToStation(`${to.stationName} (${to.stationCode})`);
    setFilteredFrom([]);
    setFilteredTo([]);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const ticketTypes = [
    { value: "General", label: "General" },
    { value: "Tatkal", label: "Tatkal" },
    { value: "Premium Tatkal", label: "Premium Tatkal" },
    { value: "Ladies", label: "Ladies" },
    { value: "Duty Pass", label: "Duty Pass" },
    { value: "Person with Disability", label: "Person with Disability" },
    { value: "Senior Citizen", label: "Senior Citizen" },
    { value: "Student", label: "Student" }
  ];

  return (
    <section className="w-full py-8 px-4 md:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryColor }}>
            Indian Railways Train Booking
          </h1>
          <p className="text-gray-600">Book your train tickets in just a few clicks</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200">
          {/* Tabs */}
          <div className="flex border-b">
            <button className="flex-1 py-4 font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Train Tickets
            </button>
            <button className="flex-1 py-4 font-semibold text-gray-700 bg-gray-100">
              PNR Status
            </button>
            <button className="flex-1 py-4 font-semibold text-gray-700 bg-gray-100">
              Live Status
            </button>
          </div>

          {/* Search Form */}
          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* From Station */}
              <div className="relative md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Station
                </label>
                <div className="relative flex items-center">
                  <MdLocationOn className="absolute left-3 w-5 h-5" style={{ color: secondaryColor }} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-10 p-3 font-bold text-[#000080] border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Departure station"
                    value={fromStation}
                    onChange={handleFromInput}
                    onKeyDown={handleKeyDownFrom}
                    autoComplete="off"
                  />
                  <FaSearch className="absolute right-3 text-gray-400" />
                </div>
                {filteredFrom.length > 0 && (
                  <ul className="absolute z-30 bg-white border border-gray-300 rounded-lg w-full max-h-60 overflow-y-auto mt-1 text-black shadow-lg">
                    {filteredFrom.map((station, index) => (
                      <li
                        key={station._id}
                        onClick={() => handleSelectFromStation(station)}
                        className={`cursor-pointer p-3 hover:bg-gray-100 ${
                          index === selectedFromIndex ? "bg-gray-100" : ""
                        } border-b text-[#000080] border-gray-100 last:border-b-0`}
                      >
                        <div className="font-medium text-[#000080]">{station.stationName}</div>
                        <div className="text-sm text-[#000080]">{station.stationCode}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center md:col-span-2">
                <button
                  onClick={handleSwapStations}
                  className="mt-6 bg-gray-100 hover:bg-gray-200 p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Swap stations"
                >
                  <FaExchangeAlt className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* To Station */}
              <div className="relative md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Station
                </label>
                <div className="relative flex items-center">
                  <MdLocationOn className="absolute left-3 w-5 h-5" style={{ color: primaryColor }} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-10 p-3 text-[#000080] font-bold border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Arrival station"
                    value={toStation}
                    onChange={handleToInput}
                    onKeyDown={handleKeyDownTo}
                    autoComplete="off"
                  />
                  <FaSearch className="absolute right-3 text-gray-400" />
                </div>
                {filteredTo.length > 0 && (
                  <ul className="absolute z-30 bg-white border border-gray-300 rounded-lg w-full max-h-60 overflow-y-auto mt-1 text-black shadow-lg">
                    {filteredTo.map((station, index) => (
                      <li
                        key={station._id}
                        onClick={() => handleSelectToStation(station)}
                        className={`cursor-pointer p-3 hover:bg-gray-100 ${
                          index === selectedToIndex ? "bg-gray-100" : ""
                        } border-b border-gray-100 last:border-b-0`}
                      >
                        <div className="font-medium text-[#000080]">{station.stationName}</div>
                        <div className="text-sm text-[#000080]">{station.stationCode}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Date */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Journey Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#000080]" />
                  <input
                    type="date"
                    min={getTodayDate()}
                    className="w-full pl-10 p-3 border text-[#000080] font-bold border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => setDate(getTodayDate())}
                    className="text-xs text-white bg-[#000080] px-2 py-1 hover:bg-white hover:text-[#000080] rounded"
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => setDate(getTomorrowDate())}
                    className="text-xs text-white bg-[#000080] px-2 py-1 hover:bg-white hover:text-[#000080] rounded"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Ticket Type */}
              <div className="md:col-span-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Type
                </label>
                <div className="relative">
                  <FaTicketAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    className="w-full pl-10 pr-10 p-3 border border-gray-300 text-[#000080] font-bold bg-white rounded-lg text-left flex items-center justify-between"
                    onClick={() => setShowTicketTypes(!showTicketTypes)}
                  >
                    {ticketType}
                    <FaChevronDown className={`transition-transform ${showTicketTypes ? "transform rotate-180" : ""}`} />
                  </button>
                  {showTicketTypes && (
                    <ul className="absolute z-30 bg-white border border-gray-300 rounded-lg w-full max-h-60 overflow-y-auto mt-1 text-[#000080] shadow-lg">
                      {ticketTypes.map((type) => (
                        <li
                          key={type.value}
                          onClick={() => {
                            setTicketType(type.value);
                            setShowTicketTypes(false);
                          }}
                          className="cursor-pointer p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          {type.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Class */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[#000080] font-bold"
                >
                  <option value="All">All Classes</option>
                  <option value="SL">Sleeper (SL)</option>
                  <option value="3A">AC 3-Tier (3A)</option>
                  <option value="2A">AC 2-Tier (2A)</option>
                  <option value="1A">AC First Class (1A)</option>
                  <option value="CC">Chair Car (CC)</option>
                  <option value="EC">Executive Class (EC)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className={`px-8 py-4 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 text-white font-bold text-lg ${
                  isLoading ? "bg-gray-500" : ""}`}
                style={{ backgroundColor: isLoading ? "gray" : primaryColor }}
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Searching..."
                ) : (
                  <>
                    <FaTrain className="w-5 h-5" />
                    Search Trains
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        {popularRoutes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4" style={{ color: primaryColor }}>
                Popular Routes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularRoutes.map((route, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularRouteSelect(route.from, route.to)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="font-medium" style={{ color: secondaryColor }}>
                      {route.from.stationCode}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">{route.from.stationName}</div>
                    <div className="w-full flex justify-center my-1">
                      <FaExchangeAlt className="text-gray-400 transform rotate-90" />
                    </div>
                    <div className="font-medium" style={{ color: secondaryColor }}>
                      {route.to.stationCode}
                    </div>
                    <div className="text-xs text-gray-500">{route.to.stationName}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
              <FaInfoCircle />
              Booking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 pl-4" style={{ borderColor: secondaryColor }}>
                <h4 className="font-medium text-[#000080] mb-2">Easy Booking</h4>
                <p className="text-gray-600 text-sm">
                  Book train tickets in just a few clicks. Select your journey details and find available trains instantly.
                </p>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: secondaryColor }}>
                <h4 className="font-medium text-[#000080] mb-2">Multiple Payment Options</h4>
                <p className="text-gray-600 text-sm">
                  Pay using credit/debit cards, net banking, UPI, or wallets. Secure and hassle-free transactions.
                </p>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: secondaryColor }}>
                <h4 className="font-medium text-[#000080] mb-2">Instant Confirmation</h4>
                <p className="text-gray-600 text-sm">
                  Get instant confirmation and e-ticket on your email and mobile. No need to visit the station for booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}