import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Movies from './components/Movies';
import Signup from './components/Signup';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track user's login status
  const [userId, setUserId] = useState(null); // State to store the user's ID

  useEffect(() => {
    // Logic to fetch the userId from authentication state
    // This is just an example, you should replace it with your actual logic
    const userIdFromAuth = getUserIdFromAuth(); // Replace getUserIdFromAuth with your actual function
    setUserId(userIdFromAuth);
    setIsLoggedIn(!!userIdFromAuth); // Set isLoggedIn based on the presence of userId
  }, []);

  // Function to retrieve userId from authentication state
  const getUserIdFromAuth = () => {
    // Retrieve userId from session storage
    const userId = sessionStorage.getItem('userId');
    return userId;
  };

  const handleLogout = () => {
    // Reset the login status to false
    setIsLoggedIn(false);
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    window.location.reload(); //
  };

  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-white text-xl">
              <Link to="/">Movies</Link>
            </div>
            <div className="flex space-x-4">
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
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> {/* Pass setIsLoggedIn as a prop */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
