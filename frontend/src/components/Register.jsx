import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputField, AuthButton, AuthMessage, LoadingSpinner } from "../components/AuthComponents";
import empty_sign from "../assets/empty_sign.jpg";
import api from "../api/api";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
    mobile: "",
    age: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "userName":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        return "";
      case "fullName":
        if (!value.trim()) return "Full name is required";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
        return "";
      case "mobile":
        if (!value.trim()) return "Mobile number is required";
        if (!/^\d{10}$/.test(value)) return "Enter a valid 10-digit mobile number";
        return "";
      case "age":
        if (!value) return "Age is required";
        if (isNaN(value) || value < 1 || value > 120) return "Enter a valid age";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords don't match";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setGeneralError("");
  setSuccess("");

  if (!validateForm()) {
    setGeneralError("Please fix the errors in the form");
    return;
  }

  setLoading(true);

  try {
    console.log("Register data sending:", formData);

    const response = await fetch("https://trainticket-backend.onrender.com/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Registration successful:", data);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      const errorData = await response.json();
      console.log("Registration failed:", errorData);
      setGeneralError(errorData.message || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.log("Fetch error:", error);
    setGeneralError("Network error: " + error.message);
  } finally {
    setLoading(false);
  }
};

  // ... (keep all your existing handler functions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gradient-to-br from-primary/20 via-white/50 to-secondary/20 backdrop-blur-sm p-0.5 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] overflow-hidden border border-white/30">
        <div className="flex flex-col md:flex-row rounded-3xl bg-white/80 backdrop-blur-md overflow-hidden">
          {/* Left Panel */}
          <div className="hidden md:flex flex-col items-center justify-center w-1/2 px-8 py-10 bg-gradient-to-b from-white via-gray-50/80 to-gray-100/80">
            <img
              src={empty_sign}
              alt="TrainBooking Logo"
              className="animate-float w-28 h-28 mb-6 object-contain shadow-lg rounded-full border-4 border-primary/10"
              style={{ animationDuration: '8s' }}
            />
            <h1 className="text-2xl font-extrabold text-primary mb-2 text-center leading-tight drop-shadow">
              Join TrainBooking
            </h1>
            <p className="text-base text-gray-600 text-center font-medium leading-relaxed">
              Create your account and start booking your journeys.
            </p>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:py-10 sm:px-8 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <LoadingSpinner text="Creating account..." />
              </div>
            )}

            <h2 className="text-2xl font-bold text-primary text-center mb-2 tracking-tight">
              Create your account
            </h2>
            <p className="text-gray-500 text-center mb-6">Fill in your details to get started</p>

            {success && <AuthMessage type="success">{success}</AuthMessage>}
            {generalError && <AuthMessage type="error">{generalError}</AuthMessage>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon="user"
                  type="text"
                  name="userName"
                  placeholder="Username"
                  value={formData.userName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.userName}
                  required
                />

                <InputField
                  icon="user"
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.fullName}
                  required
                />
              </div>

              <InputField
                icon="email"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon="phone"
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.mobile}
                  required
                />

                <InputField
                  icon="age"
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.age}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <InputField
                icon="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                showPasswordToggle={true}
                togglePasswordVisibility={() => setShowPassword(!showPassword)}
                required
              />

              <InputField
                icon="password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                showPasswordToggle={true}
                togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                required
              />

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded focus:ring-2 focus:ring-offset-0"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="/terms" className="text-secondary hover:underline">Terms</a> and{" "}
                  <a href="/privacy" className="text-secondary hover:underline">Privacy Policy</a>
                </label>
              </div>

              <AuthButton loading={loading} type="submit">
                Create Account
              </AuthButton>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-secondary font-bold hover:text-primary hover:underline transition-colors duration-200"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;