import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidenav from './components/Sidenav'; // Import the Sidenav component
import Movies from './components/Movies';
import Actors from './components/Actors';
import MovieDetails from './components/MovieDetails';
import ActorDetails from './components/ActorDetails';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className='flex'>
        <Sidenav />
        <Routes>
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/actors" element={<Actors />} />
          <Route path="/actors/:id" element={<ActorDetails />} />
          <Route path="/" element={<Navigate to="/movies" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
