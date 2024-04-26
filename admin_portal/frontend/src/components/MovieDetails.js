// MovieDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MovieDetails.css'; // Import the CSS file

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/movies/${id}`);
                setMovie(response.data.movie);
            } catch (error) {
                console.error('Error fetching movie:', error);
            }
        };

        fetchMovie();
    }, [id, apiUrl]);

    return (
        <div className="container">
            {movie && (
                <div className="movie-card">
                    <h1>{movie.title}</h1>
                    <p>{movie.description}</p>
                    <p>Rating: {movie.rating}</p>
                    <p>Genre: {movie.genre}</p>
                    <p>Release Date: {new Date(movie.release_date).toDateString()}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                </div>
            )}
        </div>
    );
};

export default MovieDetails;
