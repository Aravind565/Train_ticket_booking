import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  UserIcon, 
  ChevronDownIcon, 
  Bars3Icon, 
  XMarkIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { 
  FaTrain, 
  FaTicketAlt, 
  FaHeadset, 
  FaHome, 
  FaGlobe,
  FaUser,
  FaCrown,
  FaWallet,
  FaHistory,
  FaStar
} from "react-icons/fa";
import empty_sign from "../assets/empty_sign.jpg";


const Navbar = ({ user, onProfileClick }) => {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCount] = useState(3);
  
  const langRef = useRef();
  const profileRef = useRef();
  const navigate = useNavigate();


  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileMenuOpen(false);
    };
    if (langOpen || profileMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen, profileMenuOpen]);


  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const navLinks = [
    { path: "/", label: "Home", icon: <FaHome className="w-4 h-4" /> },
    { path: "/book", label: "Book Ticket", icon: <FaTicketAlt className="w-4 h-4" /> },
    { path: "/contact", label: "Contact Us", icon: <FaHeadset className="w-4 h-4" /> },
    { path: "/support", label: "Support", icon: <Cog6ToothIcon className="w-4 h-4" /> }
  ];


  const profileMenuItems = [
    { icon: <FaUser className="w-4 h-4" />, label: "My Profile", path: "/profile" },
    { icon: <FaHistory className="w-4 h-4" />, label: "My Trips", path: "/mytrips" },
    { icon: <FaWallet className="w-4 h-4" />, label: "Wallet", path: "/wallet" },
    { icon: <FaCrown className="w-4 h-4" />, label: "Rewards", path: "/rewards" },
  ];

  // ✅ Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userData");
    navigate('/login');
  };

  return (
    <>
      {/* Custom Styles */}
      <style jsx>{`
        .navbar-glassmorphism {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 128, 0.1);
        }
        
        .navbar-solid {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px 0 rgba(0, 0, 128, 0.15);
        }
        
        .floating-dropdown {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 128, 0.25);
        }
        
        .nav-link-modern {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link-modern::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #000080, #DA291C);
          transition: width 0.3s ease;
        }
        
        .nav-link-modern:hover::after {
          width: 100%;
        }
        
        .profile-avatar {
          background: linear-gradient(135deg, #000080 0%, #1e40af 50%, #DA291C 100%);
          border: 3px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 15px rgba(0, 0, 128, 0.3);
        }
        
      
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .mobile-menu-slide {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .floating-dropdown {
            border-radius: 12px;
          }
        }
      `}</style>


      <header
        className={`w-full sticky top-0 z-50 transition-all duration-500 ${
          isScrolled ? "navbar-glassmorphism" : "navbar-solid"
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 lg:px-8 py-4">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#000080] to-[#DA291C] p-0.5">
                <img
                  src={empty_sign}
                  alt="TrainBooking"
                  className="w-full h-full object-contain rounded-2xl bg-white"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#000080] via-[#1e40af] to-[#DA291C] bg-clip-text text-transparent">
                RailWay
              </h1>
            </div>
          </div>


          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="nav-link-modern flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-[#000080] hover:bg-white/50 transition-all duration-300 font-semibold"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>


          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notification Bell (for logged-in users) */}
            {user && (
              <div className="relative">
                <button className="p-3 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <BellIcon className="w-5 h-5 text-gray-600" />
                  {notificationCount > 0 && (
                    <div className="notification-badge absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{notificationCount}</span>
                    </div>
                  )}
                </button>
              </div>
            )}


            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 hover:bg-white/70 text-gray-700 hover:text-[#000080] transition-all duration-300 hover:scale-105"
                onClick={() => setLangOpen(!langOpen)}
              >
                <FaGlobe className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold">EN</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 floating-dropdown z-50 overflow-hidden">
                  <div className="p-2">
                    {['English', 'हिन्दी', 'বাংলা', 'தமிழ்'].map((lang, index) => (
                      <button
                        key={lang}
                        className="w-full bg-white border-gray-400 text-left px-3 py-2 rounded-lg hover:bg-[#000080]/10 text-gray-700 hover:text-[#000080] transition-colors font-medium"
                        onClick={() => setLangOpen(false)}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* User Profile or Login */}
            {user ? (
              // ✅ LOGGED IN - Show Profile
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 hover:scale-105"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <div className="profile-avatar w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                      {user.fullName || 'User'}
                    </p>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-600 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* ✅ PROFILE DROPDOWN MENU */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 floating-dropdown z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="profile-avatar w-12 h-12 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{user.fullName || 'User'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#000080]/10 text-gray-700 hover:text-[#000080] transition-all duration-300 group"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <div className="group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                      
                      {/* Logout Button */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          className="w-full flex items-center bg-[#DA291C] text-white border-gray-400 gap-3 px-3 py-2 rounded-lg hover:bg-white text-red-600 hover:text-red-700 transition-all duration-300 group"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          <div className="group-hover:scale-110 transition-transform">
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ❌ NOT LOGGED IN - Show Login Button
              <Link
                to="/login"
                className="px-6 py-2 bg-gradient-to-r from-[#000080] to-[#1e40af] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Login
              </Link>
            )}


            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-3 rounded-xl bg-white/50 hover:bg-white/70 text-gray-700 hover:text-[#000080] transition-all duration-300 hover:scale-105"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </nav>


        {/* Enhanced Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden mobile-menu-slide floating-dropdown m-4 overflow-hidden">
            <div className="p-4">
              {/* Mobile User Info */}
              {user && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#000080]/10 to-[#DA291C]/10 mb-4">
                  <div className="profile-avatar w-12 h-12 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{user.fullName || 'User'}</p>
                    <div className="flex items-center gap-1">
                      <FaCrown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600 font-medium">Premium Member</span>
                    </div>
                  </div>
                </div>
              )}


              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#000080]/10 text-gray-700 hover:text-[#000080] transition-all duration-300 group"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                    <span className="font-semibold">{link.label}</span>
                  </Link>
                ))}
              </div>


              {/* Mobile Profile Links (if user logged in) */}
              {user && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="space-y-2">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#000080]/10 text-gray-700 hover:text-[#000080] transition-all duration-300 group"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Mobile Logout Button */}
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <button
                      className="w-full flex items-center bg-white border-gray-400 gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300 group"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <div className="group-hover:scale-110 transition-transform">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};


export default Navbar;