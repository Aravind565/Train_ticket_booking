import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import TrainSearch from './components/TrainSearch';
import TrainResult from './components/TrainResult';
import BookingPage from './components/BookingPage';
import ConfirmationPage from './components/ConfirmationPage';
import PaymentGateway from './components/PaymentGateway';
import BookingSuccessPage from './components/BookingSuccessPage';
import MyTrips from './components/MyTrips';
import ProfilePage from './components/ProfilePage';
import Contactus from './components/Contactus';
import Support from './components/Support';

// ✅ KEY PART - Wrapper Component
const AppLayout = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userToken = sessionStorage.getItem('userToken');
    const userData = sessionStorage.getItem('userData');
    
    if (userToken && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  return (
    <>
      <Navbar user={user} onProfileClick={() => {}} />
      {children}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />

        {/* AUTH (no navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}
        <Route path="/book" element={<ProtectedRoute><AppLayout><TrainSearch /></AppLayout></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><AppLayout><TrainResult /></AppLayout></ProtectedRoute>} />
        <Route path="/seatmap/:trainId" element={<ProtectedRoute><AppLayout><BookingPage /></AppLayout></ProtectedRoute>} />
        <Route path="/confirmation" element={<ProtectedRoute><AppLayout><ConfirmationPage /></AppLayout></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><AppLayout><PaymentGateway /></AppLayout></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute><AppLayout><BookingSuccessPage /></AppLayout></ProtectedRoute>} />
        <Route path="/mytrips" element={<ProtectedRoute><AppLayout><MyTrips /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><AppLayout><Contactus /></AppLayout></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><AppLayout><Support /></AppLayout></ProtectedRoute>} />
  
      </Routes>
    </Router>
  );
};

export default App;
