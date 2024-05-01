const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getClient } = require('./mockDb'); // Import the mocked database functions
const router = require('../src/movies');

const app = express();
app.use(bodyParser.json());
app.use('/api/movies', router);
var client;

const getClient2 = () => {
    client = getClient();
    return client;
};

// Mock the database module
jest.mock('../src/db', () => {
    const { connect } = require('./mockDb');

    return {
        getClient: getClient2,
        connect,
    };
});

describe('POST /api/movies', () => {
    it('should create a new movie', async () => {
        const newMovie = {
            title: 'Test Movie',
            description: 'Test Description',
            release_date: '2024-05-01T00:00:00.000Z',
            genre: 'Test Genre',
            poster_url: 'https://example.com/test.jpg',
        };

        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [newMovie] });
        const response = await request(app)
            .post('/api/movies')
            .send(newMovie);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.movie.title).toBe(newMovie.title);
        expect(response.body.movie.description).toBe(newMovie.description);
        expect(response.body.movie.genre).toBe(newMovie.genre);
        expect(response.body.movie.poster_url).toBe(newMovie.poster_url);
    });
});

describe('GET /api/movies', () => {
    it('should fetch all movies', async () => {
        const mockMovies = [
            { id: 1, title: 'Movie 1', description: 'Description 1', release_date: '2023-01-01', genre: 'Action', poster_url: 'https://example.com/movie1.jpg' },
            { id: 2, title: 'Movie 2', description: 'Description 2', release_date: '2024-01-01', genre: 'Comedy', poster_url: 'https://example.com/movie2.jpg' }
        ];

        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: mockMovies });
        const response = await request(app).get('/api/movies');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.movies).toEqual(mockMovies);
    });

    it('should handle errors when fetching movies', async () => {
        jest.spyOn(client, 'query').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/api/movies');

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
    });
});

describe('GET /api/movies/:id', () => {
    it('should fetch a movie by ID', async () => {
        const movieId = 1;
        const mockMovie = { id: movieId, title: 'Movie 1', description: 'Description 1', release_date: '2023-01-01', genre: 'Action', poster_url: 'https://example.com/movie1.jpg' };

        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [mockMovie] });

        const response = await request(app).get(`/api/movies/${movieId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.movie).toEqual(mockMovie);
    });

    it('should handle error when movie not found', async () => {
        const movieId = 999;

        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get(`/api/movies/${movieId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Movie not found');
    });

    it('should handle errors when fetching movie by ID', async () => {
        const movieId = 1;

        jest.spyOn(client, 'query').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get(`/api/movies/${movieId}`);

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
    });
});

describe('PUT /api/movies/:id', () => {
    it('should update a movie by ID', async () => {
        const movieId = 1;
        const updatedMovie = {
            title: 'Updated Title',
            description: 'Updated Description',
            release_date: '2024-05-01',
            genre: 'Updated Genre',
            poster_url: 'https://example.com/updated-poster.jpg'
        };

        // Mock the query to check if the movie exists
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [{ id: movieId }] });

        // Mock the query to update the movie details
        jest.spyOn(client, 'query').mockResolvedValueOnce();

        // Make the PUT request to update the movie
        const response = await request(app)
            .put(`/api/movies/${movieId}`)
            .send(updatedMovie);

        // Assertions
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Movie updated successfully');
    });

    it('should handle error when movie not found', async () => {
        const movieId = 999; // A non-existent movie ID
        const updatedMovie = {
            title: 'Updated Title',
            description: 'Updated Description',
            release_date: '2024-05-01',
            genre: 'Updated Genre',
            poster_url: 'https://example.com/updated-poster.jpg'
        };

        // Mock the query to check if the movie exists (not necessary since the movie doesn't exist)
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [] });

        // Make the PUT request to update the movie
        const response = await request(app)
            .put(`/api/movies/${movieId}`)
            .send(updatedMovie);

        // Assertions
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Movie not found');
    });

    it('should handle errors when updating movie by ID', async () => {
        const movieId = 1;
        const updatedMovie = {
            title: 'Updated Title',
            description: 'Updated Description',
            release_date: '2024-05-01',
            genre: 'Updated Genre',
            poster_url: 'https://example.com/updated-poster.jpg'
        };

        // Mock the query to check if the movie exists
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [{ id: movieId }] });

        // Mock the query to update the movie details
        jest.spyOn(client, 'query').mockRejectedValueOnce(new Error('Database error'));

        // Make the PUT request to update the movie
        const response = await request(app)
            .put(`/api/movies/${movieId}`)
            .send(updatedMovie);

        // Assertions
        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
    });
});


describe('PUT /api/movies/:movieId/actors', () => {

    it('should handle error when movie not found', async () => {
        const movieId = 999;
        const addActorIds = [1, 2]; // Mock actor IDs to add
        const removeActorIds = [3, 4]; // Mock actor IDs to remove

        // Mock the query to check if the movie exists
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .put(`/api/movies/${movieId}/actors`)
            .send({ addActorIds, removeActorIds });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Movie not found');
    });

    it('should handle error when one or more actors not found', async () => {
        const movieId = 1;
        const addActorIds = [1, 2, 3]; // Mock actor IDs to add
        const removeActorIds = [4, 5]; // Mock actor IDs to remove

        // Mock the query to check if the movie exists
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [{ id: movieId }] });

        // Mock the query to check if the actors to be added exist
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });

        // Mock the query to check if the actors to be removed exist
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [{ id: 4 }] });

        const response = await request(app)
            .put(`/api/movies/${movieId}/actors`)
            .send({ addActorIds, removeActorIds });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('One or more actors not found');
    });

    it('should handle internal server error', async () => {
        const movieId = 1;
        const addActorIds = [1, 2]; // Mock actor IDs to add
        const removeActorIds = [3, 4]; // Mock actor IDs to remove

        // Mock the query to check if the movie exists
        jest.spyOn(client, 'query').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .put(`/api/movies/${movieId}/actors`)
            .send({ addActorIds, removeActorIds });

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
    });

});


describe('DELETE /api/movies/:id', () => {

    it('should delete a movie by ID', async () => {
        const movieId = 1;

        // Mock the first query to check if the movie exists
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [{ id: movieId }] });

        // Mock the second query to delete the movie
        jest.spyOn(client, 'query').mockResolvedValueOnce();
        const response = await request(app).delete(`/api/movies/${movieId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Movie deleted successfully');
    });

    it('should handle error when movie not found', async () => {
        const movieId = 999;

        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: [] });

        const response = await request(app).delete(`/api/movies/${movieId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Movie not found');
    });

    it('should handle errors when deleting movie by ID', async () => {
        const movieId = 1;

        jest.spyOn(client, 'query').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).delete(`/api/movies/${movieId}`);

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
    });
});
