// src/MovieAddUpdateForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MovieAddUpdateForm = ({ movie, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        release_date: '',
        genre: '',
        poster_url: '',
    });

    useEffect(() => {
        if (movie) {
            setFormData({
                title: movie.title,
                description: movie.description,
                release_date: movie.release_date ? movie.release_date.slice(0, 10) : '',
                genre: movie.genre,
                poster_url: movie.poster_url,
            });
        }
    }, [movie]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (movie) {
                await axios.put(`http://localhost:4000/api/movies/${movie.id}`, formData);
            } else {
                await axios.post('http://localhost:4000/api/movies', formData);
            }
            onUpdate();
            setFormData({
                title: '',
                description: '',
                release_date: '',
                genre: '',
                poster_url: '',
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCancel = () => {
        onCancel();
        setFormData({
            title: '',
            description: '',
            release_date: '',
            genre: '',
            poster_url: '',
        });
    };

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4">{movie ? 'Update Movie' : 'Add Movie'}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="mt-4 p-2 border border-gray-300 rounded-md w-full" ></textarea>
                <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} required className="mt-4 p-2 border border-gray-300 rounded-md w-full" />
                <input type="text" name="genre" placeholder="Genre" value={formData.genre} onChange={handleChange} required className="mt-4 p-2 border border-gray-300 rounded-md w-full" />
                <input type="url" name="poster_url" placeholder="Poster URL" value={formData.poster_url} onChange={handleChange} required className="mt-4 p-2 border border-gray-300 rounded-md w-full" />
                <div className="mt-4 flex justify-end">
                    <button type="button" className="bg-gray-400 text-white py-2 px-4 rounded-md mr-2" onClick={handleCancel}>Cancel</button>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">{movie ? 'Update Movie' : 'Add Movie'}</button>
                </div>
            </form>
        </div>
    );
};

export default MovieAddUpdateForm;
