import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTrain, FaExchangeAlt, FaSearch, FaCalendarAlt, FaTicketAlt,
  FaChevronDown, FaInfoCircle, FaRoute, FaClock, FaStar, FaCrown,
  FaFire, FaUsers, FaBolt, FaShieldAlt, FaHeart, FaArrowRight
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { SparklesIcon, BoltIcon } from "@heroicons/react/24/outline";

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
  const [selectedClass, setSelectedClass] = useState("All");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketTypes, setShowTicketTypes] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("train");

  const popularRoutes = [
    { from: { stationName: "New Delhi", stationCode: "NDLS" }, to: { stationName: "Mumbai Central", stationCode: "MMCT" }, time: "16h 25m", popularity: "95%" },
    { from: { stationName: "Howrah", stationCode: "HWH" }, to: { stationName: "New Delhi", stationCode: "NDLS" }, time: "17h 50m", popularity: "92%" },
    { from: { stationName: "Chennai Central", stationCode: "MAS" }, to: { stationName: "New Delhi", stationCode: "NDLS" }, time: "28h 50m", popularity: "88%" },
    { from: { stationName: "Bangalore", stationCode: "SBC" }, to: { stationName: "New Delhi", stationCode: "NDLS" }, time: "35h 15m", popularity: "85%" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:5000/api/stations");
        setStations(res.data || []);
      } catch {
        setErrorMessage("Failed to load station data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterStations = (input, exclude, setter, setFiltered, setIndex) => {
    setter(input);
    const filtered = stations.filter(s =>
      (s.stationName.toLowerCase().includes(input.toLowerCase()) ||
       s.stationCode.toLowerCase().includes(input.toLowerCase())) &&
      s.stationName.toLowerCase() !== exclude.toLowerCase()
    );
    setFiltered(filtered);
    setIndex(-1);
  };

  const handleSelect = (station, setter, setFiltered, setIndex) => {
    setter(`${station.stationName} (${station.stationCode})`);
    setFiltered([]);
    setIndex(-1);
    setErrorMessage("");
  };

  const handleSwap = () => {
    setFromStation(toStation);
    setToStation(fromStation);
    setFilteredFrom([]);
    setFilteredTo([]);
    setErrorMessage("");
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getTomorrowDate = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  };

  const ticketTypes = [
    { value: "General", label: "General", icon: <FaTicketAlt />, desc: "Standard booking" },
    { value: "Tatkal", label: "Tatkal", icon: <FaBolt />, desc: "Emergency quota" },
    { value: "Premium Tatkal", label: "Premium Tatkal", icon: <FaCrown />, desc: "Premium emergency" },
    { value: "Ladies", label: "Ladies", icon: <FaUsers />, desc: "Ladies quota" },
    { value: "Senior Citizen", label: "Senior Citizen", icon: <FaHeart />, desc: "Senior citizen quota" },
    { value: "Student", label: "Student", icon: <FaStar />, desc: "Student concession" }
  ];

  const classTypes = [
    { value: "All", label: "All Classes", icon: <FaTrain />, desc: "Show all" },
    { value: "SL", label: "Sleeper (SL)", icon: <FaTrain />, desc: "₹500 - ₹800" },
    { value: "3A", label: "AC 3-Tier (3A)", icon: <FaShieldAlt />, desc: "₹1200 - ₹2000" },
    { value: "2A", label: "AC 2-Tier (2A)", icon: <FaStar />, desc: "₹2000 - ₹3500" },
    { value: "1A", label: "AC First Class (1A)", icon: <FaCrown />, desc: "₹3500 - ₹6000" },
    { value: "CC", label: "Chair Car (CC)", icon: <FaUsers />, desc: "₹400 - ₹800" }
  ];

  const tabs = [
    { id: "train", label: "Train Tickets", icon: <FaTrain /> },
    { id: "pnr", label: "PNR Status", icon: <FaSearch /> },
    { id: "live", label: "Live Status", icon: <FaClock /> }
  ];

  const handleSearch = () => {
    if (!fromStation || !toStation || !date) {
      setErrorMessage("All fields are required");
      return;
    }
    if (fromStation === toStation) {
      setErrorMessage("Departure and arrival stations cannot be same");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    setTimeout(() => {
      const fromCode = fromStation.match(/\(([^)]+)\)/)[1];
      const toCode = toStation.match(/\(([^)]+)\)/)[1];
      navigate(`/results?from=${fromCode}&to=${toCode}&date=${date}&type=${ticketType}&class=${selectedClass}`);
    }, 1000);
  };

  return (
    <>
      <style>{`
        .floating-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 24px;
          box-shadow: 0 20px 40px -12px rgba(0,0,128,0.15);
        }
        .hero-search-gradient {
          background: linear-gradient(135deg, #000080 0%, #1e40af 50%, #DA291C 100%);
          border-radius: 32px;
          position: relative;
          overflow: visible;
        }
        .dropdown-modern {
          position: absolute;
          z-index: 50;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: 14rem;
          overflow-y: auto;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          box-shadow: 0 20px 40px -12px rgba(0,0,128,0.25);
          animation: dropdownSlide 0.3s ease-out;
        }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Hero Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#000080] to-[#DA291C] rounded-2xl flex items-center justify-center">
                <FaTrain className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#000080] via-[#1e40af] to-[#DA291C] bg-clip-text text-transparent">
                  Smart Rail Search
                </h1>
                <p className="text-gray-600 text-lg">
                  Find. Book. Travel. Experience the future of rail booking.
                </p>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="hero-search-gradient p-8 mb-12">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white text-[#000080] shadow-lg scale-105"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100/90 backdrop-blur-sm border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
                <FaInfoCircle />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* From */}
              <div className="lg:col-span-4 relative">
                <label className="block text-white/90 font-semibold mb-2 flex items-center gap-2">
                  <MdLocationOn className="text-[#DA291C]" />
                  From Station
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 text-[#000080] font-semibold placeholder-gray-500 rounded-lg border border-white/30 bg-white/90 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
                    placeholder="Departure station"
                    value={fromStation}
                    onChange={e =>
                      filterStations(
                        e.target.value,
                        toStation,
                        setFromStation,
                        setFilteredFrom,
                        setSelectedFromIndex
                      )
                    }
                    autoComplete="off"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {filteredFrom.length > 0 && (
                  <ul className="dropdown-modern">
                    {filteredFrom.map((s, idx) => (
                      <li
                        key={s._id}
                        onClick={() =>
                          handleSelect(s, setFromStation, setFilteredFrom, setSelectedFromIndex)
                        }
                        className={`cursor-pointer p-4 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                          idx === selectedFromIndex ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="font-semibold text-[#000080]">{s.stationName}</div>
                        <div className="text-sm text-gray-600">{s.stationCode}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Swap */}
              <div className="lg:col-span-1 flex items-end justify-center pb-10">
                <button
                  onClick={handleSwap}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaExchangeAlt className="text-white text-xl" />
                </button>
              </div>

              {/* To */}
              <div className="lg:col-span-4 relative">
                <label className="block text-white/90 font-semibold mb-2 flex items-center gap-2">
                  <MdLocationOn className="text-green-400" />
                  To Station
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 text-[#000080] font-semibold placeholder-gray-500 rounded-lg border border-white/30 bg-white/90 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
                    placeholder="Arrival station"
                    value={toStation}
                    onChange={e =>
                      filterStations(
                        e.target.value,
                        fromStation,
                        setToStation,
                        setFilteredTo,
                        setSelectedToIndex
                      )
                    }
                    autoComplete="off"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {filteredTo.length > 0 && (
                  <ul className="dropdown-modern">
                    {filteredTo.map((s, idx) => (
                      <li
                        key={s._id}
                        onClick={() =>
                          handleSelect(s, setToStation, setFilteredTo, setSelectedToIndex)
                        }
                        className={`cursor-pointer p-4 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                          idx === selectedToIndex ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="font-semibold text-[#000080]">{s.stationName}</div>
                        <div className="text-sm text-gray-600">{s.stationCode}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Date */}
              <div className="lg:col-span-3">
                <label className="block text-white/90 font-semibold mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-yellow-400" />
                  Journey Date
                </label>
                <input
                  type="date"
                  min={getTodayDate()}
                  className="w-full px-4 py-4 text-[#000080] font-semibold rounded-lg border border-white/30 bg-white/90 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setDate(getTodayDate())}
                    className="text-xs bg-white/20 text-white px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDate(getTomorrowDate())}
                    className="text-xs bg-white/20 text-white px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Type & Class */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Ticket Type */}
              <div className="relative">
                <label className="block text-white/90 font-semibold mb-2 flex items-center gap-2">
                  <FaTicketAlt className="text-purple-400" />
                  Ticket Type
                </label>
                <button
                  className="w-full px-4 py-4 text-[#000080] font-semibold text-left rounded-lg border border-white/30 bg-white/90 flex items-center justify-between focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
                  onClick={() => setShowTicketTypes(!showTicketTypes)}
                >
                  {ticketType}
                  <FaChevronDown className={showTicketTypes ? "transform rotate-180" : ""} />
                </button>
                {showTicketTypes && (
                  <div className="dropdown-modern">
                    {ticketTypes.map(type => (
                      <div
                        key={type.value}
                        onClick={() => {
                          setTicketType(type.value);
                          setShowTicketTypes(false);
                        }}
                        className="cursor-pointer p-4 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {type.icon}
                          <div>
                            <div className="font-semibold text-[#000080]">{type.label}</div>
                            <div className="text-xs text-gray-600">{type.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Class */}
              <div className="relative">
                <label className="block text-white/90 font-semibold mb-2 flex items-center gap-2">
                  <FaCrown className="text-yellow-400" />
                  Travel Class
                </label>
                <button
                  className="w-full px-4 py-4 text-[#000080] font-semibold text-left rounded-lg border border-white/30 bg-white/90 flex items-center justify-between focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                >
                  {selectedClass}
                  <FaChevronDown className={showClassDropdown ? "transform rotate-180" : ""} />
                </button>
                {showClassDropdown && (
                  <div className="dropdown-modern">
                    {classTypes.map(c => (
                      <div
                        key={c.value}
                        onClick={() => {
                          setSelectedClass(c.value);
                          setShowClassDropdown(false);
                        }}
                        className="cursor-pointer p-4 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {c.icon}
                          <div>
                            <div className="font-semibold text-[#000080]">{c.label}</div>
                            <div className="text-xs text-gray-600">{c.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center mt-8">
              <button
                className={`px-12 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 ${
                  isLoading
                    ? "opacity-75 cursor-not-allowed bg-gray-400"
                    : "bg-gradient-to-r from-[#000080] to-[#1e40af]"
                }`}
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <BoltIcon className="w-6 h-6" />
                    <span>Find My Train</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Popular Routes */}
          <div className="floating-card p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#DA291C] to-red-600 rounded-2xl flex items-center justify-center">
                <FaFire className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Trending Routes</h2>
                <p className="text-gray-600">Most popular journeys this week</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRoutes.map((route, idx) => (
                <div
                  key={idx}
                  className="p-6 cursor-pointer group"
                  onClick={() => {
                    setFromStation(`${route.from.stationName} (${route.from.stationCode})`);
                    setToStation(`${route.to.stationName} (${route.to.stationCode})`);
                    setFilteredFrom([]); setFilteredTo([]);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#000080] to-blue-600 rounded-lg flex items-center justify-center">
                        <FaTrain className="text-white text-sm" />
                      </div>
                      <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                        {route.popularity}
                      </div>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-[#000080] transition-colors" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="font-bold text-[#000080] text-lg">{route.from.stationCode}</div>
                      <div className="text-sm text-gray-600">{route.from.stationName}</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-full h-px bg-gradient-to-r from-[#000080] to-[#DA291C]"></div>
                      <FaRoute className="mx-2 text-gray-400" />
                      <div className="w-full h-px bg-gradient-to-r from-[#DA291C] to-[#000080]"></div>
                    </div>
                    <div>
                      <div className="font-bold text-[#000080] text-lg">{route.to.stationCode}</div>
                      <div className="text-sm text-gray-600">{route.to.stationName}</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FaClock />
                        <span>{route.time}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#DA291C]">Popular</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#000080] to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FaBolt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Book tickets in under 60s with optimized search.</p>
            </div>
            <div className="p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#DA291C] to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">100% Secure</h3>
              <p className="text-gray-600">Bank-grade security with encrypted payments.</p>
            </div>
            <div className="p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loved by Millions</h3>
              <p className="text-gray-600">Join 500M+ travelers who trust us.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
