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
            <header className="bg-gray-800 text-white py-4">
                <div className="text-4xl font-bold text-center">Movies</div>
            </header>
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
                                onClick={() => handleRating(movie.id, index + 1)}
                                style={{ color: index < movie.userRating ? '#FFC120' : '#A0AEC0' }} // Yellow or gray color
                                className="focus:outline-none inline-block"
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
