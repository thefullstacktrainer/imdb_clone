import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
    const [movie, setMovie] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4001";
    const { movieId } = useParams();

    useEffect(() => {
        fetchMovieDetails();
    }, []); // Fetch movie details when the component mounts

    const fetchMovieDetails = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/public/movies/${movieId}`);
            setMovie(response.data.movie);
            // Fetch user's rating for this movie if user is logged in
            const token = sessionStorage.getItem('token');
            if (token) {
                const userId = sessionStorage.getItem('userId');
                const userRatingResponse = await axios.get(`${apiUrl}/api/user/${userId}/ratings/${movieId}`, { headers: { Authorization: `Bearer ${token}` } });
                setUserRating(userRatingResponse.data.rating);
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    };

    const handleRating = async (ratingValue) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(`${apiUrl}/api/movies/${movieId}/rating`, { rating: ratingValue }, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                fetchMovieDetails(); // Refresh movie details after rating is updated
            } else {
                console.error('Error adding rating:', response.data.error);
            }
        } catch (error) {
            console.error('Error adding rating:', error);
        }
    };

    return (
        <div className="flex justify-center">
            <div className="max-w-md px-4 py-8">
                {movie && (
                    <div className="mb-8">
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
                        <p><strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}</p>
                        <p><strong>Genre:</strong> {movie.genre}</p>
                        <p><strong>Created By:</strong> {movie.created_by || 'Unknown'}</p>
                        <p><strong>Created At:</strong> {new Date(movie.created_at).toLocaleString()}</p>
                        <p><strong>Updated At:</strong> {new Date(movie.updated_at).toLocaleString()}</p>
                        <div className="flex space-x-2 mb-2">
                            <span>Your Rating : </span>{[...Array(5)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRating(index + 1)}
                                    className="focus:outline-none inline-block"
                                >
                                    {index < userRating ? <FontAwesomeIcon icon={fasStar} className="text-yellow-500" /> : (index + 0.5 === userRating ? <FontAwesomeIcon icon={faStarHalfAlt} className="text-yellow-500" /> : <FontAwesomeIcon icon={farStar} className="text-yellow-500" />)}
                                </button>
                            ))}
                        </div>
                        <div>
                            <video controls>
                                <source src={movie.poster_url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetail;
