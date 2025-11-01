import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaHistory, FaTrain, FaTicketAlt, FaMapMarkerAlt, FaUserFriends, FaBell, 
  FaClock, FaStar, FaQrcode, FaWallet, FaUmbrellaBeach, 
  FaTree, FaCrown, FaHeadset, FaComments, FaRoute, FaCoins, FaAward, 
  FaArrowRight, FaTimes, FaRocket, FaLeaf, FaHeart as FaHeartSolid, 
  FaCalendarAlt, FaPhoneAlt, FaEnvelope, FaBook, FaQuestionCircle, FaShieldAlt,
  FaFacebook, FaInstagram, FaLinkedinIn, FaYoutube
} from "react-icons/fa";
import { SparklesIcon, BoltIcon } from "@heroicons/react/24/outline";
import TrainSearch from "./TrainSearch";

const BRAND_BLUE = "#000080";
const BRAND_RED = "#DA291C";

const QuickActions = () => {
  const actions = [
    { 
      icon: <FaTicketAlt className="text-2xl" />, 
      label: "Book Ticket", 
      path: "/book", 
      color: "from-[#000080] to-blue-600",
      description: "Find & book trains"
    },
    { 
      icon: <FaHistory className="text-2xl" />, 
      label: "My Trips", 
      path: "/mytrips", 
      color: "from-[#DA291C] to-red-600",
      description: "View bookings"
    },
    { 
      icon: <FaQrcode className="text-2xl" />, 
      label: "QR Ticket", 
      path: "/qr-tickets", 
      color: "from-purple-500 to-purple-600",
      description: "Digital tickets"
    },
    { 
      icon: <FaUserFriends className="text-2xl" />, 
      label: "Group Booking", 
      path: "/group-booking", 
      color: "from-green-500 to-green-600",
      description: "Book for groups"
    },
    { 
      icon: <FaWallet className="text-2xl" />, 
      label: "Quick Pay", 
      path: "/quick-pay", 
      color: "from-orange-500 to-orange-600",
      description: "Fast payments"
    },
    { 
      icon: <FaMapMarkerAlt className="text-2xl" />, 
      label: "Live Status", 
      path: "/live-status", 
      color: "from-cyan-500 to-cyan-600",
      description: "Track trains"
    }
  ];
  
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {actions.map((action, index) => (
        <div 
          key={index}
          className="group cursor-pointer"
          onClick={() => navigate(action.path)}
        >
          <div className="floating-card p-6 text-center hover:scale-105 transition-all duration-300">
            <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300`}>
              {action.icon}
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{action.label}</h3>
            <p className="text-xs text-gray-500">{action.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const WelcomeHero = ({ userData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  
  return (
    <div className="hero-gradient rounded-3xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
              {getGreeting()}{userData?.fullName ? `, ${userData.fullName.split(' ')[0]}!` : '!'}
            </h1>
            <p className="text-white/90 text-base sm:text-lg mb-4">
              Ready for your next adventure? Let&apos;s get you there.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FaClock className="text-white/80" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-white/80" />
                <span>{currentTime.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-20 sm:w-24 h-20 sm:h-24 bg-white/5 rounded-full blur-lg"></div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, badge, color }) => (
  <div className="floating-card p-5 sm:p-6 hover:scale-102 transition-all duration-300 group">
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800">{title}</h3>
          {badge && (
            <span className="bg-gradient-to-r from-[#DA291C] to-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{description}</p>
        <button className="text-[#000080] bg-white font-semibold text-sm hover:underline flex items-center gap-1">
          Learn more <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  </div>
);

const RecommendationCard = ({ icon, title, description, price, originalPrice, rating, badge, color }) => (
  <div className="floating-card p-5 sm:p-6 hover:scale-102 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-start gap-4 flex-1">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800">{title}</h3>
            {badge && (
              <span className="bg-gradient-to-r from-[#000080] to-blue-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
          {rating && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`text-xs ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">{rating}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right min-w-[80px]">
        <div className="font-bold text-[#000080] text-base sm:text-lg">{price}</div>
        {originalPrice && (
          <div className="text-xs text-gray-400 line-through">{originalPrice}</div>
        )}
      </div>
    </div>
    
    <button className="w-full bg-gradient-to-r from-[#000080] to-blue-600 hover:from-[#000080]/90 hover:to-blue-600/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
      Explore Now
    </button>
  </div>
);

const QuickLinkCard = ({ icon, title, description, link, color }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="floating-card p-5 hover:scale-105 transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(link)}
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#000080] transition-colors">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
};

// ✅ X (TWITTER) ICON - SVG ONLY
const XIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.67-5.829 6.67H2.306l7.644-8.74L1.126 2.25h6.679l4.614 6.096 5.325-6.096ZM17.55 19.69h1.82L5.904 4.131H3.995l13.555 15.559Z" />
  </svg>
);

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        setUserData(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto">
            <div className="w-20 h-20 border-4 border-[#000080]/20 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[#000080] rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="floating-card p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <FaTimes className="text-white text-xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#000080] to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      <style>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .floating-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 0, 128, 0.08);
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 128, 0.08);
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, ${BRAND_BLUE} 0%, #1e40af 50%, ${BRAND_RED} 100%);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 128, 0.2);
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        @media (max-width: 768px) {
          .floating-card {
            border-radius: 16px;
            padding: 1rem;
          }
        }
      `}</style>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <WelcomeHero userData={userData} />
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <BoltIcon className="w-8 h-8 text-[#000080]" />
            Quick Actions
          </h2>
          <QuickActions />
        </section>
        
        <section className="mb-10">
          <TrainSearch />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
          <div className="xl:col-span-3 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaRocket className="text-[#000080]" />
                Future of Rail Travel
              </h2>
              <div className="floating-card p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeatureCard
                    icon={<FaQrcode className="text-lg" />}
                    title="Digital QR Tickets"
                    description="Go paperless with scannable QR codes for contactless boarding"
                    color="from-[#000080] to-blue-600"
                  />
                  <FeatureCard
                    icon={<FaRoute className="text-lg" />}
                    title="Smart Route Suggestions"
                    description="AI-powered alternative routes during cancellations or delays"
                    color="from-[#DA291C] to-red-600"
                  />
                  <FeatureCard
                    icon={<FaCoins className="text-lg" />}
                    title="Loyalty Rewards"
                    description="Earn points on every trip and redeem for free journeys"
                    color="from-[#000080] to-blue-600"
                  />
                  <FeatureCard
                    icon={<FaAward className="text-lg" />}
                    title="Carbon Footprint Tracking"
                    description="Monitor and offset your travel emissions automatically"
                    color="from-[#DA291C] to-red-600"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-[#000080]" />
                Recommended for You
              </h2>
              <div className="space-y-4">
                <RecommendationCard
                  icon={<FaUmbrellaBeach className="text-lg" />}
                  title="Weekend Getaway Package"
                  description="Explore scenic destinations with exclusive travel deals"
                  price="₹2,499"
                  originalPrice="₹3,999"
                  rating={4.5}
                  badge="HOT DEAL"
                  color="from-orange-500 to-orange-600"
                />
                <RecommendationCard
                  icon={<FaLeaf className="text-lg" />}
                  title="Eco-Friendly Travel"
                  description="Travel responsibly and get green rewards for carbon-neutral journeys"
                  price="₹0"
                  rating={4.8}
                  badge="NEW"
                  color="from-green-500 to-green-600"
                />
                <RecommendationCard
                  icon={<FaCrown className="text-lg" />}
                  title="Premium Class Upgrade"
                  description="Upgrade to premium comfort on select trains with special discounts"
                  price="From ₹799"
                  rating={4.6}
                  color="from-purple-500 to-purple-600"
                />
              </div>
            </section>
          </div>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaShieldAlt className="text-[#000080]" />
                Quick Links
              </h2>
              <div className="space-y-4">
                <QuickLinkCard
                  icon={<FaBook className="text-lg" />}
                  title="Booking History"
                  description="View all your past trips"
                  link="/mytrips"
                  color="from-[#000080] to-blue-600"
                />
                <QuickLinkCard
                  icon={<FaQuestionCircle className="text-lg" />}
                  title="Help & FAQ"
                  description="Get answers quickly"
                  link="/support"
                  color="from-[#DA291C] to-red-600"
                />
                <QuickLinkCard
                  icon={<FaEnvelope className="text-lg" />}
                  title="Contact Us"
                  description="Reach our support team"
                  link="/contact"
                  color="from-green-500 to-green-600"
                />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaHeadset className="text-[#000080]" />
                Need Help?
              </h2>
              <div className="floating-card p-6">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#000080] to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <FaHeadset className="text-white text-lg sm:text-xl" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">24/7 Support</h3>
                  <p className="text-gray-600 text-sm mb-6">Our support team is available 24/7</p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/contact')}
                      className="w-full bg-gradient-to-r from-[#000080] to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaComments /> Live Chat
                    </button>
                    <a
                      href="tel:+910123456789"
                      className="w-full bg-gradient-to-r from-[#000080] to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaPhoneAlt /> Call Support
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ✅ FOOTER - COMPLETELY FIXED */}
      <footer className="bg-gradient-to-r from-[#000080] to-[#1e40af] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Column 1: Company Info */}
            <div>
              <h3 className="text-2xl font-bold mb-4">RailWay</h3>
              <p className="text-white/80 text-sm mb-8">
                Revolutionizing train travel with innovative technology and exceptional service.
              </p>
              
              {/* EMAIL - NO EMOJI, TEXT ONLY */}
              <div className="mb-8 pb-8 border-b border-white/20">
                <p className="text-sm text-white/80 mb-2">Email</p>
                <a 
                  href="mailto:officialtb565@gmail.com"
                  className="text-white font-semibold text-sm"
                >
                  officialtb565@gmail.com
                </a>
              </div>
              
              {/* SOCIAL MEDIA - NO HOVER, NO EMOJI, ICONS ONLY */}
              <div>
                <p className="text-sm text-white/80 mb-3">Follow Us</p>
                <div className="flex gap-3">
                  
                  {/* FACEBOOK ICON - NO HOVER */}
                  <a 
                    href="https://facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                  >
                    <FaFacebook className="text-lg text-white" />
                  </a>
                  
                  {/* X (TWITTER) ICON - NO HOVER */}
                  <a 
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="X"
                  >
                    <XIcon />
                  </a>
                  
                  {/* INSTAGRAM ICON - NO HOVER */}
                  <a 
                    href="https://instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                  >
                    <FaInstagram className="text-lg text-white" />
                  </a>
                  
                  {/* LINKEDIN ICON - NO HOVER */}
                  <a 
                    href="https://linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <FaLinkedinIn className="text-lg text-white" />
                  </a>
                  
                  {/* YOUTUBE ICON - NO HOVER */}
                  <a 
                    href="https://youtube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                  >
                    <FaYoutube className="text-lg text-white" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Column 2: Features - NO EMOJIS */}
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="cursor-pointer">Smart Booking</li>
                <li className="cursor-pointer">Live Tracking</li>
                <li className="cursor-pointer">Group Discounts</li>
                <li className="cursor-pointer">Trip Planning</li>
                <li className="cursor-pointer">Carbon Calculator</li>
              </ul>
            </div>
            
            {/* Column 3: Support - NO EMOJIS */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li 
                  className="cursor-pointer"
                  onClick={() => navigate('/support')}
                >
                  Help Center
                </li>
                <li className="cursor-pointer">Safety Center</li>
                <li className="cursor-pointer">Community Guidelines</li>
                <li 
                  className="cursor-pointer"
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </li>
                <li className="cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
            
            {/* Column 4: Download App - NO EMOJIS, NO HOVER */}
            <div>
              <h4 className="font-bold mb-4">Download App</h4>
              <p className="text-white/80 text-sm mb-4">
                Get the best experience with our mobile app
              </p>
              <div className="space-y-3">
                
                {/* GOOGLE PLAY - BUTTON ONLY, NO HOVER */}
                <a
                  href="https://play.google.com/store/games?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-[#000080] font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center"
                >
                  Google Play
                </a>
                
                {/* APP STORE - BUTTON ONLY, NO HOVER */}
                <a
                  href="https://www.apple.com/in/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-[#000080] font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center"
                >
                  App Store
                </a>
              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM - NO EMOJI */}
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>Copyright © 2025 RailWay. All rights reserved. Revolutionizing Indian railway travel.</p>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;