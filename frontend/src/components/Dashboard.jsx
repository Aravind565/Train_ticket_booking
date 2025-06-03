import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaHistory, FaUsers, FaSignOutAlt, FaSearch, FaTrain, FaTicketAlt } from "react-icons/fa";
import { TicketIcon, ClockIcon, MapIcon } from "@heroicons/react/24/outline";
import { FaExchangeAlt } from "react-icons/fa";
const ProfileDropdown = ({ open, setOpen, onLogout }) => {
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute right-8 top-20 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2 transition-all duration-300 transform origin-top-right"
    >
      <ul className="flex flex-col gap-1">
        <li>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#000080]/10 transition text-gray-800 hover:text-[#000080] bg-white"
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
          >
            <FaUserEdit className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#000080]/10 transition text-gray-800 hover:text-[#000080] bg-white"
            onClick={() => {
              navigate("/my-trips");
              setOpen(false);
            }}
          >
            <FaHistory className="w-5 h-5" />
            <span className="font-medium">My Trips</span>
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#000080]/10 transition text-gray-800 hover:text-[#000080] bg-white"
            onClick={() => {
              navigate("/my-travellers");
              setOpen(false);
            }}
          >
            <FaUsers className="w-5 h-5" />
            <span className="font-medium">My Travellers</span>
          </button>
        </li>
        <li className="border-t border-gray-200 mt-2 pt-1">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#DA291C]/10 transition text-[#DA291C] font-medium bg-white"
            onClick={onLogout}
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

const Dashboard = () => {
 const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [ticketType, setTicketType] = useState("General");
  const navigate = useNavigate();

   useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
          setUserData(null);  // ensure no user data
      setLoading(false);
      
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("http://localhost:5000/api/user", {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            sessionStorage.removeItem("userToken");
             setUserData(null);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);


  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    navigate('/login');
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#000080] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#000080] text-white rounded hover:bg-[#000080]/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen w-full bg-white text-gray-900 relative font-sans">
      {/* Navbar */}
      <Navbar user={userData} onProfileClick={() => setProfileOpen((v) => !v)} />

      {/* Profile Dropdown */}
      <ProfileDropdown open={profileOpen} setOpen={setProfileOpen} onLogout={handleLogout} />

      {/* Hero Section */}
      <section className="w-full bg-[#000080] text-white py-24 px-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000080] to-[#000080]/90 z-0"></div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[#DA291C] opacity-20 transform skew-x-12 -translate-x-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Journey With <span className="text-[#DA291C]">Confidence</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-light max-w-3xl mx-auto">
            Book your train tickets in minutes with our seamless booking platform. Travel across the country with ease and comfort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/book"
              className="inline-block bg-[#DA291C] hover:bg-[white] text-white hover:text-[#DA291C] font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              Book Your Ticket
            </a>
            <a
              href="#features"
              className="inline-block bg-white/10 hover:bg-[white] text-white hover:text-[#000080] font-semibold px-8 py-4 rounded-lg border border-white/30 hover:border-white transition-all duration-300 text-lg"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

     
      {/* Features Section */}
      <section id="features" className="w-full py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#000080] text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center">
              <TicketIcon className="w-12 h-12 text-[#DA291C] mb-4" />
              <h3 className="font-semibold text-lg mb-2">Instant Booking</h3>
              <p className="text-gray-600">Book your tickets instantly with real-time seat availability and hassle-free payments.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center">
              <ClockIcon className="w-12 h-12 text-[#000080] mb-4" />
              <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our customer support is available round the clock to assist you at every step of your journey.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center">
              <MapIcon className="w-12 h-12 text-[#F59E42] mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nationwide Coverage</h3>
              <p className="text-gray-600">Travel across the country with access to all major train routes and stations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* My Trips Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#000080]">My Upcoming Trips</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading your trips...</div>
          ) : userData && userData.trips && userData.trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userData.trips.map((trip) => (
                <div key={trip.id} className="bg-gray-50 rounded-lg shadow p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTrain className="text-[#000080] w-5 h-5" />
                    <span className="font-semibold text-lg">{trip.trainName}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>
                      <b>From:</b> {trip.from}
                    </span>
                    <span>
                      <b>To:</b> {trip.to}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>
                      <b>Date:</b> {trip.date}
                    </span>
                    <span>
                      <b>Class:</b> {trip.class}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <FaTicketAlt className="text-[#DA291C] w-4 h-4" />
                    <span className="text-sm">PNR: {trip.pnr}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No upcoming trips found.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;