import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [showLoginDialog, setShowLoginDialog] = useState(false); // State to control the display of login dialog
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4001";
    const navigate = useNavigate(); // Get the navigate function from react-router-dom

    useEffect(() => {
        fetchMovies();
    }, []);

    // Define isLoggedIn to indicate whether the user is logged in or not
    const isLoggedIn = true; // Replace this with your actual authentication logic

    const fetchMovies = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/public/movies`);
            setMovies(response.data.movies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const handleRating = async () => {
        // Display login dialog when user tries to rate without being logged in
        setShowLoginDialog(true);
    };

    const handleLogin = () => {
        // Redirect the user to the login page
        navigate('/login');
        // Close the login dialog
        setShowLoginDialog(false);
    };

    const handleCancel = () => {
        // Close the login dialog
        setShowLoginDialog(false);
    };

    return (
        <div>
            {movies.map((movie) => (
                <div key={movie.id} className="mb-8">
                    <div className="flex justify-around items-center mb-2">
                        <h3 className="text-xl font-semibold mr-4">{movie.title}</h3>
                        <div className="flex items-center">
                            <div className="text-yellow-500 mr-2">
                                {movie.rating && [...Array(Math.floor(movie.rating))].map((_, index) => (
                                    <FontAwesomeIcon key={index} icon={fasStar} />
                                ))}
                                {movie.rating && movie.rating % 1 !== 0 && <FontAwesomeIcon icon={faStarHalfAlt} />}
                                {!movie.rating && 'No rating'}
                            </div>
                            <span>({movie.rating || 'Not rated'})</span>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">{movie.description}</p>
                    <div>
                        {[...Array(5)].map((_, index) => (
                            <button
                                key={index}
                                onClick={handleRating}
                                disabled={!isLoggedIn} // Disable rating button if user is not logged in
                                className="focus:outline-none inline-block"
                            >
                                {index < movie.userRating ? <FontAwesomeIcon icon={fasStar} /> : (index + 0.5 === movie.userRating ? <FontAwesomeIcon icon={faStarHalfAlt} /> : <FontAwesomeIcon icon={farStar} />)}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            {/* Login Dialog */}
            {showLoginDialog && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
                        <p className="text-gray-700 mb-4">You need to log in to rate this movie.</p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={handleLogin}>Login</button>
                        <button className="text-blue-500" onClick={handleCancel}>Cancel</button> {/* Handle click event for cancel button */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movies;
