import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { 
  FiLock, FiSettings, FiStar, FiLogOut, FiUserCheck, 
  FiMapPin, FiBell, FiCreditCard, FiEdit2, FiSave, 
  FiX, FiCheck, FiUser, FiMail, FiPhone, FiCalendar,
  FiHome, FiShield,  FiUsers
} from "react-icons/fi";


const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({});
  const [editingField, setEditingField] = useState(null);


  // Fetch profile
  const fetchProfile = async () => {
    const token = sessionStorage.getItem("userToken");
    if (!token) { setLoading(false); return; }
    try {
      // NOTE: Using localhost:5000 - ensure your backend is running here
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUser(data);
      setFormData({
        fullName: data.fullName || "",
        userName: data.userName || "",
        email: data.email || "",
        mobile: data.mobile || "",
        age: data.age || "",
        address: data.address || { street: "", city: "", state: "", country: "India", pincode: "" },
        verified: data.verified || { email: false, phone: false, aadhaar: false, pan: false },
        wallet: data.wallet || { balance: 0, transactions: [] },
        trips: data.trips || [],
        travellers: data.travellers || [],
        notifications: data.notifications || []
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };


  useEffect(() => { fetchProfile(); }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData({ ...formData, address: { ...formData.address, [key]: value } });
    } else { setFormData({ ...formData, [name]: value }); }
  };

  // Updated to handle saving from child component's local state
  const handleSave = async (updatedFormData) => {
    try {
      const token = sessionStorage.getItem("userToken");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        // Only send the fields that are currently being edited, or send all formData
        // For simplicity and to ensure all profile updates are captured, we send all formData
        body: JSON.stringify(updatedFormData || formData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setUser(data); 
      setEditMode(false); 
      setEditingField(null);
      alert("Profile updated!");
    } catch (err) { console.error(err); }
  };

  const handleFieldEdit = (field) => {
    setEditingField(field);
    setEditMode(true);
  };

  // New: Handle save from child local state
  const handleFieldSave = (field, localValue) => {
    let updatedFormData = { ...formData };
    if (field === "address") {
      updatedFormData.address = localValue;
    } else {
      updatedFormData[field] = localValue;
    }
    setFormData(updatedFormData);
    handleSave(updatedFormData);
  };

  const saveField = async (field) => {
    // This is now handled by the child calling handleFieldSave
    // Basic validation could be added here before calling handleSave
  };


  const cancelEdit = () => {
    setEditingField(null);
    setEditMode(false);
    fetchProfile(); // Reset form data to the last fetched user data
  };


  const tabConfig = [
    { id: "profile", label: "Profile", icon: FiUser, color: "bg-blue-500" },
    { id: "security", label: "Security", icon: FiLock, color: "bg-green-500" }, // Changed icon to FiLock
    { id: "wallet", label: "Wallet", icon: FiCreditCard, color: "bg-purple-500" }, // Changed icon to FiCreditCard
    { id: "trips", label: "Trips", icon: FiMapPin, color: "bg-orange-500" }, // Changed icon to FiMapPin
    { id: "travellers", label: "Travellers", icon: FiUsers, color: "bg-teal-500" },
    { id: "notifications", label: "Notifications", icon: FiBell, color: "bg-red-500" }
  ];


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#000080] border-t-transparent rounded-full"
        />
      </div>
    );
  }


  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FiUser className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-red-500 text-lg">No user profile found</p>
        </div>
      </div>
    );
  }


  // 🐛 DEEP FIX: Use local state for editing to prevent parent re-renders during typing
  const ProfileField = ({ label, value, field, icon: Icon, type = "text", isAddress = false, onFieldSave, onCancel }) => {
    const isEditing = editingField === field;
    const [localValue, setLocalValue] = useState(isAddress ? formData.address || { street: "", city: "", state: "", country: "India", pincode: "" } : (formData[field] || ""));
    
    // Reset local value when entering edit mode
    useEffect(() => {
      if (isEditing) {
        setLocalValue(isAddress ? (formData.address || { street: "", city: "", state: "", country: "India", pincode: "" }) : (formData[field] || ""));
      }
    }, [isEditing, formData, field, isAddress]);

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      if (isAddress) {
        const key = name.split(".")[1];
        setLocalValue(prev => ({ ...prev, [key]: value }));
      } else {
        setLocalValue(value);
      }
    };

    const handleSave = () => {
      onFieldSave(field, localValue);
    };

    const handleCancel = () => {
      setLocalValue(isAddress ? formData.address || { street: "", city: "", state: "", country: "India", pincode: "" } : (formData[field] || ""));
      onCancel();
    };

    return (
      <div // ⬅️ FIX: Changed from <motion.div layout> to <div>
        className="group relative bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {Icon && <Icon className="text-[#000080] text-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-600 mb-1">{label}:</div>
              {!isEditing ? (
                <div className="text-gray-900 font-medium break-words">
                  {value || <span className="text-gray-400 italic">Not set</span>}
                </div>
              ) : (
                <div className="space-y-2">
                  {!isAddress ? (
                    <input
                      type={type}
                      name={field}
                      value={localValue}
                      onChange={handleLocalChange}
                      className="w-full px-3 py-2 bg-white text-[#000080] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent"
                      placeholder={`Enter ${label.toLowerCase()}`}
                      autoFocus // ⬅️ This is what conflicted with the old 'layout' prop
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        key="street"
                        type="text"
                        name="address.street"
                        value={localValue.street || ""}
                        onChange={handleLocalChange}
                        placeholder="Street"
                        className="px-3 py-2 border bg-white text-[#000080] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent"
                        autoFocus={isEditing}
                      />
                      <input
                        key="city"
                        type="text"
                        name="address.city"
                        value={localValue.city || ""}
                        onChange={handleLocalChange}
                        placeholder="City"
                        className="px-3 py-2 border bg-white text-[#000080] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent"
                      />
                      <select
                        key="state"
                        name="address.state"
                        value={localValue.state || ""}
                        onChange={handleLocalChange}
                        className="px-3 py-2 border bg-white text-[#000080] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"].map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <input
                        key="pincode"
                        type="text"
                        name="address.pincode"
                        value={localValue.pincode || ""}
                        onChange={handleLocalChange}
                        placeholder="Pincode"
                        className="px-3 py-2 border bg-white text-[#000080] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent"
                      />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#000080] text-white rounded-lg transition-colors"
                    >
                      <FiCheck className="text-sm" />
                      <span className="text-sm">Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#DA291C] text-white rounded-lg transition-colors"
                    >
                      <FiX className="text-sm" />
                      <span className="text-sm">Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => handleFieldEdit(field)}
              className="opacity-0 group-hover:opacity-100 p-2 bg-[#000080] text-white transition-all duration-200"
            >
              <FiEdit2 className="text-sm" />
            </button>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-[#000080] to-[#1e40af] text-white shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold"
              >
                {user.fullName?.[0] || "U"}
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-blue-200">Manage your railway account</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm">
                <FiShield className="text-green-300" />
                <span>Account Verified</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>


      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-8 p-2 bg-white rounded-2xl shadow-lg"
        >
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center bg-white text-[#000080] space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? `${tab.color} text-[#000080] shadow-lg transform scale-105` 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="text-lg" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>


        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* --- Profile Tab Content --- */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Details */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <FiUser className="text-[#000080]" />
                        <span>Profile Information</span>
                      </h2>
                    </div>


                    <div className="space-y-4">
                      <ProfileField 
                        label="Full Name" 
                        value={user.fullName} 
                        field="fullName" 
                        icon={FiUser}
                        onFieldSave={handleFieldSave}
                        onCancel={cancelEdit}
                      />
                      <ProfileField 
                        label="Username" 
                        value={user.userName} 
                        field="userName" 
                        icon={FiUser}
                        onFieldSave={handleFieldSave}
                        onCancel={cancelEdit}
                      />
                      <ProfileField 
                        label="Email" 
                        value={user.email} 
                        field="email" 
                        icon={FiMail}
                        type="email"
                        onFieldSave={handleFieldSave}
                        onCancel={cancelEdit}
                      />
                      <ProfileField 
                        label="Mobile" 
                        value={user.mobile} 
                        field="mobile" 
                        icon={FiPhone}
                        type="tel"
                        onFieldSave={handleFieldSave}
                        onCancel={cancelEdit}
                      />
                      <ProfileField 
                        label="Age" 
                        value={user.age} 
                        field="age" 
                        icon={FiCalendar}
                        type="number"
                        onFieldSave={handleFieldSave}
                        onCancel={cancelEdit}
                      />
                      <ProfileField 
                        label="Address" 
                        value={user.address?.street || user.address?.city ? 
                          `${user.address.street}, ${user.address.city}, ${user.address.state}, ${user.address.country || "India"}${user.address.pincode ? " - " + user.address.pincode : ""}` 
                          : null
                        }
                        field="address" 
                        icon={FiHome}
                        isAddress={true}
                        onFieldSave={handleFieldSave}
                        onCancel={cancelEdit}
                      />
                    </div>


                    {/* Verification Status */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <FiShield className="text-green-500" />
                        <span>Verification Status</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["email", "phone", "aadhaar", "pan"].map((type) => (
                          <div key={type} className="text-center">
                            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                              user.verified?.[type] ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}>
                              {user.verified?.[type] ? <FiCheck /> : <FiX />}
                            </div>
                            <div className="text-sm font-medium text-gray-700 capitalize">{type}</div>
                            <div className={`text-xs ${user.verified?.[type] ? "text-green-600" : "text-red-600"}`}>
                              {user.verified?.[type] ? "Verified" : "Pending"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>


                {/* QR Code & Quick Actions */}
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <h3 className="text-lg font-semibold mb-4 flex items-center justify-center space-x-2">
                      <FiSettings className="text-[#000080]" />
                      <span className="text-[#000080]">My QR Pass</span>
                    </h3>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 inline-block">
                      {/* You might want to use a more secure or informative value for the QR code than just the _id in production */}
                      <QRCode value={user._id || ""} size={150} /> 
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      Scan to verify my railway profile
                    </p>
                  </div>


                  {/* Quick Stats */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Trips:</span>
                        <span className="font-bold text-[#000080]">{user.trips?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Travellers:</span>
                        <span className="font-bold text-[#000080]">{user.travellers?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Wallet Balance:</span>
                        <span className="font-bold text-green-600">₹{user.wallet?.balance || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* --- Security Tab Content --- */}
            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
                  <FiLock className="text-green-500" /> {/* Updated icon color for security tab */}
                  <span>Security & Authentication</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["email", "phone", "aadhaar", "pan"].map((type) => (
                    <div key={type} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold capitalize text-gray-800">{type} Verification</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Status: {user.verified?.[type] ? "Verified" : "Pending"}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.verified?.[type] ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {user.verified?.[type] ? <FiCheck /> : <FiX />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2">Two-Factor Authentication</h4>
                  <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                  <button className="bg-[#000080] text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}


            {/* --- Wallet Tab Content --- */}
            {activeTab === "wallet" && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
                  <FiCreditCard className="text-purple-500" />
                  <span>Wallet</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-[#000080] to-[#1e40af] text-white rounded-2xl p-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-blue-200 mb-2">Available Balance</p>
                          <p className="text-4xl font-bold">₹{user.wallet?.balance || 0}</p>
                        </div>
                        {/* <FiWallet className="text-3xl text-blue-200" /> */}
                      </div>
                      <div className="mt-6 flex space-x-4">
                        <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors">
                          Add Money
                        </button>
                        <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors">
                          Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                      <FiCreditCard className="text-3xl text-[#000080] mx-auto mb-2" />
                      <p className="font-semibold text-[#000080]">Quick Recharge</p>
                      <p className="text-sm text-gray-600">For train bookings</p>
                    </div>
                    <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                      <FiStar className="text-3xl text-orange-500 mx-auto mb-2" />
                      <p className="font-semibold text-[#000080]">Rewards</p>
                      <p className="text-sm text-gray-600">Earn on every trip</p>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* --- Trips Tab Content --- */}
            {activeTab === "trips" && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
                  <FiMapPin className="text-orange-500" /> {/* Updated icon color for trips tab */}
                  <span>My Trips</span>
                </h3>
                <div className="space-y-4">
                  {user.trips?.length > 0 ? user.trips.map((trip, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {/* Assuming a train icon might be available, using a placeholder text for now */}
                            <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">T</div>
                            <h4 className="font-bold text-lg text-gray-800">{trip.trainName || "Train Booking"}</h4>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Date:</span> {trip.date || "N/A"}</p>
                            <p><span className="font-medium">PNR:</span> {trip.pnr || "N/A"}</p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            trip.status === "CONFIRMED" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {trip.status || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-12">
                      <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No trips found</p>
                      <p className="text-gray-400 text-sm">Your booking history will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* --- Travellers Tab Content --- */}
            {activeTab === "travellers" && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
                  <FiUsers className="text-teal-500" /> {/* Updated icon color for travellers tab */}
                  <span>My Travellers</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.travellers?.length > 0 ? user.travellers.map((traveller, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200"
                    >
                      <div className="w-16 h-16 bg-[#000080] text-white rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                        {traveller.name?.[0] || "T"}
                      </div>
                      <div className="space-y-2">
                        <p><span className="font-medium text-gray-600">Name:</span> {traveller.name || "N/A"}</p>
                        <p><span className="font-medium text-gray-600">Age:</span> {traveller.age || "N/A"}</p>
                        <p><span className="font-medium text-gray-600">Gender:</span> {traveller.gender || "N/A"}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full text-center py-12">
                      <FiUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No travellers added</p>
                      <p className="text-gray-400 text-sm">Add frequent travellers for quick booking</p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* --- Notifications Tab Content --- */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
                  <FiBell className="text-red-500" />
                  <span>Notifications</span>
                </h3>
                <div className="space-y-4">
                  {user.notifications?.length > 0 ? user.notifications.map((notification, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div> {/* Updated color to match tab */}
                        <div className="flex-1">
                          <p className="text-gray-800">{notification.message || "No message"}</p>
                          {notification.date && (
                            <p className="text-sm text-gray-500 mt-2">{notification.date}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-12">
                      <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No notifications</p>
                      <p className="text-gray-400 text-sm">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>


        {/* Logout Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <FiLogOut className="text-4xl text-[#DA291C] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to leave?</h3>
          <p className="text-gray-600 mb-6">You can always sign back in anytime</p>
          <button 
            className="bg-[#DA291C] text-white px-8 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors transform hover:scale-105"
            onClick={() => {
              sessionStorage.removeItem("userToken");
              window.location.reload();
            }}
          >
            Logout Securely
          </button>
        </motion.div>
      </div>
    </div>
  );
};


export default ProfilePage;