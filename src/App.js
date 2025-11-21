import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import PaymentQRPage from './pages/PaymentQRPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/pagoqr" element={<PaymentQRPage />} />
      </Routes>
    </Router>
  );
}