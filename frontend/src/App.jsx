import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AddItems from './pages/AddItems';
import Merchant from './pages/Merchant';
import OrderConfirmation from './pages/OrderConfirmation';
import Payment from './pages/Payment';
import VerifyEmail from './pages/VerifyEmail';
import Inventory from './pages/Inventory';
import SalesReport from './pages/SalesReport';
import LiveKitModal from './components/LiveKitModal.jsx';

<<<<<<< HEAD
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('currentUser');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

=======
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
=======
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
>>>>>>> 19ca03704f5e16fe02f507d0272e96c971f1eb96
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="merchant" element={<Merchant />} />
          <Route path="add-items" element={<AddItems />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="payment" element={<Payment />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales-report" element={<SalesReport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;