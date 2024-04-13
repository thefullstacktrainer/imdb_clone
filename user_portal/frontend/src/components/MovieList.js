import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import MovieDetail from './MovieDetail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
const MovieList = ({ movies, isLoggedIn, handleRating, userRatings }) => {
    const navigate = useNavigate();
    const handleMovieDetail = (movieId) => {
        navigate(`/movies/${movieId}`);
    };
    return (
        <div>
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
                    <div>
                        {[...Array(5)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleRating(movie.id, index + 1)} // Pass movie id and rating value to handleRating function
                                className="focus:outline-none inline-block"
                            >
                                {index < (userRatings[movie.id] || 0) ? <FontAwesomeIcon icon={fasStar} className="text-yellow-500" /> : (index + 0.5 === userRatings[movie.id] ? <FontAwesomeIcon icon={faStarHalfAlt} className="text-yellow-500" /> : <FontAwesomeIcon icon={farStar} className="text-yellow-500" />)}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MovieList;
