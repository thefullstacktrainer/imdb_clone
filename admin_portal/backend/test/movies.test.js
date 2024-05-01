const request = require('supertest');
const app = require('../server'); // Import the app

describe('POST /api/movies', () => {
    it('should create a new movie', async () => {
        const newMovie = {
            title: 'Test Movie',
            description: 'This is a test movie',
            release_date: '2024-05-01T00:00:00.000Z',
            genre: 'Test Genre',
            poster_url: 'https://example.com/test-movie-poster.jpg',
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
