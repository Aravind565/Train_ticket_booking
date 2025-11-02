import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  InputField,
  AuthButton,
  AuthMessage,
  SocialAuthButton,
  LoadingSpinner
} from "../components/AuthComponents";
import empty_sign from "../assets/empty_sign.jpg";
import api from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!email || !password) {
    setError("Please fill in both fields.");
    return;
  }

  setLoading(true);
try {
  console.log("Login data sending:", { email, password });
  const response = await axios.post(
    "https://trainticket-backend.onrender.com/api/auth/login",
    { email, password },
    { headers: { "Content-Type": "application/json" } }
  );

 console.log("Response received:", response.data);
    if (response.data.token) {
      sessionStorage.setItem("userToken", response.data.token);

      // Save user info as JSON string
// ✅ CHANGE THIS LINE:
      sessionStorage.setItem("userData", JSON.stringify(response.data.user));
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1200);
    }
  } catch (error) {
    setError(error.response?.data?.message || "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

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
              Welcome to TrainBooking
            </h1>
            <p className="text-base text-gray-600 text-center font-medium leading-relaxed">
              A secure and fast way to plan your journey.
            </p>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:py-10 sm:px-8 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <LoadingSpinner text="Authenticating..." />
              </div>
            )}

            <h2 className="text-2xl font-bold text-secondary text-center mb-2 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-gray-500 text-center mb-6">Enter your credentials to access your account</p>

            {success && <AuthMessage type="success">{success}</AuthMessage>}
            {error && <AuthMessage type="error">{error}</AuthMessage>}

            <form onSubmit={handleLogin} className="space-y-4">
              <InputField
                icon="email"
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />

              <InputField
                icon="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                showPasswordToggle={true}
                togglePasswordVisibility={() => setShowPassword(!showPassword)}
                required
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded focus:ring-2 focus:ring-offset-0"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="text-secondary hover:text-primary hover:underline font-medium transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <AuthButton loading={loading} type="submit">
                Sign in
              </AuthButton>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow h-px bg-gray-200/70" />
              <span className="mx-4 text-gray-400 text-sm font-medium">or</span>
              <div className="flex-grow h-px bg-gray-200/70" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <SocialAuthButton 
                provider="Google"
                icon="https://img.icons8.com/color/20/000000/google-logo.png"
              />
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-secondary font-bold hover:text-primary hover:underline transition-colors duration-200"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
