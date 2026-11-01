import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import CampusPage from './pages/CampusPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/campus" element={<CampusPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
