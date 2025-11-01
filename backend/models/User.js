const mongoose = require('mongoose');

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },

  // Address with state dropdown and pincode
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    pincode: {
      type: String,
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
      default: ""
    },
    state: { type: String, enum: indianStates, default: null },
    country: { type: String, default: "India" },
  }
});

module.exports = mongoose.model('User', userSchema);
