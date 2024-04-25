// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidenav from './components/Sidenav'; // Import the Sidenav component
import Movies from './components/Movies';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className='flex'>
        <Sidenav />
        <Routes>
          <Route path="/movies" element={<Movies />} />
          <Route path="/" element={<Navigate to="/movies" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
