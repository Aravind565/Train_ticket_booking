import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaTelegram
} from "react-icons/fa";



const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general"
  });



  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();



  const contactInfo = [
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: "Phone",
      details: ["+91 0123456789"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: "Email",
      details: ["officialtb565@gmail.com"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      title: "Office",
      details: ["123 Railway Street, Chennai", "Tamil Nadu - 600001"],
      color: "from-red-500 to-red-600"
    },
    {
      icon: <ClockIcon className="w-6 h-6" />,
      title: "Working Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat - Sun: 10:00 AM - 4:00 PM"],
      color: "from-purple-500 to-purple-600"
    }
  ];



  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "booking", label: "Booking Help" },
    { value: "complaint", label: "File a Complaint" },
    { value: "feedback", label: "Feedback" },
    { value: "partnership", label: "Partnership" }
  ];



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);



    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields.");
      return;
    }



    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });



      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          category: "general"
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };



  // Custom X (Twitter) Icon Component
  const XIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.67-5.829 6.67H2.306l7.644-8.74L1.126 2.25h6.679l4.614 6.096 5.325-6.096ZM17.55 19.69h1.82L5.904 4.131H3.995l13.555 15.559Z" />
    </svg>
  );



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1e40af] text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Get in Touch</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl">
            We're here to help! Have a question or feedback? Contact us anytime.
          </p>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`bg-gradient-to-br ${info.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {info.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{info.title}</h3>
              <div className="space-y-2">
                {info.details.map((detail, i) => (
                  <p key={i} className="text-gray-600 text-sm sm:text-base">{detail}</p>
                ))}
              </div>
            </div>
          ))}
        </div>



        {/* Contact Form & Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 mb-12 sm:mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Send us a Message</h2>



              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Message Sent Successfully!</p>
                    <p className="text-green-700 text-sm">We'll get back to you as soon as possible.</p>
                  </div>
                </div>
              )}



              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}



              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white text-[#000080] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border bg-white text-[#000080] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>



                {/* Phone & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 0123456789"
                      className="w-full px-4 py-3 border bg-white text-[#000080] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border bg-white text-[#000080] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080] focus:border-transparent transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>



                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="w-full px-4 py-3 border bg-white text-[#000080] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080] focus:border-transparent transition-all"
                  />
                </div>



                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows="6"
                    className="w-full px-4 py-3 border bg-white text-[#000080] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080] focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>



                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#000080] to-[#1e40af] text-white font-bold py-3 sm:py-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>



          {/* Sidebar - Quick Links */}
          <div className="space-y-6 sm:space-y-8">
            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">FAQ</h3>
              <div className="space-y-3">
                <a href="#" className="block text-[#000080] hover:text-[#DA291C] font-semibold transition-colors">
                  → How do I book a ticket?
                </a>
                <a href="#" className="block text-[#000080] hover:text-[#DA291C] font-semibold transition-colors">
                  → How to cancel booking?
                </a>
                <a href="#" className="block text-[#000080] hover:text-[#DA291C] font-semibold transition-colors">
                  → Refund policy?
                </a>
                <a href="#" className="block text-[#000080] hover:text-[#DA291C] font-semibold transition-colors">
                  → Payment methods?
                </a>
              </div>
            </div>



            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Follow Us</h3>
              <div className="grid grid-cols-3 gap-3">
                <a href="#" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" title="Facebook">
                  <FaFacebookF className="text-lg" />
                </a>
                {/* ✅ X (Twitter) Logo - SVG Icon */}
                <a href="#" className="bg-gradient-to-br from-black to-gray-800 text-white w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" title="X (Twitter)">
                  <XIcon />
                </a>
                <a href="#" className="bg-gradient-to-br from-pink-500 to-red-500 text-white w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" title="Instagram">
                  <FaInstagram className="text-lg" />
                </a>
                <a href="#" className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" title="LinkedIn">
                  <FaLinkedinIn className="text-lg" />
                </a>
                <a href="#" className="bg-gradient-to-br from-green-500 to-green-600 text-white w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" title="WhatsApp">
                  <FaWhatsapp className="text-lg" />
                </a>
                <a href="#" className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" title="Telegram">
                  <FaTelegram className="text-lg" />
                </a>
              </div>
            </div>



            {/* Response Time */}
            <div className="bg-gradient-to-br from-[#000080]/10 to-[#DA291C]/10 border-2 border-[#000080]/20 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">📧 Response Time</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• <strong>Urgent:</strong> 1-2 hours</li>
                <li>• <strong>Normal:</strong> 4-6 hours</li>
                <li>• <strong>General:</strong> 24 hours</li>
              </ul>
            </div>
          </div>
        </div>



        {/* Map Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-80 sm:h-96 md:h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.9891898706927!2d80.27049707347187!3d13.08268621205748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5261c4e4e3d1e5%3A0x8e7f5f8f8e7f5f8f!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>



      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1e40af] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Have More Questions?</h2>
          <p className="text-lg text-blue-100 mb-8">Visit our FAQ page or call us directly</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/faq")}
              className="px-6 sm:px-8 py-3 bg-white text-[#000080] font-bold rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              View FAQ
            </button>
            <a
              href="tel:+910123456789"
              className="px-6 sm:px-8 py-3 bg-[#DA291C] text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300 text-center"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};



export default ContactUs;