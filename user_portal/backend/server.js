const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4001;

// PostgreSQL connection configuration
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432, // Default PostgreSQL port
    ssl: {
        rejectUnauthorized: false, // Set to false if using self-signed certificates
        // You may need to provide other SSL options such as ca, cert, and key
        // Example:
        // ca: fs.readFileSync('path/to/ca-certificate.crt'),
        // cert: fs.readFileSync('path/to/client-certificate.crt'),
        // key: fs.readFileSync('path/to/client-certificate.key')
    },
});

// Middleware for parsing JSON bodies
app.use(bodyParser.json());
app.use(cors());

// Connect to PostgreSQL database
client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(error => console.error('Error connecting to PostgreSQL:', error));

// GET endpoint to fetch all movies with average rating
app.get('/api/public/movies', async (req, res) => {
    try {
        // Query to fetch all movies with their average ratings
        const query = `
            SELECT m.*, COALESCE(CAST(AVG(r.rating) AS NUMERIC(10, 2)), 0) AS rating
            FROM movies m
            LEFT JOIN movie_ratings r ON m.id = r.movie_id
            GROUP BY m.id
        `;
        const result = await client.query(query);

        // Return the list of movies with average ratings as the response
        const movies = result.rows;
        res.status(200).json({ success: true, movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST endpoint to add a rating to a movie
app.post('/api/movies/:movieId/rating', async (req, res) => {
    try {
        const { movieId } = req.params;
        const { rating, userId } = req.body; // Assuming userId is included in the request body

        // Check if the rating is a valid number
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Invalid rating. Rating must be an integer between 1 and 5.' });
        }

        // Insert the rating into the movie_ratings table
        const query = 'INSERT INTO movie_ratings (movie_id, user_id, rating) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [movieId, userId, rating]);

        const newRating = result.rows[0];
        res.status(201).json({ success: true, rating: newRating });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
