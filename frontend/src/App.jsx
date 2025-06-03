import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} /> {/* PUBLIC Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <TrainSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <TrainResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seatmap/:trainId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <ConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
            <PaymentGateway />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-success"
          element={
            <ProtectedRoute>
          <BookingSuccessPage/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
