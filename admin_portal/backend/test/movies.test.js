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
}
// Mock the database module
jest.mock('../src/db', () => {
    const { connect } = require('./mockDb');

    return {
        getClient: getClient2, connect
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

        const response = await request(app)
            .post('/api/movies')
            .send(newMovie);

        // Assert that the response status code is 201 (Created)
        expect(response.statusCode).toBe(201);
        // Assert that the response body contains the inserted movie details
        expect(response.body.success).toBe(true);
        expect(response.body.movie.title).toBe(newMovie.title);
        expect(response.body.movie.description).toBe(newMovie.description);
        expect(response.body.movie.genre).toBe(newMovie.genre);
        expect(response.body.movie.poster_url).toBe(newMovie.poster_url);
    });
});

describe('GET /api/movies', () => {
    // Get the mocked client object


    it('should fetch all movies', async () => {
        const mockMovies = [
            { id: 1, title: 'Movie 1', description: 'Description 1', release_date: '2023-01-01', genre: 'Action', poster_url: 'https://example.com/movie1.jpg' },
            { id: 2, title: 'Movie 2', description: 'Description 2', release_date: '2024-01-01', genre: 'Comedy', poster_url: 'https://example.com/movie2.jpg' }
        ];

        // Mock the query method of the client object to return mock movies
        jest.spyOn(client, 'query').mockResolvedValueOnce({ rows: mockMovies });
        const response = await request(app).get('/api/movies');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.movies).toEqual(mockMovies);
    });

    it('should handle errors when fetching movies', async () => {
        // Mock the query method of the client object to throw an error
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
