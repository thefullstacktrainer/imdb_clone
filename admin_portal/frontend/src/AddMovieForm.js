// src/AddMovieForm.js
import React, { useState } from 'react';
import axios from 'axios';

const AddMovieForm = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        release_date: '',
        genre: '',
        poster_url: '',
    });

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
            await axios.post('http://localhost:4000/api/movies', formData);
            onAdd();
            setFormData({
                title: '',
                description: '',
                release_date: '',
                genre: '',
                poster_url: '',
            });
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Add Movie</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" className="mt-1 p-2 border border-gray-300 rounded-md w-full" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" className="mt-1 p-2 border border-gray-300 rounded-md w-full" value={formData.description} onChange={handleChange} required></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="release_date" className="block text-sm font-medium text-gray-700">Release Date</label>
                    <input type="date" name="release_date" id="release_date" className="mt-1 p-2 border border-gray-300 rounded-md w-full" value={formData.release_date} onChange={handleChange} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre</label>
                    <input type="text" name="genre" id="genre" className="mt-1 p-2 border border-gray-300 rounded-md w-full" placeholder="e.g. Action, Comedy" value={formData.genre} onChange={handleChange} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="poster_url" className="block text-sm font-medium text-gray-700">Poster URL</label>
                    <input type="url" name="poster_url" id="poster_url" className="mt-1 p-2 border border-gray-300 rounded-md w-full" value={formData.poster_url} onChange={handleChange} required />
                </div>
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Add Movie</button>
            </form>
        </div>
    );
};

export default AddMovieForm;
