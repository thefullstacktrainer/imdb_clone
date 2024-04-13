// App.js
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Movies from './components/Movies';
import Signup from './components/Signup';
import Login from './components/Login';
import MovieDetail from './components/MovieDetail';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const userIdFromAuth = getUserIdFromAuth();
    const usernameFromAuth = sessionStorage.getItem('username');
    setUserId(userIdFromAuth);
    setUsername(usernameFromAuth);
    setIsLoggedIn(!!userIdFromAuth);
  }, []);

  const getUserIdFromAuth = () => {
    const userId = sessionStorage.getItem('userId');
    return userId;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    window.location.reload();
  };

  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-white text-xl">
              <Link to="/">Movies</Link>
            </div>
            <div className="flex space-x-4 items-center">
              {isLoggedIn && (
                <span className="text-white mr-4">Welcome, {username}</span>
              )}
              {!isLoggedIn && (
                <Link to="/signup" className="text-white">Sign Up</Link>
              )}
              {!isLoggedIn ? (
                <Link to="/login" className="text-white">Login</Link>
              ) : (
                <button onClick={handleLogout} className="text-white">Logout</button>
              )}
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Movies isLoggedIn={isLoggedIn} userId={userId} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />} />
          <Route path="/movies/:movieId" element={<MovieDetail />} /> {/* Define child route for MovieDetail */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
