import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import empty_sign from "../assets/empty_sign.jpg";

const Navbar = ({ user, onProfileClick }) => {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const langRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    if (langOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`w-full sticky top-0 z-30 transition-colors duration-300 ${
        isScrolled
          ? "bg-white bg-opacity-30 backdrop-blur-sm shadow-none"
          : "bg-white shadow-md"
      }`}
    >
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 w-full">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <img
            src={empty_sign}
            alt="TrainBooking Logo"
            className="w-10 h-10 object-contain rounded-full border-2 border-[#DA291C]/40 shadow"
          />
          <span className="hidden lg:inline text-2xl font-extrabold font-montserrat bg-gradient-to-r from-[#000080] to-[#DA291C] bg-clip-text text-transparent tracking-tight">
            TrainBooking
          </span>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex gap-8 text-base font-bold font-opensans">
          <li>
            <Link to="/" className="text-[#000080] hover:text-[#DA291C] transition !font-extrabold font-montserrat">
              Home
            </Link>
          </li>
          <li>
            <Link to="/book" className="text-[#000080] hover:text-[#DA291C] transition !font-extrabold font-montserrat">
              Book Ticket
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-[#000080] hover:text-[#DA291C] transition !font-extrabold font-montserrat">
              Contact Us
            </Link>
          </li>
          <li>
            <Link to="/support" className="text-[#000080] hover:text-[#DA291C] transition !font-extrabold font-montserrat">
              Support
            </Link>
          </li>
        </ul>

        {/* Right: Profile, fullName, Language, Hamburger */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Profile Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                className="flex items-center justify-center rounded-full border-2 border-[#DA291C] bg-white w-10 h-10 shadow hover:border-[#000080] transition p-0"
                onClick={onProfileClick}
                title="Profile"
                type="button"
              >
                <UserIcon className="w-7 h-7 text-[#000080]" />
              </button>
              <span className="hidden lg:inline text-[#000080] !font-extrabold font-montserrat text-base truncate max-w-[150px]">
                {user.fullName}
              </span>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-[#000080] !font-extrabold font-montserrat border border-[#000080] px-4 py-2 rounded-lg hover:bg-[#000080] hover:text-[white] transition !font-extrabold font-montserrat"
            >
              Login
            </Link>
          )}

          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              className="flex items-center gap-1 text-[#000080] font-medium !font-extrabold font-montserrat px-4 py-2 rounded-lg border border-[#000080]/20 bg-white hover:bg-[#DA291C]/10 hover:text-[#DA291C] transition"
              onClick={() => setLangOpen((v) => !v)}
              type="button"
            >
              English
              <ChevronDownIcon className="w-5 h-5" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-[#DA291C]/30 z-40">
                <button
                  className="w-full text-left px-4 py-2 text-[#000080] bg-white hover:bg-[#DA291C]/10 rounded-lg transition font-opensans"
                  onClick={() => setLangOpen(false)}
                  type="button"
                >
                  English
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex items-center justify-center bg-white text-[#000080] border border-[#DA291C] p-2 rounded-lg hover:bg-[#DA291C]/10 transition"
            onClick={() => setMenuOpen((prev) => !prev)}
            title="Menu"
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-white shadow-lg border-t border-[#DA291C]/30 px-4 py-3">
          <ul className="flex flex-col gap-4 text-base font-bold font-opensans text-[#000080]">
            <li>
              <Link to="/" className="text-[#000080]" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/book" className="text-[#000080]" onClick={() => setMenuOpen(false)}>
                Book Ticket
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-[#000080]" onClick={() => setMenuOpen(false)}>
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/support" className="text-[#000080]" onClick={() => setMenuOpen(false)}>
                Support
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
