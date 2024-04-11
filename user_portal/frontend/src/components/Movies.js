// src/components/Movies.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            console.log(rating)
            // Update local state or fetch movies again
            fetchMovies();
        } catch (error) {
            console.error('Error rating movie:', error);
        }
    };

    return (
        <div>
            <h2>Movies</h2>
            {movies.map((movie) => (
                <div key={movie.id}>
                    <h3>{movie.title}</h3>
                    <p>{movie.description}</p>
                    <div>
                        <button onClick={() => handleRating(movie.id, 1)}>Rate 1 star</button>
                        <button onClick={() => handleRating(movie.id, 2)}>Rate 2 stars</button>
                        <button onClick={() => handleRating(movie.id, 3)}>Rate 3 stars</button>
                        <button onClick={() => handleRating(movie.id, 4)}>Rate 4 stars</button>
                        <button onClick={() => handleRating(movie.id, 5)}>Rate 5 stars</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Movies;
