// components/Movies.js
import React, { useState, useEffect } from 'react';
import MovieAddUpdateForm from './MovieAddUpdateForm';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [updateMovie, setUpdateMovie] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [movieToDelete, setMovieToDelete] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/movies`);
            setMovies(response.data.movies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const handleAddOrUpdateMovie = async () => {
        setUpdateMovie(null);
        await fetchMovies();
    };

    const handleCancel = () => {
        setUpdateMovie(null);
        setShowConfirmationModal(false); // Ensure the modal is closed when canceling
    };

    const handleDeleteMovie = async (id) => {
        setMovieToDelete(id);
        setShowConfirmationModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${apiUrl}/api/movies/${movieToDelete}`);
            await fetchMovies();
        } catch (error) {
            console.error('Error deleting movie:', error);
        }
        setShowConfirmationModal(false);
        setMovieToDelete(null);
    };

    const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
        return (
            <div className={`${isOpen ? '' : 'hidden'} fixed z-50 inset-0 overflow-y-auto`}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 mx-auto z-50">
                        <div className="text-center mb-4">{message}</div>
                        <div className="flex justify-center">
                            <button onClick={onConfirm} className="bg-red-500 text-white py-2 px-4 rounded-md mr-2">Confirm</button>
                            <button onClick={onClose} className="bg-gray-400 text-white py-2 px-4 rounded-md">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="max-w-lg mx-auto mb-6">
                <h1 class="text-3xl font-semibold">Movies</h1>
            </div>
            <MovieAddUpdateForm movie={updateMovie} onUpdate={handleAddOrUpdateMovie} onCancel={handleCancel} />
            <div className="mt-8">
                {movies.map((movie) => (
                    <div key={movie.id} className="bg-white shadow-md rounded-md p-4 mb-4">
                        <h2 className="text-xl font-semibold">
                            <Link to={`/movies/${movie.id}`} className="text-blue-500 hover:underline">{movie.title}</Link>
                        </h2>
                        <p className="text-gray-700">{movie.description}</p>
                        <div className="mt-4 flex justify-between">
                            <button className="bg-blue-500 text-white py-2 px-4 rounded-md" onClick={() => setUpdateMovie(movie)}>Update</button>
                            <button className="bg-red-500 text-white py-2 px-4 rounded-md" onClick={() => handleDeleteMovie(movie.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this movie?"
            />
        </div>
    );
};

export default Movies;
