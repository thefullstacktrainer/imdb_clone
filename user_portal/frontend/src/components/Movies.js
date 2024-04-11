import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4001";

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/public/movies`);
            setMovies(response.data.movies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const handleRating = async (movieId, rating) => {
        try {
            // Send rating to backend
            console.log(rating);
            // Update local state or fetch movies again
            // For demonstration, we'll just update the local state
            const updatedMovies = movies.map(movie => {
                if (movie.id === movieId) {
                    return { ...movie, userRating: rating };
                }
                return movie;
            });
            setMovies(updatedMovies);
        } catch (error) {
            console.error('Error rating movie:', error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Movies</h2>
            {movies.map((movie) => (
                <div key={movie.id} className="mb-8">
                    <h3 className="text-xl font-semibold">{movie.title}</h3>
                    <p className="text-gray-600 mb-4">{movie.description}</p>
                    <div>
                        {[...Array(5)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleRating(movie.id, index + 1)}
                                style={{ color: index < movie.userRating ? '#FFC120' : '#A0AEC0' }} // Yellow or gray color
                                className="focus:outline-none"
                            >
                                {index < movie.userRating ? <FontAwesomeIcon icon={fasStar} /> : (index + 0.5 === movie.userRating ? <FontAwesomeIcon icon={faStarHalfAlt} /> : <FontAwesomeIcon icon={farStar} />)}
                            </button>

                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Movies;
