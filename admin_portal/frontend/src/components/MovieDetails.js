// MovieDetails.js - Movie details component
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MovieDetails.css'; // Import the CSS file for MovieDetails styling

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
        <div className="movie-details-container">
            {movie && (
                <div>
                    <h1 className="movie-title">{movie.title}</h1>
                    <p className="movie-description">{movie.description}</p>
                    <p className="movie-rating">Rating: {movie.rating}</p>
                    <p className="movie-release-date">Release Date: {new Date(movie.release_date).toLocaleDateString()}</p>
                    <p className="movie-genre">Genre: {movie.genre}</p>
                    <img className="movie-poster" src={movie.poster_url} alt={movie.title} />
                    <p className="movie-created-by">Created By: {movie.created_by}</p>
                    <p className="movie-created-at">Created At: {new Date(movie.created_at).toLocaleString()}</p>
                    <p className="movie-updated-at">Updated At: {new Date(movie.updated_at).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default MovieDetails;
