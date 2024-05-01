const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getClient } = require('./mockDb'); // Import the mocked database functions
const router = require('../src/movies');

const app = express();
app.use(bodyParser.json());
app.use('/api/movies', router);

// Mock the database module
jest.mock('../src/db', () => {
    const { getClient, connect } = require('./mockDb');
    return { getClient, connect };
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
