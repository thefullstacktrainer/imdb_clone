const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 4000;

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

// Connect to PostgreSQL database
client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(error => console.error('Error connecting to PostgreSQL:', error));

// API endpoint to store movie details
app.post('/api/movies', async (req, res) => {
    try {
        const { title, description, release_date, genre, poster_url } = req.body;

        // Insert movie details into the movies table
        const query = `
      INSERT INTO movies (title, description, release_date, genre, poster_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [title, description, release_date, genre, poster_url];
        const result = await client.query(query, values);

        // Return the inserted movie details as the response
        const insertedMovie = result.rows[0];
        res.status(201).json({ success: true, movie: insertedMovie });
    } catch (error) {
        console.error('Error storing movie details:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET endpoint to fetch all movies
app.get('/api/movies', async (req, res) => {
    try {
        // Query to fetch all movies from the movies table
        const query = 'SELECT * FROM movies';
        const result = await client.query(query);

        // Return the list of movies as the response
        const movies = result.rows;
        res.status(200).json({ success: true, movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


// GET endpoint to fetch a movie by ID
app.get('/api/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        // Query to fetch a movie by its ID
        const query = 'SELECT * FROM movies WHERE id = $1';
        const result = await client.query(query, [movieId]);

        // Check if the movie with the specified ID exists
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        // Return the movie details as the response
        const movie = result.rows[0];
        res.status(200).json({ success: true, movie });
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
