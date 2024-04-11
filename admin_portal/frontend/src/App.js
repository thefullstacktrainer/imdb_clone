// src/App.js
import React, { useState, useEffect } from 'react';
import AddMovieForm from './AddMovieForm';
import axios from 'axios';

const App = () => {
  const [movies, setMovies] = useState([]);
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

  const handleAddMovie = async () => {
    await fetchMovies();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Movies</h1>
      <AddMovieForm onAdd={handleAddMovie} />
      <div className="mt-8">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-white shadow-md rounded-md p-4 mb-4">
            <h2 className="text-xl font-semibold">{movie.title}</h2>
            <p className="text-gray-700">{movie.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
