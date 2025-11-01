import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import {
  FaHeadset,
  FaPhoneAlt,
  FaEnvelope,
  FaComment,
  FaClock,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaTrain,
  FaWallet,
  FaUserTie,
  FaRobot,
  FaFileAlt,
  FaVideo,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCreditCard
} from "react-icons/fa";

const Support = () => {
  const [activeTab, setActiveTab] = useState("faq");
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const faqs = [
    {
      category: "Booking & Tickets",
      icon: <FaTicketAlt className="text-lg" />,
      color: "from-blue-500 to-blue-600",
      questions: [
        {
          q: "How do I book a train ticket?",
          a: "Visit our website or app, enter your source and destination, select your preferred train and class, fill in passenger details, and proceed to payment. Your ticket will be confirmed instantly after successful payment."
        },
        {
          q: "Can I book multiple tickets at once?",
          a: "Yes! You can book up to 6 passengers in a single transaction. Just fill in all passenger details and select seats. Apply group booking discounts if applicable."
        },
        {
          q: "How do I change my booking?",
          a: "Go to 'My Trips', select your booking, and click 'Modify'. You can change dates, trains, or passengers as per railway policies. Some changes may incur additional charges."
        },
        {
          q: "What's a PNR and how do I find it?",
          a: "PNR (Passenger Name Record) is your unique booking reference. You'll find it in your confirmation email, SMS, or under 'My Trips' in your account. Use it to check ticket status at any railway station."
        }
      ]
    },
    {
      category: "Cancellation & Refunds",
      icon: <FaWallet className="text-lg" />,
      color: "from-red-500 to-red-600",
      questions: [
        {
          q: "How do I cancel my ticket?",
          a: "Log in to your account, go to 'My Trips', select the booking to cancel, and click 'Cancel Ticket'. Refund will be processed as per cancellation policy."
        },
        {
          q: "What is your cancellation policy?",
          a: "Cancellation charges depend on how close to departure you cancel: 24+ hours before: 5% charge | 12-24 hours: 10% charge | 3-12 hours: 20% charge | Less than 3 hours: 50% charge"
        },
        {
          q: "How long does refund take?",
          a: "Refunds are processed within 5-7 business days to your original payment method. Credit card refunds may take 7-10 days depending on your bank."
        },
        {
          q: "Can I get a refund for a missed train?",
          a: "Unfortunately, we cannot refund for missed trains. However, you can use our 'Flexible Booking' option to reschedule at no extra cost (subject to availability)."
        }
      ]
    },
    {
      category: "Payment Issues",
      icon: <FaCreditCard className="text-lg" />,
      color: "from-green-500 to-green-600",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept Credit Cards, Debit Cards, Net Banking, UPI, Digital Wallets (Google Pay, Apple Pay, PayTM), and EMI options for bookings above ₹10,000."
        },
        {
          q: "My payment failed but money was deducted. What should I do?",
          a: "Don't worry! Failed payments are automatically refunded within 3-5 business days. If not refunded after this period, contact our support team with your transaction ID."
        },
        {
          q: "Do you offer installment payment options?",
          a: "Yes! For bookings above ₹10,000, you can opt for EMI at 0% interest through select credit cards. Choose EMI option during checkout."
        },
        {
          q: "Is your website secure for payments?",
          a: "Absolutely! We use 256-bit SSL encryption and comply with PCI DSS standards. Your payment information is completely secure."
        }
      ]
    },
    {
      category: "Account & Login",
      icon: <FaUserTie className="text-lg" />,
      color: "from-purple-500 to-purple-600",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page, enter your email, and click the reset link sent to your inbox. Set a new password and log in."
        },
        {
          q: "How do I update my profile information?",
          a: "Log in, go to 'My Profile', click 'Edit', make changes, and save. Some information like name may require verification through email/SMS."
        },
        {
          q: "Can I use my phone number to login instead of email?",
          a: "Yes! You can register and login using either email or phone number. Choose your preferred method during signup."
        },
        {
          q: "Is my personal data safe with you?",
          a: "Yes! We follow strict data protection policies and never share your information with third parties without consent. See our Privacy Policy for details."
        }
      ]
    },
    {
      category: "Loyalty & Rewards",
      icon: <FaCheckCircle className="text-lg" />,
      color: "from-yellow-500 to-yellow-600",
      questions: [
        {
          q: "How do loyalty points work?",
          a: "Earn 1 point for every ₹10 spent on bookings. Redeem 100 points = ₹50 discount. Bonus points for premium memberships and special promotions."
        },
        {
          q: "Do points expire?",
          a: "Points valid for 2 years from earned date. Inactive accounts for 6+ months may lose points. Keep booking to maintain your points!"
        },
        {
          q: "How do I join the VIP club?",
          a: "Book 10+ trains in a year or spend ₹50,000+ to automatically qualify for VIP status. Enjoy special discounts, priority support, and free cancellations."
        }
      ]
    },
    {
      category: "Technical Issues",
      icon: <FaRobot className="text-lg" />,
      color: "from-cyan-500 to-cyan-600",
      questions: [
        {
          q: "The website is loading slowly. What can I do?",
          a: "Clear browser cache, disable extensions, try a different browser, or use our mobile app. Peak hours (6-9 PM) may cause slower loading."
        },
        {
          q: "I'm getting an error while booking. What should I do?",
          a: "Refresh the page, clear cache, try a different browser, or use your mobile app. If issue persists, contact support with the error code."
        },
        {
          q: "The app keeps crashing. How do I fix it?",
          a: "Update to the latest version, clear app cache, restart your phone, or reinstall the app. Contact support if problem continues."
        }
      ]
    }
  ];

  const supportChannels = [
    {
      icon: <FaHeadset className="text-3xl" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      time: "Available 24/7",
      action: "Start Chat",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FaPhoneAlt className="text-3xl" />,
      title: "Phone Support",
      description: "Call our toll-free number",
      time: "Mon-Fri: 9AM-6PM | Sat-Sun: 10AM-4PM",
      details: "+91 0123456789",
      action: "Call Now",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FaEnvelope className="text-3xl" />,
      title: "Email Support",
      description: "Send us your query via email",
      time: "Response in 24 hours",
      details: "officialtb565@gmail.com",
      action: "Send Email",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <FaComment className="text-3xl" />,
      title: "Social Media",
      description: "Reach us on Facebook, Twitter, Instagram",
      time: "Response in 6 hours",
      action: "Message Us",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1e40af] text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Support Center</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl">
            Get help anytime, anywhere. We're here to support your railway journey.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Support Channels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            How Can We Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${channel.color} rounded-2xl mx-auto mb-4 flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  {channel.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{channel.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{channel.description}</p>
                <p className="text-xs text-gray-500 mb-4">{channel.time}</p>
                {channel.details && (
                  <p className="text-sm font-semibold text-[#000080] mb-4">{channel.details}</p>
                )}
                <button className={`w-full bg-gradient-to-r ${channel.color} text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all`}>
                  {channel.action} <FaArrowRight className="inline ml-2" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Search FAQ */}
        <section className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full  bg-white pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#000080] text-gray-800"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          {searchQuery && filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <ExclamationCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-2">Try searching with different keywords or contact our support team</p>
            </div>
          )}

          <div className="space-y-6">
            {(searchQuery ? filteredFaqs : faqs).map((category, catIdx) => (
              <div key={catIdx}>
                <div className={`bg-gradient-to-r ${category.color} rounded-xl p-4 mb-4 flex items-center gap-3`}>
                  <div className="text-white text-2xl">{category.icon}</div>
                  <h3 className="text-white text-xl font-bold">{category.category}</h3>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item, qIdx) => (
                    <div
                      key={qIdx}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-[#000080]"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === `${catIdx}-${qIdx}` ? null : `${catIdx}-${qIdx}`)}
                        className="w-full  bg-white px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-left font-semibold text-gray-800 group-hover:text-[#000080]">
                          {item.q}
                        </span>
                        {expandedFaq === `${catIdx}-${qIdx}` ? (
                          <ChevronUpIcon className="w-5 h-5 text-[#000080] flex-shrink-0 ml-4" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                        )}
                      </button>

                      {expandedFaq === `${catIdx}-${qIdx}` && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                          <p className="text-gray-700 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still Need Help? */}
        <section className="mt-16 bg-gradient-to-r from-[#000080] to-[#1e40af] text-white rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Our support team is available 24/7 to assist you with any queries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-white text-[#000080] font-bold rounded-lg hover:bg-blue-50 transition-all"
            >
              Contact Us
            </button>
            <a 
              href="tel:+910123456789"
              className="px-8 py-3 bg-[#DA291C] text-white font-bold rounded-lg hover:bg-red-700 transition-all"
            >
              Call Support
            </a>
          </div>
        </section>

        {/* Resources */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Resources & Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
                <FaVideo className="text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Video Tutorials</h3>
              <p className="text-gray-600 text-sm mb-4">Learn step-by-step guides on how to book tickets, check status, and more.</p>
              <button className="text-[#000080]  bg-white font-semibold">
                Watch Now →
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white mb-4">
                <FaFileAlt className="text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm mb-4">Access detailed guides, terms, and conditions for all our services.</p>
              <button className="text-[#000080] bg-white font-semibold">
                Read Docs →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#000080] to-[#1e40af] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">RailWay</h3>
              <p className="text-white/80 text-sm">Your trusted railway booking partner.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Safety</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</li>
                <li className="hover:text-white cursor-pointer transition-colors">Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>© 2025 RailWay. All rights reserved. Revolutionizing Indian railway travel.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Support;