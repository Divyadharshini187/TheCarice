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
import LiveKitModal from './components/LiveKitModal.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="merchant" element={<Merchant />} />
          <Route path="add-items" element={<AddItems />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="payment" element={<Payment />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;