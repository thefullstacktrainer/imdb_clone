// src/App.js
import React, { useState, useEffect } from 'react';
import MovieAddUpdateForm from './MovieAddUpdateForm';
import axios from 'axios';

const App = () => {
  const [movies, setMovies] = useState([]);
  const [updateMovie, setUpdateMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/movies');
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
    setUpdateMovie(null); // Reset the update movie state
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Movies</h1>
      <MovieAddUpdateForm movie={updateMovie} onUpdate={handleAddOrUpdateMovie} onCancel={handleCancel} />
      <div className="mt-8">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-white shadow-md rounded-md p-4 mb-4">
            <h2 className="text-xl font-semibold">{movie.title}</h2>
            <p className="text-gray-700">{movie.description}</p>
            <button className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4" onClick={() => setUpdateMovie(movie)}>Update</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
