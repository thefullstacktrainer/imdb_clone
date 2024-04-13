import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Movies = ({ isLoggedIn }) => {
    const [movies, setMovies] = useState([]);
    const [userRatings, setUserRatings] = useState({});
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4001";
    const navigate = useNavigate();

    useEffect(() => {
        fetchMovies();
        if (isLoggedIn) {
            fetchUserRatings();
        }
    }, [isLoggedIn]);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/public/movies`);
            setMovies(response.data.movies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const fetchUserRatings = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const userId = sessionStorage.getItem('userId');
            const response = await axios.get(`${apiUrl}/api/user/${userId}/ratings`, { headers: { Authorization: `Bearer ${token}` } });
            setUserRatings(response.data.ratings);
        } catch (error) {
            console.error('Error fetching user ratings:', error);
        }
    };

    const handleRating = async (movieId, ratingValue) => {
        if (!isLoggedIn) {
            setShowLoginDialog(true);
        } else {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.post(`${apiUrl}/api/movies/${movieId}/rating`, { rating: ratingValue }, { headers: { Authorization: `Bearer ${token}` } });
                if (response.data.success) {
                    fetchMovies();
                    fetchUserRatings();
                } else {
                    console.error('Error adding rating:', response.data.error);
                }
            } catch (error) {
                console.error('Error adding rating:', error);
            }
        }
    };

    const handleLogin = () => {
        navigate('/login');
        setShowLoginDialog(false);
    };

    const handleCancel = () => {
        setShowLoginDialog(false);
    };

    const handleMovieDetail = (movieId) => {
        navigate(`/movies/${movieId}`);
    };

    return (
        <div className="flex justify-center">
            <div className="max-w-md px-4 py-8">
                {movies.map((movie) => (
                    <div key={movie.id} className="mb-8" onClick={() => handleMovieDetail(movie.id)} style={{ cursor: 'pointer' }}>
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
                        <div className="flex space-x-2 mb-2">
                            {[...Array(5)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRating(movie.id, index + 1);
                                    }}
                                    className="focus:outline-none inline-block"
                                >
                                    {index < (userRatings[movie.id] || 0) ? <FontAwesomeIcon icon={fasStar} className="text-yellow-500" /> : (index + 0.5 === userRatings[movie.id] ? <FontAwesomeIcon icon={faStarHalfAlt} className="text-yellow-500" /> : <FontAwesomeIcon icon={farStar} className="text-yellow-500" />)}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {showLoginDialog && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg">
                            <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
                            <p className="text-gray-700 mb-4">You need to log in to rate this movie.</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={handleLogin}>Login</button>
                            <button className="text-blue-500" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;
